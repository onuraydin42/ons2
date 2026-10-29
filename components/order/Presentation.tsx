"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

import LoopVideo from "@/components/LoopVideo";
import { EASE_LUX } from "@/lib/brand";
import { PRESENTATION, PRESENTATION_NOTE, type BusinessType } from "@/data/order";

/**
 * How each kind of partner receives the bottle: Liquor Stores get it boxed,
 * Restaurants get the bottle itself. Both forms show this above the business
 * name — the reorder form shows the two side by side, the order form shows
 * whichever matches the business type chosen.
 *
 * The film is 9:16 with thin black bars down each side. A 1:2 frame with
 * cover-fit crops exactly those away, so it always sits in a 1:2 box.
 */

function BottleFilm() {
  return (
    <LoopVideo
      src={PRESENTATION.bottle.src}
      poster={PRESENTATION.bottle.poster}
      label={PRESENTATION.bottle.label}
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}

/**
 * Reorder: both presentations at the same height, each at its own natural
 * shape — flex-grow is set to each frame's aspect ratio, which is what makes
 * the heights come out equal without cropping either one.
 */
export function PresentationPair() {
  return (
    <div className="flex items-start gap-3 sm:gap-4">
      <figure
        className="relative aspect-[3/2] overflow-hidden rounded-md border border-white/10 bg-black"
        style={{ flex: "1.5 1 0%" }}
      >
        <Image
          src={PRESENTATION.boxed.src}
          alt={PRESENTATION.boxed.alt}
          fill
          sizes="(min-width: 768px) 36rem, 70vw"
          className="object-cover"
        />
      </figure>
      <figure
        className="relative aspect-[1/2] overflow-hidden rounded-md border border-white/10 bg-black"
        style={{ flex: "0.5 1 0%" }}
      >
        <BottleFilm />
      </figure>
    </div>
  );
}

/**
 * Order: the presentation for the chosen business type. Nothing shows until a
 * type is picked; the stage then opens, and switching type crossfades inside a
 * frame that keeps its size, so the form below never jumps.
 */
export function PresentationForType({ type }: { type: BusinessType | "" }) {
  return (
    <AnimatePresence initial={false}>
      {type ? (
        <motion.div
          key="presentation"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.7, ease: EASE_LUX }}
          className="overflow-hidden"
        >
          {/* Spacing lives inside the animated box: padding on the box itself
              would stop it collapsing all the way to zero. */}
          <div className="pb-9">
            <div className="relative aspect-[3/2] w-full overflow-hidden rounded-md border border-white/10 bg-black sm:aspect-[16/9]">
              <AnimatePresence initial={false}>
                <motion.div
                  key={type}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: EASE_LUX }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  {type === "Liquor Store" ? (
                    // Full-bleed. In the wider 16:9 frame the crop is weighted
                    // toward the floor, which the box lids can spare and the
                    // tops of the boxes cannot.
                    <Image
                      src={PRESENTATION.boxed.src}
                      alt={PRESENTATION.boxed.alt}
                      fill
                      sizes="(min-width: 768px) 48rem, 100vw"
                      className="object-cover object-[50%_25%]"
                    />
                  ) : (
                    <>
                      {/* A soft spotlight, so the portrait film sits on a
                          lit stage rather than floating in a black box. */}
                      <div
                        aria-hidden
                        className="absolute inset-0"
                        style={{
                          background:
                            "radial-gradient(38% 75% at 50% 55%, rgba(191,211,224,0.14) 0%, rgba(0,0,0,0) 70%)",
                        }}
                      />
                      <div className="relative aspect-[1/2] h-full shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]">
                        <BottleFilm />
                      </div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={type}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.4, ease: EASE_LUX }}
                className="mt-4 text-center text-[13px] font-light leading-relaxed text-white/60 sm:text-sm"
              >
                {PRESENTATION_NOTE[type]}
              </motion.p>
            </AnimatePresence>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
