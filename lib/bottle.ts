/**
 * Written by scripts/build-bottle.mjs — do not edit by hand.
 *
 * The bottle's frames are cropped to where it ever reaches; `box` places them
 * inside the full crop (as fractions of it), the shape the plinth image fills.
 */
export const BOTTLE = {
  /** Width / height of the full crop. */
  aspect: 0.41935483870967744,
  box: {
    left: 0.13653846153846153,
    top: 0.016935483870967744,
    width: 0.7038461538461539,
    height: 0.7967741935483871,
  },
  sets: {
    "720": {
      "frames": 309,
      "width": 213,
      "height": 574
    },
    "1240": {
      "frames": 618,
      "width": 366,
      "height": 988
    }
  },
} as const;

/** New with every build: the files are cached as immutable. */
export const BOTTLE_VERSION = "mvy7t25p";

export const bottleAsset = (path: string) => `/media/bottle/${path}?v=${BOTTLE_VERSION}`;
