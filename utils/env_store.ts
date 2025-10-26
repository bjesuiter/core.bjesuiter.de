import { z } from "zod/v4";

const envSchema = z.object({
  STAGE: z.enum(["local", "github_actions", "deno_deploy"]),
  CORE_ROOT_USER_EMAIL: z.email(),
  CORE_DDNS_USERNAME: z.string(),
  CORE_DDNS_PASSWORD: z.string(),
  CORE_DATABASE_URL: z.string(),
  TURSO_AUTH_TOKEN: z.string(),
});

// bjesuiter: make sure, these envs are only loaded when running on deno deploy,
// NOT when run in a github action build process!
function initEnvStore() {
  const stage = Deno.env.get("STAGE") ?? "github_actions";

  switch (stage) {
    case "deno_deploy":
      return envSchema.parse(Deno.env.toObject());
    case "github_actions":
      // no special handling anymore, just use the envs from the github action
      return envSchema.parse(Deno.env.toObject());
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
