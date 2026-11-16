"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type ComponentProps } from "react";
import { type FieldError as RhfFieldError, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { createPatient } from "../actions/create-patient";
import {
  emptyPatientForm,
  type PatientFormData,
  type PatientFormInput,
  patientSchema,
} from "../schemas/patient-schema";

export function PatientForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    getValues,
    setError,
    setFocus,
    formState: { errors },
  } = useForm<PatientFormInput, unknown, PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: emptyPatientForm,
  });

  // handleSubmit only runs this when the browser-side validation passes.
  const onSubmit = handleSubmit(() => {
    setServerError(null);
    startTransition(async () => {
      // Send the raw form values (strings): the server validates and
      // normalizes them again with the same schema.
      const result = await createPatient(getValues());

      if (result.ok) {
        toast.success("Paciente registrado", {
          description: `${getValues("firstName").trim()} ${getValues("lastName").trim()} ya figura en tu listado.`,
        });
        router.push("/patients");
        return;
      }

      // Show the server's errors next to their fields (e.g. duplicate DNI).
      const fieldErrors = Object.entries(result.fieldErrors ?? {}) as [
        keyof PatientFormInput,
        string,
      ][];
      for (const [field, message] of fieldErrors) {
        setError(field, { type: "server", message });
      }
      if (fieldErrors.length > 0) setFocus(fieldErrors[0][0]);
      if (result.error) setServerError(result.error);
    });
  });

  // Props shared by every text input: registration plus accessible errors.
  const fieldProps = (name: keyof PatientFormInput) => ({
    id: name,
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
    ...register(name),
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-8">
      {serverError && (
        <Alert variant="destructive">
          <CircleAlert aria-hidden="true" />
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <FieldSet>
        <FieldLegend>Datos personales</FieldLegend>
        <FieldGroup className="grid gap-5 sm:grid-cols-2">
          <FormField label="Nombre" name="firstName" error={errors.firstName} required>
            <Input autoComplete="given-name" {...fieldProps("firstName")} />
          </FormField>
          <FormField label="Apellido" name="lastName" error={errors.lastName} required>
            <Input autoComplete="family-name" {...fieldProps("lastName")} />
          </FormField>
          <FormField
            label="DNI"
            name="documentNumber"
            error={errors.documentNumber}
            description="Con o sin puntos."
            required
          >
            <Input
              inputMode="numeric"
              autoComplete="off"
              placeholder="30.111.222"
              {...fieldProps("documentNumber")}
            />
          </FormField>
          <FormField
            label="Fecha de nacimiento"
            name="birthDate"
            error={errors.birthDate}
            required
          >
            <Input type="date" autoComplete="bday" {...fieldProps("birthDate")} />
          </FormField>
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <FieldLegend>Contacto</FieldLegend>
        <FieldGroup className="grid gap-5 sm:grid-cols-2">
          <FormField label="Teléfono" name="phone" error={errors.phone}>
            <Input
              type="tel"
              autoComplete="tel"
              placeholder="+54 9 11 5555-0101"
              {...fieldProps("phone")}
            />
          </FormField>
          <FormField label="Correo electrónico" name="email" error={errors.email}>
            <Input
              type="email"
              autoComplete="email"
              placeholder="paciente@example.com"
              {...fieldProps("email")}
            />
          </FormField>
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <FieldLegend>Cobertura médica</FieldLegend>
        <FieldGroup className="grid gap-5 sm:grid-cols-2">
          <FormField
            label="Obra social o prepaga"
            name="healthInsurance"
            error={errors.healthInsurance}
          >
            <Input placeholder="OSDE, PAMI, IOMA…" {...fieldProps("healthInsurance")} />
          </FormField>
          <FormField
            label="Número de afiliado"
            name="insuranceNumber"
            error={errors.insuranceNumber}
          >
            <Input autoComplete="off" {...fieldProps("insuranceNumber")} />
          </FormField>
        </FieldGroup>
      </FieldSet>

      <p className="text-sm text-muted-foreground">
        <span aria-hidden="true">*</span> Campos obligatorios.
      </p>

      {/* On mobile the primary action goes first and buttons take full width. */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {/* Navigation, so a real link styled as a button (not role="button"). */}
        <Link href="/patients" className={buttonVariants({ variant: "outline" })}>
          Cancelar
        </Link>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Guardando…" : "Guardar paciente"}
        </Button>
      </div>
    </form>
  );
}

// Label + control + description + error, wired for screen readers.
function FormField({
  label,
  name,
  error,
  description,
  required = false,
  children,
}: {
  label: string;
  name: keyof PatientFormInput;
  error?: RhfFieldError;
  description?: string;
  required?: boolean;
  children: ComponentProps<typeof Field>["children"];
}) {
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={name}>
        {label}
        {required && (
          <>
            <span aria-hidden="true" className="text-destructive">
              *
            </span>
            <span className="sr-only">(obligatorio)</span>
          </>
        )}
      </FieldLabel>
      {children}
      {description && !error && <FieldDescription>{description}</FieldDescription>}
      <FieldError id={`${name}-error`} errors={[error]} />
    </Field>
  );
}
