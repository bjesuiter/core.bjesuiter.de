import { kv } from "./kv.ts";
import { User } from "./user.type.ts";
import { generateSecureRandomString, hashSecretBase64 } from "./auth.ts";
import { err, ok, Result } from "neverthrow";

export function generateStrongPassword() {
  // TODO: @bjesuiter: check if this is a good fit for the password generator!
  const password = generateSecureRandomString();
  return password;
}

export enum RegisterUserErrors {
  UserAlreadyExists = "UserAlreadyExists",
  PasswordTooShort = "PasswordTooShort",
}

export async function registerUser(
  email: string,
  label: string,
  password: string,
): Promise<Result<User, RegisterUserErrors>> {
  const user = await kv.get<User>(["users", email]);

  if (!user.value === null) {
    return err(RegisterUserErrors.UserAlreadyExists);
  }

  if (password.length < 8) {
    return err(RegisterUserErrors.PasswordTooShort);
  }

  // generate salt for the new user
  const salt = generateSecureRandomString();
  const passwordPlusSalt = password + salt;

  // NOTE: Memory limit for deno deploy is 512MB:
  // https://docs.deno.com/deploy/manual/pricing-and-limits/#memory-allocation
  const passwordHashB64 = await hashSecretBase64(passwordPlusSalt);

  const newUser: User = {
    id: crypto.randomUUID(),
    label,
    email,
    password_hash_b64: passwordHashB64,
    password_salt: salt,
  };

  await kv.set(["users", newUser.email], newUser);

  return ok(newUser);
}
