import { db } from "@/lib/db/index.ts";
import {
  Session,
  SessionFrontend,
  SessionsTable,
} from "@/lib/db/schemas/sessions.table.ts";
import { decodeBase64, encodeBase64 } from "@std/encoding/base64";
import { eq } from "drizzle-orm";
import { err, ok, Result } from "neverthrow";
import { Cookie } from "tough-cookie";

import { UserFrontend, UsersTable } from "../lib/db/schemas/users.table.ts";

/**
 * This Session implementation is based on https://lucia-auth.com/sessions/basic
 */

// Not needed anymore, we use the Session type from the db schema - TODO: delete later
// export interface Session {
//   id: string;
//   userId: string;
//   secretHash: Uint8Array; // Uint8Array is a byte array
//   createdAt: Date;
// }

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
    secretHash: session.secretHash,
    createdAt: now,
    userId,
  });

  return session;
}

export enum SessionWithUserErrors {
  UnknownDbError = "UnknownDbError",
  SessionOrUserNotFound = "SessionOrUserNotFound",
  SessionExpired = "SessionExpired",
}

/**
 * Gets a session from the db with the user that owns it
 * - is an optimization to avoid getting the session first and needing another query to get the user
 * @param sessionId
 * @returns
 */
async function getSessionWithUser(
  sessionId: string,
): Promise<
  Result<{ session: Session; user: UserFrontend }, SessionWithUserErrors>
> {
  const now = new Date();

  const result = await db.select().from(SessionsTable)
    .where(eq(SessionsTable.id, sessionId))
    .innerJoin(
      UsersTable,
      eq(SessionsTable.userId, UsersTable.id),
    )
    .limit(1);

  if (result.length === 0) {
    return err(SessionWithUserErrors.SessionOrUserNotFound);
  }

  const session: Session = {
    id: result[0].sessions.id,
    userId: result[0].sessions.userId,
    createdAt: result[0].sessions.createdAt,
    secretHash: result[0].sessions.secretHash,
  } satisfies Session;

  const user = {
    id: result[0].users.id,
    label: result[0].users.label,
    email: result[0].users.email,
  } satisfies UserFrontend;

  // Check expiration
  if (
    now.getTime() - session.createdAt.getTime() >=
      sessionExpiresInSeconds * 1000
  ) {
    await deleteSession(sessionId);
    return err(SessionWithUserErrors.SessionExpired);
  }

  return ok({ session, user });
}

export async function validateSessionToken(
  token: string,
): Promise<{ session: SessionFrontend; user: UserFrontend } | false> {
  const tokenParts = token.split(".");
  if (tokenParts.length != 2) {
    return false;
  }
  const sessionId = tokenParts[0];
  const sessionSecret = tokenParts[1];

  const sessionWithUserResult = await getSessionWithUser(sessionId);
  if (sessionWithUserResult.isErr()) {
    console.error(
      `getSessionWithUser for sessionId '${sessionId}' failed: ${sessionWithUserResult.error}`,
    );
    return false;
  }
  const { session, user } = sessionWithUserResult.value;

  const tokenSecretHash = await hashSecret(sessionSecret);
  const validSecret = constantTimeEqual(tokenSecretHash, session.secretHash);
  if (!validSecret) {
    return false;
  }

  const sessionFrontend: SessionFrontend = {
    id: session.id,
    userId: session.userId,
    createdAt: session.createdAt,
  };

  return { session: sessionFrontend, user };
}

export async function deleteSession(sessionId: string): Promise<void> {
  await db.delete(SessionsTable).where(eq(SessionsTable.id, sessionId));
}

/**
 * High-level functions
 */

// The error type enum for the auth module
export enum AuthErrors {
  NoSessionTokenCookie = "NoSessionTokenCookie",
  SessionInvalid = "SessionInvalid",
  SessionNotFoundInDb = "SessionNotFoundInDb",
  UserNotFoundInDb = "UserNotFoundInDb",
  UserInvalidInDb = "UserInvalidInDb",
}

export async function isRequestAuthenticated(
  req: Request,
): Promise<
  Result<{ session: SessionFrontend; user: UserFrontend }, AuthErrors>
> {
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

  const userAndSession = await validateSessionToken(sessionTokenCookie.value);
  if (!userAndSession) {
    console.log(
      "Session not found, expired or invalid - not authenticated",
    );
    return err(AuthErrors.SessionInvalid);
  }

  return ok(userAndSession);
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
