"use client"; // Error boundaries must be Client Components.

import { LoadError } from "@/components/load-error";

// Shown when rendering the patients section fails (e.g. the database is
// down). The sidebar and header stay visible: this boundary only wraps the
// page.
export default function PatientsError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col px-4 py-8 sm:px-6">
      <LoadError
        title="No pudimos cargar tus pacientes"
        error={error}
        retry={retry}
      />
    </div>
  );
}
