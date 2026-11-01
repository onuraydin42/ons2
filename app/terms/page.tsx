import type { Metadata } from "next";

import LegalPage from "@/components/LegalPage";
import { TERMS } from "@/data/legal";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: TERMS.title,
  description: TERMS.intro,
  path: "/terms/",
});

export default function TermsPage() {
  return <LegalPage document={TERMS} />;
}
