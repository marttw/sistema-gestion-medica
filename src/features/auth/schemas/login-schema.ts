import { z } from "zod";

export const PASSWORD_MAX_LENGTH = 128;

// Shared by the login form (client) and the login action (server).
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Ingresá tu correo electrónico.")
    .pipe(z.email("Ingresá un correo electrónico válido.")),
  password: z
    .string()
    .min(1, "Ingresá tu contraseña.")
    .max(
      PASSWORD_MAX_LENGTH,
      `La contraseña no puede superar los ${PASSWORD_MAX_LENGTH} caracteres.`,
    ),
});

export type LoginInput = z.infer<typeof loginSchema>;
