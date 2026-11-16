// Data migration (SIS-22): converts stored patient phones to E.164.
//
//   pnpm db:normalize-phones --dry-run   # show what would change
//   pnpm db:normalize-phones             # apply
//
// Unlike a Prisma migration, this changes the *content* of existing rows,
// not the table structure, and needs libphonenumber-js, so it is a script.
// - Idempotent: values already in E.164 are left alone, so running it again
//   changes nothing.
// - Never loses data: values that are not valid numbers are not modified;
//   they are listed so someone can fix them by hand.
// - All updates run in one transaction: either every row changes or none.
import "dotenv/config";

import { planPhoneMigration } from "@/features/patients/phone";
import { db } from "@/lib/db";

const dryRun = process.argv.includes("--dry-run");

async function main() {
  const patients = await db.patient.findMany({
    where: { phone: { not: null } },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
      doctor: { select: { email: true } },
    },
  });

  const updates: { id: string; from: string; to: string }[] = [];
  const unparsable: { id: string; name: string; doctor: string; phone: string }[] = [];
  let unchanged = 0;

  for (const patient of patients) {
    const step = planPhoneMigration(patient.phone);
    if (step.action === "update") {
      updates.push({ id: patient.id, from: patient.phone!, to: step.phone });
    } else if (step.action === "report") {
      unparsable.push({
        id: patient.id,
        name: `${patient.lastName}, ${patient.firstName}`,
        doctor: patient.doctor.email,
        phone: patient.phone!,
      });
    } else {
      unchanged += 1;
    }
  }

  console.log(`Pacientes con teléfono: ${patients.length}`);
  console.log(`  Ya normalizados: ${unchanged}`);
  console.log(`  A normalizar:    ${updates.length}`);
  for (const { from, to } of updates) console.log(`    ${from}  →  ${to}`);
  console.log(`  No interpretables (sin cambios): ${unparsable.length}`);
  for (const p of unparsable) {
    console.log(`    [${p.id}] ${p.name} (${p.doctor}): "${p.phone}"`);
  }

  if (dryRun) {
    console.log("\n--dry-run: no se modificó ningún dato.");
    return;
  }
  if (updates.length === 0) {
    console.log("\nNada para actualizar.");
    return;
  }

  await db.$transaction(
    updates.map(({ id, to }) =>
      db.patient.update({ where: { id }, data: { phone: to } }),
    ),
  );
  console.log(`\nActualizados: ${updates.length}.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
