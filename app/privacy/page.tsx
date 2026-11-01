import type { Metadata } from "next";

import LegalPage from "@/components/LegalPage";
import { PRIVACY } from "@/data/legal";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: PRIVACY.title,
  description: PRIVACY.intro,
  path: "/privacy/",
});

export default function PrivacyPage() {
  return <LegalPage document={PRIVACY} />;
}
