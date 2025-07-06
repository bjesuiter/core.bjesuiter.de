import { FreshContext } from "$fresh/server.ts";
import { Cookie } from "tough-cookie";
import { FreshCtxState } from "../../types/fresh_ctx_state.type.ts";
import { validateSessionToken } from "../../utils/auth.ts";
import { kv } from "../../utils/kv.ts";
import { userSchema } from "../../utils/user.type.ts";
import { redirectToLogin } from "../../utils/routing.ts";

/**
 * Authentication middleware
 */
export async function handler(
  req: Request,
  ctx: FreshContext<FreshCtxState>,
) {
  // Step 1 - analyze the request
  const reqCookies = req.headers.get("cookie")?.split(";").map(
    (cookieString) => {
      return Cookie.parse(cookieString);
    },
  );

  const sessionTokenCookie = reqCookies?.find(
    (cookie) => cookie?.key === "session_token",
  );

  if (!sessionTokenCookie) {
    console.log("No session token cookie found - not authenticated");
    return redirectToLogin();
  }

  const session = await validateSessionToken(sessionTokenCookie.value);
  if (!session || !session.userEmail) {
    console.log(
      "Session token is invalid, session expired or session not found - not authenticated",
    );
    return redirectToLogin();
  }

  const userKvResult = await kv.get(["users", session.userEmail]);
  if (!userKvResult.value) {
    console.error(`User ${session.userEmail} was not found`);
    return redirectToLogin();
  }

  const user = userSchema.safeParse(userKvResult.value);
  if (!user.success) {
    console.error(
      `User ${session.userEmail} was found in kv, but is invalid: ${user.error.message}`,
    );
    return redirectToLogin();
  }

  ctx.state.session = session;
  ctx.state.user = user.data;

  // Step 2 - call next middleware / route handler
  const resp = await ctx.next();

  // Step 3 - change response if needed
  return resp;
}
