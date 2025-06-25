import { z } from "zod/v4";

const envSchema = z.object({
  CLOUDFLARE_API_KEY: z.string().optional(),
  CLOUDFLARE_API_EMAIL: z.string().optional(),
  CLOUDFLARE_API_ZONE_ID: z.string().optional(),
  CORE_DDNS_USERNAME: z.string(),
  CORE_DDNS_PASSWORD: z.string(),
});

export const env = envSchema.parse(Deno.env.toObject());
