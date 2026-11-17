import { CircleAlert, RotateCw } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

// Shared UI for error.tsx boundaries: what failed, a retry button and the
// reference code. In production Next.js never sends the original message to
// the browser, only a `digest` that matches the entry in the server logs.
export function LoadError({
  title,
  error,
  retry,
  children,
}: {
  title: string;
  error: unknown;
  retry: () => void;
  // Extra actions next to "Reintentar" (e.g. a link back to the list).
  children?: ReactNode;
}) {
  const digest =
    error instanceof Error && "digest" in error && typeof error.digest === "string"
      ? error.digest
      : null;

  return (
    <Empty className="border" role="alert">
      <EmptyHeader>
        <EmptyMedia variant="icon" className="bg-destructive/10 text-destructive">
          <CircleAlert aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>
          Ocurrió un problema al consultar la información. Intentá nuevamente
          en unos instantes.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex flex-wrap justify-center gap-2">
          {/* retry() re-fetches the segment from the server and re-renders it. */}
          <Button variant="outline" onClick={() => retry()}>
            <RotateCw aria-hidden="true" />
            Reintentar
          </Button>
          {children}
        </div>
        {digest && (
          <p className="text-xs text-muted-foreground">
            Código de referencia: {digest}
          </p>
        )}
      </EmptyContent>
    </Empty>
  );
}
