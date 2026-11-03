"use client";

import { useEffect, useRef, type ElementType, type HTMLAttributes } from "react";

/**
 * A section of burnt timber (.char-ground in globals.css).
 *
 * With a mouse the visitor carries a lamp across it: a second layer holds only the
 * wood's raised ridges, and it shows only around the cursor, so the grain catches
 * the light as it passes and falls dark behind it. Touch screens have no cursor to
 * follow, and do not fetch the layer.
 */
export default function CharGround({
  as = "section",
  className = "",
  children,
  ...rest
}: HTMLAttributes<HTMLElement> & { as?: "section" | "footer" | "div" }) {
  const Tag = as as ElementType;
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || !window.matchMedia("(pointer: fine)").matches) return;

    let frame = 0;
    let x = 0;
    let y = 0;
    const paint = () => {
      frame = 0;
      element.style.setProperty("--lamp-x", `${x}px`);
      element.style.setProperty("--lamp-y", `${y}px`);
    };
    const onMove = (event: PointerEvent) => {
      const box = element.getBoundingClientRect();
      x = event.clientX - box.left;
      y = event.clientY - box.top;
      if (!frame) frame = window.requestAnimationFrame(paint);
      element.style.setProperty("--lamp-on", "0.3");
    };
    const onLeave = () => element.style.setProperty("--lamp-on", "0");

    element.addEventListener("pointermove", onMove, { passive: true });
    element.addEventListener("pointerleave", onLeave);
    return () => {
      window.cancelAnimationFrame(frame);
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <Tag ref={ref} className={`char-ground ${className}`} {...rest}>
      <div aria-hidden className="char-lamp" />
      {children}
    </Tag>
  );
}
