import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  // A finger leaves no hover behind: without this, whatever was tapped last
  // stays in its hover state until the next tap lands somewhere else.
  future: { hoverOnlyWhenSupported: true },
  theme: {
    extend: {
      /* After the widths, so each of these wins over sm, md and lg. */
      screens: {
        /* The opening's two-word layout: a wide screen, or any screen on its side. */
        flank: { raw: "(min-width: 1024px), (orientation: landscape)" },
        /* A phone on its side: too short to stack anything. */
        short: { raw: "(orientation: landscape) and (max-height: 520px)" },
        /* A mouse. Glass effects that a phone would pay for on every frame of a
         * scroll live behind this. */
        fine: { raw: "(pointer: fine)" },
      },
      colors: {
        /* Warm stone mid-tones. Linen is the stage: the bottle's glass is relit
         * onto it (STAGE in scripts/build-bottle.mjs — keep the two equal), and
         * every bottle stands on it. Porcelain is the alternate ground; ivory
         * the light surface for cards and fields; char the footer's dark. */
        ivory: "#F1ECE3",
        porcelain: "#AB9F8C",
        linen: "#9F937F",
        char: "#1B1815",
        /* Charred-wood ink for type. Soft and muted both clear WCAG AA on
         * porcelain and linen; faint is for placeholders on ivory and for
         * decoration only. */
        ink: {
          DEFAULT: "#141210",
          soft: "#211D19",
          muted: "#332D27",
          faint: "#5B5348",
        },
        /* The foil. On these mid-tones the true foil colour all but disappears,
         * so each surface takes the shade that reads on it:
         *   DEFAULT  the foil itself, for ivory cards and the dark footer
         *   light    champagne, for rules and sparks on the stone grounds
         *   deep     dark bronze, for small type on the stone grounds */
        gold: {
          DEFAULT: "#A8882C",
          deep: "#382B0B",
          light: "#E3CC8A",
        },
      },
      fontFamily: {
        /* Transitional serif — every small and running line of text. */
        serif: ["var(--font-text)", "Baskerville", "Georgia", "serif"],
        /* Modern (Didone) serif — headings, the manifesto, cocktail names.
         * "Bodoni 72" must stay quoted: an unquoted family name containing a
         * bare number is invalid CSS and voids the whole declaration. */
        display: ["var(--font-display)", "Didot", '"Bodoni 72"', "Georgia", "serif"],
        /* Geometric sans — the FLUID OUNCE name, like the wordmark on the
         * bottle and the plinth. */
        wordmark: ["var(--font-wordmark)", "Futura", '"Century Gothic"', "system-ui", "sans-serif"],
      },
      letterSpacing: {
        widest2: "0.2em",
        widest3: "0.32em",
      },
      transitionTimingFunction: {
        lux: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        "fo-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.45" },
        },
        "fo-scroll-cue": {
          "0%": { transform: "translateY(-100%)" },
          "60%, 100%": { transform: "translateY(260%)" },
        },
      },
      animation: {
        "fo-pulse": "fo-pulse 1.4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fo-scroll-cue": "fo-scroll-cue 2.4s cubic-bezier(0.65, 0, 0.35, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
