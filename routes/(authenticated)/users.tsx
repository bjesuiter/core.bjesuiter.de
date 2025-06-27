import { PageProps } from "$fresh/server.ts";
import { kv } from "@/utils/kv.ts";

interface User {
  username: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
  lastLoginIp: string;
}

// CAUTION: Cookie based auth needs to be implemented beforehand!
export default async function UserPage(props: PageProps) {
  const users = await kv.list<User>({ prefix: ["users"] });

  console.log(users);

  return <h1>Platform Users (TODO)</h1>;
}
