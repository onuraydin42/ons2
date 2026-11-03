"use client";

import Image from "next/image";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { ALT, SHOWCASE } from "@/data/site";

/**
 * The brochure's product pages, cut out of their white cards and stood on the page.
 *
 * On a wide screen the section holds still and the page's scroll carries the visitor
 * sideways along the range, the pictures sliding over one another at their own
 * speeds. On a phone, where a page should go on scrolling down, it is a row to swipe
 * through. Anyone who prefers reduced motion gets the row everywhere, and so does a
 * window too low to hold a panel still in.
 */

type Shot = {
  src: string;
  alt: string;
  /** Its place in the panel's picture area. */
  place: string;
  sizes: string;
  /** How far it slides against the panel as it passes, in pixels. */
  drift: number;
  /** Over the shot behind it, so it gets a shadow to lift it off. */
  front?: boolean;
};

type Panel = {
  id: string;
  title: string;
  note?: string;
  label?: readonly string[];
  shots: Shot[];
};

const PANELS: Panel[] = [
  {
    id: "decanter",
    title: SHOWCASE.decanter.title,
    note: SHOWCASE.decanter.note,
    label: SHOWCASE.decanter.label,
    shots: [
      {
        src: "/images/brochure/decanter.webp",
        alt: ALT.decanter,
        place: "inset-0",
        sizes: "(min-width: 1024px) 40vw, 80vw",
        drift: 40,
      },
    ],
  },
  {
    id: "box",
    title: SHOWCASE.box.title,
    note: SHOWCASE.box.note,
    shots: [
      {
        src: "/images/brochure/box.webp",
        alt: ALT.box,
        place: "left-0 top-0 h-[86%] w-[66%]",
        sizes: "(min-width: 1024px) 34vw, 56vw",
        drift: 24,
      },
      {
        src: "/images/brochure/box-open.webp",
        alt: ALT.boxOpen,
        place: "bottom-0 right-0 h-[72%] w-[52%]",
        sizes: "(min-width: 1024px) 26vw, 44vw",
        drift: 90,
        front: true,
      },
    ],
  },
  {
    id: "caviar",
    title: SHOWCASE.caviar.title,
    shots: [
      {
        src: "/images/brochure/caviar-closed.webp",
        alt: ALT.caviarClosed,
        place: "left-[4%] top-0 h-[58%] w-[52%]",
        sizes: "(min-width: 1024px) 26vw, 44vw",
        drift: 24,
      },
      {
        src: "/images/brochure/caviar.webp",
        alt: ALT.caviar,
        place: "bottom-0 right-0 h-[62%] w-[92%]",
        sizes: "(min-width: 1024px) 46vw, 80vw",
        drift: 90,
        front: true,
      },
    ],
  },
  {
    id: "coasters",
    title: SHOWCASE.coasters.title,
    shots: [
      {
        src: "/images/brochure/coasters.webp",
        alt: ALT.coasters,
        place: "inset-0",
        sizes: "(min-width: 1024px) 50vw, 86vw",
        drift: 40,
      },
    ],
  },
];

const COUNT = PANELS.length;

/** One picture, sliding against its panel as the panel crosses the screen. */
function ShotImage({
  shot,
  index,
  progress,
  pinned,
}: {
  shot: Shot;
  index: number;
  progress: MotionValue<number>;
  pinned: boolean;
}) {
  const span = 1 / (COUNT - 1);
  const x = useTransform(progress, [(index - 1) * span, (index + 1) * span], [shot.drift, -shot.drift]);

  return (
    <motion.div style={pinned ? { x } : undefined} className={`absolute ${shot.place}`}>
      <Image
        src={shot.src}
        alt={shot.alt}
        fill
        sizes={shot.sizes}
        className={`object-contain ${shot.front ? "fine:drop-shadow-[0_30px_40px_rgba(18,17,15,0.3)]" : ""}`}
      />
    </motion.div>
  );
}

