import { c } from "@/contracts/_contractRouter.ts";
import * as v from "@valibot/valibot";

import { verifyAccountToken } from "./account/account_id/verify.ts";
import { verifyUserToken } from "./user/tokens/verify.ts";
import {
  createDNSRecord,
  listDNSRecords,
  updateDNSRecord,
} from "./zones/zone_id/dns_records.ts";

// for dummy client type export
import { initClient } from "@ts-rest/core";

export const apiCloudflareCom = c.router({
  user: {
    tokens: {
      ...verifyUserToken,
    },
  },
  account: {
    account_id: {
      ...verifyAccountToken,
    },
  },
  zones: {
    zone_id: {
      dns_records: {
        ...createDNSRecord,
        ...listDNSRecords,
        ...updateDNSRecord,
      },
    },
  },
}, {
  baseHeaders: {
    authorization: v.string(),
  },
});

// export dummy client type
const dummyCfClient = initClient(apiCloudflareCom, {
  baseUrl: "",
  baseHeaders: {
    authorization: "",
  },
});

export type cfClient = typeof dummyCfClient;
