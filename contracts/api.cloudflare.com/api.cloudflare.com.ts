import * as v from "https://deno.land/x/valibot/mod.ts";
import { c } from "@/contracts/_contractRouter.ts";

import { verifyUserToken } from "./user/tokens/verify.ts";
import { verifyAccountToken } from "./account/account_id/verify.ts";

export const apiCloudflareCom = c.router({
  user: {
    tokens: {
      verify: verifyUserToken,
    },
  },
  account: {
    account_id: {
      verify: verifyAccountToken,
    },
  },
}, {
  baseHeaders: {
    authorization: v.string(),
  },
});
