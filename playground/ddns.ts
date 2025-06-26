import "cloudflare/shims/web";
import Cloudflare from "cloudflare";

const cfApiToken = Deno.env.get("CLOUDFLARE_DDNS_API_TOKEN");
const cfZoneId = Deno.env.get("CLOUDFLARE_ZONE_ID_HIBISK_DE");

if (!cfZoneId) {
  throw new Error("CLOUDFLARE_ZONE_ID_HIBISK_DE is not set");
}

const cfApiClient = new Cloudflare({
  apiToken: cfApiToken,
});

const result = await cfApiClient.dns.records.list({
  zone_id: cfZoneId,
  type: "A",
  name: {
    exact: "homeserv1.hibisk.de",
  },
});

console.log(result);
