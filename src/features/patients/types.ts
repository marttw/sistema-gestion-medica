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

// What the detail page needs. Today the list already includes every
// administrative field, so both share the shape; a separate name lets them
// diverge later (e.g. the detail adding fields the list does not show).
export type PatientDetail = PatientListItem;
