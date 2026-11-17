import { Stethoscope } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { NavMain, NavMainFallback } from "./nav-main";
import { SidebarCollapseButton } from "./sidebar-collapse-button";

// Side menu of the private area. On desktop it can collapse to icons;
// on mobile the Sidebar component turns it into a sliding panel.
// It knows nothing about the session or any specific module.
export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href="/" />}
              tooltip="Inicio"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Stethoscope className="size-4" aria-hidden="true" />
              </span>
              <span className="truncate font-heading font-semibold tracking-tight">
                Gestión Médica
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* NavMain reads the URL, which on dynamic routes is only known at
            request time (see nav-main.tsx). */}
        <Suspense fallback={<NavMainFallback />}>
          <NavMain />
        </Suspense>
      </SidebarContent>
      <SidebarCollapseButton />
    </Sidebar>
  );
}
