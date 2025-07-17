import { FreshContext } from "$fresh/server.ts";
import { NavButton } from "../../../../components/NavButton.tsx";
import { deleteUser, DeleteUserErrors } from "../../../../utils/user_utils.ts";

export default async function DeleteUserPage(
  _req: Request,
  ctx: FreshContext,
) {
  const email = ctx.params.email;
  const deleteResult = await deleteUser(email);

  let message = "User deleted";

  if (deleteResult.isErr()) {
    switch (deleteResult.error) {
      case DeleteUserErrors.UserNotFound:
        message = "Can't delete user, user not found";
        break;
      case DeleteUserErrors.UserIsProtected:
        message = "Can't delete user, user is protected";
        break;
      default:
        message = "Can't delete user, unknown error";
        break;
    }
  }

  return (
    <div class="flex flex-col gap-2 max-w-md mx-auto">
      <p>{message}</p>
      <NavButton href="/users">Back</NavButton>
    </div>
  );
}
