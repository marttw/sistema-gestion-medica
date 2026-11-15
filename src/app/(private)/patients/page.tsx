import type { Metadata } from "next";
import { Suspense } from "react";

import {
  PatientList,
  PatientListSkeleton,
} from "@/features/patients/components/patient-list";

export const metadata: Metadata = {
  title: "Pacientes",
};

export default function PatientsPage() {
  return (
    <div className="flex flex-col gap-6 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Pacientes
        </h1>
        <p className="text-muted-foreground">
          Datos administrativos de tus pacientes.
        </p>
      </div>
      {/* The list reads the session and the database at request time. */}
      <Suspense fallback={<PatientListSkeleton />}>
        <PatientList />
      </Suspense>
    </div>
  );
}
