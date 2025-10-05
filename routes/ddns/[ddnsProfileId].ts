import { db } from "@/lib/db/index.ts";
import { ConnectedServicesTable } from "@/lib/db/schemas/connected_services.table.ts";
import { DDNSProfilesTable } from "@/lib/db/schemas/ddns_profiles.table.ts";
import { CoreSvcFreshContext, define } from "@/lib/fresh/defineHelpers.ts";
import { appTracer } from "@/lib/opentelemetry/app-tracer.ts";
import { apiCloudflareCom } from "@contracts/api.cloudflare.com/api.cloudflare.com.ts";
import { Span, SpanStatusCode } from "@opentelemetry/api";
import { decodeBase64 } from "@std/encoding";
import { initClient } from "@ts-rest/core";
import { eq } from "drizzle-orm";

async function updateDnsViaProfile(
  req: Request,
  ctx: CoreSvcFreshContext,
  span: Span,
): Promise<Response> {
  span.addEvent("Request received", {
    method: req.method,
    url: req.url,
  });

  const profileId = ctx.params.ddnsProfileId;
  span.setAttribute("profileId", profileId);

  // Step 1 - Load DDNS profile from database
  const profileResult = await db.select({
    id: DDNSProfilesTable.id,
    profileName: DDNSProfilesTable.profileName,
    dnsRecords: DDNSProfilesTable.dnsRecords,
    ddnsUsername: DDNSProfilesTable.ddnsUsername,
    ddnsPassword: DDNSProfilesTable.ddnsPassword,
    allowedUserAgent: DDNSProfilesTable.allowedUserAgent,
    connectedServiceId: DDNSProfilesTable.connectedServiceId,
    apiKey: ConnectedServicesTable.api_key,
  })
    .from(DDNSProfilesTable)
    .leftJoin(
      ConnectedServicesTable,
      eq(DDNSProfilesTable.connectedServiceId, ConnectedServicesTable.id),
    )
    .where(eq(DDNSProfilesTable.id, profileId))
    .limit(1);

  if (profileResult.length === 0) {
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: `DDNS profile '${profileId}' not found`,
    });
    span.end();
    return new Response("Not found", {
      status: 404,
    });
  }

  const profile = profileResult[0];
  span.setAttribute("profileName", profile.profileName);

  // Step 2 - Validate authorization
  const authHeader = req.headers.get("authorization");
  const [authType, authString] = authHeader?.split(" ") ?? [];
  if (authType !== "Basic") {
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: "Unauthorized - Authorization header type is not 'Basic' Auth",
    });
    span.end();
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  const decodedAuthString = new TextDecoder().decode(
    decodeBase64(authString ?? ""),
  );
  const [username, password] = decodedAuthString.split(":");
  if (
    username !== profile.ddnsUsername ||
    password !== profile.ddnsPassword
  ) {
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: "Unauthorized - Invalid username or password",
    });
    span.end();
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  // Step 3 - Validate user agent (if configured)
  if (profile.allowedUserAgent) {
    const userAgent = req.headers.get("user-agent");
    if (userAgent !== profile.allowedUserAgent) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: `Forbidden - User agent '${userAgent}' is not allowed`,
      });
      span.end();
      return new Response("Forbidden", {
        status: 403,
      });
    }
  }

  // Step 4 - Get the IP from the request
  const ip = new URL(req.url).searchParams.get("ip");
  if (!ip) {
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: "Bad Request - missing ip parameter",
    });
    span.end();
    return new Response("Bad Request - missing ip parameter", {
      status: 400,
    });
  }
  span.setAttribute("targetIp", ip);

  const sourceIp = (ctx.info.remoteAddr as Deno.NetAddr).hostname;
  span.setAttribute("sourceIp", sourceIp);

  // Log the authorized request
  // await logAuthorizedDDNSUpdateRequest({
  //   url: req.url,
  //   authorized_user: username,
  //   forHost: profile.profileName,
  //   forIp: ip,
  //   sourceIp,
  // });

  // Step 5 - Update DNS records
  const dnsRecords = profile.dnsRecords as Array<
    { record_name: string; zone_id: string }
  >;
  span.setAttribute(
    "recordsToUpdate",
    dnsRecords.map((r) => r.record_name),
  );

  if (!profile.apiKey) {
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: "Connected service API key not found",
    });
    span.end();
    return new Response("Internal Server Error - Missing API key", {
      status: 500,
    });
  }

  // Create Cloudflare client instance for this profile
  const cfClient = initClient(apiCloudflareCom, {
    baseUrl: "https://api.cloudflare.com/client/v4",
    baseHeaders: {
      authorization: `Bearer ${profile.apiKey}`,
    },
  });

  let allUpdatesOk = true;
  for (const record of dnsRecords) {
    try {
      // Find existing record
      const listResponse = await cfClient.zones.zone_id.dns_records.list({
        params: { zone_id: record.zone_id },
        query: {
          type: "A",
          name: { exact: record.record_name },
        },
      });

      if (listResponse.status !== 200) {
        throw new Error(
          `Failed to list DNS records: ${listResponse.status}`,
        );
      }

      const existingRecords = listResponse.body.result ?? [];

      if (existingRecords.length > 0) {
        // Update existing record
        const recordId = existingRecords[0].id;
        const updateResponse = await cfClient.zones.zone_id.dns_records.update({
          params: { zone_id: record.zone_id, record_id: recordId },
          body: {
            name: record.record_name,
            ttl: 120,
            type: "A",
            content: ip,
          },
        });

        if (updateResponse.status === 200) {
          span.addEvent(
            `Record ${record.record_name} updated successfully to IPv4: ${ip}`,
          );
        } else {
          throw new Error(
            `Failed to update record: ${updateResponse.status}`,
          );
        }
      } else {
        // Create new record
        const createResponse = await cfClient.zones.zone_id.dns_records.create({
          params: { zone_id: record.zone_id },
          body: {
            name: record.record_name,
            ttl: 120,
            type: "A",
            content: ip,
          },
        });

        if (createResponse.status === 200) {
          span.addEvent(
            `Record ${record.record_name} created successfully with IPv4: ${ip}`,
          );
        } else {
          throw new Error(
            `Failed to create record: ${createResponse.status}`,
          );
        }
      }
    } catch (e) {
      allUpdatesOk = false;
      const errorMsg = e instanceof Error ? e.message : String(e);

      console.error(
        `Failed to update/create DNS record ${record.record_name}: ${errorMsg}`,
      );
      span.addEvent(
        `Failed to update/create DNS record ${record.record_name}: ${errorMsg}`,
      );
    }
  }

  // Step 6 - Update lastUsedAt timestamp
  await db.update(DDNSProfilesTable)
    .set({
      lastUsedAt: new Date().toISOString(),
    })
    .where(eq(DDNSProfilesTable.id, profileId));

  if (allUpdatesOk) {
    span.setStatus({
      code: SpanStatusCode.OK,
      message: "All updates successful",
    });
    span.end();
    return new Response("OK", {
      status: 200,
    });
  } else {
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: "Some record updates failed",
    });
    span.end();
    return new Response("Internal Server Error", {
      status: 500,
    });
  }
}

/**
 * Request URL Example:
 * POST https://core.bjesuiter.de/ddns/2c4d5b14-a365-4fa4-a174-ae4c618a8c28?ip=YOUR_IP
 *
 * Auth:
 * authorization: Basic base64(username:password)
 *
 * User Agent (optional, depending on profile configuration):
 * user-agent: Synology DDNS Updater/72806 support@synology.com
 */

export const handler = define.handlers((ctx) => {
  return appTracer.startActiveSpan(
    `update ddns via profile '${ctx.params.ddnsProfileId}'`,
    async (span) => {
      return await updateDnsViaProfile(ctx.req, ctx, span);
    },
  );
});
