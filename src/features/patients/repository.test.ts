import { afterEach, describe, expect, it, vi } from "vitest";

import { Prisma } from "@/generated/prisma/client";

const { findMany, create } = vi.hoisted(() => ({
  findMany: vi.fn(),
  create: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db", () => ({ db: { patient: { findMany, create } } }));

import {
  DuplicateDocumentNumberError,
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
