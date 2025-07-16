import { PageProps } from "$fresh/server.ts";

export default function Layout({ Component, state }: PageProps) {
  // do something with state here
  return (
    // <div class="bg-[url('/img/cityofgoldcoast-AHOsCAuCnUU.jpg')] bg-cover bg-center h-screen">
    <div class="bg-linear-to-b from-cyan-100 to-cyan-200 h-screen p-4">
      <Component />
    </div>
  );
}
