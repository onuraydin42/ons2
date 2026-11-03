import type { Metadata } from "next";

import CocktailCollection from "@/components/CocktailCollection";
import ContactSection from "@/components/ContactSection";
import DiscoverSection from "@/components/DiscoverSection";
import EditorialBand from "@/components/EditorialBand";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Manifesto from "@/components/Manifesto";
import Marquee from "@/components/Marquee";
import Mission from "@/components/Mission";
import Navbar from "@/components/Navbar";
import ProductShowcase from "@/components/ProductShowcase";
import RecycleNote from "@/components/RecycleNote";
import Unmasked from "@/components/Unmasked";
import Wholesale from "@/components/Wholesale";
import { SEO } from "@/data/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ description: SEO.description, path: "/" });

/**
 * One vodka, one page — in the live site's order: the name and its line, the
 * manifesto, Discover, then Contact; with the brochure's mission, its products, the
 * cocktails, its wholesale pages and a photograph between them.
 *
 * The age gate renders above every route from SiteShell in app/layout.tsx.
 */
export default function Home() {
  return (
    <main id="top">
      <Navbar />

      <Hero />

      <Marquee />

      <Manifesto />

      <Mission />

      <DiscoverSection />

      <ProductShowcase />

      <Unmasked />

      <CocktailCollection />

      <EditorialBand />

      <Wholesale />

      <ContactSection />

      <RecycleNote />

      <Footer />
    </main>
  );
}
