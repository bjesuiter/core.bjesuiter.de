import { decodeBase64, encodeBase64 } from "@std/encoding/base64";
import { err, ok, Result } from "neverthrow";
import { Cookie } from "tough-cookie";
import { User, userSchema } from "./user.type.ts";
import { db } from "../lib/db/index.ts";
import { SessionsTable } from "../lib/db/schemas/sessions.table.ts";
import { Buffer } from "node:buffer";
import { eq } from "drizzle-orm";
import { UsersTable } from "../lib/db/schemas/users.table.ts";
import { getUserById, GetUserErrors } from "./user_utils.ts";

/**
 * This Session implementation is based on https://lucia-auth.com/sessions/basic
 */

export interface Session {
  id: string;
  userId: string;
  secretHash: Uint8Array; // Uint8Array is a byte array
  createdAt: Date;
}

export interface SessionWithToken extends Session {
  token: string;
}

// Token format for client: <SESSION_ID>.<SESSION_SECRET>

// The error type enum for the auth module
export enum AuthErrors {
  NoSessionTokenCookie = "NoSessionTokenCookie",
  SessionTokenInvalid = "SessionTokenInvalid",
  SessionNotFoundInDb = "SessionNotFoundInDb",
  UserNotFoundInDb = "UserNotFoundInDb",
  UserInvalidInDb = "UserInvalidInDb",
}

// Settings for this module
// -------------------------
const sessionExpiresInSeconds = 60 * 60 * 24; // 1 day

/**
 * uses deno KV to store the session
 */
export async function createSession({
  userId,
}: {
  userId: string;
}): Promise<SessionWithToken> {
  const now = new Date();
  const id = generateSecureRandomString();
  const secret = generateSecureRandomString();

  const token = id + "." + secret;

  const session: SessionWithToken = {
    id,
    secretHash: await hashSecret(secret),
    createdAt: now,
    token,
    userId,
  };

  await db.insert(SessionsTable).values({
    id: session.id,
    secretHash: Buffer.from(session.secretHash),
    createdAt: now.toISOString(),
    userId,
  });

  return session;
}

async function getSession(sessionId: string): Promise<Session | undefined> {
  const now = new Date();

  const result = await db.select().from(SessionsTable).where(
    eq(SessionsTable.id, sessionId),
  ).limit(1);

  if (result.length === 0) {
    return undefined;
  }

  const session: Session = {
    id: result[0].id,
    userId: result[0].userId,
    secretHash: new Uint8Array(result[0].secretHash),
    createdAt: new Date(result[0].createdAt),
  };

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

export async function deleteSession(sessionId: string): Promise<void> {
  await db.delete(SessionsTable).where(eq(SessionsTable.id, sessionId));
}

/**
 * High-level functions
 */

export async function isRequestAuthenticated(
  req: Request,
): Promise<Result<{ session: Session; user: User }, AuthErrors>> {
  // Step 1 - analyze the request
  const reqCookies = req.headers.get("cookie")?.split(";").map(
    (cookieString) => {
      return Cookie.parse(cookieString);
    },
  );

  const sessionTokenCookie = reqCookies?.find(
    (cookie) => cookie?.key === "session_token",
  );

  if (!sessionTokenCookie) {
    console.log("No session token cookie found - not authenticated");
    return err(AuthErrors.NoSessionTokenCookie);
  }

  const session = await validateSessionToken(sessionTokenCookie.value);
  if (!session || !session.userId) {
    console.log(
      "Session token is invalid, session expired or session not found - not authenticated",
    );
    return err(AuthErrors.SessionTokenInvalid);
  }

  const userAndSession = (await getUserById(session.userId)).match(
    (user) => ok({ session, user }),
    (error) => {
      if (error === GetUserErrors.UserNotFound) {
        console.error(`User ${session.userId} was not found`);
        return err(AuthErrors.UserNotFoundInDb);
      }
      if (error === GetUserErrors.UserInvalid) {
        console.error(`User ${session.userId} was found in db, but is invalid`);
        return err(AuthErrors.UserInvalidInDb);
      }
      return err(error);
    },
  );

  return userAndSession;
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
