"use client";

import { motion } from "framer-motion";

/**
 * The scene behind the age gate.
 *
 * Year-round it is a night sky in the brand's own colours — ink, a cold pool
 * of light, slow smoke and film grain. In Halloween season a second layer
 * fades in over it: a harvest moon, bats crossing it, embers rising out of a
 * candle-warm glow, and a cobweb in the corner. Atmosphere, not costume — the
 * gate should still look like the front door of a luxury house.
 *
 * Every moving part animates transform or opacity only (keyframes live in
 * globals.css), so the scene runs on the compositor even on a phone. The
 * seasonal layer is client-only — it mounts after the clock has been read —
 * which is also why none of it needs to be hydration-safe.
 */

/* Fixed values rather than Math.random(): the scene is identical on every
 * visit and every render. */
const EMBERS = [
  { left: "6%", size: 3, duration: 11, delay: -2, drift: 26 },
  { left: "13%", size: 2, duration: 14, delay: -9, drift: -18 },
  { left: "21%", size: 4, duration: 12, delay: -5, drift: 34 },
  { left: "28%", size: 2, duration: 16, delay: -12, drift: -12 },
  { left: "36%", size: 3, duration: 10, delay: -1, drift: 20 },
  { left: "43%", size: 2, duration: 13, delay: -7, drift: -28 },
  { left: "51%", size: 3, duration: 15, delay: -3, drift: 16 },
  { left: "58%", size: 2, duration: 11, delay: -10, drift: -22 },
  { left: "64%", size: 4, duration: 14, delay: -6, drift: 30 },
  { left: "71%", size: 2, duration: 12, delay: -13, drift: -16 },
  { left: "78%", size: 3, duration: 16, delay: -4, drift: 24 },
  { left: "85%", size: 2, duration: 10, delay: -8, drift: -30 },
  { left: "91%", size: 3, duration: 13, delay: -11, drift: 18 },
  { left: "96%", size: 2, duration: 15, delay: -2.5, drift: -14 },
];

const BATS = [
  { top: "13%", width: 42, duration: 26, delay: -5, flap: 0.34 },
  { top: "21%", width: 26, duration: 33, delay: -19, flap: 0.28 },
  { top: "8%", width: 20, duration: 41, delay: -31, flap: 0.24 },
];

/* Symmetric about x = 50: a long arched leading edge, three scallops on the
 * trailing edge, small ears. */
const BAT_PATH =
  "M45 16 Q25 2 4 10 Q13 14 16 21 Q25 17 29 25 Q39 20 44 27 Q47 31 50 33 Q53 31 56 27 Q61 20 71 25 Q75 17 84 21 Q87 14 96 10 Q75 2 55 16 L53 8.5 L50.5 12.5 Q50 12.7 49.5 12.5 L47 8.5 Z";

/** A corner cobweb: radial threads from the corner, sagging spiral between. */
function cobwebPaths() {
  const threads = 7;
  const radii = [26, 50, 78, 110, 146, 186];
  const angle = (i: number) => (i / (threads - 1)) * (Math.PI / 2);
  const point = (r: number, i: number) => [r * Math.cos(angle(i)), r * Math.sin(angle(i))];
  const fmt = (n: number) => n.toFixed(1);

  const spokes = Array.from({ length: threads }, (_, i) => {
    const [x, y] = point(220, i);
    return `M0 0 L${fmt(x)} ${fmt(y)}`;
  });

  // Each strand dips toward the corner between its two spokes, like silk
  // that is carrying its own weight.
  const rings = radii.map((r) =>
    Array.from({ length: threads - 1 }, (_, i) => {
      const [x1, y1] = point(r, i);
      const [x2, y2] = point(r, i + 1);
      const mid = (i + 0.5) / (threads - 1);
      const sag = r * 0.82;
      const cx = sag * Math.cos(mid * (Math.PI / 2));
      const cy = sag * Math.sin(mid * (Math.PI / 2));
      return `M${fmt(x1)} ${fmt(y1)} Q${fmt(cx)} ${fmt(cy)} ${fmt(x2)} ${fmt(y2)}`;
    }).join(" "),
  );

  return [...spokes, ...rings].join(" ");
}

function Moon() {
  return (
    <div className="absolute right-[7%] top-[6%] aspect-square w-[25vmin] max-w-[200px] sm:right-[11%] sm:top-[9%]">
      {/* Halo — wide and faint, the light the moon throws into the haze. */}
      <div
        className="absolute -inset-[85%] rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(255,232,196,0.17) 0%, rgba(255,226,186,0.06) 45%, rgba(255,226,186,0) 72%)",
        }}
      />
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 36% 32%, #fffaf0 0%, #f4ead5 34%, #dccca9 66%, #b9a684 100%)",
          boxShadow:
            "0 0 70px 6px rgba(255,230,190,0.28), inset -16px -12px 36px rgba(110,90,62,0.38)",
        }}
      />
      {/* Maria: soft, irregular shadows rather than cartoon craters. */}
      <div
        className="absolute inset-0 rounded-full opacity-60 mix-blend-multiply"
        style={{
          background:
            "radial-gradient(28% 22% at 62% 38%, rgba(150,128,96,0.55), transparent 70%), radial-gradient(22% 26% at 38% 62%, rgba(150,128,96,0.45), transparent 70%), radial-gradient(14% 12% at 70% 68%, rgba(150,128,96,0.4), transparent 70%), radial-gradient(10% 10% at 30% 30%, rgba(150,128,96,0.35), transparent 70%)",
        }}
      />
    </div>
  );
}

