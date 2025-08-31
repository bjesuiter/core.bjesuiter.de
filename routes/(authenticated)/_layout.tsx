import { MainContent } from "@/islands/layout/MainContent.tsx";
import { useSignal } from "@preact/signals";
import { PageProps } from "fresh";
import { Sidebar } from "../../islands/layout/Sidebar.tsx";

export default function Layout({ Component, state: _state, url }: PageProps) {
  // do something with state here

  const sidebarOpen = useSignal(true);

  return (
    <div class="accent-teal-700 text-teal-700 bg-teal-100 h-[100dvh] grid grid-cols-[min-content_1fr] pl-4 pt-4 relative">
      {/* Left Sidebar with Floating Toolbar */}
      {/* TODO:: save this initial state somewhere, so that it persists across user navigations */}
      <Sidebar
        url={url}
        openState={sidebarOpen}
        // onOpenChange={(isOpen) => sidebarOpen.value = isOpen}
      />

      <MainContent sidebarOpen={sidebarOpen}>
        <Component />
      </MainContent>
    </div>
  );
}
