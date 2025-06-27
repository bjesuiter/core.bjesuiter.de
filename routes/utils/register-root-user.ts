import { defineRoute } from "$fresh/server.ts";
import argon2 from "argon2-browser";
import { User } from "@/utils/user.type.ts";
import { generateSecureRandomString } from "@/utils/auth.ts";

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

  const pass = Deno.env.get("CORE_ROOT_USER_PASSWORD");
  if (!pass) {
    return new Response("CORE_ROOT_USER_PASSWORD is not set", { status: 500 });
  }

  const salt = generateSecureRandomString();

  // NOTE: Memory limit for deno deploy is 512MB:
  // https://docs.deno.com/deploy/manual/pricing-and-limits/#memory-allocation
  // NOTE: argon2-browser usage: https://github.com/antelle/argon2-browser#nodejs-support
  const password_hash = await argon2.hash({
    // required
    pass,
    salt,
    // optional
    // time: 3, // the number of iterations
    // mem: 19456, // used memory, in KiB
    // hashLen: 24, // desired hash length
    // parallelism: 1, // desired parallelism (it won't be computed in parallel, however)
    // type: argon2.ArgonType.Argon2id, // Argon2d, Argon2i, Argon2id
    // secret: new Uint8Array([...]), // optional secret data
    // ad: new Uint8Array([...]), // optional associated data
  });

  const newUser: User = {
    id: crypto.randomUUID(),
    label,
    email,
    password_hash,
    password_salt: salt,
  };

  await kv.set(["users", newUser.id], newUser);

  return new Response("User registered", { status: 200 });
});
