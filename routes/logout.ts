import { Handlers } from "$fresh/server.ts";
import { Cookie } from "tough-cookie";
import { FreshCtxState } from "../types/fresh_ctx_state.type.ts";
import { deleteSession } from "../utils/auth.ts";

export const handler: Handlers<unknown, FreshCtxState> = {
  POST: async (req, ctx) => {
    const session = ctx.state.session;
    await deleteSession(session.id);

    const cookie = new Cookie({
      key: "session_token",
      value: "",
      expires: new Date(0),
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });

    const headers = new Headers();
    headers.set("location", "/login");
    headers.set("Set-Cookie", cookie.toString());
    return new Response(null, {
      status: 303,
      headers,
    });
  },
};
