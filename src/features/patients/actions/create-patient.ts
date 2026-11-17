"use server";

import { revalidatePath } from "next/cache";

import { requireSession } from "@/features/auth/session";

import { DuplicateDocumentNumberError, insertPatient } from "../repository";
import { patientSchema } from "../schemas/patient-schema";
import {
  DUPLICATE_DNI_MESSAGE,
  firstErrorPerField,
  INVALID_INPUT_MESSAGE,
  type PatientActionResult,
} from "./patient-action-result";

const UNEXPECTED_ERROR_MESSAGE =
  "No pudimos registrar al paciente. Intentá nuevamente.";

// `input` is `unknown` on purpose: whatever the browser sends is untrusted.
export async function createPatient(input: unknown): Promise<PatientActionResult> {
  // 1. Authorization: the doctor comes from the session, never from `input`.
  //    Without a session this redirects to /login and nothing is saved.
  const doctor = await requireSession();

  // 2. Validate again on the server (the form's validation can be skipped).
  //    Unknown keys, such as a forged doctorId, are dropped by the schema.
  const parsed = patientSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: INVALID_INPUT_MESSAGE,
      fieldErrors: firstErrorPerField(parsed.error.issues),
    };
  }

  // 3. Persist. The unique constraint enforces "one DNI per doctor".
  try {
    await insertPatient(doctor.id, parsed.data);
  } catch (error) {
    if (error instanceof DuplicateDocumentNumberError) {
      return { ok: false, fieldErrors: { documentNumber: DUPLICATE_DNI_MESSAGE } };
    }
    console.error("Failed to create patient", error);
    return { ok: false, error: UNEXPECTED_ERROR_MESSAGE };
  }

  // 4. The list changed: drop its cached render so it shows the new patient.
  revalidatePath("/patients");
  return { ok: true };
}
