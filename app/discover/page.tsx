import type { Metadata } from "next";

import ContactSection from "@/components/ContactSection";
import DiscoverStory from "@/components/DiscoverStory";
import Footer from "@/components/Footer";
import Mission from "@/components/Mission";
import Navbar from "@/components/Navbar";
import { DISCOVER_PAGE } from "@/data/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Discover",
  // The story's own opening sentence.
  description: DISCOVER_PAGE.paragraphs[0].split(". ")[0] + ".",
  path: "/discover/",
});

/** The live /discover.html: the story, the brochure's mission, then the contact lines. */
export default function DiscoverPage() {
  return (
    <main id="top" className="bg-porcelain">
      <Navbar />
      <DiscoverStory />
      <Mission />
      <ContactSection />
      <Footer />
    </main>
  );
}
