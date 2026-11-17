import "server-only";

import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";

import type { PatientFormData } from "./schemas/patient-schema";
import type { PatientDetail, PatientListItem } from "./types";

// Only the administrative columns the UI shows (never doctorId or
// timestamps). `satisfies` checks the shape against Prisma's types without
// widening it.
const patientSelect = {
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
    select: patientSelect,
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });
}

// One patient, only if it belongs to the given doctor. Both conditions go in
// the same WHERE, so another doctor's patient and a missing one look the same
// (null): there is no separate ownership check that could be forgotten, and
// no way to learn that an id exists in someone else's account.
export async function findPatientForDoctor(
  doctorId: string,
  patientId: string,
): Promise<PatientDetail | null> {
  return db.patient.findFirst({
    where: { id: patientId, doctorId },
    select: patientSelect,
  });
}

// Inserts a patient for the given doctor. The doctorId must come from the
// session. Throws DuplicateDocumentNumberError when the doctor already has a
// patient with that DNI: the database's unique constraint decides, so two
// simultaneous requests cannot both succeed.
export async function insertPatient(
  doctorId: string,
  data: PatientFormData,
): Promise<{ id: string }> {
  try {
    return await db.patient.create({
      data: { ...data, doctorId },
      select: { id: true },
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new DuplicateDocumentNumberError();
    }
    throw error;
  }
}

export class DuplicateDocumentNumberError extends Error {
  constructor() {
    super("The doctor already has a patient with this document number.");
    this.name = "DuplicateDocumentNumberError";
  }
}

// P2002: "Unique constraint failed". On the patient table the only unique
// constraints are the primary key (generated, never repeats) and
// (doctorId, documentNumber).
function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}
