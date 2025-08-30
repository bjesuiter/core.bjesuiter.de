import { JSX } from "preact/jsx-runtime";

export function Show(
  props: {
    when: boolean;
    children: JSX.Element | JSX.Element[] | string;
  },
) {
  if (props.when === true) {
    return props.children;
  }
  return undefined;
}
