import { defineRoute } from "$fresh/server.ts";
import argon2 from "argon2";
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

  const password_hash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16, // 64 MB
    timeCost: 3,
    parallelism: 1,
  });

  const newUser: User = {
    id: crypto.randomUUID(),
    label,
    email,
    password_hash,
  };

  await kv.set(["users", newUser.id], newUser);

  return new Response("User registered", { status: 200 });
});
