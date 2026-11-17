import { UserX } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

// Rendered when the page calls notFound(): invalid id, missing patient or
// another doctor's patient. The text is the same for all three on purpose,
// so it never confirms that an id exists in someone else's account.
export default function PatientNotFound() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8 sm:px-6">
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <UserX aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>No encontramos este paciente</EmptyTitle>
          <EmptyDescription>
            Puede que el enlace sea incorrecto o que el paciente no figure en tu
            listado.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Link href="/patients" className={buttonVariants({ variant: "outline" })}>
            Volver a pacientes
          </Link>
        </EmptyContent>
      </Empty>
    </div>
  );
}
