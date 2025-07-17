import { FreshContext } from "$fresh/server.ts";
import { Card } from "../../../../components/Card.tsx";
import { NavButton } from "../../../../components/NavButton.tsx";
import { Toolbar } from "../../../../components/Toolbar.tsx";
import { getUser, GetUserErrors } from "../../../../utils/user_utils.ts";

export default async function EditUserPage(
  _request: Request,
  ctx: FreshContext,
) {
  const email = ctx.params.email;
  const userResult = await getUser(email);
  if (userResult.isErr() && userResult.error === GetUserErrors.UserNotFound) {
    return <p>User not found!</p>;
  }
  if (userResult.isErr()) {
    return <p>Unknown error!</p>;
  }

  const user = userResult.value;

  return (
    <Card>
      <Toolbar
        title={`Edit User ${user.email}`}
        actionsSlotLeft={<NavButton href="/users">Back</NavButton>}
      />

      <form
        method="post"
        action={`/users/edit/${user.email}`}
        class="flex flex-col gap-2 max-w-md"
      >
        <input type="hidden" name="oldEmail" value={user.email} />
        <label for="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={user.email}
          disabled
        />
        <label for="label">Display Name</label>
        <input type="text" id="label" name="label" value={user.label} />

        <p>TODO: build a password change component</p>
        <button type="submit" class="button">Save</button>
      </form>
    </Card>
  );
}
