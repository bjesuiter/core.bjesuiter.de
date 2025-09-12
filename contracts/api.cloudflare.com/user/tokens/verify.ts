import { c } from "@/contracts/_contractRouter.ts";

import { cfTokenVerifyResponse } from "@/contracts/api.cloudflare.com/_schemas/tokenVerify.ts";

export const verifyUserToken = c.router({
  verify: {
    method: "GET",
    path: "/user/tokens/verify",
    responses: {
      200: cfTokenVerifyResponse,
    },
  },
});
