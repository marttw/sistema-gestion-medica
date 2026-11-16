import { z } from "zod";

import { normalizePhone } from "../phone";

// Shared by the form (instant feedback) and the Server Action (the real
// check). The schema has two sides:
// - input: what the form holds, all strings ("" for empty fields).
// - output: normalized data ready for the database (DNI without dots,
//   birth date as a Date, empty optional fields as null).

const NAME_PATTERN = /^[\p{L}][\p{L}\s'-]*$/u;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MIN_BIRTH_DATE = "1900-01-01";

// "2024-02-30" matches the pattern but is not a real date.
function isRealDate(value: string): boolean {
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

// Today as YYYY-MM-DD (UTC). Computed on each validation, not once at load.
function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

const name = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `Ingresá el ${label}.`)
    .max(100, `El ${label} no puede superar los 100 caracteres.`)
    .regex(NAME_PATTERN, "Usá solo letras, espacios, apóstrofos o guiones.");

// Optional text: "" (or only spaces) becomes null.
const optionalText = (max: number, maxMessage: string) =>
  z
    .string()
    .trim()
    .max(max, maxMessage)
    .transform((value) => (value === "" ? null : value));

export const patientSchema = z
  .object({
    firstName: name("nombre"),
    lastName: name("apellido"),
    documentNumber: z
      .string()
      .trim()
      .min(1, "Ingresá el DNI.")
      // Accept "30.111.222" or "30 111 222": store digits only.
      .transform((value) => value.replace(/[.\s]/g, ""))
      .pipe(
        z.string().regex(/^\d{7,8}$/, "Ingresá un DNI válido (7 u 8 dígitos)."),
      ),
    birthDate: z
      .string()
      .min(1, "Ingresá la fecha de nacimiento.")
      .refine(
        (value) => ISO_DATE_PATTERN.test(value) && isRealDate(value),
        "Ingresá una fecha válida.",
      )
      .refine(
        (value) => value <= todayIso(),
        "La fecha de nacimiento no puede ser futura.",
      )
      .refine(
        (value) => value >= MIN_BIRTH_DATE,
        "La fecha de nacimiento no puede ser anterior a 1900.",
      )
      // Stored as DATE: midnight UTC, same as the rest of the app reads it.
      .transform((value) => new Date(`${value}T00:00:00.000Z`)),
    // Any common way of writing it is accepted; stored as E.164
    // ("+5491155550101"). See ../phone.ts.
    phone: z
      .string()
      .trim()
      .refine(
        (value) => value === "" || normalizePhone(value) !== null,
        "Ingresá un teléfono válido con código de área.",
      )
      .transform((value) => (value === "" ? null : normalizePhone(value))),
    email: z
      .string()
      .trim()
      .max(254, "El correo electrónico es demasiado largo.")
      .refine(
        (value) => value === "" || z.email().safeParse(value).success,
        "Ingresá un correo electrónico válido.",
      )
      .transform((value) => (value === "" ? null : value.toLowerCase())),
    healthInsurance: optionalText(
      100,
      "La cobertura no puede superar los 100 caracteres.",
    ),
    insuranceNumber: optionalText(
      50,
      "El número de afiliado no puede superar los 50 caracteres.",
    ),
  })
  // Rules that involve more than one field.
  .superRefine((patient, ctx) => {
    if (patient.insuranceNumber && !patient.healthInsurance) {
      ctx.addIssue({
        code: "custom",
        path: ["healthInsurance"],
        message: "Indicá la obra social o prepaga del número de afiliado.",
      });
    }
  });

// What the form holds (all strings).
export type PatientFormInput = z.input<typeof patientSchema>;
// What reaches the database (normalized).
export type PatientFormData = z.output<typeof patientSchema>;

export const emptyPatientForm: PatientFormInput = {
  firstName: "",
  lastName: "",
  documentNumber: "",
  birthDate: "",
  phone: "",
  email: "",
  healthInsurance: "",
  insuranceNumber: "",
};
