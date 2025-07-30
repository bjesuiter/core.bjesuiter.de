import { PageProps } from "fresh";
import { Sidebar } from "../../islands/Sidebar.tsx";

export default function Layout({ Component, state, url }: PageProps) {
  // do something with state here

  return (
    <div class="accent-teal-700 text-teal-700 bg-teal-100 h-[100dvh] grid grid-cols-[200px_1fr] gap-4 pl-4 pt-4 relative">
      {/* Left Sidebar with Floating Toolbar */}
      <Sidebar url={url} />

      {/* Main Content */}
      <div class="overflow-auto h-full bg-white p-4 rounded-tl-md border border-teal-400">
        <Component />
      </div>
    </div>
  );
}
