import { describe, expect, it } from "vitest";

import { formatPhone, normalizePhone, planPhoneMigration } from "./phone";

describe("normalizePhone: Argentine mobiles", () => {
  it.each([
    ["national with 15", "11 15-5555-0101"],
    ["national with 0 and 15", "011 15 5555 0101"],
    ["international with +54 9", "+54 9 11 5555-0101"],
    ["international without spaces", "+5491155550101"],
  ])("normalizes a %s", (_, input) => {
    expect(normalizePhone(input)).toBe("+5491155550101");
  });

  it("normalizes a mobile with a 3-digit area code (Córdoba)", () => {
    expect(normalizePhone("0351 15-555-0201")).toBe("+5493515550201");
  });
});

describe("normalizePhone: Argentine landlines", () => {
  it("normalizes a Buenos Aires landline", () => {
    expect(normalizePhone("011 4555-0101")).toBe("+541145550101");
  });

  it("normalizes a landline with a 3-digit area code (Córdoba)", () => {
    expect(normalizePhone("(0351) 455-0201")).toBe("+543514550201");
  });

  it("reads a number without 15 or 9 as a landline (it is ambiguous)", () => {
    expect(normalizePhone("11 5555-0101")).toBe("+541155550101");
  });
});

describe("normalizePhone: other countries", () => {
  it("keeps the country of an international number", () => {
    expect(normalizePhone("+1 212 555 0123")).toBe("+12125550123");
  });
});

describe("normalizePhone: invalid input", () => {
  it.each([
    ["too short", "1234"],
    ["letters", "11-CASA-0101"],
    ["empty", ""],
    ["unknown area code", "099 4555-0101"],
  ])("returns null for %s", (_, input) => {
    expect(normalizePhone(input)).toBeNull();
  });
});

describe("normalizePhone: idempotence", () => {
  it("returns an E.164 number unchanged", () => {
    const once = normalizePhone("11 15-5555-0101")!;
    expect(normalizePhone(once)).toBe(once);
  });
});

describe("formatPhone", () => {
  it("shows Argentine mobiles in national format", () => {
    expect(formatPhone("+5491155550101")).toBe("011 15-5555-0101");
  });

  it("shows Argentine landlines in national format", () => {
    expect(formatPhone("+541145550101")).toBe("011 4555-0101");
  });

  it("shows foreign numbers in international format", () => {
    expect(formatPhone("+12125550123")).toBe("+1 212 555 0123");
  });

  it("returns text it cannot parse unchanged (legacy data)", () => {
    expect(formatPhone("llamar a la tarde")).toBe("llamar a la tarde");
  });
});

describe("planPhoneMigration", () => {
  it("keeps patients without a phone", () => {
    expect(planPhoneMigration(null)).toEqual({ action: "keep" });
  });

  it("keeps numbers already in E.164", () => {
    expect(planPhoneMigration("+5491155550101")).toEqual({ action: "keep" });
  });

  it("updates numbers written in other formats", () => {
    expect(planPhoneMigration("+54 9 11 5555-0101")).toEqual({
      action: "update",
      phone: "+5491155550101",
    });
  });

  it("reports values that are not valid numbers, without changing them", () => {
    expect(planPhoneMigration("llamar a la tarde")).toEqual({ action: "report" });
  });

  it("is idempotent: a migrated value is kept on the next run", () => {
    const first = planPhoneMigration("011 15 5555 0101");
    expect(first.action).toBe("update");
    if (first.action === "update") {
      expect(planPhoneMigration(first.phone)).toEqual({ action: "keep" });
    }
  });
});
