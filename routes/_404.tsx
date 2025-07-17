import { Head } from "$fresh/runtime.ts";
import { NavButton } from "../components/NavButton.tsx";
import { BrowserBackButton } from "../islands/BrowserBackButton.tsx";

export default function Error404() {
  return (
    <>
      <Head>
        <title>404 - Page not found</title>
      </Head>
      <div class="px-4 py-8 h-screen bg-teal-50">
        <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
          <img
            class="my-6"
            src="/logo.svg"
            width="128"
            height="128"
            alt="the Fresh logo: a sliced lemon dripping with juice"
          />
          <h1 class="text-4xl font-bold">404 - Page not found</h1>
          <p class="my-4">
            The page you were looking for doesn't exist.
          </p>
          <div class="flex flex-col gap-4">
            <BrowserBackButton>Go one step back</BrowserBackButton>
            <NavButton href="/">Go back home</NavButton>
          </div>
        </div>
      </div>
    </>
  );
}
