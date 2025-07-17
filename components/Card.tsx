import { JSX } from "preact/jsx-runtime";
import { twJoin } from "tailwind-merge";

export function Card(props: {
  children: JSX.Element | JSX.Element[];
  class?: string;
}) {
  const classes = twJoin(
    "bg-white rounded-lg shadow-md p-4 border border-gray-300",
    props.class,
  );
  return <div class={classes}>{props.children}</div>;
}
