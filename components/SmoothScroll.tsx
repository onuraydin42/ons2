"use client";

import Lenis from "lenis";
import { createContext, useContext, useEffect, useMemo, useRef } from "react";

/**
 * Momentum scrolling for the whole site.
 *
 * Native wheel scrolling moves in hard discrete jumps. Lenis interpolates the
 * scroll position every frame, so `useScroll` — and therefore the opening's
 * scroll-linked plates and every reveal — receives a continuous value instead
 * of a staircase. A finger already scrolls continuously, so touch screens keep
 * the browser's own scrolling and are spared Lenis's listeners: a touch listener
 * that may cancel the scroll makes every scroll wait on script.
 *
 * The instance is shared through context because several places need it: the
 * age gate and the phone menu freeze scrolling while they are open, and every
 * in-page link (navbar, footer, form errors) glides through Lenis rather than
 * teleporting around it.
 */

export interface ScrollOptions {
  /** Pixels added to the resolved position; negative stops short of it. */
  offset?: number;
  duration?: number;
  /** Jump with no animation — and even while scrolling is stopped. */
  immediate?: boolean;
}

interface SmoothScrollApi {
  stop: () => void;
  start: () => void;
  scrollTo: (target: string | number | HTMLElement, options?: ScrollOptions) => void;
}

/* Programmatic jumps ease in as well as out. Momentum scrolling decelerates
 * only, which is right for a flick of the wheel, but a long jump that starts
 * at full speed reads as a cut; easing in makes it read as travel. */
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** Used whenever Lenis is not running (reduced motion, or before it mounts). */
function nativeScrollTo(target: string | number | HTMLElement, options?: ScrollOptions) {
  const offset = options?.offset ?? 0;

  const behavior: ScrollBehavior = options?.immediate ? "instant" : "smooth";

  if (typeof target === "number") {
    window.scrollTo({ top: target + offset, behavior });
    return;
  }

  const element =
    typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  if (!element) return;

  // Mirrors what Lenis does: honour the target's own scroll-margin.
  const margin = Number.parseFloat(getComputedStyle(element).scrollMarginTop) || 0;
  const top = element.getBoundingClientRect().top + window.scrollY - margin + offset;
  window.scrollTo({ top, behavior });
}

const SmoothScrollContext = createContext<SmoothScrollApi | null>(null);

/** Safe everywhere — returns a native fallback when smooth scrolling is disabled. */
export function useSmoothScroll(): SmoothScrollApi {
  const api = useContext(SmoothScrollContext);
  return (
    api ?? {
      stop: () => {},
      start: () => {},
      scrollTo: nativeScrollTo,
    }
  );
}

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  /* Whether scrolling should be stopped, independent of Lenis existing yet.
   * Effects run children-first, so the age gate asks for a stop before this
   * component has created Lenis; without remembering that request, the page
   * scrolled freely behind the gate on every first load. */
  const stoppedRef = useRef(false);

  useEffect(() => {
    // Anyone who has asked the OS to reduce motion gets plain native scrolling.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const lenis = new Lenis({
      // A long, weighted glide. Higher duration reads as heavier and more
      // deliberate, which is the point on a luxury site.
      duration: 1.15,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      gestureOrientation: "vertical",
      // Touch devices already have native momentum; hijacking it feels worse
      // than leaving it alone.
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.6,
    });

    lenisRef.current = lenis;
    if (stoppedRef.current) lenis.stop();

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = window.requestAnimationFrame(raf);
    };
    frame = window.requestAnimationFrame(raf);

    return () => {
      window.cancelAnimationFrame(frame);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const api = useMemo<SmoothScrollApi>(
    () => ({
      stop: () => {
        stoppedRef.current = true;
        lenisRef.current?.stop();
      },
      start: () => {
        stoppedRef.current = false;
        lenisRef.current?.start();
      },
      scrollTo: (target, options) => {
        const lenis = lenisRef.current;
        if (lenis) {
          lenis.scrollTo(
            target,
            options?.immediate
              ? { offset: options.offset ?? 0, immediate: true, force: true }
              : {
                  offset: options?.offset ?? 0,
                  duration: options?.duration ?? 1.6,
                  easing: easeInOutCubic,
                },
          );
          return;
        }
        nativeScrollTo(target, options);
      },
    }),
    // No dependencies: every method reads lenisRef at call time, so this API
    // stays correct from before the instance exists through to after teardown.
    [],
  );

  return <SmoothScrollContext.Provider value={api}>{children}</SmoothScrollContext.Provider>;
}
