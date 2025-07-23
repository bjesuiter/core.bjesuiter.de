import { JSX } from "preact/jsx-runtime";

export function FormFieldWithLabel({
  label,
  forId,
  children,
}: {
  label: string;
  forId: string;
  children: JSX.Element | JSX.Element[];
}) {
  return (
    <label for={forId} class="flex flex-col gap-[0.3rem]">
      <span class="pl-[0.5ch]">{label}</span>
      {children}
    </label>
  );
}
