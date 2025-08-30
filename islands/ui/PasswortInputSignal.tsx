import { computed, signal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { Icon } from "../../lib/fresh-iconify/Icon.tsx";

const showPassword = signal(false);

export function PasswortInput(
  props: { placeholder?: string; inputName?: string },
) {
  console.log("PasswortInput rendered");

  const inputType = computed(() => showPassword.value ? "text" : "password");
  const inputPlaceholder = computed(() =>
    showPassword.value ? (props.placeholder ?? "myPassword") : "********"
  );

  useEffect(() => {
    console.log("PasswortInput - showPassword changed to:", showPassword.value);
    console.log("PasswortInput - inputType:", inputType.value);
    console.log("PasswortInput - inputPlaceholder:", inputPlaceholder.value);
  }, [showPassword]);

  return (
    <div class="relative">
      <button
        class="cursor-pointer absolute right-4 top-1/2 -translate-y-1/2 z-10 p-1"
        type="button"
        onClick={() => showPassword.value = !showPassword.value}
      >
        {showPassword.value
          ? (
            <Icon class="text-2xl icon-[mdi-light--eye-off] align-middle active:text-xl" />
          )
          : (
            <Icon class="text-2xl icon-[mdi-light--eye] align-middle active:text-xl" />
          )}
      </button>
      <input
        type={inputType.value}
        name={props.inputName ?? "password"}
        placeholder={inputPlaceholder.value}
        class="pr-12"
        required
      />
    </div>
  );
}
