import { FreshContext } from "fresh";
import { desc, eq } from "drizzle-orm";
import { NavButton } from "../../components/NavButton.tsx";
import { Toolbar } from "../../components/Toolbar.tsx";
import { db } from "../../lib/db/index.ts";
import { ConnectedServicesTable } from "../../lib/db/schemas/connected_services.ts";
import { FreshCtxState } from "../../types/fresh_ctx_state.type.ts";

const itemsPerPage = 100;

export default async function ConnectedServicesPage(
  ctx: FreshContext<FreshCtxState>,
) {
  const page = parseInt(ctx.url.searchParams.get("page") ?? "0");
  const services = await db.select().from(ConnectedServicesTable)
    .orderBy(desc(ConnectedServicesTable.createdAt))
    .where(eq(ConnectedServicesTable.ownedBy, ctx.state.user.id))
    .limit(itemsPerPage)
    .offset(page * itemsPerPage);

  return (
    <>
      <Toolbar
        title="Connected Services"
        actionsSlotLeft={<NavButton href="/home">Back</NavButton>}
        actionsSlotRight={
          <NavButton href="/connected-services/add">
            Add Service
          </NavButton>
        }
      />
      <p>
        Here you can manage the services that you have connected to coresvc.
      </p>
      <table class="min-w-full border border-gray-300">
        <thead>
          <tr>
            <th class="px-4 py-2 border-b">ID</th>
            <th class="px-4 py-2 border-b">Service Type</th>
            <th class="px-4 py-2 border-b">Created At</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <tr key={service.id}>
              <td class="px-4 py-2 border-b">{service.id}</td>
              <td class="px-4 py-2 border-b">{service.service_type}</td>
              <td class="px-4 py-2 border-b">
                {service.createdAt?.toString?.() ?? ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
