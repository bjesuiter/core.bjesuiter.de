import { useState } from "preact/hooks";
import Menu from "../components/menu.tsx";
import { twJoin } from "tailwind-merge";
import { Icon } from "../lib/fresh-iconify/Icon.tsx";

/**
 * Contains the sidebar and the floating toolbar to toggle it
 * Might include other icons in the toolbar too, like search
 *
 * @requires the surrounding component to have position: relative,
 * so the absolute toolbar can be positioned correctly
 */
export function Sidebar(props: { url: URL; initialOpen?: boolean }) {
  const [sidebarOpen, setSidebarOpen] = useState(props.initialOpen ?? true);

  return (
    <>
      {/* Small floating toolbar */}
      <div
        class={twJoin(
          "absolute top-4 left-5 p-1 rounded-md",
          sidebarOpen ? "bg-transparent" : "bg-primary/20",
        )}
      >
        {/* This div below builds the frame around the icon, not around the toolbar itself */}
        <button
          type="button"
          class="hover:rounded-md hover:bg-primary/20 p-1 aspect-square h-8 w-8"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Icon class="text-2xl icon-[mynaui--sidebar] select-none">
          </Icon>
        </button>
      </div>

      {/* Left Sidebar */}
      <div
        class={twJoin(
          "transition-all duration-300",
          sidebarOpen ? "w-[200px]" : "w-0",
          sidebarOpen ? "px-2" : "px-0",
        )}
      >
        <h1
          class={twJoin(
            "text-2xl font-bold mb-4 mt-0 text-center delay-100",
            sidebarOpen
              ? "motion-preset-blur-right motion-ease-in-quart visible"
              : "motion-preset-blur-left motion-ease-in-quart invisible",
          )}
        >
          coresvc
        </h1>
        {/* TODO: optimize text wrapping while animating */}
        <Menu
          class={twJoin(
            sidebarOpen ? "" : "overflow-hidden text-nowrap",
          )}
          currentPath={props.url.pathname}
        />
      </div>
    </>
  );
}
