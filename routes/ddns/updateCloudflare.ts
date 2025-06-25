import { FreshContext } from "$fresh/server.ts";
import { decodeBase64 } from "@std/encoding";

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
  _req: Request,
  _ctx: FreshContext,
): Promise<Response> => {
  console.debug("Request received", {
    credentials: _req.credentials,
    method: _req.method,
    url: _req.url,
    headers: Object.fromEntries(_req.headers),
    body: await _req.text(),
  });

  // Step 1 - validate authorization
  const authHeader = _req.headers.get("authorization");
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
  console.debug("Auth", {
    username,
    password,
  });
  //   if (username !== "ddns" || password !== "ddns") {
  //     return new Response("Unauthorized", {
  //       status: 401,
  //     });
  //   }

  // Step 2 - validate user agent
  const userAgent = _req.headers.get("user-agent");
  if (userAgent !== "Synology DDNS Updater/72806 support@synology.com") {
    return new Response("Forbidden", {
      status: 403,
    });
  }

  return new Response("", {
    status: 200,
  });
};
