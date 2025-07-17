import { kv } from "./kv.ts";
import { User } from "./user.type.ts";
import { generateSecureRandomString, hashSecretBase64 } from "./auth.ts";
import { err, ok, Result } from "neverthrow";
import z from "zod/v4";

export function generateStrongPassword() {
  // TODO: @bjesuiter: check if this is a good fit for the password generator!
  const password = generateSecureRandomString();
  return password;
}

export enum GetUserErrors {
  UserNotFound = "UserNotFound",
}

export async function getUser(
  email: string,
): Promise<Result<User, GetUserErrors>> {
  const user = await kv.get<User>(["users", email]);
  if (!user.value) {
    return err(GetUserErrors.UserNotFound);
  }
  return ok(user.value);
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
): Promise<Result<User, RegisterUserErrors>> {
  // Step 1: validate email
  const parsedEmail = z.email().safeParse(email);
  if (parsedEmail.success === false) {
    return err(RegisterUserErrors.EmailInvalid);
  }

  // Step 2: check if user already exists
  const user = await kv.get<User>(["users", parsedEmail.data]);
  if (!user.value === null) {
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
  const passwordHashB64 = await hashSecretBase64(passwordPlusSalt);

  const newUser: User = {
    id: crypto.randomUUID(),
    label: parsedLabel.data,
    email: parsedEmail.data,
    password_hash_b64: passwordHashB64,
    password_salt: salt,
  };

  await kv.set(["users", newUser.email], newUser);

  return ok(newUser);
}
