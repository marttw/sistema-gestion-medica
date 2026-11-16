import { afterEach, describe, expect, it, vi } from "vitest";

const { requireSession, insertPatient, revalidatePath } = vi.hoisted(() => ({
  requireSession: vi.fn(),
  insertPatient: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/features/auth/session", () => ({ requireSession }));
vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("../repository", async () => {
  // Keep the real error class so `instanceof` works in the action.
  class DuplicateDocumentNumberError extends Error {}
  return { insertPatient, DuplicateDocumentNumberError };
});

import { DuplicateDocumentNumberError } from "../repository";
import { emptyPatientForm } from "../schemas/patient-schema";
import { createPatient } from "./create-patient";

const doctorAna = { id: "doctor-ana", name: "Dra. Ana Pérez", email: "medica@example.com" };

const validInput = {
  ...emptyPatientForm,
  firstName: "Lucía",
  lastName: "Fernández",
  documentNumber: "30.111.222",
  birthDate: "1983-05-14",
  phone: "+54 9 11 5555-0101",
};

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe("createPatient", () => {
  it("saves the normalized patient for the doctor in the session", async () => {
    requireSession.mockResolvedValue(doctorAna);
    insertPatient.mockResolvedValue({ id: "p1" });

    await expect(createPatient(validInput)).resolves.toEqual({ ok: true });

    expect(insertPatient).toHaveBeenCalledWith("doctor-ana", {
      firstName: "Lucía",
      lastName: "Fernández",
      documentNumber: "30111222",
      birthDate: new Date("1983-05-14T00:00:00.000Z"),
      phone: "+54 9 11 5555-0101",
      email: null,
      healthInsurance: null,
      insuranceNumber: null,
    });
    expect(revalidatePath).toHaveBeenCalledWith("/patients");
  });

  it("ignores a doctorId sent by the browser", async () => {
    requireSession.mockResolvedValue(doctorAna);
    insertPatient.mockResolvedValue({ id: "p1" });

    await createPatient({ ...validInput, doctorId: "doctor-bruno" });

    const [doctorId, data] = insertPatient.mock.calls[0];
    expect(doctorId).toBe("doctor-ana");
    expect(data).not.toHaveProperty("doctorId");
  });

  it("does not save anything without a session", async () => {
    requireSession.mockRejectedValue(new Error("NEXT_REDIRECT:/login"));

    await expect(createPatient(validInput)).rejects.toThrow("NEXT_REDIRECT:/login");
    expect(insertPatient).not.toHaveBeenCalled();
  });

  it("returns an error per field when required data is missing", async () => {
    requireSession.mockResolvedValue(doctorAna);

    const result = await createPatient(emptyPatientForm);

    expect(result).toMatchObject({
      ok: false,
      fieldErrors: {
        firstName: "Ingresá el nombre.",
        lastName: "Ingresá el apellido.",
        documentNumber: "Ingresá el DNI.",
        birthDate: "Ingresá la fecha de nacimiento.",
      },
    });
    expect(insertPatient).not.toHaveBeenCalled();
  });

  it("returns a field error for an invalid DNI", async () => {
    requireSession.mockResolvedValue(doctorAna);

    const result = await createPatient({ ...validInput, documentNumber: "123" });

    expect(result).toMatchObject({
      ok: false,
      fieldErrors: { documentNumber: "Ingresá un DNI válido (7 u 8 dígitos)." },
    });
    expect(insertPatient).not.toHaveBeenCalled();
  });

  it("reports a duplicate DNI on the DNI field", async () => {
    requireSession.mockResolvedValue(doctorAna);
    insertPatient.mockRejectedValue(new DuplicateDocumentNumberError());

    await expect(createPatient(validInput)).resolves.toEqual({
      ok: false,
      fieldErrors: { documentNumber: "Ya tenés un paciente registrado con este DNI." },
    });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("returns a generic error when the database fails", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    requireSession.mockResolvedValue(doctorAna);
    insertPatient.mockRejectedValue(new Error("connect ECONNREFUSED 127.0.0.1:5432"));

    const result = await createPatient(validInput);

    expect(result).toEqual({
      ok: false,
      error: "No pudimos registrar al paciente. Intentá nuevamente.",
    });
    expect(JSON.stringify(result)).not.toContain("ECONNREFUSED");
    expect(consoleError).toHaveBeenCalled();
  });
});
