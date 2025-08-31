import { ComponentChildren } from "preact";
import { twJoin } from "tailwind-merge";
import { Signal } from "@preact/signals";

export function MainContent(
  props: {
    children: ComponentChildren;
    sidebarOpen: Signal<boolean>;
  },
) {
  return (
    <div
      class={twJoin(
        "overflow-auto h-full bg-white p-4 mt-12 rounded-tl-md border-l border-t border-teal-400",
      )}
    >
      <p>Sidebar open: {props.sidebarOpen.value.toString()}</p>
      {props.children}
    </div>
  );
}
