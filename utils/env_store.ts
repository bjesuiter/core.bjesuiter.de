import { z } from "zod/v4";

const envSchema = z.object({
  STAGE: z.enum(["local", "github_actions", "deno_deploy"]),
  CLOUDFLARE_EMAIL: z.string(),
  CLOUDFLARE_DDNS_API_TOKEN: z.string(),
  CLOUDFLARE_ZONE_ID_HIBISK_DE: z.string(),
  CORE_ROOT_USER_EMAIL: z.email(),
  CORE_DDNS_USERNAME: z.string(),
  CORE_DDNS_PASSWORD: z.string(),
  TURSO_DATABASE_URL: z.string(),
  TURSO_AUTH_TOKEN: z.string(),
});

// bjesuiter: make sure, these envs are only loaded when running on deno deploy,
// NOT when run in a github action build process!
function initEnvStore() {
  const stage = Deno.env.get("STAGE");

  switch (stage) {
    case "deno_deploy":
      return envSchema.parse(Deno.env.toObject());
    case "github_actions":
      return envSchema.parse({
        STAGE: "github_actions",
        CLOUDFLARE_EMAIL: "github_actions",
        CLOUDFLARE_DDNS_API_TOKEN: "github_actions",
        CLOUDFLARE_ZONE_ID_HIBISK_DE: "github_actions",
        CORE_ROOT_USER_EMAIL: "github_actions@bjesuiter.de",
        CORE_DDNS_USERNAME: "github_actions",
        CORE_DDNS_PASSWORD: "github_actions",
        TURSO_DATABASE_URL: "github_actions",
        TURSO_AUTH_TOKEN: "github_actions",
      });
    case "local":
      return envSchema.parse(Deno.env.toObject());
    default:
      throw new Error(`Invalid or missing stage: ${stage}`);
  }
}

export const envStore = initEnvStore();

// some shortcuts
export const isRunningOnDenoDeploy = envStore.STAGE === "deno_deploy";
export const isRunningLocally = envStore.STAGE === "local";
