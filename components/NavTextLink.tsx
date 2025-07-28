import { JSX } from "preact/jsx-runtime";
import { twJoin } from "tailwind-merge";

export function NavTextLink(props: {
  children: string | JSX.Element | JSX.Element[];
  href: string;
  isActive?: boolean;
}) {
  return (
    <a
      href={props.href}
      class={twJoin(
        " text-teal-700 p-2 rounded-md align-middle",
        props.isActive ? "bg-white" : "bg-transparent",
      )}
    >
      {props.children}
    </a>
  );
}
