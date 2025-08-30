import { PageProps } from "fresh";
import { CoreSvcContext } from "@/types/fresh_ctx_state.type.ts";

export default function HomePage(props: PageProps<unknown, CoreSvcContext>) {
  const denoDeploymentId = Deno.env.get("DENO_DEPLOYMENT_ID") ?? "unknown";

  return (
    <div class="border-2 border-zinc-400 rounded-md p-4 shadow-sm bg-zinc-100/50 flex flex-col gap-4 mt-8">
      <h1>Authenticated Homepage</h1>
      <section>
        <p>Welcome, {props.state.user.label}</p>
        <p>User Email: {props.state.user.email}</p>
        <p>User ID: {props.state.user.id}</p>
      </section>

      <hr class="my-4 border-b border-gray-300" />

      <footer class="text-sm text-gray-500 text-center">
        <p>
          DENO_DEPLOYMENT_ID: {denoDeploymentId}
        </p>
      </footer>
    </div>
  );
}
