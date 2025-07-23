import { PageProps } from "$fresh/server.ts";
import { NavTextLink } from "@/components/NavTextLink.tsx";
import { LogoutButton } from "@/islands/LogoutButton.tsx";
import { FreshCtxState } from "@/types/fresh_ctx_state.type.ts";

export default function HomePage(props: PageProps<unknown, FreshCtxState>) {
  const denoDeploymentId = Deno.env.get("DENO_DEPLOYMENT_ID") ?? "unknown";

  return (
    <div class="p-4 h-screen">
      <div class="border-2 border-zinc-400 rounded-md p-4 shadow-sm bg-zinc-100/50 flex flex-col gap-4">
        <h1>Authenticated Homepage</h1>
        <section>
          <p>Welcome, {props.state.user.label}</p>
          <p>User Email: {props.state.user.email}</p>
          <p>User ID: {props.state.user.id}</p>
        </section>

        <div class="flex flex-row gap-4">
          <NavTextLink href="/users">Manage Users</NavTextLink>
          <NavTextLink href="/sessions">Manage Sessions</NavTextLink>
          <NavTextLink href="/ddns">Manage DDNS</NavTextLink>
          <NavTextLink href="/permissions">
            Manage Permissions (TODO)
          </NavTextLink>
          <NavTextLink href="/ddns">Manage DDNS (TODO)</NavTextLink>
        </div>

        <LogoutButton />
      </div>

      <hr class="my-4 border-b border-gray-300" />

      <footer class="text-sm text-gray-500 text-center">
        <p>
          DENO_DEPLOYMENT_ID: {denoDeploymentId}
        </p>
      </footer>
    </div>
  );
}
