import { envStore } from "@/utils/env_store.ts";
import { createClient } from "@libsql/client/web";
import { drizzle } from "drizzle-orm/libsql";

function initDb() {
  switch (envStore.STAGE) {
    case "deno_deploy": {
      const turso = createClient({
        url: envStore.CORE_DATABASE_URL,
        authToken: envStore.TURSO_AUTH_TOKEN,
      });
      return drizzle(turso, { casing: "snake_case" });
    }
    case "local": {
      // https://docs.turso.tech/features/embedded-replicas/introduction#how-it-works
      const turso = createClient({
        url: envStore.CORE_DATABASE_URL,
        authToken: envStore.TURSO_AUTH_TOKEN,
      });
      return drizzle(turso, { casing: "snake_case" });
    }

    default:
      throw new Error(`Invalid or missing stage: ${envStore.STAGE}`);
  }
}

// MAIN db INSTANCE
// -------------------
export const db = initDb();
