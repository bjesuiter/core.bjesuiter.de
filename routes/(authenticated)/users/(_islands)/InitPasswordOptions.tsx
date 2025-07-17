import { useState } from "preact/hooks";

export function InitPasswordOptions() {
  const [initPasswordOptions, setInitPasswordOptions] = useState<
    "generate_password" | "custom_password"
  >("generate_password");

  return (
    <>
      <div class="flex flex-row gap-4">
        <input
          type="radio"
          name="password_prefill_options"
          id="generate_password"
          value="generate_password"
          checked={initPasswordOptions === "generate_password"}
          onChange={() => {
            setInitPasswordOptions("generate_password");
          }}
        />
        <label for="generate_password">auto-generate</label>

        <input
          type="radio"
          name="password_prefill_options"
          id="custom_password"
          value="custom_password"
          checked={initPasswordOptions === "custom_password"}
          onChange={() => {
            setInitPasswordOptions("custom_password");
          }}
        />
        <label for="custom_password">custom</label>
      </div>

      {initPasswordOptions === "custom_password" && (
        <input
          type="password"
          name="password"
          id="password"
          placeholder="Password"
          required
        />
      )}

      {initPasswordOptions === "generate_password" && (
        <p>Password will be auto-generated after hitting "Add User"</p>
      )}
    </>
  );
}
