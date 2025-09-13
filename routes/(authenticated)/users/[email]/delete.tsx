import { NavButton } from "@/components/NavButton.tsx";
import { deleteUser, DeleteUserErrors } from "@/utils/user_utils.ts";
import { Card } from "@/components/Card.tsx";
import { Toolbar } from "@/components/Toolbar.tsx";
import { define } from "@/lib/fresh/defineHelpers.ts";

export default define.page(async (ctx) => {
  const email = ctx.params.email;
  const authResult = await ctx.state.authPromise;
  if (authResult.type === "response") {
    return authResult.response;
  }
  const { user } = authResult;
  const deleteResult = await deleteUser(email, user.email);

  let message = "User deleted";

  if (deleteResult.isErr()) {
    switch (deleteResult.error) {
      case DeleteUserErrors.UserNotFound:
        message = "Can't delete user, user not found";
        break;
      case DeleteUserErrors.UserIsProtected:
        message = "Can't delete user, user is protected";
        break;
      case DeleteUserErrors.UserIsCurrentUser:
        message = "Can't delete user, user is current user";
        break;
      default:
        message = "Can't delete user, unknown error";
        break;
    }
  }

  return (
    <Card class="flex flex-col gap-2 max-w-md mx-auto">
      <Toolbar
        title={`Delete User ${email}`}
        actionsSlotLeft={<NavButton href="/users">Back</NavButton>}
      />
      <p>{message}</p>
    </Card>
  );
});
