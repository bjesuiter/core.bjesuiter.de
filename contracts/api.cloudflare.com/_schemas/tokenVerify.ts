import { cfEnvelope } from "./baseSchemas.ts";
import * as v from "https://deno.land/x/valibot/mod.ts";

export const cfTokenVerifyResponse = v.object({
  result: v.nullable(v.object({
    id: v.pipe(v.string(), v.maxLength(32)),
    status: v.union([
      v.literal("active"),
      v.literal("disabled"),
      v.literal("expired"),
    ]),
    expires_on: v.pipe(
      v.string(),
      v.transform((str) => new Date(str)),
      v.exactOptional(v.date()),
    ),
    not_before: v.pipe(
      v.string(),
      v.transform((str) => new Date(str)),
      v.exactOptional(v.date()),
    ),
  })),
  ...cfEnvelope.entries
});
