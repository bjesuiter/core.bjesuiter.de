export function NavButton(props: {
  href: string;
  children: string;
  disabled?: boolean;
  fPartial?: string;
}) {
  const innerButton = (
    <button type="button" class="primary-btn" disabled={props.disabled}>
      {props.children}
    </button>
  );

  if (props.fPartial) {
    return (
      <a href={props.href} f-partial={props.fPartial}>
        {innerButton}
      </a>
    );
  }

  return (
    <a href={props.href}>
      {innerButton}
    </a>
  );
}
