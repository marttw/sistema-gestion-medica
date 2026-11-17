import type { ReactNode } from "react";

import { Skeleton } from "@/components/ui/skeleton";

import type { PatientDetail as PatientDetailData } from "../types";
import { toPatientDisplay } from "./patient-display";

// Server Component: receives a patient already authorized by getMyPatient()
// and only renders it. Same formatting as the list (toPatientDisplay).
export function PatientDetail({
  patient,
  today,
}: {
  patient: PatientDetailData;
  today: Date;
}) {
  const display = toPatientDisplay(patient, today);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {patient.firstName} {patient.lastName}
        </h1>
        <p className="text-muted-foreground">
          DNI <span className="tabular-nums">{display.documentNumber}</span> ·{" "}
          {display.age}
        </p>
      </div>

      <DetailSection title="Datos personales">
        <DetailItem label="Nombre">{patient.firstName}</DetailItem>
        <DetailItem label="Apellido">{patient.lastName}</DetailItem>
        <DetailItem label="DNI">
          <span className="tabular-nums">{display.documentNumber}</span>
        </DetailItem>
        <DetailItem label="Fecha de nacimiento">
          <span className="tabular-nums">{display.birthDate}</span>{" "}
          <span className="text-muted-foreground">({display.age})</span>
        </DetailItem>
      </DetailSection>

      <DetailSection title="Contacto">
        <DetailItem label="Teléfono">
          {patient.phone && display.phone ? (
            // E.164 is exactly what tel: links expect: one tap to call on mobile.
            <a href={`tel:${patient.phone}`} className="underline-offset-4 hover:underline">
              {display.phone}
            </a>
          ) : (
            <Missing />
          )}
        </DetailItem>
        <DetailItem label="Correo electrónico">
          {patient.email ? (
            <a
              href={`mailto:${patient.email}`}
              className="break-all underline-offset-4 hover:underline"
            >
              {patient.email}
            </a>
          ) : (
            <Missing />
          )}
        </DetailItem>
      </DetailSection>

      <DetailSection title="Cobertura médica">
        <DetailItem label="Obra social o prepaga">
          {patient.healthInsurance ?? <Missing label="Sin cobertura" />}
        </DetailItem>
        <DetailItem label="Número de afiliado">
          {patient.insuranceNumber ? (
            <span className="tabular-nums">{patient.insuranceNumber}</span>
          ) : (
            <Missing />
          )}
        </DetailItem>
      </DetailSection>
    </div>
  );
}

// One block of related fields. A description list (<dl>) is the semantic
// element for label/value pairs: screen readers announce them as such.
// One column on mobile, two from the `sm` breakpoint.
function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border p-4 sm:p-6">
      <h2 className="font-heading text-base font-semibold">{title}</h2>
      <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">{children}</dl>
    </section>
  );
}

function DetailItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function Missing({ label = "Sin datos" }: { label?: string }) {
  return <span className="text-muted-foreground">{label}</span>;
}

export function PatientDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Cargando paciente">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-40" />
      </div>
      {Array.from({ length: 3 }, (_, index) => (
        <Skeleton key={index} className="h-36 w-full" />
      ))}
    </div>
  );
}
