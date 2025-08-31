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
        "overflow-auto h-full bg-white pt-2.5 pr-4 mt-2 rounded-tl-md border-l border-t border-teal-400 transition-all duration-300 ease-in-out",
        props.sidebarOpen.value ? "pl-4" : "pl-14",
      )}
    >
      {props.children}
    </div>
  );
}
