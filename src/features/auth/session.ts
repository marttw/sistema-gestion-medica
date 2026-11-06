import "server-only";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";

// Single entry point to read the current session on the server.
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}
