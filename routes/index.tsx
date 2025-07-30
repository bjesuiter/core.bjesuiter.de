import { isRequestAuthenticated } from "../utils/auth.ts";
import { redirectToHome, redirectToLogin } from "../utils/routing.ts";
import { FreshContext } from "fresh";

export default async function Home(ctx: FreshContext) {
  const req = ctx.req;
  const authResult = await isRequestAuthenticated(req);
  if (authResult.isErr()) {
    return redirectToLogin();
  }

  return redirectToHome();
}
