import { isRequestAuthenticated } from "@/utils/auth.ts";
import { redirectToLogin } from "@/utils/routing.ts";
import { define } from "@/lib/fresh/defineHelpers.ts";
import { appTracer } from "../../lib/opentelemetry/app-tracer.ts";
import { cfTXTRecord } from "@contracts/api.cloudflare.com/_schemas/dnsSchemas.ts";

/**
 * Authentication middleware
 */

export default define.middleware(async (ctx) => {
  const authPromise = appTracer.startActiveSpan(
    "isRequestAuthenticated",
    (span) => {
      return isRequestAuthenticated(ctx.req, span)
        .then((authResult) => {
          span.end();
          return authResult;
        });
    },
  );

  ctx.state.authPromise = authPromise.then((authResult) => {
    if (authResult.isErr()) {
      return { type: "response", response: redirectToLogin() };
    } else {
      return {
        type: "data",
        session: authResult.value.session,
        user: authResult.value.user,
      };
    }
  });

  // Step 2 - call next middleware / route handler
  console.time("auth middleware:ctx.next");
  const resp = await ctx.next();
  console.timeEnd("auth middleware:ctx.next");

  // Step 3 - change response if needed
  return resp;
});
