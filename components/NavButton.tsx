export function NavButton(props: { href: string; children: string }) {
  return (
    <a href={props.href} class="bg-cyan-500 text-white px-4 py-2 rounded-md">
      {props.children}
    </a>
  );
}
