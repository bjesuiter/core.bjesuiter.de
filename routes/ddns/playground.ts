import { defineRoute } from "$fresh/server.ts";
import { env } from "../../utils/env.ts";
import { findDnsRecordId } from "./(_cloudflare)/cf_api_client.ts";

export default defineRoute(async (req, ctx) => {
  const recordId = await findDnsRecordId({
    zoneId: env.CLOUDFLARE_ZONE_ID_HIBISK_DE,
    recordName: "test.hibisk.de",
  });

  return new Response(JSON.stringify(recordId));
});
