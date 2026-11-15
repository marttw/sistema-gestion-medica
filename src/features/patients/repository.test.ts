import { afterEach, describe, expect, it, vi } from "vitest";

const { findMany } = vi.hoisted(() => ({ findMany: vi.fn() }));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db", () => ({ db: { patient: { findMany } } }));

import { findPatientsByDoctor } from "./repository";

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
