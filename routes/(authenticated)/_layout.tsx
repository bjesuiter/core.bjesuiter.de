import { PageProps } from "$fresh/server.ts";
import Menu from "./(components)/menu.tsx";

export default function Layout({ Component, state, url }: PageProps) {
  // do something with state here
  return (
    // <div class="bg-[url('/img/cityofgoldcoast-AHOsCAuCnUU.jpg')] bg-cover bg-center h-screen">
    // set height to 100dvh (instead of h-screen, because h-screen is 100vh and this clashes with mobile viewports)
    <div class="accent-teal-700 text-teal-700 bg-teal-100 h-[100dvh] grid grid-cols-[200px_1fr] gap-4 pl-4 pt-4">
      {/* Left Sidebar */}
      <div>
        <h1 class="text-2xl font-bold text-center mb-4">coresvc</h1>
        <Menu class="" currentPath={url.pathname} />
      </div>
      {/* Main Content */}
      <div class="overflow-auto h-full bg-white p-4 rounded-tl-md border border-teal-400">
        <Component />
      </div>
    </div>
  );
}
