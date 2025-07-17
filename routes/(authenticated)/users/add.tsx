import { FreshContext, PageProps } from "$fresh/server.ts";
import { Toolbar } from "../../../components/Toolbar.tsx";
import { NavButton } from "../../../components/NavButton.tsx";
import { InitPasswordOption } from "./(_islands)/InitPasswordOption.tsx";
import {
  generateStrongPassword,
  registerUser,
  RegisterUserErrors,
} from "../../../utils/user_utils.ts";
import { Err, Ok } from "neverthrow";
import { z } from "zod/v4";

export const handler = {
  POST: async (req: Request, ctx: FreshContext) => {
    const formData = await req.formData();

    const initPasswordOption = formData.get("init_password_option");

    if (!initPasswordOption) {
      return new Response(
        "init_password_option is required: valid values: generate_password, custom_password",
        {
          status: 400,
        },
      );
    }

    let password = (initPasswordOption === "generate_password")
      ? generateStrongPassword()
      : formData.get("password");
    const email = formData.get("email");
    const label = formData.get("label");

    const result = await registerUser(email, label, password);

    result.match(
      (_user) => {
        return new Response("User registered", {
          status: 200,
        });
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

    return await ctx.render();
  },
};

export default async function AddUserPage(props: PageProps) {
  return (
    <div class="flex flex-col gap-4">
      <Toolbar
        title="Add User"
        actionsSlotLeft={<NavButton href="/users">Back</NavButton>}
      />
      <form
        class="flex flex-col gap-4 max-w-md"
        action="/users/add"
        method="POST"
      >
        <label for="email">Email</label>
        <input
          type="email"
          name="email"
          id="email"
          placeholder="Email"
          required
          class="border border-gray-300 rounded-md p-2"
        />

        <label for="label">Display Name</label>
        <input
          type="text"
          name="label"
          id="label"
          placeholder="Display Name"
          required
        />

        <label for="password">Password</label>
        <InitPasswordOption />

        <button
          type="submit"
          class="bg-cyan-500 text-white px-4 py-2 rounded-md"
        >
          Add User
        </button>
      </form>
    </div>
  );
}
