import { isRequestAuthenticated } from "../utils/auth.ts";
import { redirectToHome, redirectToLogin } from "../utils/routing.ts";

export default async function Home(req: Request) {
  const authResult = await isRequestAuthenticated(req);
  if (authResult.isErr()) {
    return redirectToLogin();
  }

  return redirectToHome();
}
