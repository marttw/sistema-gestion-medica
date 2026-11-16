import { Plus } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

// It navigates, so it is a real link (announced as "link") that only looks
// like a button. A <Button> rendered as <a> would get role="button".
export function NewPatientButton() {
  return (
    <Link href="/patients/new" className={buttonVariants()}>
      <Plus aria-hidden="true" />
      Nuevo paciente
    </Link>
  );
}
