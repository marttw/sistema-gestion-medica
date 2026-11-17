import { afterEach, describe, expect, it, vi } from "vitest";

const { requireSession, findPatientsByDoctor, findPatientForDoctor } = vi.hoisted(() => ({
  requireSession: vi.fn(),
  findPatientsByDoctor: vi.fn(),
  findPatientForDoctor: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/features/auth/session", () => ({ requireSession }));
vi.mock("./repository", () => ({ findPatientsByDoctor, findPatientForDoctor }));

import { getMyPatient, getMyPatients } from "./queries";

const doctorAna = { id: "doctor-ana", name: "Dra. Ana Pérez", email: "medica@example.com" };
const doctorBruno = { id: "doctor-bruno", name: "Dr. Bruno Gómez", email: "medico2@example.com" };

afterEach(() => {
  vi.clearAllMocks();
});

describe("getMyPatients", () => {
  it("queries the patients of the doctor in the session", async () => {
    const patients = [{ id: "p1", firstName: "Lucía", lastName: "Fernández" }];
    requireSession.mockResolvedValue(doctorAna);
    findPatientsByDoctor.mockResolvedValue(patients);

    await expect(getMyPatients()).resolves.toBe(patients);
    expect(findPatientsByDoctor).toHaveBeenCalledWith("doctor-ana");
  });

  it("scopes each doctor to their own id", async () => {
    findPatientsByDoctor.mockResolvedValue([]);

    requireSession.mockResolvedValueOnce(doctorAna);
    await getMyPatients();
    requireSession.mockResolvedValueOnce(doctorBruno);
    await getMyPatients();

    expect(findPatientsByDoctor.mock.calls).toEqual([
      ["doctor-ana"],
      ["doctor-bruno"],
    ]);
  });

  it("does not query the database without a session", async () => {
    requireSession.mockRejectedValue(new Error("NEXT_REDIRECT:/login"));

    await expect(getMyPatients()).rejects.toThrow("NEXT_REDIRECT:/login");
    expect(findPatientsByDoctor).not.toHaveBeenCalled();
  });

  it("lets database errors reach the error boundary", async () => {
    requireSession.mockResolvedValue(doctorAna);
    findPatientsByDoctor.mockRejectedValue(new Error("connection refused"));

    await expect(getMyPatients()).rejects.toThrow("connection refused");
  });
});

describe("getMyPatient", () => {
  const patientId = "0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b";
  const patient = { id: patientId, firstName: "Lucía", lastName: "Fernández" };

  it("returns the patient when it belongs to the doctor in the session", async () => {
    requireSession.mockResolvedValue(doctorAna);
    findPatientForDoctor.mockResolvedValue(patient);

    await expect(getMyPatient(patientId)).resolves.toBe(patient);
    expect(findPatientForDoctor).toHaveBeenCalledWith("doctor-ana", patientId);
  });

  it("returns null for an id that does not exist", async () => {
    requireSession.mockResolvedValue(doctorAna);
    findPatientForDoctor.mockResolvedValue(null);

    await expect(getMyPatient(patientId)).resolves.toBeNull();
  });

  it("scopes the lookup to the session doctor, so another doctor's patient is not found", async () => {
    // The patient exists, but under Bruno: the repository is always asked with
    // the session doctor's id, and returns null for that pair.
    requireSession.mockResolvedValue(doctorBruno);
    findPatientForDoctor.mockResolvedValue(null);

    await expect(getMyPatient(patientId)).resolves.toBeNull();
    expect(findPatientForDoctor).toHaveBeenCalledWith("doctor-bruno", patientId);
  });

  it.each(["abc", "123", "", "0190a1b2-c3d4-7e5f-8a9b", "../patients", `${patientId}'--`])(
    "returns null for an invalid id (%j) without querying the database",
    async (invalidId) => {
      requireSession.mockResolvedValue(doctorAna);

      await expect(getMyPatient(invalidId)).resolves.toBeNull();
      expect(findPatientForDoctor).not.toHaveBeenCalled();
    },
  );

  it("checks the session before anything else", async () => {
    requireSession.mockRejectedValue(new Error("NEXT_REDIRECT:/login"));

    await expect(getMyPatient(patientId)).rejects.toThrow("NEXT_REDIRECT:/login");
    expect(findPatientForDoctor).not.toHaveBeenCalled();
  });

  it("lets database errors reach the error boundary", async () => {
    requireSession.mockResolvedValue(doctorAna);
    findPatientForDoctor.mockRejectedValue(new Error("connection refused"));

    await expect(getMyPatient(patientId)).rejects.toThrow("connection refused");
  });
});
