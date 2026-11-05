// No direct `import "server-only"` here: the Better Auth CLI refuses to load
// config files that contain it. This module is still server-only because it
// imports `@/lib/db`, which is marked `server-only`.
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";

import { db } from "@/lib/db";

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    // No public registration: doctor accounts are created through a
    // controlled mechanism (development seed for now).
    disableSignUp: true,
  },
  // Must be the last plugin: lets Server Actions set the session cookie.
  plugins: [nextCookies()],
});
