import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { requireSession } from "@/features/auth/session";

// Shared shell for every private page. The `(private)` folder is a route
// group: it organizes routes without adding a segment to the URL.
// The session is read inside Suspense, never awaited at the top level,
// so the shell renders immediately and the doctor's name streams in.
export default function PrivateLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <p className="font-heading font-semibold tracking-tight">
            Sistema de Gestión Médica
          </p>
          <div className="flex items-center gap-3">
            <Suspense fallback={<Skeleton className="h-4 w-28" />}>
              <CurrentUserName />
            </Suspense>
            <LogoutButton />
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}

async function CurrentUserName() {
  const user = await requireSession();
  return (
    <span className="hidden text-sm text-muted-foreground sm:inline">
      {user.name}
    </span>
  );
}
