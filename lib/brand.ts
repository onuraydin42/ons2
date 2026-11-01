/**
 * The transparent brand assets, written by scripts/prepare-assets.mjs.
 *
 * Two renditions of the same mark:
 *   logo.png       full lockup — monogram over the "FLUID OUNCE" wordmark.
 *                  Used where it is shown large enough to read (footer).
 *   logo-mark.png  monogram only. Below roughly 60px tall the wordmark inside
 *                  the full lockup collapses into a smudge, so small
 *                  placements (navbar, age gate, order portal, favicon) use
 *                  this, beside the name set in type.
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

/**
 * The monogram again, in ink and a little heavier, at the same shape. The foil
 * all but disappears on the stone grounds, so it is kept for the ivory card and
 * the dark footer; everywhere else the mark stands on the page, it is this one.
 */
export const MARK_INK_SRC = "/logo-mark-ink.png";

/** Shared easing — a slow, weighted settle rather than a bounce. */
export const EASE_LUX = [0.16, 1, 0.3, 1] as const;
