import z from "zod/v4";
import { Card } from "@/components/Card.tsx";
import { FormFieldWithLabel } from "@/components/FormFieldWithLabel.tsx";
import { NavButton } from "@/components/NavButton.tsx";
import { Toolbar } from "@/components/Toolbar.tsx";
import { define } from "@/lib/fresh/defineHelpers.ts";
import { db } from "@/lib/db/index.ts";
import { DDNSProfilesTable } from "@/lib/db/schemas/ddns_profiles.table.ts";
import { ConnectedServicesTable } from "@/lib/db/schemas/connected_services.table.ts";
import { generateSecureRandomString } from "@/utils/auth_helpers.ts";
import { eq } from "drizzle-orm";
import { dbSafeExecute } from "../../../lib/db/neverthrow/helpers";
import { MessageBlock } from "../../../components/subassemblies/MessageBlock.tsx";

const DnsRecordSchema = z.object({
  record_name: z.string().min(1),
  zone_id: z.string().min(1),
});

const DDNSProfileFormSchema = z.object({
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

  // Load user's connected services for dropdown
  const connectedServices = await db.select()
    .from(ConnectedServicesTable)
    .where(eq(ConnectedServicesTable.owned_by, user.id));

  // HANDLE POST REQUEST
  if (ctx.req.method === "POST") {
    const formData = await ctx.req.formData();
    const parsedInput = DDNSProfileFormSchema.safeParse(
      Object.fromEntries(formData),
    );

    if (!parsedInput.success) {
      return (
        <Card class="flex flex-col gap-4 mx-auto w-125">
          <Toolbar
            title="Add DDNS Profile"
            actionsSlotLeft={<NavButton href="/ddns-profiles">Back</NavButton>}
          />
          <div class="text-red-600">
            <h3>Validation Error:</h3>
            <pre>{JSON.stringify(z.treeifyError(parsedInput.error), null, 2)}</pre>
          </div>
        </Card>
      );
    }

    // Generate credentials
    const ddnsUsername = generateSecureRandomString();
    const ddnsPassword = generateSecureRandomString();
    const profileId = crypto.randomUUID();
    const now = new Date().toISOString();

    // Insert into DB
    const dbResult = await dbSafeExecute(
      db.insert(DDNSProfilesTable).values({
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
      }),
    );

    if (dbResult.isErr()) {
      return (
        <MessageBlock
          title="DDNS Profile Creation Failed"
          backUrl="/ddns-profiles"
        >
          <p class="text-red-600">
            Failed to create DDNS profile.
          </p>
          <pre>{JSON.stringify(dbResult.error, null, 2)}</pre>
        </MessageBlock>
      );
    }

    return (
      <Card class="flex flex-col gap-4 mx-auto w-125">
        <Toolbar
          title="DDNS Profile Created"
          actionsSlotLeft={
            <NavButton href="/ddns-profiles">Back to List</NavButton>
          }
          actionsSlotRight={
            <NavButton href="/ddns-profiles/add">Add Another</NavButton>
          }
        />
        <h2 class="text-green-600">Profile Created Successfully!</h2>

        <div class="flex flex-col gap-2">
          <h3 class="font-bold">Profile Details:</h3>
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

  // RENDER FORM
  return (
    <Card class="flex flex-col gap-4 mx-auto w-125">
      <Toolbar
        title="Add DDNS Profile"
        actionsSlotLeft={<NavButton href="/ddns-profiles">Back</NavButton>}
      />

      {connectedServices.length === 0
        ? (
          <div class="p-4 bg-yellow-50 border border-yellow-300 rounded">
            <p class="text-yellow-800">
              You need to add a Connected Service (Cloudflare) first!
            </p>
            <NavButton href="/connected-services/add">
              Add Connected Service
            </NavButton>
          </div>
        )
        : (
          <>
          </>
        )}

      <form
        action="/ddns-profiles/add"
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
            disabled={connectedServices.length === 0}
          >
            <option value="">-- Select Service --</option>
            {connectedServices.map((service) => (
              <option key={service.id} value={service.id}>
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
            rows={6}
            required
            spellcheck={false}
            class="font-mono text-sm border border-gray-300 shadow-inner p-2 rounded"
          >
            {`[
  {
    "record_name": "home.example.com",
    "zone_id": "abc123..."
  }
]`}
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
            placeholder="Synology DDNS Updater/72806 support@synology.com"
          />
        </FormFieldWithLabel>

        <button
          type="submit"
          class="primary-btn"
          disabled={connectedServices.length === 0}
        >
          Create DDNS Profile
        </button>
      </form>

      <div class="p-4 bg-gray-50 border border-gray-300 rounded text-sm">
        <h4 class="font-bold mb-2">ℹ️ How it works:</h4>
        <ol class="list-decimal list-inside space-y-1">
          <li>Create a profile with DNS records you want to update</li>
          <li>Unique username/password will be auto-generated</li>
          <li>
            Use the endpoint with Basic Auth to update all records at once
          </li>
          <li>All records in the profile will be updated to the same IP</li>
        </ol>
      </div>
    </Card>
  );
});
