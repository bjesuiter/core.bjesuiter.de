import "cloudflare/shims/web";
import Cloudflare, { APIError } from "cloudflare";
import { envStore } from "../../../utils/env_store.ts";
import { err, ok } from "neverthrow";

// init cf api client
const cfApiClient = new Cloudflare({
  apiToken: envStore.CLOUDFLARE_DDNS_API_TOKEN,
});

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

/*Main functions*/

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
}) {
  const { zoneId, recordName } = data;

  return await cfApiClient.dns.records.list({
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
}) {
  const { zoneId, recordName, newIP } = data;

  const recordIdResult = await findDnsRecordId({ zoneId, recordName });

  if (recordIdResult.isErr()) {
    return recordIdResult;
  }

  if (recordIdResult.value === undefined) {
    return err({
      type: DDNSUpdateErrors.RecordDoesNotExist,
      innerError: undefined,
    });
  }

  return await cfApiClient.dns.records.update(recordIdResult.value, {
    zone_id: zoneId,
    name: recordName,
    ttl: 120,
    type: "A",
    content: newIP,
  }).then(() => {
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
}) {
  const { zoneId, recordName, newIP } = data;

  const recordIdResult = await findDnsRecordId({ zoneId, recordName });

  if (recordIdResult.isOk()) {
    return err({
      type: DDNSUpdateErrors.RecordAlreadyExists,
      innerError: undefined,
    });
  }

  return await cfApiClient.dns.records.create({
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
}) {
  const { zoneId, recordName, newIP } = data;

  const result = await updateDnsRecord({ zoneId, recordName, newIP });

  if (result.isOk()) {
    return result;
  }

  if (result.error.type === DDNSUpdateErrors.RecordDoesNotExist) {
    console.info(
      `Record ${recordName} does not exist, creating...`,
      result.error.innerError,
    );
    return await createDnsRecord({ zoneId, recordName, newIP });
  }

  return result;
}
