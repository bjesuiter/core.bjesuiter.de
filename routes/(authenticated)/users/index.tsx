import { PageProps } from "$fresh/server.ts";
import { kv } from "@/utils/kv.ts";
import { User } from "../../../utils/user.type.ts";
import { Toolbar } from "../../../components/Toolbar.tsx";
import { NavButton } from "../../../components/NavButton.tsx";

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
  const usersAsyncIterator = kv.list<User>({ prefix: ["users"] });

  const users = (await Array.fromAsync(usersAsyncIterator)).map((user) => {
    return {
      email: user.value.email,
      label: user.value.label,
      id: user.value.id,
    };
  });

  return (
    <div class="flex flex-col gap-4">
      <Toolbar
        title="Platform Users (TODO)"
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
