import { isRequestAuthenticated } from "@/utils/auth.ts";
import { redirectToLogin } from "@/utils/routing.ts";
import { define } from "@/lib/fresh/defineHelpers.ts";

/**
 * Authentication middleware
 */

export default define.middleware(async (ctx) => {
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
});
