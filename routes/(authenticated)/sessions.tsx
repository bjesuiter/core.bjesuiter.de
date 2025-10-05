import { NavButton } from "@/components/NavButton.tsx";
import { Toolbar } from "@/components/Toolbar.tsx";
import { db } from "@/lib/db/index.ts";
import { SessionsTable } from "@/lib/db/schemas/sessions.table.ts";
import { desc, eq } from "drizzle-orm";
import { UsersTable } from "@/lib/db/schemas/users.table.ts";
import { define } from "@/lib/fresh/defineHelpers.ts";
import { format } from "date-fns";

const itemsPerPage = 100;

export default define.page(async (ctx) => {
  // check permission
  //   if (!ctx.state.user.email === envStore.CORE_ROOT_USER_EMAIL) {
  //   }

  const authResult = await ctx.state.authPromise;
  if (authResult.type === "response") {
    return authResult.response;
  }
  const { session: currentSession } = authResult;

  const page = parseInt(ctx.url.searchParams.get("page") ?? "0");
  const sessions = await db.select({
    userId: SessionsTable.userId,
    userEmail: UsersTable.email,
    createdAt: SessionsTable.createdAt,
    sessionId: SessionsTable.id,
  }).from(SessionsTable).leftJoin(
    UsersTable,
    eq(SessionsTable.userId, UsersTable.id),
  ).orderBy(
    desc(SessionsTable.createdAt),
  ).limit(itemsPerPage).offset(page * itemsPerPage);

  return (
    <div class="flex flex-col gap-6">
      <Toolbar title="Sessions">
        <NavButton
          href={`?page=${page - 1}`}
          disabled={(page - 1) < 0}
        >
          Previous Page
        </NavButton>
        <span>Page: {page + 1}</span>
        <NavButton
          href={`?page=${page + 1}`}
          disabled={sessions.length < itemsPerPage}
        >
          Next Page
        </NavButton>
      </Toolbar>

      {/* Sessions Table */}
      <table class="text-left">
        <thead>
          <tr>
            <th>Session ID</th>
            <th>User Email</th>
            <th>Created At</th>
            <th>Current Session</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => (
            <tr>
              <td>{session.sessionId}</td>
              <td>{session.userEmail}</td>
              <td class="font-mono text-sm">
                {format(session.createdAt, "yyyy-MM-dd HH:mm:ss")}
              </td>
              <td>
                {session.sessionId === currentSession.id
                  ? "Your current session"
                  : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});
