import { Handlers } from "$fresh/server.ts";
import { hashSecret } from "@/utils/auth.ts";
import { userSchema } from "@/utils/user.type.ts";
import { decodeBase64 } from "@std/encoding/base64";
import { Cookie } from "tough-cookie";
import z from "zod/v4";
import { constantTimeEqual, createSession } from "../utils/auth.ts";
import { isRunningOnDenoDeploy } from "../utils/env_store.ts";
import { getUserByEmail } from "../utils/user_utils.ts";

export const handler: Handlers = {
  /**
   * When /login is requested with GET, simply render the page
   * @bjesuiter: if no GET handler is defined, the page will auto-render
   */
  async GET(req, ctx) {
    return await ctx.render();
  },

  /**
   * When /login is requested with POST, validate the form data and redirect to /home page
   */
  async POST(req, ctx) {
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
};

export default function LoginPage() {
  return (
    <div class="flex flex-col items-center justify-center h-screen bg-teal-50">
      {/* Card Container */}
      <div class="shadow-xl rounded-lg p-4 bg-white flex flex-col gap-4">
        <h1>Login</h1>
        <p>
          Login to core.bjesuiter.de to continue
        </p>
        <form class="flex flex-col gap-2" method="post">
          <input type="email" name="email" placeholder="Email" required />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
          />
          <button type="submit" class="button mt-2">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
