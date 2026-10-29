import type { Metadata } from "next";

import LegalPage from "@/components/LegalPage";
import { LEGAL_UPDATED, PRIVACY } from "@/data/legal";

export const metadata: Metadata = {
  title: "Privacy Policy | FLUID OUNCE",
  description: "What FLUID OUNCE collects, why, and what we never do with it.",
};

export default function PrivacyPage() {
  return (
    <LegalPage kicker="Legal" title="Privacy Policy" updated={LEGAL_UPDATED} sections={PRIVACY} />
  );
}
