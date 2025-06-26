import { defineRoute } from "$fresh/server.ts";
import { record } from "zod/v4";
import { env } from "../../utils/env.ts";
import { findDnsRecordId } from "./(_cloudflare)/cf_api_client.ts";

export default defineRoute(async (req, ctx) => {
  const recordId = await findDnsRecordId({
    zoneId: env.CLOUDFLARE_ZONE_ID_HIBISK_DE,
    recordName: "test.hibisk.de",
  });

  if (recordId.isErr()) {
    console.error(recordId.error);
    return new Response("ERROR LOGGED", {
      status: 500,
    });
  }

  console.log(`Playground: Record ID:`, recordId.value);
  return new Response("INFO LOGGED", {
    status: 200,
  });
});
