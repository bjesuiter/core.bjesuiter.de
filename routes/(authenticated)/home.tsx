import { define } from "../../lib/fresh/defineHelpers.ts";

export default define.page((ctx) => {
  const denoDeploymentId = Deno.env.get("DENO_DEPLOYMENT_ID") ?? "unknown";
  const { user } = ctx.state;

  return (
    <div class="border-2 border-zinc-400 rounded-md p-4 shadow-sm bg-zinc-100/50 flex flex-col gap-4 mt-8">
      <h1>Authenticated Homepage</h1>
      <section>
        <p>Welcome, {user.label}</p>
        <p>User Email: {user.email}</p>
        <p>User ID: {user.id}</p>
      </section>

      <hr class="my-4 border-b border-gray-300" />

      <footer class="text-sm text-gray-500 text-center">
        <p>
          DENO_DEPLOYMENT_ID: {denoDeploymentId}
        </p>
      </footer>
    </div>
  );
});
