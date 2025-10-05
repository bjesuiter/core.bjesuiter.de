import { define } from "@/lib/fresh/defineHelpers.ts";
import { db } from "@/lib/db/index.ts";
import { DDNSProfilesTable } from "@/lib/db/schemas/ddns_profiles.table.ts";
import { and, eq } from "drizzle-orm";
import { MessageBlock } from "@/components/subassemblies/MessageBlock.tsx";

export default define.page(async (ctx) => {
  const authResult = await ctx.state.authPromise;
  if (authResult.type === "response") {
    return authResult.response;
  }
  const { user } = authResult;

  const profileResponse = await db.select().from(
    DDNSProfilesTable,
  ).where(
    and(
      eq(DDNSProfilesTable.ownedBy, user.id),
      eq(DDNSProfilesTable.id, ctx.params.id),
    ),
  );

  if (profileResponse.length === 0) {
    return (
      <MessageBlock
        title="Delete DDNS Profile"
        backUrl="/ddns-profiles"
      >
        <p>
          DDNS profile with id {ctx.params.id}{" "}
          not found or you don't have access to it.
        </p>
      </MessageBlock>
    );
  }

  const profile = profileResponse[0];

  // Perform the deletion
  await db.delete(DDNSProfilesTable).where(
    and(
      eq(DDNSProfilesTable.ownedBy, user.id),
      eq(DDNSProfilesTable.id, ctx.params.id),
    ),
  );

  return (
    <MessageBlock
      title="Delete DDNS Profile"
      backUrl="/ddns-profiles"
    >
      <p class="text-green-600">
        DDNS profile <span class="font-bold">{profile.profileName}</span> (ID:
        {" "}
        {ctx.params.id}) has been successfully deleted.
      </p>
      <div class="mt-4 p-4 bg-gray-50 border border-gray-300 rounded text-sm">
        <h4 class="font-bold mb-2">Deleted Profile Details:</h4>
        <ul class="list-disc list-inside">
          <li>
            Username: <span class="font-mono">{profile.ddnsUsername}</span>
          </li>
          <li>
            DNS Records: {(profile.dnsRecords as Array<
              { record_name: string; zone_id: string }
            >)?.map((r) => r.record_name).join(", ")}
          </li>
        </ul>
      </div>
    </MessageBlock>
  );
});
