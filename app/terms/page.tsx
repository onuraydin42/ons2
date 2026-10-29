import type { Metadata } from "next";

import LegalPage from "@/components/LegalPage";
import { LEGAL_UPDATED, TERMS } from "@/data/legal";

export const metadata: Metadata = {
  title: "Terms of Use | FLUID OUNCE",
  description: "The terms that apply to using the FLUID OUNCE website.",
};

export default function TermsPage() {
  return <LegalPage kicker="Legal" title="Terms of Use" updated={LEGAL_UPDATED} sections={TERMS} />;
}
