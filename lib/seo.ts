import type { Metadata } from "next";

import { BRAND, SEO } from "@/data/site";

/**
 * Per-page metadata with its own canonical URL and share card.
 *
 * Next.js replaces (rather than merges) `openGraph`, `twitter` and
 * `alternates` when a page sets them, and a page that sets none inherits the
 * layout's — which would point every page's canonical at the home page. So
 * every indexable page builds all three here, from its own path.
 *
 * `path` keeps the trailing slash: the export is built with trailingSlash, so
 * /terms/ is the URL that actually serves (and /terms redirects to it).
 */
export function pageMetadata({
  title,
  description,
  path,
}: {
  /** Omit on the home page to use the full brand title. */
  title?: string;
  description: string;
  path: string;
}): Metadata {
  const shareTitle = title ? `${title} | ${BRAND}` : SEO.title;

  return {
    ...(title ? { title } : { title: { absolute: SEO.title } }),
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: path,
      siteName: BRAND,
      title: shareTitle,
      description,
      locale: "en_US",
      images: [{ url: SEO.ogImage, width: 1200, height: 630, alt: SEO.ogImageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      site: "@FLUIDOUNCEco",
      title: shareTitle,
      description,
      images: [SEO.ogImage],
    },
  };
}
