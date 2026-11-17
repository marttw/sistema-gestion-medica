"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireSession } from "@/features/auth/session";

import { DuplicateDocumentNumberError, updatePatientForDoctor } from "../repository";
import { patientSchema } from "../schemas/patient-schema";
import {
  DUPLICATE_DNI_MESSAGE,
  firstErrorPerField,
  INVALID_INPUT_MESSAGE,
  type PatientActionResult,
} from "./patient-action-result";

const NOT_FOUND_MESSAGE =
  "No encontramos este paciente. Puede que ya no figure en tu listado.";
const UNEXPECTED_ERROR_MESSAGE =
  "No pudimos guardar los cambios. Intentá nuevamente.";

const patientIdSchema = z.uuid();

// The form binds the id (updatePatient.bind(null, id)), but bound arguments
// travel from the browser like any other: both parameters are untrusted.
// Ownership is enforced by the UPDATE itself (WHERE id AND doctorId).
export async function updatePatient(
  patientId: unknown,
  input: unknown,
): Promise<PatientActionResult> {
  // 1. Authorization: the doctor comes from the session.
  const doctor = await requireSession();

  // 2. A malformed id cannot match any patient: answer like a missing one,
  //    without sending it to PostgreSQL (the UUID column would reject it).
  const id = patientIdSchema.safeParse(patientId);
  if (!id.success) return { ok: false, error: NOT_FOUND_MESSAGE };

  // 3. Same validation as the create form: one definition of a valid patient.
  const parsed = patientSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: INVALID_INPUT_MESSAGE,
      fieldErrors: firstErrorPerField(parsed.error.issues),
    };
  }

  // 4. Persist only if the patient is this doctor's. No row updated means
  //    missing or another doctor's: the same answer for both.
  try {
    const updated = await updatePatientForDoctor(doctor.id, id.data, parsed.data);
    if (!updated) return { ok: false, error: NOT_FOUND_MESSAGE };
  } catch (error) {
    if (error instanceof DuplicateDocumentNumberError) {
      return { ok: false, fieldErrors: { documentNumber: DUPLICATE_DNI_MESSAGE } };
    }
    console.error("Failed to update patient", error);
    return { ok: false, error: UNEXPECTED_ERROR_MESSAGE };
  }

  // 5. The list and the detail show this data: refresh both.
  revalidatePath("/patients");
  revalidatePath(`/patients/${id.data}`);
  return { ok: true };
}
