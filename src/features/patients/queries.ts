import "server-only";

import { z } from "zod";

import { requireSession } from "@/features/auth/session";

import { findPatientForDoctor, findPatientsByDoctor } from "./repository";
import type { PatientDetail, PatientListItem } from "./types";

// Entry points for the UI. They take no doctor id on purpose: the doctor is
// always the one in the authenticated session, so there is no way to ask
// for another doctor's patients.
export async function getMyPatients(): Promise<PatientListItem[]> {
  const doctor = await requireSession();
  return findPatientsByDoctor(doctor.id);
}

const patientIdSchema = z.uuid();

// One of the session doctor's patients, or null when the id is not a UUID,
// the patient does not exist, or it belongs to another doctor. The three
// cases are deliberately indistinguishable to the caller (and the browser).
export async function getMyPatient(
  patientId: string,
): Promise<PatientDetail | null> {
  const doctor = await requireSession();
  // The column is a UUID: PostgreSQL rejects anything else with an error,
  // which would show "could not load" instead of "not found".
  if (!patientIdSchema.safeParse(patientId).success) return null;
  return findPatientForDoctor(doctor.id, patientId);
}
