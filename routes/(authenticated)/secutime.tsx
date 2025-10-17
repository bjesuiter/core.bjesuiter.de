import { define } from "@/lib/fresh/defineHelpers.ts";
import { envStore } from "@/utils/env_store.ts";
import { Toolbar } from "@/components/Toolbar.tsx";
import { NavButton } from "@/components/NavButton.tsx";

export default define.page(async (ctx) => {
  const authResult = await ctx.state.authPromise;

  if (authResult.type === "response") {
    return authResult.response;
  }

  const { user } = authResult;

  // Check if the user is the root user
  if (user.email !== envStore.CORE_ROOT_USER_EMAIL) {
    return new Response(
      "Forbidden: You do not have permission to access this page",
      {
        status: 403,
        headers: {
          "Content-Type": "text/plain",
        },
      },
    );
  }

  return (
    <div class="flex flex-col gap-4">
      <Toolbar
        title="SecuTime - The Secunet Overtime Tracking System"
        actionsSlotRight={
          <NavButton href="/secutime/settings">Settings</NavButton>
        }
      />

      <section class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">Overtime Tracking</h2>
        <p class="text-gray-600">
          This is the Secunet Overtime tracking page. Only accessible to the
          root user.
        </p>
      </section>

      <section class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-2">TODO</h3>
        <ul class="list-disc list-inside text-gray-600">
          <li>Add overtime calculation logic</li>
          <li>Display overtime statistics</li>
          <li>Add date range filters</li>
        </ul>
      </section>
    </div>
  );
});
