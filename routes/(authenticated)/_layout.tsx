import { PageProps } from "$fresh/server.ts";

export default function Layout({ Component, state }: PageProps) {
  // do something with state here
  return (
    // <div class="bg-[url('/img/cityofgoldcoast-AHOsCAuCnUU.jpg')] bg-cover bg-center h-screen">
    // set height to 100dvh (instead of h-screen, because h-screen is 100vh and this clashes with mobile viewports)
    <div class="text-teal-700 bg-teal-50 h-[100dvh] p-4 overflow-auto">
      <Component />
    </div>
  );
}
