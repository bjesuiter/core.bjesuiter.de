import { envStore } from "@/utils/env_store.ts";
import { Span, SpanStatusCode } from "@opentelemetry/api";
import { decodeBase64 } from "@std/encoding";
import { define } from "@/lib/fresh/defineHelpers.ts";
import { appTracer } from "@/lib/opentelemetry/app-tracer.ts";
import { CoresvcFreshContext } from "@/types/coresvc_fresh_context.type.ts";
import { logAuthorizedDDNSUpdateRequest } from "@/utils/kv.ts";
import {
  DDNSUpdateErrors,
  updateOrCreateDnsRecord,
} from "@/lib/cloudflare/cf_api_client.ts";

async function updateCloudflare(
  req: Request,
  ctx: CoresvcFreshContext,
  span: Span,
): Promise<Response> {
  span.addEvent("Request received", {
    method: req.method,
    url: req.url,
    // CAUTION: DO not log the "authorization" header! - not logging headers at all for now
    // headers: Object.fromEntries(
    //   req.headers,
    // ),
    body: await req.text(),
  });

  // Step 1 - validate authorization
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
    username !== envStore.CORE_DDNS_USERNAME ||
    password !== envStore.CORE_DDNS_PASSWORD
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

  // Step 2 - validate user agent
  const userAgent = req.headers.get("user-agent");
  if (userAgent !== "Synology DDNS Updater/72806 support@synology.com") {
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: `Forbidden - User agent '${userAgent}' is not allowed`,
    });
    span.end();
    return new Response("Forbidden", {
      status: 403,
    });
  }

  // Step 3 - get the target host
  const forHost = new URL(req.url).searchParams.get("forHost");
  if (!forHost) {
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: "Bad Request - missing forHost parameter",
    });
    span.end();
    return new Response("Bad Request - missing forHost parameter", {
      status: 400,
    });
  }
  span.updateName(`update ddns on cloudflare for host '${forHost}'`);
  span.setAttribute("forHost", forHost);

  // Step 4 - get the IP from the request
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
  // TODO: remove when tracing works correctly!
  await logAuthorizedDDNSUpdateRequest({
    url: req.url,
    authorized_user: username,
    forHost,
    forIp: ip,
    sourceIp,
  });

  // Assemble records to update
  const recordsToUpdate = [
    `${forHost}`,
  ];
  if (forHost === "synas.hibisk.de") {
    recordsToUpdate.push(
      "homeserv1.hibisk.de",
      "immich.hibisk.de",
      "dsm.hibisk.de",
      "jdownloader.hibisk.de",
      "jellyfin.hibisk.de",
      "plex.hibisk.de",
    );
  }
  span.setAttribute("recordsToUpdate", recordsToUpdate);

  // Last Step - change IP Records on Cloudflare
  // https://developers.cloudflare.com/dns/manage-dns-records/how-to/managing-dynamic-ip-addresses/

  let allUpdatesOk = true;
  for (const record of recordsToUpdate) {
    // TODO: make a sub-span for this update-or-create fn!
    const result = await updateOrCreateDnsRecord({
      zoneId: envStore.CLOUDFLARE_ZONE_ID_HIBISK_DE,
      recordName: record,
      newIP: ip,
    });

    result.match(
      (message) => {
        // console.info(message);
        span.addEvent(message);
      },
      (e) => {
        allUpdatesOk = false;
        switch (e.type) {
          case DDNSUpdateErrors.RecordCreationFailed:
            span.addEvent(
              `Failed to create DNS record ${forHost} - ${e.innerError}`,
            );
            break;
          case DDNSUpdateErrors.UncatchedCfApiError:
            span.addEvent(
              `Failed to update DNS record ${forHost} - ${e.innerError}`,
            );
            break;
          default:
            span.addEvent(`Failed to update DNS record ${forHost} - ${e}`);
        }
      },
    );
  }

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
 * https://core.bjesuiter.de/ddns/updateCloudflare
 *     ?ip=__MYIP__
 *     &forHost=__HOSTNAME__
 *
 * Auth:
 * authorization: Basic base64(username:password)
 *
 * User Agent:
 * user-agent: Synology DDNS Updater/72806 support@synology.com
 */

export const handler = define.handlers((ctx) => {
  return appTracer.startActiveSpan(
    "update ddns on cloudflare",
    async (span) => {
      return await updateCloudflare(ctx.req, ctx, span);
    },
  );
});
