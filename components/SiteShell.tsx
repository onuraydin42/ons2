"use client";

import { motion, useReducedMotion } from "framer-motion";
import { createContext, useContext, useMemo, useState } from "react";

import AgeGate from "@/components/AgeGate";
import SmoothScroll from "@/components/SmoothScroll";
import { EASE_OUT_EXPO, ENTRANCE_TREMBLE } from "@/lib/motion";

/**
 * Whether the visitor is through the age gate.
 *
 * The opening choreography waits on this: a headline that assembles itself
 * behind an opaque gate is an animation nobody sees.
 */
const EnteredContext = createContext(false);

export function useSiteEntered(): boolean {
  return useContext(EnteredContext);
}

/* The tremble's shape at intensity 1 (ENTRANCE_TREMBLE in lib/motion.ts
 * scales all of it). Uneven and decaying on purpose: an even shake reads as a
 * phone buzzing, an uneven one that dies away reads as film settling in a
 * projector gate. Shake is in pixels; flicker is how far the light dips, as
 * veil opacity — never more than three dips in a second, and only darkening. */
const SHAKE_X = [0, 2.4, -2.1, 1.8, -1.6, 1.3, -1.1, 0.8, -0.6, 0.4, -0.25, 0.1, 0];
const SHAKE_Y = [0, -1.6, 1.5, -1.2, 1, -0.9, 0.7, -0.5, 0.4, -0.25, 0.15, -0.05, 0];
const FLICKER = [0, 0.18, 0.05, 0.14, 0.03, 0.1, 0.02, 0.05, 0];
const FLICKER_TIMES = [0, 0.08, 0.2, 0.3, 0.45, 0.55, 0.7, 0.82, 1];
const GRAIN = [0, 0.14, 0.1, 0];

/* FLICKER dips four times, first to last across 74% of the run. At 1.4s that
 * span is just over a second, so no one-second window ever holds more than
 * three dips — the ceiling for flashing content. Shorter durations are raised
 * to this. */
const MIN_TREMBLE_DURATION = 1.4;

const clampOpacity = (value: number) => Math.min(Math.max(value, 0), 0.9);

/**
 * The light half of the tremble: projector flicker and a burst of boiling
 * grain over the whole screen, removed once it has played. It sits under the
 * gate (z 999) and over the page — and outside the page wrapper, whose
 * transform would otherwise trap this fixed layer.
 */
function EntranceFlicker({ intensity, duration }: { intensity: number; duration: number }) {
  const [done, setDone] = useState(false);
  if (done) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[998] overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: FLICKER.map((value) => clampOpacity(value * intensity)) }}
        transition={{ duration, times: FLICKER_TIMES, ease: "linear" }}
        onAnimationComplete={() => setDone(true)}
      />
      <motion.div
        className="bg-grain animate-fo-grain-boil absolute -inset-[10%]"
        initial={{ opacity: 0 }}
        animate={{ opacity: GRAIN.map((value) => clampOpacity(value * intensity)) }}
        transition={{ duration, times: [0, 0.12, 0.65, 1], ease: "easeOut" }}
      />
    </div>
  );
}

/**
 * The one shell every route mounts inside.
 *
 * The brand site, its info pages and the hidden trade portal are different
 * experiences, but they share the same front door and the same scroll feel:
 * momentum scrolling wraps everything, and the age gate renders above it, so
 * the portal is gated by exactly the same component as the brand site.
 *
 * The shell also owns the entrance. The page is held dimmed and very slightly
 * scaled up while the gate is open, then settles into place as the gate
 * leaves — trembling as it lands, then going still. The motions overlap, so
 * it reads as one move.
 */
export default function SiteShell({ children }: { children: React.ReactNode }) {
  const [entered, setEntered] = useState(false);

  const reduceMotion = useReducedMotion();
  const tremble = reduceMotion ? 0 : Math.max(ENTRANCE_TREMBLE.intensity, 0);
  const trembleDuration = Math.max(ENTRANCE_TREMBLE.duration, MIN_TREMBLE_DURATION);
  const shake = useMemo(
    () => ({
      x: SHAKE_X.map((value) => value * tremble),
      y: SHAKE_Y.map((value) => value * tremble),
    }),
    [tremble],
  );

  // The settle from slightly zoomed-in is where the shimmer in the type and
  // grain comes from, so a stronger tremble starts it a touch further out.
  const settleFrom = 1.04 + 0.01 * tremble;

  return (
    <SmoothScroll>
      <AgeGate onEnter={() => setEntered(true)} />

      {entered && tremble > 0 ? (
        <EntranceFlicker intensity={tremble} duration={trembleDuration} />
      ) : null}

      <EnteredContext.Provider value={entered}>
        <motion.div
          initial={{ opacity: 0, scale: settleFrom }}
          animate={
            entered
              ? { opacity: 1, scale: 1, x: shake.x, y: shake.y }
              : { opacity: 0.25, scale: settleFrom, x: 0, y: 0 }
          }
          transition={{
            opacity: { duration: 1.5, ease: EASE_OUT_EXPO },
            scale: { duration: 1.8, ease: EASE_OUT_EXPO },
            x: { duration: trembleDuration, ease: "easeInOut" },
            y: { duration: trembleDuration, ease: "easeInOut" },
          }}
          // The scale would otherwise be measured against a moving viewport and
          // drift as the page grows.
          style={{ transformOrigin: "50% 0%" }}
        >
          {children}
        </motion.div>
      </EnteredContext.Provider>
    </SmoothScroll>
  );
}