export default function GateBackdrop({ halloween }: { halloween: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Year-round ground: ink, with a cold pool of light behind the copy. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 55% at 50% 42%, rgba(191,211,224,0.11) 0%, rgba(5,7,10,0) 70%), linear-gradient(180deg, #0A0E13 0%, #05070A 100%)",
        }}
      />

      {/* The seasonal sky crossfades in over the year-round one. */}
      <motion.div
        initial={false}
        animate={{ opacity: halloween ? 1 : 0 }}
        transition={{ duration: 1.6, ease: "easeOut" }}
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(90% 60% at 50% 0%, rgba(58,36,86,0.55) 0%, rgba(20,12,32,0) 70%), linear-gradient(180deg, #120c1d 0%, #0a0711 48%, #050407 100%)",
        }}
      />

      {halloween ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, ease: "easeOut", delay: 0.2 }}
          className="absolute inset-0"
        >
          <Moon />

          {BATS.map((bat) => (
            <div
              key={bat.top}
              className="absolute left-0"
              style={{
                top: bat.top,
                animation: `fo-bat-fly ${bat.duration}s linear ${bat.delay}s infinite`,
              }}
            >
              <svg
                viewBox="0 0 100 36"
                width={bat.width}
                className="text-[#07050b]"
                style={{
                  transformOrigin: "50% 40%",
                  animation: `fo-bat-flap ${bat.flap}s ease-in-out infinite alternate`,
                  filter: "drop-shadow(0 0 1px rgba(255,236,210,0.18))",
                }}
              >
                <path d={BAT_PATH} fill="currentColor" />
              </svg>
            </div>
          ))}

          {/* Cobweb, top-left, swaying a degree or so as if in a draught. */}
          <svg
            viewBox="0 0 220 220"
            className="absolute -left-1 -top-1 w-[34vmin] max-w-[240px]"
            style={{ transformOrigin: "0 0", animation: "fo-sway 7s ease-in-out infinite alternate" }}
          >
            <path d={cobwebPaths()} fill="none" stroke="rgba(236,228,214,0.15)" strokeWidth={0.6} />
          </svg>

          {/* Candle-warm glow rising from below, with an uneven flicker. */}
          <div
            className="absolute inset-x-0 bottom-0 h-[70%]"
            style={{
              background:
                "radial-gradient(65% 55% at 50% 108%, rgba(255,122,34,0.30) 0%, rgba(214,88,22,0.10) 42%, rgba(120,40,10,0) 72%)",
              animation: "fo-flicker 5.5s ease-in-out infinite",
            }}
          />

          {EMBERS.map((ember) => (
            <span
              key={ember.left}
              className="absolute bottom-[-2%] block rounded-full"
              style={
                {
                  left: ember.left,
                  width: ember.size,
                  height: ember.size,
                  background: "radial-gradient(circle, #ffe0b0 0%, #ff9a3c 45%, rgba(255,120,30,0) 72%)",
                  boxShadow: "0 0 8px 1px rgba(255,140,50,0.55)",
                  animation: `fo-ember ${ember.duration}s ease-out ${ember.delay}s infinite`,
                  "--fo-drift": `${ember.drift}px`,
                } as React.CSSProperties
              }
            />
          ))}
        </motion.div>
      ) : null}

      {/* Smoke: two wide, soft bands drifting against each other. */}
      <div
        className="absolute -inset-x-[20%] bottom-[-8%] h-[55%]"
        style={{
          background:
            "radial-gradient(45% 50% at 30% 60%, rgba(214,222,232,0.07) 0%, rgba(214,222,232,0) 70%), radial-gradient(40% 45% at 72% 70%, rgba(214,222,232,0.06) 0%, rgba(214,222,232,0) 70%)",
          animation: "fo-mist 38s ease-in-out infinite alternate",
        }}
      />
      <div
        className="absolute -inset-x-[20%] top-[18%] h-[45%]"
        style={{
          background:
            "radial-gradient(50% 40% at 64% 40%, rgba(214,222,232,0.05) 0%, rgba(214,222,232,0) 70%), radial-gradient(35% 35% at 24% 55%, rgba(214,222,232,0.04) 0%, rgba(214,222,232,0) 70%)",
          animation: "fo-mist 52s ease-in-out -20s infinite alternate-reverse",
        }}
      />

      {/* Vignette, then grain on top of everything. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 95% at 50% 45%, rgba(5,7,10,0) 52%, rgba(3,3,6,0.78) 100%)",
        }}
      />
      <div className="bg-grain absolute inset-0 opacity-[0.07]" />
    </div>
  );
}
