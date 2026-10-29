"use client";

import { motion } from "framer-motion";
import { Fragment } from "react";

import { VIEWPORT, staggerParent, wordVariants } from "@/lib/motion";

/**
 * A display heading that arrives word by word.
 *
 * Each word sits in a clipped box and slides up from below its own baseline, so
 * the line assembles itself instead of fading in as a block. The clip is what
 * makes it read as typeset rather than animated.
 *
 * The spaces between words are real text nodes sitting directly in the heading,
 * not margins. That matters: a margin would look identical but would leave
 * textContent as "CutFromCrystal", which is what a visitor copies and what a
 * crawler reads.
 */
export default function RevealHeading({
  text,
  className,
  as: Tag = "h2",
  stagger = 0.07,
  delayChildren = 0,
}: {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3";
  stagger?: number;
  delayChildren?: number;
}) {
  const words = text.split(" ");
  const MotionTag = motion[Tag];

  return (
    <MotionTag
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      variants={staggerParent(stagger, delayChildren)}
      className={className}
    >
      {words.map((word, index) => (
        <Fragment key={`${word}-${index}`}>
          {/* inline-block + overflow-hidden gives each word its own mask.
              The bottom padding has to clear the descenders or the mask itself
              slices the tails off g/p/y/j; the side padding does the same for
              italic overhang, which leans past the glyph box. The negative
              margins cancel both so the extra room costs no layout. */}
          <span className="-mx-[0.08em] inline-block overflow-hidden px-[0.08em] pb-[0.22em] -mb-[0.22em] align-bottom">
            <motion.span variants={wordVariants} className="inline-block">
              {word}
            </motion.span>
          </span>
          {index < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </MotionTag>
  );
}
