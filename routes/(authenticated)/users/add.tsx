import { FreshContext, PageProps } from "$fresh/server.ts";
import { Toolbar } from "../../../components/Toolbar.tsx";
import { NavButton } from "../../../components/NavButton.tsx";
import { InitPasswordOption } from "./(_islands)/InitPasswordOption.tsx";

export const handler = {
  POST: async (req: Request, ctx: FreshContext) => {
    const formData = await req.formData();

    const initPasswordOption = formData.get("init_password_option");

    switch (initPasswordOption) {
      case "generate_password":
        break;
      case "custom_password":
        break;
      default:
        return new Response(
          "Invalid init password option, only valid: generate_password, custom_password",
          {
            status: 400,
          },
        );
    }

    console.log(formData);
    return await ctx.render();
  },
};

export default async function AddUserPage(props: PageProps) {
  return (
    <div class="flex flex-col gap-4">
      <Toolbar
        title="Add User"
        actionsSlotLeft={<NavButton href="/users">Back</NavButton>}
      />
      <form
        class="flex flex-col gap-4 max-w-md"
        action="/users/add"
        method="POST"
      >
        <label for="email">Email</label>
        <input
          type="email"
          name="email"
          id="email"
          placeholder="Email"
          required
          class="border border-gray-300 rounded-md p-2"
        />

        <label for="label">Display Name</label>
        <input
          type="text"
          name="label"
          id="label"
          placeholder="Display Name"
          required
        />

        <label for="password">Password</label>
        <InitPasswordOption />

        <button
          type="submit"
          class="bg-cyan-500 text-white px-4 py-2 rounded-md"
        >
          Add User
        </button>
      </form>
    </div>
  );
}
