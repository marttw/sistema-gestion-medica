"use server";

import { isAPIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import { loginSchema } from "../schemas/login-schema";

export type LoginResult = { error: string };

const INVALID_INPUT_MESSAGE = "Revisá los datos ingresados.";
// Same message for unknown email and wrong password: never reveal which one failed.
const INVALID_CREDENTIALS_MESSAGE =
  "Correo electrónico o contraseña incorrectos.";
const TOO_MANY_ATTEMPTS_MESSAGE =
  "Demasiados intentos. Esperá unos minutos y volvé a intentar.";
const UNEXPECTED_ERROR_MESSAGE =
  "No pudimos iniciar sesión. Intentá nuevamente.";

export async function login(input: unknown): Promise<LoginResult> {
  // Never trust client-side validation: validate again on the server.
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { error: INVALID_INPUT_MESSAGE };
  }

  try {
    await auth.api.signInEmail({
      body: parsed.data,
      headers: await headers(),
    });
  } catch (error) {
    if (isAPIError(error)) {
      return {
        error:
          error.statusCode === 429
            ? TOO_MANY_ATTEMPTS_MESSAGE
            : INVALID_CREDENTIALS_MESSAGE,
      };
    }

    console.error("[auth] Unexpected login error:", error);
    return { error: UNEXPECTED_ERROR_MESSAGE };
  }

  // Outside try/catch: redirect() works by throwing.
  redirect("/");
}
