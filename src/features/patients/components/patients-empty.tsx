import { Users } from "lucide-react";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

import { NewPatientButton } from "./new-patient-button";

export function PatientsEmpty() {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Users aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>Todavía no tenés pacientes registrados</EmptyTitle>
        <EmptyDescription>
          Registrá tu primer paciente para empezar a administrar sus datos.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <NewPatientButton />
      </EmptyContent>
    </Empty>
  );
}
