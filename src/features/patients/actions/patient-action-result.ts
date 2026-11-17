import type { PatientFormInput } from "../schemas/patient-schema";

// Shared by the create and update Server Actions. It lives outside them
// because a "use server" file may only export async functions.

export type PatientFieldErrors = Partial<Record<keyof PatientFormInput, string>>;

export type PatientActionResult =
  | { ok: true }
  | { ok: false; fieldErrors?: PatientFieldErrors; error?: string };

export const DUPLICATE_DNI_MESSAGE = "Ya tenés un paciente registrado con este DNI.";
export const INVALID_INPUT_MESSAGE = "Revisá los datos marcados.";

// Zod issues -> one message per field (the first one), as the form shows them.
export function firstErrorPerField(
  issues: { path: PropertyKey[]; message: string }[],
): PatientFieldErrors {
  const errors: PatientFieldErrors = {};
  for (const issue of issues) {
    const field = issue.path[0] as keyof PatientFormInput | undefined;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}
