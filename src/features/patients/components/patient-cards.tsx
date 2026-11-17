import { ChevronRight } from "lucide-react";
import Link from "next/link";

import type { PatientDisplay } from "./patient-display";

// Mobile view: one stacked card per patient, no horizontal scrolling.
// The whole card opens the detail: the name's link stretches over it with an
// ::after overlay, so there is a single link per card (one tab stop, one
// accessible name) instead of wrapping all the data in an <a>.
export function PatientCards({ patients }: { patients: PatientDisplay[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {patients.map((patient) => (
        <li
          key={patient.id}
          className="relative rounded-lg border p-4 transition-colors has-[a:hover]:bg-muted/50"
        >
          <Link
            href={patient.detailHref}
            className="flex items-center justify-between gap-2 font-medium after:absolute after:inset-0 after:rounded-lg"
          >
            {patient.fullName}
            <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
          </Link>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
            <dt className="text-muted-foreground">DNI</dt>
            <dd className="tabular-nums">{patient.documentNumber}</dd>

            <dt className="text-muted-foreground">Edad</dt>
            <dd>
              {patient.age}{" "}
              <span className="text-muted-foreground tabular-nums">
                ({patient.birthDate})
              </span>
            </dd>

            <dt className="text-muted-foreground">Teléfono</dt>
            <dd>{patient.phone ?? <Missing />}</dd>

            {patient.email && (
              <>
                <dt className="text-muted-foreground">Email</dt>
                <dd className="break-all">{patient.email}</dd>
              </>
            )}

            <dt className="text-muted-foreground">Cobertura</dt>
            <dd>
              {patient.healthInsurance ? (
                <>
                  {patient.healthInsurance}
                  {patient.insuranceNumber && (
                    <span className="text-muted-foreground tabular-nums">
                      {" "}
                      · N.º {patient.insuranceNumber}
                    </span>
                  )}
                </>
              ) : (
                <Missing label="Sin cobertura" />
              )}
            </dd>
          </dl>
        </li>
      ))}
    </ul>
  );
}

function Missing({ label = "Sin datos" }: { label?: string }) {
  return <span className="text-muted-foreground">{label}</span>;
}
