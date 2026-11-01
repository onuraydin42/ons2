"use client";

import Image from "next/image";
import { useReducedMotion, type MotionValue } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { BOTTLE, bottleAsset } from "@/lib/bottle";

/**
 * The bottle, turning on its plinth — with no studio around it.
 *
 * scripts/build-bottle.mjs rebuilds one revolution of the turntable film as two
 * layers: the plinth, which never moves, as a single still, and the bottle as
 * one transparent WebP per film frame, played on a canvas above it. It turns on
 * its own at the film's speed, and scrolling turns it further: the position is
 * (idle time + scroll progress), so the bottle answers the page as the visitor
 * moves through the opening.
 *
 * Every frame is shown whole, never blended with its neighbour: a blend is a
 * double image of two angles, which is exactly what softens a slow turn. The
 * canvas is kept at the element's size in device pixels, so a frame is scaled
 * once, well, and the compositor has nothing left to resample.
 *
 * Until the first frame is on the canvas (and for anyone who prefers reduced
 * motion, or has asked the browser to save data) a still stands in as an
 * ordinary image, so the opening is never empty.
 */

/** Every placement shares the crop's shape: 520 x 1240 at source. */
export const BOTTLE_ASPECT = BOTTLE.aspect;

type FrameSet = keyof typeof BOTTLE.sets;

const PLINTH = bottleAsset("1240/plinth.webp");
const POSTER = bottleAsset("1240/000.webp");

/* What the browser will say about the connection and the device. Safari says
 * nothing, and is then taken to be able to carry the full set. */
