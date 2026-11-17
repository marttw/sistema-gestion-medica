import { afterEach, describe, expect, it, vi } from "vitest";

import { Prisma } from "@/generated/prisma/client";

const { findMany, findFirst, create } = vi.hoisted(() => ({
  findMany: vi.fn(),
  findFirst: vi.fn(),
  create: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db", () => ({ db: { patient: { findMany, findFirst, create } } }));

import {
  DuplicateDocumentNumberError,
  findPatientForDoctor,
  findPatientsByDoctor,
  insertPatient,
} from "./repository";

const patientData = {
  firstName: "Lucía",
  lastName: "Fernández",
  documentNumber: "30111222",
  birthDate: new Date("1983-05-14T00:00:00.000Z"),
  phone: null,
  email: null,
  healthInsurance: null,
  insuranceNumber: null,
};

describe("insertPatient", () => {
  it("creates the patient linked to the given doctor", async () => {
    create.mockResolvedValue({ id: "p1" });

    await expect(insertPatient("doctor-ana", patientData)).resolves.toEqual({ id: "p1" });
    expect(create).toHaveBeenCalledWith({
      data: { ...patientData, doctorId: "doctor-ana" },
      select: { id: true },
    });
  });

  it("turns a unique constraint violation into DuplicateDocumentNumberError", async () => {
    create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
        code: "P2002",
        clientVersion: "test",
      }),
    );

    await expect(insertPatient("doctor-ana", patientData)).rejects.toBeInstanceOf(
      DuplicateDocumentNumberError,
    );
  });

  it("rethrows any other database error unchanged", async () => {
    const failure = new Error("connection refused");
    create.mockRejectedValue(failure);

    await expect(insertPatient("doctor-ana", patientData)).rejects.toBe(failure);
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("findPatientsByDoctor", () => {
  it("filters by doctor and orders by last name, then first name", async () => {
    findMany.mockResolvedValue([]);

    await findPatientsByDoctor("doctor-ana");

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { doctorId: "doctor-ana" },
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      }),
    );
  });

  it("selects only the list fields (never the doctor or timestamps)", async () => {
    findMany.mockResolvedValue([]);

    await findPatientsByDoctor("doctor-ana");

    const { select } = findMany.mock.calls[0][0];
    expect(Object.keys(select).sort()).toEqual([
      "birthDate",
      "documentNumber",
      "email",
      "firstName",
      "healthInsurance",
      "id",
      "insuranceNumber",
      "lastName",
      "phone",
    ]);
  });
});

describe("findPatientForDoctor", () => {
  const patientId = "0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b";

  it("filters by patient id AND doctor in the same query", async () => {
    findFirst.mockResolvedValue(null);

    await findPatientForDoctor("doctor-ana", patientId);

    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: patientId, doctorId: "doctor-ana" } }),
    );
  });

  it("returns null when the patient is missing or belongs to another doctor", async () => {
    findFirst.mockResolvedValue(null);

    await expect(findPatientForDoctor("doctor-ana", patientId)).resolves.toBeNull();
  });

  it("selects the same administrative fields as the list (never the doctor)", async () => {
    findFirst.mockResolvedValue(null);
    findMany.mockResolvedValue([]);

    await findPatientForDoctor("doctor-ana", patientId);
    await findPatientsByDoctor("doctor-ana");

    expect(findFirst.mock.calls[0][0].select).toEqual(findMany.mock.calls[0][0].select);
    expect(findFirst.mock.calls[0][0].select).not.toHaveProperty("doctorId");
  });
});
