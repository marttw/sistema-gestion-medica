// Phone numbers: stored as E.164 ("+5491155550101"), shown in a readable
// format. All phone rules live here, on top of libphonenumber-js.
//
// The "max" metadata validates against each country's real numbering plan
// (area codes, number ranges). The default "min" one only checks lengths.
import {
  isValidPhoneNumber,
  parsePhoneNumberFromString,
} from "libphonenumber-js/max";

// Numbers without a country code are read as Argentine.
const DEFAULT_COUNTRY = "AR";

// Any accepted way of writing a number -> E.164, or null when it is not a
// valid number. Already normalized numbers come back unchanged.
//
// Note: an Argentine number without "15" or "9" (e.g. "11 5555-0101") is
// read as a landline. Whether it is a mobile cannot be inferred.
export function normalizePhone(input: string): string | null {
  const value = input.trim();
  if (value === "") return null;
  // Letters are never part of a phone number (libphonenumber would
  // otherwise read them as keypad digits: "CASA" -> 2272).
  if (/\p{L}/u.test(value)) return null;
  if (!isValidPhoneNumber(value, DEFAULT_COUNTRY)) return null;
  return parsePhoneNumberFromString(value, DEFAULT_COUNTRY)?.number ?? null;
}

// E.164 -> national format for Argentine numbers ("011 15-5555-0101"),
// international format for the rest. Text that is not a parsable number
// (legacy data the migration could not convert) is returned as is.
export function formatPhone(phone: string): string {
  const parsed = parsePhoneNumberFromString(phone, DEFAULT_COUNTRY);
  if (!parsed) return phone;
  return parsed.country === DEFAULT_COUNTRY
    ? parsed.formatNational()
    : parsed.formatInternational();
}

export type PhoneMigrationStep =
  | { action: "keep" } // empty or already E.164: nothing to do
  | { action: "update"; phone: string } // convertible: write the E.164 value
  | { action: "report" }; // not a valid number: leave it as is, tell someone

// Decides what the data migration does with one stored phone. Pure, so it
// can be tested without a database. Running it twice gives "keep" the
// second time (idempotent).
export function planPhoneMigration(stored: string | null): PhoneMigrationStep {
  if (stored === null) return { action: "keep" };
  const normalized = normalizePhone(stored);
  if (normalized === null) return { action: "report" };
  if (normalized === stored) return { action: "keep" };
  return { action: "update", phone: normalized };
}
