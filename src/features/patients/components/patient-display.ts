import { formatPhone } from "../phone";
import type { PatientListItem } from "../types";
import { calculateAge, formatDate, formatDocumentNumber } from "../utils";

// Presentation values shared by the table (desktop) and the cards (mobile),
// so both views always show the same data in the same format.
export function toPatientDisplay(patient: PatientListItem, today: Date) {
  const age = calculateAge(patient.birthDate, today);
  return {
    id: patient.id,
    detailHref: `/patients/${patient.id}`,
    fullName: `${patient.lastName}, ${patient.firstName}`,
    documentNumber: formatDocumentNumber(patient.documentNumber),
    birthDate: formatDate(patient.birthDate),
    age: `${age} ${age === 1 ? "año" : "años"}`,
    // Stored as E.164, shown in a readable format ("011 15-5555-0101").
    phone: patient.phone ? formatPhone(patient.phone) : null,
    email: patient.email,
    healthInsurance: patient.healthInsurance,
    insuranceNumber: patient.insuranceNumber,
  };
}

export type PatientDisplay = ReturnType<typeof toPatientDisplay>;
