import { defineRoute } from "fresh/compat";

export default defineRoute(async (ctx) => {
  const req = ctx.req;

  // const recordId = await findDnsRecordId({
  //   zoneId: envStore.CLOUDFLARE_ZONE_ID_HIBISK_DE,
  //   recordName: "synas.hibisk.de",
  // });

  // console.info(`Playground: Find record id for "synas.hibisk.de"`);

  // if (recordId.isErr()) {
  //   console.error(recordId.error);
  //   return new Response("ERROR LOGGED", {
  //     status: 500,
  //   });
  // }

  // console.log(`Playground: Record ID:`, recordId.value);
  // return new Response("INFO LOGGED", {
  //   status: 200,
  // });
  return new Response("No code right now", {
    status: 501,
  });
});
