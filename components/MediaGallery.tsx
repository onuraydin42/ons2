"use client";

import Image from "next/image";
import { motion } from "framer-motion";

import LoopVideo from "@/components/LoopVideo";
import { Reveal } from "@/components/motion/Reveal";
import RevealHeading from "@/components/motion/RevealHeading";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { CONTACT_EMAIL } from "@/lib/submitForm";

interface Plate {
  id: string;
  caption: string;
  /** Which side of the screen the plate glides in from. */
  from: "left" | "right";
  /** Grid placement and frame shape, wide screens first. */
  className: string;
  frame: string;
  media:
    | { kind: "image"; src: string; alt: string; sizes: string }
    | { kind: "video"; src: string; poster: string; label: string };
}

/* An editorial spread rather than a grid of thumbnails: plates of different
 * shapes, staggered down the page, each arriving from its own side. */
const PLATES: Plate[] = [
  {
    id: "boxed",
    caption: "The boxed presentation",
    from: "left",
    className: "lg:col-span-7",
    frame: "aspect-[3/2]",
    media: {
      kind: "image",
      src: "/images/editorial/boxx.webp",
      alt: "The FLUID OUNCE bottle between its closed and open presentation boxes",
      sizes: "(min-width: 1024px) 58vw, 100vw",
    },
  },
  {
    id: "bottle",
    caption: "The Signature bottle, in motion",
    from: "right",
    className: "mx-auto w-full max-w-[18rem] lg:col-span-3 lg:col-start-9 lg:mt-28 lg:max-w-none",
    frame: "aspect-[1/2]",
    media: {
      kind: "video",
      src: "/media/rotate.mp4",
      poster: "/media/rotate-poster.webp",
      label: "The FLUID OUNCE Signature bottle turning on its display plinth",
    },
  },
  {
    id: "after-dark",
    caption: "After dark",
    from: "left",
    className: "lg:col-span-4 lg:col-start-2",
    frame: "aspect-[3/4]",
    media: {
      kind: "image",
      src: "/images/editorial/lux.webp",
      alt: "FLUID OUNCE on an illuminated display beside a cocktail and its box",
      sizes: "(min-width: 1024px) 33vw, 100vw",
    },
  },
  {
    id: "candlelight",
    caption: "Manhattan, by candlelight",
    from: "right",
    className: "lg:col-span-4 lg:col-start-8 lg:mt-40",
    frame: "aspect-[3/4]",
    media: {
      kind: "image",
      src: "/images/editorial/glass.webp",
      alt: "A martini by candlelight with the Manhattan skyline behind it",
      sizes: "(min-width: 1024px) 33vw, 100vw",
    },
  },
  {
    id: "daylight",
    caption: "By daylight",
    from: "left",
    className: "lg:col-span-6 lg:col-start-3",
    frame: "aspect-[4/3]",
    media: {
      kind: "image",
      src: "/images/editorial/lux2.webp",
      alt: "A bottle of FLUID OUNCE on a sunlit windowsill",
      sizes: "(min-width: 1024px) 50vw, 100vw",
    },
  },
];

export default function MediaGallery() {
  return (
    <section className="relative overflow-hidden bg-ink-900 pb-28 pt-36 sm:pb-36 sm:pt-44">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <Reveal as="p" className="text-[10px] font-light uppercase tracking-widest3 text-ice/50">
          Media
        </Reveal>

        <RevealHeading
          as="h1"
          text="Press & Media"
          className="text-metal mt-6 font-display text-5xl font-normal tracking-tight sm:text-6xl lg:text-7xl"
        />

        <Reveal
          as="p"
          delay={0.1}
          className="mt-8 max-w-xl text-pretty text-sm font-light leading-relaxed text-white/55 sm:text-base"
        >
          The bottle, the box and the rooms it lives in. For interviews, features and
          high-resolution imagery, write to us.
        </Reveal>

        <div className="mt-20 grid grid-cols-1 gap-x-8 gap-y-16 sm:mt-24 lg:grid-cols-12 lg:gap-y-24">
          {PLATES.map((plate, index) => (
            <motion.figure
              key={plate.id}
              initial={{ opacity: 0, x: plate.from === "left" ? "-14%" : "14%" }}
              whileInView={{ opacity: 1, x: "0%" }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 1.4, ease: EASE_OUT_EXPO }}
              className={plate.className}
            >
              <div
                className={`relative w-full overflow-hidden bg-black shadow-[0_40px_100px_-40px_rgba(0,0,0,0.9)] ${plate.frame}`}
              >
                {plate.media.kind === "image" ? (
                  <Image
                    src={plate.media.src}
                    alt={plate.media.alt}
                    fill
                    sizes={plate.media.sizes}
                    className="object-cover"
                  />
                ) : (
                  <LoopVideo
                    src={plate.media.src}
                    poster={plate.media.poster}
                    label={plate.media.label}
                    preload="metadata"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
                <div aria-hidden className="absolute inset-0 ring-1 ring-inset ring-white/10" />
              </div>

              <figcaption className="mt-4 flex items-baseline gap-3">
                <span className="font-display text-sm italic text-ice/60">
                  N°{String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-[10px] font-light uppercase tracking-widest2 text-white/50 sm:text-[11px]">
                  {plate.caption}
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </div>

        <Reveal className="mt-28 grid gap-6 border-t border-white/10 pt-12 sm:mt-36 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <p className="text-[10px] font-light uppercase tracking-widest3 text-ice/50">
              Press enquiries
            </p>
            <p className="mt-5 max-w-lg font-display text-3xl font-normal leading-tight text-platinum sm:text-4xl">
              Interviews, features and imagery — <span className="italic">just ask.</span>
            </p>
          </div>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="justify-self-start border border-white/20 px-8 py-4 text-[11px] font-light uppercase tracking-widest2 text-platinum/85 transition-all duration-500 ease-lux hover:border-ice/60 hover:text-platinum hover:shadow-[0_0_36px_-8px_rgba(191,211,224,0.35)] sm:justify-self-end"
          >
            {CONTACT_EMAIL}
          </a>
        </Reveal>
      </div>
    </section>
  );
}
