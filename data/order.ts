/** Option sets for the trade portal. Distribution is licensed in three states. */

export const STATES = ["New York", "New Jersey", "Florida"] as const;

export const BOTTLES_PER_CASE = 6;

/* Spelled out as cases *and* bottles, so nobody has to do the arithmetic:
 * "1 Case - 6 Bottles", "2 Cases - 12 Bottles", … */
export const CASE_OPTIONS = Array.from({ length: 20 }, (_, i) => {
  const cases = i + 1;
  return `${cases} ${cases === 1 ? "Case" : "Cases"} - ${cases * BOTTLES_PER_CASE} Bottles`;
});

/* The two kinds of account the portal serves. Each receives the bottle in a
 * different presentation, which is why the order form shows one or the other
 * as soon as a type is chosen. */
export const BUSINESS_TYPES = ["Liquor Store", "Restaurant"] as const;
export type BusinessType = (typeof BUSINESS_TYPES)[number];

export const PRESENTATION = {
  boxed: {
    src: "/images/editorial/boxx.webp",
    alt: "FLUID OUNCE in its boxed presentation — the bottle between a closed and an open box",
  },
  bottle: {
    src: "/media/rotate.mp4",
    poster: "/media/rotate-poster.webp",
    label: "The FLUID OUNCE signature bottle turning on its display plinth",
  },
} as const;

export const PRESENTATION_NOTE: Record<BusinessType, string> = {
  "Liquor Store": "Liquor Store partners receive the boxed presentation.",
  Restaurant: "Restaurant partners receive the signature bottle presentation.",
};
