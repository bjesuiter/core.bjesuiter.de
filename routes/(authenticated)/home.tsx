import { PageProps } from "$fresh/server.ts";
import { LogoutButton } from "../../islands/LogoutButton.tsx";
import { FreshCtxState } from "../../types/fresh_ctx_state.type.ts";

export default function HomePage(props: PageProps<unknown, FreshCtxState>) {
  return (
    <div>
      <h1>Authenticated Homepage</h1>
      <p>Welcome, {props.state.user.label}</p>
      <p>User Email: {props.state.user.email}</p>
      <LogoutButton />
    </div>
  );
}
