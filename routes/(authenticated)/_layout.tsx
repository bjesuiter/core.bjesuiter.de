import { PageProps } from "fresh";
import { Sidebar } from "../../islands/layout/Sidebar.tsx";
import { twJoin } from "tailwind-merge";
import { useSignal } from "@preact/signals";

export default function Layout({ Component, state: _state, url }: PageProps) {
  // do something with state here

  // const sidebarOpen = useSignal(true);

  return (
    <div class="accent-teal-700 text-teal-700 bg-teal-100 h-[100dvh] grid grid-cols-[min-content_1fr] pl-4 pt-4 relative">
      {/* Left Sidebar with Floating Toolbar */}
      {/* TODO:: save this initial state somewhere, so that it persists across user navigations */}
      <Sidebar
        url={url}
        initialOpen={true}
        // onOpenChange={(isOpen) => sidebarOpen.value = isOpen}
      />

      {/* Main Content */}
      <div
        class={twJoin(
          "overflow-auto h-full bg-white p-4 mt-12 rounded-tl-md border-l border-t border-teal-400",
        )}
      >
        {/* <p>Sidebar open: {sidebarOpen.value.toString()}</p> */}
        <Component />
      </div>
    </div>
  );
}
