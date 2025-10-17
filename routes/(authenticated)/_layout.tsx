import { MainContent } from "@/islands/layout/MainContent.tsx";
import { define } from "@/lib/fresh/defineHelpers.ts";
import { signal } from "@preact/signals";
import { twJoin } from "tailwind-merge";
import { Sidebar } from "../../islands/layout/Sidebar.tsx";

export default define.layout(
  async (ctx) => {
    const { Component, state, url } = ctx;

    // Note: do not use useSignal() preact hook here but use the pure signal() function.
    // The hook does only work in synchronous components, breaks in async ones.
    // Since we only need the signal here to share it with the Sidebar component and the main content,
    // we can simply use the nonHook version.
    // TODO: opening and closing the menu does not work anymore on localhost.
    // Check if this is the reason for the issue.
    const sidebarOpen = signal(true);

    // Get isRootUser from authPromise (set by auth middleware)
    const authResult = await state.authPromise;
    if (authResult.type === "response") {
      return authResult.response;
    }
    const { user, isRootUser } = authResult;

    console.debug(
      `isRootUser Calculated in Layout -  for user: ${user.email}: `,
      isRootUser,
    );

    return (
      <div
        class={twJoin(
          "accent-teal-700 text-teal-700 bg-teal-100 h-[100dvh] grid grid-cols-[min-content_1fr] relative",
        )}
      >
        {/* Left Sidebar with Floating Toolbar */}
        {/* TODO:: save this initial state somewhere, so that it persists across user navigations */}
        <Sidebar
          url={url}
          openState={sidebarOpen}
          isRootUser={isRootUser}
          userEmail={user.email}
          // onOpenChange={(isOpen) => sidebarOpen.value = isOpen}
        />

        <MainContent sidebarOpen={sidebarOpen}>
          <Component />
        </MainContent>
      </div>
    );
  },
);
