import z from "zod/v4";
import { Card } from "@/components/Card.tsx";
import { FormFieldWithLabel } from "@/components/FormFieldWithLabel.tsx";
import { NavButton } from "@/components/NavButton.tsx";
import { MessageBlock } from "@/components/subassemblies/MessageBlock.tsx";
import { Toolbar } from "@/components/Toolbar.tsx";
import { define } from "@/lib/fresh/defineHelpers.ts";
import { db } from "@/lib/db/index.ts";
import { DDNSProfilesTable } from "@/lib/db/schemas/ddns_profiles.table.ts";
import { ConnectedServicesTable } from "@/lib/db/schemas/connected_services.table.ts";
import { generateSecureRandomString } from "@/utils/auth_helpers.ts";
import { and, eq } from "drizzle-orm";

const DnsRecordSchema = z.object({
  record_name: z.string().min(1),
  zone_id: z.string().min(1),
});

const DuplicateDDNSProfileSchema = z.object({
  profile_name: z.string().min(1),
  connected_service_id: z.uuid(),
  dns_records: z.string().transform((str, ctx) => {
    try {
      const parsed = JSON.parse(str);
      const result = z.array(DnsRecordSchema).safeParse(parsed);
      if (!result.success) {
        ctx.addIssue({
          code: "custom",
          message: "Invalid DNS records format",
        });
        return z.NEVER;
      }
      return result.data;
    } catch {
      ctx.addIssue({
        code: "custom",
        message: "DNS records must be valid JSON",
      });
      return z.NEVER;
    }
  }),
  allowed_user_agent: z.string().optional(),
});

