import "cloudflare/shims/web";
import Cloudflare, { APIError } from "cloudflare";
import { env } from "../../../utils/env.ts";
import { err, ok } from "neverthrow";

// init cf api client
const cfApiClient = new Cloudflare({
  apiToken: env.CLOUDFLARE_DDNS_API_TOKEN,
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
  RecordCreationFailed = "RecordCreationFailed",
  UncatchedCfApiError = "UncatchedCfApiError",
}

/*Main functions*/

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

  // try {
  return await cfApiClient.dns.records.update(zoneId, {
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

export async function createOrUpdateDnsRecord(data: {
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
