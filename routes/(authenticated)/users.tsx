import { PageProps } from "fresh";
import { NavButton } from "@/components/NavButton.tsx";
import { Toolbar } from "@/components/Toolbar.tsx";
import { db } from "@/lib/db/index.ts";
import { UsersTable } from "@/lib/db/schemas/users.table.ts";
import { asc } from "drizzle-orm";

// TODO: merge with main users KV
// interface User {
//   username: string;
//   email: string;
//   passwordHash: string;
//   createdAt: Date;
//   updatedAt: Date;
//   lastLoginAt: Date;
//   lastLoginIp: string;
// }

export default async function UserPage() {
  // TODO: Add pagination controls on the frontend
  const users = await db.select().from(UsersTable).orderBy(
    asc(UsersTable.email),
  ).limit(100).offset(0);

  return (
    <div class="flex flex-col gap-4">
      <Toolbar
        title="Platform Users"
        actionsSlotRight={<NavButton href="/users/add">Add User</NavButton>}
      />

      <table class="min-w-full border-collapse border border-gray-300 ">
        <thead>
          <tr>
            <th class="border border-gray-300 px-2 py-1 text-left">ID</th>
            <th class="border border-gray-300 px-2 py-1 text-left">Email</th>
            <th class="border border-gray-300 px-2 py-1 text-left">Label</th>
            <th class="border border-gray-300 px-2 py-1 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, idx) => (
            <tr key={user.id ?? idx}>
              <td class="border border-gray-300 px-2 py-1">{user.id}</td>
              <td class="border border-gray-300 px-2 py-1">{user.email}</td>
              <td class="border border-gray-300 px-2 py-1">{user.label}</td>
              <td class="border border-gray-300 px-2 py-2 flex gap-2">
                <NavButton href={`/users/${user.email}/edit`}>Edit</NavButton>
                <NavButton href={`/users/${user.email}/delete`}>
                  Delete
                </NavButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
