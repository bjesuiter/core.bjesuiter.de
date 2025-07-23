import { envStore } from "@/utils/env_store.ts";
import { createClient } from "@libsql/client/web";
import { drizzle } from "drizzle-orm/libsql";
import { UsersTable } from "./schemas/users.table.ts";

function initDb() {
  switch (envStore.STAGE) {
    case "deno_deploy": {
      const turso = createClient({
        url: envStore.CORE_DATABASE_URL,
        authToken: envStore.TURSO_AUTH_TOKEN,
      });
      return drizzle(turso);
    }
    case "local": {
      // https://docs.turso.tech/features/embedded-replicas/introduction#how-it-works
      const turso = createClient({
        url: envStore.CORE_DATABASE_URL,
        authToken: envStore.TURSO_AUTH_TOKEN,
      });
      return drizzle(turso);
    }
    case "github_actions": {
      // TODO: Test if this breaks
      const in_memory_sqlite = {
        connection: ":memory:",
        schema: {
          users: UsersTable,
        },
      };
      return drizzle(in_memory_sqlite);
    }
    default:
      throw new Error(`Invalid or missing stage: ${envStore.STAGE}`);
  }
}

export const db = initDb();
