import type { Transition, Variants } from "framer-motion";

/**
 * One motion vocabulary for the whole site.
 *
 * Everything reveals with the same weighted settle and the same unhurried
 * timing, so scrolling reads as one continuous piece rather than a series of
 * unrelated widgets each doing their own thing.
 */

/** Slow out-expo: fast to arrive, then a long, soft landing. */
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

/** For things that travel — used on masks and image scales. */
export const EASE_OUT_QUINT = [0.22, 1, 0.36, 1] as const;

export const DURATION = {
  quick: 0.7,
  base: 1.1,
  slow: 1.5,
  image: 1.8,
} as const;

/**
 * The tremble the site arrives with after the age gate: a light film-gate
 * shake, a flicker of projector light and a burst of moving grain, all dying
 * away to stillness. Tune it here — nothing else needs to change.
 *
 *   intensity  0 = off · 1 = light (the default) · 2 = twice as strong
 *   duration   seconds it runs once "Yes" is pressed (1.4 at the least — any
 *              shorter and the flicker could dip more than three times in a
 *              second, so shorter values are raised to 1.4)
 *
 * Visitors whose OS asks for reduced motion never see it, whatever the value.
 */
export const ENTRANCE_TREMBLE = {
  intensity: 1,
  duration: 1.6,
};

/** Fire once, and only when enough of the element is actually on screen. */
export const VIEWPORT = { once: true, amount: 0.25 } as const;
export const VIEWPORT_EARLY = { once: true, amount: 0.15 } as const;

// The params are annotated because DURATION is `as const`: without it the
// default value narrows `duration` to the literal 1.1 and every other value
// becomes a type error.
export const transition = (duration: number = DURATION.base, delay: number = 0): Transition => ({
  duration,
  delay,
  ease: EASE_OUT_EXPO,
});

/** Copy rises into place — small distance, long duration. That reads as calm. */
export const riseVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

/** A parent that hands its children a staggered entrance. */
export const staggerParent = (stagger = 0.09, delayChildren = 0): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

/** Per-word entrance for display headings. */
export const wordVariants: Variants = {
  // 115% clears the word past the padded mask box entirely, so it slides in
  // from genuinely out of frame rather than fading in place.
  hidden: { opacity: 0, y: "115%" },
  visible: {
    opacity: 1,
    y: "0em",
    transition: { duration: DURATION.base, ease: EASE_OUT_EXPO },
  },
};
