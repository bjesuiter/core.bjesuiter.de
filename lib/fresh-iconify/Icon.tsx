/**
 * Simple wrapper component to use iconfiy via tailwind classes
 * with more semantic visibility instead of "span"
 */
export function Icon(props: {
  class?: string;
}) {
  return <span class={props.class}></span>;
}
