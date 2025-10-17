import { NavTextLink } from "./NavTextLink.tsx";
import { LogoutButton } from "@/islands/LogoutButton.tsx";
import { twJoin } from "tailwind-merge";

export default function Menu(
  props: {
    class?: string;
    currentPath: string;
    isRootUser?: boolean;
    userEmail?: string;
  },
) {
  const classes = twJoin(
    "flex flex-col h-full",
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
    // Only show Secunet Overtime to root user
    ...(props.isRootUser
      ? [{
        href: "/secunet-overtime",
        label: "Secunet Overtime",
        isActive: props.currentPath === "/secunet-overtime",
      }]
      : []),
  ];

  return (
    <div class={classes}>
      {/* Scrollable menu links */}
      <div class="flex flex-col gap-4 flex-grow overflow-y-auto">
        {links.map((link) => (
          <NavTextLink
            href={link.href}
            isActive={link.isActive}
            key={link.href}
          >
            {link.label}
          </NavTextLink>
        ))}
        <LogoutButton class="tw-stretch" />
      </div>

      {
        /* TODO: add an indicator that the menu is scrollable,
      if some parts of it are not visible.
      Use &#x2304; (unicode chevron down)
      and a tailwind-motion bounce animation */
      }

      {/* Fixed user info at bottom */}
      {props.userEmail && (
        <div class="mt-4 pt-3 border-t border-gray-300">
          <p class="text-sm text-gray-600">
            Logged in as: {props.userEmail}
          </p>
        </div>
      )}
    </div>
  );
}
