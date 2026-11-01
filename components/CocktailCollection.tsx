"use client";

import Image from "next/image";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import { cocktails } from "@/data/cocktails";
import { hexToRgba } from "@/lib/color";
import { DURATION, EASE_OUT_EXPO, EASE_OUT_QUINT } from "@/lib/motion";

// The card leads, copy follows just behind it. Kept tight on purpose: with
// mode="wait" the outgoing and incoming animations run back to back, so these
// numbers are the delay a visitor feels every time they press an arrow or pill.
const PLATE_DURATION = 0.6;
const SWAP_DURATION = 0.2;
const TEXT_DELAY = 0.05;
/* Every exit shares this. It is the delay a visitor feels on every switch. */
const EXIT_DURATION = 0.2;

/* Colour is the one thing that is never hurried: the room's tint runs on a
 * long ease-in-out, so the light blends from one drink to the next. */
const COLOR_DURATION = 1.6;
const COLOR_EASE = [0.45, 0, 0.55, 1] as const;

/**
 * Entrances are staggered and unhurried; exits are neither.
 *
 * `AnimatePresence mode="wait"` holds the incoming cocktail until *every*
 * descendant has finished leaving, so the slowest exit is added to the delay a
 * visitor feels after pressing an arrow. Giving exit its own short, undelayed
 * transition is what makes the switch feel immediate while keeping the
 * arrival luxurious.
 */
const riseIn = (index: number) => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10, transition: { duration: EXIT_DURATION, delay: 0 } },
  transition: {
    duration: 0.6,
    delay: TEXT_DELAY + index * 0.055,
    ease: EASE_OUT_EXPO,
  },
});

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      strokeLinecap="square"
      className="h-7 w-7 sm:h-9 sm:w-9"
      aria-hidden
    >
      <path d={direction === "left" ? "M15 5 L8 12 L15 19" : "M9 5 L16 12 L9 19"} />
    </svg>
  );
}

/**
 * The four FLUID OUNCE cocktails, each shown with its recipe card.
 *
 * The arrows, the pill menu and the arrow keys move between them. They change
 * component state and nothing else — they never scroll the page.
 */
