// Birth dates are stored as DATE (no time). Prisma returns them as a Date at
// 00:00 UTC, so they must be read and formatted in UTC: in local time
// (e.g. Argentina, UTC-3) that instant is still the previous day.

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

// 1990-03-05 -> "05/03/1990"
export function formatDate(date: Date): string {
  return dateFormatter.format(date);
}

// Timestamps (e.g. updatedAt) are real instants, unlike birth dates. They are
// formatted on the server, whose clock may run in UTC, so the time zone must
// be explicit: the app is used in Argentina.
const APP_TIME_ZONE = "America/Argentina/Buenos_Aires";

const timestampDateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: APP_TIME_ZONE,
});

const timestampTimeFormatter = new Intl.DateTimeFormat("es-AR", {
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: APP_TIME_ZONE,
});

// 2026-11-17T18:42:00Z -> "17/11/2026 15:42" (Argentina, UTC-3)
export function formatDateTime(date: Date): string {
  return `${timestampDateFormatter.format(date)} ${timestampTimeFormatter.format(date)}`;
}

// Full years between the birth date and `today` (defaults to now).
export function calculateAge(birthDate: Date, today: Date = new Date()): number {
  let age = today.getUTCFullYear() - birthDate.getUTCFullYear();
  const birthdayPending =
    today.getUTCMonth() < birthDate.getUTCMonth() ||
    (today.getUTCMonth() === birthDate.getUTCMonth() &&
      today.getUTCDate() < birthDate.getUTCDate());
  if (birthdayPending) age -= 1;
  return age;
}

// "12345678" -> "12.345.678". Leaves anything that is not all digits as is.
export function formatDocumentNumber(documentNumber: string): string {
  if (!/^\d+$/.test(documentNumber)) return documentNumber;
  return documentNumber.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
