"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

import BottleSpin from "@/components/BottleSpin";
import { Reveal } from "@/components/motion/Reveal";
import RevealHeading from "@/components/motion/RevealHeading";
import RevealImage from "@/components/motion/RevealImage";
import { useSiteEntered } from "@/components/SiteShell";
import { ALT, DISCOVER_PAGE } from "@/data/site";

type Media =
  | { kind: "image"; src: string; alt: string; frame: string }
  | { kind: "bottle" };

/* Each paragraph of the story is paired with the picture that tells the same
 * part of it: the drink, the purity, the bottle on display, the box and cap,
 * and the bottle as the brand itself. */
const MEDIA: Media[] = [
  { kind: "image", src: "/images/editorial/glass.webp", alt: ALT.candlelight, frame: "aspect-[3/4]" },
  { kind: "image", src: "/images/editorial/lux2.webp", alt: ALT.daylight, frame: "aspect-[4/3]" },
  { kind: "bottle" },
  { kind: "image", src: "/images/editorial/boxx.webp", alt: ALT.boxed, frame: "aspect-[3/2]" },
  { kind: "image", src: "/images/editorial/lux.webp", alt: ALT.luxury, frame: "aspect-[3/4]" },
];

function Chapter({ index, text, media }: { index: number; text: string; media: Media }) {
  const ref = useRef<HTMLDivElement>(null);
  const entered = useSiteEntered();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["8%", "-8%"]);
  const mediaFirst = index % 2 === 1;

  return (
    <div
      ref={ref}
      className="relative grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-2 lg:gap-24 lg:py-28"
    >
      <motion.div
        style={{ y }}
        className={`mx-auto flex w-full justify-center ${media.kind === "bottle" ? "max-w-[20rem]" : "max-w-lg"} ${
          mediaFirst ? "lg:order-1" : "lg:order-2"
        }`}
      >
        {media.kind === "bottle" ? (
          // The bottle on the page itself — no frame — turning as the
          // paragraph about it passes.
          <BottleSpin
            progress={scrollYProgress}
            active={entered}
            alt={ALT.rotating}
            sizes="(min-width: 1024px) 20rem, 60vw"
            className="h-[min(calc(var(--svh)*84),672px)]"
          />
        ) : (
          <RevealImage
            src={media.src}
            alt={media.alt}
            sizes="(min-width: 1024px) 40vw, 90vw"
            className={`${media.frame} w-full`}
          />
        )}
      </motion.div>

      <Reveal className={mediaFirst ? "lg:order-2" : "lg:order-1"}>
        <span className="font-display text-sm italic text-gold-deep">
          N°{String(index + 1).padStart(2, "0")}
        </span>
        <p
          className={`mt-5 text-pretty text-[15.5px] leading-[1.9] text-ink-soft sm:text-[16.5px] ${
            index === 0
              ? "first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-display first-letter:text-[4.2rem] first-letter:leading-[0.8] first-letter:text-ink"
              : ""
          }`}
        >
          {text}
        </p>
      </Reveal>
    </div>
  );
}

/**
 * /discover — the long story of the vodka, the bottle and the name. On linen,
 * because the bottle stands in it unframed and its glass is lit for that ground.
 */
export default function DiscoverStory() {
  return (
    <section className="relative bg-linen pb-16 pt-36 sm:pt-44 short:pt-24">
      <div className="safe-gutter mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal as="p" className="text-[12px] uppercase tracking-widest3 text-gold-deep">
            {DISCOVER_PAGE.eyebrow}
          </Reveal>
          <RevealHeading
            as="h1"
            text={DISCOVER_PAGE.title}
            className="mt-6 font-display text-[3.2rem] font-normal leading-none tracking-tight text-ink sm:text-[4.2rem] lg:text-[5.4rem]"
          />
          <Reveal delay={0.1}>
            <span aria-hidden className="mx-auto mt-10 block h-px w-16 bg-gold-light" />
          </Reveal>
        </div>

        <div className="mt-10 sm:mt-16">
          {DISCOVER_PAGE.paragraphs.map((text, index) => (
            <Chapter key={index} index={index} text={text} media={MEDIA[index]} />
          ))}
        </div>
      </div>
    </section>
  );
}
