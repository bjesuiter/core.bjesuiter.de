import { Card } from "@/components/Card.tsx";
import { hashSecret } from "@/utils/auth.ts";
import { userSchema } from "@/utils/user.type.ts";
import { Cookie } from "tough-cookie";
import z from "zod/v4";
import { PasswortInput } from "../islands/ui/PasswortInputSignal.tsx";
import { define } from "../lib/fresh/defineHelpers.ts";
import { constantTimeEqual, createSession } from "../utils/auth.ts";
import { isRunningOnDenoDeploy } from "../utils/env_store.ts";
import { getUserByEmail } from "../utils/user_utils.ts";

export const handler = define.handlers({
  /**
   * When /login is requested with GET, simply render the page
   * @bjesuiter: if no GET handler is defined, the page will auto-render
   */

  /**
   * When /login is requested with POST, validate the form data and redirect to /home page
   */
  async POST(ctx) {
    const req = ctx.req;
    const form = await req.formData();
    const email = form.get("email")?.toString();
    const password = form.get("password")?.toString();

    const parsedEmail = z.email().toLowerCase().trim().safeParse(email);
    if (!parsedEmail.success) {
      return new Response(
        "Email is required and must be a valid e-mail address",
        {
          status: 400,
        },
      );
    }

    const parsedPassword = z.string().safeParse(password);
    if (!parsedPassword.success) {
      return new Response(
        "Password is required and must be at least 8 characters long",
        {
          status: 400,
        },
      );
    }

    const userDbResult = await getUserByEmail(parsedEmail.data);
    if (userDbResult.isErr()) {
      console.error(`User "${parsedEmail.data}" was not found`);
      // CAUTION: Returning 401 here instead of 404 to avoid leaking information about the existence of the user
      return new Response("User or password is incorrect", { status: 401 });
    }
    const user = userSchema.safeParse(userDbResult.value);
    if (!user.success) {
      console.error(
        `User "${parsedEmail.data}" was found in db, but is invalid: ${user.error.message}`,
      );
      return new Response("User or password is incorrect", { status: 401 });
    }

    const passPlusSalt = parsedPassword.data + user.data.password_salt;
    const reqPasswordHash = await hashSecret(passPlusSalt);
    const dbPasswordHash = user.data.password_hash;
    const valid = constantTimeEqual(reqPasswordHash, dbPasswordHash);

    if (!valid) {
      console.error(`User ${email} provided wrong password`);
      return new Response("User or password is incorrect", { status: 401 });
    }

    const session = await createSession({ userId: user.data.id });
    // store cookie like this:
    // https://lucia-auth.com/sessions/basic#:~:text=0%3B%0A%7D-,Client%2Dside%20storage,-For%20most%20websites
    const cookie = new Cookie({
      key: "session_token",
      value: session.token,
      maxAge: 86400, // 1 day, in seconds
      httpOnly: true,
      secure: isRunningOnDenoDeploy ? true : false,
      sameSite: "lax",
    });

    const headers = new Headers();
    headers.set("Set-Cookie", cookie.toString());
    // TODO: allow user to return to the url he was trying to access before the login prompt
    // If not set, redirect to /home
    headers.set("location", "/home");
    return new Response(null, {
      status: 303, // See Other
      headers,
    });
  },
});

export default function LoginPage() {
  return (
    <div class="flex flex-col items-center-safe justify-center-safe h-screen bg-primary-light">
      {/* Card Container */}
      <Card class="flex flex-col gap-4 min-w-[200px] md:min-w-[280px]">
        <h1 class="self-center text-primary tracking-wide">core.bjesuiter</h1>
        <p class="self-center italic">Login to continue</p>
        <form class="flex flex-col gap-2" method="post">
          <label>
            <p>Email</p>
            <input
              type="email"
              name="email"
              placeholder="me@example.com"
              required
            />
          </label>
          <label>
            <p>Password</p>
            <PasswortInput />
          </label>
          <button type="submit" class="button mt-2">
            Login
          </button>
        </form>
      </Card>
    </div>
  );
}
