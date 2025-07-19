import { z } from "zod/v4";

const envSchema = z.object({
  CLOUDFLARE_EMAIL: z.string(),
  CLOUDFLARE_DDNS_API_TOKEN: z.string(),
  CLOUDFLARE_ZONE_ID_HIBISK_DE: z.string(),
  CORE_ROOT_USER_EMAIL: z.email(),
  CORE_DDNS_USERNAME: z.string(),
  CORE_DDNS_PASSWORD: z.string(),
  STAGE: z.string().optional(),
});

// bjesuiter: make sure, these envs are only loaded when running on deno deploy,
// NOT when run in a github action build process!

// bjesuiter own inits
const denoDeploymentId = Deno.env.get("DENO_DEPLOYMENT_ID");
const stage = Deno.env.get("STAGE");

export const isRunningOnDenoDeploy = denoDeploymentId !== undefined &&
  denoDeploymentId.length > 0;

if (isRunningOnDenoDeploy) {
  console.debug(
    "Detected DENO_DEPLOYMENT_ID - initializing envs",
  );
}
const isRunningLocally = stage === "local";

// init envs with fake values for github actions
export const envStore = isRunningOnDenoDeploy || isRunningLocally
  ? envSchema.parse({ ...Deno.env.toObject() })
  : envSchema.parse({
    CLOUDFLARE_EMAIL: "github_actions",
    CLOUDFLARE_DDNS_API_TOKEN: "github_actions",
    CLOUDFLARE_ZONE_ID_HIBISK_DE: "github_actions",
    CORE_ROOT_USER_EMAIL: "github_actions@bjesuiter.de",
    CORE_DDNS_USERNAME: "github_actions",
    CORE_DDNS_PASSWORD: "github_actions",
  });
