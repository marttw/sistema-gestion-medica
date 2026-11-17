import { afterEach, describe, expect, it, vi } from "vitest";

import { Prisma } from "@/generated/prisma/client";

const { findMany, findFirst, create, updateMany } = vi.hoisted(() => ({
  findMany: vi.fn(),
  findFirst: vi.fn(),
  create: vi.fn(),
  updateMany: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db", () => ({ db: { patient: { findMany, findFirst, create, updateMany } } }));

import {
  DuplicateDocumentNumberError,
  findPatientForDoctor,
  findPatientsByDoctor,
  insertPatient,
  updatePatientForDoctor,
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

  it("selects the list fields plus updatedAt (never the doctor)", async () => {
    findFirst.mockResolvedValue(null);
    findMany.mockResolvedValue([]);

    await findPatientForDoctor("doctor-ana", patientId);
    await findPatientsByDoctor("doctor-ana");

    expect(findFirst.mock.calls[0][0].select).toEqual({
      ...findMany.mock.calls[0][0].select,
      updatedAt: true,
    });
    expect(findFirst.mock.calls[0][0].select).not.toHaveProperty("doctorId");
  });
});

describe("updatePatientForDoctor", () => {
  const patientId = "0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b";

  it("updates only the row that matches the patient id AND the doctor", async () => {
    updateMany.mockResolvedValue({ count: 1 });

    await expect(updatePatientForDoctor("doctor-ana", patientId, patientData)).resolves.toBe(true);
    expect(updateMany).toHaveBeenCalledWith({
      where: { id: patientId, doctorId: "doctor-ana" },
      data: patientData,
    });
  });

  it("never writes the doctor: data has no doctorId", async () => {
    updateMany.mockResolvedValue({ count: 1 });

    await updatePatientForDoctor("doctor-ana", patientId, patientData);

    expect(updateMany.mock.calls[0][0].data).not.toHaveProperty("doctorId");
  });

  it("returns false when no row matched (missing or another doctor's)", async () => {
    updateMany.mockResolvedValue({ count: 0 });

    await expect(updatePatientForDoctor("doctor-ana", patientId, patientData)).resolves.toBe(false);
  });

  it("turns a unique constraint violation into DuplicateDocumentNumberError", async () => {
    updateMany.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
        code: "P2002",
        clientVersion: "test",
      }),
    );

    await expect(
      updatePatientForDoctor("doctor-ana", patientId, patientData),
    ).rejects.toBeInstanceOf(DuplicateDocumentNumberError);
  });

  it("rethrows any other database error unchanged", async () => {
    const failure = new Error("connection refused");
    updateMany.mockRejectedValue(failure);

    await expect(updatePatientForDoctor("doctor-ana", patientId, patientData)).rejects.toBe(failure);
  });
});
