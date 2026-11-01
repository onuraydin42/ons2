/**
 * The four FLUID OUNCE cocktails, transcribed from their recipe cards
 * (images2/{cosmo,velvet,blonde,vesper}). Names and builds are exactly as the
 * cards print them — capitalisation and spelling included — so the copy never
 * disagrees with the card shown beside it.
 */

export interface Cocktail {
  id: string;
  name: string;
  image: string;
  /** The room tint while this card is on stage. */
  accent: string;
  build: string[];
}

export const cocktails: Cocktail[] = [
  {
    id: "cosmo",
    name: "Fluid Cosmo",
    image: "/images/cocktails/cosmo.webp",
    accent: "#A7B26A",
    build: ["Olive oil wash", "Fig", "Sage", "Lemon drops", "FLUID OUNCE vodka"],
  },
  {
    id: "velvet",
    name: "Fluid Velvet",
    image: "/images/cocktails/velvet.webp",
    accent: "#8A6446",
    build: ["Brewed Colombian Espresso", "Coffee Liquer", "Baileys", "FLUID OUNCE Vodka"],
  },
  {
    id: "blonde",
    name: "Fluid Blonde",
    image: "/images/cocktails/blonde.webp",
    accent: "#D9C56C",
    build: ["Organic Lemon juice", "Lemon Mint simple syrup", "FLUID OUNCE Vodka"],
  },
  {
    id: "vesper",
    name: "Fluid Vesper",
    image: "/images/cocktails/vesper.webp",
    accent: "#6E55A6",
    build: ["Lavender Gin", "Lillet Blanc", "Lemon Drops", "FLUID OUNCE Vodka"],
  },
];
