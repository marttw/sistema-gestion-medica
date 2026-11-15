// What the patient list needs: no doctorId, no timestamps.
// A DTO (Data Transfer Object) decouples the UI from the database model.
export type PatientListItem = {
  id: string;
  firstName: string;
  lastName: string;
  documentNumber: string;
  birthDate: Date;
  phone: string | null;
  email: string | null;
  healthInsurance: string | null;
  insuranceNumber: string | null;
};
