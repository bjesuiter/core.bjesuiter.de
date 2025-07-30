import { PageProps } from "fresh";
import { Sidebar } from "../../islands/Sidebar.tsx";

export default function Layout({ Component, state, url }: PageProps) {
  // do something with state here

  return (
    <div class="accent-teal-700 text-teal-700 bg-teal-100 h-[100dvh] grid grid-cols-[min-content_1fr] pl-4 pt-4 relative">
      {/* Left Sidebar with Floating Toolbar */}
      {/* TODO:: save this initial state somewhere, so that it persists across user navigations */}
      <Sidebar url={url} initialOpen />

      {/* Main Content */}
      <div class="overflow-auto h-full bg-white p-4 rounded-tl-md border border-teal-400">
        <Component />
      </div>
    </div>
  );
}
