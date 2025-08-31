import { registerUser } from "@/utils/user_utils.ts";
import { define } from "@/lib/fresh/defineHelpers.ts";
import { Card } from "../../components/Card.tsx";
import { Icon } from "../../lib/fresh-iconify/Icon.tsx";

/**
 * Utility function to register a user to the database.
 * CAUTION: everything in here MUST be hardcoded! It's a simple utility to get users into the deno kv in prod.
 */
export default define.page((_ctx) => {
  const label = Deno.env.get("CORE_ROOT_USER_LABEL");
  if (!label) {
    return new Response("CORE_ROOT_USER_LABEL is not set", { status: 500 });
  }

  const email = Deno.env.get("CORE_ROOT_USER_EMAIL");
  if (!email) {
    return new Response("CORE_ROOT_USER_EMAIL is not set", { status: 500 });
  }

  const pass = Deno.env.get("CORE_ROOT_USER_PASSWORD");
  if (!pass) {
    return new Response("CORE_ROOT_USER_PASSWORD is not set", { status: 500 });
  }

  registerUser(email, label, pass);

  return (
    <Card class="max-w-md mx-auto my-4">
      <p class="flex items-center gap-2 text-teal-500">
        <Icon class="text-2xl icon-[mdi-light--check]"></Icon> User registered
      </p>
    </Card>
  );
});
