"use client"; // Error boundaries must be Client Components.

import { CircleAlert, RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

// Shown when rendering the patients section fails (e.g. the database is
// down). The sidebar and header stay visible: this boundary only wraps the
// page. In production Next.js never sends the original message to the
// browser, only a `digest` that matches the entry in the server logs.
export default function PatientsError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  const digest =
    error instanceof Error && "digest" in error && typeof error.digest === "string"
      ? error.digest
      : null;

  return (
    <div className="flex flex-1 flex-col px-4 py-8 sm:px-6">
      <Empty className="border" role="alert">
        <EmptyHeader>
          <EmptyMedia variant="icon" className="bg-destructive/10 text-destructive">
            <CircleAlert aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>No pudimos cargar tus pacientes</EmptyTitle>
          <EmptyDescription>
            Ocurrió un problema al consultar la información. Intentá nuevamente
            en unos instantes.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          {/* retry() re-fetches the segment from the server and re-renders it. */}
          <Button variant="outline" onClick={() => retry()}>
            <RotateCw aria-hidden="true" />
            Reintentar
          </Button>
          {digest && (
            <p className="text-xs text-muted-foreground">
              Código de referencia: {digest}
            </p>
          )}
        </EmptyContent>
      </Empty>
    </div>
  );
}
