"use client"; // Error boundaries must be Client Components.

import Link from "next/link";

import { LoadError } from "@/components/load-error";
import { buttonVariants } from "@/components/ui/button";

// Shown when loading a patient fails (e.g. the database is down). A missing
// or foreign patient is not an error: that case renders not-found.tsx.
export default function PatientError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8 sm:px-6">
      <LoadError title="No pudimos cargar el paciente" error={error} retry={retry}>
        <Link href="/patients" className={buttonVariants({ variant: "ghost" })}>
          Volver a pacientes
        </Link>
      </LoadError>
    </div>
  );
}
