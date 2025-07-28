import { twJoin } from "tailwind-merge";

export function LogoutButton(props: { class?: string }) {
  const classes = twJoin(
    "button",
    props.class ?? "",
  );

  return (
    <form action="/logout" method="post" class={classes}>
      <button type="submit">Logout</button>
    </form>
  );
}
