import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { auth } from "@/lib/auth";

// The signed-in doctor, as exposed to the rest of the app (a DTO).
// Only the fields the UI needs: never the raw session or its token.
export type CurrentUser = {
  id: string;
  name: string;
  email: string;
};

// Reads the current session from the database (not just the cookie), so a
// session that expired or was closed by logout is reported as missing.
// `cache` deduplicates the lookup within a single server render.
export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

// Secure authorization check for private pages, Server Actions and Route
// Handlers. Redirects to the login page when there is no valid session.
export async function requireSession(): Promise<CurrentUser> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const { id, name, email } = session.user;
  return { id, name, email };
}
