import { HttpError } from "fresh";
import { define } from "@/lib/fresh/defineHelpers.ts";

export default define.page((ctx) => {
  const { error, state } = ctx;

  if (error instanceof HttpError) {
    const status = error.status;
    state.tabTitle = `HTTP ${status}`;
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
});
