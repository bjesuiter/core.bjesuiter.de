import * as v from "@valibot/valibot";
import { c } from "@/contracts/_contractRouter.ts";

import { cfTokenVerifyResponse } from "@/contracts/api.cloudflare.com/_schemas/tokenVerify.ts";

export const verifyAccountToken = c.router({
  verify: {
    method: "GET",
    path: "/account/:account_id/verify",
    pathParams: v.object({
      account_id: v.pipe(v.string(), v.length(32)),
    }),
    responses: {
      200: cfTokenVerifyResponse,
    },
  },
});
