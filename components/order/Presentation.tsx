"use client";

import Image from "next/image";
import { AnimatePresence, motion, useMotionValue } from "framer-motion";

import BottleSpin, { BOTTLE_ASPECT } from "@/components/BottleSpin";
import { EASE_LUX } from "@/lib/brand";
import { PRESENTATION, PRESENTATION_NOTE, type BusinessType } from "@/data/order";

/**
 * How each kind of partner receives the bottle: Liquor Stores get it boxed,
 * Restaurants get the bottle itself. Both forms show this above the business
 * name — the reorder form shows the two side by side, the order form shows
 * whichever matches the business type chosen.
 *
 * The bottle is the opening's turning bottle: transparent frames, so it
 * stands on the frame's own linen with no box of film colour around it (a
 * video's decoded colour never quite matches CSS, and differs by browser).
 */

function BottleTurn({ className = "" }: { className?: string }) {
  // Nothing to scroll with here: it simply turns.
  const still = useMotionValue(0);
  return <BottleSpin progress={still} active thumbnail alt={PRESENTATION.bottle.label} sizes="20rem" className={className} />;
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
        className="relative aspect-[3/2] overflow-hidden rounded-md border border-ink/10 bg-ink"
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
        className="relative overflow-hidden rounded-md border border-ink/10 bg-linen"
        style={{ flex: `${BOTTLE_ASPECT} 1 0%` }}
      >
        <BottleTurn className="w-full" />
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
            <div className="relative aspect-[3/2] w-full overflow-hidden rounded-md border border-ink/10 bg-linen sm:aspect-[16/9]">
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
                    <BottleTurn className="h-[92%]" />
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
                className="mt-4 text-center text-[15px] leading-relaxed text-ink-soft"
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
