import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Outfit } from "next/font/google";
import type { CSSProperties } from "react";

import SiteShell from "@/components/SiteShell";
import { product } from "@/data/product";

import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

/* The fashion-house half of the pairing: a high-contrast Didone for display
 * type, set against Outfit's quiet geometric sans for everything functional.
 * The optical-size axis matters — at headline sizes it switches to the
 * hairline cut, which is where the couture look comes from. */
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

export const metadata: Metadata = {
  metadataBase: new URL("https://www.fluidounce.co"),
  title: "FLUID OUNCE | The Measure of Perfection",
  description:
    "12X distilled, glacial water, zero additives. FLUID OUNCE Signature — absolute clarity.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo.png", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "FLUID OUNCE | The Measure of Perfection",
    description: "12X distilled. Glacial water. Zero additives.",
    url: "https://www.fluidounce.co",
    siteName: "FLUID OUNCE",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: product.themeColor,
  colorScheme: "dark",
  // Lets the page paint into the notch / Dynamic Island area; the components
  // that need clearance ask for it with the pt-safe / pb-safe utilities.
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

/* The body carries the brand ground as a custom property so globals.css can
 * consume it without duplicating the value. */
const bodyStyle = { "--fo-gradient": product.gradient } as CSSProperties;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${bodoni.variable}`}>
      <body style={bodyStyle} className="font-sans antialiased">
        {/* SiteShell mounts the age gate above every route, so /order is
            gated by the same component as the main site. */}
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