export default define.page(async (ctx) => {
  const authResult = await ctx.state.authPromise;
  if (authResult.type === "response") {
    return authResult.response;
  }
  const { user } = authResult;

  // Fetch the existing DDNS profile to duplicate
  const profileSqlCondition = and(
    eq(DDNSProfilesTable.ownedBy, user.id),
    eq(DDNSProfilesTable.id, ctx.params.id),
  );

  const profileResponse = await db.select()
    .from(DDNSProfilesTable)
    .where(profileSqlCondition);

  if (profileResponse.length === 0) {
    return (
      <MessageBlock
        title="Duplicate DDNS Profile"
        backUrl="/ddns-profiles"
      >
        <p>
          DDNS profile with id {ctx.params.id}{" "}
          not found or you don't have access to it.
        </p>
      </MessageBlock>
    );
  }

  const sourceProfile = profileResponse[0];

  // Load user's connected services for dropdown
  const connectedServices = await db.select()
    .from(ConnectedServicesTable)
    .where(eq(ConnectedServicesTable.owned_by, user.id));

  // HANDLE POST REQUEST
  if (ctx.req.method === "POST") {
    const formData = await ctx.req.formData();
    const parsedInput = DuplicateDDNSProfileSchema.safeParse(
      Object.fromEntries(formData),
    );

    if (!parsedInput.success) {
      return (
        <Card class="flex flex-col gap-4 mx-auto w-125">
          <Toolbar
            title="Duplicate DDNS Profile"
            actionsSlotLeft={<NavButton href="/ddns-profiles">Back</NavButton>}
          />
          <div class="text-red-600">
            <h3>Validation Error:</h3>
            <pre>{JSON.stringify(z.treeifyError(parsedInput.error), null, 2)}</pre>
          </div>
        </Card>
      );
    }

    // Check if profile name already exists
    const existingProfile = await db.select()
      .from(DDNSProfilesTable)
      .where(
        and(
          eq(DDNSProfilesTable.ownedBy, user.id),
          eq(DDNSProfilesTable.profileName, parsedInput.data.profile_name),
        ),
      )
      .limit(1);

    if (existingProfile.length > 0) {
      return (
        <Card class="flex flex-col gap-4 mx-auto w-125">
          <Toolbar
            title="Duplicate DDNS Profile"
            actionsSlotLeft={<NavButton href="/ddns-profiles">Back</NavButton>}
          />
          <div class="text-red-600">
            <h3>Profile Name Already Exists</h3>
            <p>
              A profile with the name "{parsedInput.data.profile_name}" already
              exists. Please choose a different name.
            </p>
          </div>
          <NavButton href={`/ddns-profiles/${ctx.params.id}/duplicate`}>
            Try Again
          </NavButton>
        </Card>
      );
    }

    // Generate new credentials
    const ddnsUsername = generateSecureRandomString();
    const ddnsPassword = generateSecureRandomString();
    const profileId = crypto.randomUUID();
    const now = new Date().toISOString();

    // Insert into DB
    await db.insert(DDNSProfilesTable).values({
      id: profileId,
      profileName: parsedInput.data.profile_name,
      dnsRecords: parsedInput.data.dns_records,
      connectedServiceId: parsedInput.data.connected_service_id,
      ddnsUsername: ddnsUsername,
      ddnsPassword: ddnsPassword,
      allowedUserAgent: parsedInput.data.allowed_user_agent || null,
      lastUsedAt: null,
      createdAt: now,
      updatedAt: now,
      ownedBy: user.id,
    });

    return (
      <Card class="flex flex-col gap-4 mx-auto w-125">
        <Toolbar
          title="DDNS Profile Duplicated"
          actionsSlotLeft={
            <NavButton href="/ddns-profiles">Back to List</NavButton>
          }
          actionsSlotRight={
            <NavButton href="/ddns-profiles/add">Add Another</NavButton>
          }
        />
        <h2 class="text-green-600">Profile Duplicated Successfully!</h2>

        <div class="flex flex-col gap-2">
          <h3 class="font-bold">New Profile Details:</h3>
          <ul class="list-disc list-inside">
            <li>Profile Name: {parsedInput.data.profile_name}</li>
            <li>Profile ID: {profileId}</li>
            <li>
              DNS Records:{" "}
              {parsedInput.data.dns_records.map((r) => r.record_name).join(
                ", ",
              )}
            </li>
          </ul>
        </div>

        <div class="flex flex-col gap-2 p-4 bg-yellow-50 border border-yellow-300 rounded">
          <h3 class="font-bold text-yellow-800">
            ⚠️ Save these credentials - they won't be shown again!
          </h3>
          <div class="font-mono text-sm">
            <div>
              <strong>Username:</strong> {ddnsUsername}
            </div>
            <div>
              <strong>Password:</strong> {ddnsPassword}
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-2 p-4 bg-blue-50 border border-blue-300 rounded">
          <h3 class="font-bold">DDNS Update Endpoint:</h3>
          <code class="text-sm break-all">
            POST {ctx.url.origin}/ddns/{profileId}?ip=YOUR_IP
          </code>
          <p class="text-sm text-gray-600">
            Use Basic Auth with the credentials above
          </p>
        </div>
      </Card>
    );
  }

  // RENDER FORM with pre-populated data from source profile
  return (
    <Card class="flex flex-col gap-4 mx-auto w-125">
      <Toolbar
        title="Duplicate DDNS Profile"
        actionsSlotLeft={<NavButton href="/ddns-profiles">Back</NavButton>}
      />

      <div class="p-4 bg-blue-50 border border-blue-300 rounded">
        <h4 class="font-bold mb-2">ℹ️ Duplicating Profile:</h4>
        <div class="text-sm">
          <div>
            <strong>Source Profile:</strong> {sourceProfile.profileName}
          </div>
          <div class="text-gray-600 italic mt-2">
            New credentials will be generated for the duplicated profile.
          </div>
        </div>
      </div>

      <form
        method="POST"
        class="flex flex-col gap-6 max-w-2xl"
      >
        <FormFieldWithLabel label="Profile Name" forId="profile_name">
          <span class="text-sm text-gray-500 pl-1">
            (e.g., "Home Network", "Office DDNS")
          </span>
          <input
            type="text"
            name="profile_name"
            id="profile_name"
            value={sourceProfile.profileName + " Copy"}
            required
          />
        </FormFieldWithLabel>

        <FormFieldWithLabel
          label="Connected Service"
          forId="connected_service_id"
        >
          <span class="text-sm text-gray-500 pl-1">
            (select which Cloudflare account to use)
          </span>
          <select
            name="connected_service_id"
            id="connected_service_id"
            required
          >
            {connectedServices.map((service) => (
              <option
                key={service.id}
                value={service.id}
                selected={service.id === sourceProfile.connectedServiceId}
              >
                {service.service_label} ({service.service_type})
              </option>
            ))}
          </select>
        </FormFieldWithLabel>

        <FormFieldWithLabel label="DNS Records (JSON)" forId="dns_records">
          <span class="text-sm text-gray-500 pl-1">
            Array of objects with "record_name" and "zone_id"
          </span>
          <textarea
            name="dns_records"
            id="dns_records"
            rows={10}
            required
            spellcheck={false}
            class="font-mono text-sm border border-gray-300 shadow-inner p-2 rounded"
          >
            {JSON.stringify(sourceProfile.dnsRecords, null, 2)}
          </textarea>
        </FormFieldWithLabel>

        <FormFieldWithLabel
          label="Allowed User Agent (Optional)"
          forId="allowed_user_agent"
        >
          <span class="text-sm text-gray-500 pl-1">
            (leave empty to allow any user agent)
          </span>
          <input
            type="text"
            name="allowed_user_agent"
            id="allowed_user_agent"
            value={sourceProfile.allowedUserAgent ?? ""}
            placeholder="Synology DDNS Updater/72806 support@synology.com"
          />
        </FormFieldWithLabel>

        <button type="submit" class="primary-btn">
          Create Duplicate Profile
        </button>
      </form>
    </Card>
  );
});
