import { isRequestAuthenticated } from "@/utils/auth.ts";
import { redirectToHome, redirectToLogin } from "@/utils/routing.ts";
import { define } from "@/lib/fresh/defineHelpers.ts";

export default define.page(async (ctx) => {
  const req = ctx.req;
  const authResult = await isRequestAuthenticated(req);
  if (authResult.isErr()) {
    return redirectToLogin();
  }

  return redirectToHome();
});
