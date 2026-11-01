"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

import GateBackdrop from "@/components/GateBackdrop";
import { useSmoothScroll } from "@/components/SmoothScroll";
import { AGE_GATE } from "@/data/site";
import { MARK_HEIGHT, MARK_SRC, MARK_WIDTH } from "@/lib/brand";
import { EASE_OUT_EXPO } from "@/lib/motion";

/**
 * Legal-age confirmation, shown on the first load of every gated route, in
 * the live site's words. "No" leaves for Google, as it does live.
 *
 * Deliberately state-only — no localStorage, no cookie. A static export is
 * prerendered HTML, so anything read from the browser during the first render
 * would desync the server markup from the client tree. SiteShell owns `open`,
 * so client-side navigation never brings the gate back once answered.
 */
export default function AgeGate({ open, onEnter }: { open: boolean; onEnter: () => void }) {
  const smooth = useSmoothScroll();

  // A whole-screen blur is too much to animate on a phone while the page starts.
  const blurOut = typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches;

  /* Every full load — a first visit or a refresh — starts the show from the
   * top. Browsers otherwise put a refreshed page back where it was, landing
   * the visitor mid-page with the opening already spent. */
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
    onEnter();
  };

  const decline = () => {
    window.location.href = AGE_GATE.declineUrl;
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
          exit={{ opacity: 0, scale: 1.04, ...(blurOut ? { filter: "blur(6px)" } : {}), pointerEvents: "none" }}
          transition={{ duration: 1.1, ease: EASE_OUT_EXPO }}
          data-lenis-prevent
          className="fixed inset-0 z-[999] flex overflow-y-auto overscroll-contain bg-porcelain px-4 py-6 sm:px-5 sm:py-10 short:py-3"
        >
          <GateBackdrop />

          {/* Auto margins rather than centring the row: on a screen shorter than
              the card, centring would push its top out of reach of the scroll. */}
          <div className="animate-fo-rise relative m-auto w-full max-w-xl border border-gold/45 bg-ivory/90 px-5 py-9 text-center shadow-[0_40px_120px_-60px_rgba(22,20,18,0.5)] fine:bg-ivory/80 fine:backdrop-blur-md sm:px-14 sm:py-14 short:py-5">
            {/* Hairline inner frame: the gilt edge of a box lid. */}
            <span aria-hidden className="pointer-events-none absolute inset-2 border border-gold/20 sm:inset-3" />

            <Image
              src={MARK_SRC}
              alt=""
              width={MARK_WIDTH}
              height={MARK_HEIGHT}
              priority
              className="mx-auto h-20 w-auto sm:h-24 short:h-12"
            />

            <p className="mt-6 font-wordmark text-base font-normal uppercase tracking-[0.42em] text-ink sm:text-lg short:mt-2 short:text-sm">
              {AGE_GATE.wordmark}
            </p>

            <span aria-hidden className="relative mx-auto mt-6 block h-px w-24 overflow-hidden bg-gold/50 short:mt-2">
              <span
                className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-transparent via-gold-light to-transparent"
                style={{ animation: "fo-sheen 4.2s ease-in-out 1s infinite" }}
              />
            </span>

            {/* An h2, as live: each page's one h1 is its own title, which is
                what search engines should read the page as. */}
            <h2
              id="age-gate-heading"
              className="mx-auto mt-8 max-w-md text-balance font-display text-[clamp(1.45rem,7vw,1.7rem)] font-normal leading-[1.15] text-ink sm:text-[2.3rem] short:mt-3 short:max-w-none short:text-[1.45rem]"
            >
              {AGE_GATE.question}
            </h2>

            <div className="mt-10 grid grid-cols-2 gap-3 sm:flex sm:items-center sm:justify-center sm:gap-4 short:mt-4">
              <button
                type="button"
                onClick={enter}
                className="bg-ink px-4 py-4 text-[12px] uppercase tracking-widest2 text-ivory transition duration-500 ease-lux hover:bg-gold hover:text-ink active:bg-gold active:text-ink sm:min-w-[9.5rem] sm:px-9 short:py-3"
              >
                {AGE_GATE.yes}
              </button>
              <button
                type="button"
                onClick={decline}
                className="border border-ink/35 px-4 py-4 text-[12px] uppercase tracking-widest2 text-ink transition duration-500 ease-lux hover:border-ink hover:bg-ink/[0.05] active:border-ink active:bg-ink/[0.05] sm:min-w-[9.5rem] sm:px-9 short:py-3"
              >
                {AGE_GATE.no}
              </button>
            </div>

            <p className="mx-auto mt-8 max-w-md text-balance text-[11.5px] leading-relaxed tracking-[0.08em] text-ink-muted sm:mt-9 sm:text-[12.5px] short:mt-3 short:max-w-none">
              {AGE_GATE.note}
            </p>

            <p className="mt-3 short:mt-1">
              <Link
                href="/terms/"
                className="inline-block py-2 text-[11.5px] leading-relaxed tracking-[0.08em] text-ink-soft underline decoration-gold/60 underline-offset-[6px] transition-colors duration-500 hover:text-ink hover:decoration-gold sm:text-[12.5px]"
              >
                {AGE_GATE.accept}
              </Link>
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
