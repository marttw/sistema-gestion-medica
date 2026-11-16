import { afterEach, describe, expect, it, vi } from "vitest";

import { emptyPatientForm, patientSchema } from "./patient-schema";

const valid = {
  ...emptyPatientForm,
  firstName: "Lucía",
  lastName: "Fernández",
  documentNumber: "30111222",
  birthDate: "1983-05-14",
};

// First error message for a field, or undefined.
function errorFor(input: object, field: string): string | undefined {
  const result = patientSchema.safeParse(input);
  if (result.success) return undefined;
  return result.error.issues.find((issue) => issue.path[0] === field)?.message;
}

afterEach(() => {
  vi.useRealTimers();
});

describe("patientSchema: required fields", () => {
  it("accepts the minimum required data", () => {
    expect(patientSchema.safeParse(valid).success).toBe(true);
  });

  it.each([
    ["firstName", "Ingresá el nombre."],
    ["lastName", "Ingresá el apellido."],
    ["documentNumber", "Ingresá el DNI."],
    ["birthDate", "Ingresá la fecha de nacimiento."],
  ])("requires %s", (field, message) => {
    expect(errorFor({ ...valid, [field]: "" }, field)).toBe(message);
  });

  it("treats a name with only spaces as empty", () => {
    expect(errorFor({ ...valid, firstName: "   " }, "firstName")).toBe("Ingresá el nombre.");
  });

  it("accepts names with accents, ñ, apostrophes and hyphens", () => {
    const result = patientSchema.safeParse({
      ...valid,
      firstName: "María José",
      lastName: "O'Higgins-Muñoz",
    });
    expect(result.success).toBe(true);
  });

  it("rejects names with digits or symbols", () => {
    expect(errorFor({ ...valid, firstName: "Lu1s" }, "firstName")).toBeDefined();
  });
});

describe("patientSchema: DNI", () => {
  it("removes dots and spaces", () => {
    const result = patientSchema.parse({ ...valid, documentNumber: " 30.111.222 " });
    expect(result.documentNumber).toBe("30111222");
  });

  it.each(["123456", "123456789", "30A11222", "30-111-222"])("rejects %s", (dni) => {
    expect(errorFor({ ...valid, documentNumber: dni }, "documentNumber")).toBe(
      "Ingresá un DNI válido (7 u 8 dígitos).",
    );
  });

  it("accepts a 7-digit DNI", () => {
    expect(patientSchema.safeParse({ ...valid, documentNumber: "5123456" }).success).toBe(true);
  });
});

describe("patientSchema: birth date", () => {
  it("converts the date to midnight UTC", () => {
    const result = patientSchema.parse(valid);
    expect(result.birthDate.toISOString()).toBe("1983-05-14T00:00:00.000Z");
  });

  it("rejects dates that do not exist", () => {
    expect(errorFor({ ...valid, birthDate: "2001-02-30" }, "birthDate")).toBe(
      "Ingresá una fecha válida.",
    );
  });

  it("rejects future dates", () => {
    vi.useFakeTimers({ now: new Date("2026-11-15T12:00:00Z") });
    expect(errorFor({ ...valid, birthDate: "2026-11-16" }, "birthDate")).toBe(
      "La fecha de nacimiento no puede ser futura.",
    );
    expect(patientSchema.safeParse({ ...valid, birthDate: "2026-11-15" }).success).toBe(true);
  });

  it("rejects dates before 1900", () => {
    expect(errorFor({ ...valid, birthDate: "1899-12-31" }, "birthDate")).toBe(
      "La fecha de nacimiento no puede ser anterior a 1900.",
    );
  });
});

describe("patientSchema: optional fields", () => {
  it("stores empty optional fields as null", () => {
    const result = patientSchema.parse({ ...valid, phone: "  ", email: "" });
    expect(result).toMatchObject({
      phone: null,
      email: null,
      healthInsurance: null,
      insuranceNumber: null,
    });
  });

  it("rejects an invalid email", () => {
    expect(errorFor({ ...valid, email: "lucia@" }, "email")).toBe(
      "Ingresá un correo electrónico válido.",
    );
  });

  it("normalizes the email to lowercase", () => {
    const result = patientSchema.parse({ ...valid, email: "Lucia@Example.com" });
    expect(result.email).toBe("lucia@example.com");
  });

  it("rejects an invalid phone next to the field", () => {
    expect(errorFor({ ...valid, phone: "11-CASA" }, "phone")).toBe(
      "Ingresá un teléfono válido con código de área.",
    );
    expect(errorFor({ ...valid, phone: "1234" }, "phone")).toBeDefined();
  });

  it.each([
    ["+54 9 11 5555-0101", "+5491155550101"],
    ["11 15-5555-0101", "+5491155550101"],
    ["011 4555-0101", "+541145550101"],
  ])("stores the phone %s as E.164 (%s)", (phone, expected) => {
    expect(patientSchema.parse({ ...valid, phone }).phone).toBe(expected);
  });

  it("requires the health insurance when a member number is given", () => {
    expect(errorFor({ ...valid, insuranceNumber: "123" }, "healthInsurance")).toBe(
      "Indicá la obra social o prepaga del número de afiliado.",
    );
  });
});
