import { useState } from "preact/hooks";
import Menu from "../components/menu.tsx";
import { twJoin } from "tailwind-merge";

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
      <div class="absolute top-8 left-5 p-1 bg-primary/20 rounded-md">
        {/* This div below builds the frame around the icon, not around the toolbar itself */}
        <button
          type="button"
          class="hover:rounded-md hover:bg-primary/20 p-1 hover:text-black aspect-square h-8 w-8"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <span class="text-2xl icon-[mynaui--sidebar]"></span>
        </button>
      </div>

      {/* Left Sidebar */}
      <div
        class={twJoin(
          "transition-width duration-300",
          sidebarOpen ? "w-[200px]" : "w-0",
          sidebarOpen ? "pl-4" : "pl-0",
        )}
      >
        <h1 class="text-2xl font-bold mb-4 mt-4 text-center">
          coresvc
        </h1>
        <Menu class="" currentPath={props.url.pathname} />
      </div>
    </>
  );
}
