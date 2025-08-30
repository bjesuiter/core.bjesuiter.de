import { computed, signal } from "@preact/signals";
import { Icon } from "@/lib/fresh-iconify/Icon.tsx";

const showPassword = signal(false);

export function PasswortInput(
  props: { placeholder?: string; inputName?: string; autocomplete?: string },
) {
  console.log("PasswortInput rendered");

  const inputType = computed(() => showPassword.value ? "text" : "password");
  const inputPlaceholder = computed(() =>
    showPassword.value ? (props.placeholder ?? "myPassword") : "********"
  );

  return (
    <div class="relative">
      <button
        class="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1"
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
        autocomplete={props.autocomplete ?? "current-password"}
        name={props.inputName ?? "password"}
        placeholder={inputPlaceholder.value}
        class="w-full pr-10"
        required
      />
    </div>
  );
}
