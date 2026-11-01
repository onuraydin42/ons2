/**
 * Every line of brand copy on the site, taken verbatim from
 * https://www.fluidounce.co — the home page, /discover.html and the footer.
 * Wording, capitalisation and punctuation are the brand's own; edit them here
 * and nowhere else. The legal documents live in data/legal.ts and the
 * cocktails (from their recipe cards) in data/cocktails.ts.
 */

export const SITE_URL = "https://www.fluidounce.co";

export const BRAND = "FLUID OUNCE";

/** The line under the name in the opening. */
export const TAGLINE = "Distilled Purity. Timeless Craft. Elevated Nights.";

export const MANIFESTO =
  '"We believe in the true definition of luxury, the state of great comfort and extravagant living does not always have to be Untouchable".';

export const DISCOVER = {
  title: "Discover",
  body: "Where ancient Japanese tradition meets modern liquid perfection. Encased in a master-crafted super flint decanter and crowned with Shou sugi ban artistry, FLUID OUNCE delivers a silky, 12-time distilled experience that demands to be displayed, not hidden. Witness the balance of the perfect formula.",
  cta: "Discover More",
} as const;

/** /discover — the long story, as written on /discover.html. */
export const DISCOVER_PAGE = {
  eyebrow: "Fluid Ounce Vodka",
  title: "Fluid Ounce",
  paragraphs: [
    "Vodka was created using the finest grains & pure deep ground spring water to deliver a smooth creamy distinctive taste with intriguing flavor. The founders worked for 4 years with one of the biggest vodka manufacturers and grain agriculturalist in the world and together with their taste makers created superior grain and outstanding recipe that as a result allows its drinker to enjoy the vodka neat, iced or mixed cocktail.",
    "FLUID OUNCE grains are specially grown in a perfect temperature soil and with pure in-ground spring water that wasn’t processed creating a spectacular growing environment. The vodka and pure spring water go through a multi-stage filtration and 12 time distillation process before being blended to meet proofing specifications which bring the quality to ultra premium and ending in silky, complex with medium-long finish. The unique Blend of Ingredients go throw a special revolutionary aging process and add an unparalleled quality that could only be found in Our vodka,",
    "The vision behind our beautiful bottle was inspired by art and style. The objective was to create an experience that excites the senses whether it is displayed on the counter or the drink cart and not hidden away. This stupendous super flint glass decanter will be enjoyed by the person who owns it, as much as the guest who views it.",
    "The inspiration for the opulent bottle cap and the exquisite box are influenced by Shou sugi ban style also known as Yakisugi. Yakisugi is an ancient Japanese technique for preserving wood by burning it with an open flame to create a charred surface, so it will be resistant to UV rays, fire, and water.",
    "Our journey took an unconventional path as designers, where we crafted the custom bottle, box, and packaging before settling on a name. Throughout the year-long process of formulating our product in collaboration with scientists, the term ” fluid ounce ” frequently emerged due to its relevance to the ratios. This led us to name the vodka “FLUID OUNCE” and create the same company around that name the represents us perfectly and encapsulate the comprehensive nature of our journey. However, our logo, featuring an elongated “L” and “OZ” resembling a scale, symbolizes balance and the intricate process of achieving a harmonious formula. While the name holds significance, it’s our logo that truly embodies the essence of our brand, much like the top Fashion brands, we always present our name alongside our logo, as they are inseparable in defining our brand identity.",
  ],
} as const;

export const CONTACT = {
  title: "Contact",
  emailLabel: "Email",
  email: "info@fluidounce.co",
  phoneLabel: "Phone",
  phone: "646-808-6140",
  /** E.164 for tel: links and structured data. */
  phoneE164: "+16468086140",
  city: "New York",
} as const;

export interface SocialLink {
  label: string;
  href: string;
}

export const INSTAGRAM: SocialLink = {
  label: "Instagram",
  href: "https://www.instagram.com/fluidounceco/",
};

