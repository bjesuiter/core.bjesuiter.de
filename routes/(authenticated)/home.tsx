import { define } from "@/lib/fresh/defineHelpers.ts";

export default define.page(async (ctx) => {
  const denoDeploymentId = Deno.env.get("DENO_DEPLOYMENT_ID") ?? "unknown";
  // const { user } = ctx.state;
  const authResult = await ctx.state.authPromise;

  if (authResult.type === "response") {
    return authResult.response;
  }
  const { user } = authResult;

  return (
    <div class="flex flex-col gap-4">
      <h1>Authenticated Homepage</h1>
      <section>
        <p>Welcome, {user.label}</p>
        <p>User Email: {user.email}</p>
        <p>User ID: {user.id}</p>
      </section>

      <hr class="my-4 border-b border-gray-300" />

      <footer class="text-sm text-gray-500 text-center justify-self-end">
        <p>
          DENO_DEPLOYMENT_ID: {denoDeploymentId}
        </p>
      </footer>
    </div>
  );
});
