import { define } from "@/lib/fresh/defineHelpers.ts";
import { db } from "@/lib/db/index.ts";
import { SessionsTable } from "@/lib/db/schemas/sessions.table.ts";
import { eq } from "drizzle-orm";
import { MessageBlock } from "@/components/subassemblies/MessageBlock.tsx";

export default define.page(async (ctx) => {
  const authResult = await ctx.state.authPromise;
  if (authResult.type === "response") {
    return authResult.response;
  }
  const { session: currentSession } = authResult;

  // Prevent deleting the current session
  if (ctx.params.sessionId === currentSession.id) {
    return (
      <MessageBlock
        title="Delete Session"
        backUrl="/sessions"
      >
        <p class="text-red-600 font-semibold">
          Cannot delete your current session. Please use a different session to
          delete this one, or log out instead.
        </p>
      </MessageBlock>
    );
  }

  const sessionResponse = await db.select().from(
    SessionsTable,
  ).where(
    eq(SessionsTable.id, ctx.params.sessionId),
  );

  if (sessionResponse.length === 0) {
    return (
      <MessageBlock
        title="Delete Session"
        backUrl="/sessions"
      >
        <p>
          Session with id {ctx.params.sessionId} not found
        </p>
      </MessageBlock>
    );
  }

  const session = sessionResponse[0];

  // Perform the deletion
  await db.delete(SessionsTable).where(
    eq(SessionsTable.id, ctx.params.sessionId),
  );

  return (
    <MessageBlock
      title="Delete Session"
      backUrl="/sessions"
    >
      <p>
        Session <span class="font-bold">{ctx.params.sessionId}</span> (User ID:
        {" "}
        {session.userId}) has been successfully deleted.
      </p>
    </MessageBlock>
  );
});
