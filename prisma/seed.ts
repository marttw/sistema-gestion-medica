// Development seed: fictitious doctors and patients.
// Run with `pnpm db:seed`. Never runs in production. Safe to run again:
// existing doctors are reused and patients are upserted by (doctor, DNI).
import "dotenv/config";

import { normalizePhone } from "@/features/patients/phone";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

type SeedPatient = {
  firstName: string;
  lastName: string;
  documentNumber: string;
  // ISO date (YYYY-MM-DD): parsed as 00:00 UTC, which is how DATE is stored.
  birthDate: string;
  phone?: string;
  email?: string;
  healthInsurance?: string;
  insuranceNumber?: string;
};

type SeedDoctor = {
  name: string;
  email: string;
  patients: SeedPatient[];
};

const DOCTORS: SeedDoctor[] = [
  {
    name: "Dra. Ana Pérez",
    email: "medica@example.com",
    patients: [
      { firstName: "Lucía", lastName: "Fernández", documentNumber: "30111222", birthDate: "1983-05-14", phone: "+54 9 11 5555-0101", email: "lucia.fernandez@example.com", healthInsurance: "OSDE", insuranceNumber: "61234567801" },
      { firstName: "Martín", lastName: "Gómez", documentNumber: "28333444", birthDate: "1980-11-02", phone: "+54 9 11 5555-0102", healthInsurance: "Swiss Medical", insuranceNumber: "SM-004512" },
      { firstName: "Sofía", lastName: "Rodríguez", documentNumber: "41555666", birthDate: "1998-02-27", phone: "+54 9 11 5555-0103", email: "sofia.rodriguez@example.com" },
      { firstName: "Juan Carlos", lastName: "López", documentNumber: "12777888", birthDate: "1956-08-30", phone: "+54 9 11 5555-0104", healthInsurance: "PAMI", insuranceNumber: "150123456700" },
      { firstName: "Valentina", lastName: "Martínez", documentNumber: "45999000", birthDate: "2004-12-09", email: "valentina.martinez@example.com", healthInsurance: "Galeno" },
      { firstName: "Diego", lastName: "Sánchez", documentNumber: "33222111", birthDate: "1987-07-21", phone: "+54 9 11 5555-0106" },
      { firstName: "Camila", lastName: "Díaz", documentNumber: "38444333", birthDate: "1994-03-05", phone: "+54 9 11 5555-0107", email: "camila.diaz@example.com", healthInsurance: "IOMA", insuranceNumber: "2038444333" },
      { firstName: "Tomás", lastName: "Álvarez", documentNumber: "52111000", birthDate: "2012-10-18", phone: "+54 9 11 5555-0108", healthInsurance: "OSDE", insuranceNumber: "61234567899" },
    ],
  },
  {
    name: "Dr. Bruno Gómez",
    email: "medico2@example.com",
    patients: [
      { firstName: "Elena", lastName: "Torres", documentNumber: "20123456", birthDate: "1968-01-25", phone: "+54 9 351 555-0201", healthInsurance: "Medifé", insuranceNumber: "MF-778899" },
      { firstName: "Pablo", lastName: "Ramírez", documentNumber: "35678901", birthDate: "1990-09-12", email: "pablo.ramirez@example.com" },
      { firstName: "Julieta", lastName: "Castro", documentNumber: "43210987", birthDate: "2001-06-03", phone: "+54 9 351 555-0203", healthInsurance: "OSDE", insuranceNumber: "61200011122" },
    ],
  },
  // No patients: shows the empty state.
  { name: "Dra. Carla Ruiz", email: "medica3@example.com", patients: [] },
];

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("The development seed must not run in production.");
  }

  const password = process.env.SEED_DOCTOR_PASSWORD;
  if (!password || password.length < 8 || password.length > 128) {
    throw new Error(
      "Set SEED_DOCTOR_PASSWORD in .env (between 8 and 128 characters).",
    );
  }

  for (const doctor of DOCTORS) {
    const doctorId = await ensureDoctor(doctor, password);
    await seedPatients(doctorId, doctor.patients);
    console.log(`${doctor.email}: ${doctor.patients.length} pacientes`);
  }
}

// Returns the doctor's id, creating the account if it does not exist.
async function ensureDoctor(
  doctor: Pick<SeedDoctor, "name" | "email">,
  password: string,
): Promise<string> {
  // Use Better Auth's own context so hashing and storage follow its rules.
  const ctx = await auth.$context;

  const existing = await ctx.internalAdapter.findUserByEmail(doctor.email);
  if (existing) return existing.user.id;

  const hashedPassword = await ctx.password.hash(password);
  const user = await ctx.internalAdapter.createUser(
    { name: doctor.name, email: doctor.email, emailVerified: true },
    // Same provisioning source Better Auth uses for email/password sign-up.
    { method: "email-password" },
  );
  await ctx.internalAdapter.linkAccount({
    userId: user.id,
    providerId: "credential",
    accountId: user.id,
    password: hashedPassword,
  });
  return user.id;
}

async function seedPatients(doctorId: string, patients: SeedPatient[]) {
  for (const { birthDate, phone, ...patient } of patients) {
    const data = {
      ...patient,
      birthDate: new Date(birthDate),
      // Written in a human format above, stored as E.164 like the app does.
      phone: phone ? toE164(phone) : null,
    };
    await db.patient.upsert({
      // The compound unique key (doctorId, documentNumber) identifies it.
      where: {
        doctorId_documentNumber: {
          doctorId,
          documentNumber: patient.documentNumber,
        },
      },
      update: data,
      create: { ...data, doctorId },
    });
  }
}

function toE164(phone: string): string {
  const normalized = normalizePhone(phone);
  if (!normalized) throw new Error(`Invalid phone in seed data: "${phone}"`);
  return normalized;
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
