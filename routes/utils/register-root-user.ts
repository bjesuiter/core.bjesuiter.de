import { defineRoute } from "$fresh/server.ts";
import { hash, verify } from "@stdext/crypto/hash/argon2";
import { User } from "../../utils/user.type.ts";

const kv = await Deno.openKv();

/**
 * Utility function to register a user to the database.
 * CAUTION: everything in here MUST be hardcoded! It's a simple utility to get users into the deno kv in prod.
 */
export default defineRoute(async (req, ctx) => {
  const label = Deno.env.get("CORE_ROOT_USER_LABEL");
  if (!label) {
    return new Response("CORE_ROOT_USER_LABEL is not set", { status: 500 });
  }

  const email = Deno.env.get("CORE_ROOT_USER_EMAIL");
  if (!email) {
    return new Response("CORE_ROOT_USER_EMAIL is not set", { status: 500 });
  }

  const password = Deno.env.get("CORE_ROOT_USER_PASSWORD");
  if (!password) {
    return new Response("CORE_ROOT_USER_PASSWORD is not set", { status: 500 });
  }

  // NOTE: Memory limit for deno deploy is 512MB:
  // https://docs.deno.com/deploy/manual/pricing-and-limits/#memory-allocation
  const password_hash = hash({
    name: "argon2",
    algorithm: "argon2id",
    // NOTE: try to use default memory cost of 19456
    // https://jsr.io/@stdext/crypto/0.1.0/_wasm/crypto_hash_argon2.generated.d.mts
    // memoryCost: 2 ** 16, // 64 MB
    timeCost: 3,
    parallelism: 1,
  }, password);

  const newUser: User = {
    id: crypto.randomUUID(),
    label,
    email,
    password_hash,
  };

  await kv.set(["users", newUser.id], newUser);

  return new Response("User registered", { status: 200 });
});
