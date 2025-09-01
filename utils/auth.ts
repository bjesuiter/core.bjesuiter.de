import { db } from "@/lib/db/index.ts";
import {
  SessionDB,
  SessionFrontend,
  SessionsTable,
} from "@/lib/db/schemas/sessions.table.ts";
import { eq } from "drizzle-orm";
import { err, ok, Result, ResultAsync } from "neverthrow";
import { Cookie } from "tough-cookie";

import { UserFrontend, UsersTable } from "../lib/db/schemas/users.table.ts";
import {
  constantTimeEqual,
  generateSecureRandomString,
  hashSecret,
} from "./auth_helpers.ts";
import { Span } from "@opentelemetry/api";

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

export interface SessionWithToken extends SessionDB {
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
  Result<{ session: SessionDB; user: UserFrontend }, SessionWithUserErrors>
> {
  const now = new Date();

  const selectPromise = db.select().from(SessionsTable)
    .where(eq(SessionsTable.id, sessionId))
    .innerJoin(
      UsersTable,
      eq(SessionsTable.userId, UsersTable.id),
    )
    .limit(1);

  const selectResult = await ResultAsync.fromPromise(
    selectPromise,
    (error: unknown) => {
      console.error(
        `getSessionWithUser for sessionId '${sessionId}' failed: ${error}`,
      );
      return SessionWithUserErrors.UnknownDbError;
    },
  );
  if (selectResult.isErr()) {
    return err(selectResult.error);
  }

  const result = selectResult.value;
  if (selectResult.value.length === 0) {
    return err(SessionWithUserErrors.SessionOrUserNotFound);
  }

  const session: SessionDB = {
    id: result[0].sessions.id,
    userId: result[0].sessions.userId,
    createdAt: result[0].sessions.createdAt,
    secretHash: result[0].sessions.secretHash,
  } satisfies SessionDB;

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
  span?: Span,
): Promise<
  Result<{ session: SessionFrontend; user: UserFrontend }, AuthErrors>
> {
  // Step 1 - analyze the request
  console.time("getSessionCookie");
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
  console.timeEnd("getSessionCookie");

  // Validate the session and query the session data + user from db
  console.time("validateSessionToken");
  const userAndSession = await validateSessionToken(sessionTokenCookie.value);
  console.timeEnd("validateSessionToken");

  if (!userAndSession) {
    console.log(
      "Session not found, expired or invalid - not authenticated",
    );
    return err(AuthErrors.SessionInvalid);
  }

  return ok(userAndSession);
}
