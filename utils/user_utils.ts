import { db } from "@/lib/db/index.ts";
import { UserDB, UsersTable } from "@/lib/db/schemas/users.table.ts";
import { eq } from "drizzle-orm";
import { err, ok, Result } from "neverthrow";
import z from "zod/v4";
import { generateSecureRandomString, hashSecret } from "./auth_helpers.ts";
import { envStore } from "./env_store.ts";
export function generateStrongPassword() {
  const password = generateSecureRandomString();
  return password;
}

export enum GetUserErrors {
  UserNotFound = "UserNotFound",
  UserInvalid = "UserInvalid",
}

export async function getUserById(
  id: string,
): Promise<Result<UserDB, GetUserErrors>> {
  const user = await db.select().from(UsersTable).where(eq(UsersTable.id, id))
    .limit(1);

  // TODO: handle db errors

  if (user.length === 0) {
    return err(GetUserErrors.UserNotFound);
  }

  if (!user[0]) {
    return err(GetUserErrors.UserInvalid);
  }

  return ok(user[0]);
}

export async function getUserByEmail(
  email: string,
): Promise<Result<UserDB, GetUserErrors>> {
  const user = await db.select().from(UsersTable).where(
    eq(UsersTable.email, email),
  )
    .limit(1);

  if (user.length === 0) {
    return err(GetUserErrors.UserNotFound);
  }

  if (!user[0]) {
    return err(GetUserErrors.UserInvalid);
  }
  return ok(user[0]);
}

export enum DeleteUserErrors {
  UserNotFound = "UserNotFound",
  UserIsProtected = "UserIsProtected",
  UserIsCurrentUser = "UserIsCurrentUser",
}

export async function deleteUser(
  email: string,
  currentUserEmail: string,
): Promise<Result<void, DeleteUserErrors>> {
  if (email === envStore.CORE_ROOT_USER_EMAIL) {
    return err(DeleteUserErrors.UserIsProtected);
  }

  if (email === currentUserEmail) {
    return err(DeleteUserErrors.UserIsCurrentUser);
  }

  const user = await db.select().from(UsersTable).where(
    eq(UsersTable.email, email),
  ).limit(1);
  if (user.length === 0) {
    return err(DeleteUserErrors.UserNotFound);
  }
  await db.delete(UsersTable).where(eq(UsersTable.email, email));
  return ok(undefined);
}

export enum RegisterUserErrors {
  UserAlreadyExists = "UserAlreadyExists",
  PasswordTooShort = "PasswordTooShort",
  EmailInvalid = "EmailInvalid",
  LabelInvalid = "LabelInvalid",
}

export async function registerUser(
  email: string | FormDataEntryValue | null,
  label: string | FormDataEntryValue | null,
  password: string | FormDataEntryValue | null,
): Promise<Result<UserDB, RegisterUserErrors>> {
  // Step 1: validate email
  const parsedEmail = z.email().toLowerCase().trim().safeParse(email);
  if (parsedEmail.success === false) {
    return err(RegisterUserErrors.EmailInvalid);
  }

  // Step 2: check if user already exists
  const userDbResult = await getUserByEmail(parsedEmail.data);
  if (userDbResult.isOk()) {
    return err(RegisterUserErrors.UserAlreadyExists);
  }

  // Step 3: validate password
  const parsedPassword = z.string().min(8).safeParse(password);
  if (parsedPassword.success === false) {
    return err(RegisterUserErrors.PasswordTooShort);
  }

  // Step 4: validate label
  const parsedLabel = z.string().min(1).safeParse(label);
  if (parsedLabel.success === false) {
    return err(RegisterUserErrors.LabelInvalid);
  }

  // Step 5: generate salt for the new user
  const salt = generateSecureRandomString();
  const passwordPlusSalt = password + salt;

  // NOTE: Memory limit for deno deploy is 512MB:
  // https://docs.deno.com/deploy/manual/pricing-and-limits/#memory-allocation
  const passwordHash = await hashSecret(passwordPlusSalt);

  const newUser: UserDB = {
    id: crypto.randomUUID(),
    label: parsedLabel.data,
    email: parsedEmail.data,
    passwordHash: passwordHash,
    passwordSalt: salt,
  };

  await db.insert(UsersTable).values({
    id: newUser.id,
    email: newUser.email,
    label: newUser.label,
    passwordHash: passwordHash,
    passwordSalt: newUser.passwordSalt,
  });

  return ok(newUser);
}
