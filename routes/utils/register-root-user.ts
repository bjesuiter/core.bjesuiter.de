import { registerUser } from "@/utils/user_utils.ts";
import { defineRoute } from "fresh/compat";

/**
 * Utility function to register a user to the database.
 * CAUTION: everything in here MUST be hardcoded! It's a simple utility to get users into the deno kv in prod.
 */
export default defineRoute(async (ctx) => {
  const req = ctx.req;
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

  return new Response("User registered", { status: 200 });
});
