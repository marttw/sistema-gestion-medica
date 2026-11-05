import { APIError } from "better-auth/api";
import { afterEach, describe, expect, it, vi } from "vitest";

const { signInEmail, redirect } = vi.hoisted(() => ({
  signInEmail: vi.fn(),
  // Like Next.js, redirect() interrupts execution by throwing.
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

vi.mock("@/lib/auth", () => ({ auth: { api: { signInEmail } } }));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("next/navigation", () => ({ redirect }));

import { login } from "./login";

const validInput = { email: "medica@example.com", password: "secret-password" };

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe("login action", () => {
  it("signs in and redirects to the home page with valid credentials", async () => {
    signInEmail.mockResolvedValue({});

    await expect(login(validInput)).rejects.toThrow("NEXT_REDIRECT:/");

    expect(signInEmail).toHaveBeenCalledWith({
      body: validInput,
      headers: expect.any(Headers),
    });
    expect(redirect).toHaveBeenCalledWith("/");
  });

  it("rejects invalid input without calling Better Auth", async () => {
    const result = await login({ email: "not-an-email", password: "" });

    expect(result).toEqual({ error: "Revisá los datos ingresados." });
    expect(signInEmail).not.toHaveBeenCalled();
  });

  it("returns a generic message when the credentials are wrong", async () => {
    signInEmail.mockRejectedValue(
      new APIError("UNAUTHORIZED", { code: "INVALID_EMAIL_OR_PASSWORD" }),
    );

    const result = await login(validInput);

    expect(result).toEqual({
      error: "Correo electrónico o contraseña incorrectos.",
    });
    expect(redirect).not.toHaveBeenCalled();
  });

  it("returns a rate limit message after too many attempts", async () => {
    signInEmail.mockRejectedValue(new APIError("TOO_MANY_REQUESTS"));

    const result = await login(validInput);

    expect(result).toEqual({
      error: "Demasiados intentos. Esperá unos minutos y volvé a intentar.",
    });
  });

  it("logs unexpected errors and returns a generic message", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    signInEmail.mockRejectedValue(new Error("database is down"));

    const result = await login(validInput);

    expect(result).toEqual({
      error: "No pudimos iniciar sesión. Intentá nuevamente.",
    });
    expect(consoleError).toHaveBeenCalled();
  });
});
