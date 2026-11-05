import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/features/auth/components/login-form";
import { getSession } from "@/features/auth/session";

export const metadata: Metadata = {
  title: "Iniciar sesión | Sistema de Gestión Médica",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 px-4 py-12">
      {/* Reads the session at request time, so it must sit inside Suspense. */}
      <Suspense fallback={null}>
        <RedirectIfAuthenticated />
      </Suspense>

      <p className="font-heading text-lg font-semibold tracking-tight">
        Sistema de Gestión Médica
      </p>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Iniciar sesión</CardTitle>
          <CardDescription>
            Ingresá con tu correo electrónico y contraseña.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}

async function RedirectIfAuthenticated() {
  const session = await getSession();
  if (session) {
    redirect("/");
  }
  return null;
}
