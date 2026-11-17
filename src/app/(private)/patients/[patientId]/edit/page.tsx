import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { EditPatientForm } from "@/features/patients/components/edit-patient-form";
import { getMyPatient } from "@/features/patients/queries";
import { toPatientFormValues } from "@/features/patients/schemas/patient-schema";

// Generic, like the detail: no patient names in the browser history.
export const metadata: Metadata = {
  title: "Editar paciente",
};

// /patients/[patientId]/edit. A missing or foreign patient renders the
// not-found.tsx of [patientId]; a failure, its error.tsx.
export default function EditPatientPage({
  params,
}: PageProps<"/patients/[patientId]/edit">) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6">
      <Suspense fallback={<EditPatientSkeleton />}>
        <EditPatientContent params={params} />
      </Suspense>
    </div>
  );
}

async function EditPatientContent({
  params,
}: Pick<PageProps<"/patients/[patientId]/edit">, "params">) {
  const { patientId } = await params;
  // Same authorized lookup as the detail page: session + ownership.
  const patient = await getMyPatient(patientId);
  if (!patient) notFound();

  return (
    <>
      <div className="flex flex-col gap-3">
        <Link
          href={`/patients/${patient.id}`}
          className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {patient.firstName} {patient.lastName}
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Editar paciente
          </h1>
          <p className="text-muted-foreground">
            Actualizá los datos administrativos del paciente. No incluyas
            información clínica.
          </p>
        </div>
      </div>
      <EditPatientForm
        patientId={patient.id}
        defaultValues={toPatientFormValues(patient)}
      />
    </>
  );
}

function EditPatientSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Cargando paciente">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-48" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-14 w-full" />
        ))}
      </div>
    </div>
  );
}
