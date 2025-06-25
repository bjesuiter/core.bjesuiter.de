import { FreshContext } from "$fresh/server.ts";

export const handler = async (
  _req: Request,
  _ctx: FreshContext,
): Promise<Response> => {
  console.debug("Request received", {
    credentials: _req.credentials,
    method: _req.method,
    url: _req.url,
    headers: Object.fromEntries(_req.headers),
    body: await _req.text(),
  });
  return new Response("", {
    status: 200,
  });
};
