import { z } from "zod/v4";

// This dotenv loader is needed (for now)
// because the .env file is not loaded by default
// in vite when running in deno, probavly due to being run with a wrong basepath
import "jsr:@std/dotenv/load";

const envSchema = z.object({
  STAGE: z.enum(["local", "github_actions", "deno_deploy"]),
  CLOUDFLARE_EMAIL: z.string(),
  CLOUDFLARE_DDNS_API_TOKEN: z.string(),
  CLOUDFLARE_ZONE_ID_HIBISK_DE: z.string(),
  CORE_ROOT_USER_EMAIL: z.email(),
  CORE_DDNS_USERNAME: z.string(),
  CORE_DDNS_PASSWORD: z.string(),
  CORE_DATABASE_URL: z.string(),
  TURSO_AUTH_TOKEN: z.string(),
});

// bjesuiter: make sure, these envs are only loaded when running on deno deploy,
// NOT when run in a github action build process!
function initEnvStore(envs: Record<string, string>) {
  // legacy: Deno.env.get("STAGE")
  const stage = envs["STAGE"] ??
    "github_actions";

  switch (stage) {
    case "deno_deploy":
      return envSchema.parse(envs);
    case "github_actions":
      // return envSchema.parse({
      //   STAGE: "github_actions",
      //   CLOUDFLARE_EMAIL: "github_actions",
      //   CLOUDFLARE_DDNS_API_TOKEN: "github_actions",
      //   CLOUDFLARE_ZONE_ID_HIBISK_DE: "github_actions",
      //   CORE_ROOT_USER_EMAIL: "github_actions@bjesuiter.de",
      //   CORE_DDNS_USERNAME: "github_actions",
      //   CORE_DDNS_PASSWORD: "github_actions",
      //   CORE_DATABASE_URL: "github_actions",
      //   TURSO_AUTH_TOKEN: "github_actions",
      // });
      // no special handling anymore, just use the envs from the github action
      return envSchema.parse(envs);
    case "local":
      return envSchema.parse(envs);
    default:
      throw new Error(`Invalid or missing stage: ${stage}`);
  }
}

export const envStore = initEnvStore(Deno.env.toObject());

// some shortcuts
export const isRunningOnDenoDeploy = envStore.STAGE === "deno_deploy";
export const isRunningLocally = envStore.STAGE === "local";
