import { PageProps } from "$fresh/server.ts";

import { Handlers } from "$fresh/server.ts";
import {
  constantTimeEqual,
  constantTimeEqualBase64,
  createSession,
} from "../utils/auth.ts";
import { kv } from "../utils/kv.ts";
import { userSchema } from "@/utils/user.type.ts";
import { hashSecret } from "@/utils/auth.ts";
import { decodeBase64 } from "@std/encoding/base64";
import { Cookie } from "tough-cookie";

export const handler: Handlers = {
  /**
   * When /login is requested with GET, simply render the page
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

    if (!email) {
      return new Response("Email is required", { status: 400 });
    }

    if (!password) {
      return new Response("Password is required", { status: 400 });
    }

    const userKvResult = await kv.get(["users", email]);
    if (!userKvResult.value) {
      console.error(`User ${email} was not found`);
      // CAUTION: Returning 401 here instead of 404 to avoid leaking information about the existence of the user
      return new Response("User or password is incorrect", { status: 401 });
    }
    const user = userSchema.safeParse(userKvResult.value);
    if (!user.success) {
      console.error(
        `User ${email} was found in kv, butis invalid: ${user.error.message}`,
      );
      return new Response("User or password is incorrect", { status: 401 });
    }

    const passPlusSalt = password + user.data.password_salt;
    const reqPasswordHash = await hashSecret(passPlusSalt);
    const dbPasswordHash = decodeBase64(user.data.password_hash_b64);
    const valid = constantTimeEqual(reqPasswordHash, dbPasswordHash);

    if (!valid) {
      console.error(`User ${email} provided wrong password`);
      return new Response("User or password is incorrect", { status: 401 });
    }

    const session = await createSession({ userEmail: email });
    // store cookie like this:
    // https://lucia-auth.com/sessions/basic#:~:text=0%3B%0A%7D-,Client%2Dside%20storage,-For%20most%20websites
    const cookie = new Cookie({
      key: "session_token",
      value: session.token,
      maxAge: 86400, // 1 day, in seconds
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });

    // Redirect user to authenticated homepage
    const headers = new Headers();
    headers.set("location", "/home");
    headers.set("Set-Cookie", cookie.toString());
    return new Response(null, {
      status: 303, // See Other
      headers,
    });
  },
};

export default async function LoginPage(props: PageProps) {
  // todo: check if already authenticated and redirect to /home page

  return (
    <div class="flex flex-col items-center justify-center h-screen bg-cyan-100">
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
          <button type="submit" class="bg-cyan-500 text-white mt-2">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
