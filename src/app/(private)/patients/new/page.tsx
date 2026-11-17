import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { requireSession } from "@/features/auth/session";
import { CreatePatientForm } from "@/features/patients/components/create-patient-form";

export const metadata: Metadata = {
  title: "Nuevo paciente",
};

export default function NewPatientPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-3">
        <Link
          href="/patients"
          className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Pacientes
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Nuevo paciente
          </h1>
          <p className="text-muted-foreground">
            Registrá los datos administrativos del paciente. No incluyas
            información clínica.
          </p>
        </div>
      </div>
      {/* Like every private page, it checks the session on the server. */}
      <Suspense fallback={<FormSkeleton />}>
        <AuthorizedForm />
      </Suspense>
    </div>
  );
}

async function AuthorizedForm() {
  await requireSession();
  return <CreatePatientForm />;
}

function FormSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2" aria-busy="true" aria-label="Cargando formulario">
      {Array.from({ length: 4 }, (_, index) => (
        <Skeleton key={index} className="h-14 w-full" />
      ))}
    </div>
  );
}
