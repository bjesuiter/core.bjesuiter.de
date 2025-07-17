import { PageProps } from "$fresh/server.ts";

export default function Layout({ Component, state }: PageProps) {
  // do something with state here
  return (
    // <div class="bg-[url('/img/cityofgoldcoast-AHOsCAuCnUU.jpg')] bg-cover bg-center h-screen">
    <div class="text-teal-800 bg-teal-50 h-screen p-4">
      <Component />
    </div>
  );
}
