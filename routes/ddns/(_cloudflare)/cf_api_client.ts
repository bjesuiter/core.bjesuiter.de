import "cloudflare/shims/web";
import Cloudflare from "cloudflare";
import { env } from "../../../utils/env.ts";

const cfApiClient = new Cloudflare({
  apiEmail: env.CLOUDFLARE_EMAIL,
  apiKey: env.CLOUDFLARE_DDNS_API_TOKEN,
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

  const response = await cfApiClient.dns.records.update(zoneId, {
    zone_id: zoneId,
    name: recordName,
    ttl: 300,
    type: "A",
    content: newIP,
  });

  return response;
}
