"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

import { ALT } from "@/data/site";

/**
 * A held breath between the cocktails and the contact details: the bottle on
 * a sunlit sill, framed like a window, drifting slower than the page.
 */
export default function EditorialBand() {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // The plate drifts slower than the page, so the frame feels like a window.
  // It also breathes slightly as it passes, which keeps it from reading as a
  // static band of colour.
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.14, 1.05, 1.14]);
  // The frame opens out to full bleed as it reaches the middle of the screen.
  const inset = useTransform(scrollYProgress, [0, 0.45], ["6%", "0%"]);
  const clipPath = useTransform(inset, (v) => `inset(${v} ${v} ${v} ${v})`);

  return (
    // Positioned: useScroll measures the target against its offset parent.
    <div ref={ref} className="relative bg-porcelain">
      <motion.div style={{ clipPath }} className="relative h-[calc(var(--svh)*62)] overflow-hidden sm:h-[calc(var(--svh)*80)]">
        <motion.div style={{ y, scale }} className="absolute inset-x-0 -top-[12%] h-[124%]">
          <Image src="/images/editorial/lux2.webp" alt={ALT.daylight} fill sizes="100vw" className="object-cover" />
        </motion.div>
      </motion.div>
    </div>
  );
}
