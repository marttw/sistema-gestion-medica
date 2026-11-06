import { describe, expect, it } from "vitest";

import { loginSchema, PASSWORD_MAX_LENGTH } from "./login-schema";

function firstErrorFor(input: unknown, field: "email" | "password") {
  const result = loginSchema.safeParse(input);
  return result.error?.issues.find((issue) => issue.path[0] === field)
    ?.message;
}

describe("loginSchema", () => {
  it("accepts a valid email and password", () => {
    const result = loginSchema.safeParse({
      email: "medica@example.com",
      password: "secret-password",
    });

    expect(result.success).toBe(true);
  });

  it("trims spaces around the email", () => {
    const result = loginSchema.parse({
      email: "  medica@example.com  ",
      password: "secret-password",
    });

    expect(result.email).toBe("medica@example.com");
  });

  it("requires the email", () => {
    expect(firstErrorFor({ email: "", password: "x" }, "email")).toBe(
      "Ingresá tu correo electrónico.",
    );
  });

  it("rejects an invalid email", () => {
    expect(
      firstErrorFor({ email: "not-an-email", password: "x" }, "email"),
    ).toBe("Ingresá un correo electrónico válido.");
  });

  it("requires the password", () => {
    expect(
      firstErrorFor({ email: "medica@example.com", password: "" }, "password"),
    ).toBe("Ingresá tu contraseña.");
  });

  it("rejects passwords longer than the maximum", () => {
    const password = "a".repeat(PASSWORD_MAX_LENGTH + 1);

    expect(
      firstErrorFor({ email: "medica@example.com", password }, "password"),
    ).toBe("La contraseña no puede superar los 128 caracteres.");
  });
});
