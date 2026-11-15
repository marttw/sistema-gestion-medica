import "server-only";

import { requireSession } from "@/features/auth/session";

import { findPatientsByDoctor } from "./repository";
import type { PatientListItem } from "./types";

// Entry point for the UI. It takes no doctor id on purpose: the doctor is
// always the one in the authenticated session, so there is no way to ask
// for another doctor's patients.
export async function getMyPatients(): Promise<PatientListItem[]> {
  const doctor = await requireSession();
  return findPatientsByDoctor(doctor.id);
}
