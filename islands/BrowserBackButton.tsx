import { JSX } from "preact/jsx-runtime";

export function BrowserBackButton(props: {
  children: string | JSX.Element | JSX.Element[];
}) {
  return (
    <button
      class="button"
      type="button"
      onClick={() => window.history.back()}
    >
      {props.children}
    </button>
  );
}
