import { JSX } from "preact/jsx-runtime";

export function NavTextLink(props: {
  children: string | JSX.Element | JSX.Element[];
  href: string;
}) {
  return (
    <a href={props.href} class="underline underline-offset-4">
      {props.children}
    </a>
  );
}
