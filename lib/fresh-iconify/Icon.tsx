/**
 * Simple wrapper component to use iconfiy via tailwind classes
 * with more semantic visibility instead of "span"
 * Usage: <Icon class="text-2xl icon-[mdi-light--check]"></Icon>
 */
export function Icon(props: {
  class?: string;
}) {
  return <span class={props.class}></span>;
}
