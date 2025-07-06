import { PageProps } from "$fresh/server.ts";
import { LogoutButton } from "../../islands/LogoutButton.tsx";
import { FreshCtxState } from "../../types/fresh_ctx_state.type.ts";

export default function HomePage(props: PageProps<unknown, FreshCtxState>) {
  const denoDeploymentId = Deno.env.get("DENO_DEPLOYMENT_ID");

  return (
    <div>
      <h1>Authenticated Homepage</h1>
      <p>Welcome, {props.state.user.label}</p>
      <p>User Email: {props.state.user.email}</p>
      <p>DENO_DEPLOYMENT_ID: {denoDeploymentId}</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <div class="bg-zinc-300 border-zinc-400 border-2 rounded-md p-4 shadow-sm">
          <h2 class="text-lg font-bold">Manage Users</h2>
          <p>
            Manage users and their permissions.
          </p>
        </div>
      </div>
      <LogoutButton />
    </div>
  );
}
