"use client";

import Image from "next/image";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useEffect, useRef } from "react";

import BottleSpin from "@/components/BottleSpin";
import { useSiteEntered } from "@/components/SiteShell";
import { ALT, TAGLINE } from "@/data/site";
import { EASE_OUT_EXPO, EASE_OUT_QUINT } from "@/lib/motion";

/**
 * The opening.
 *
 * The bottle stands on the page itself — no box, no studio — turning slowly
 * on its plinth, with the name set huge in the geometric sans on either side
 * of it. Scrolling drives the scene: the bottle turns a full revolution with
 * the page, the name parts and steps back, and two campaign photographs glide
 * in to finish the spread. The section is one stage tall plus a run of travel;
 * the spread resolves in the first three quarters of it, then holds.
 *
 * On a fine pointer the layers also drift a few pixels against the cursor,
 * nearest layer most, so the composition has depth even at rest.
 *
 * Geometry is shared through custom properties on the stage (.hero-stage in
 * globals.css). Flanked, the name reserves a gap a little over half the
 * bottle's width — the body is narrower than the plinth, so the words sit close
 * in against the glass without ever touching it.
 */

/** Decelerating, so the plates arrive and settle rather than stop dead. */
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/* Pointer depth: how far each layer travels, in pixels, with the cursor at the
 * edge of the window. The name goes against the cursor; the plates, nearest,
 * travel furthest with it. */
const NAME_TRAVEL = { x: -24, y: -14 };
const BOTTLE_TRAVEL = { x: 10, y: 6 };
const PLATE_TRAVEL = { x: 38, y: 24 };
const POINTER_SPRING = { stiffness: 60, damping: 18, mass: 0.8 };

/* The cursor's position quantised so the bottle's travel lands on whole device
 * pixels. The spring settles exactly on its target, and a layer parked between
 * pixels gets resampled: this is what keeps the glass crisp once the hand stops. */
function onBottlePixel(position: number, travel: number) {
  const steps = travel * (window.devicePixelRatio || 1);
  return Math.round(position * steps) / steps;
}

function Word({
  children,
  x,
  opacity,
  delay,
  entered,
  className = "",
}: {
  children: string;
  x: MotionValue<string>;
  opacity: MotionValue<number>;
  delay: number;
  entered: boolean;
  className?: string;
}) {
  return (
    <motion.span style={{ x, opacity }} className={`block ${className}`}>
      {/* Each word rises out of its own mask, so the name is typeset onto the
          page rather than faded in. */}
      <span className="block overflow-hidden pb-[0.06em]">
        <motion.span
          className="block"
          initial={{ y: "110%" }}
          animate={{ y: entered ? "0%" : "110%" }}
          transition={{ duration: 1.5, delay: entered ? delay : 0, ease: EASE_OUT_EXPO }}
        >
          {children}
        </motion.span>
      </span>
    </motion.span>
  );
}

