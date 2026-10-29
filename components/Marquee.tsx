"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

import { useSiteEntered } from "@/components/SiteShell";

/**
 * The running line under the opening — the most fashion-house device on the
 * page, and one of the cheapest: a CSS transform on a loop.
 *
 * It opens like a sentence. At rest the first word sits exactly at the inner
 * edge of the left fade with nothing before it, and the line holds that
 * composition until the visitor is through the age gate and the band is on
 * screen; only then does it start to glide. After one pass a seamless loop
 * takes over (the motion itself lives in globals.css).
 *
 * The run is rendered four times back to back — enough to cover the right
 * edge of the widest screens at every point of the loop. Only the first copy
 * is read by assistive tech.
 */

const ITEMS = [
  "Ultra Premium",
  "12X Distilled",
  "Glacial Water",
  "Zero Additives",
  "Handcrafted",
  "Imported",
];

/** Seconds per run — the speed of the line. */
const LOOP_SECONDS = 46;

const COPIES = 4;

function Spark() {
  return (
    <svg viewBox="0 0 12 12" aria-hidden className="h-2.5 w-2.5 shrink-0 text-ice/45">
      <path d="M6 0 L7 5 L12 6 L7 7 L6 12 L5 7 L0 6 L5 5 Z" fill="currentColor" />
    </svg>
  );
}

function Run({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul
      aria-hidden={hidden || undefined}
      className="flex shrink-0 items-center gap-8 pr-8 sm:gap-12 sm:pr-12"
    >
      {ITEMS.map((item, index) => (
        <li key={item} className="flex items-center gap-8 sm:gap-12">
          {/* Alternating a Didone italic with tracked-out sans is the whole
              look: one voice editorial, one voice label. */}
          {index % 2 === 0 ? (
            <span className="whitespace-nowrap font-display text-2xl italic text-platinum/85 sm:text-[2rem]">
              {item}
            </span>
          ) : (
            <span className="whitespace-nowrap text-[10px] font-light uppercase tracking-widest3 text-white/50 sm:text-[11px]">
              {item}
            </span>
          )}
          <Spark />
        </li>
      ))}
    </ul>
  );
}

export default function Marquee() {
  const entered = useSiteEntered();
  const bandRef = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  /* Starts once the visitor is through the gate and nearly the whole band is
   * on screen, so the opening composition is actually seen before it moves.
   * Measured directly on scroll rather than with an IntersectionObserver: an
   * observer reports any sliver of overlap as "intersecting", and its last
   * report goes stale while the page is hidden. Once started it keeps
   * running, and the listeners go. A reload remounts it at rest. */
  useEffect(() => {
    const band = bandRef.current;
    if (!band || !entered || started) return;

    const check = () => {
      const rect = band.getBoundingClientRect();
      const viewport = window.innerHeight;
      if (viewport <= 0 || rect.height <= 0) return;
      const visible = Math.min(rect.bottom, viewport) - Math.max(rect.top, 0);
      if (visible >= rect.height * 0.9) setStarted(true);
    };

    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [entered, started]);

  return (
    <div
      ref={bandRef}
      // --marquee-inset is the width of the edge fades and also where the
      // first word rests, so the two can never drift apart.
      className="relative overflow-hidden border-y border-white/10 bg-ink-900 py-5 [--marquee-inset:4rem] sm:py-7 sm:[--marquee-inset:8rem]"
      style={{ "--marquee-loop": `${LOOP_SECONDS}s` } as CSSProperties}
    >
      <div
        className="animate-fo-marquee-run flex w-max"
        style={{ animationPlayState: started ? "running" : "paused" }}
      >
        {Array.from({ length: COPIES }, (_, index) => (
          <Run key={index} hidden={index > 0} />
        ))}
      </div>

      {/* Soft edges, so words arrive out of the dark instead of a hard cut. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-[var(--marquee-inset)] bg-gradient-to-r from-ink-900 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-[var(--marquee-inset)] bg-gradient-to-l from-ink-900 to-transparent"
      />
    </div>
  );
}
