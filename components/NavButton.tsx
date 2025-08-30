export function NavButton(props: {
  href: string;
  children: string;
  disabled?: boolean;
}) {
  return (
    <a href={props.href}>
      <button type="button" class="primary-btn" disabled={props.disabled}>
        {props.children}
      </button>
    </a>
  );
}
