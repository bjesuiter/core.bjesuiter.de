import { FreshContext } from "fresh";
import { NavButton } from "@/components/NavButton.tsx";
import { deleteUser, DeleteUserErrors } from "@/utils/user_utils.ts";
import { Card } from "@/components/Card.tsx";
import { Toolbar } from "@/components/Toolbar.tsx";
import { FreshCtxState } from "@/types/fresh_ctx_state.type.ts";

export default async function DeleteUserPage(
  ctx: FreshContext<FreshCtxState>,
) {
  const email = ctx.params.email;
  const deleteResult = await deleteUser(email, ctx.state.user.email);

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
}
