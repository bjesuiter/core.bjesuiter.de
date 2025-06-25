import { z } from "zod/v4";

const envSchema = z.object({
  CLOUDFLARE_EMAIL: z.string(),
  CLOUDFLARE_DDNS_API_TOKEN: z.string(),
  CLOUDFLARE_ZONE_ID_HIBISK_DE: z.string(),
  CORE_DDNS_USERNAME: z.string(),
  CORE_DDNS_PASSWORD: z.string(),
});

export const env = envSchema.parse(Deno.env.toObject());
