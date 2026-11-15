import { unstable_rethrow } from "next/navigation";
import { Suspense } from "react";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { requireSession } from "@/features/auth/session";

// Top bar of the private area: mobile menu button, signed-in doctor and logout.
export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
      {/* Mobile only: opens the sliding menu. On desktop the sidebar has its
          own collapse button on its edge. */}
      <SidebarTrigger className="-ml-1 md:hidden" aria-label="Abrir menú" />
      <Separator orientation="vertical" className="mr-1 h-4 md:hidden" />
      <div className="ml-auto flex min-w-0 items-center gap-3">
        {/* Reads the session at request time, so it must sit inside Suspense. */}
        <Suspense fallback={<CurrentUserSkeleton />}>
          <CurrentUser />
        </Suspense>
        <LogoutButton />
      </div>
    </header>
  );
}

async function CurrentUser() {
  let user;
  try {
    user = await requireSession();
  } catch (error) {
    // redirect() works by throwing: let Next.js handle it.
    unstable_rethrow(error);
    // Any other failure (e.g. the database is down) must not take down the
    // whole private shell: the header just omits the doctor's name and the
    // page's own error boundary reports the problem.
    console.error("Could not load the signed-in doctor", error);
    return null;
  }

  return (
    <div className="flex min-w-0 flex-col items-end text-right leading-tight">
      <span className="truncate text-sm font-medium">{user.name}</span>
      <span className="hidden truncate text-xs text-muted-foreground sm:block">
        {user.email}
      </span>
    </div>
  );
}

function CurrentUserSkeleton() {
  return (
    <div className="flex flex-col items-end gap-1" aria-hidden="true">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="hidden h-3 w-36 sm:block" />
    </div>
  );
}
