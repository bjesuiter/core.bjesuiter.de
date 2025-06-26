import { defineRoute } from "$fresh/server.ts";
import { env } from "../../utils/env.ts";
import { findDnsRecordId } from "./(_cloudflare)/cf_api_client.ts";

export default defineRoute(async (req, ctx) => {
  const recordId = await findDnsRecordId({
    zoneId: env.CLOUDFLARE_ZONE_ID_HIBISK_DE,
    recordName: "test.hibisk.de",
  });

  if (recordId.isErr()) {
    console.error(recordId.error);
    throw recordId.error.innerError;
  }

  console.log(`Playground: Record ID: ${recordId.value}`);
  return new Response(JSON.stringify(recordId.value, null, 2));
});
