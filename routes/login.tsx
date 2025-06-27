import { PageProps } from "$fresh/server.ts";

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
        <form class="flex flex-col gap-2">
          <input type="text" name="username" placeholder="Username" />
          <input type="password" name="password" placeholder="Password" />
          <button type="submit" class="bg-cyan-500 text-white mt-2">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
