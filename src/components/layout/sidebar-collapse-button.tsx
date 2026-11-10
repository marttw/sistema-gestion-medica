"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { useSidebar } from "@/components/ui/sidebar";

// Round button on the sidebar's edge that collapses or expands it on
// desktop. On mobile the sidebar is a sliding panel opened from the
// header, so this button is not rendered there.
export function SidebarCollapseButton() {
  const { state, toggleSidebar, isMobile } = useSidebar();
  if (isMobile) return null;

  const expanded = state === "expanded";
  const label = expanded ? "Contraer menú" : "Expandir menú";
  const Icon = expanded ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      onClick={toggleSidebar}
      aria-label={label}
      aria-expanded={expanded}
      title={`${label} (Ctrl+B)`}
      className="absolute top-16 -right-3.5 z-20 flex size-7 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-sm transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Icon className="size-4" aria-hidden="true" />
    </button>
  );
}
