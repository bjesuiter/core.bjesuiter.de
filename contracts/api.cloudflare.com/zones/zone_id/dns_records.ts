import * as v from "https://deno.land/x/valibot/mod.ts";
import { c } from "@/contracts/_contractRouter.ts";

import { cfTextFilterOptions, cfEnvelope } from "@contracts/api.cloudflare.com/_schemas/baseSchemas.ts";
import { cfDNSTypes, cfRecord, cfRecordResponse } from "@contracts/api.cloudflare.com/_schemas/dnsSchemas.ts";

export const listDNSRecords = c.router({
  list: {
    path: "/zones/:zone_id/dns_records",
    method: "GET",
    pathParams: v.object({
      zone_id: v.pipe(v.string(), v.length(32)),
    }),
    query: v.object({
      comment: v.exactOptional(v.object({
        ...cfTextFilterOptions.entries,
        absent: v.exactOptional(v.string()),
        present: v.exactOptional(v.string()),
      })),
      tag: v.exactOptional(v.object({
        ...cfTextFilterOptions.entries,
        absent: v.exactOptional(v.string()),
        present: v.exactOptional(v.string()),
      })),
      content: v.exactOptional(cfTextFilterOptions),
      name: v.exactOptional(cfTextFilterOptions),
      direction: v.exactOptional(v.union([
        v.literal("asc"),
        v.literal("desc"),
      ]), "asc"),
      match: v.exactOptional(v.union([
        v.literal("all"),
        v.literal("any"),
      ]), "all"),
      tag_match: v.exactOptional(v.union([
        v.literal("all"),
        v.literal("any"),
      ]), "all"),
      order: v.exactOptional(v.union([
        v.literal("type"),
        v.literal("name"),
        v.literal("content"),
        v.literal("ttl"),
        v.literal("proxied"),
      ]), "type"),
      page: v.exactOptional(v.pipe(v.number(),v.minValue(1)), 1),
      per_page: v.exactOptional(v.pipe(v.number(),v.minValue(1), v.maxValue(5000000)), 100),
      proxied: v.exactOptional(v.boolean()),
      type: v.exactOptional(cfDNSTypes),
    }),
    responses: {
      200: v.object({
        ...cfEnvelope.entries,
        result: v.nullish(v.array(cfRecordResponse)),
        result_info: v.nullish(v.object({
          count: v.exactOptional(v.number()),
          page: v.exactOptional(v.number()),
          per_page: v.exactOptional(v.number()),
          total: v.exactOptional(v.number()),
        }))
      })
    },
  },
});

export const createDNSRecord = c.router({
  create: {
    path: "/zones/:zone_id/dns_records",
    method: "POST",
    pathParams: v.object({
      zone_id: v.pipe(v.string(), v.length(32)),
    }),
    body: cfRecord,
    responses: {
      200: v.object({
        ...cfEnvelope.entries,
        result: v.nullish(cfRecordResponse),
      }),
    },
  },
});

export const updateDNSRecord = c.router({
  update: {
    path: "/zones/:zone_id/dns_records/:record_id",
    method: "PUT",
    pathParams: v.object({
      zone_id: v.pipe(v.string(), v.length(32)),
      record_id: v.pipe(v.string(), v.length(32)),
    }),
    body: cfRecord,
    responses: {
      200: v.object({
        ...cfEnvelope.entries,
        result: v.nullish(cfRecordResponse),
      }),
    },
  },
});
