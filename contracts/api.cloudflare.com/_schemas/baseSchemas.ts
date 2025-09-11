import * as v from "https://deno.land/x/valibot/mod.ts";

export const cfApiError = v.object({
  code: v.pipe(v.number(), v.minValue(1000)),
  message: v.string(),
  documentation_url: v.exactOptional(v.string()),
  source: v.exactOptional(v.object({
    pointer: v.exactOptional(v.string()),
  })),
});

export const cfApiMessage = v.object({
  code: v.pipe(v.number(), v.minValue(1000)),
  message: v.string(),
  documentation_url: v.exactOptional(v.string()),
  source: v.exactOptional(v.object({
    pointer: v.exactOptional(v.string()),
  })),
});

export const cfTextFilterOptions = v.object({
  contains: v.exactOptional(v.string()),
  endswith: v.exactOptional(v.string()),
  exact: v.exactOptional(v.string()),
  startswith: v.exactOptional(v.string()),
});

export const cfEnvelope = v.object({
  errors: v.array(cfApiError),
  messages: v.array(cfApiMessage),
  success: v.boolean()
})
