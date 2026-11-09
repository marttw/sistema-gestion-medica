"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

export type LogoutState = { error: string } | null;

// Closes the current session: Better Auth deletes the session row from the
// database (so the old cookie stops working everywhere) and clears the cookie.
// Signature fits `useActionState(logout, null)`.
export async function logout(): Promise<LogoutState> {
  try {
    await auth.api.signOut({ headers: await headers() });
  } catch (error) {
    console.error("Logout failed", error);
    return { error: "No pudimos cerrar la sesión. Intentá nuevamente." };
  }

  // Outside the try: redirect() works by throwing.
  redirect("/login");
}
