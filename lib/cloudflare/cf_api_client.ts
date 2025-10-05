import "cloudflare/shims/web";
import Cloudflare, { APIError } from "cloudflare";
import { envStore } from "@/utils/env_store.ts";
import { err, ok, ResultAsync } from "neverthrow";
import { appTracer } from "../opentelemetry/app-tracer.ts";

// TODO: FIX: This api client is the one and only for ALL users
let cfApiClientCache: Cloudflare | undefined;

export function preInitCfApiClient(
  apiToken = envStore.CLOUDFLARE_DDNS_API_TOKEN,
) {
  appTracer.startActiveSpan("preInitCfApiClient", (span) => {
    span.addEvent("Start cf client init");
    console.time("preInitCfApiClient");
    getCfApiClient(apiToken);
    span.addEvent("End cf client init");
    console.timeEnd("preInitCfApiClient");
    span.end();
  });
}
export function getCfApiClient(apiToken = envStore.CLOUDFLARE_DDNS_API_TOKEN) {
  // Don't use cache if custom apiToken provided (for multi-user support)
  if (apiToken !== envStore.CLOUDFLARE_DDNS_API_TOKEN) {
    return new Cloudflare({
      apiToken,
    });
  }

  if (!cfApiClientCache) {
    cfApiClientCache = new Cloudflare({
      apiToken,
    });
  }
  return cfApiClientCache;
}

/* Helper functions*/
function isCfApiError(err: unknown): err is APIError {
  return err instanceof Cloudflare.APIError;
}

function hasSpecificErrorCode(
  err: APIError,
  code: number,
): boolean {
  return err.errors.some((e) => e.code === code);
}

export enum DDNSUpdateErrors {
  RecordDoesNotExist = "RecordDoesNotExist",
  RecordAlreadyExists = "RecordAlreadyExists",
  RecordCreationFailed = "RecordCreationFailed",
  UncatchedCfApiError = "UncatchedCfApiError",
}

export enum GeneralCfApiErrors {
  InvalidApiKey = "InvalidApiKey",
  UnknownCfApiError = "UnknownCfApiError",
}

/*Main functions*/

export function validateCloudflareApiKey(
  apiKey: string,
): ResultAsync<true, { type: GeneralCfApiErrors; innerError: unknown }> {
  // 1. get promise
  const cfResponsePromise = getCfApiClient().user.tokens.verify({
    headers: {
      "X.Auth-Token": apiKey,
    },
  });

  // 2. create mapping function for cf api errors
  const mapCfErrors = (e: unknown) => {
    if (isCfApiError(e)) {
      return err({ type: GeneralCfApiErrors.InvalidApiKey, innerError: e });
    }
    return err({ type: GeneralCfApiErrors.UnknownCfApiError, innerError: e });
  };

  // 3. construct neverthrow ResultAsync
  const cfResponseResult = ResultAsync.fromPromise(
    cfResponsePromise,
    mapCfErrors,
  ).map(() => true as const)
    .mapErr((e) => ({
      type: GeneralCfApiErrors.UnknownCfApiError,
      innerError: e,
    }));

  // return the result
  return cfResponseResult;
}

/**
 * @param data
 * @returns result(undefined) when not found, result(recordId) if found
 *
 * Example result from cf api:
 * {
        id: "1e23bde30c2c8973fcdda3183c6cfd3d",
        name: "homeserv1.hibisk.de",
        type: "A",
        content: "87.167.95.203",
        proxiable: true,
        proxied: false,
        ttl: 120,
        settings: {},
        meta: {},
        comment: null,
        tags: [],
        created_on: "2025-06-26T08:22:49.608355Z",
        modified_on: "2025-06-26T08:22:49.608355Z"
      }
 */
export async function findDnsRecordId(data: {
  zoneId: string;
  recordName: string;
  apiToken?: string;
}) {
  const { zoneId, recordName, apiToken } = data;

  return await getCfApiClient(apiToken).dns.records.list({
    zone_id: zoneId,
    type: "A",
    name: {
      exact: recordName,
    },
  }).then((response) => {
    if (response.result.length === 0) {
      return ok(undefined);
    }
    return ok(response.result[0].id);
  }).catch((e) => {
    return err({ type: DDNSUpdateErrors.UncatchedCfApiError, innerError: e });
  });
}

/**
 * @param data
 *  - zoneId - a cloudflare id for the zone to change
 *  - recordName - the name of the record to change (like "www.example.com")
 *  - the new IPv4 to assign to this record
 * @returns A RecordResponse https://developers.cloudflare.com/api/node/resources/dns/subresources/records/models/record_response/#(schema)
 */
export async function updateDnsRecord(data: {
  zoneId: string;
  recordName: string;
  newIP: string;
  apiToken?: string;
}) {
  const { zoneId, recordName, newIP, apiToken } = data;

  const recordIdResult = await findDnsRecordId({
    zoneId,
    recordName,
    apiToken,
  });

  if (recordIdResult.isErr()) {
    return recordIdResult;
  }

  if (recordIdResult.value === undefined) {
    return err({
      type: DDNSUpdateErrors.RecordDoesNotExist,
      innerError: undefined,
    });
  }

  return await getCfApiClient(apiToken).dns.records.update(
    recordIdResult.value,
    {
      zone_id: zoneId,
      name: recordName,
      ttl: 120,
      type: "A",
      content: newIP,
    },
  ).then(() => {
    return ok(`Record ${recordName} updated successfully to IPv4: ${newIP}`);
  })
    .catch((e) => {
      if (isCfApiError(e) && hasSpecificErrorCode(e, 81058)) {
        return ok("Record already up to date");
      }

      if (isCfApiError(e) && hasSpecificErrorCode(e, 81044)) {
        return err({
          type: DDNSUpdateErrors.RecordDoesNotExist,
          innerError: e,
        });
      }

      console.error(
        `Cloudflare Record "${recordName}" IPv4 update failed: ${e}`,
      );
      return err({ type: DDNSUpdateErrors.UncatchedCfApiError, innerError: e });
    });
}

export async function createDnsRecord(data: {
  zoneId: string;
  recordName: string;
  newIP: string;
  apiToken?: string;
}) {
  const { zoneId, recordName, newIP, apiToken } = data;

  const recordIdResult = await findDnsRecordId({
    zoneId,
    recordName,
    apiToken,
  });

  if (recordIdResult.isOk()) {
    return err({
      type: DDNSUpdateErrors.RecordAlreadyExists,
      innerError: undefined,
    });
  }

  return await getCfApiClient(apiToken).dns.records.create({
    zone_id: zoneId,
    name: recordName,
    ttl: 120,
    type: "A",
    content: newIP,
  })
    .then(() => {
      return ok(
        `Record ${recordName} created successfully with IPv4: ${newIP}`,
      );
    })
    .catch((e) => {
      console.error(
        `Cloudflare Record "${recordName}" creation failed: ${e}`,
      );
      return err({
        type: DDNSUpdateErrors.RecordCreationFailed,
        innerError: e,
      });
    });
}

export async function updateOrCreateDnsRecord(data: {
  zoneId: string;
  recordName: string;
  newIP: string;
  apiToken?: string;
}) {
  const { zoneId, recordName, newIP, apiToken } = data;

  const result = await updateDnsRecord({ zoneId, recordName, newIP, apiToken });

  if (result.isOk()) {
    return result;
  }

  if (result.error.type === DDNSUpdateErrors.RecordDoesNotExist) {
    console.info(
      `Record ${recordName} does not exist, creating...`,
      result.error.innerError,
    );
    return await createDnsRecord({ zoneId, recordName, newIP, apiToken });
  }

  return result;
}
