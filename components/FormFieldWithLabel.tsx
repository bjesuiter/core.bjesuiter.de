import { JSX } from "preact/jsx-runtime";

export function FormFieldWithLabel({
  label,
  forId,
  children,
  inline,
}: {
  label: string;
  forId: string;
  children: JSX.Element | JSX.Element[];
  inline?: boolean;
}) {
  const baseClass = inline
    ? `flex flex-row items-center gap-2`
    : `flex flex-col gap-[0.3rem]`;

  return (
    <label for={forId} class={baseClass}>
      <span class={inline ? "mr-2" : "pl-[0.5ch]"}>{label}</span>
      {children}
    </label>
  );
}
