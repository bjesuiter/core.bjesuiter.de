import z from "zod/v4";
import { Card } from "@/components/Card.tsx";
import { FormFieldWithLabel } from "@/components/FormFieldWithLabel.tsx";
import { NavButton } from "@/components/NavButton.tsx";
import { Toolbar } from "@/components/Toolbar.tsx";
import { define } from "@/lib/fresh/defineHelpers.ts";

import { addCloudflareConnection } from "./(service-types)/addCloudflareConnection.ts";

const ConnectedServiceSchema = z.object({
  service_type: z.enum(["cloudflare"]),
  api_key: z.string(),
  service_label: z.string(),
});
export default define.page(
  async (ctx) => {
    // HANDLE POST REQUEST, IF ANY
    if (ctx.req.method === "POST") {
      const formData = await ctx.req.formData();
      const parsedInput = ConnectedServiceSchema.safeParse(
        Object.fromEntries(formData),
      );
      if (!parsedInput.success) {
        return new Response(parsedInput.error.message, { status: 400 });
      }
      const serviceType = parsedInput.data.service_type;
      const apiKey = parsedInput.data.api_key;
      const serviceLabel = parsedInput.data.service_label;

      switch (serviceType) {
        case "cloudflare": {
          // returns direct error responses to be passed to the client, or a {data: any} object to be passed to the page render function
          const cfResult = await addCloudflareConnection(
            apiKey,
            ctx.state.user.id,
            serviceLabel,
          );

          if (typeof cfResult === "object" && "data" in cfResult) {
            const status = cfResult.data?.status;
            const serviceType = cfResult.data?.service_type;
            const serviceLabel = cfResult.data?.service_label;

            if (status === "service_added") {
              return (
                <Card class="flex flex-col gap-4 mx-auto w-125">
                  <Toolbar
                    title="Add Connected Service"
                    actionsSlotLeft={
                      <NavButton href="/connected-services">Back</NavButton>
                    }
                    actionsSlotRight={
                      <NavButton href="/connected-services/add">
                        Add Another Service
                      </NavButton>
                    }
                  />
                  <h2>Service added</h2>
                  <ul>
                    <li>Service Type: {serviceType}</li>
                    <li>Service Label: {serviceLabel}</li>
                  </ul>
                </Card>
              );
            }
          } else {
            return cfResult;
          }
          break;
        }
        default:
          return new Response(`Unknown service type: ${serviceType}`, {
            status: 400,
          });
      }
    }

    return (
      <Card class="flex flex-col gap-4 mx-auto w-125">
        <Toolbar
          title="Add Connected Service"
          actionsSlotLeft={
            <NavButton href="/connected-services">Back</NavButton>
          }
        />

        <form
          action="/connected-services/add"
          method="POST"
          class="flex flex-col gap-6 max-w-md"
        >
          <FormFieldWithLabel label="Service Type" forId="service_type">
            <select name="service_type" id="service_type" required>
              <option value="cloudflare">Cloudflare</option>
            </select>
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
              required
            />
          </FormFieldWithLabel>

          <FormFieldWithLabel label="API Key" forId="api_key">
            <input type="text" name="api_key" id="api_key" required />
          </FormFieldWithLabel>

          <button type="submit" class="primary-btn">Add Service</button>
        </form>
      </Card>
    );
  },
);
