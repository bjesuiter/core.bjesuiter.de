import { define } from "@/lib/fresh/defineHelpers.ts";
import { db } from "@/lib/db/index.ts";
import { ConnectedServicesTable } from "@/lib/db/schemas/connected_services.table.ts";
import { eq } from "drizzle-orm";
import { validateCfToken } from "../(service-types)/validateCfToken.ts";
import { RouteConfig } from "fresh";
import { Partial } from "fresh/runtime";

// We only want to render the content, so disable
// the `_app.tsx` template as well as any potentially
// inherited layouts
export const config: RouteConfig = {
  skipAppWrapper: true,
  skipInheritedLayouts: true,
};

export default define.page(async (ctx) => {
  const connectedServiceResponse = await db.select().from(
    ConnectedServicesTable,
  ).where(
    eq(ConnectedServicesTable.id, ctx.params.id),
  );

  if (connectedServiceResponse.length === 0) {
    return <p>Connected service with id {ctx.params.id} not found</p>;
  }

  const connectedService = connectedServiceResponse[0];

  switch (connectedService.service_type) {
    case "cloudflare": {
      const cfResult = await validateCfToken(
        connectedService.api_key,
      );
      if (!cfResult) {
        return (
          <Partial name="messages">
            <p class="rounded-md bg-white p-4 border border-gray-300">
              Token stored for ID {ctx.params.id} is invalid
            </p>
          </Partial>
        );
      }
      return (
        <Partial name="messages">
          <p class="rounded-md bg-white p-4 border border-gray-300">
            Token stored for ID {ctx.params.id} is valid
          </p>
        </Partial>
      );
    }
    default:
      return (
        <Partial name="messages">
          <p class="rounded-md bg-white p-4 border border-gray-300">
            Connected service with id {ctx.params.id} has unknown service type
            {" "}
            {connectedService.service_type} and can therefore not be revalidated
          </p>
        </Partial>
      );
  }
});
