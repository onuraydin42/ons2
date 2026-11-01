import { BRAND, CONTACT, DISCOVER, SEO, SITE_URL, SOCIAL_LINKS } from "@/data/site";

/**
 * schema.org data for search engines: who the brand is, how to reach it, and
 * its official profiles — the facts Google uses for a brand's knowledge panel
 * and for matching "FLUID OUNCE" searches to this site. Everything here comes
 * from data/site.ts, so it can never disagree with what the pages say.
 */
export default function StructuredData() {
  const organization = {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: BRAND,
    alternateName: ["Fluid Ounce", "Fluid Ounce Vodka", "FLUID OUNCE.CO"],
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/logo.png`,
    image: `${SITE_URL}${SEO.ogImage}`,
    description: DISCOVER.body,
    email: CONTACT.email,
    telephone: CONTACT.phoneE164,
    address: {
      "@type": "PostalAddress",
      addressLocality: CONTACT.city,
      addressRegion: "NY",
      addressCountry: "US",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: CONTACT.email,
      telephone: CONTACT.phoneE164,
      areaServed: "US",
      availableLanguage: "English",
    },
    sameAs: SOCIAL_LINKS.map((link) => link.href),
    brand: {
      "@type": "Brand",
      name: BRAND,
      logo: `${SITE_URL}/logo.png`,
    },
  };

  const website = {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: `${SITE_URL}/`,
    name: BRAND,
    description: SEO.description,
    inLanguage: "en-US",
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": [organization, website] });

  return (
    <script
      type="application/ld+json"
      // The payload is built from our own constants; escaping "<" keeps a
      // stray "</script>" in copy from ever closing the tag early.
      dangerouslySetInnerHTML={{ __html: json.replace(/</g, "\\u003c") }}
    />
  );
}
