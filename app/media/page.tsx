import type { Metadata } from "next";

import Footer from "@/components/Footer";
import MediaGallery from "@/components/MediaGallery";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Press & Media | FLUID OUNCE",
  description: "Imagery and film of FLUID OUNCE, and how to reach us for press.",
};

export default function MediaPage() {
  return (
    <main id="top" className="bg-ink-900">
      <Navbar />
      <MediaGallery />
      <Footer />
    </main>
  );
}
