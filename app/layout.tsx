import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Jost, Libre_Baskerville } from "next/font/google";

import SiteShell from "@/components/SiteShell";
import StructuredData from "@/components/StructuredData";
import { BRAND, SEO, SITE_URL } from "@/data/site";

import "./globals.css";

/* Three voices, each with one job:
 *   Jost             a geometric sans for the FLUID OUNCE name — the same
 *                    construction as the wordmark on the bottle and plinth;
 *   Bodoni Moda      a modern (Didone) serif for headings, with an optical
 *                    size axis that cuts the hairlines finer as type grows;
 *   Libre Baskerville a transitional serif for every small and running line,
 *                    drawn for reading on screen — wide, open, unmistakable. */
const jost = Jost({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-wordmark",
});

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
  variable: "--font-display",
  // next/font ships no fallback metrics for this family, so there is nothing
  // to size-adjust against; Didot / Georgia in the Tailwind stack cover the
  // swap instead.
  adjustFontFallback: false,
});

const baskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-text",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SEO.title,
    template: `%s | ${BRAND}`,
  },
  description: SEO.description,
  applicationName: BRAND,
  keywords: [
    "FLUID OUNCE",
    "Fluid Ounce Vodka",
    "FLUID OUNCE vodka",
    "ultra premium vodka",
    "12-time distilled vodka",
    "super flint decanter",
    "Shou sugi ban",
    "Yakisugi",
    "luxury vodka New York",
  ],
  // Canonical URL and share card are set per page (lib/seo.ts): set here,
  // they would be inherited by every page that forgot its own.
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo.png", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: SEO.themeColor,
  colorScheme: "light",
  // Lets the page paint into the notch / Dynamic Island area; the components
  // that need clearance ask for it with the pt-safe / pb-safe utilities.
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jost.variable} ${bodoni.variable} ${baskerville.variable}`}>
      <body className="font-serif antialiased">
        <StructuredData />
        {/* SiteShell mounts the age gate above every route, so /order is
            gated by the same component as the main site. */}
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