export default function ProductShowcase() {
  const ref = useRef<HTMLElement>(null);
  const [pinned, setPinned] = useState(false);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 1024px) and (min-height: 521px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setStill(reduced.matches || !wide.matches);
      setPinned(wide.matches && !reduced.matches);
    };
    update();
    wide.addEventListener("change", update);
    reduced.addEventListener("change", update);
    return () => {
      wide.removeEventListener("change", update);
      reduced.removeEventListener("change", update);
    };
  }, []);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // A breath at each end, so the first and last panels settle before anything moves.
  const travel = useTransform(scrollYProgress, [0.04, 0.96], [0, 1], { clamp: true });
  const x = useTransform(travel, [0, 1], ["0%", `${(-100 * (COUNT - 1)) / COUNT}%`]);
  const bar = useTransform(travel, [0, 1], [1 / COUNT, 1]);

  return (
    <section
      ref={ref}
      id="showcase"
      aria-label={SHOWCASE.eyebrow}
      className={`ground-wood relative bg-porcelain py-20 sm:py-24 short:py-14 ${still ? "lg:py-24" : "lg:h-[calc(var(--svh)*340)] lg:py-0"}`}
    >
      <div className={still ? "" : "lg:h-stage lg:sticky lg:top-0 lg:overflow-hidden"}>
        <p
          className={`safe-gutter mb-8 text-balance px-[7vw] text-[10.5px] uppercase tracking-[0.18em] text-ink-soft sm:text-[11.5px] sm:tracking-widest2 short:mb-5 ${
            still ? "" : "lg:absolute lg:left-20 lg:top-[6.5rem] lg:z-[1] lg:mb-0 lg:px-0 xl:left-28 low:top-[5.75rem]"
          }`}
        >
          {SHOWCASE.eyebrow}
        </p>

        {/* The row. Each panel is about a screen wide, with the next one showing at
            the edge on a phone, so it is plain that there is more to swipe to. */}
        <motion.div
          style={pinned ? { x } : undefined}
          tabIndex={pinned ? undefined : 0}
          role="group"
          aria-label={SHOWCASE.eyebrow}
          className={`scrollbar-none flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-[7vw] sm:gap-8 ${
            still ? "" : "lg:h-full lg:w-[400vw] lg:snap-none lg:gap-0 lg:overflow-visible lg:px-0"
          }`}
        >
          {PANELS.map((panel, index) => (
            <article
              key={panel.id}
              className={`safe-gutter grid w-[86vw] shrink-0 snap-center content-start gap-8 sm:w-[72vw] short:w-[86vw] short:grid-cols-[1fr_1fr] short:items-center short:gap-6 ${
                still ? "lg:w-[46vw]" : "lg:h-full lg:w-screen lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:content-center lg:items-center lg:gap-14 lg:px-20 lg:pb-[4.5rem] lg:pt-32 xl:px-28 low:pt-28"
              }`}
            >
              <div
                className={`relative aspect-[4/5] w-full sm:aspect-[5/4] short:aspect-auto short:h-[calc(var(--svh)*72)] ${
                  still ? "" : "lg:order-2 lg:aspect-auto lg:h-[calc(var(--svh)*100-12.5rem)] low:h-[calc(var(--svh)*100-11.5rem)]"
                }`}
              >
                {panel.shots.map((shot) => (
                  <ShotImage key={shot.src} shot={shot} index={index} progress={travel} pinned={pinned} />
                ))}
              </div>

              <div className={still ? "" : "lg:order-1"}>
                <p className="font-display text-sm italic text-gold-deep">N°{String(index + 1).padStart(2, "0")}</p>
                <h3 className="mt-4 text-balance font-display text-[clamp(1.9rem,8vw,2.6rem)] font-normal leading-[1.02] tracking-tight text-ink sm:text-[3rem] lg:text-[4rem] short:mt-2 short:text-[1.9rem] low:mt-2 low:text-[2.9rem]">
                  {panel.title}
                </h3>
                <span aria-hidden className="mt-6 block h-px w-14 bg-gold-light short:mt-3 low:mt-3" />
                {panel.note ? (
                  <p className="mt-6 max-w-md text-pretty text-[15.5px] leading-[1.8] text-ink-soft sm:text-[16.5px] short:mt-3 short:text-[14px] short:leading-[1.6] low:mt-3 low:text-[14.5px] low:leading-[1.65]">
                    {panel.note}
                  </p>
                ) : null}
                {panel.label ? (
                  <ul className="mt-6 grid max-w-md grid-cols-2 gap-x-6 gap-y-2 border-t border-ink/15 pt-5 text-[11.5px] uppercase tracking-[0.14em] text-ink-muted short:mt-3 short:pt-3 low:mt-3 low:gap-y-1 low:pt-3 low:text-[11px]">
                    {panel.label.map((line) => (
                      <li key={line} className={line.length > 20 ? "col-span-2" : ""}>
                        {line}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </article>
          ))}
        </motion.div>

        {/* How far along the range: only where the scroll is what moves it. */}
        {pinned ? (
          <motion.span
            aria-hidden
            style={{ scaleX: bar }}
            className="absolute bottom-8 left-20 right-20 hidden h-px origin-left bg-ink/40 lg:block xl:left-28 xl:right-28"
          />
        ) : null}
      </div>
    </section>
  );
}
