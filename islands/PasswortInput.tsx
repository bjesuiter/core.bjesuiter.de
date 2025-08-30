import { useEffect, useState } from "preact/hooks";
import { Icon } from "../lib/fresh-iconify/Icon.tsx";
import { Show } from "./ui/Show.tsx";

export function PasswortInput(
  props: { placeholder?: string; inputName?: string },
) {
  console.log("PasswortInput rendered");
  const [showPassword, setShowPassword] = useState(false);

  const inputType = showPassword ? "text" : "password";
  const inputPlaceholder = showPassword
    ? (props.placeholder ?? "myPassword")
    : "********";

  useEffect(() => {
    console.log("PasswortInput - showPassword changed to:", showPassword);
    console.log("PasswortInput - inputType:", inputType);
    console.log("PasswortInput - inputPlaceholder:", inputPlaceholder);
  }, [showPassword]);

  const toggleShowPassword = () => {
    console.log("Toggle clicked! Current showPassword:", showPassword);
    setShowPassword(!showPassword);
    console.log("After toggle, showPassword should be:", !showPassword);
  };

  return (
    <div class="relative">
      <button
        class="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1"
        type="button"
        onClick={toggleShowPassword}
      >
        <Show when={showPassword === false}>
          <Icon class="text-2xl icon-[mdi-light--eye] align-middle active:text-xl" />
        </Show>
        <Show when={showPassword === true}>
          <Icon class="text-2xl icon-[mdi-light--eye-off] align-middle active:text-xl" />
        </Show>
      </button>
      <input
        type={inputType}
        name={props.inputName ?? "password"}
        placeholder={inputPlaceholder}
        class="pr-12"
        required
      />
    </div>
  );
}
