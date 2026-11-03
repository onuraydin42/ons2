"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

import { Reveal } from "@/components/motion/Reveal";
import RevealHeading from "@/components/motion/RevealHeading";
import { ALT, RECYCLE } from "@/data/site";
import { MARK_HEIGHT, MARK_INK_SRC, MARK_WIDTH } from "@/lib/brand";

/**
 * The brochure's last word: an empty bottle is a decanter still, and here it holds
 * an orchid. It stands on the timber of the footer below; the words drift past it.
 */
export default function RecycleNote() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["22%", "-14%"]);

  return (
    <section ref={ref} aria-label={RECYCLE.title} className="ground-wood relative overflow-hidden bg-porcelain pt-20 sm:pt-28 short:pt-12">
      <div className="safe-gutter mx-auto grid max-w-5xl items-end gap-6 px-6 sm:grid-cols-[1fr_auto] sm:gap-14 sm:px-10 lg:px-16">
        <motion.div style={{ y }} className="pb-4 sm:pb-24 short:pb-12">
          <RevealHeading
            text={RECYCLE.title}
            className="text-balance font-display text-[clamp(2.3rem,11vw,3.2rem)] font-normal italic leading-[1.02] tracking-tight text-ink sm:text-[3.8rem] lg:text-[4.8rem] short:text-[2.3rem]"
          />
          <Reveal delay={0.08} className="mt-6 flex items-center gap-5 short:mt-3">
            <Image src={MARK_INK_SRC} alt="" width={MARK_WIDTH} height={MARK_HEIGHT} className="h-14 w-auto" />
            <p className="max-w-[18rem] text-pretty text-[13.5px] leading-relaxed text-ink-muted">{RECYCLE.note}</p>
          </Reveal>
        </motion.div>

        <div className="relative mx-auto aspect-[400/771] w-[58vw] max-w-[17rem] sm:w-[17rem] short:w-[11rem]">
          <Image src="/images/brochure/orchid.webp" alt={ALT.orchid} fill sizes="(min-width: 640px) 17rem, 58vw" className="object-contain object-bottom" />
        </div>
      </div>
    </section>
  );
}
