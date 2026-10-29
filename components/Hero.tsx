"use client";

import Image from "next/image";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";

import LoopVideo from "@/components/LoopVideo";
import { useSiteEntered } from "@/components/SiteShell";
import { EASE_OUT_EXPO, EASE_OUT_QUINT } from "@/lib/motion";

/**
 * The opening, set like a fashion-house cover.
 *
 * The bottle turns slowly in a single portrait frame, the name sits huge
 * behind it in a Didone, and — once the visitor scrolls a little — two
 * campaign photographs glide in from either side to finish the spread. The
 * whole move resolves inside one screen of scroll, then the page releases.
 *
 * Geometry is shared through two custom properties set on the stage:
 *   --card-h      height of the portrait frame (its width is always half)
 *   --hero-shift  how far outside its resting place each side plate starts
 * The headline layer reserves a gap of exactly the card's size, so the name
 * tucks under the frame's edges at every breakpoint without measuring.
 */

const BOTTLE_VIDEO = "/media/rotate.mp4";
const BOTTLE_POSTER = "/media/rotate-poster.webp";

/** Decelerating, so the plates arrive and settle rather than stop dead. */
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

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
      <span className="block overflow-hidden pb-[0.04em]">
        <motion.span
          className="text-metal block"
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
  src,
  alt,
  className,
}: {
  side: "left" | "right";
  progress: MotionValue<number>;
  src: string;
  alt: string;
  className: string;
}) {
  const sign = side === "left" ? -1 : 1;

  // At rest the plate sits a full --hero-shift outside its place, which puts
  // it past the edge of the screen; scroll draws it home. The vertical offset
  // runs the opposite way on each side, so the two converge on the frame.
  const x = useTransform(
    progress,
    (v) => `calc(var(--hero-shift) * ${(sign * (1 - v)).toFixed(4)})`,
  );
  const y = useTransform(progress, (v) => -sign * 44 * (1 - v));
  const rotate = useTransform(progress, (v) => sign * 7 * (1 - v));
  const opacity = useTransform(progress, [0, 0.45], [0, 1]);

  return (
    <motion.figure style={{ x, y, rotate, opacity }} className={`absolute z-[4] ${className}`}>
      <div className="relative aspect-[3/4] w-full overflow-hidden shadow-[0_30px_80px_-24px_rgba(0,0,0,0.85)]">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 14vw, 30vw"
          className="object-cover"
        />
        <div aria-hidden className="absolute inset-0 ring-1 ring-inset ring-white/10" />
      </div>
    </motion.figure>
  );
}

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const entered = useSiteEntered();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // The spread completes in the first 80% of the travel and then holds, so
  // the finished composition stays on screen for a beat before the section
  // lets go of it.
  const progress = useTransform(scrollYProgress, (v) =>
    easeOutCubic(Math.min(Math.max(v / 0.8, 0), 1)),
  );

  // The plates part the name as they arrive, and it steps back behind them.
  const fluidX = useTransform(progress, (v) => `${(-5 * v).toFixed(3)}vw`);
  const ounceX = useTransform(progress, (v) => `${(5 * v).toFixed(3)}vw`);
  const nameOpacity = useTransform(progress, [0, 1], [1, 0.4]);
  const cardScale = useTransform(progress, [0, 1], [1, 0.93]);

  const cueOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);
  const captionOpacity = useTransform(scrollYProgress, [0, 0.22], [1, 0]);

  return (
    <section ref={ref} id="home" className="h-hero relative">
      <div className="h-stage sticky top-0 overflow-hidden bg-ink-900 [--card-h:min(50vh,460px)] [--hero-shift:64vw] lg:[--card-h:min(60vh,640px)] lg:[--hero-shift:36vw]">
        {/* A cold pool of light behind the frame, so the bottle reads as lit. */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(42% 46% at 50% 54%, rgba(191,211,224,0.14) 0%, rgba(5,7,10,0) 72%), linear-gradient(180deg, #0A0E13 0%, #05070A 100%)",
          }}
        />

        {/* The name. Phones stack it above and below the frame; from lg it
            runs either side of it. */}
        {/* The stacked sizes are capped by height as well as width: on a
            phone held sideways, width-only sizing would stack the name taller
            than the screen. */}
        <h1 className="pointer-events-none absolute inset-0 z-[1] flex flex-col items-center justify-center pt-16 font-display text-[length:min(21vw,13vh)] font-normal uppercase leading-[0.82] tracking-[-0.02em] sm:pt-20 sm:text-[length:min(16vw,13vh)] lg:flex-row lg:text-[10vw]">
          <Word x={fluidX} opacity={nameOpacity} delay={0.35} entered={entered} className="lg:flex-1 lg:text-right">
            Fluid
          </Word>{" "}
          <span
            aria-hidden
            className="block h-[calc(var(--card-h)-0.34em)] w-px shrink-0 lg:h-px lg:w-[calc(var(--card-h)/2-0.5em)]"
          />
          <Word x={ounceX} opacity={nameOpacity} delay={0.47} entered={entered} className="lg:flex-1 lg:text-left">
            Ounce
          </Word>
        </h1>

        {/* The frame: the bottle turning on its plinth, never stopping. */}
        <div className="pointer-events-none absolute inset-0 z-[3] flex items-center justify-center pt-16 sm:pt-20">
          <motion.div
            style={{ scale: cardScale }}
            className="relative h-[var(--card-h)] w-[calc(var(--card-h)/2)]"
          >
            <motion.div
              initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
              animate={{ clipPath: entered ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)" }}
              transition={{ duration: 1.6, delay: entered ? 0.1 : 0, ease: EASE_OUT_QUINT }}
              className="absolute inset-0 overflow-hidden bg-[#77858b] shadow-[0_50px_120px_-30px_rgba(0,0,0,0.9)]"
            >
              <motion.div
                initial={{ scale: 1.18 }}
                animate={{ scale: entered ? 1 : 1.18 }}
                transition={{ duration: 2.2, delay: entered ? 0.1 : 0, ease: EASE_OUT_QUINT }}
                className="absolute inset-0"
              >
                {/* The source is 9:16 with thin black bars down each side; the
                    1:2 frame with cover-fit crops exactly those away. */}
                <LoopVideo
                  src={BOTTLE_VIDEO}
                  poster={BOTTLE_POSTER}
                  label="The FLUID OUNCE Signature bottle turning on its display plinth"
                  hold={!entered}
                  className="h-full w-full object-cover"
                />
              </motion.div>
              <div aria-hidden className="absolute inset-0 ring-1 ring-inset ring-white/10" />
            </motion.div>
          </motion.div>
        </div>

        <SidePlate
          side="left"
          progress={progress}
          src="/images/editorial/lux.webp"
          alt="FLUID OUNCE on an illuminated display beside a cocktail and its box"
          className="left-[3vw] top-[38%] w-[min(29vw,30vh)] lg:bottom-[10%] lg:left-[6vw] lg:top-auto lg:w-[min(14vw,26vh)]"
        />
        <SidePlate
          side="right"
          progress={progress}
          src="/images/editorial/glass.webp"
          alt="A martini by candlelight with the Manhattan skyline behind it"
          className="right-[3vw] top-[56%] w-[min(29vw,30vh)] lg:right-[6vw] lg:top-[15%] lg:w-[min(14vw,26vh)]"
        />

        {/* Edge falloff and grain: the two things that make a dark page read
            as a photograph rather than a screen. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[5]"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 50%, rgba(5,7,10,0) 58%, rgba(5,7,10,0.6) 100%)",
          }}
        />
        <div aria-hidden className="bg-grain pointer-events-none absolute inset-0 z-[5] opacity-[0.06]" />

        {/* Captions, wide screens only — a phone has no room to spare. */}
        <motion.div
          style={{ opacity: captionOpacity }}
          className="pointer-events-none absolute inset-x-0 bottom-8 z-[6] hidden items-end justify-between px-12 lg:flex"
        >
          {["Ultra Premium Vodka", "Handcrafted · Imported"].map((caption, index) => (
            <motion.p
              key={caption}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: entered ? 1 : 0, y: entered ? 0 : 10 }}
              transition={{ duration: 1.1, delay: entered ? 1.1 + index * 0.1 : 0, ease: EASE_OUT_EXPO }}
              className="text-[10px] font-light uppercase tracking-widest3 text-white/45"
            >
              {caption}
            </motion.p>
          ))}
        </motion.div>

        {/* Dropped on short screens, where it would sit on the frame itself. */}
        <motion.div
          aria-hidden
          style={{ opacity: cueOpacity }}
          className="pb-safe pointer-events-none absolute inset-x-0 bottom-5 z-[6] flex justify-center sm:bottom-6 [@media(max-height:600px)]:hidden"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: entered ? 1 : 0 }}
            transition={{ duration: 1.2, delay: entered ? 1.4 : 0 }}
            className="flex flex-col items-center gap-3"
          >
            <span className="text-[9px] font-light uppercase tracking-widest3 text-white/45">
              Scroll
            </span>
            <span className="relative block h-8 w-px overflow-hidden bg-white/15">
              <span className="absolute inset-x-0 top-0 block h-1/2 animate-fo-scroll-cue bg-gradient-to-b from-transparent via-platinum/80 to-transparent" />
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
