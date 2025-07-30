import { IS_BROWSER } from "fresh/runtime";

export default function Redirect(props: { href: string }) {
  if (!IS_BROWSER) {
    return <div></div>;
  }

  setTimeout(() => {
    // The lint rule is disabled, because this code will run in browser only
    // deno-lint-ignore no-window
    window.location.href = props.href;
  }, 500);
  return <div>Redirecting to {props.href} ...</div>;
}
