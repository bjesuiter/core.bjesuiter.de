import { PageProps } from "$fresh/server.ts";

import { Handlers } from "$fresh/server.ts";

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

    // Add email to list.

    // Redirect user to thank you page.
    const headers = new Headers();
    headers.set("location", "/thanks-for-subscribing");
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
