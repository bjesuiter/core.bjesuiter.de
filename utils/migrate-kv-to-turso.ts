import { decodeBase64 } from "@std/encoding/base64";
import { db } from "../lib/db/index.ts";
import { UsersTable } from "../lib/db/schemas/users.table.ts";
import { envStore } from "./env_store.ts";
import { User } from "./user.type.ts";
import { Buffer } from "node:buffer";

export async function migrateKvToTurso() {
  const kv = await Deno.openKv();
  const turso = db;

  const usersIterator = kv.list({ prefix: ["users"] });
  for await (const user of usersIterator) {
    const userData = user.value as User;
    await turso.insert(UsersTable).values({
      email: userData.email,
      id: userData.id,
      label: userData.label,
      passwordHash: Buffer.from(decodeBase64(userData.password_hash_b64)),
      passwordSalt: userData.password_salt,
    }).onConflictDoNothing();
  }
}
