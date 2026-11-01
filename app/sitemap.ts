import type { MetadataRoute } from "next";

import { SITE_URL } from "@/data/site";

// Written once at build time into out/sitemap.xml.
export const dynamic = "force-static";

/**
 * Every public page, with the trailing slash the export serves. The trade
 * portal is deliberately absent — it is reachable by direct URL only.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/discover/`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/terms/`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/privacy/`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];
}
