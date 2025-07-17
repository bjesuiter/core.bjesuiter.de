export function NavButton(props: { href: string; children: string }) {
  return (
    <a href={props.href} class="button">
      {props.children}
    </a>
  );
}
