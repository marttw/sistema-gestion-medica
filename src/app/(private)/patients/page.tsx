import type { Metadata } from "next";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { requireSession } from "@/features/auth/session";

export const metadata: Metadata = {
  title: "Pacientes",
};

// Placeholder until the patients module (US-07) replaces it.
export default function PatientsPage() {
  return (
    <div className="flex flex-col gap-2 px-4 py-8 sm:px-6">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Pacientes
      </h1>
      {/* Like every private page, it validates the session on the server. */}
      <Suspense fallback={<Skeleton className="h-5 w-full max-w-md" />}>
        <ComingSoon />
      </Suspense>
    </div>
  );
}

async function ComingSoon() {
  await requireSession();
  return (
    <p className="text-muted-foreground">
      Próximamente vas a poder administrar tus pacientes desde acá.
    </p>
  );
}
