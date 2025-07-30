import { FreshContext } from "fresh";
import { FreshCtxState } from "@/types/fresh_ctx_state.type.ts";
import { isRequestAuthenticated } from "@/utils/auth.ts";
import { redirectToLogin } from "@/utils/routing.ts";

/**
 * Authentication middleware
 */
export async function handler(
  ctx: FreshContext<FreshCtxState>,
) {
  const req = ctx.req;
  const authResult = await isRequestAuthenticated(req);
  if (authResult.isErr()) {
    return redirectToLogin();
  }

  ctx.state.session = authResult.value.session;
  ctx.state.user = authResult.value.user;

  // Step 2 - call next middleware / route handler
  const resp = await ctx.next();

  // Step 3 - change response if needed
  return resp;
}
