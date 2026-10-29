"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import OrderForm from "@/components/order/OrderForm";
import ReorderForm from "@/components/order/ReorderForm";
import { GhostButton } from "@/components/order/Fields";
import { EASE_LUX, MARK_HEIGHT, MARK_SRC, MARK_WIDTH } from "@/lib/brand";

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
      strokeWidth={0.9}
      strokeLinecap="square"
      aria-hidden
      className="h-6 w-6 shrink-0 text-ice/60 sm:h-10 sm:w-10"
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

const COPY: Record<Exclude<View, "landing">, { title: string; lede: string }> = {
  order: {
    title: "Order",
    lede: "For licensed Liquor Store and Restaurant partners placing a first order.",
  },
  reorder: {
    title: "Reorder",
    lede: "For accounts already stocking FLUID OUNCE.",
  },
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
    <main className="min-h-stage relative bg-ink-900">
      {/* A single cold pool of light, the same one the bottle sits in. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 30%, rgba(191,211,224,0.07) 0%, rgba(5,7,10,0) 70%)",
        }}
      />

      {/* Mark only — the portal is not linked from the site and carries no nav. */}
      <div className="relative px-6 pt-8 sm:px-10 sm:pt-10 lg:px-16">
        <Image
          src={MARK_SRC}
          alt="FLUID OUNCE"
          width={MARK_WIDTH}
          height={MARK_HEIGHT}
          priority
          className="h-9 w-auto sm:h-11"
        />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-4xl flex-col justify-center px-6 py-16 sm:px-10">
        <AnimatePresence mode="wait">
          {view === "landing" ? (
            <motion.div key="landing" {...swap} className="text-center">
              <div className="flex items-center justify-center gap-3 sm:gap-8">
                <BobbingChevron />

                {/* Held on one line: the chevrons flank the headline, and a wrap
                    would strand them beside a two-line block. */}
                <h1 className="text-metal whitespace-nowrap font-display text-2xl font-normal uppercase leading-none tracking-widest2 sm:text-5xl lg:text-6xl">
                  Place Order
                </h1>

                <BobbingChevron />
              </div>

              <div className="mx-auto mt-14 flex max-w-md flex-col items-stretch gap-4 sm:mt-16 sm:max-w-none sm:flex-row sm:justify-center">
                <GhostButton onClick={() => open("order")} className="sm:min-w-[13rem]">
                  Order
                </GhostButton>
                <GhostButton onClick={() => open("reorder")} className="sm:min-w-[13rem]">
                  Reorder
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
                className="w-full border border-white/25 px-10 py-4 text-sm font-light uppercase tracking-widest2 text-platinum/90 transition-all duration-500 ease-lux hover:border-ice/60 hover:text-platinum hover:shadow-[0_0_36px_-8px_rgba(191,211,224,0.35)] sm:w-auto sm:min-w-[13rem] sm:py-[1.125rem]"
              >
                Go Back
              </button>

              <h1 className="text-metal mt-12 text-balance font-display text-4xl font-normal uppercase tracking-widest2 sm:text-5xl">
                {COPY[view].title}
              </h1>

              <p className="mt-5 text-sm font-light leading-relaxed text-white/55 sm:text-base">
                {COPY[view].lede}
              </p>

              <div className="mt-12">{view === "order" ? <OrderForm /> : <ReorderForm />}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="relative px-6 pb-10 text-center text-[11px] font-light leading-relaxed tracking-wide text-white/30 sm:px-10 sm:text-xs">
        Please drink responsibly. You must be of legal drinking age to enter.
      </p>
    </main>
  );
}
