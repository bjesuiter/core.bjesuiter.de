import { isRequestAuthenticated } from "@/utils/auth.ts";
import { redirectToLogin } from "@/utils/routing.ts";
import { define } from "@/lib/fresh/defineHelpers.ts";
import { appTracer } from "../../lib/opentelemetry/app-tracer.ts";

/**
 * Authentication middleware
 */

export default define.middleware(async (ctx) => {
  const authResult = await appTracer.startActiveSpan(
    "isRequestAuthenticated",
    async (span) => {
      const result = await isRequestAuthenticated(ctx.req, span);
      span.end();
      return result;
    },
  );
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
