import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          /* The near-black the whole site sits on. */
          900: "#05070A",
          800: "#0A0E13",
          700: "#11161D",
          600: "#1A212A",
          500: "#2C3E4C",
        },
        ice: "#BFD3E0",
        platinum: "#E8EDF2",
        /* Candlelight — only ever used by the seasonal age gate. */
        ember: "#E8A15A",
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
        // "Bodoni 72" must stay quoted: an unquoted family name containing a
        // bare number is invalid CSS and voids the whole declaration.
        display: ["var(--font-display)", "Didot", '"Bodoni 72"', "Georgia", "serif"],
      },
      letterSpacing: {
        widest2: "0.24em",
        widest3: "0.4em",
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
