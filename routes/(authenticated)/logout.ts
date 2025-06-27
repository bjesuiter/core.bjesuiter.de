import { Handlers } from "$fresh/server.ts";
import { FreshCtxState } from "../../types/fresh_ctx_state.type.ts";
import { deleteSession } from "../../utils/auth.ts";

export const handler: Handlers<unknown, FreshCtxState> = {
  POST: async (req, ctx) => {
    await deleteSession(ctx.state.session.id);

    // NOTE: no need to "delete" the session cookie, it will not be valid anyway,
    // so the app will redirect to the login page.

    const headers = new Headers();
    headers.set("location", "/login");
    return new Response(null, {
      status: 303,
      headers,
    });
  },
};
