import { FreshContext } from "$fresh/server.ts";
import { FreshCtxState } from "../../../types/fresh_ctx_state.type.ts";
import { envStore } from "../../../utils/env_store.ts";

const allowedUsers = [envStore.CORE_ROOT_USER_EMAIL, "affenmaster02@gmail.com"];

/**
 * Check who can access the user management UI
 * @param _req
 * @param ctx
 * @returns
 */
export async function handler(
  _req: Request,
  ctx: FreshContext<FreshCtxState>,
) {
  const user = ctx.state.user;

  if (!allowedUsers.includes(user.email)) {
    return new Response("Forbidden", { status: 403 });
  }

  const resp = await ctx.next();
  return resp;
}
