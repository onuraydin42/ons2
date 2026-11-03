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
        /* A laptop's window once the browser's bars are out of it: wide enough to pin
         * the showcase, too low for its full type. */
        low: { raw: "(min-width: 1024px) and (min-height: 521px) and (max-height: 760px)" },
        /* A mouse. Glass effects that a phone would pay for on every frame of a
         * scroll live behind this. */
        fine: { raw: "(pointer: fine)" },
      },
      colors: {
        /* Smoked stone, taken a little toward the grey-green of burnt timber. Linen
         * is the stage: the bottle's glass is relit onto it (STAGE in
         * scripts/build-bottle.mjs — keep the two equal), and every bottle stands
         * on it. Porcelain is the alternate ground; ivory the light surface for
         * cards and fields; char the timber of the dark sections. */
        ivory: "#F1ECE3",
        porcelain: "#A19A89",
        linen: "#938C7B",
        char: "#141311",
        /* Charred-wood ink for type. Soft and muted both clear WCAG AA on
         * porcelain and linen; faint is for placeholders on ivory and for
         * decoration only. */
        ink: {
          DEFAULT: "#12110F",
          soft: "#1E1B17",
          muted: "#2B2621",
          faint: "#544E43",
        },
        /* The foil. On these mid-tones the true foil colour all but disappears,
         * so each surface takes the shade that reads on it:
         *   DEFAULT  the foil itself, for ivory cards and the charred sections
         *   light    champagne, for type on char, and rules on the stone grounds
         *   deep     dark bronze, for small type on the stone grounds */
        gold: {
          DEFAULT: "#B8923A",
          deep: "#2E2308",
          light: "#E8D394",
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
