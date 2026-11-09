import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

// Pages anyone can open. Every other page matched below is private.
const PUBLIC_PATHS = ["/login"];

// Optimistic check: it only looks for the session cookie, without querying
// the database, so it is fast but a stale or forged cookie gets through.
// The real authorization is `requireSession()`, run by every private page,
// Server Action and Route Handler.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  if (!getSessionCookie(request)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Skip API routes (they authorize themselves), Next.js internals and
  // static files such as favicon.ico or images in public/.
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
