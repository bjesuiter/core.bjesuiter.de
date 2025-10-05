import { NavButton } from "@/components/NavButton.tsx";
import { Toolbar } from "@/components/Toolbar.tsx";
import { db } from "@/lib/db/index.ts";
import { DDNSProfilesTable } from "@/lib/db/schemas/ddns_profiles.table.ts";
import { ConnectedServicesTable } from "@/lib/db/schemas/connected_services.table.ts";
import { define } from "@/lib/fresh/defineHelpers.ts";
import { desc, eq } from "drizzle-orm";
import { format } from "date-fns";

const itemsPerPage = 100;

export default define.page(async (ctx) => {
  const page = parseInt(ctx.url.searchParams.get("page") ?? "0");

  const authResult = await ctx.state.authPromise;
  if (authResult.type === "response") {
    return authResult.response;
  }
  const { user } = authResult;

  const profiles = await db.select({
    id: DDNSProfilesTable.id,
    profileName: DDNSProfilesTable.profileName,
    dnsRecords: DDNSProfilesTable.dnsRecords,
    ddnsUsername: DDNSProfilesTable.ddnsUsername,
    connectedServiceId: DDNSProfilesTable.connectedServiceId,
    serviceLabel: ConnectedServicesTable.service_label,
    createdAt: DDNSProfilesTable.createdAt,
    updatedAt: DDNSProfilesTable.updatedAt,
  })
    .from(DDNSProfilesTable)
    .leftJoin(
      ConnectedServicesTable,
      eq(DDNSProfilesTable.connectedServiceId, ConnectedServicesTable.id),
    )
    .where(eq(DDNSProfilesTable.ownedBy, user.id))
    .orderBy(desc(DDNSProfilesTable.createdAt))
    .limit(itemsPerPage)
    .offset(page * itemsPerPage);

  return (
    <div class="flex flex-col gap-4">
      <Toolbar
        title="DDNS Profiles"
        actionsSlotRight={<NavButton href="/ddns/add">Add Profile</NavButton>}
      />

      <p>
        Manage your Dynamic DNS profiles. Each profile updates multiple DNS
        records with a single request.
      </p>

      <table class="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th class="border border-gray-300 px-2 py-1 text-left">
              Profile Name
            </th>
            <th class="border border-gray-300 px-2 py-1 text-left">
              DNS Records
            </th>
            <th class="border border-gray-300 px-2 py-1 text-left">
              Username
            </th>
            <th class="border border-gray-300 px-2 py-1 text-left">
              Connected Service
            </th>
            <th class="border border-gray-300 px-2 py-1 text-left">
              Created At
            </th>
            <th class="border border-gray-300 px-2 py-1 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {profiles.map((profile) => (
            <tr key={profile.id}>
              <td class="border border-gray-300 px-2 py-1">
                {profile.profileName}
              </td>
              <td class="border border-gray-300 px-2 py-1">
                <ul class="list-disc list-inside text-sm">
                  {(profile.dnsRecords as Array<
                    { record_name: string; zone_id: string }
                  >)?.map((record) => (
                    <li key={record.record_name}>{record.record_name}</li>
                  ))}
                </ul>
              </td>
              <td class="border border-gray-300 px-2 py-1 font-mono text-sm">
                {profile.ddnsUsername}
              </td>
              <td class="border border-gray-300 px-2 py-1">
                {profile.serviceLabel}
              </td>
              <td class="border border-gray-300 px-2 py-1 font-mono text-sm">
                {format(profile.createdAt, "yyyy-MM-dd HH:mm")}
              </td>
              <td class="px-2 py-2 flex gap-2">
                <NavButton href={`/ddns/${profile.id}/edit`}>Edit</NavButton>
                <NavButton href={`/ddns/${profile.id}/delete`}>
                  Delete
                </NavButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {profiles.length === 0 && (
        <p class="text-gray-500 italic">
          No DDNS profiles yet. Create one to get started!
        </p>
      )}
    </div>
  );
});
