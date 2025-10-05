import { define } from "@/lib/fresh/defineHelpers.ts";
import { db } from "@/lib/db/index.ts";
import { ConnectedServicesTable } from "@/lib/db/schemas/connected_services.table.ts";
import { and, eq } from "drizzle-orm";
import { MessageBlock } from "@/components/subassemblies/MessageBlock.tsx";

export default define.page(async (ctx) => {
  const authResult = await ctx.state.authPromise;
  if (authResult.type === "response") {
    return authResult.response;
  }
  const { user: currentUser } = authResult;

  const connectedServiceResponse = await db.select().from(
    ConnectedServicesTable,
  ).where(
    and(
      eq(ConnectedServicesTable.owned_by, currentUser.id),
      eq(ConnectedServicesTable.id, ctx.params.id),
    ),
  );

  if (connectedServiceResponse.length === 0) {
    return (
      <MessageBlock
        title="Delete Connected Service"
        backUrl="/connected-services"
      >
        <p>
          Connected service with id {ctx.params.id} not found
        </p>
      </MessageBlock>
    );
  }

  const connectedService = connectedServiceResponse[0];

  // Perform the deletion
  await db.delete(ConnectedServicesTable).where(
    and(
      eq(ConnectedServicesTable.owned_by, currentUser.id),
      eq(ConnectedServicesTable.id, ctx.params.id),
    ),
  );

  return (
    <MessageBlock
      title="Delete Connected Service"
      backUrl="/connected-services"
    >
      <p>
        Connected service{" "}
        <span class="font-bold">{connectedService.service_label}</span> (ID:
        {" "}
        {ctx.params.id}, Type:{" "}
        <span class="font-bold">{connectedService.service_type}</span>) has been
        successfully deleted.
      </p>
    </MessageBlock>
  );
});
