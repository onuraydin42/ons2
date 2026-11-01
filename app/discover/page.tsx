import type { Metadata } from "next";

import ContactSection from "@/components/ContactSection";
import DiscoverStory from "@/components/DiscoverStory";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { DISCOVER_PAGE } from "@/data/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Discover",
  // The story's own opening sentence.
  description: DISCOVER_PAGE.paragraphs[0].split(". ")[0] + ".",
  path: "/discover/",
});

/** The live /discover.html: the story, then the contact lines. */
export default function DiscoverPage() {
  return (
    <main id="top" className="bg-porcelain">
      <Navbar />
      <DiscoverStory />
      <ContactSection />
      <Footer />
    </main>
  );
}
