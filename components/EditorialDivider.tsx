"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

import RevealHeading from "@/components/motion/RevealHeading";

/**
 * Atmosphere between the collection and the distillery — a held breath, one
 * line of type, no furniture around it.
 */
export default function EditorialDivider() {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // The plate drifts slower than the page, so the frame feels like a window.
  // It also lifts slightly as it passes, which keeps it from reading as a
  // static band of colour.
  const y = useTransform(scrollYProgress, [0, 1], ["-14%", "14%"]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.14, 1.06, 1.14]);

  return (
    <div ref={ref} className="relative h-[60vh] overflow-hidden sm:h-[75vh]">
      <motion.div style={{ y, scale }} className="absolute inset-x-0 -top-[14%] h-[128%]">
        <Image
          src="/images/editorial/glass.webp"
          alt=""
          aria-hidden
          fill
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>

      <div aria-hidden className="absolute inset-0 bg-ink-900/70" />

      <div className="absolute inset-0 flex items-center justify-center px-6">
        <RevealHeading
          as="h2"
          text="Nothing added. Nothing to cover up."
          stagger={0.08}
          className="text-metal max-w-3xl text-balance text-center font-display text-3xl font-normal italic leading-snug tracking-tight sm:text-5xl lg:text-6xl"
        />
      </div>
    </div>
  );
}
