import { define } from "@/lib/fresh/defineHelpers.ts";
import { db } from "@/lib/db/index.ts";
import { ConnectedServicesTable } from "@/lib/db/schemas/connected_services.table.ts";
import { eq } from "drizzle-orm";
import { validateCfToken } from "../(service-types)/validateCfToken.ts";
import { MessageBlock } from "@/components/subassemblies/MessageBlock.tsx";

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
          <MessageBlock
            title="Revalidate Connected Service"
            backUrl="/connected-services"
          >
            <p>
              Token of type{" "}
              <span class="font-bold">{connectedService.service_type}</span>
              {" "}
              stored for ID {ctx.params.id} is invalid
            </p>
          </MessageBlock>
        );
      }
      return (
        <MessageBlock
          title="Revalidate Connected Service"
          backUrl="/connected-services"
        >
          <p>
            Token of type{" "}
            <span class="font-bold">{connectedService.service_type}</span>{" "}
            stored for ID {ctx.params.id}{" "}
            <span class="font-bold">is valid</span>
          </p>
        </MessageBlock>
      );
    }
    default:
      return (
        <MessageBlock
          title="Revalidate Connected Service"
          backUrl="/connected-services"
        >
          <p>
            Connected service with id {ctx.params.id} has unknown service type
            {" "}
            {connectedService.service_type} and can therefore not be revalidated
          </p>
        </MessageBlock>
      );
  }
});
