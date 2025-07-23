// NOTE: All paths are relative to the CWD running commands on this config
// NOTE: This config does only exist to be able to use drizzle-kit studio with the production db locally
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "turso",
  schema: "./lib/db/schemas",
  dbCredentials: {
    url: Deno.env.get("LOCAL_DRIZZLE_STUDIO_DB_URL")!,
    authToken: Deno.env.get("LOCAL_DRIZZLE_STUDIO_DB_AUTH")!,
  },
  casing: "snake_case",
});
