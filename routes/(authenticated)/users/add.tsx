import { PageProps } from "$fresh/server.ts";

export default async function AddUserPage(props: PageProps) {
  return (
    <div class="flex flex-col gap-4">
      <h1>Add User</h1>
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
        <label for="label">Label</label>
        <input
          type="text"
          name="label"
          id="label"
          placeholder="Label"
          required
        />
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
