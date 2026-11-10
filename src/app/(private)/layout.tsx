import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

// Shared shell for every private page (a nested layout: root layout →
// this layout → page). It persists across navigations: moving from "/" to
// "/patients" only swaps `children`. It only composes the pieces; it holds
// no module-specific logic. Pages keep calling `requireSession()` for the
// real authorization check.
export default function PrivateLayout({ children }: LayoutProps<"/">) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        {/* SidebarInset renders the page's <main> element. */}
        <SidebarInset>
          <AppHeader />
          <div className="flex flex-1 flex-col">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
