import { Users, type LucideIcon } from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

// Single source of truth for the private menu. To add a module, add an
// entry here: the sidebar renders and highlights it automatically.
export const NAV_ITEMS: readonly NavItem[] = [
  { title: "Pacientes", href: "/patients", icon: Users },
];

// A section is active on its own page and on any page nested under it
// (e.g. "/patients/123"), but not on a sibling that shares the prefix
// (e.g. "/patients-archive").
export function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
