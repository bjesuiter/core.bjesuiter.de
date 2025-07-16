import { JSX } from "preact/jsx-runtime";

export function Toolbar(
  props: {
    title: string;
    actions: JSX.Element;
    childrenBetween?: JSX.Element | null;
  },
) {
  return (
    <div class="flex flex-row gap-4 justify-between">
      <h1>{props.title}</h1>
      {props.childrenBetween}
      {props.actions}
    </div>
  );
}
