/**
 * There is exactly one vodka. This is a single object, not an array — the site
 * never switches products, only the cocktails inside the Collection section.
 *
 * No price field. Nothing on this site is for sale.
 */

export interface Product {
  id: string;
  name: string;
  subName: string;
  description: string;
  themeColor: string;
  gradient: string;
  features: string[];
  stats: { label: string; val: string }[];
  detailsSection: { title: string; description: string; image: string; imageAlt: string };
  craftSection: { title: string; description: string };
}

export const product: Product = {
  id: "signature",
  name: "Signature",
  subName: "Absolute clarity.",
  description: "12X distilled - Glacial water - Zero additives",
  themeColor: "#BFD3E0",
  gradient: "linear-gradient(135deg, #0A0E13 0%, #2C3E4C 100%)",
  features: ["12X Distilled", "Glacial Water", "Zero Additives"],
  stats: [
    { label: "ABV", val: "40%" },
    { label: "Distillation", val: "12X" },
    { label: "Additives", val: "0" },
  ],
  detailsSection: {
    title: "Cut From Crystal",
    description:
      "The FLUID OUNCE bottle is a tall, hand-faceted crystal column — 44 facets, each polished individually so light travels through the spirit rather than around it. The weight in your hand is deliberate. Nothing about this bottle was designed to be cheap to produce.",
    image: "/images/editorial/boxx.webp",
    imageAlt: "The FLUID OUNCE Signature bottle between its closed and open presentation boxes",
  },
  craftSection: {
    title: "Grain to Glass",
    description:
      "We control every step from field to fill. Twelve column distillations, filtration through Nordic quartz sand, and a final rest in glacial-melt water reduced to exactly 40% ABV. No sugar, no glycerol, no citric acid. What reaches the bottle is only what the grain gave us.",
  },
};
