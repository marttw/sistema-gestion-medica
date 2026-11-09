import { afterEach, describe, expect, it, vi } from "vitest";

const { signOut, redirect } = vi.hoisted(() => ({
  signOut: vi.fn(),
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

vi.mock("@/lib/auth", () => ({ auth: { api: { signOut } } }));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("next/navigation", () => ({ redirect }));

import { logout } from "./logout";

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe("logout action", () => {
  it("closes the session and redirects to the login page", async () => {
    signOut.mockResolvedValue({ success: true });

    await expect(logout()).rejects.toThrow("NEXT_REDIRECT:/login");

    expect(signOut).toHaveBeenCalledWith({ headers: expect.any(Headers) });
    expect(redirect).toHaveBeenCalledWith("/login");
  });

  it("returns a generic error without redirecting when sign-out fails", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    signOut.mockRejectedValue(new Error("connection refused"));

    const result = await logout();

    expect(result).toEqual({
      error: "No pudimos cerrar la sesión. Intentá nuevamente.",
    });
    expect(result?.error).not.toContain("connection refused");
    expect(consoleError).toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });
});
