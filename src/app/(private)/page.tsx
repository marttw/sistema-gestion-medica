import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { requireSession } from "@/features/auth/session";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-12 text-center">
      {/* Reads the session at request time, so it must sit inside Suspense. */}
      <Suspense fallback={<WelcomeSkeleton />}>
        <Welcome />
      </Suspense>
    </main>
  );
}

async function Welcome() {
  // Secure check: validates the session against the database.
  const user = await requireSession();

  return (
    <>
      <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
        Hola, {user.name}
      </h1>
      <p className="max-w-xl text-muted-foreground sm:text-lg">
        Iniciaste sesión como {user.email}. Pronto vas a poder administrar a
        tus pacientes desde acá.
      </p>
    </>
  );
}

function WelcomeSkeleton() {
  return (
    <div
      className="flex w-full max-w-xl flex-col items-center gap-3"
      aria-busy="true"
      aria-label="Cargando"
    >
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-5 w-full max-w-md" />
    </div>
  );
}
