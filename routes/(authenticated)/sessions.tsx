import { FreshContext } from "$fresh/server.ts";
import { Card } from "@/components/Card.tsx";
import { db } from "@/lib/db/index.ts";
import { SessionsTable } from "@/lib/db/schemas/sessions.table.ts";
import { FreshCtxState } from "@/types/fresh_ctx_state.type.ts";
import { desc, eq } from "drizzle-orm";
import { Toolbar } from "@/components/Toolbar.tsx";
import { envStore } from "@/utils/env_store.ts";
import { NavButton } from "@/components/NavButton.tsx";
import { UsersTable } from "../../lib/db/schemas/users.table.ts";

const itemsPerPage = 100;

export default async function SessionsPage(
  req: Request,
  ctx: FreshContext<FreshCtxState>,
) {
  // check permission
  //   if (!ctx.state.user.email === envStore.CORE_ROOT_USER_EMAIL) {
  //   }

  const page = parseInt(ctx.url.searchParams.get("page") ?? "0");
  const sessions = await db.select().from(SessionsTable).leftJoin(
    UsersTable,
    eq(SessionsTable.userId, UsersTable.id),
  ).orderBy(
    desc(SessionsTable.createdAt),
  ).limit(itemsPerPage).offset(page * itemsPerPage);

  return (
    <Card class="flex flex-col gap-6">
      <Toolbar
        title="Sessions"
        actionsSlotLeft={<NavButton href="/">Back</NavButton>}
      >
        <NavButton href={`./?page=${page - 1}`} disabled={page - 1 < 0}>
          Previous Page
        </NavButton>
        <span>Page: {page + 1}</span>
        <NavButton href={`./?page=${page + 1}`}>Next Page</NavButton>
      </Toolbar>

      {/* Sessions Table */}
      <table class="text-left">
        <thead>
          <tr>
            <th>ID</th>
            <th>User Email</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => (
            <tr>
              <td>{session.sessions.id}</td>
              <td>{session.users?.email}</td>
              <td>{session.sessions.createdAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
