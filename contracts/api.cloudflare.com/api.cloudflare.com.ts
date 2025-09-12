import { c } from "@/contracts/_contractRouter.ts";
import * as v from "@valibot/valibot";

import { verifyAccountToken } from "./account/account_id/verify.ts";
import { verifyUserToken } from "./user/tokens/verify.ts";
import {
  createDNSRecord,
  listDNSRecords,
  updateDNSRecord,
} from "./zones/zone_id/dns_records.ts";

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
  zones: {
    zone_id: {
      dns_records: {
        create: createDNSRecord,
        list: listDNSRecords,
        update: updateDNSRecord,
      },
    },
  },
}, {
  baseHeaders: {
    authorization: v.string(),
  },
});
