"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import OrderForm from "@/components/order/OrderForm";
import ReorderForm from "@/components/order/ReorderForm";
import { GhostButton } from "@/components/order/Fields";
import { ORDER_COPY as COPY } from "@/data/order";
import { BRAND, FOOTER_LEGAL, copyright } from "@/data/site";
import { EASE_LUX, MARK_HEIGHT, MARK_INK_SRC, MARK_WIDTH } from "@/lib/brand";

type View = "landing" | "order" | "reorder";

/* One clock for both chevrons. They share a duration, have no delay, and
 * mount in the same render, so they rise and fall together as a pair. */
const BOB = { duration: 1.8, repeat: Infinity, ease: "easeInOut" } as const;

/** Points down toward the two doors below the headline. */
function BobbingChevron() {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      strokeLinecap="square"
      aria-hidden
      className="h-6 w-6 shrink-0 text-gold-deep sm:h-10 sm:w-10"
      animate={{ y: [-8, 8, -8] }}
      transition={BOB}
    >
      <path d="M6 9 L12 15 L18 9" />
    </motion.svg>
  );
}

const swap = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.5, ease: EASE_LUX },
};

export default function OrderPortal() {
  const [view, setView] = useState<View>("landing");

  const open = (next: View) => {
    setView(next);
    // A form is several screens tall and the landing is one; always start a
    // view from the top rather than wherever the last one was left.
    window.scrollTo({ top: 0 });
  };

  return (
    <main className="min-h-stage relative bg-porcelain">
      {/* A soft pool of light, the same warmth as the front door. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 28%, rgba(227,204,138,0.14) 0%, rgba(227,204,138,0) 70%)",
        }}
      />
      {/* Grain over it: a glow this faint would otherwise show its 8-bit steps as rings. */}
      <div aria-hidden className="bg-grain pointer-events-none fixed inset-0 opacity-[0.045]" />

      {/* Mark only — the portal is not linked from the site and carries no nav. */}
      <div className="safe-gutter relative flex items-center gap-3 px-6 pt-[max(2rem,env(safe-area-inset-top,0px))] sm:px-10 sm:pt-10 lg:px-16">
        <Image src={MARK_INK_SRC} alt="" width={MARK_WIDTH} height={MARK_HEIGHT} priority className="h-10 w-auto sm:h-12" />
        <span className="font-wordmark text-[13px] uppercase tracking-[0.34em] text-ink sm:text-[15px]">{BRAND}</span>
      </div>

      <div className="safe-gutter relative mx-auto flex min-h-[calc(var(--svh)*100-8rem)] w-full max-w-4xl flex-col justify-center px-6 py-16 sm:px-10 short:min-h-0 short:py-8">
        <AnimatePresence mode="wait">
          {view === "landing" ? (
            <motion.div key="landing" {...swap} className="text-center">
              <div className="flex items-center justify-center gap-3 sm:gap-8">
                <BobbingChevron />

                {/* Held on one line: the chevrons flank the headline, and a wrap
                    would strand them beside a two-line block. */}
                <h1 className="whitespace-nowrap font-display text-[clamp(1.05rem,6.2vw,1.7rem)] font-normal uppercase leading-none tracking-widest2 text-ink sm:text-[2.6rem] lg:text-[3.3rem]">
                  {COPY.heading}
                </h1>

                <BobbingChevron />
              </div>

              {/* Reorder first, then Order — as the live doors are hung. */}
              <div className="mx-auto mt-14 flex max-w-md flex-col items-stretch gap-4 sm:mt-16 sm:max-w-none sm:flex-row sm:justify-center">
                <GhostButton onClick={() => open("reorder")} className="sm:min-w-[13rem]">
                  {COPY.reorder}
                </GhostButton>
                <GhostButton onClick={() => open("order")} className="sm:min-w-[13rem]">
                  {COPY.order}
                </GhostButton>
              </div>
            </motion.div>
          ) : (
            /* The landing headline wants a wide stage; a form wants a narrower
               measure. Only the landing state uses the full container width. */
            <motion.div key={view} {...swap} className="mx-auto w-full max-w-3xl">
              <button
                type="button"
                onClick={() => open("landing")}
                className="w-full border border-ink/35 px-10 py-4 text-[12px] uppercase tracking-widest2 text-ink transition-all duration-500 ease-lux hover:border-ink hover:bg-ink hover:text-ivory active:border-ink active:bg-ink active:text-ivory sm:w-auto sm:min-w-[13rem] sm:py-[1.125rem]"
              >
                {COPY.back}
              </button>

              <h1 className="mt-12 font-display text-[2rem] font-normal uppercase tracking-widest2 text-ink sm:text-[2.6rem]">
                {view === "order" ? COPY.order : COPY.reorder}
              </h1>

              <div className="mt-12">
                {view === "order" ? (
                  <OrderForm onClose={() => open("landing")} />
                ) : (
                  <ReorderForm onClose={() => open("landing")} />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="safe-gutter relative border-t border-ink/15 px-6 pb-[max(2.5rem,env(safe-area-inset-bottom,0px))] pt-8 text-center sm:px-10">
        <p className="mx-auto max-w-3xl text-pretty text-[12.5px] leading-[1.8] text-ink-muted">
          {FOOTER_LEGAL.text}{" "}
          {FOOTER_LEGAL.links.map((link, index) => (
            <span key={link.href}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 text-ink-soft underline decoration-ink/40 underline-offset-4 hover:text-ink hover:decoration-ink"
              >
                {link.label}
              </a>
              {index === 0 ? " and " : "."}
            </span>
          ))}
        </p>
        <p suppressHydrationWarning className="mt-5 text-[12.5px] text-ink-muted">
          {copyright(new Date().getFullYear())}
        </p>
      </footer>
    </main>
  );
}
