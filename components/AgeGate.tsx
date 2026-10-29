"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import GateBackdrop from "@/components/GateBackdrop";
import { useSmoothScroll } from "@/components/SmoothScroll";
import { LOGO_HEIGHT, LOGO_SRC, LOGO_WIDTH } from "@/lib/brand";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { isHalloweenSeason } from "@/lib/season";

/**
 * Legal-age confirmation, shown on first load of every route.
 *
 * Deliberately state-only — no localStorage, no cookie. A static export is
 * prerendered HTML, so anything read from the browser during the first render
 * would desync the server markup from the client tree. Starting from a fixed
 * `open: true` keeps hydration exact; the season is read after mount for the
 * same reason.
 */
export default function AgeGate({ onEnter }: { onEnter?: () => void }) {
  const [open, setOpen] = useState(true);
  const [declined, setDeclined] = useState(false);
  const [halloween, setHalloween] = useState(false);
  const smooth = useSmoothScroll();

  useEffect(() => setHalloween(isHalloweenSeason()), []);

  /* Every full load — a first visit or a refresh — starts the show from the
   * top. Browsers otherwise put a refreshed page back where it was, landing
   * the visitor mid-page with the opening already spent. Client-side
   * navigation never remounts the gate, so moving around the site is
   * unaffected. */
  useEffect(() => {
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, []);

  // Hold the page still underneath the overlay, and hand scrolling back only
  // when the gate is actually dismissed. Lenis listens to wheel events rather
  // than to the scroll container, so `overflow: hidden` alone would not stop
  // it — it has to be paused directly. The lock goes on <html> as well as
  // <body> because mobile Safari only honours it there for touch scrolling.
  useEffect(() => {
    if (!open) return;

    const root = document.documentElement;
    const previous = { html: root.style.overflow, body: document.body.style.overflow };
    root.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    smooth.stop();

    return () => {
      root.style.overflow = previous.html;
      document.body.style.overflow = previous.body;
      smooth.start();
    };
  }, [open, smooth]);

  const enter = () => {
    // Whatever happened behind the gate, the visit begins at the very top.
    smooth.scrollTo(0, { immediate: true });
    setOpen(false);
    onEnter?.();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="age-gate"
          role="dialog"
          aria-modal="true"
          aria-labelledby="age-gate-heading"
          initial={{ opacity: 1 }}
          // Long, and overlapping the page settling underneath, so the two read
          // as one motion rather than a curtain being yanked away. pointerEvents
          // drops the instant the exit starts, so the fading overlay cannot
          // swallow a click meant for the page below it.
          exit={{ opacity: 0, scale: 1.06, filter: "blur(6px)", pointerEvents: "none" }}
          transition={{ duration: 1.1, ease: EASE_OUT_EXPO }}
          className="fixed inset-0 z-[999] flex items-center justify-center overflow-hidden bg-ink-900 px-6"
        >
          <GateBackdrop halloween={halloween} />

          <div className="relative w-full max-w-lg text-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: EASE_OUT_EXPO }}
            >
              <Image
                src={LOGO_SRC}
                alt="FLUID OUNCE"
                width={LOGO_WIDTH}
                height={LOGO_HEIGHT}
                priority
                className="mx-auto h-24 w-auto drop-shadow-[0_0_24px_rgba(255,214,150,0.18)] sm:h-28"
              />
            </motion.div>

            {/* Seasonal kicker. Its slot is always reserved, so the copy below
                does not jump when it fades in after mount. */}
            <div className="mt-9 flex h-4 items-center justify-center">
              <AnimatePresence>
                {halloween ? (
                  <motion.p
                    key="season"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, delay: 0.3, ease: EASE_OUT_EXPO }}
                    className="flex items-center gap-4 font-display text-sm italic tracking-wide text-ember/90 sm:text-[15px]"
                  >
                    <span aria-hidden className="h-px w-8 bg-gradient-to-r from-transparent to-ember/60 sm:w-12" />
                    All Hallows’ Eve
                    <span aria-hidden className="h-px w-8 bg-gradient-to-l from-transparent to-ember/60 sm:w-12" />
                  </motion.p>
                ) : null}
              </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
              {declined ? (
                <motion.div
                  key="declined"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
                  className="mt-7"
                >
                  <p className="text-balance font-display text-2xl leading-snug text-platinum sm:text-3xl">
                    Thank you for your honesty. Please come back when you’re of legal age.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="asking"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.7, delay: 0.15, ease: EASE_OUT_EXPO }}
                  className="mt-7"
                >
                  <h1
                    id="age-gate-heading"
                    className="text-metal text-balance font-display text-[2rem] font-normal leading-[1.1] tracking-tight sm:text-5xl"
                  >
                    Are you of <span className="italic">legal</span> drinking age?
                  </h1>

                  <div className="mt-11 flex items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={enter}
                      className={`min-w-[8rem] bg-platinum px-9 py-4 text-xs font-medium uppercase tracking-widest2 text-ink-900 transition duration-500 ease-lux hover:bg-white ${
                        halloween
                          ? "hover:shadow-[0_0_44px_-6px_rgba(255,150,60,0.55)]"
                          : "hover:shadow-[0_0_40px_-8px_rgba(191,211,224,0.6)]"
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeclined(true)}
                      className="min-w-[8rem] border border-white/25 px-9 py-4 text-xs font-medium uppercase tracking-widest2 text-platinum/80 backdrop-blur-sm transition duration-500 ease-lux hover:border-white/60 hover:text-platinum"
                    >
                      No
                    </button>
                  </div>

                  <p className="mx-auto mt-10 max-w-sm text-balance text-[11px] font-light leading-relaxed tracking-wide text-white/40">
                    By entering you confirm you are of legal drinking age in your country of
                    residence.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
