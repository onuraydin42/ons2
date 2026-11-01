"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { Fragment, useRef } from "react";

import { MANIFESTO } from "@/data/site";
import { MARK_HEIGHT, MARK_INK_SRC, MARK_WIDTH } from "@/lib/brand";

/**
 * The brand's own sentence, read in with the page.
 *
 * Every word starts as a ghost and inks in as the visitor scrolls past it, so
 * the line is read at the speed of the hand on the wheel. The words are real
 * text separated by real spaces — copied, crawled and read aloud as one
 * sentence; only their opacity moves.
 */

/** The faintest a word gets before its turn: still legible as a shape. */
const GHOST = 0.16;

function InkWord({
  word,
  index,
  total,
  progress,
  still,
}: {
  word: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
  /** Reduced motion: the sentence is simply there, fully inked. */
  still: boolean;
}) {
  // Each word has its own slice of the scroll, overlapping its neighbours so
  // the ink runs along the line rather than ticking word by word.
  const start = index / total;
  const end = Math.min(start + 2.5 / total, 1);
  const opacity = useTransform(progress, [start, end], [still ? 1 : GHOST, 1]);
  return <motion.span style={{ opacity }}>{word}</motion.span>;
}

export default function Manifesto() {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.55"] });

  const words = MANIFESTO.split(" ");

  return (
    <section ref={ref} className="safe-gutter relative bg-porcelain px-6 py-28 sm:px-10 sm:py-36 lg:py-44 short:py-20">
      <div className="mx-auto max-w-5xl text-center">
        <Image src={MARK_INK_SRC} alt="" width={MARK_WIDTH} height={MARK_HEIGHT} className="mx-auto h-14 w-auto sm:h-16" />

        <p className="mt-12 text-balance font-display text-[1.6rem] font-normal italic leading-[1.3] text-ink sm:text-[2.5rem] sm:leading-[1.22] lg:text-[3.1rem]">
          {words.map((word, index) => (
            <Fragment key={`${word}-${index}`}>
              <InkWord
                word={word}
                index={index}
                total={words.length}
                progress={scrollYProgress}
                still={Boolean(reduceMotion)}
              />
              {index < words.length - 1 ? " " : null}
            </Fragment>
          ))}
        </p>

        <span aria-hidden className="mx-auto mt-14 block h-px w-16 bg-gold-light" />
      </div>
    </section>
  );
}
