"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert } from "lucide-react";
import Link from "next/link";
import { useState, useTransition, type ComponentProps } from "react";
import { type FieldError as RhfFieldError, useForm } from "react-hook-form";

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

import type { PatientActionResult } from "../actions/patient-action-result";
import {
  type PatientFormData,
  type PatientFormInput,
  patientSchema,
} from "../schemas/patient-schema";

// The patient form, shared by create and edit. It only knows how to show,
// validate and submit the fields; what to save and what happens afterwards
// come as props (see create-patient-form.tsx and edit-patient-form.tsx), so
// there is no "if editing" logic in here.
export function PatientForm({
  defaultValues,
  action,
  onSuccess,
  submitLabel,
  cancelHref,
}: {
  defaultValues: PatientFormInput;
  // A Server Action: receives the raw form values and validates them again.
  action: (input: PatientFormInput) => Promise<PatientActionResult>;
  // Runs after a successful save, with the values that were sent.
  onSuccess: (values: PatientFormInput) => void;
  submitLabel: string;
  cancelHref: string;
}) {
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
    defaultValues,
  });

  // handleSubmit only runs this when the browser-side validation passes.
  const onSubmit = handleSubmit(() => {
    setServerError(null);
    startTransition(async () => {
      // Send the raw form values (strings): the server validates and
      // normalizes them again with the same schema.
      const values = getValues();
      const result = await action(values);

      if (result.ok) {
        onSuccess(values);
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
  // Screen readers announce the error, or the field's help text when there
  // is no error (an id without a matching element is simply ignored).
  // defaultValue: React Hook Form fills uncontrolled inputs only after
  // hydration; passing it here too puts the values in the server HTML, so
  // the edit form is never shown empty while the JavaScript loads.
  const fieldProps = (name: keyof PatientFormInput) => ({
    id: name,
    defaultValue: defaultValues[name],
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": errors[name] ? `${name}-error` : `${name}-description`,
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
          <FormField
            label="Teléfono"
            name="phone"
            error={errors.phone}
            description="Con código de área. Para celulares, incluí el 15 o el 9."
          >
            <Input
              type="tel"
              autoComplete="tel"
              placeholder="11 15-5555-0101"
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
        <Link href={cancelHref} className={buttonVariants({ variant: "outline" })}>
          Cancelar
        </Link>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Guardando…" : submitLabel}
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
      {description && !error && (
        <FieldDescription id={`${name}-description`}>{description}</FieldDescription>
      )}
      <FieldError id={`${name}-error`} errors={[error]} />
    </Field>
  );
}