const connection = () =>
  (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
const deviceMemory = () => (navigator as Navigator & { deviceMemory?: number }).deviceMemory;

/** Megabytes of frames would be no kindness here: the still is the better answer. */
const keepStill = () => {
  const link = connection();
  return Boolean(link?.saveData) || link?.effectiveType === "slow-2g" || link?.effectiveType === "2g";
};

/* A big phone's screen shows more pixels than a laptop's, so its size is no
 * reason to send it fewer. The small set, half the frames at a little over half
 * the size, is for placements too small to tell, and for a device or connection
 * that would struggle to carry the full one. */
const frameSet = (thumbnail: boolean): FrameSet =>
  thumbnail || connection()?.effectiveType === "3g" || (deviceMemory() ?? 8) <= 2 ? "720" : "1240";
const frameUrl = (set: FrameSet, index: number) =>
  bottleAsset(`${set}/${String(index).padStart(3, "0")}.webp`);

/** The film's own speed: a new frame every other refresh on a 60Hz screen. */
const IDLE_SECONDS_PER_TURN = BOTTLE.sets["1240"].frames / 30;
/** Revolutions added over the whole scroll range of the opening. */
const SCROLL_TURNS = 1;
/** How many frames download at once. */
const CONCURRENCY = 8;

/** 0, 309, 154, 463, … — a coarse revolution first, then the gaps filled. */
function loadOrder(count: number): number[] {
  const order: number[] = [];
  const seen = new Set<number>();
  for (let step = count; step >= 1; step = Math.floor(step / 2)) {
    for (let i = 0; i < count; i += step) {
      if (!seen.has(i)) {
        seen.add(i);
        order.push(i);
      }
    }
    if (step === 1) break;
  }
  return order;
}

/* The frames outlive any one bottle, so coming back to a page finds them ready.
 * Images rather than decoded bitmaps: the browser may drop an image's decoded
 * pixels under memory pressure and decode it again, which it can never do for
 * a bitmap — and six hundred bitmaps is most of a gigabyte. */
type Store = {
  set: FrameSet;
  frames: (HTMLImageElement | null)[];
  queue: number[];
  fetching: number;
  /** Mounted bottles that want these frames; at zero the downloads stop. */
  users: number;
  /** Frames already sent to the back of the queue once. */
  retried: Set<number>;
};

const stores = new Map<FrameSet, Store>();

function storeFor(set: FrameSet): Store {
  let store = stores.get(set);
  if (!store) {
    const count = BOTTLE.sets[set].frames;
    store = { set, frames: Array(count).fill(null), queue: loadOrder(count), fetching: 0, users: 0, retried: new Set() };
    stores.set(set, store);
  }
  return store;
}

/* Decoding ahead keeps the turn smooth, but a refusal says nothing about the
 * file: Safari can decline under memory pressure and still draw it when asked. */
const whenReady = (image: HTMLImageElement) =>
  image.decode().catch(
    () =>
      new Promise<void>((resolve, reject) => {
        const settle = () => (image.naturalWidth ? resolve() : reject());
        if (image.complete) settle();
        else {
          image.onload = settle;
          image.onerror = reject;
        }
      }),
  );

function pump(store: Store) {
  while (store.users > 0 && store.fetching < CONCURRENCY && store.queue.length) {
    const index = store.queue.shift()!;
    const image = new window.Image();
    image.decoding = "async";
    image.src = frameUrl(store.set, index);
    store.fetching++;
    whenReady(image)
      .then(() => {
        store.frames[index] = image;
      })
      .catch(() => {
        // A phone's signal drops and comes back, so a frame gets a second try;
        // after that it simply leaves its neighbours to cover it.
        if (!store.retried.has(index)) {
          store.retried.add(index);
          store.queue.push(index);
        }
      })
      .finally(() => {
        store.fetching--;
        pump(store);
      });
  }
}

export default function BottleSpin({
  progress,
  active,
  alt,
  priority = false,
  thumbnail = false,
  sizes = "(min-width: 1024px) 30vw, 60vw",
  className = "",
}: {
  /** Scroll progress through the section it turns with, 0 to 1. */
  progress: MotionValue<number>;
  /** Hold on the first frame until the visitor is through the gate. */
  active: boolean;
  alt: string;
  /** The opening's bottle is the first thing on screen: fetch it first. */
  priority?: boolean;
  /** Small enough on screen that the small frame set shows all there is to see. */
  thumbnail?: boolean;
  sizes?: string;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawn, setDrawn] = useState(false);

  const activeRef = useRef(active);
  activeRef.current = active;

  /* The draw loop runs only while the bottle is on screen and the tab is
   * visible; idle time accrues only while it runs, so the bottle never jumps
   * ahead when the visitor comes back to it. */
  useEffect(() => {
    if (reduceMotion || keepStill()) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const store = storeFor(frameSet(thumbnail));
    const count = store.frames.length;

    let holding = false;
    const fetchFrames = () => {
      if (holding) return;
      holding = true;
      store.users++;
      pump(store);
    };

    let shown: HTMLImageElement | null = null;
    const draw = (image: HTMLImageElement) => {
      if (!shown) setDrawn(true);
      shown = image;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.imageSmoothingQuality = "high";
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
    };

    let visible = true;
    let frame = 0;
    let last = performance.now();
    let idle = 0;

    const paint = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      if (activeRef.current) idle += dt / IDLE_SECONDS_PER_TURN;

      const turns = idle + progress.get() * SCROLL_TURNS;
      const index = Math.floor(((turns % 1) + 1) % 1 * count) % count;

      // While frames are still arriving, the closest one behind stands in.
      let image: HTMLImageElement | null = null;
      for (let step = 0; step < count && !image; step++) {
        image = store.frames[(index - step + count) % count];
      }
      // Repaint only when what would be drawn has changed.
      if (image && image !== shown) draw(image);

      frame = visible ? window.requestAnimationFrame(paint) : 0;
    };

    const resume = () => {
      if (frame || !visible || document.visibilityState !== "visible") return;
      last = performance.now();
      frame = window.requestAnimationFrame(paint);
    };
    const pause = () => {
      window.cancelAnimationFrame(frame);
      frame = 0;
    };

    /* The backing store tracks the element in device pixels — exactly, where
     * the browser can report them, since at a fractional scale (125%, 150%)
     * rounding the CSS size by hand lands a pixel off and blurs the whole frame. */
    const sizer = new ResizeObserver(([entry]) => {
      const scale = window.devicePixelRatio || 1;
      const device = entry.devicePixelContentBoxSize?.[0];
      let width = Math.round(entry.contentRect.width * scale);
      let height = Math.round(entry.contentRect.height * scale);
      // Exact where it agrees with the arithmetic; a report far from it (under
      // phone emulation, say) is not describing these pixels.
      if (device && Math.abs(device.inlineSize - width) <= 2 && Math.abs(device.blockSize - height) <= 2) {
        width = device.inlineSize;
        height = device.blockSize;
      }
      if (!width || !height || (canvas.width === width && canvas.height === height)) return;
      canvas.width = width;
      canvas.height = height;
      // Resizing wipes a canvas; put the frame straight back.
      if (shown) draw(shown);
    });
    try {
      sizer.observe(canvas, { box: "device-pixel-content-box" });
    } catch {
      sizer.observe(canvas); // Safari has no device-pixel box to observe.
    }

    /* Fetching waits until the bottle is near the screen, unless it is the one
     * in the opening: that one uses the time behind the age gate. */
    if (priority) fetchFrames();
    const watcher = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) {
          fetchFrames();
          resume();
        } else {
          pause();
        }
      },
      { rootMargin: "50% 0px" },
    );
    watcher.observe(container);

    const onVisibility = () => (document.visibilityState === "visible" ? resume() : pause());
    document.addEventListener("visibilitychange", onVisibility);
    resume();

    return () => {
      pause();
      sizer.disconnect();
      watcher.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      if (holding) store.users--;
    };
  }, [progress, reduceMotion, priority, thumbnail]);

  const { box } = BOTTLE;

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{ aspectRatio: `${BOTTLE.aspect}` }}
    >
      <Image src={PLINTH} alt="" fill priority={priority} sizes={sizes} className="object-contain" />
      <div
        className="absolute"
        style={{
          left: `${box.left * 100}%`,
          top: `${box.top * 100}%`,
          width: `${box.width * 100}%`,
          height: `${box.height * 100}%`,
        }}
      >
        <Image
          src={POSTER}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className={`object-contain ${drawn ? "opacity-0" : "opacity-100"}`}
        />
        <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />
      </div>
    </div>
  );
}
