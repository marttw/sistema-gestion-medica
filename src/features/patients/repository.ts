import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";

import type { PatientListItem } from "./types";

// Only the columns the list shows. `satisfies` checks the shape against
// Prisma's types without widening it.
const patientListSelect = {
  id: true,
  firstName: true,
  lastName: true,
  documentNumber: true,
  birthDate: true,
  phone: true,
  email: true,
  healthInsurance: true,
  insuranceNumber: true,
} satisfies Prisma.PatientSelect;

// Persistence only: no session, no business rules. It trusts the doctorId it
// receives, so it must only be called from code that took that id from the
// authenticated session (see queries.ts), never from user input.
export async function findPatientsByDoctor(
  doctorId: string,
): Promise<PatientListItem[]> {
  return db.patient.findMany({
    where: { doctorId },
    select: patientListSelect,
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });
}
