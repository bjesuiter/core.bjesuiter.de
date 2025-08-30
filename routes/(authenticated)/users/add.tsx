import { Card } from "@/components/Card.tsx";
import { FormFieldWithLabel } from "@/components/FormFieldWithLabel.tsx";
import { NavButton } from "@/components/NavButton.tsx";
import { Toolbar } from "@/components/Toolbar.tsx";
import { define } from "@/lib/fresh/defineHelpers.ts";
import {
  generateStrongPassword,
  registerUser,
  RegisterUserErrors,
} from "@/utils/user_utils.ts";
import { InitPasswordOption } from "./(_islands)/InitPasswordOption.tsx";

export default define.page(
  async (ctx) => {
    // HANDLE POST REQUEST, IF ANY
    if (ctx.req.method === "POST") {
      const formData = await ctx.req.formData();

      const initPasswordOption = formData.get("init_password_option");
      if (!initPasswordOption) {
        return new Response(
          "init_password_option is required: valid values: generate_password, custom_password",
          {
            status: 400,
          },
        );
      }

      const password = initPasswordOption === "generate_password"
        ? generateStrongPassword()
        : formData.get("password");

      const email = formData.get("email");
      const label = formData.get("label");

      //NOTE: registerUser() will validate the input thoroughly, so we can skip the validation here
      const result = await registerUser(email, label, password);

      return result.match(
        (user) => {
          const generatedPassword = initPasswordOption === "generate_password"
            ? password
            : undefined;

          if (initPasswordOption === "generate_password" && generatedPassword) {
            return (
              <Card class="flex flex-col gap-4 w-[30rem] mx-auto">
                <Toolbar
                  title="Add User"
                  actionsSlotLeft={<NavButton href="/users">Back</NavButton>}
                  actionsSlotRight={
                    <NavButton href="/users/add">Add Another User</NavButton>
                  }
                />
                <p>User added: {user.email}</p>
                <p>
                  Generated password:{" "}
                  <code class="font-mono p-2 rounded-md bg-gray-100">
                    {generatedPassword}
                  </code>
                </p>
              </Card>
            );
          } else {
            return (
              <Card class="flex flex-col gap-4 w-[30rem] mx-auto">
                <Toolbar
                  title="Add User"
                  actionsSlotLeft={<NavButton href="/users">Back</NavButton>}
                  actionsSlotRight={
                    <NavButton href="/users/add">Add Another User</NavButton>
                  }
                />
                <p>User added: {user.email}</p>
              </Card>
            );
          }
        },
        (error) => {
          // TODO: @bjesuiter: add these errors to rendering
          switch (error) {
            case RegisterUserErrors.EmailInvalid:
              return new Response(
                "E-Mail is required and must be a valid e-mail address",
                {
                  status: 400,
                },
              );
            case RegisterUserErrors.LabelInvalid:
              return new Response(
                "Display Name is required and must be a non-empty string",
                {
                  status: 400,
                },
              );
            case RegisterUserErrors.PasswordTooShort:
              return new Response(
                "Password is required and must be at least 8 characters long",
                {
                  status: 400,
                },
              );
            case RegisterUserErrors.UserAlreadyExists:
              return new Response("User already exists", {
                status: 400,
              });
            default:
              return new Response("An unknown error occurred", {
                status: 400,
              });
          }
        },
      );
    }

    return (
      <Card class="flex flex-col gap-4 mx-auto w-[30rem]">
        <Toolbar
          title="Add User"
          actionsSlotLeft={<NavButton href="/users">Back</NavButton>}
        />
        <form
          class="flex flex-col gap-6 max-w-md"
          action="/users/add"
          method="POST"
        >
          <FormFieldWithLabel label="E-Mail" forId="email">
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Email"
              required
              class="border border-gray-300 rounded-md p-2"
            />
          </FormFieldWithLabel>

          <FormFieldWithLabel label="Display Name" forId="label">
            <input
              type="text"
              name="label"
              id="label"
              placeholder="Display Name"
              required
              class="border border-gray-300 rounded-md p-2"
            />
          </FormFieldWithLabel>

          <FormFieldWithLabel label="Password" forId="password">
            <InitPasswordOption />
          </FormFieldWithLabel>

          <button
            type="submit"
            class="primary-btn"
          >
            Add User
          </button>
        </form>
      </Card>
    );
  },
);
