import {
  getRedirectUrl,
  // Still exported under its pre-"proxy" name in Next.js 16.4.
  unstable_doesMiddlewareMatch,
} from "next/experimental/testing/server";
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { config, proxy } from "./proxy";

const BASE = "http://localhost:3000";
const SESSION_COOKIE = "better-auth.session_token=some-token";

function request(path: string, cookie?: string) {
  return new NextRequest(BASE + path, {
    headers: cookie ? { cookie } : {},
  });
}

describe("proxy", () => {
  it("redirects a private page to the login page when there is no session cookie", () => {
    const response = proxy(request("/"));

    expect(response.status).toBe(307);
    expect(getRedirectUrl(response)).toBe(`${BASE}/login`);
  });

  it("lets the request through when a session cookie is present", () => {
    const response = proxy(request("/", SESSION_COOKIE));

    expect(getRedirectUrl(response)).toBeNull();
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("never redirects the login page, even with a cookie that may be stale", () => {
    expect(getRedirectUrl(proxy(request("/login")))).toBeNull();
    expect(getRedirectUrl(proxy(request("/login", SESSION_COOKIE)))).toBeNull();
  });

  it("runs on pages but not on API routes, Next.js internals or static files", () => {
    const matches = (url: string) =>
      unstable_doesMiddlewareMatch({ config, url });

    expect(matches("/")).toBe(true);
    expect(matches("/patients/123")).toBe(true);
    expect(matches("/api/health")).toBe(false);
    expect(matches("/api/auth/get-session")).toBe(false);
    expect(matches("/_next/static/chunk.js")).toBe(false);
    expect(matches("/favicon.ico")).toBe(false);
  });
});