export default function CocktailCollection() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { amount: 0.5 });

  const [cocktailIndex, setCocktailIndex] = useState(0);
  const active = cocktails[cocktailIndex];

  const go = useCallback((delta: number) => {
    // Wraps in both directions: 3 -> 0 and 0 -> 3.
    setCocktailIndex((current) => (current + delta + cocktails.length) % cocktails.length);
  }, []);

  /* Warm the other three cards so switching never shows a blank stage, once the
   * section is close enough for that to be worth a phone's data. */
  const nearby = useInView(sectionRef, { once: true, margin: "100% 0px" });
  useEffect(() => {
    if (!nearby) return;
    cocktails.forEach((cocktail) => {
      const img = new window.Image();
      img.src = cocktail.image;
    });
  }, [nearby]);

  /* A sideways swipe moves between the drinks; an up-and-down one passes through
   * as the page's own scroll. */
  const swipeFrom = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (event: React.TouchEvent) => {
    const touch = event.touches[0];
    swipeFrom.current = event.touches.length === 1 ? { x: touch.clientX, y: touch.clientY } : null;
  };
  const onTouchEnd = (event: React.TouchEvent) => {
    const from = swipeFrom.current;
    swipeFrom.current = null;
    if (!from) return;
    const touch = event.changedTouches[0];
    const x = touch.clientX - from.x;
    const y = touch.clientY - from.y;
    if (Math.abs(x) > 48 && Math.abs(x) > Math.abs(y) * 1.5) go(x < 0 ? 1 : -1);
  };

  /* Arrow keys drive the switcher, but only while the section is on screen —
   * otherwise they would hijack arrow-key scrolling everywhere else. */
  useEffect(() => {
    if (!inView) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        go(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        go(1);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [inView, go]);

  return (
    <motion.section
      ref={sectionRef}
      id="collection"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: DURATION.slow, ease: EASE_OUT_EXPO }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{ touchAction: "pan-y pinch-zoom" }}
      className="relative min-h-[46rem] overflow-hidden bg-porcelain lg:h-stage lg:min-h-[44rem] short:min-h-0"
      aria-roledescription="carousel"
      aria-label="Cocktails"
    >
      {/* Mood layer: the whole room drifts toward the active drink's colour. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        initial={false}
        animate={{ backgroundColor: hexToRgba(active.accent, 0.13) }}
        transition={{ duration: COLOR_DURATION, ease: COLOR_EASE }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          // A pool of ivory light behind the card, so the plate reads as lit.
          background:
            "radial-gradient(55% 65% at 70% 50%, rgba(241,236,227,0.32) 0%, rgba(241,236,227,0) 70%)",
        }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={active.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: SWAP_DURATION, ease: EASE_OUT_EXPO }}
          className="relative h-full"
        >
          <div className="mx-auto flex h-full max-w-7xl flex-col items-center justify-center gap-10 px-14 pb-44 pt-24 sm:px-20 sm:pb-32 lg:flex-row lg:justify-between lg:gap-16 lg:px-24 lg:pb-28 lg:pt-24 short:flex-row short:justify-between short:gap-10 short:px-[max(5rem,env(safe-area-inset-left,0px),env(safe-area-inset-right,0px))] short:pb-20 short:pt-16">
            <div className="order-2 w-full max-w-xl lg:order-1 lg:flex-1 short:order-1 short:flex-1">
              <motion.p
                {...riseIn(0)}
                className="text-[12px] tracking-widest2 text-gold-deep"
                aria-live="polite"
              >
                {String(cocktailIndex + 1).padStart(2, "0")}
                <span className="text-ink-muted"> / {String(cocktails.length).padStart(2, "0")}</span>
              </motion.p>

              <motion.h2
                {...riseIn(1)}
                // The right padding gives the italic's final stroke room to lean.
                className="mt-4 pr-[0.08em] font-display text-[clamp(2.1rem,11vw,2.6rem)] font-normal italic leading-[0.95] tracking-tight text-ink sm:text-[3.4rem] lg:text-[4.6rem] short:mt-2 short:text-[2.2rem]"
              >
                {active.name}
              </motion.h2>

              <motion.ul {...riseIn(2)} className="mt-8 border-t border-ink/15 sm:mt-10 short:mt-3">
                {active.build.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-4 border-b border-ink/15 py-3 text-[15px] text-ink-soft sm:text-[16px] short:py-1.5 short:text-[13.5px]"
                  >
                    <span aria-hidden className="h-1 w-1 shrink-0 rotate-45 bg-gold-deep" />
                    {item}
                  </li>
                ))}
              </motion.ul>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 1.06, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.02, y: -10, transition: { duration: EXIT_DURATION } }}
              transition={{ duration: PLATE_DURATION, ease: EASE_OUT_QUINT }}
              className="relative order-1 h-[calc(var(--svh)*38)] min-h-[15rem] w-full max-w-[17rem] shrink-0 sm:h-[calc(var(--svh)*44)] sm:max-w-[21rem] lg:order-2 lg:h-[calc(var(--svh)*68)] lg:max-w-[28rem] short:order-2 short:h-[calc(var(--svh)*62)] short:min-h-0 short:w-[calc(var(--svh)*48)] short:max-w-none"
            >
              <Image
                src={active.image}
                alt={`${active.name} — recipe card`}
                fill
                sizes="(min-width: 1024px) 28rem, 18rem"
                className="object-contain drop-shadow-[0_30px_50px_rgba(22,20,18,0.28)]"
              />
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Arrows — anchored inside the section, never scrolling the page */}
      <button
        type="button"
        onClick={() => go(-1)}
        aria-label="Previous cocktail"
        className="absolute left-1 top-1/2 z-[6] flex h-12 w-12 -translate-y-1/2 items-center justify-center text-ink-soft transition duration-700 ease-lux hover:-translate-x-1 hover:text-ink active:text-ink sm:left-[max(1rem,env(safe-area-inset-left,0px))] sm:h-16 sm:w-16"
      >
        <Chevron direction="left" />
      </button>

      <button
        type="button"
        onClick={() => go(1)}
        aria-label="Next cocktail"
        className="absolute right-1 top-1/2 z-[6] flex h-12 w-12 -translate-y-1/2 items-center justify-center text-ink-soft transition duration-700 ease-lux hover:translate-x-1 hover:text-ink active:text-ink sm:right-[max(1rem,env(safe-area-inset-right,0px))] sm:h-16 sm:w-16"
      >
        <Chevron direction="right" />
      </button>

      {/* Pill menu. Upright phones get it as a 2 x 2 block: the four names do not
          fit one row at 360px, and a row that scrolls would hide two of them. */}
      <div className="pb-safe absolute inset-x-0 bottom-6 z-[6] flex justify-center px-4 sm:bottom-9 short:bottom-3">
        <div className="grid w-full max-w-sm grid-cols-2 gap-1 rounded-[1.6rem] border border-ink/15 bg-ivory/80 p-1 fine:bg-ivory/70 fine:backdrop-blur-xl sm:flex sm:w-auto sm:max-w-none sm:items-center sm:rounded-full short:flex short:w-auto short:max-w-none short:items-center short:rounded-full">
          {cocktails.map((cocktail, index) => {
            const isActive = index === cocktailIndex;
            return (
              <button
                key={cocktail.id}
                type="button"
                onClick={() => setCocktailIndex(index)}
                aria-current={isActive}
                className={`relative rounded-full px-1 py-3.5 text-[11.5px] uppercase tracking-[0.1em] transition-colors duration-500 sm:shrink-0 sm:px-3 sm:py-3 md:px-6 md:tracking-widest2 short:shrink-0 short:px-2.5 short:py-2.5 md:short:px-6 ${
                  isActive ? "text-ivory" : "text-ink-soft hover:text-ink"
                }`}
              >
                {isActive ? (
                  <motion.span
                    layoutId="cocktail-pill"
                    className="absolute inset-0 rounded-full bg-ink"
                    transition={{ type: "spring", stiffness: 260, damping: 32 }}
                  />
                ) : null}
                <span className="relative z-10 whitespace-nowrap">{cocktail.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
