"use client";

import Image from "next/image";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import RevealHeading from "@/components/motion/RevealHeading";
import { useSiteEntered } from "@/components/SiteShell";
import { useSmoothScroll } from "@/components/SmoothScroll";
import { cocktails } from "@/data/cocktails";
import { hexToRgba } from "@/lib/color";
import { DURATION, EASE_OUT_EXPO, EASE_OUT_QUINT } from "@/lib/motion";

/** Pre-blurred ambient plate that prepare-assets writes next to each card. */
const blurPlate = (src: string) => src.replace(/\.webp$/, "-blur.webp");

// The plate leads, copy follows just behind it. Kept tight on purpose: with
// mode="wait" the outgoing and incoming animations run back to back, so these
// numbers are the delay a visitor feels every time they press an arrow or pill.
const PLATE_DURATION = 0.6;
const SWAP_DURATION = 0.2;
const TEXT_DELAY = 0.05;
/* Every exit shares this. It is the delay a visitor feels on every switch. */
const EXIT_DURATION = 0.2;

/* Colour is the one thing that is never hurried. The tint and the ambient
 * plate run on a long ease-in-out, and the plate crossfades rather than
 * swapping — the outgoing room is still fading while the incoming one rises
 * over it — so the light blends from one drink to the next instead of dipping
 * through black between them. */
const COLOR_DURATION = 1.6;
const COLOR_EASE = [0.45, 0, 0.55, 1] as const;

