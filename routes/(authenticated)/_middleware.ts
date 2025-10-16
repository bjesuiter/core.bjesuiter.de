import { define } from "@/lib/fresh/defineHelpers.ts";
import { isRequestAuthenticated } from "@/utils/auth.ts";
import { redirectToLogin } from "@/utils/routing.ts";
import { appTracer } from "../../lib/opentelemetry/app-tracer.ts";
import { envStore } from "@/utils/env_store.ts";

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

  // TODO: experiment with this worker approach
  // const newAuthPromise = new Promise((resolve, reject) => {
  // start worker
  // send message to fetch the auth data / check the auth data
  // receive message with auth result or error
  // resolve or reject the promise
  // });

  ctx.state.authPromise = authPromise.then((authResult) => {
    if (authResult.isErr()) {
      return { type: "response", response: redirectToLogin() };
    } else {
      // Calculate isRootUser here and add to state
      // TODO: Add full permission management adjacent to the user db table!
      const isRootUser =
        authResult.value.user.email === envStore.CORE_ROOT_USER_EMAIL;

      return {
        type: "data",
        session: authResult.value.session,
        user: authResult.value.user,
        isRootUser,
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