export const TWITTER: SocialLink = {
  label: "X / Twitter",
  href: "https://twitter.com/FLUIDOUNCEco",
};

export const SOCIAL_LINKS: SocialLink[] = [INSTAGRAM, TWITTER];

/** The age question, as on the live gate. "No" leaves for Google. */
export const AGE_GATE = {
  wordmark: "FLUID OUNCE",
  question: "Are You 21 Years Of Age Or Older?",
  yes: "Yes",
  no: "No",
  note: "YOU MUST BE OF LEGAL AGE FOR PURCHASING AND CONSUMING ALCOHOL TO ENTER THIS SITE",
  accept: "I ACCEPT THE TERMS & CONDITIONS AND PRIVACY POLICY",
  declineUrl: "https://www.google.com",
} as const;

export interface NavLink {
  label: string;
  href: string;
  external?: boolean;
}

/* The live navigation: the page to the left of the mark, the small print and
 * press to the right. "Media" is the brand's Instagram, as it is live. */
export const NAV_LEFT: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Discover", href: "/#discover" },
  { label: "Contact", href: "/#contact" },
];

export const NAV_RIGHT: NavLink[] = [
  { label: "Terms", href: "/terms/" },
  { label: "Privacy", href: "/privacy/" },
  { label: "Media", href: INSTAGRAM.href, external: true },
];

export const FOOTER_LINKS: NavLink[] = [
  { label: "Contact", href: "/#contact" },
  { label: "Terms & Conditions", href: "/terms/" },
  { label: "Privacy Policy", href: "/privacy/" },
  { label: "Media", href: INSTAGRAM.href, external: true },
];

/** The footer's small print. The two sites at the end are links. */
export const FOOTER_LEGAL = {
  text: "By entering this site you are agreeing to Terms of Use and Privacy Policy. By entering this site you agree to our cookie policy. We use analytics cookies to enhance your browsing experience and improve our website. This site is for personal use by persons who are lawfully permitted to purchase and consume alcoholic beverages in their country of access. Vodka and flavored vodkas - 40% alc. by vol. Content for 21+ only. For alcohol responsibility information visit",
  links: [
    { label: "responsibility.org", href: "https://www.responsibility.org" },
    { label: "responsibledrinking.org", href: "https://www.responsibledrinking.org" },
  ],
} as const;

export const copyright = (year: number) => `© ${year} Fluid Ounce. All rights reserved.`;

/* The running line under the opening. Each phrase is lifted from the live
 * copy: the tagline, and the Discover paragraph's "12-time distilled",
 * "super flint decanter" and "Shou sugi ban". */
export const MARQUEE = [
  "Distilled Purity",
  "Timeless Craft",
  "Elevated Nights",
  "12-Time Distilled",
  "Super Flint Decanter",
  "Shou Sugi Ban",
] as const;

/* Image descriptions, reusing the live site's own alt text where it has one. */
export const ALT = {
  logo: "FLUID OUNCE logo",
  luxury: "Fluid Ounce luxury bottle",
  boxed: "Fluid Ounce boxed presentation",
  rotating: "Bottle rotating preview",
  daylight: "A bottle of FLUID OUNCE on a sunlit windowsill",
  candlelight: "A martini by candlelight with the Manhattan skyline behind it",
} as const;

/* Search and sharing. Titles are built from the brand's own words — the name,
 * "Fluid Ounce Vodka" from /discover.html, and the tagline. */
export const SEO = {
  title: `${BRAND} Vodka | ${TAGLINE}`,
  description:
    "Where ancient Japanese tradition meets modern liquid perfection. Encased in a master-crafted super flint decanter and crowned with Shou sugi ban artistry, FLUID OUNCE delivers a silky, 12-time distilled experience that demands to be displayed, not hidden.",
  ogImage: "/og.jpg",
  ogImageAlt: "FLUID OUNCE Vodka — the bottle between its closed and open presentation boxes",
  themeColor: "#9F937F",
} as const;
