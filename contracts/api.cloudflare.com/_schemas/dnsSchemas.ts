import * as v from "@valibot/valibot";

export const cfDNSTypes = v.union([
  v.literal("A"),
  v.literal("AAAA"),
  v.literal("CAA"),
  v.literal("CERT"),
  v.literal("CNAME"),
  v.literal("DNSKEY"),
  v.literal("DS"),
  v.literal("HTTPS"),
  v.literal("LOC"),
  v.literal("MX"),
  v.literal("NAPTR"),
  v.literal("NS"),
  v.literal("OPENPGPKEY"),
  v.literal("PTR"),
  v.literal("SMIMEA"),
  v.literal("SRV"),
  v.literal("SSHFP"),
  v.literal("SVCB"),
  v.literal("TLSA"),
  v.literal("TXT"),
  v.literal("URI"),
]);

const cfDNSRecordTypeSettings = v.object({
  ipv4_only: v.exactOptional(v.boolean()),
  ipv6_only: v.exactOptional(v.boolean()),
});

export const cfDNSRecordResponseCommon = v.object({
  id: v.pipe(v.string(), v.length(32)),
  proxiable: v.boolean(),
  created_on: v.date(),
  modified_on: v.date(),
  comment_modified_on: v.optional(v.date()),
  tags_modified_on: v.optional(v.date()),
  meta: v.unknown(),
});

const cfDNSRecordTypeCommon = v.object({
  name: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
  ttl: v.union([
    v.pipe(v.number(), v.minValue(60), v.maxValue(86400)),
    v.literal(1),
  ]),
  comment: v.exactOptional(v.string()),
  proxied: v.exactOptional(v.boolean()),
  tags: v.exactOptional(v.array(v.string())),
});

export const cfARecord = v.object({
  ...cfDNSRecordTypeCommon.entries,
  type: v.literal("A"),
  content: v.exactOptional(v.pipe(v.string(), v.ipv4())),
  settings: v.exactOptional(cfDNSRecordTypeSettings),
});

export const cfAAAARecord = v.object({
  ...cfDNSRecordTypeCommon.entries,
  type: v.literal("AAAA"),
  content: v.exactOptional(v.pipe(v.string(), v.ipv6())),
  settings: v.exactOptional(cfDNSRecordTypeSettings),
});

export const cfCNAMERecord = v.object({
  ...cfDNSRecordTypeCommon.entries,
  type: v.literal("CNAME"),
  content: v.exactOptional(v.pipe(v.string())),
  settings: v.exactOptional(v.object({
    ...cfDNSRecordTypeSettings.entries,
    flatten_cname: v.exactOptional(v.boolean()),
  })),
});

export const cfMXRecord = v.object({
  ...cfDNSRecordTypeCommon.entries,
  type: v.literal("MX"),
  content: v.exactOptional(v.string()),
  settings: v.exactOptional(v.object({
    ...cfDNSRecordTypeSettings.entries,
  })),
  priority: v.exactOptional(v.number()),
});

export const cfNSRecord = v.object({
  ...cfDNSRecordTypeCommon.entries,
  type: v.literal("NS"),
  content: v.exactOptional(v.string()),
  settings: v.exactOptional(v.object({
    ...cfDNSRecordTypeSettings.entries,
  })),
});

export const cfPTRRecord = v.object({
  ...cfDNSRecordTypeCommon.entries,
  type: v.literal("PTR"),
  content: v.exactOptional(v.string()),
  settings: v.exactOptional(v.object({
    ...cfDNSRecordTypeSettings.entries,
  })),
});

export const cfOpenPGPKEYRecord = v.object({
  ...cfDNSRecordTypeCommon.entries,
  type: v.literal("OPENPGPKEY"),
  content: v.exactOptional(v.string()),
  settings: v.exactOptional(v.object({
    ...cfDNSRecordTypeSettings.entries,
  })),
});

