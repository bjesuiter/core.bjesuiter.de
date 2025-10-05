import { NavButton } from "@/components/NavButton.tsx";
import { Toolbar } from "@/components/Toolbar.tsx";
import { db } from "@/lib/db/index.ts";
import { ConnectedServicesTable } from "@/lib/db/schemas/connected_services.table.ts";
import { define } from "@/lib/fresh/defineHelpers.ts";
import { desc, eq } from "drizzle-orm";
import { appTracer } from "../../lib/opentelemetry/app-tracer.ts";
import { twJoin } from "tailwind-merge";
import { Partial } from "fresh/runtime";

const itemsPerPage = 100;

const ConnectedServicesPage = define.page(async (ctx) => {
  const page = parseInt(ctx.url.searchParams.get("page") ?? "0");

  const authResult = await ctx.state.authPromise;
  if (authResult.type === "response") {
    return authResult.response;
  }
  const { user } = authResult;

  const services = await appTracer.startActiveSpan(
    "loadConnectedServices",
    async (span) => {
      console.time("loadConnectedServicesFromDb");
      const dbResult = await db.select().from(ConnectedServicesTable)
        .orderBy(desc(ConnectedServicesTable.created_at))
        .where(eq(ConnectedServicesTable.owned_by, user.id))
        .limit(itemsPerPage)
        .offset(page * itemsPerPage);
      console.timeEnd("loadConnectedServicesFromDb");
      span.end();
      return dbResult;
    },
  );

  return (
    <>
      <Toolbar
        title="Connected Services"
        actionsSlotRight={
          <NavButton href="/connected-services/add">
            Add Service
          </NavButton>
        }
      />

      <p>
        Here you can manage the services that you have connected to
        core.bjesuiter.
      </p>
      <div>
        <table class="min-w-full border border-gray-300 mt-4">
          <thead>
            <tr>
              <th class="px-4 py-2 border-b text-left">ID</th>
              <th class="px-4 py-2 border-b text-left">Service Type</th>
              <th class="px-4 py-2 border-b text-left">Service Label</th>
              <th class="px-4 py-2 border-b text-left">Created At</th>
              <th class="px-4 py-2 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.id}>
                <td class="px-4 py-2 border-b">{service.id}</td>
                <td class="px-4 py-2 border-b">{service.service_type}</td>
                <td class="px-4 py-2 border-b">{service.service_label}</td>
                <td class="px-4 py-2 border-b">
                  {service.created_at?.toString?.() ?? ""}
                </td>
                <td class="px-4 py-2 border-b flex gap-2 flex-wrap">
                  <NavButton href={`/connected-services/${service.id}/delete`}>
                    Delete
                  </NavButton>
                  <NavButton
                    href={`/connected-services`}
                    fPartial={`/connected-services/${service.id}/revalidate-partial`}
                  >
                    Revalidate
                  </NavButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
});

export default ConnectedServicesPage;
