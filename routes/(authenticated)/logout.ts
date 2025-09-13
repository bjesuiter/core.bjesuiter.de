import { define } from "@/lib/fresh/defineHelpers.ts";
import { deleteSession } from "@/utils/auth.ts";

export default define.page(async (ctx) => {
  const authResult = await ctx.state.authPromise;
  if (authResult.type === "response") {
    return authResult.response;
  }
  const { session } = authResult;

  if (ctx.req.method === "POST") {
    await deleteSession(session.id);

    // NOTE: no need to "delete" the session cookie, it will not be valid anyway,
    // so the app will redirect to the login page.

    const headers = new Headers();
    headers.set("location", "/login");
    return new Response(null, {
      status: 303,
      headers,
    });
  }

  // Optionally, handle other methods or return a 405 Method Not Allowed
  return new Response("Method Not Allowed", { status: 405 });
});
