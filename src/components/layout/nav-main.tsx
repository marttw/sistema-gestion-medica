"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import { NAV_ITEMS, isActivePath } from "./navigation";

// The only client-side piece of the menu: it needs the current URL
// (usePathname) to highlight the active section.
export function NavMain() {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {NAV_ITEMS.map((item) => {
            const isActive = isActivePath(pathname, item.href);
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  // Base UI's `render` prop: the button renders as a Next.js
                  // Link, keeping the menu styles and client-side navigation.
                  render={<Link href={item.href} />}
                  isActive={isActive}
                  aria-current={isActive ? "page" : undefined}
                  tooltip={item.title}
                  onClick={() => {
                    // On mobile the menu is a sliding panel: close it after
                    // choosing a section.
                    if (isMobile) setOpenMobile(false);
                  }}
                >
                  <item.icon aria-hidden="true" />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
