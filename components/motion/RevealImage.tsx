"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { CSSProperties } from "react";

import { DURATION, EASE_OUT_QUINT, VIEWPORT_EARLY } from "@/lib/motion";

/**
 * The house image reveal: the plate is uncovered from the bottom up while the
 * picture inside settles out of a slight zoom.
 *
 * Two nested elements do the work. The outer one animates `clip-path`, so the
 * image is unveiled rather than faded — a fade looks like a loading state,
 * an unveil looks intentional. The inner one holds a longer, slower scale, so
 * the picture is still moving after the mask has finished. That overlap is what
 * keeps it from feeling like a switch being flipped.
 */
export default function RevealImage({
  src,
  alt,
  sizes,
  className = "",
  imageClassName = "object-cover",
  style,
  priority = false,
  delay = 0,
}: {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  imageClassName?: string;
  style?: CSSProperties;
  priority?: boolean;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ clipPath: "inset(14% 0% 0% 0%)", opacity: 0 }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0%)", opacity: 1 }}
      viewport={VIEWPORT_EARLY}
      transition={{ duration: DURATION.slow, delay, ease: EASE_OUT_QUINT }}
      className={`relative overflow-hidden ${className}`}
    >
      <motion.div
        initial={{ scale: 1.12 }}
        whileInView={{ scale: 1 }}
        viewport={VIEWPORT_EARLY}
        transition={{ duration: DURATION.image, delay, ease: EASE_OUT_QUINT }}
        className="absolute inset-0"
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={imageClassName}
          style={style}
        />
      </motion.div>
    </motion.div>
  );
}
