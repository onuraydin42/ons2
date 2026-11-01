"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

import { Reveal } from "@/components/motion/Reveal";
import RevealHeading from "@/components/motion/RevealHeading";
import RevealImage from "@/components/motion/RevealImage";
import { ALT, DISCOVER } from "@/data/site";

/**
 * Discover — the live site's paragraph, beside a collage of the bottle after
 * dark and in its box. The two photographs travel at different speeds as the
 * section passes, so the spread has depth without any of it being furniture.
 */
export default function DiscoverSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const backY = useTransform(scrollYProgress, [0, 1], ["6%", "-6%"]);
  const frontY = useTransform(scrollYProgress, [0, 1], ["22%", "-18%"]);

  return (
    <section
      ref={ref}
      id="discover"
      className="relative scroll-mt-16 overflow-hidden bg-linen py-28 sm:py-36 lg:py-44 short:py-20"
    >
      <div className="safe-gutter mx-auto grid max-w-7xl grid-cols-1 items-center gap-20 px-6 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-24 lg:px-16 short:grid-cols-[0.8fr_1fr] short:gap-10">
        <div className="relative mx-auto w-full max-w-md pb-24 sm:max-w-lg lg:max-w-none lg:pb-32 short:pb-16">
          <motion.div style={{ y: backY }} className="w-[78%]">
            <RevealImage
              src="/images/editorial/lux.webp"
              alt={ALT.luxury}
              sizes="(min-width: 1024px) 34vw, 70vw"
              className="aspect-[3/4] w-full"
            />
          </motion.div>
          {/* Matted in linen, so it lifts off the photograph behind it. The
              mat and its shadow live on the wrapper: the reveal's clip-path
              would cut away anything drawn outside the image itself. */}
          <motion.div
            style={{ y: frontY }}
            className="absolute bottom-0 right-0 w-[64%] bg-linen p-2 shadow-[0_40px_90px_-40px_rgba(22,20,18,0.55)] sm:p-3"
          >
            <RevealImage
              src="/images/editorial/boxx.webp"
              alt={ALT.boxed}
              sizes="(min-width: 1024px) 28vw, 58vw"
              delay={0.15}
              className="aspect-[3/2] w-full"
            />
          </motion.div>
        </div>

        <div>
          <RevealHeading
            text={DISCOVER.title}
            className="font-display text-[2.6rem] font-normal leading-none tracking-tight text-ink sm:text-5xl lg:text-[3.9rem]"
          />
          <Reveal delay={0.05}>
            <span aria-hidden className="mt-8 block h-px w-16 bg-gold-light" />
          </Reveal>
          <Reveal
            as="p"
            delay={0.1}
            className="mt-8 max-w-xl text-pretty text-[15.5px] leading-[1.85] text-ink-soft sm:text-[16.5px]"
          >
            {DISCOVER.body}
          </Reveal>
          <Reveal delay={0.18} className="mt-11">
            <Link
              href="/discover/"
              className="group inline-flex items-center gap-4 border border-ink px-8 py-4 text-[12px] uppercase tracking-widest2 text-ink transition-colors duration-500 ease-lux hover:bg-ink hover:text-ivory active:bg-ink active:text-ivory"
            >
              {DISCOVER.cta}
              <svg
                viewBox="0 0 24 12"
                fill="none"
                stroke="currentColor"
                strokeWidth={1}
                aria-hidden
                className="h-3 w-6 transition-transform duration-500 ease-lux group-hover:translate-x-1"
              >
                <path d="M0 6 H22 M17 1 L22 6 L17 11" />
              </svg>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
