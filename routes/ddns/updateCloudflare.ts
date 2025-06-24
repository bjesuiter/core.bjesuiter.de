import { FreshContext } from "$fresh/server.ts";

export const handler = (_req: Request, _ctx: FreshContext): Response => {
  console.debug("Request received", {
    credentials: _req.credentials,
    method: _req.method,
    url: _req.url,
  });
  return new Response("", {
    status: 200,
  });
};
