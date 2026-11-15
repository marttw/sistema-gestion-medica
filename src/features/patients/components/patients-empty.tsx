import { Users } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function PatientsEmpty() {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Users aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>Todavía no tenés pacientes registrados</EmptyTitle>
        <EmptyDescription>
          Cuando registres pacientes, vas a verlos en este listado.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
