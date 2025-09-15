import * as v from '@valibot/valibot';
import { c } from "@/contracts/_contractRouter.ts";

export enum HostingAPIEnvelopeStatus {
  SUCCESS = "success",
  PENDING = "pending",
  ERROR = "error",
}

export enum HostingAPIFilterRelation {
  EQUAL = "equal",
  UNEQUAL = "unequal",
  GREATER = "greater",
  LESS = "less",
  GREATER_EQUAL = "greaterEqual",
  LESS_EQUAL = "lessEqual",
}

export const hostingAPIMetadata = v.optional(v.object({
    clientTransactionId: v.optional(v.string()),
    serverTransactionId: v.optional(v.string()),
  }));

export const hostingAPIRequestEnvelopeSchema = v.object({
  metadata: hostingAPIMetadata,
  authToken: v.string(),
  ownerAccountId: v.optional(v.string()),
});

export const hostingEnvelopeSchema = v.object({
  success: v.union([
    v.literal(HostingAPIEnvelopeStatus.SUCCESS),
    v.literal(HostingAPIEnvelopeStatus.PENDING),
    v.literal(HostingAPIEnvelopeStatus.ERROR),
  ]),
  metadata: hostingAPIMetadata,
});


export const hostingFilterSchema = v.object({
  field: v.string(),
  value: v.string(),
  relation: v.optional(v.union([
    v.literal(HostingAPIFilterRelation.EQUAL),
    v.literal(HostingAPIFilterRelation.UNEQUAL),
    v.literal(HostingAPIFilterRelation.GREATER),
    v.literal(HostingAPIFilterRelation.LESS),
    v.literal(HostingAPIFilterRelation.GREATER_EQUAL),
    v.literal(HostingAPIFilterRelation.LESS_EQUAL),
  ]))
});

type hostingApiFilterChain = {
  subFilter: (hostingApiFilterChain | v.InferOutput<typeof hostingFilterSchema>)[]; 
  subFilterConnective: "AND" | "OR";
}

export const hostingFilterChainSchema: v.GenericSchema<hostingApiFilterChain> = v.object({
  subFilter: v.array(v.lazy(() => hostingFilterChainSchema)),
  subFilterConnective: v.union([v.literal("AND"), v.literal("OR")]),
});

export const hostingFilterSortSchema = v.object({
  limit: v.optional(v.number(), 100),
  page: v.optional(v.number()),
  sort: v.optional(v.object({
    field: v.string(),
    order: v.union([v.literal("ASC"), v.literal("DESC")]),
  })),
});
