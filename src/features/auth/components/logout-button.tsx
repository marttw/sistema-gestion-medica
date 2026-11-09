"use client";

import { LogOut } from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { logout } from "@/features/auth/actions/logout";

// A real <form> posting to a Server Action: it also works before the page's
// JavaScript has loaded. `isPending` stays true until the redirect finishes.
export function LogoutButton() {
  const [state, formAction, isPending] = useActionState(logout, null);

  return (
    <form action={formAction} className="flex items-center gap-3">
      {state?.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" variant="outline" size="sm" disabled={isPending}>
        <LogOut aria-hidden="true" />
        {isPending ? "Cerrando sesión…" : "Cerrar sesión"}
      </Button>
    </form>
  );
}
