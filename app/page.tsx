import CocktailCollection from "@/components/CocktailCollection";
import CraftSection from "@/components/CraftSection";
import EditorialDivider from "@/components/EditorialDivider";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Navbar from "@/components/Navbar";
import ProductDetails from "@/components/ProductDetails";

/**
 * One vodka, one page.
 *
 * There is no product index here and nothing to reset: the switcher lives
 * inside CocktailCollection, where it moves between the four cocktails without
 * touching the scroll position.
 *
 * The age gate renders above every route from SiteShell in app/layout.tsx.
 */
export default function Home() {
  return (
    <main id="top">
      <Navbar />

      <Hero />

      <Marquee />

      <ProductDetails />

      {/* The Collection sits high on purpose — it is the most engaging thing on
          the page, so it lands right after the bottle rather than being buried
          below the craft story. */}
      <CocktailCollection />

      <EditorialDivider />

      <CraftSection />

      <Footer />
    </main>
  );
}
