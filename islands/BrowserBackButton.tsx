import { JSX } from "preact/jsx-runtime";

export function BrowserBackButton(props: {
  children: string | JSX.Element | JSX.Element[];
}) {
  return (
    <button
      class="primary-btn"
      type="button"
      onClick={() => globalThis.history.back()}
    >
      {props.children}
    </button>
  );
}
