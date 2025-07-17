import { JSX } from "preact/jsx-runtime";

/**
 * @param props.title - The title of the toolbar.
 * @param props.actionsSlotRight - The actions to the right of the title.
 * @param props.actionsSlotLeft - The actions to the left of the title.
 * @param props.children - The children of the toolbar - go in between the title and the actions.
 * @returns
 */
export function Toolbar(
  props: {
    title?: string;
    titleSlot?: JSX.Element | null;
    actionsSlotRight?: JSX.Element | null;
    actionsSlotLeft?: JSX.Element | null;
    children?: JSX.Element | null;
  },
) {
  return (
    <div class="flex flex-row gap-4 justify-between items-center mb-4">
      {props.actionsSlotLeft ?? null}
      {props.titleSlot ?? <h1>{props.title}</h1>}
      {props.children ?? <div class="flex-grow" />}
      {props.actionsSlotRight ?? null}
    </div>
  );
}
