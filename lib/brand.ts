/**
 * The transparent brand assets, written by scripts/prepare-assets.mjs.
 *
 * Two renditions of the same mark:
 *   logo.png       full lockup — monogram over the "FLUID OUNCE" wordmark.
 *                  Used where it is shown large enough to read (age gate,
 *                  footer).
 *   logo-mark.png  monogram only. Below roughly 60px tall the wordmark inside
 *                  the full lockup collapses into a smudge, so small
 *                  placements (navbar, order portal, favicon) use this.
 *
 * Intrinsic dimensions live here so every placement scales from one source
 * instead of guessing an aspect ratio; the prepare-assets script rewrites them
 * whenever the source logo changes.
 */
export const LOGO_SRC = "/logo.png";
export const LOGO_WIDTH = 279;
export const LOGO_HEIGHT = 608;

export const MARK_SRC = "/logo-mark.png";
export const MARK_WIDTH = 279;
export const MARK_HEIGHT = 535;

/** Shared easing — a slow, weighted settle rather than a bounce. */
export const EASE_LUX = [0.16, 1, 0.3, 1] as const;
