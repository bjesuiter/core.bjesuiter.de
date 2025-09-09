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
