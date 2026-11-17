import { describe, expect, it } from "vitest";

import { calculateAge, formatDate, formatDateTime, formatDocumentNumber } from "./utils";

// Dates as Prisma returns a DATE column: 00:00 UTC.
const utc = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

describe("formatDate", () => {
  it("formats a date as dd/mm/yyyy", () => {
    expect(formatDate(utc("1990-03-05"))).toBe("05/03/1990");
  });

  it("does not shift the day in time zones behind UTC", () => {
    // 00:00 UTC on Jan 1st is still Dec 31st in Argentina (UTC-3).
    expect(formatDate(utc("2000-01-01"))).toBe("01/01/2000");
  });
});

describe("calculateAge", () => {
  const birthDate = utc("1990-06-15");

  it("counts the birthday when it already happened this year", () => {
    expect(calculateAge(birthDate, utc("2026-06-20"))).toBe(36);
  });

  it("counts the birthday on the exact day", () => {
    expect(calculateAge(birthDate, utc("2026-06-15"))).toBe(36);
  });

  it("does not count the birthday when it has not happened yet", () => {
    expect(calculateAge(birthDate, utc("2026-06-14"))).toBe(35);
    expect(calculateAge(birthDate, utc("2026-01-10"))).toBe(35);
  });
});

describe("formatDocumentNumber", () => {
  it("adds thousands separators to an 8-digit DNI", () => {
    expect(formatDocumentNumber("30111222")).toBe("30.111.222");
  });

  it("adds thousands separators to a 7-digit DNI", () => {
    expect(formatDocumentNumber("5123456")).toBe("5.123.456");
  });

  it("leaves values that are not only digits unchanged", () => {
    expect(formatDocumentNumber("AB123")).toBe("AB123");
  });
});

describe("formatDateTime", () => {
  it("shows a timestamp in Argentina's time (UTC-3), 24-hour clock", () => {
    expect(formatDateTime(new Date("2026-11-17T18:42:00.000Z"))).toBe("17/11/2026 15:42");
  });

  it("uses Argentina's date, not UTC's, near midnight", () => {
    // 01:30 UTC on the 18th is still 22:30 on the 17th in Argentina.
    expect(formatDateTime(new Date("2026-11-18T01:30:00.000Z"))).toBe("17/11/2026 22:30");
  });

  it("pads single-digit hours", () => {
    expect(formatDateTime(new Date("2026-01-05T12:05:00.000Z"))).toBe("05/01/2026 09:05");
  });
});
