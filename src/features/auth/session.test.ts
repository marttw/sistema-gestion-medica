import { afterEach, describe, expect, it, vi } from "vitest";

const { getSession, redirect } = vi.hoisted(() => ({
  getSession: vi.fn(),
  // Like Next.js, redirect() interrupts execution by throwing.
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

// `server-only` throws outside the react-server environment.
vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession } } }));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("next/navigation", () => ({ redirect }));

import { requireSession } from "./session";

afterEach(() => {
  vi.clearAllMocks();
});

describe("requireSession", () => {
  it("redirects to the login page when there is no session", async () => {
    // Better Auth also returns null for expired or signed-out sessions.
    getSession.mockResolvedValue(null);

    await expect(requireSession()).rejects.toThrow("NEXT_REDIRECT:/login");
    expect(redirect).toHaveBeenCalledWith("/login");
  });

  it("returns only the public fields of the signed-in doctor", async () => {
    getSession.mockResolvedValue({
      session: { id: "s1", token: "secret-token", userId: "u1" },
      user: {
        id: "u1",
        name: "Dra. Ana Pérez",
        email: "medica@example.com",
        emailVerified: true,
        image: null,
      },
    });

    await expect(requireSession()).resolves.toEqual({
      id: "u1",
      name: "Dra. Ana Pérez",
      email: "medica@example.com",
    });
    expect(redirect).not.toHaveBeenCalled();
  });
});
