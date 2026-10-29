export interface Cocktail {
  id: string;
  name: string;
  tagline: string;
  image: string;
  accent: string;
  build: string[];
  description: string;
}

export const cocktails: Cocktail[] = [
  {
    id: "cosmo",
    name: "Cosmopolitan",
    tagline: "Sharp, bright, unbothered.",
    image: "/images/cocktails/cosmo.webp",
    accent: "#7A1F3D",
    build: ["Signature", "Triple sec", "Cranberry", "Fresh lime"],
    description:
      "The test every vodka fails or passes in public. With nothing to hide behind, Signature keeps the citrus clean and the finish dry instead of syrupy.",
  },
  {
    id: "velvet",
    name: "Velvet",
    tagline: "Texture over noise.",
    image: "/images/cocktails/velvet.webp",
    accent: "#4A3524",
    build: ["Signature", "Vanilla", "Cream", "Cacao dust"],
    description:
      "A house build that leans entirely on mouthfeel. Because Signature carries no burn, the cream never has to fight the spirit — it simply rests on it.",
  },
  {
    id: "blonde",
    name: "Blonde",
    tagline: "Golden hour in a coupe.",
    image: "/images/cocktails/blonde.webp",
    accent: "#5C4B1E",
    build: ["Signature", "Elderflower", "Grapefruit", "Sea salt"],
    description:
      "Floral and faintly saline. The salt pulls the grapefruit forward and the elderflower keeps it from turning bitter. Serve very cold, no garnish.",
  },
  {
    id: "vesper",
    name: "Vesper",
    tagline: "Stirred, and deeply serious.",
    image: "/images/cocktails/vesper.webp",
    accent: "#1E2A3A",
    build: ["Signature", "Dry gin", "Lillet Blanc", "Lemon oil"],
    description:
      "The most unforgiving drink on this list. Three spirits, no sugar, nowhere to hide. This is the build we use when someone asks us to prove the point.",
  },
];
