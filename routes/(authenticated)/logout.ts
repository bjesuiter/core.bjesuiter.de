import { CoreSvcContext } from "../../types/fresh_ctx_state.type.ts";
import { deleteSession } from "../../utils/auth.ts";
import { Handlers } from "fresh/compat";

export const handler: Handlers<unknown, CoreSvcContext> = {
  POST: async (ctx) => {
    const req = ctx.req;

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
