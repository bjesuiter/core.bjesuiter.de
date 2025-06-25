import "cloudflare/shims/web";
import Cloudflare from "cloudflare";
import { env } from "../../../utils/env.ts";
import { err, ok } from "neverthrow";

const cfApiClient = new Cloudflare({
  apiToken: env.CLOUDFLARE_DDNS_API_TOKEN,
});

/**
 * @param data
 *  - zoneId - a cloduflare id for the zone to change
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

  try {
    const response = await cfApiClient.dns.records.update(zoneId, {
      zone_id: zoneId,
      name: recordName,
      ttl: 120,
      type: "A",
      content: newIP,
    }).catch((e) => {
      console.error(
        `Cloudflare Record "${recordName}" IPv4 update failed: ${e}`,
      );
      throw e;
    });

    console.info(`Cloudflare Record "${recordName}" updated to IPv4: ${newIP}`);
    return response;
  } catch (err) {
    if (err instanceof Cloudflare.APIError) {
      // error is a known cloudflare api error
      if (err.errors.some((e) => e.code === 81044)) {
        console.info(
          `Cloudflare Record "${recordName}" not found, creating...`,
        );
        const response = await cfApiClient.dns.records.create({
          zone_id: zoneId,
          name: recordName,
          ttl: 120,
          type: "A",
          content: newIP,
        }).catch((e) => {
          console.error(
            `Cloudflare Record "${recordName}" creation failed: ${e}`,
          );
          throw e;
        });

        console.info(`Cloudflare Record "${recordName}" created`);
        return response;
      }

      // error is unknown cloudflare api error
      console.error(`Cloudflare API Error: 
        Status: ${err.status}
        Name: ${err.name}
        Errors: ${JSON.stringify(err.errors, null, 2)}
      `);
    }

    // default handling for unknown errors
    console.error(err);
    throw err;
  }
}
