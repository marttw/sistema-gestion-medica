"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { updatePatient } from "../actions/update-patient";
import type { PatientFormInput } from "../schemas/patient-schema";
import { PatientForm } from "./patient-form";

// The edit flow: form prefilled with the current data, updatePatient, back
// to the detail (which renders again with the new data).
export function EditPatientForm({
  patientId,
  defaultValues,
}: {
  patientId: string;
  defaultValues: PatientFormInput;
}) {
  const router = useRouter();
  const detailHref = `/patients/${patientId}`;

  return (
    <PatientForm
      defaultValues={defaultValues}
      // bind fixes the first argument: the action receives (patientId, input).
      // The id is still checked on the server; binding does not make it trusted.
      action={updatePatient.bind(null, patientId)}
      submitLabel="Guardar cambios"
      cancelHref={detailHref}
      onSuccess={(values) => {
        toast.success("Cambios guardados", {
          description: `Se actualizaron los datos de ${values.firstName.trim()} ${values.lastName.trim()}.`,
        });
        router.push(detailHref);
      }}
    />
  );
}
