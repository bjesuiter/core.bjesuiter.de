import { FreshContext } from "$fresh/server.ts";
import { Cookie } from "tough-cookie";
import { Session } from "../../utils/auth.ts";
import { User } from "../../utils/user.ts";

interface State {
  session: Session | undefined;
  user: User | undefined;
}

/**
 * TODO: write an authentication middleware
 */
export async function handler(
  req: Request,
  ctx: FreshContext<State>,
) {
  // Step 1 - analyze the request
  const reqCookies = req.headers.get("cookie")?.split(";").map(
    (cookieString) => {
      return Cookie.parse(cookieString);
    },
  );
  console.log(reqCookies);

  //TODO: validate the session cookie, if invalid, redirect to login page

  // Step 2 - call next middleware / route handler
  const resp = await ctx.next();

  // Step 3 - change response if needed
  return resp;
}