function SidePlate({
  side,
  progress,
  drift,
  src,
  alt,
  className,
}: {
  side: "left" | "right";
  progress: MotionValue<number>;
  drift: { x: MotionValue<number>; y: MotionValue<number> };
  src: string;
  alt: string;
  className: string;
}) {
  const sign = side === "left" ? -1 : 1;

  // At rest the plate sits a full --hero-shift outside its place, which puts
  // it past the edge of the screen; scroll draws it home. The vertical offset
  // runs the opposite way on each side, so the two converge on the bottle.
  const x = useTransform(progress, (v) => `calc(var(--hero-shift) * ${(sign * (1 - v)).toFixed(4)})`);
  const y = useTransform(progress, (v) => -sign * 44 * (1 - v));
  const rotate = useTransform(progress, (v) => sign * 7 * (1 - v));
  const opacity = useTransform(progress, [0, 0.45], [0, 1]);

  return (
    <motion.figure style={{ x, y, rotate, opacity }} className={`absolute z-[4] ${className}`}>
      <motion.div style={drift} className="relative aspect-[3/4] w-full overflow-hidden shadow-[0_40px_90px_-30px_rgba(22,20,18,0.55)]">
        <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 15vw, 26vw" className="object-cover" />
        <div aria-hidden className="absolute inset-0 ring-1 ring-inset ring-black/10" />
      </motion.div>
    </motion.figure>
  );
}

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const entered = useSiteEntered();
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // The spread completes in the first 75% of the travel and then holds, so
  // the finished composition stays on screen for a beat before the section
  // lets go of it. The bottle's turn uses the raw progress: one revolution
  // across the whole run, at the speed of the page.
  const progress = useTransform(scrollYProgress, (v) =>
    easeOutCubic(Math.min(Math.max(v / 0.75, 0), 1)),
  );

  // The plates part the name as they arrive, and it steps back behind them.
  const fluidX = useTransform(progress, (v) => `${(-6 * v).toFixed(3)}vw`);
  const ounceX = useTransform(progress, (v) => `${(6 * v).toFixed(3)}vw`);
  const nameOpacity = useTransform(progress, [0, 1], [1, 0.3]);
  const bottleScale = useTransform(progress, [0, 1], [1, 0.95]);
  const taglineOpacity = useTransform(scrollYProgress, [0, 0.16], [1, 0]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);

  /* Pointer depth: the cursor's offset from centre, eased by a spring. */
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, POINTER_SPRING);
  const springY = useSpring(pointerY, POINTER_SPRING);
  const nameDrift = {
    x: useTransform(springX, (v) => v * NAME_TRAVEL.x),
    y: useTransform(springY, (v) => v * NAME_TRAVEL.y),
  };
  const bottleDrift = {
    x: useTransform(springX, (v) => v * BOTTLE_TRAVEL.x),
    y: useTransform(springY, (v) => v * BOTTLE_TRAVEL.y),
  };
  const plateDrift = {
    x: useTransform(springX, (v) => v * PLATE_TRAVEL.x),
    y: useTransform(springY, (v) => v * PLATE_TRAVEL.y),
  };

  useEffect(() => {
    if (reduceMotion || !window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (event: PointerEvent) => {
      pointerX.set(onBottlePixel((event.clientX / window.innerWidth) * 2 - 1, BOTTLE_TRAVEL.x));
      pointerY.set(onBottlePixel((event.clientY / window.innerHeight) * 2 - 1, BOTTLE_TRAVEL.y));
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduceMotion, pointerX, pointerY]);

  return (
    <section ref={ref} id="home" aria-label="FLUID OUNCE" className="h-hero relative bg-linen">
      <div className="hero-stage h-stage-full sticky top-0 overflow-hidden bg-linen">
        {/* Everything but the light, in the part of the stage that is always on
            screen. No stacking context of its own: the layers inside it and the
            light above them share the stage's. */}
        <div className="h-stage absolute inset-x-0 top-0">
          {/* The floor: a soft pool of shadow the plinth stands in, moving with it. */}
          <motion.div
            aria-hidden
            style={bottleDrift}
            className="absolute inset-x-0 bottom-[calc(var(--floor)-2rem)] flex justify-center"
          >
            <div
              className="h-12 w-[calc(var(--bottle-w)*1.9)]"
              style={{
                background: "radial-gradient(50% 50% at 50% 50%, rgba(20,18,16,0.42) 0%, rgba(20,18,16,0) 70%)",
              }}
            />
          </motion.div>

          {/* The name. Upright it runs in one line above the bottle; on a wide or
              sideways screen, either side of it. */}
          <h1 className="pointer-events-none absolute inset-x-0 top-[var(--name-top)] z-[1] font-wordmark text-[length:var(--name-size)] font-normal uppercase leading-[0.9] tracking-[0.04em] text-ink flank:inset-y-0 flank:top-0 flank:flex flank:items-center flank:pb-[var(--name-lift)]">
            {/* Flanked, the two words take equal halves, so the gap between them —
                the bottle's place — sits exactly on the centre line even though
                OUNCE is the wider word. */}
            <motion.span style={nameDrift} className="flex w-full justify-center">
              <Word x={fluidX} opacity={nameOpacity} delay={0.35} entered={entered} className="flank:flex-1 flank:text-right">
                FLUID
              </Word>{" "}
              <span
                aria-hidden
                className="block w-[0.3em] shrink-0 flank:w-[calc(var(--bottle-w)*0.56)]"
              />
              <Word x={ounceX} opacity={nameOpacity} delay={0.47} entered={entered} className="flank:flex-1 flank:text-left">
                OUNCE
              </Word>
            </motion.span>
          </h1>

          {/* The live site's line: centred under the name when it runs in one line;
              flanked, starting under OUNCE beside the glass. */}
          <motion.div
            style={{ opacity: taglineOpacity, ...nameDrift }}
            className="pointer-events-none absolute inset-x-0 top-[calc(var(--name-top)+var(--name-size)+var(--line-gap))] z-[2] px-4 text-center flank:left-[calc(50%+var(--bottle-w)*0.28+var(--name-size)*0.055)] flank:right-[max(1rem,env(safe-area-inset-right,0px))] flank:top-[calc(50%-var(--name-lift)/2+var(--name-size)*0.52)] flank:px-0 flank:text-left"
          >
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: entered ? 1 : 0, y: entered ? 0 : 12 }}
              transition={{ duration: 1.2, delay: entered ? 0.9 : 0, ease: EASE_OUT_EXPO }}
              className="text-balance text-[13px] italic leading-relaxed text-ink-soft sm:text-[15px] lg:text-base short:text-[13px]"
            >
              {TAGLINE}
            </motion.p>
          </motion.div>

          {/* The bottle, rising out of the floor as the visitor arrives. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-[calc(var(--floor)-var(--bottle-foot))] z-[3] flex justify-center">
            <motion.div style={{ scale: bottleScale, ...bottleDrift }} className="origin-bottom">
              <motion.div
                initial={{ clipPath: "inset(100% 0% 0% 0%)", y: 40 }}
                animate={
                  entered
                    ? { clipPath: "inset(0% 0% 0% 0%)", y: 0 }
                    : { clipPath: "inset(100% 0% 0% 0%)", y: 40 }
                }
                transition={{ duration: 1.7, delay: entered ? 0.1 : 0, ease: EASE_OUT_QUINT }}
              >
                <BottleSpin
                  progress={scrollYProgress}
                  active={entered}
                  alt="The FLUID OUNCE bottle turning on its illuminated plinth"
                  priority
                  className="h-[var(--bottle-h)]"
                />
              </motion.div>
            </motion.div>
          </div>

          <SidePlate
            side="left"
            progress={progress}
            drift={plateDrift}
            src="/images/editorial/lux.webp"
            alt={ALT.luxury}
            className="hidden md:block md:bottom-[12%] md:left-[4vw] md:w-[min(22vw,calc(var(--svh)*26))] lg:left-[6vw] lg:w-[min(14vw,calc(var(--svh)*26))]"
          />
          <SidePlate
            side="right"
            progress={progress}
            drift={plateDrift}
            src="/images/editorial/glass.webp"
            alt={ALT.candlelight}
            className="hidden md:block md:right-[4vw] md:top-[22%] md:w-[min(22vw,calc(var(--svh)*26))] lg:right-[6vw] lg:top-[16%] lg:w-[min(14vw,calc(var(--svh)*26))]"
          />

          {/* A quiet cue that the page moves, dropped on short screens. */}
          <motion.div
            aria-hidden
            style={{ opacity: cueOpacity }}
            className="pb-safe pointer-events-none absolute bottom-6 left-6 z-[6] sm:left-10 lg:left-12 [@media(max-height:560px)]:hidden"
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: entered ? 1 : 0 }}
              transition={{ duration: 1.2, delay: entered ? 1.4 : 0 }}
              className="relative block h-12 w-px overflow-hidden bg-ink/20"
            >
              <span className="absolute inset-x-0 top-0 block h-1/2 animate-fo-scroll-cue bg-gradient-to-b from-transparent via-gold-light to-transparent" />
            </motion.span>
          </motion.div>
        </div>

        {/* Light and grain over everything, bottle included, so the glass sits
            in the same air as the page: a soft pool around it, the room falling
            away toward the edges. Blended, so the plinth's black stays black.
            Eased stops: on a flat ground the end of a straight ramp shows as a line.
            Touch screens get only the fall-off, unblended: a blend over a canvas
            that never stops repainting is a whole-screen pass on every frame, and
            the plinth is far enough from the edges not to feel it. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[5] hidden mix-blend-soft-light fine:block"
          style={{
            background:
              "radial-gradient(52% 64% at 50% 42%, rgba(255,248,232,0.4) 0%, rgba(255,248,232,0.36) 18%, rgba(255,248,232,0.26) 34%, rgba(255,248,232,0.14) 50%, rgba(255,248,232,0.06) 64%, rgba(255,248,232,0.015) 78%, rgba(255,248,232,0) 90%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[5] hidden mix-blend-multiply fine:block"
          style={{
            background:
              "radial-gradient(115% 92% at 50% 44%, rgba(194,182,162,0) 40%, rgba(194,182,162,0.066) 55%, rgba(194,182,162,0.246) 70%, rgba(194,182,162,0.607) 85%, #c2b6a2 100%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[5] fine:hidden"
          style={{
            background:
              "radial-gradient(115% 92% at 50% 44%, rgba(60,52,42,0) 40%, rgba(60,52,42,0.025) 55%, rgba(60,52,42,0.09) 70%, rgba(60,52,42,0.23) 85%, rgba(60,52,42,0.38) 100%)",
          }}
        />
        <div aria-hidden className="bg-grain pointer-events-none absolute inset-0 z-[5] opacity-[0.045]" />
      </div>
    </section>
  );
}
