import { PageProps } from "$fresh/server.ts";
import { asc } from "drizzle-orm";
import { NavButton } from "../../../components/NavButton.tsx";
import { Toolbar } from "../../../components/Toolbar.tsx";
import { db } from "../../../lib/db/index.ts";
import { UsersTable } from "../../../lib/db/schemas/users.table.ts";

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

// CAUTION: Cookie based auth needs to be implemented beforehand!
export default async function UserPage(props: PageProps) {
  // TODO: Add pagination controls on the frontend
  const users = await db.select().from(UsersTable).orderBy(
    asc(UsersTable.email),
  ).limit(100).offset(0);

  return (
    <div class="flex flex-col gap-4">
      <Toolbar
        title="Platform Users"
        actionsSlotLeft={<NavButton href="/">Back</NavButton>}
        actionsSlotRight={<NavButton href="/users/add">Add User</NavButton>}
      />

      <table class="min-w-full border-collapse border border-gray-300 ">
        <thead>
          <tr>
            {Object.keys(users[0] ?? {}).map((key) => (
              <th class="border border-gray-300 px-2 py-1 text-left" key={key}>
                {key === "id" ? "id (for info only)" : key}
              </th>
            ))}
            <th class="border border-gray-300 px-2 py-1 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, idx) => (
            <tr key={user.id ?? idx}>
              {Object.entries(user).map(([key, value]) => (
                <td class="border border-gray-300 px-2 py-1" key={key}>
                  {typeof value === "object" && value !== null
                    ? JSON.stringify(value)
                    : String(value)}
                </td>
              ))}
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
