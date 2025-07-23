// NOTE: all paths are relative to the CWD running commands on this config
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "turso",
  schema: "./lib/db/schemas",
  dbCredentials: {
    url: Deno.env.get("CORE_DATABASE_URL")!,
    authToken: Deno.env.get("TURSO_AUTH_TOKEN")!,
  },
  casing: "snake_case",
  strict: true,
});
