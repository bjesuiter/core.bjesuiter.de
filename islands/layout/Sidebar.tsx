import Menu from "@/components/menu.tsx";
import { Icon } from "@/lib/fresh-iconify/Icon.tsx";
import { Signal } from "@preact/signals";
import { twJoin } from "tailwind-merge";

/**
 * Contains the sidebar and the floating toolbar to toggle it
 * Might include other icons in the toolbar too, like search
 *
 * @requires the surrounding component to have position: relative,
 * so the absolute toolbar can be positioned correctly
 */
export function Sidebar(
  props: {
    url: URL;
    openState: Signal<boolean>;
  },
) {
  const handleOpenCloseButtonClick = () => {
    props.openState.value = !props.openState.value;
    // props.onOpenChange?.(sidebarOpen.value);
  };

  return (
    <div
      class={twJoin(
        "transition-all duration-300 ease-in-out",
        props.openState.value ? "pl-4 pt-4" : "pl-2 pt-2",
      )}
    >
      {/* Small floating toolbar */}
      <div
        class={twJoin(
          "absolute top-4 left-5 p-1 rounded-md ",
          // props.openState.value ? "bg-transparent" : "bg-primary/20",
          props.openState.value ? "bg-transparent" : "bg-transparent",
        )}
      >
        {/* This div below builds the frame around the icon, not around the toolbar itself */}
        <button
          type="button"
          class="hover:rounded-md hover:bg-primary/20 p-1 aspect-square h-8 w-8"
          onClick={handleOpenCloseButtonClick}
        >
          <Icon class="text-2xl icon-[mynaui--sidebar] select-none">
          </Icon>
        </button>
      </div>

      {/* Left Sidebar */}
      <div
        class={twJoin(
          "transition-all duration-300",
          props.openState.value ? "w-[200px]" : "w-0",
          props.openState.value ? "px-2" : "px-0",
        )}
      >
        <h1
          class={twJoin(
            "text-2xl font-bold mb-4 mt-0 text-center delay-100",
            props.openState.value
              ? "motion-preset-blur-right motion-ease-in-quart visible"
              : "motion-preset-blur-left motion-ease-in-quart invisible",
          )}
        >
          coresvc
        </h1>
        {/* TODO: optimize text wrapping while animating */}
        <Menu
          class={twJoin(
            props.openState.value ? "" : "overflow-hidden text-nowrap",
          )}
          currentPath={props.url.pathname}
        />
      </div>
    </div>
  );
}
