import { FreshContext } from "$fresh/server.ts";
import { decodeBase64 } from "@std/encoding";
import { envStore } from "../../utils/env_store.ts";
import {
  DDNSUpdateErrors,
  updateOrCreateDnsRecord,
} from "./(_cloudflare)/cf_api_client.ts";
import { logAuthorizedDDNSUpdateRequest } from "../../utils/kv.ts";

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
export const handler = async (
  req: Request,
  ctx: FreshContext,
): Promise<Response> => {
  console.debug("Request received", {
    credentials: req.credentials,
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers),
    body: await req.text(),
  });

  // Step 1 - validate authorization
  const authHeader = req.headers.get("authorization");
  const [authType, authString] = authHeader?.split(" ") ?? [];
  if (authType !== "Basic") {
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
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  // Step 2 - validate user agent
  const userAgent = req.headers.get("user-agent");
  if (userAgent !== "Synology DDNS Updater/72806 support@synology.com") {
    return new Response("Forbidden", {
      status: 403,
    });
  }

  // Step 3 - get the target host
  const forHost = new URL(req.url).searchParams.get("forHost");
  if (!forHost) {
    return new Response("Bad Request - missing forHost parameter", {
      status: 400,
    });
  }

  // Step 4 - get the IP from the request
  const ip = new URL(req.url).searchParams.get("ip");
  if (!ip) {
    return new Response("Bad Request - missing ip parameter", {
      status: 400,
    });
  }

  // Log the authorized request
  await logAuthorizedDDNSUpdateRequest({
    url: req.url,
    authorized_user: username,
    forHost,
    forIp: ip,
    sourceIp: ctx.remoteAddr.hostname,
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

  // Last Step - change IP Records on Cloudflare
  // https://developers.cloudflare.com/dns/manage-dns-records/how-to/managing-dynamic-ip-addresses/

  let allUpdatesOk = true;
  for (const record of recordsToUpdate) {
    const result = await updateOrCreateDnsRecord({
      zoneId: envStore.CLOUDFLARE_ZONE_ID_HIBISK_DE,
      recordName: record,
      newIP: ip,
    });

    result.match(
      (message) => console.info(message),
      (e) => {
        allUpdatesOk = false;
        switch (e.type) {
          case DDNSUpdateErrors.RecordCreationFailed:
            console.error(
              `Failed to create DNS record ${forHost} - ${e.innerError}`,
            );
            break;
          case DDNSUpdateErrors.UncatchedCfApiError:
            console.error(
              `Failed to update DNS record ${forHost} - ${e.innerError}`,
            );
            break;
          default:
            console.error(`Failed to update DNS record ${forHost} - ${e}`);
        }
      },
    );
  }

  if (allUpdatesOk) {
    return new Response("OK", {
      status: 200,
    });
  } else {
    return new Response("Internal Server Error", {
      status: 500,
    });
  }
};
