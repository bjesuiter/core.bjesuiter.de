import { FreshContext } from "fresh";

export const handler = async (
  req: Request,
  ctx: FreshContext,
): Promise<Response> => {
  const configId = ctx.params.ddnsConfigId;
  switch (configId) {
    case "bjesuiter":
      //   return await updateCloudflare(req, ctx);
      return new Response("Not implemented yet", { status: 501 });
    case "ebiko":
      return new Response("Not implemented yet", { status: 501 });
    default:
      return new Response("Not found", { status: 404 });
  }
};