export const cfTXTRecord = v.object({
  ...cfDNSRecordTypeCommon.entries,
  type: v.literal("TXT"),
  content: v.exactOptional(v.string()),
  settings: v.exactOptional(v.object({
    ...cfDNSRecordTypeSettings.entries,
  })),
});

export const cfCAARecord = v.object({
  ...cfDNSRecordTypeCommon.entries,
  type: v.literal("CAA"),
  content: v.exactOptional(v.string()),
  settings: v.exactOptional(v.object({
    ...cfDNSRecordTypeSettings.entries,
  })),
  data: v.exactOptional(v.object({
    flags: v.exactOptional(v.pipe(v.number(), v.minValue(0), v.maxValue(255))),
    tag: v.exactOptional(v.string()),
    value: v.exactOptional(v.string()),
  })),
});

export const cfCERTRecord = v.object({
  ...cfDNSRecordTypeCommon.entries,
  type: v.literal("CERT"),
  content: v.exactOptional(v.string()),
  settings: v.exactOptional(v.object({
    ...cfDNSRecordTypeSettings.entries,
  })),
  data: v.exactOptional(v.object({
    algorithm: v.exactOptional(
      v.pipe(v.number(), v.minValue(0), v.maxValue(255)),
    ),
    certificate: v.exactOptional(v.string()),
    key_tag: v.exactOptional(
      v.pipe(v.number(), v.minValue(0), v.maxValue(65535)),
    ),
    type: v.exactOptional(v.pipe(v.number(), v.minValue(0), v.maxValue(65535))),
  })),
});

export const cfDNSKEYRecord = v.object({
  ...cfDNSRecordTypeCommon.entries,
  type: v.literal("DNSKEY"),
  content: v.exactOptional(v.string()),
  settings: v.exactOptional(v.object({
    ...cfDNSRecordTypeSettings.entries,
  })),
  data: v.exactOptional(v.object({
    flags: v.exactOptional(
      v.pipe(v.number(), v.minValue(0), v.maxValue(65535)),
    ),
    protocol: v.exactOptional(
      v.pipe(v.number(), v.minValue(0), v.maxValue(255)),
    ),
    algorithm: v.exactOptional(
      v.pipe(v.number(), v.minValue(0), v.maxValue(255)),
    ),
    public_key: v.exactOptional(v.string()),
  })),
});

export const cfDSRecord = v.object({
  ...cfDNSRecordTypeCommon.entries,
  type: v.literal("DS"),
  content: v.exactOptional(v.string()),
  settings: v.exactOptional(v.object({
    ...cfDNSRecordTypeSettings.entries,
  })),
  data: v.exactOptional(v.object({
    key_tag: v.exactOptional(
      v.pipe(v.number(), v.minValue(0), v.maxValue(65535)),
    ),
    algorithm: v.exactOptional(
      v.pipe(v.number(), v.minValue(0), v.maxValue(255)),
    ),
    digest_type: v.exactOptional(
      v.pipe(v.number(), v.minValue(0), v.maxValue(255)),
    ),
    digest: v.exactOptional(v.string()),
  })),
});

export const cfHTTPSRecord = v.object({
  ...cfDNSRecordTypeCommon.entries,
  type: v.literal("HTTPS"),
  content: v.exactOptional(v.string()),
  settings: v.exactOptional(v.object({
    ...cfDNSRecordTypeSettings.entries,
  })),
  data: v.exactOptional(v.object({
    priority: v.exactOptional(
      v.pipe(v.number(), v.minValue(0), v.maxValue(65535)),
    ),
    target: v.exactOptional(v.string()),
    value: v.exactOptional(v.string()),
  })),
});

// data truncated - missing params
export const cfLOCRecord = v.object({
  ...cfDNSRecordTypeCommon.entries,
  type: v.literal("LOC"),
  content: v.exactOptional(v.string()),
  settings: v.exactOptional(v.object({
    ...cfDNSRecordTypeSettings.entries,
  })),
  data: v.exactOptional(v.looseObject({
    size: v.exactOptional(
      v.pipe(v.number(), v.minValue(0), v.maxValue(90000000)),
    ),
    precision_horz: v.exactOptional(
      v.pipe(v.number(), v.minValue(0), v.maxValue(90000000)),
    ),
    precision_vert: v.exactOptional(
      v.pipe(v.number(), v.minValue(0), v.maxValue(90000000)),
    ),
  })),
});

