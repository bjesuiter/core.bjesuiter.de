import { envStore } from "@/utils/env_store.ts";
import { define } from "@/lib/fresh/defineHelpers.ts";

const _allowedUsers = [
  envStore.CORE_ROOT_USER_EMAIL,
  "affenmaster02@gmail.com",
];

/**
 * Check who can access the user management UI
 * @param _req
 * @param ctx
 * @returns
 */
export default define.middleware(async (ctx) => {
  // const user = ctx.state.user;
  // Permission check disabled for now
  // if (!allowedUsers.includes(user.email)) {
  //   return new Response("Forbidden", { status: 403 });
  // }

  const resp = await ctx.next();
  return resp;
});
