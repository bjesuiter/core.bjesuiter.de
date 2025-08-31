import { validateCloudflareApiKey } from "@/lib/cloudflare/cf_api_client.ts";
import { db } from "@/lib/db/index.ts";
import { dbSafeExecute, InsertErrors } from "@/lib/db/neverthrow/helpers.ts";
import { ConnectedServicesTable } from "@/lib/db/schemas/connected_services.table.ts";

/**
 * @param api_key the cloudflare api key to add
 * @param owned_by the user adding the connection, aka ctx.state.user.id
 * @returns a response to be passed to the client
 */
export async function addCloudflareConnection(
  api_key: string,
  owned_by: string,
  label: string,
) {
  if (!api_key) {
    return new Response("API Key is required", { status: 400 });
  }

  const cfResult = await validateCloudflareApiKey(api_key);
  if (cfResult.isErr()) {
    return new Response(cfResult.error.type, { status: 400 });
  }

  // Step 2 - store api key in db
  const newConnectedService = {
    id: crypto.randomUUID(),
    service_type: "cloudflare",
    service_label: label,
    api_key: api_key,
    owned_by,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const dbResult = await dbSafeExecute(
    db.insert(ConnectedServicesTable).values(newConnectedService)
      .execute(),
  );

  const response = dbResult.match(
    () => ({
      data: {
        status: "service_added",
        service_type: "cloudflare",
        service_label: label,
      },
    }),
    (error) => {
      switch (error.type) {
        case InsertErrors.UnknownError:
          return new Response("An unknown error occurred", {
            status: 400,
          });
        case InsertErrors.ErrorWithMessage:
          console.error(error.innerError);
          return new Response(error.innerError.message, { status: 400 });
      }
    },
  );

  return response;
}
