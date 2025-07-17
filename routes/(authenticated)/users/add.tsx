import { PageProps } from "$fresh/server.ts";
import { Toolbar } from "../../../components/Toolbar.tsx";
import { NavButton } from "../../../components/NavButton.tsx";
import { InitPasswordOptions } from "./(_islands)/InitPasswordOptions.tsx";

export default async function AddUserPage(props: PageProps) {
  return (
    <div class="flex flex-col gap-4">
      <Toolbar
        title="Add User"
        actionsSlotLeft={<NavButton href="/users">Back</NavButton>}
      />
      <form class="flex flex-col gap-4 max-w-md">
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
        <InitPasswordOptions />

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
