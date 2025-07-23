export function NavButton(props: {
  href: string;
  children: string;
  disabled?: boolean;
}) {
  return (
    <a href={props.href} class="button" disabled={props.disabled}>
      {props.children}
    </a>
  );
}
