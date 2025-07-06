import { PageProps } from "$fresh/server.ts";
import { LogoutButton } from "../../islands/LogoutButton.tsx";
import { FreshCtxState } from "../../types/fresh_ctx_state.type.ts";

export default function HomePage(props: PageProps<unknown, FreshCtxState>) {
  const denoDeploymentId = Deno.env.get("DENO_DEPLOYMENT_ID");

  return (
    <div class="p-4 h-screen">
      <div class="border-2 border-zinc-400 rounded-md p-4 shadow-sm bg-zinc-100/50">
        <h1>Authenticated Homepage</h1>
        <p>Welcome, {props.state.user.label}</p>
        <p>User Email: {props.state.user.email}</p>
        <p>DENO_DEPLOYMENT_ID: {denoDeploymentId}</p>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <div class="bg-zinc-100 border-zinc-400 border-2 rounded-md p-4 shadow-sm">
            <a href="/users">Manage Users</a>
          </div>
        </div>

        <LogoutButton />
      </div>
    </div>
  );
}