export const cfNAPTRRecord = v.object({
  ...cfDNSRecordTypeCommon.entries,
  type: v.literal("NAPTR"),
  content: v.exactOptional(v.string()),
  settings: v.exactOptional(v.object({
    ...cfDNSRecordTypeSettings.entries,
  })),
  data: v.exactOptional(v.object({
    order: v.exactOptional(
      v.pipe(v.number(), v.minValue(0), v.maxValue(65535)),
    ),
    preference: v.exactOptional(
      v.pipe(v.number(), v.minValue(0), v.maxValue(65535)),
    ),
    flags: v.exactOptional(v.string()),
    service: v.exactOptional(v.string()),
    regexp: v.exactOptional(v.string()),
    replacement: v.exactOptional(v.string()),
  })),
});

export const cfSMIMEARecord = v.object({
  ...cfDNSRecordTypeCommon.entries,
  type: v.literal("SMIMEA"),
  content: v.exactOptional(v.string()),
  settings: v.exactOptional(v.object({
    ...cfDNSRecordTypeSettings.entries,
  })),
  data: v.exactOptional(v.object({
    usage: v.exactOptional(v.pipe(v.number(), v.minValue(0), v.maxValue(255))),
    selector: v.exactOptional(
      v.pipe(v.number(), v.minValue(0), v.maxValue(255)),
    ),
    matching_type: v.exactOptional(
      v.pipe(v.number(), v.minValue(0), v.maxValue(255)),
    ),
    certificate: v.exactOptional(v.string()),
  })),
});

export const cfSRVRecord = v.object({
  ...cfDNSRecordTypeCommon.entries,
  type: v.literal("SRV"),
  content: v.exactOptional(v.string()),
  settings: v.exactOptional(v.object({
    ...cfDNSRecordTypeSettings.entries,
  })),
  data: v.exactOptional(v.object({
    priority: v.exactOptional(
      v.pipe(v.number(), v.minValue(0), v.maxValue(65535)),
    ),
    weight: v.exactOptional(
      v.pipe(v.number(), v.minValue(0), v.maxValue(65535)),
    ),
    port: v.exactOptional(v.pipe(v.number(), v.minValue(0), v.maxValue(65535))),
    target: v.exactOptional(v.string()),
  })),
});

export const cfSSHFPRecord = v.object({
  ...cfDNSRecordTypeCommon.entries,
  type: v.literal("SSHFP"),
  content: v.exactOptional(v.string()),
  settings: v.exactOptional(v.object({
    ...cfDNSRecordTypeSettings.entries,
  })),
  data: v.exactOptional(v.object({
    algorithm: v.exactOptional(
      v.pipe(v.number(), v.minValue(0), v.maxValue(255)),
    ),
    type: v.exactOptional(v.pipe(v.number(), v.minValue(0), v.maxValue(255))),
    fingerprint: v.exactOptional(v.string()),
  })),
});

export const cfSVCBRecord = v.object({
  ...cfDNSRecordTypeCommon.entries,
  type: v.literal("SVCB"),
  content: v.exactOptional(v.string()),
  settings: v.exactOptional(v.object({
    ...cfDNSRecordTypeSettings.entries,
  })),
  data: v.exactOptional(v.object({
    priority: v.exactOptional(
      v.pipe(v.number(), v.minValue(0), v.maxValue(65535)),
    ),
    target: v.exactOptional(v.string()),
    value: v.exactOptional(v.string()),
  })),
});

