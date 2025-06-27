import { PageProps } from "$fresh/server.ts";
import { kv } from "@/utils/kv.ts";
import { User } from "../../utils/user.type.ts";

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

  const users = await Array.fromAsync(usersAsyncIterator);

  return (
    <div>
      <h1>Platform Users (TODO)</h1>
      <ul>
        {users.map((user) => (
          <li>
            {user.value.label}&lt;{user.value.email}&gt; - {user.value.id}
          </li>
        ))}
      </ul>
    </div>
  );
}
