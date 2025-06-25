import { FreshContext } from "$fresh/server.ts";

interface State {
  data: string;
}

/**
 * TODO: write an authentication middleware
 */
export async function handler(
  req: Request,
  ctx: FreshContext<State>,
) {
  // Step 1 - analyze the request
  ctx.state.data = "myData";

  // Step 2 - call next middleware / route handler
  const resp = await ctx.next();

  // Step 3 - change response if needed
  return resp;
}
