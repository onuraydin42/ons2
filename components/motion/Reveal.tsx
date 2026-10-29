"use client";

import { motion } from "framer-motion";
import type { ElementType } from "react";

import {
  DURATION,
  VIEWPORT,
  riseVariants,
  staggerParent,
  transition,
} from "@/lib/motion";

/**
 * The site's standard scroll reveal: a short rise with a long, soft landing.
 * Used for anything that is not a display heading or an image.
 */
export function Reveal({
  children,
  as = "div",
  delay = 0,
  duration = DURATION.base,
  className,
}: {
  children: React.ReactNode;
  as?: ElementType;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  const Component = motion[as as "div"] ?? motion.div;

  return (
    <Component
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      variants={riseVariants}
      transition={transition(duration, delay)}
      className={className}
    >
      {children}
    </Component>
  );
}

/**
 * Wraps a run of Reveal-like children so they arrive one after another rather
 * than all at once. Children must use `staggerChild` to inherit the timing.
 */
export function RevealGroup({
  children,
  stagger = 0.09,
  delayChildren = 0,
  className,
}: {
  children: React.ReactNode;
  stagger?: number;
  delayChildren?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      variants={staggerParent(stagger, delayChildren)}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** A child of RevealGroup. Timing comes from the parent, not from here. */
export function RevealItem({
  children,
  as = "div",
  className,
  id,
}: {
  children: React.ReactNode;
  as?: ElementType;
  className?: string;
  /** Needed where the revealed element is also an anchor target. */
  id?: string;
}) {
  const Component = motion[as as "div"] ?? motion.div;

  return (
    <Component
      id={id}
      variants={riseVariants}
      transition={transition(DURATION.base)}
      className={className}
    >
      {children}
    </Component>
  );
}
