// Development seed: creates a fictitious doctor account.
// Run with `pnpm db:seed`. Never runs in production.
import "dotenv/config";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const DEMO_DOCTOR = {
  name: "Dra. Ana Pérez",
  email: "medica@example.com",
};

async function seedDemoDoctor() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("The development seed must not run in production.");
  }

  const password = process.env.SEED_DOCTOR_PASSWORD;
  if (!password || password.length < 8 || password.length > 128) {
    throw new Error(
      "Set SEED_DOCTOR_PASSWORD in .env (between 8 and 128 characters).",
    );
  }

  // Use Better Auth's own context so hashing and storage follow its rules.
  const ctx = await auth.$context;

  const existing = await ctx.internalAdapter.findUserByEmail(DEMO_DOCTOR.email);
  if (existing) {
    console.log(`Demo doctor already exists: ${DEMO_DOCTOR.email}`);
    return;
  }

  const hashedPassword = await ctx.password.hash(password);
  const user = await ctx.internalAdapter.createUser(
    { ...DEMO_DOCTOR, emailVerified: true },
    // Same provisioning source Better Auth uses for email/password sign-up.
    { method: "email-password" },
  );
  await ctx.internalAdapter.linkAccount({
    userId: user.id,
    providerId: "credential",
    accountId: user.id,
    password: hashedPassword,
  });

  console.log(`Demo doctor created: ${DEMO_DOCTOR.email}`);
}

seedDemoDoctor()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
