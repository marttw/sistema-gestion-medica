"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createPatient } from "../actions/create-patient";
import { emptyPatientForm } from "../schemas/patient-schema";
import { PatientForm } from "./patient-form";

// The create flow: empty form, createPatient, back to the list.
// A Client Component because onSuccess is a function, and Server Components
// can only pass serializable props (or Server Actions) to the client.
export function CreatePatientForm() {
  const router = useRouter();

  return (
    <PatientForm
      defaultValues={emptyPatientForm}
      action={createPatient}
      submitLabel="Guardar paciente"
      cancelHref="/patients"
      onSuccess={(values) => {
        toast.success("Paciente registrado", {
          description: `${values.firstName.trim()} ${values.lastName.trim()} ya figura en tu listado.`,
        });
        router.push("/patients");
      }}
    />
  );
}