export const cfTLSARecord = v.object({
  ...cfDNSRecordTypeCommon.entries,
  type: v.literal("TLSA"),
  content: v.exactOptional(v.string()),
  settings: v.exactOptional(v.object({
    ...cfDNSRecordTypeSettings.entries,
  })),
  data: v.exactOptional(v.object({
    usage: v.exactOptional(v.pipe(v.number(), v.minValue(0), v.maxValue(255))),
    selector: v.exactOptional(
      v.pipe(v.number(), v.minValue(0), v.maxValue(255)),
    ),
    matching_type: v.exactOptional(
      v.pipe(v.number(), v.minValue(0), v.maxValue(255)),
    ),
    certificate: v.exactOptional(v.string()),
  })),
});

export const cfURIRecord = v.object({
  ...cfDNSRecordTypeCommon.entries,
  type: v.literal("URI"),
  content: v.exactOptional(v.string()),
  settings: v.exactOptional(v.object({
    ...cfDNSRecordTypeSettings.entries,
  })),
  data: v.exactOptional(v.object({
    weight: v.exactOptional(
      v.pipe(v.number(), v.minValue(0), v.maxValue(65535)),
    ),
    target: v.exactOptional(v.string()),
  })),
});

export const cfRecordResponse = v.union([
  v.object({ ...cfARecord.entries, ...cfDNSRecordResponseCommon.entries }),
  v.object({ ...cfAAAARecord.entries, ...cfDNSRecordResponseCommon.entries }),
  v.object({ ...cfCNAMERecord.entries, ...cfDNSRecordResponseCommon.entries }),
  v.object({ ...cfMXRecord.entries, ...cfDNSRecordResponseCommon.entries }),
  v.object({ ...cfNSRecord.entries, ...cfDNSRecordResponseCommon.entries }),
  v.object({
    ...cfOpenPGPKEYRecord.entries,
    ...cfDNSRecordResponseCommon.entries,
  }),
  v.object({ ...cfPTRRecord.entries, ...cfDNSRecordResponseCommon.entries }),
  v.object({ ...cfTXTRecord.entries, ...cfDNSRecordResponseCommon.entries }),
  v.object({ ...cfCAARecord.entries, ...cfDNSRecordResponseCommon.entries }),
  v.object({ ...cfCERTRecord.entries, ...cfDNSRecordResponseCommon.entries }),
  v.object({ ...cfDNSKEYRecord.entries, ...cfDNSRecordResponseCommon.entries }),
  v.object({ ...cfDSRecord.entries, ...cfDNSRecordResponseCommon.entries }),
  v.object({ ...cfHTTPSRecord.entries, ...cfDNSRecordResponseCommon.entries }),
  v.object({ ...cfLOCRecord.entries, ...cfDNSRecordResponseCommon.entries }),
  v.object({ ...cfNAPTRRecord.entries, ...cfDNSRecordResponseCommon.entries }),
  v.object({ ...cfSMIMEARecord.entries, ...cfDNSRecordResponseCommon.entries }),
  v.object({ ...cfSRVRecord.entries, ...cfDNSRecordResponseCommon.entries }),
  v.object({ ...cfSSHFPRecord.entries, ...cfDNSRecordResponseCommon.entries }),
  v.object({ ...cfSVCBRecord.entries, ...cfDNSRecordResponseCommon.entries }),
  v.object({ ...cfTLSARecord.entries, ...cfDNSRecordResponseCommon.entries }),
  v.object({ ...cfURIRecord.entries, ...cfDNSRecordResponseCommon.entries }),
]);

export const cfRecord = v.union([
  cfARecord,
  cfAAAARecord,
  cfCNAMERecord,
  cfMXRecord,
  cfNSRecord,
  cfOpenPGPKEYRecord,
  cfPTRRecord,
  cfTXTRecord,
  cfCAARecord,
  cfCERTRecord,
  cfDNSKEYRecord,
  cfDSRecord,
  cfHTTPSRecord,
  cfLOCRecord,
  cfNAPTRRecord,
  cfSMIMEARecord,
  cfSRVRecord,
  cfSSHFPRecord,
  cfSVCBRecord,
  cfTLSARecord,
  cfURIRecord,
]);
