import { FreshContext } from "fresh";
import { Card } from "@/components/Card.tsx";
import { FormFieldWithLabel } from "@/components/FormFieldWithLabel.tsx";
import { NavButton } from "@/components/NavButton.tsx";
import { Toolbar } from "@/components/Toolbar.tsx";
import { getUserByEmail, GetUserErrors } from "@/utils/user_utils.ts";

export default async function EditUserPage(
  ctx: FreshContext,
) {
  const email = ctx.params.email;
  const userResult = await getUserByEmail(email);
  if (userResult.isErr() && userResult.error === GetUserErrors.UserNotFound) {
    return <p>User not found!</p>;
  }
  if (userResult.isErr()) {
    return <p>Unknown error!</p>;
  }

  const user = {
    id: userResult.value.id,
    email: userResult.value.email,
    label: userResult.value.label,
  };

  return (
    <Card class="mx-auto w-[30rem]">
      <Toolbar
        title={`Edit User ${user.email}`}
        titleSlot={
          <h1 class="flex gap-2 items-center">
            Edit User
          </h1>
        }
        actionsSlotLeft={<NavButton href="/users">Back</NavButton>}
        actionsSlotRight={
          <span class="text-base rounded-md px-2 py-1 border border-teal-700 font-normal text-teal-700">
            {user.label}
          </span>
        }
      />

      <form
        method="post"
        action={`/users/edit/${user.email}`}
        class="flex flex-col gap-6 max-w-md mt-6"
      >
        <FormFieldWithLabel label="ID" forId="id">
          <input type="text" name="id" id="id" value={user.id} disabled />
        </FormFieldWithLabel>
        <FormFieldWithLabel label="E-Mail" forId="email">
          <input type="email" name="email" id="email" value={user.email} />
        </FormFieldWithLabel>
        <FormFieldWithLabel label="Display Name" forId="label">
          <input type="text" id="label" name="label" value={user.label} />
        </FormFieldWithLabel>

        {/* <p>TODO: build a password change component</p> */}
        <button type="submit" class="primary-btn">Save</button>
      </form>
    </Card>
  );
}
