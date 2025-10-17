import { define } from "@/lib/fresh/defineHelpers.ts";
import { envStore } from "@/utils/env_store.ts";
import { Toolbar } from "@/components/Toolbar.tsx";
import { NavButton } from "@/components/NavButton.tsx";
import { db } from "@/lib/db/index.ts";
import { ConnectedServicesTable } from "@/lib/db/schemas/connected_services.table.ts";
import { SecutimeReportsTable } from "@/lib/db/schemas/secutime_reports.table.ts";
import { and, eq } from "drizzle-orm";
import { MessageBlock } from "@/components/subassemblies/MessageBlock.tsx";
import { FormFieldWithLabel } from "@/components/FormFieldWithLabel.tsx";

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

    if (!connectedServiceId || typeof connectedServiceId !== "string") {
      return (
        <MessageBlock title="Error" backUrl="/secutime/settings">
          <p class="text-red-600">Please select a Clockify account.</p>
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
        .set({ connectedServiceId: connectedServiceId })
        .where(eq(SecutimeReportsTable.ownedBy, user.id));
    } else {
      // Create new report
      await db.insert(SecutimeReportsTable).values({
        id: crypto.randomUUID(),
        ownedBy: user.id,
        connectedServiceId: connectedServiceId,
      });
    }

    return (
      <MessageBlock title="Success" backUrl="/secutime/settings">
        <p class="text-green-600">
          Clockify account saved successfully!
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
        <h2 class="text-xl font-semibold mb-4">Clockify Account</h2>
        <form
          method="POST"
          class="flex flex-col gap-4"
          id="settings-form"
        >
          <FormFieldWithLabel label="Account" forId="connected_service">
            <select
              name="connected_service"
              id="connected_service"
              required
              class="border border-gray-300 rounded-md p-2"
            >
              <option value="">Select a Clockify account</option>
              {clockifyServices.map((service) => (
                <option
                  value={service.id}
                  selected={service.id === currentServiceId}
                >
                  {service.service_label}
                </option>
              ))}
            </select>
          </FormFieldWithLabel>

          <button
            type="submit"
            class="primary-btn"
          >
            Save
          </button>
        </form>
      </section>
    </div>
  );
});
