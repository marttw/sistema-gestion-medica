import { describe, expect, it } from "vitest";

import { NAV_ITEMS, isActivePath } from "./navigation";

describe("isActivePath", () => {
  it("marks a section active on its own page", () => {
    expect(isActivePath("/patients", "/patients")).toBe(true);
  });

  it("marks a section active on pages nested under it", () => {
    expect(isActivePath("/patients/123", "/patients")).toBe(true);
    expect(isActivePath("/patients/123/edit", "/patients")).toBe(true);
  });

  it("does not mark a sibling route that only shares the prefix", () => {
    expect(isActivePath("/patients-archive", "/patients")).toBe(false);
  });

  it("does not mark any section on the home page", () => {
    expect(isActivePath("/", "/patients")).toBe(false);
  });
});

describe("NAV_ITEMS", () => {
  it("contains only the Patients section", () => {
    expect(NAV_ITEMS.map(({ title, href }) => ({ title, href }))).toEqual([
      { title: "Pacientes", href: "/patients" },
    ]);
  });
});
