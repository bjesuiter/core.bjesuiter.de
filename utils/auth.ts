import { kv } from "./kv.ts";
import { decodeBase64, encodeBase64 } from "@std/encoding/base64";

/**
 * This Session implementation is based on https://lucia-auth.com/sessions/basic
 */

export interface Session {
  id: string;
  userEmail: string;
  secretHash: Uint8Array; // Uint8Array is a byte array
  createdAt: Date;
}

export interface SessionWithToken extends Session {
  token: string;
}

// Token format for client: <SESSION_ID>.<SESSION_SECRET>

// Settings for this module
// -------------------------
const sessionExpiresInSeconds = 60 * 60 * 24; // 1 day

/**
 * uses deno KV to store the session
 */
export async function createSession({
  userEmail,
}: {
  userEmail: string;
}): Promise<SessionWithToken> {
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
    userEmail,
  };

  await kv.set(["sessions", session.id], {
    id,
    secretHash,
    createdAt: now,
    userEmail,
  });

  return session;
}

async function getSession(sessionId: string): Promise<Session | undefined> {
  const now = new Date();

  const result = await kv.get(["sessions", sessionId]);
  if (!result.value) {
    return undefined;
  }

  const session = result.value as Session;

  // Check expiration
  if (
    now.getTime() - session.createdAt.getTime() >=
      sessionExpiresInSeconds * 1000
  ) {
    await deleteSession(sessionId);
    return undefined;
  }

  return session;
}

export async function validateSessionToken(
  token: string,
): Promise<Session | false> {
  const tokenParts = token.split(".");
  if (tokenParts.length != 2) {
    return false;
  }
  const sessionId = tokenParts[0];
  const sessionSecret = tokenParts[1];

  const session = await getSession(sessionId);
  if (!session) {
    return false;
  }

  const tokenSecretHash = await hashSecret(sessionSecret);
  const validSecret = constantTimeEqual(tokenSecretHash, session.secretHash);
  if (!validSecret) {
    return false;
  }

  return session;
}

async function deleteSession(sessionId: string): Promise<void> {
  await kv.delete(["sessions", sessionId]);
}

/**
 * Helper functions
 */

export function generateSecureRandomString(): string {
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

export async function hashSecret(
  secret: string,
): Promise<Uint8Array> {
  const secretBytes = new TextEncoder().encode(secret);
  const secretHashBuffer = await crypto.subtle.digest("SHA-256", secretBytes);
  const uint8Array = new Uint8Array(secretHashBuffer);

  return uint8Array;
}

export function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.byteLength !== b.byteLength) {
    return false;
  }
  let c = 0;
  for (let i = 0; i < a.byteLength; i++) {
    c |= a[i] ^ b[i];
  }
  return c === 0;
}

export async function hashSecretBase64(secret: string): Promise<string> {
  const uint8Array = await hashSecret(secret);
  return encodeBase64(uint8Array);
}

export function constantTimeEqualBase64(a: string, b: string): boolean {
  const aBytes = decodeBase64(a);
  const bBytes = decodeBase64(b);
  return constantTimeEqual(aBytes, bBytes);
}
