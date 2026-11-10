import { Stethoscope } from "lucide-react";
import Link from "next/link";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { NavMain } from "./nav-main";
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
        <NavMain />
      </SidebarContent>
      <SidebarCollapseButton />
    </Sidebar>
  );
}
