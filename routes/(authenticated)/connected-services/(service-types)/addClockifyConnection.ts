import { db } from "@/lib/db/index.ts";
import {
  DbExecutionErrors,
  dbSafeExecute,
} from "@/lib/db/neverthrow/helpers.ts";
import { ConnectedServicesTable } from "@/lib/db/schemas/connected_services.table.ts";
import { validateClockifyApiKey } from "./validateClockifyApiKey.ts";

/**
 * Adds a Clockify connection for a user
 *
 * Validates the API token by fetching the user's profile from Clockify API
 * and stores the connection in the database if valid.
 *
 * @param api_key - The Clockify API key to add
 * @param owned_by - The user adding the connection (ctx.state.user.id)
 * @param label - A custom label for this connection
 * @returns A response to be passed to the client, or a data object on success
 */
export async function addClockifyConnection(
  api_key: string,
  owned_by: string,
  label: string,
) {
  if (!api_key) {
    return new Response("API Key is required", { status: 400 });
  }

  // Validate the token by fetching user profile from Clockify
  const clockifyResult = await validateClockifyApiKey(api_key);
  if (!clockifyResult) {
    return new Response(
      "Invalid Clockify API key - token validation failed",
      { status: 400 },
    );
  }

  // Store API key in database
  const newConnectedService = {
    id: crypto.randomUUID(),
    service_type: "clockify",
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
        service_type: "clockify",
        service_label: label,
      },
    }),
    (error) => {
      switch (error.type) {
        case DbExecutionErrors.UnknownError:
          return new Response("An unknown error occurred", {
            status: 400,
          });
        case DbExecutionErrors.ErrorWithMessage:
          console.error(error.innerError);
          return new Response(error.innerError.message, { status: 400 });
      }
    },
  );

  return response;
}
