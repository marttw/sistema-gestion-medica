import { afterEach, describe, expect, it, vi } from "vitest";

const { requireSession, findPatientsByDoctor } = vi.hoisted(() => ({
  requireSession: vi.fn(),
  findPatientsByDoctor: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/features/auth/session", () => ({ requireSession }));
vi.mock("./repository", () => ({ findPatientsByDoctor }));

import { getMyPatients } from "./queries";

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
