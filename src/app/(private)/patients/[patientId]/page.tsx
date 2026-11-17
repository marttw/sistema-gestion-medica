import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import {
  PatientDetail,
  PatientDetailSkeleton,
} from "@/features/patients/components/patient-detail";
import { getMyPatient } from "@/features/patients/queries";

// Generic on purpose: tab titles end up in the browser history and in
// bookmarks, where a patient's name should not be stored.
export const metadata: Metadata = {
  title: "Paciente",
};

// Dynamic route: [patientId] in the folder name becomes params.patientId.
export default function PatientPage({
  params,
}: PageProps<"/patients/[patientId]">) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6">
      <Link
        href="/patients"
        className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Pacientes
      </Link>
      {/* With Cache Components, params are request-time data: reading them
          (and the database) happens inside Suspense, after the static shell. */}
      <Suspense fallback={<PatientDetailSkeleton />}>
        <PatientDetailContent params={params} />
      </Suspense>
    </div>
  );
}

async function PatientDetailContent({
  params,
}: Pick<PageProps<"/patients/[patientId]">, "params">) {
  const { patientId } = await params;
  // Checks the session and ownership; null for invalid, missing or foreign ids.
  const patient = await getMyPatient(patientId);
  if (!patient) notFound();

  return <PatientDetail patient={patient} today={new Date()} />;
}
