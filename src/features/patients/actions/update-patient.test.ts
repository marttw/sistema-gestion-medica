import { afterEach, describe, expect, it, vi } from "vitest";

const { requireSession, updatePatientForDoctor, revalidatePath } = vi.hoisted(() => ({
  requireSession: vi.fn(),
  updatePatientForDoctor: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/features/auth/session", () => ({ requireSession }));
vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("../repository", async () => {
  // Keep a real error class so `instanceof` works in the action.
  class DuplicateDocumentNumberError extends Error {}
  return { updatePatientForDoctor, DuplicateDocumentNumberError };
});

import { DuplicateDocumentNumberError } from "../repository";
import { emptyPatientForm } from "../schemas/patient-schema";
import { updatePatient } from "./update-patient";

const doctorAna = { id: "doctor-ana", name: "Dra. Ana Pérez", email: "medica@example.com" };
const patientId = "0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b";
const NOT_FOUND = {
  ok: false,
  error: "No encontramos este paciente. Puede que ya no figure en tu listado.",
};

const validInput = {
  ...emptyPatientForm,
  firstName: "Lucía",
  lastName: "Fernández",
  documentNumber: "30.111.222",
  birthDate: "1983-05-14",
  phone: "011 15-5555-0101",
  healthInsurance: "OSDE",
};

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe("updatePatient", () => {
  it("saves the normalized data for the session doctor's patient", async () => {
    requireSession.mockResolvedValue(doctorAna);
    updatePatientForDoctor.mockResolvedValue(true);

    await expect(updatePatient(patientId, validInput)).resolves.toEqual({ ok: true });

    expect(updatePatientForDoctor).toHaveBeenCalledWith("doctor-ana", patientId, {
      firstName: "Lucía",
      lastName: "Fernández",
      documentNumber: "30111222",
      birthDate: new Date("1983-05-14T00:00:00.000Z"),
      phone: "+5491155550101",
      email: null,
      healthInsurance: "OSDE",
      insuranceNumber: null,
    });
    // Both screens that show this patient are refreshed.
    expect(revalidatePath).toHaveBeenCalledWith("/patients");
    expect(revalidatePath).toHaveBeenCalledWith(`/patients/${patientId}`);
  });

  it("returns an error per field for invalid data and saves nothing", async () => {
    requireSession.mockResolvedValue(doctorAna);

    const result = await updatePatient(patientId, {
      ...validInput,
      firstName: "",
      documentNumber: "123",
      phone: "1234",
    });

    expect(result).toMatchObject({
      ok: false,
      fieldErrors: {
        firstName: "Ingresá el nombre.",
        documentNumber: "Ingresá un DNI válido (7 u 8 dígitos).",
        phone: "Ingresá un teléfono válido con código de área.",
      },
    });
    expect(updatePatientForDoctor).not.toHaveBeenCalled();
  });

  it("reports a DNI that belongs to another of the doctor's patients", async () => {
    requireSession.mockResolvedValue(doctorAna);
    updatePatientForDoctor.mockRejectedValue(new DuplicateDocumentNumberError());

    await expect(updatePatient(patientId, validInput)).resolves.toEqual({
      ok: false,
      fieldErrors: { documentNumber: "Ya tenés un paciente registrado con este DNI." },
    });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("answers 'not found' when the patient does not exist", async () => {
    requireSession.mockResolvedValue(doctorAna);
    updatePatientForDoctor.mockResolvedValue(false);

    await expect(updatePatient(patientId, validInput)).resolves.toEqual(NOT_FOUND);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("cannot edit another doctor's patient: the update is scoped to the session doctor", async () => {
    // Ana sends the id of one of Bruno's patients. The repository is asked
    // with Ana's id, matches no row, and the answer is the same 'not found'.
    requireSession.mockResolvedValue(doctorAna);
    updatePatientForDoctor.mockResolvedValue(false);

    const result = await updatePatient(patientId, { ...validInput, doctorId: "doctor-bruno" });

    expect(result).toEqual(NOT_FOUND);
    const [doctorId, , data] = updatePatientForDoctor.mock.calls[0];
    expect(doctorId).toBe("doctor-ana");
    expect(data).not.toHaveProperty("doctorId");
  });

  it.each(["abc", "", 42, null, { id: patientId }])(
    "answers 'not found' for an invalid id (%j) without touching the database",
    async (invalidId) => {
      requireSession.mockResolvedValue(doctorAna);

      await expect(updatePatient(invalidId, validInput)).resolves.toEqual(NOT_FOUND);
      expect(updatePatientForDoctor).not.toHaveBeenCalled();
    },
  );

  it("does not save anything without a session", async () => {
    requireSession.mockRejectedValue(new Error("NEXT_REDIRECT:/login"));

    await expect(updatePatient(patientId, validInput)).rejects.toThrow("NEXT_REDIRECT:/login");
    expect(updatePatientForDoctor).not.toHaveBeenCalled();
  });

  it("returns a generic error when the database fails, without its details", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    requireSession.mockResolvedValue(doctorAna);
    updatePatientForDoctor.mockRejectedValue(new Error("connect ECONNREFUSED 127.0.0.1:5432"));

    const result = await updatePatient(patientId, validInput);

    expect(result).toEqual({
      ok: false,
      error: "No pudimos guardar los cambios. Intentá nuevamente.",
    });
    expect(JSON.stringify(result)).not.toContain("ECONNREFUSED");
    expect(consoleError).toHaveBeenCalled();
  });
});
