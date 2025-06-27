import { kv } from "./kv.ts";

/**
 * This Session implementation is based on https://lucia-auth.com/sessions/basic
 */

export interface Session {
  id: string;
  secretHash: Uint8Array; // Uint8Array is a byte array
  createdAt: Date;
}

export interface SessionWithToken extends Session {
  token: string;
}

// Token format for client: <SESSION_ID>.<SESSION_SECRET>

function generateSecureRandomString(): string {
  // Human readable alphabet (a-z, 0-9 without l, o, 0, 1 to avoid confusion)
  const alphabet = "abcdefghijklmnpqrstuvwxyz23456789";

  // Generate 24 bytes = 192 bits of entropy.
  // We're only going to use 5 bits per byte so the total entropy will be 192 * 5 / 8 = 120 bits
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);

  let id = "";
  for (let i = 0; i < bytes.length; i++) {
    // >> 3 s"removes" the right-most 3 bits of the byte
    id += alphabet[bytes[i] >> 3];
  }
  return id;
}

async function hashSecret(secret: string): Promise<Uint8Array> {
  const secretBytes = new TextEncoder().encode(secret);
  const secretHashBuffer = await crypto.subtle.digest("SHA-256", secretBytes);
  return new Uint8Array(secretHashBuffer);
}

const sessionExpiresInSeconds = 60 * 60 * 24; // 1 day

/**
 * uses deno KV to store the session
 */
export async function createSession(): Promise<SessionWithToken> {
  const now = new Date();

  const id = generateSecureRandomString();
  const secret = generateSecureRandomString();
  const secretHash = await hashSecret(secret);

  const token = id + "." + secret;

  const session: SessionWithToken = {
    id,
    secretHash,
    createdAt: now,
    token,
  };

  await kv.set(["sessions", session.id], {
    id,
    secretHash,
    createdAt: Math.floor(session.createdAt.getTime() / 1000),
  });

  return session;
}
