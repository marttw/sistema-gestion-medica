import Link from "next/link";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { PatientDisplay } from "./patient-display";

// Desktop view: one row per patient.
export function PatientsTable({ patients }: { patients: PatientDisplay[] }) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4">Paciente</TableHead>
            <TableHead>DNI</TableHead>
            <TableHead>Edad</TableHead>
            <TableHead>Contacto</TableHead>
            <TableHead className="pr-4">Cobertura</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => (
            <TableRow key={patient.id}>
              <TableCell className="pl-4 font-medium">
                <Link
                  href={patient.detailHref}
                  className="underline-offset-4 hover:underline"
                >
                  {patient.fullName}
                </Link>
              </TableCell>
              <TableCell className="tabular-nums">
                {patient.documentNumber}
              </TableCell>
              <TableCell>
                <div>{patient.age}</div>
                <div className="text-xs text-muted-foreground tabular-nums">
                  {patient.birthDate}
                </div>
              </TableCell>
              <TableCell>
                <div>{patient.phone ?? <Missing />}</div>
                {patient.email && (
                  <div className="text-xs text-muted-foreground">
                    {patient.email}
                  </div>
                )}
              </TableCell>
              <TableCell className="pr-4">
                {patient.healthInsurance ? (
                  <>
                    <div>{patient.healthInsurance}</div>
                    {patient.insuranceNumber && (
                      <div className="text-xs text-muted-foreground tabular-nums">
                        N.º {patient.insuranceNumber}
                      </div>
                    )}
                  </>
                ) : (
                  <Missing label="Sin cobertura" />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function Missing({ label = "Sin datos" }: { label?: string }) {
  return <span className="text-muted-foreground">{label}</span>;
}