/**
 * Entrances are staggered and unhurried; exits are neither.
 *
 * `AnimatePresence mode="wait"` holds the incoming cocktail until *every*
 * descendant has finished leaving, so the slowest exit is added to the delay a
 * visitor feels after pressing an arrow. With the entrance timings reused for
 * exits that came to 0.6s plus 0.2s of stagger before anything changed. Giving
 * exit its own short, undelayed transition is what makes the switch feel
 * immediate while keeping the arrival luxurious.
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

export default function CocktailCollection() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { amount: 0.5 });
  const smooth = useSmoothScroll();

  /* Read once, at mount: whether this page arrived inside an ongoing visit
   * (a link from elsewhere on the site) or as a fresh load behind the gate. */
  const entered = useSiteEntered();
  const enteredAtMount = useRef(entered);

  const [cocktailIndex, setCocktailIndex] = useState(0);
  const active = cocktails[cocktailIndex];

  const go = useCallback((delta: number) => {
    // Wraps in both directions: 3 -> 0 and 0 -> 3.
    setCocktailIndex((current) => (current + delta + cocktails.length) % cocktails.length);
  }, []);

  /* Warm the other three plates so switching never shows a blank stage. */
  useEffect(() => {
    cocktails.forEach((cocktail) => {
      for (const src of [cocktail.image, blurPlate(cocktail.image)]) {
        const img = new window.Image();
        img.src = src;
      }
    });
  }, []);

  /* The footer links each cocktail by id. Those are the only anchors that may
   * move the page — an anchor is a navigation, unlike the arrows and the pill
   * menu, which only ever change what is inside this section. The jump runs
   * through Lenis so it glides rather than teleports. */
  useEffect(() => {
    const applyHash = () => {
      const id = window.location.hash.replace("#", "");
      const target = cocktails.findIndex((cocktail) => cocktail.id === id);
      if (target === -1) return;

      setCocktailIndex(target);
      if (sectionRef.current) smooth.scrollTo(sectionRef.current);
    };

    // A fresh load — a refresh, or arriving from outside — opens on the first
    // drink with the page at the top: the visit starts over. A hash already in
    // the URL is only followed when the page arrived inside the visit; later
    // hash changes (the footer links) always are.
    let frame = 0;
    if (enteredAtMount.current) {
      applyHash();
      // Arriving from another page (a footer link on /terms, say), the router
      // can still be settling the URL when this first runs — look once more
      // after it has.
      frame = window.requestAnimationFrame(applyHash);
    }
    window.addEventListener("hashchange", applyHash);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", applyHash);
    };
  }, [smooth]);

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
      className="h-stage relative overflow-hidden border-y border-white/10 bg-ink-900"
      aria-roledescription="carousel"
      aria-label="The Collection"
    >
      {/* Mood layer: the whole section drifts toward the active accent. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[2]"
        initial={false}
        animate={{ backgroundColor: hexToRgba(active.accent, 0.34) }}
        transition={{ duration: COLOR_DURATION, ease: COLOR_EASE }}
      />

      {/* The artwork, blown up and out of focus, becomes the room the card
          sits in — colour and light without competing for attention.
          The plate is a 40px pre-blurred file (~150 B) stretched to fill,
          not a CSS blur on the full-size card: the browser was re-blurring
          a 1086x1448 bitmap at viewport scale on every switch, which is
          what made changing cocktails feel slow.

          No mode="wait" here, deliberately: both plates are on screen for the
          length of the crossfade, which is what makes the colour change
          continuous. Only the copy and the card below wait their turn. */}
      <AnimatePresence initial={false}>
        <motion.div
          key={active.id}
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: COLOR_DURATION, ease: COLOR_EASE }}
          className="absolute inset-0 z-[1]"
        >
          <motion.div
            initial={{ scale: 1.16 }}
            animate={{ scale: 1.08 }}
            transition={{ duration: 2.4, ease: EASE_OUT_QUINT }}
            className="absolute inset-0"
          >
            <Image
              src={blurPlate(active.image)}
              alt=""
              fill
              sizes="100vw"
              priority
              className="object-cover opacity-30"
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* The scrim is the same for every cocktail, so it stays put instead of
          fading out and back in with each switch. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[3]"
        style={{
          background:
            "linear-gradient(180deg, rgba(5,7,10,0.9) 0%, rgba(5,7,10,0.5) 30%, rgba(5,7,10,0.6) 70%, rgba(5,7,10,0.95) 100%)",
        }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={active.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: SWAP_DURATION, ease: EASE_OUT_EXPO }}
          className="absolute inset-0 z-[4]"
        >
          {/* Stage: the card is shown whole — it is an illustrated recipe plate,
              not a backdrop, and cropping it destroys the artwork. */}
          <div className="mx-auto flex h-full max-w-7xl flex-col items-center justify-center gap-6 px-6 pb-24 pt-48 sm:gap-7 sm:px-10 sm:pb-28 sm:pt-52 lg:flex-row lg:justify-between lg:gap-16 lg:px-16 lg:pb-28 lg:pt-40">
            <div className="order-2 w-full max-w-xl lg:order-1 lg:flex-1">
              <motion.h3
                {...riseIn(0)}
                // The right padding gives the italic's final stroke room to
                // lean — background-clip only paints inside the box.
                className="text-metal text-balance pr-[0.08em] font-display text-4xl font-normal italic leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl"
              >
                {active.name}
              </motion.h3>

              <motion.p
                {...riseIn(1)}
                className="mt-3 text-sm font-light tracking-tight text-platinum/85 sm:mt-5 sm:text-lg"
              >
                {active.tagline}
              </motion.p>

              <motion.ul
                {...riseIn(2)}
                className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2 sm:mt-7 sm:grid-cols-4 sm:gap-x-4"
              >
                {active.build.map((item) => (
                  <li
                    key={item}
                    className="border-t border-white/15 pt-2 text-[9px] font-light uppercase leading-relaxed tracking-widest2 text-white/60 sm:text-[10px]"
                  >
                    {item}
                  </li>
                ))}
              </motion.ul>

              <motion.p
                {...riseIn(3)}
                className="mt-5 max-w-lg text-pretty text-xs font-light leading-relaxed text-white/70 sm:mt-7 sm:text-sm"
              >
                {active.description}
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 1.08, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.02, y: -10, transition: { duration: EXIT_DURATION } }}
              transition={{ duration: PLATE_DURATION, ease: EASE_OUT_QUINT }}
              className="relative order-1 h-[30vh] w-full max-w-[16rem] shrink-0 sm:h-[36vh] sm:max-w-[20rem] lg:order-2 lg:h-[68vh] lg:max-w-[27rem]"
            >
              <Image
                src={active.image}
                alt={`${active.name} — recipe card`}
                fill
                sizes="(min-width: 1024px) 27rem, 17rem"
                priority={cocktailIndex === 0}
                className="object-contain drop-shadow-[0_28px_60px_rgba(0,0,0,0.65)]"
              />
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Pinned heading — set larger than the other section titles, because this
          is the part of the page we most want people to stop on. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[5] mx-auto max-w-7xl px-6 pt-24 sm:px-10 sm:pt-28 lg:px-16">
        <RevealHeading
          text="The Collection"
          className="text-metal font-display text-3xl font-normal tracking-tight sm:text-5xl lg:text-6xl"
        />

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 sm:mt-4 sm:gap-x-6">
          <p className="text-[10px] font-light uppercase tracking-widest2 text-white/45 sm:text-[11px]">
            One vodka. Four ways to prove it.
          </p>

          <span aria-hidden className="h-px w-6 bg-white/20 sm:w-10" />

          {/* Position counter: makes it plain there are four of these and that
              the section is something you move through. */}
          <p
            className="text-[10px] font-light tracking-widest2 text-ice/70 sm:text-[11px]"
            aria-live="polite"
          >
            {String(cocktailIndex + 1).padStart(2, "0")}
            <span className="text-white/25"> / {String(cocktails.length).padStart(2, "0")}</span>
          </p>
        </div>
      </div>

      {/* Arrows — anchored inside the section, never scrolling the page */}
      <button
        type="button"
        onClick={() => go(-1)}
        aria-label="Previous cocktail"
        className="absolute left-0 top-1/2 z-[6] -translate-y-1/2 p-2 text-white/40 transition duration-700 ease-lux hover:-translate-x-1 hover:text-platinum sm:left-3 sm:p-4"
      >
        <Chevron direction="left" />
      </button>

      <button
        type="button"
        onClick={() => go(1)}
        aria-label="Next cocktail"
        className="absolute right-0 top-1/2 z-[6] -translate-y-1/2 p-2 text-white/40 transition duration-700 ease-lux hover:translate-x-1 hover:text-platinum sm:right-3 sm:p-4"
      >
        <Chevron direction="right" />
      </button>

      {/* Pill menu */}
      <div className="pb-safe absolute inset-x-0 bottom-6 z-[6] flex justify-center px-4 sm:bottom-9">
        <div className="scrollbar-none flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-white/10 bg-white/[0.06] p-1 backdrop-blur-xl">
          {cocktails.map((cocktail, index) => {
            const isActive = index === cocktailIndex;
            return (
              <button
                key={cocktail.id}
                type="button"
                onClick={() => setCocktailIndex(index)}
                aria-current={isActive}
                // Tighter padding and tracking below sm: at 360px the four
                // names otherwise run past the edge of the pill.
                className={`relative shrink-0 rounded-full px-2.5 py-2 text-[9px] font-light uppercase tracking-[0.14em] transition-colors duration-500 sm:px-6 sm:py-2.5 sm:text-[11px] sm:tracking-widest2 ${
                  isActive ? "text-ink-900" : "text-white/40 hover:text-white/70"
                }`}
              >
                {isActive ? (
                  <motion.span
                    layoutId="cocktail-pill"
                    className="absolute inset-0 rounded-full bg-platinum"
                    transition={{ type: "spring", stiffness: 260, damping: 32 }}
                  />
                ) : null}
                <span className="relative z-10">{cocktail.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
