import { Card } from "@/components/Card.tsx";
import { FormFieldWithLabel } from "@/components/FormFieldWithLabel.tsx";
import { NavButton } from "@/components/NavButton.tsx";
import { MessageBlock } from "@/components/subassemblies/MessageBlock.tsx";
import { Toolbar } from "@/components/Toolbar.tsx";
import { db } from "@/lib/db/index.ts";
import { ConnectedServicesTable } from "@/lib/db/schemas/connected_services.table.ts";
import { define } from "@/lib/fresh/defineHelpers.ts";
import { and, eq } from "drizzle-orm";
import z from "zod/v4";
import { validateCfToken } from "../(service-types)/validateCfToken.ts";
import { validateClockifyApiKey } from "../(service-types)/validateClockifyApiKey.ts";

const EditConnectedServiceSchema = z.object({
  api_key: z.string().optional(),
  service_label: z.string().optional(),
});

export default define.page(async (ctx) => {
  // Fetch the existing connected service
  const authResult = await ctx.state.authPromise;
  if (authResult.type === "response") {
    return authResult.response;
  }
  const { user: currentUser } = authResult;

  const connectedServiceSqlCondition = and(
    eq(ConnectedServicesTable.owned_by, currentUser.id),
    eq(ConnectedServicesTable.id, ctx.params.id),
  );

  const connectedServiceResponse = await db.select().from(
    ConnectedServicesTable,
  ).where(connectedServiceSqlCondition);

  if (connectedServiceResponse.length === 0) {
    return (
      <MessageBlock
        title="Edit Connected Service"
        backUrl="/connected-services"
      >
        <p>
          Connected service with id {ctx.params.id} not found
        </p>
      </MessageBlock>
    );
  }

  const connectedService = connectedServiceResponse[0];

  // HANDLE POST REQUEST, IF ANY
  if (ctx.req.method === "POST") {
    const formData = await ctx.req.formData();
    const parsedInput = EditConnectedServiceSchema.safeParse(
      Object.fromEntries(formData),
    );

    if (!parsedInput.success) {
      return new Response(parsedInput.error.message, { status: 400 });
    }

    const apiKey = parsedInput.data.api_key;
    const serviceLabel = parsedInput.data.service_label;

    if (!apiKey && !serviceLabel) {
      return (
        <MessageBlock
          title="Edit Connected Service"
          backUrl="/connected-services"
        >
          <p>No changes to make</p>
        </MessageBlock>
      );
    }

    if (!apiKey) {
      // update only the service label
      await db.update(ConnectedServicesTable)
        .set({
          service_label: serviceLabel,
          updated_at: new Date(),
        })
        .where(connectedServiceSqlCondition);
      return (
        <MessageBlock
          title="Edit Connected Service"
          backUrl="/connected-services"
        >
          <p>Service label updated</p>
        </MessageBlock>
      );
    }

    // Validate the new API key based on service type
    switch (connectedService.service_type) {
      case "cloudflare": {
        const cfResult = await validateCfToken(apiKey);
        if (!cfResult) {
          return (
            <MessageBlock
              title="Edit Connected Service"
              backUrl="/connected-services"
            >
              <p>
                No changes where saved:{" "}
                <br></br>The provided API key is invalid for service type{" "}
                <span class="font-bold">{connectedService.service_type}</span>
              </p>
            </MessageBlock>
          );
        }
        break;
      }
      case "clockify": {
        const clockifyResult = await validateClockifyApiKey(apiKey);
        if (!clockifyResult) {
          return (
            <MessageBlock
              title="Edit Connected Service"
              backUrl="/connected-services"
            >
              <p>
                No changes were saved:{" "}
                <br></br>The provided API key is invalid for service type{" "}
                <span class="font-bold">{connectedService.service_type}</span>
              </p>
            </MessageBlock>
          );
        }
        break;
      }
      default:
        return new Response(
          `Unknown service type: ${connectedService.service_type}`,
          { status: 400 },
        );
    }

    // Update the service
    await db.update(ConnectedServicesTable)
      .set({
        api_key: apiKey,
        service_label: serviceLabel,
        updated_at: new Date(),
      })
      .where(connectedServiceSqlCondition);

    return (
      <MessageBlock
        title="Edit Connected Service"
        backUrl="/connected-services"
      >
        <p>
          Connected service <span class="font-bold">{serviceLabel}</span> (Type:
          {" "}
          <span class="font-bold">{connectedService.service_type}</span>) has
          been successfully updated.
        </p>
      </MessageBlock>
    );
  }

  // Render the edit form with pre-populated data
  return (
    <Card class="flex flex-col gap-4 mx-auto w-125">
      <Toolbar
        title="Edit Connected Service"
        actionsSlotLeft={<NavButton href="/connected-services">Back</NavButton>}
      />

      <form
        method="POST"
        class="flex flex-col gap-6 max-w-md"
      >
        <FormFieldWithLabel label="Service Type" forId="service_type">
          <input
            type="text"
            id="service_type"
            value={connectedService.service_type}
            disabled
            class="disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <span class="text-sm text-gray-500 pl-1">
            (service type cannot be changed)
          </span>
        </FormFieldWithLabel>

        <FormFieldWithLabel
          label="Service Label"
          forId="service_label"
        >
          <span class="text-sm text-gray-500 pl-1">
            (a custom label to identify the service for yourself)
          </span>
          <input
            type="text"
            name="service_label"
            id="service_label"
            value={connectedService.service_label}
            required
          />
        </FormFieldWithLabel>

        <FormFieldWithLabel label="API Key" forId="api_key">
          <input
            type="text"
            name="api_key"
            id="api_key"
            value={connectedService.api_key}
            required
          />
        </FormFieldWithLabel>

        <button type="submit" class="primary-btn">Save Changes</button>
      </form>
    </Card>
  );
});
