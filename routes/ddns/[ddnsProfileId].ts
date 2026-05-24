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
import pMap from "p-map";
import { err, ok, Result } from "neverthrow";
import type { cfClient } from "@/types/restClients.ts";

type UpdateOneRecordResult = Result<void, {
  type: UpdateOneRecordErrorType;
  innerError?: Error;
}>;
type UpdateOneRecordError = {
  type: UpdateOneRecordErrorType;
  innerError?: Error;
};
enum UpdateOneRecordErrorType {
  FailedToListDNSRecords = "FailedToListDNSRecords",
  FailedToUpdateRecord = "FailedToUpdateRecord",
  FailedToCreateRecord = "FailedToCreateRecord",
}

const IP_RECORD_TYPE = {
  ipv4: "A",
  ipv6: "AAAA",
} as const;

// todo, move to seperate file other clients may join which requires ajusting the function
async function updateOneRecord({
  zoneId,
  recordName,
  newIP,
  type,
  cfClient,
}: {
  zoneId: string;
  recordName: string;
  newIP: string;
  type: keyof typeof IP_RECORD_TYPE;
  cfClient: cfClient;
}): Promise<
  Result<void, UpdateOneRecordError>
> {
  try {
    // Find existing record
    const listResponse = await cfClient.zones.zone_id.dns_records.list({
      params: { zone_id: zoneId },
      query: {
        type: IP_RECORD_TYPE[type],
        name: { exact: recordName },
      },
    });

    if (listResponse.status !== 200) {
      return err({
        type: UpdateOneRecordErrorType.FailedToListDNSRecords,
        innerError: new Error(
          `Failed to list DNS records: ${listResponse.status}`,
          {
            cause: listResponse.body,
          },
        ),
      });
    }

    const existingRecords = listResponse.body.result ?? [];

    // Record is already up to date
    if (existingRecords.length > 0 && existingRecords[0].content === newIP) {
      console.log(
        `Record ${recordName} already up to date with ip${type}: ${newIP}`,
      );
      return ok();
    }

    if (existingRecords.length > 0 && existingRecords[0].content !== newIP) {
      // Update existing record
      const recordId = existingRecords[0].id;
      const updateResponse = await cfClient.zones.zone_id.dns_records.update({
        params: { zone_id: zoneId, record_id: recordId },
        body: {
          name: recordName,
          ttl: 120,
          type: IP_RECORD_TYPE[type],
          content: newIP,
        },
      });

      if (updateResponse.status === 200) {
        console.log(
          `Record ${recordName} updated successfully to ip${type}: ${newIP}`,
        );
      } else {
        return err({
          type: UpdateOneRecordErrorType.FailedToUpdateRecord,
          innerError: new Error(
            `Failed to update record: ${updateResponse.status}`,
            {
              cause: updateResponse.body,
            },
          ),
        });
      }
    } else {
      // Create new record
      const createResponse = await cfClient.zones.zone_id.dns_records.create({
        params: { zone_id: zoneId },
        body: {
          name: recordName,
          ttl: 120,
          type: IP_RECORD_TYPE[type],
          content: newIP,
        },
      });

      if (createResponse.status === 200) {
        console.log(
          `Record ${recordName} created successfully with ip${type}: ${newIP}`,
        );
      } else {
        return err({
          type: UpdateOneRecordErrorType.FailedToCreateRecord,
          innerError: new Error(
            `Failed to create record: ${createResponse.status}`,
            {
              cause: createResponse.body,
            },
          ),
        });
      }
    }
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : String(e);

    console.error(
      `Failed to update/create DNS record ${recordName}: ${errorMsg}`,
    );
    // These events are not shown in deno deploy ui at the moment
    // span.addEvent(
    //   `Failed to update/create DNS record ${recordName}: ${errorMsg}`,
    // );
    return err({
      type: UpdateOneRecordErrorType.FailedToUpdateRecord,
      innerError: new Error(errorMsg),
    });
  }
  return ok();
}

async function updateDnsViaProfile(
  req: Request,
  ctx: CoreSvcFreshContext,
  span: Span,
): Promise<Response> {
  console.log("Request received", {
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
    ipv4Enabled: DDNSProfilesTable.ipv4Enabled,
    ipv6Enabled: DDNSProfilesTable.ipv6Enabled,
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
  const requestUrlParams = new URL(req.url).searchParams;
  const ip = {
    ipv4: requestUrlParams.get("ip") ?? requestUrlParams.get("ipv4"),
    ipv6: requestUrlParams.get("ipv6"),
  };

  if (profile.ipv4Enabled) {
    span.setAttribute("ddnsIpV4", ip.ipv4 ?? "missing");
  }

  if (profile.ipv6Enabled) {
    span.setAttribute("ddnsIpV6", ip.ipv6 ?? "missing");
  }

  const sourceIp = (ctx.info.remoteAddr as Deno.NetAddr).hostname;
  span.setAttribute("sourceIp", sourceIp);

  if (ip.ipv4 == null && profile.ipv4Enabled) {
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: "Bad Request - missing ipv4 parameter",
    });
    span.end();
    return new Response("Bad Request - missing ipv4 parameter", {
      status: 400,
    });
  }
    
  if (ip.ipv6 == null && profile.ipv6Enabled) {
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: "Bad Request - missing ipv6 parameter",
    });
    span.end();
    return new Response("Bad Request - missing ipv6 parameter", {
      status: 400,
    });
  }



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
  const outerCfClient = initClient(apiCloudflareCom, {
    baseUrl: "https://api.cloudflare.com/client/v4",
    baseHeaders: {
      authorization: `Bearer ${profile.apiKey}`,
    },
  });

  // Helper to run updates for a given IP type. Captures the checked IP value
  // into a local constant so TypeScript knows it's non-null inside callbacks.
  async function runUpdatesForType({
    enabled,
    ipValue,
    type,
    concurrency = 8,
  }: {
    enabled: boolean | null | undefined;
    ipValue: string | null | undefined;
    type: keyof typeof IP_RECORD_TYPE;
    concurrency?: number;
  }): Promise<Array<UpdateOneRecordResult>> {
    if (!enabled || ipValue == null) return [];
    const newIP = ipValue;
    return await pMap(dnsRecords, (record) => {
      return updateOneRecord({
        zoneId: record.zone_id,
        recordName: record.record_name,
        newIP,
        type,
        cfClient: outerCfClient,
      });
    }, {
      concurrency,
    });
  }

  const updateResultsIPv4 = await runUpdatesForType({
    enabled: profile.ipv4Enabled,
    ipValue: ip.ipv4,
    type: "ipv4",
    concurrency: 8,
  });

  const updateResultsIPv6 = await runUpdatesForType({
    enabled: profile.ipv6Enabled,
    ipValue: ip.ipv6,
    type: "ipv6",
    concurrency: 8,
  });
  // Updates have been successful

  const updateResults = [...updateResultsIPv4, ...updateResultsIPv6];
  if (updateResults.some((result) => result.isErr())) {
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: "Some record updates failed",
    });

    // log all errors
    updateResults
      .filter((result) => result.isErr())
      .forEach((result) => {
        console.error(result.error);
      });

    span.end();
    return new Response("Internal Server Error", {
      status: 500,
    });
  }

  // Step 6 - Update lastUsedAt timestamp
  await db.update(DDNSProfilesTable)
    .set({
      lastUsedAt: new Date().toISOString(),
    })
    .where(eq(DDNSProfilesTable.id, profileId));

  span.setStatus({
    code: SpanStatusCode.OK,
    message: "All updates successful",
  });
  span.end();
  return new Response("OK", {
    status: 200,
  });
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
