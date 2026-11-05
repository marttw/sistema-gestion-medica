import { redirect } from "next/navigation";
import { Suspense } from "react";

import { getSession } from "@/features/auth/session";

export default function HomePage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-3 px-4 py-12 text-center">
      {/* Reads the session at request time, so it must sit inside Suspense. */}
      <Suspense fallback={<p className="text-muted-foreground">Cargando…</p>}>
        <Welcome />
      </Suspense>
    </main>
  );
}

async function Welcome() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <>
      <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
        Hola, {session.user.name}
      </h1>
      <p className="max-w-xl text-muted-foreground sm:text-lg">
        Iniciaste sesión como {session.user.email}. Pronto vas a poder
        administrar a tus pacientes desde acá.
      </p>
    </>
  );
}
