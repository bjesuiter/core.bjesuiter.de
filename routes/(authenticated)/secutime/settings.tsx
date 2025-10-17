import { define } from "@/lib/fresh/defineHelpers.ts";
import { envStore } from "@/utils/env_store.ts";
import { Toolbar } from "@/components/Toolbar.tsx";
import { NavButton } from "@/components/NavButton.tsx";
import { db } from "@/lib/db/index.ts";
import { ConnectedServicesTable } from "@/lib/db/schemas/connected_services.table.ts";
import { SecutimeReportsTable } from "@/lib/db/schemas/secutime_reports.table.ts";
import { and, eq } from "drizzle-orm";
import { MessageBlock } from "@/components/subassemblies/MessageBlock.tsx";
import { SettingsForm } from "./(_islands)/SettingsForm.tsx";

export default define.page(async (ctx) => {
  const authResult = await ctx.state.authPromise;

  if (authResult.type === "response") {
    return authResult.response;
  }

  const { user } = authResult;

  // Check if the user is the root user
  if (user.email !== envStore.CORE_ROOT_USER_EMAIL) {
    return new Response(
      "Forbidden: You do not have permission to access this page",
      {
        status: 403,
        headers: {
          "Content-Type": "text/plain",
        },
      },
    );
  }

  // HANDLE POST REQUEST
  if (ctx.req.method === "POST") {
    const formData = await ctx.req.formData();
    const connectedServiceId = formData.get("connected_service");
    const workspaceId = formData.get("workspace_id");

    if (!connectedServiceId || typeof connectedServiceId !== "string") {
      return (
        <MessageBlock title="Error" backUrl="/secutime/settings">
          <p class="text-red-600">Please select a Clockify account.</p>
        </MessageBlock>
      );
    }

    if (!workspaceId || typeof workspaceId !== "string") {
      return (
        <MessageBlock title="Error" backUrl="/secutime/settings">
          <p class="text-red-600">Please select a workspace.</p>
        </MessageBlock>
      );
    }

    // Verify the connected service exists and belongs to the user
    const connectedService = await db.select().from(ConnectedServicesTable)
      .where(
        and(
          eq(ConnectedServicesTable.id, connectedServiceId),
          eq(ConnectedServicesTable.owned_by, user.id),
          eq(ConnectedServicesTable.service_type, "clockify"),
        ),
      );

    if (connectedService.length === 0) {
      return (
        <MessageBlock title="Error" backUrl="/secutime/settings">
          <p class="text-red-600">Invalid Clockify account selected.</p>
        </MessageBlock>
      );
    }

    // Check if report already exists for this user
    const existingReport = await db.select().from(SecutimeReportsTable)
      .where(eq(SecutimeReportsTable.ownedBy, user.id));

    if (existingReport.length > 0) {
      // Update existing report
      await db.update(SecutimeReportsTable)
        .set({
          connectedServiceId: connectedServiceId,
          workspaceId: workspaceId,
        })
        .where(eq(SecutimeReportsTable.ownedBy, user.id));
    } else {
      // Create new report
      await db.insert(SecutimeReportsTable).values({
        id: crypto.randomUUID(),
        ownedBy: user.id,
        connectedServiceId: connectedServiceId,
        workspaceId: workspaceId,
      });
    }

    return (
      <MessageBlock title="Success" backUrl="/secutime/settings">
        <p class="text-green-600">
          Clockify account and workspace saved successfully!
        </p>
      </MessageBlock>
    );
  }

  // GET REQUEST - Show form
  // Fetch all clockify connected services for this user
  const clockifyServices = await db.select().from(ConnectedServicesTable)
    .where(
      and(
        eq(ConnectedServicesTable.owned_by, user.id),
        eq(ConnectedServicesTable.service_type, "clockify"),
      ),
    );

  // Fetch existing report if any
  const existingReport = await db.select().from(SecutimeReportsTable)
    .where(eq(SecutimeReportsTable.ownedBy, user.id));

  const currentServiceId = existingReport.length > 0
    ? existingReport[0].connectedServiceId
    : undefined;

  const currentWorkspaceId = existingReport.length > 0
    ? existingReport[0].workspaceId
    : undefined;

  if (clockifyServices.length === 0) {
    return (
      <div class="flex flex-col gap-4">
        <Toolbar
          title="SecuTime Settings"
          actionsSlotLeft={<NavButton href="/secutime">Back</NavButton>}
        />

        <section class="bg-white p-6 rounded-lg shadow">
          <h2 class="text-xl font-semibold mb-4">Clockify Account</h2>
          <p class="text-gray-600 mb-4">
            You need to connect a Clockify account before you can use SecuTime.
          </p>
          <NavButton href="/connected-services/add">
            Add Clockify Account
          </NavButton>
        </section>
      </div>
    );
  }

  return (
    <div class="flex flex-col gap-4">
      <Toolbar
        title="SecuTime Settings"
        actionsSlotLeft={<NavButton href="/secutime">Back</NavButton>}
      />

      <section class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">Clockify Configuration</h2>
        <SettingsForm
          clockifyServices={clockifyServices}
          currentServiceId={currentServiceId}
          currentWorkspaceId={currentWorkspaceId}
        />
      </section>
    </div>
  );
});
