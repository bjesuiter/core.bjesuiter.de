import { NavTextLink } from "./NavTextLink.tsx";
import { LogoutButton } from "@/islands/LogoutButton.tsx";
import { twJoin } from "tailwind-merge";

export default function Menu(props: { class?: string; currentPath: string }) {
  const classes = twJoin(
    "flex flex-col gap-4",
    props.class ?? "",
  );

  const links = [
    {
      href: "/home",
      label: "Home",
      isActive: props.currentPath === "/home",
    },
    {
      href: "/users",
      label: "Manage Users",
      isActive: props.currentPath === "/users",
    },
    {
      href: "/sessions",
      label: "Manage Sessions",
      isActive: props.currentPath === "/sessions",
    },
    {
      href: "/ddns-profiles",
      label: "Manage DDNS Profiles",
      isActive: props.currentPath === "/ddns-profiles",
    },
    {
      href: "/connected-services",
      label: "Manage Connected Services",
      isActive: props.currentPath === "/connected-services",
    },
    {
      href: "/permissions",
      label: "Manage Permissions (TODO)",
      isActive: props.currentPath === "/permissions",
    },
  ];

  return (
    <div class={classes}>
      {links.map((link) => (
        <NavTextLink href={link.href} isActive={link.isActive} key={link.href}>
          {link.label}
        </NavTextLink>
      ))}
      <LogoutButton class="tw-stretch" />
    </div>
  );
}
