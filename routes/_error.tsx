import { Head } from "fresh/runtime";
import { NavButton } from "../components/NavButton.tsx";
import { BrowserBackButton } from "../islands/BrowserBackButton.tsx";
import { HttpError, PageProps } from "fresh";
import { CoreSvcContext } from "../types/fresh_ctx_state.type.ts";

export default function ErrorPage(props: PageProps<undefined, CoreSvcContext>) {
  const error = props.error; // Contains the thrown Error or HTTPError

  if (error instanceof HttpError) {
    const status = error.status;
    props.state.tabTitle = `HTTP ${status}`;
    switch (status) {
      case 404:
        return new Response("404 - Page not found", { status });
      case 500:
        return new Response("500 - Internal server error", { status });
    }
  }

  if (error instanceof Error) {
    return new Response(error.message, { status: 500 });
  }

  return null;

  // return (
  //   <>
  //     <div class="px-4 py-8 h-screen bg-teal-50">
  //       <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
  //         <h1 class="text-4xl font-bold">404 - Page not found</h1>
  //         <p class="my-4">
  //           The page you were looking for doesn't exist.
  //         </p>
  //         <div class="flex flex-col gap-4">
  //           <BrowserBackButton>Go one step back</BrowserBackButton>
  //           <NavButton href="/">Go back home</NavButton>
  //         </div>
  //       </div>
  //     </div>
  //   </>
  // );
}
