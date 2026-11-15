import { Skeleton } from "@/components/ui/skeleton";

import { getMyPatients } from "../queries";
import { PatientCards } from "./patient-cards";
import { toPatientDisplay } from "./patient-display";
import { PatientsEmpty } from "./patients-empty";
import { PatientsTable } from "./patients-table";

// Server Component: the query runs on the server and only HTML reaches the
// browser. If the query fails, the error bubbles up to the nearest
// error.tsx boundary.
export async function PatientList() {
  const patients = await getMyPatients();

  if (patients.length === 0) {
    return <PatientsEmpty />;
  }

  const today = new Date();
  const rows = patients.map((patient) => toPatientDisplay(patient, today));

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        {patients.length === 1
          ? "1 paciente"
          : `${patients.length} pacientes`}
      </p>
      {/* Same data, two layouts: a table on desktop, cards on mobile. */}
      <div className="hidden md:block">
        <PatientsTable patients={rows} />
      </div>
      <div className="md:hidden">
        <PatientCards patients={rows} />
      </div>
    </div>
  );
}

export function PatientListSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-label="Cargando pacientes">
      <Skeleton className="h-4 w-24" />
      {Array.from({ length: 4 }, (_, index) => (
        <Skeleton key={index} className="h-14 w-full" />
      ))}
    </div>
  );
}
