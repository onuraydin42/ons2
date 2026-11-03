"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

import RevealImage from "@/components/motion/RevealImage";
import { Reveal } from "@/components/motion/Reveal";
import { ALT, UNMASKED } from "@/data/site";

/**
 * The line from the brochure's advertisement, set as large as the screen allows, to
 * open the cocktails. The three lines slide into register as the section arrives,
 * and the photograph beside them drifts the other way.
 */
export default function Unmasked() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  const first = useTransform(scrollYProgress, [0, 0.5], ["-5vw", "0vw"]);
  const second = useTransform(scrollYProgress, [0, 0.5], ["5vw", "0vw"]);
  const third = useTransform(scrollYProgress, [0, 0.5], ["-2.5vw", "0vw"]);
  const plate = useTransform(scrollYProgress, [0, 1], ["6%", "-6%"]);
  const shifts = [first, second, third];

  return (
    <section ref={ref} aria-label={UNMASKED.headline.join(" ")} className="ground-wood relative overflow-hidden bg-linen py-24 sm:py-32 lg:py-40 short:py-16">
      <div className="safe-gutter mx-auto grid max-w-7xl items-center gap-14 px-6 sm:px-10 lg:grid-cols-[1.25fr_0.75fr] lg:gap-20 lg:px-16 short:grid-cols-[1.25fr_0.75fr] short:gap-8">
        <div>
          {/* A sturdier optical size than this type would pick for itself: the true
              display cut's hairlines all but vanish on the stone. */}
          <h2 className="font-display text-[clamp(3rem,15.5vw,6rem)] font-normal uppercase leading-[0.98] tracking-[0.01em] text-ink [font-variation-settings:'opsz'_30] sm:text-[7rem] xl:text-[8.4rem] short:text-[3.1rem]">
            {UNMASKED.headline.map((line, index) => (
              <motion.span key={line} style={{ x: shifts[index] }} className="block whitespace-nowrap">
                {line}
              </motion.span>
            ))}
          </h2>
          <Reveal className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 short:mt-4" delay={0.1}>
            {UNMASKED.lines.map((line, index) => (
              <span key={line} className="flex items-center gap-6 text-[12px] uppercase tracking-widest3 text-ink-soft sm:text-[13px]">
                {index > 0 ? <span aria-hidden className="hidden h-px w-10 bg-gold-light sm:block" /> : null}
                {line}
              </span>
            ))}
          </Reveal>
        </div>

        <motion.div style={{ y: plate }} className="mx-auto w-full max-w-sm lg:max-w-none short:max-w-[13rem]">
          <RevealImage
            src="/images/brochure/martini.webp"
            alt={ALT.martini}
            sizes="(min-width: 1024px) 32vw, 80vw"
            className="aspect-[4/5] w-full shadow-[0_40px_90px_-40px_rgba(18,17,15,0.6)]"
          />
        </motion.div>
      </div>
    </section>
  );
}
