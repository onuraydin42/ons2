/**
 * FLUID OUNCE — the turning bottle, without its studio.
 *
 * Run with: npm run build-bottle   (needs ffmpeg — see below)
 *
 * The source film (images2/rotate.mp4) shows the bottle turning on its plinth
 * in front of a grey studio sweep; a low-bitrate phone video. The site wants
 * the bottle and the plinth only, standing on the page itself. This script:
 *
 *  1. Denoises the film once (temporal, then non-local means) and caches it.
 *  2. Recovers the empty studio as a clean plate. Camera, backdrop and plinth
 *     never move, so the backdrop is the temporal median of the film wherever
 *     the subject is not — and, around the bottle, the value each pixel keeps
 *     returning to whenever the turning bottle uncovers it. The light the
 *     turning bottle throws on the backdrop is measured frame by frame too.
 *  3. Relights every frame onto the stage colour, with no thresholds. Each
 *     pixel keeps its difference from the plate, so a pixel showing plain
 *     backdrop lands exactly on the stage colour, and every faint glass edge
 *     and refraction survives. This is what makes the clear cap read as clear
 *     glass: there is no alpha key in it to go patchy.
 *  4. Cuts the outline geometrically. The cap and the body are convex solids,
 *     so their silhouettes are convex polygons: each frame's hull is measured,
 *     then its support function is smoothed over time. The outlines come out
 *     as straight, anti-aliased, sub-pixel lines that do not crawl as the
 *     bottle turns, however noisy the film underneath.
 *  5. Builds the plinth once. It never moves, so it is the median of the whole
 *     film — free of compression noise, identical in every frame — and it
 *     ships as one image under the frames.
 *  6. Takes the camera's focus hunting back out. The picture goes soft and comes
 *     back every second or so; the plinth's logo never moves, so it measures by
 *     how much, and each frame is deblurred by that amount. Without this the
 *     bottle visibly pulses in and out of focus as it turns.
 *  7. Sharpens, and writes the revolution as WebP frames at two sizes, played
 *     by components/BottleSpin.tsx.
 *
 * Frames rather than a film: a video's decoded colour never exactly matches
 * the page's CSS colour (and differs by browser), so a film always shows as a
 * faint box. Transparent frames have no box at all.
 *
 * Outputs:
 *   public/media/bottle/<size>/000.webp …   one revolution, bottle only
 *   public/media/bottle/<size>/plinth.webp  the plinth (full crop)
 *   lib/bottle.ts                           frame count and layout, generated
 *
 * ffmpeg is not a project dependency (it is ~80 MB). Point FFMPEG_PATH at a
 * binary, or install one for the run with: npm i --no-save ffmpeg-static
 *
 * BOTTLE_DEBUG=476,545 renders just those film frames, on the stage, into
 * node_modules/.cache/fluid-bottle/debug/ — for judging a change quickly.
 */

import { spawn } from "node:child_process";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = path.join(ROOT, "images2", "rotate.mp4");
const OUT = path.join(ROOT, "public", "media", "bottle");
const CACHE = path.join(ROOT, "node_modules", ".cache", "fluid-bottle");
const LIB = path.join(ROOT, "lib", "bottle.ts");

/* The opening's stage, and the page behind every bottle. Must match the
 * `linen` colour in tailwind.config.ts: the glass is relit onto it. */
const STAGE = process.env.BOTTLE_STAGE ?? "#9F937F";

/* The film speeds up before and after this stretch; within it the turntable
 * runs at a steady 618 frames (20.6 s) per revolution, and frame 476 has the
 * label square to the camera. */
const LOOP_START = 476;
const LOOP_LENGTH = 618;
/* Frames decoded ahead of the loop, so the temporal filter has settled. */
const LEAD_IN = 45;

const DENOISE = "hqdn3d=0:0:6:8,nlmeans=s=1.8:p=5:pc=3:r=11:rc=7";

/* The full crop: the bottle, the plinth and a margin. Everything below is in
 * crop coordinates; the film's are these plus (CROP.x, CROP.y). */
const CROP = { x: 120, y: 40, w: 520, h: 1240 };
const CW = CROP.w;
const CH = CROP.h;
const CROP_BYTES = CW * CH * 3;

/* Frame sets: the crop's height in pixels, and how many frames of the
 * revolution each carries. Phones get every other frame, smaller. There is no
 * middle size: a resized set carries more detail per pixel than the source, so
 * it came out larger on disk than the 1240 set it was meant to save on. */
const SETS = [
  { size: 1240, frames: 618 },
  { size: 720, frames: 309 },
];

/* Regions of the crop. The cap and body overlap at the waist on purpose. */
const CAP_TOP = 15;
const CAP_BOTTOM = 176;
const BODY_TOP = 172;
const BODY_BOTTOM = 1006;
/* The plinth's top edge: above it the bottle stands against the backdrop,
 * below it against the plinth's own black. */
const PLINTH_TOP = 868;

/* The chamfered glass over the plinth is found by brightness alone. */
const BASE_LUMA = 110;
const CAP_THRESHOLD = 7;
const BODY_THRESHOLD = 12;

/* Unsharp mask on luminance, with coring so smooth glass stays smooth. */
const SHARPEN_SIGMA = 1.2;
const SHARPEN_AMOUNT = 0.8;
const SHARPEN_CORE = 2.4;
const DESPECKLE_RANGE = 34;

/* Taking the camera's focus hunting back out: see measureFocus. */
const FOCUS_SIGMA_STEP = 0.2;
const FOCUS_SIGMA_MAX = 3;
const REFOCUS_MIN_SIGMA = 0.3;
const REFOCUS_ITERATIONS = 3;
const REFOCUS_CORE = 0.6;
const REFOCUS_OVERSHOOT = 6;

/* The plinth's lit logo, in crop coordinates: blurred by the film into blobs,
 * it is redrawn crisp from its own shape. */
const PLINTH_LOGO = { left: 124, top: 1024, width: 268, height: 170 };
const LOGO_LEVEL = 205;
const LOGO_SOFTNESS = 30;

const WEBP = { quality: 84, alphaQuality: 100, effort: 6, smartSubsample: true };

const log = (...a) => console.log(...a);

const luma = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;

const hexToRgb = (hex) => {
  const v = parseInt(hex.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
};

const stage = hexToRgb(STAGE);
const stageLuma = luma(...stage);

/* Every silhouette the turning bottle can take, plus margin. */
function inBottleZone(x, y) {
  if (y < CAP_TOP - 8 || y > PLINTH_TOP + 4) return false;
  // Square in section, the bottle is widest turned 45° to the camera.
  const half = 86 + ((y - 20) / (865 - 20)) * (142 - 86);
  return Math.abs(x - 252) <= half + 42;
}

const inPlinthZone = (x, y) => x >= 16 && x <= 504 && y >= PLINTH_TOP && y <= 1212;

/* ------------------------------------------------------------- ffmpeg */

function resolveFfmpeg() {
  if (process.env.FFMPEG_PATH) return process.env.FFMPEG_PATH;
  try {
    return createRequire(import.meta.url)("ffmpeg-static");
  } catch {
    throw new Error("ffmpeg not found. Set FFMPEG_PATH, or run: npm i --no-save ffmpeg-static");
  }
}

/* ---------------------------------------------------- denoised film cache */

const rawPath = path.join(CACHE, "denoised.raw");

/** Decodes and denoises the loop once; later runs read it straight back. */
async function ensureDenoised() {
  const stamp = path.join(CACHE, "denoised.json");
  const want = JSON.stringify({ DENOISE, LOOP_START, LOOP_LENGTH, LEAD_IN, CROP });
  if (fs.existsSync(rawPath) && fs.existsSync(stamp) && fs.readFileSync(stamp, "utf8") === want) {
    log("[film]   using cached denoised film");
    return;
  }
  await fsp.mkdir(CACHE, { recursive: true });
  log("[film]   denoising (a minute or two)…");
  const first = LOOP_START - LEAD_IN;
  const last = LOOP_START + LOOP_LENGTH;
  const out = fs.createWriteStream(rawPath);
  const written = new Promise((resolve, reject) => {
    out.on("close", resolve);
    out.on("error", reject);
  });
  await new Promise((resolve, reject) => {
    const proc = spawn(resolveFfmpeg(), [
      "-v", "error", "-i", SOURCE,
      "-vf",
      `trim=start_frame=${first}:end_frame=${last},setpts=PTS-STARTPTS,crop=${CW}:${CH}:${CROP.x}:${CROP.y},${DENOISE}`,
      "-vsync", "0", "-f", "rawvideo", "-pix_fmt", "rgb24", "pipe:1",
    ]);
    proc.stdout.pipe(out);
    proc.stderr.on("data", (d) => process.stderr.write(d));
    proc.on("error", reject);
    proc.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`))));
  });
  await written;
  fs.writeFileSync(stamp, want);
}

let rawFd = null;

/** Film frame n of the loop (0-based), wrapping round the revolution. */
function readFrame(n, target = Buffer.alloc(CROP_BYTES)) {
  if (rawFd === null) rawFd = fs.openSync(rawPath, "r");
  const k = ((n % LOOP_LENGTH) + LOOP_LENGTH) % LOOP_LENGTH;
  fs.readSync(rawFd, target, 0, CROP_BYTES, (LEAD_IN + k) * CROP_BYTES);
  return target;
}

/* --------------------------------------------------------------- plate */

/** Fills every pixel not marked `known` with a smooth (harmonic) surface. */
function harmonicFill(plate, known) {
  // Relaxed at quarter resolution — the backdrop is a soft sweep — then
  // upsampled into the unknown pixels only.
  const S = 4;
  const w = Math.floor(CW / S);
  const h = Math.floor(CH / S);
  const small = new Float32Array(w * h * 3);
  const fixed = new Uint8Array(w * h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let n = 0;
      const acc = [0, 0, 0];
      for (let dy = 0; dy < S; dy++) {
        for (let dx = 0; dx < S; dx++) {
          const p = (y * S + dy) * CW + (x * S + dx);
          if (!known[p]) continue;
          n++;
          for (let c = 0; c < 3; c++) acc[c] += plate[p * 3 + c];
        }
      }
      const q = y * w + x;
      if (n >= (S * S) / 2) {
        fixed[q] = 1;
        for (let c = 0; c < 3; c++) small[q * 3 + c] = acc[c] / n;
      }
    }
  }

  const mean = [0, 0, 0];
  let nk = 0;
  for (let q = 0; q < w * h; q++) {
    if (!fixed[q]) continue;
    nk++;
    for (let c = 0; c < 3; c++) mean[c] += small[q * 3 + c];
  }
  for (let q = 0; q < w * h; q++) {
    if (!fixed[q]) for (let c = 0; c < 3; c++) small[q * 3 + c] = mean[c] / nk;
  }

  for (let iter = 0; iter < 5000; iter++) {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const q = y * w + x;
        if (fixed[q]) continue;
        for (let c = 0; c < 3; c++) {
          let s = 0;
          let n = 0;
          if (x > 0) { s += small[(q - 1) * 3 + c]; n++; }
          if (x < w - 1) { s += small[(q + 1) * 3 + c]; n++; }
          if (y > 0) { s += small[(q - w) * 3 + c]; n++; }
          if (y < h - 1) { s += small[(q + w) * 3 + c]; n++; }
          small[q * 3 + c] = s / n;
        }
      }
    }
  }

  for (let y = 0; y < CH; y++) {
    for (let x = 0; x < CW; x++) {
      const p = y * CW + x;
      if (known[p]) continue;
      const fx = Math.min(Math.max((x + 0.5) / S - 0.5, 0), w - 1);
      const fy = Math.min(Math.max((y + 0.5) / S - 0.5, 0), h - 1);
      const x0 = Math.floor(fx);
      const y0 = Math.floor(fy);
      const x1 = Math.min(x0 + 1, w - 1);
      const y1 = Math.min(y0 + 1, h - 1);
      const tx = fx - x0;
      const ty = fy - y0;
      for (let c = 0; c < 3; c++) {
        const a = small[(y0 * w + x0) * 3 + c];
        const b = small[(y0 * w + x1) * 3 + c];
        const d = small[(y1 * w + x0) * 3 + c];
        const e = small[(y1 * w + x1) * 3 + c];
        plate[p * 3 + c] = (a * (1 - tx) + b * tx) * (1 - ty) + (d * (1 - tx) + e * tx) * ty;
      }
    }
  }
}

/* ---------------------------------------------------- the backdrop's drift */

/*
 * The backdrop is not quite static: as the bottle turns it throws light onto
 * the sweep, and the whole backdrop swells and falls by some eight levels,
 * every quarter turn. Left in, clear glass pulses against the page and the
 * outline measurements wander. So each frame's departure from the plate is
 * fitted, on pure backdrop, with a smooth quadratic surface.
 */
const DRIFT_TERMS = 6;
const driftBasis = (x, y) => {
  const X = x / CW - 0.5;
  const Y = y / CH - 0.5;
  return [1, X, Y, X * X, Y * Y, X * Y];
};

function solve(matrix, vector) {
  const n = vector.length;
  const a = matrix.map((row, i) => [...row, vector[i]]);
  for (let i = 0; i < n; i++) {
    let pivot = i;
    for (let r = i + 1; r < n; r++) if (Math.abs(a[r][i]) > Math.abs(a[pivot][i])) pivot = r;
    [a[i], a[pivot]] = [a[pivot], a[i]];
    for (let r = i + 1; r < n; r++) {
      const f = a[r][i] / a[i][i];
      for (let c = i; c <= n; c++) a[r][c] -= f * a[i][c];
    }
  }
  const out = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let v = a[i][n];
    for (let c = i + 1; c < n; c++) v -= a[i][c] * out[c];
    out[i] = v / a[i][i];
  }
  return out;
}

/** The drift's coefficients for one frame: one set per colour channel. */
function fitDrift(frame, plate, known) {
  const coefficients = [];
  for (let c = 0; c < 3; c++) {
    const ata = Array.from({ length: DRIFT_TERMS }, () => new Array(DRIFT_TERMS).fill(0));
    const atb = new Array(DRIFT_TERMS).fill(0);
    for (let y = 0; y < CH; y += 4) {
      for (let x = 0; x < CW; x += 4) {
        const p = y * CW + x;
        if (!known[p]) continue;
        const diff = frame[p * 3 + c] - plate[p * 3 + c];
        if (Math.abs(diff) > 24) continue;
        const basis = driftBasis(x, y);
        for (let i = 0; i < DRIFT_TERMS; i++) {
          atb[i] += basis[i] * diff;
          for (let j = 0; j < DRIFT_TERMS; j++) ata[i][j] += basis[i] * basis[j];
        }
      }
    }
    coefficients.push(solve(ata, atb));
  }
  return coefficients;
}

/** The drift's value at every pixel, as an RGB field. */
function driftField(coefficients) {
  const field = new Float32Array(CW * CH * 3);
  for (let y = 0; y < CH; y++) {
    const Y = y / CH - 0.5;
    for (let x = 0; x < CW; x++) {
      const X = x / CW - 0.5;
      const p = y * CW + x;
      for (let c = 0; c < 3; c++) {
        const k = coefficients[c];
        field[p * 3 + c] = k[0] + k[1] * X + k[2] * Y + k[3] * X * X + k[4] * Y * Y + k[5] * X * Y;
      }
    }
  }
  return field;
}

/** Every frame's drift, softened over ±3 frames round the revolution. */
function measureDrift(plate, known) {
  const buffer = Buffer.alloc(CROP_BYTES);
  const raw = [];
  for (let n = 0; n < LOOP_LENGTH; n++) raw.push(fitDrift(readFrame(n, buffer), plate, known));
  const smooth = [];
  for (let n = 0; n < LOOP_LENGTH; n++) {
    const coefficients = [];
    for (let c = 0; c < 3; c++) {
      const k = new Array(DRIFT_TERMS).fill(0);
      for (let j = -3; j <= 3; j++) {
        const other = raw[(n + j + LOOP_LENGTH) % LOOP_LENGTH][c];
        for (let i = 0; i < DRIFT_TERMS; i++) k[i] += other[i] / 7;
      }
      coefficients.push(k);
    }
    smooth.push(coefficients);
  }
  let lo = Infinity;
  let hi = -Infinity;
  for (const f of smooth) {
    if (f[1][0] < lo) lo = f[1][0];
    if (f[1][0] > hi) hi = f[1][0];
  }
  log(`[drift]  backdrop swells ${lo.toFixed(1)} … ${hi.toFixed(1)} levels through the turn`);
  return smooth;
}

/**
 * The empty studio. Away from the subject it is the temporal median. Around
 * the bottle a pixel's samples are a mix of bottle (which keeps changing) and
 * backdrop (which does not), so the backdrop is the tightest cluster of
 * samples — provided it is plausibly backdrop rather than, say, frosted glass
 * that happens to hold steady. The samples are taken with their drift removed.
 */
function buildPlate() {
  const STEP = 6;
  const count = Math.floor(LOOP_LENGTH / STEP);
  const samples = [];
  for (let k = 0; k < count; k++) samples.push(readFrame(k * STEP));

  const plate = new Float32Array(CW * CH * 3);
  const known = new Uint8Array(CW * CH);
  const values = new Float32Array(count);

  const median = () => {
    for (let y = 0; y < CH; y++) {
      for (let x = 0; x < CW; x++) {
        if (inBottleZone(x, y) || inPlinthZone(x, y)) continue;
        const p = y * CW + x;
        known[p] = 1;
        for (let c = 0; c < 3; c++) {
          for (let s = 0; s < count; s++) values[s] = samples[s][p * 3 + c];
          values.sort();
          plate[p * 3 + c] = values[count >> 1];
        }
      }
    }
  };
  median();

  // Take each sample's drift out, in place, then take the median again.
  // The plinth is built from these samples too; a few levels either way on
  // its near-black disappear in its own median.
  for (const sample of samples) {
    const field = driftField(fitDrift(sample, plate, known));
    for (let i = 0; i < CROP_BYTES; i++) {
      sample[i] = Math.round(Math.min(Math.max(sample[i] - field[i], 0), 255));
    }
  }
  median();
  harmonicFill(plate, known);

  const refined = known.slice();
  const lumas = new Float32Array(count);
  let recovered = 0;
  for (let y = 0; y < CH; y++) {
    for (let x = 0; x < CW; x++) {
      const p = y * CW + x;
      if (known[p] || !inBottleZone(x, y)) continue;
      for (let s = 0; s < count; s++) {
        lumas[s] = luma(samples[s][p * 3], samples[s][p * 3 + 1], samples[s][p * 3 + 2]);
      }
      const sorted = Float32Array.from(lumas).sort();
      // The narrowest window holding at least 8% of the samples.
      const need = Math.max(6, Math.round(count * 0.08));
      let best = -1;
      let bestWidth = Infinity;
      const guess = luma(plate[p * 3], plate[p * 3 + 1], plate[p * 3 + 2]);
      for (let i = 0; i + need <= count; i++) {
        const width = sorted[i + need - 1] - sorted[i];
        const centre = (sorted[i + need - 1] + sorted[i]) / 2;
        if (width < bestWidth && Math.abs(centre - guess) <= 26) {
          bestWidth = width;
          best = centre;
        }
      }
      if (best < 0 || bestWidth > 7) continue;
      const acc = [0, 0, 0];
      let n = 0;
      for (let s = 0; s < count; s++) {
        if (Math.abs(lumas[s] - best) > 5) continue;
        n++;
        for (let c = 0; c < 3; c++) acc[c] += samples[s][p * 3 + c];
      }
      if (!n) continue;
      for (let c = 0; c < 3; c++) plate[p * 3 + c] = acc[c] / n;
      refined[p] = 1;
      recovered++;
    }
  }
  harmonicFill(plate, refined);

  // The studio sweep is soft, so around the bottle the plate may as well be
  // too. Pixel-to-pixel disagreement between recovered samples would otherwise
  // come through the relight as a dotted line beside the glass.
  const channels = [0, 1, 2].map((c) => {
    const channel = new Float32Array(CW * CH);
    for (let p = 0; p < CW * CH; p++) channel[p] = plate[p * 3 + c];
    return gaussianBlur(medianFilter(channel, 3), 4);
  });
  for (let y = 0; y < CH; y++) {
    for (let x = 0; x < CW; x++) {
      if (!inBottleZone(x, y)) continue;
      const p = y * CW + x;
      for (let c = 0; c < 3; c++) plate[p * 3 + c] = channels[c][p];
    }
  }

  log(`[plate]  ${count} samples, ${recovered} backdrop pixels recovered around the bottle`);
  return { plate, samples, known };
}

/** A square median of the given radius, over the bottle's zone only. */
function medianFilter(src, radius) {
  const out = Float32Array.from(src);
  const win = new Float32Array((radius * 2 + 1) ** 2);
  for (let y = radius; y < CH - radius; y++) {
    for (let x = radius; x < CW - radius; x++) {
      if (!inBottleZone(x, y)) continue;
      let k = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) win[k++] = src[(y + dy) * CW + x + dx];
      }
      win.sort();
      out[y * CW + x] = win[win.length >> 1];
    }
  }
  return out;
}

/* ------------------------------------------------------------ silhouette */

/* Directions of the support function. Dense: over an 800px edge, half a
 * step of error is a third of a pixel. */
const DIRECTIONS = 3600;
const COS = new Float64Array(DIRECTIONS);
const SIN = new Float64Array(DIRECTIONS);
for (let i = 0; i < DIRECTIONS; i++) {
  COS[i] = Math.cos((i / DIRECTIONS) * 2 * Math.PI);
  SIN[i] = Math.sin((i / DIRECTIONS) * 2 * Math.PI);
}

/** Andrew's monotone chain over integer points. */
function convexHull(points) {
  const pts = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (pts.length < 3) return pts;
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

/**
 * The support function of the mask's solid pixels. Blobs too small to be
 * glass — a speck of dust, a compression artefact — are dropped first; only
 * each row's outermost pixels can be on the hull, so only those are kept.
 */
function supportOf(mask, top, bottom, minArea) {
  const seen = new Uint8Array(CW * CH);
  const stack = [];
  const keep = [];
  for (let y = top; y < bottom; y++) {
    for (let x = 0; x < CW; x++) {
      const start = y * CW + x;
      if (!mask[start] || seen[start]) continue;
      const blob = [];
      seen[start] = 1;
      stack.push(start);
      while (stack.length) {
        const i = stack.pop();
        blob.push(i);
        const px = i % CW;
        const py = (i - px) / CW;
        for (const [nx, ny] of [[px - 1, py], [px + 1, py], [px, py - 1], [px, py + 1]]) {
          if (nx < 0 || nx >= CW || ny < top || ny >= bottom) continue;
          const n = ny * CW + nx;
          if (mask[n] && !seen[n]) {
            seen[n] = 1;
            stack.push(n);
          }
        }
      }
      if (blob.length >= minArea) for (const i of blob) keep.push(i);
    }
  }

  const rows = new Map();
  for (const i of keep) {
    const x = i % CW;
    const y = (i - x) / CW;
    const row = rows.get(y);
    if (!row) rows.set(y, [x, x]);
    else {
      if (x < row[0]) row[0] = x;
      if (x > row[1]) row[1] = x;
    }
  }
  const points = [];
  for (const [y, [a, b]] of rows) {
    // Pixel extents, so the hull bounds the pixels rather than their centres.
    points.push([a, y], [a, y + 1], [b + 1, y], [b + 1, y + 1]);
  }
  const hull = convexHull(points);

  const support = new Float32Array(DIRECTIONS);
  for (let k = 0; k < DIRECTIONS; k++) {
    let max = -Infinity;
    for (const [x, y] of hull) {
      const v = x * COS[k] + y * SIN[k];
      if (v > max) max = v;
    }
    support[k] = max;
  }
  return support;
}

/** Measures the cap's and the body's support functions in one film frame. */
function measureFrame(frame, plate, drift, plinth) {
  const capMask = new Uint8Array(CW * CH);
  const bodyMask = new Uint8Array(CW * CH);
  for (let y = CAP_TOP; y < BODY_BOTTOM; y++) {
    for (let x = 40; x < CW - 40; x++) {
      const p = y * CW + x;
      const overPlinth = plinth.alpha[p] > 0.5;
      if (!overPlinth && !inBottleZone(x, y)) continue;
      const r = frame[p * 3];
      const g = frame[p * 3 + 1];
      const b = frame[p * 3 + 2];
      if (overPlinth) {
        if (luma(r, g, b) > BASE_LUMA) bodyMask[p] = 1;
        continue;
      }
      // Against the backdrop, any departure is glass — except right above the
      // plinth, whose soft dark fringe is not; only brighter counts there.
      if (y >= PLINTH_TOP - 8) {
        const lb =
          luma(plate[p * 3], plate[p * 3 + 1], plate[p * 3 + 2]) +
          luma(drift[p * 3], drift[p * 3 + 1], drift[p * 3 + 2]);
        if (luma(r, g, b) > lb + BODY_THRESHOLD) bodyMask[p] = 1;
        continue;
      }
      const d = Math.max(
        Math.abs(r - plate[p * 3] - drift[p * 3]),
        Math.abs(g - plate[p * 3 + 1] - drift[p * 3 + 1]),
        Math.abs(b - plate[p * 3 + 2] - drift[p * 3 + 2]),
      );
      if (y < CAP_BOTTOM && d > CAP_THRESHOLD) capMask[p] = 1;
      if (y >= BODY_TOP && d > BODY_THRESHOLD) bodyMask[p] = 1;
    }
  }
  return {
    cap: supportOf(capMask, CAP_TOP, CAP_BOTTOM, 24),
    // The body's minimum is large: a hairline of refraction floating off the
    // glass must not stretch its hull outward.
    body: supportOf(bodyMask, BODY_TOP, BODY_BOTTOM, 600),
  };
}

/** Median over ±3 frames, then a soft blur over ±4 — round the revolution. */
function smoothSupports(series) {
  const n = series.length;
  const med = series.map(() => new Float32Array(DIRECTIONS));
  const win = new Float32Array(7);
  for (let t = 0; t < n; t++) {
    for (let k = 0; k < DIRECTIONS; k++) {
      for (let j = -3; j <= 3; j++) win[j + 3] = series[(t + j + n) % n][k];
      win.sort();
      med[t][k] = win[3];
    }
  }
  const weights = [-4, -3, -2, -1, 0, 1, 2, 3, 4].map((j) => Math.exp(-(j * j) / (2 * 2.2 * 2.2)));
  const total = weights.reduce((a, b) => a + b, 0);
  const out = series.map(() => new Float32Array(DIRECTIONS));
  for (let t = 0; t < n; t++) {
    for (let k = 0; k < DIRECTIONS; k++) {
      let v = 0;
      for (let j = -4; j <= 4; j++) v += med[(t + j + n) % n][k] * weights[j + 4];
      out[t][k] = v / total;
    }
  }
  return out;
}

/** The convex polygon a support function describes, grown by `grow` pixels. */
function polygonOf(support, grow) {
  let poly = [[-2000, -2000], [4000, -2000], [4000, 4000], [-2000, 4000]];
  for (let k = 0; k < DIRECTIONS; k++) {
    const h = support[k] + grow;
    const u = COS[k];
    const v = SIN[k];
    let cut = false;
    for (const p of poly) {
      if (p[0] * u + p[1] * v > h + 1e-6) {
        cut = true;
        break;
      }
    }
    if (!cut) continue;
    const next = [];
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i];
      const b = poly[(i + 1) % poly.length];
      const da = a[0] * u + a[1] * v - h;
      const db = b[0] * u + b[1] * v - h;
      if (da <= 0) next.push(a);
      if ((da < 0 && db > 0) || (da > 0 && db < 0)) {
        const t = da / (da - db);
        next.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
      }
    }
    poly = next;
    if (poly.length < 3) break;
  }
  return poly;
}

/** Adds a convex polygon's exact coverage into `alpha` (max-combined). */
function fillPolygon(poly, alpha, w = CW, h = CH) {
  const SUB = 8;
  const row = new Float32Array(w);
  let top = Infinity;
  let bottom = -Infinity;
  for (const p of poly) {
    if (p[1] < top) top = p[1];
    if (p[1] > bottom) bottom = p[1];
  }
  const y0 = Math.max(Math.floor(top), 0);
  const y1 = Math.min(Math.ceil(bottom), h);
  for (let y = y0; y < y1; y++) {
    row.fill(0);
    let touched = false;
    for (let s = 0; s < SUB; s++) {
      const sy = y + (s + 0.5) / SUB;
      let left = Infinity;
      let right = -Infinity;
      for (let i = 0; i < poly.length; i++) {
        const a = poly[i];
        const b = poly[(i + 1) % poly.length];
        if ((a[1] <= sy && b[1] > sy) || (b[1] <= sy && a[1] > sy)) {
          const x = a[0] + ((sy - a[1]) / (b[1] - a[1])) * (b[0] - a[0]);
          if (x < left) left = x;
          if (x > right) right = x;
        }
      }
      if (right <= left) continue;
      touched = true;
      const xa = Math.max(Math.floor(left), 0);
      const xb = Math.min(Math.ceil(right), w);
      for (let x = xa; x < xb; x++) {
        const cover = Math.min(right, x + 1) - Math.max(left, x);
        if (cover > 0) row[x] += cover / SUB;
      }
    }
    if (!touched) continue;
    const base = y * w;
    for (let x = 0; x < w; x++) if (row[x] > alpha[base + x]) alpha[base + x] = Math.min(row[x], 1);
  }
}

/* ------------------------------------------------------------ the image */

/** Separable box dilation of a byte mask (van Herk would be overkill here). */
function dilate(mask, radius) {
  const tmp = new Uint8Array(CW * CH);
  for (let y = 0; y < CH; y++) {
    let last = -Infinity;
    for (let x = 0; x < CW; x++) {
      if (mask[y * CW + x]) last = x;
      if (x - last <= radius) tmp[y * CW + x] = 1;
    }
    last = Infinity;
    for (let x = CW - 1; x >= 0; x--) {
      if (mask[y * CW + x]) last = x;
      if (last - x <= radius) tmp[y * CW + x] = 1;
    }
  }
  const out = new Uint8Array(CW * CH);
  for (let x = 0; x < CW; x++) {
    let last = -Infinity;
    for (let y = 0; y < CH; y++) {
      if (tmp[y * CW + x]) last = y;
      if (y - last <= radius) out[y * CW + x] = 1;
    }
    last = Infinity;
    for (let y = CH - 1; y >= 0; y--) {
      if (tmp[y * CW + x]) last = y;
      if (last - y <= radius) out[y * CW + x] = 1;
    }
  }
  return out;
}

const invert = (mask) => {
  const out = new Uint8Array(mask.length);
  for (let i = 0; i < mask.length; i++) out[i] = mask[i] ? 0 : 1;
  return out;
};

/** Morphological closing: fills strokes up to 2 * radius wide. */
const closeMask = (mask, radius) => invert(dilate(invert(dilate(mask, radius)), radius));

function gaussianBlur(src, sigma) {
  const radius = Math.ceil(sigma * 3);
  const kernel = new Float32Array(radius * 2 + 1);
  let total = 0;
  for (let i = -radius; i <= radius; i++) {
    kernel[i + radius] = Math.exp(-(i * i) / (2 * sigma * sigma));
    total += kernel[i + radius];
  }
  for (let i = 0; i < kernel.length; i++) kernel[i] /= total;
  const tmp = new Float32Array(CW * CH);
  for (let y = 0; y < CH; y++) {
    for (let x = 0; x < CW; x++) {
      let v = 0;
      for (let i = -radius; i <= radius; i++) {
        const xx = Math.min(Math.max(x + i, 0), CW - 1);
        v += src[y * CW + xx] * kernel[i + radius];
      }
      tmp[y * CW + x] = v;
    }
  }
  const out = new Float32Array(CW * CH);
  for (let y = 0; y < CH; y++) {
    for (let x = 0; x < CW; x++) {
      let v = 0;
      for (let i = -radius; i <= radius; i++) {
        const yy = Math.min(Math.max(y + i, 0), CH - 1);
        v += tmp[yy * CW + x] * kernel[i + radius];
      }
      out[y * CW + x] = v;
    }
  }
  return out;
}

/**
 * The frame on the stage, with no thresholds. A pixel's luminance keeps its
 * difference from the plate, scaled so the plate lands on the stage and white
 * stays white; its colour runs from the stage's hue (seen through clear glass)
 * to the film's own, mostly neutral hue (frost, ink, highlights) as it departs
 * from the backdrop. Inside the frosted region the label's grey type is treated
 * as ink rather than as backdrop showing through — it would otherwise take on
 * the stage's hue.
 */
function relight(frame, plate, drift = null, { defocus = 0, sharpen = SHARPEN_AMOUNT } = {}) {
  const bright = new Uint8Array(CW * CH);
  const departure = new Float32Array(CW * CH);
  const lit = new Float32Array(CW * CH);

  for (let p = 0; p < CW * CH; p++) {
    const l = luma(frame[p * 3], frame[p * 3 + 1], frame[p * 3 + 2]);
    let lb = luma(plate[p * 3], plate[p * 3 + 1], plate[p * 3 + 2]);
    if (drift) {
      // Clear glass shows the backdrop, so it carries the backdrop's drift, and
      // that is taken out. Frost and ink do not — the frost is lit from within
      // and stays steady — so the further a pixel is from the backdrop, the less
      // of the drift it is charged with. Otherwise the frost would start to pulse.
      const shift = luma(drift[p * 3], drift[p * 3 + 1], drift[p * 3 + 2]);
      const t = Math.min(Math.max((Math.abs(l - lb - shift) - 10) / 28, 0), 1);
      lb += shift * (1 - t * t * (3 - 2 * t));
    }
    const d = l - lb;
    if (d > 34) bright[p] = 1;
    departure[p] = Math.abs(d);
    lit[p] = d >= 0 ? stageLuma + (d * (255 - stageLuma)) / (255 - lb) : stageLuma + (d * stageLuma) / lb;
  }

  // The hue decision is made on blurred signals. Taken per pixel, it flips
  // between the stage's hue and neutral on every speck of film noise, which
  // reads as coloured stippling all over the clear glass.
  const closed = closeMask(bright, 12);
  const frostIn = new Float32Array(CW * CH);
  for (let p = 0; p < CW * CH; p++) frostIn[p] = closed[p];
  const frost = gaussianBlur(frostIn, 1.6);
  const away = gaussianBlur(departure, 2);

  const chroma = new Float32Array(CW * CH * 3);
  const sc = [stage[0] - stageLuma, stage[1] - stageLuma, stage[2] - stageLuma];
  // A wider blur of the film's own colour too: its chroma is quarter-resolution
  // and blocky, and only a quarter of it is kept anyway.
  const film = [new Float32Array(CW * CH), new Float32Array(CW * CH), new Float32Array(CW * CH)];
  for (let p = 0; p < CW * CH; p++) {
    const l = luma(frame[p * 3], frame[p * 3 + 1], frame[p * 3 + 2]);
    for (let c = 0; c < 3; c++) film[c][p] = frame[p * 3 + c] - l;
  }
  const filmSoft = film.map((channel) => gaussianBlur(channel, 2.5));

  for (let p = 0; p < CW * CH; p++) {
    const t = Math.min(Math.max((away[p] - 3) / 24, 0), 1);
    const s = Math.max(t * t * (3 - 2 * t), Math.min(frost[p], 1));
    // 0.25 of the film's own chroma: it is graded cool-magenta, and most of
    // that cast has to go for the frosted glass to read as clean white.
    for (let c = 0; c < 3; c++) chroma[p * 3 + c] = sc[c] * (1 - s) + filmSoft[c][p] * 0.25 * s;
  }

  // Where the picture is quiet, a small median takes out the film's last specks
  // before they can be sharpened; real edges and type (high local range) pass
  // through untouched.
  const clean = refocus(despeckle(lit), defocus);

  // Unsharp on luminance, cored so the smooth frost and clear glass stay clean.
  const blurred = sharpen > 0 ? gaussianBlur(clean, SHARPEN_SIGMA) : clean;
  const rgb = new Float32Array(CW * CH * 3);
  for (let p = 0; p < CW * CH; p++) {
    const hi = clean[p] - blurred[p];
    const magnitude = Math.abs(hi);
    const cored = magnitude <= SHARPEN_CORE ? 0 : Math.sign(hi) * (magnitude - SHARPEN_CORE);
    const l = clean[p] + cored * sharpen;
    rgb[p * 3] = l + chroma[p * 3];
    rgb[p * 3 + 1] = l + chroma[p * 3 + 1];
    rgb[p * 3 + 2] = l + chroma[p * 3 + 2];
  }
  return rgb;
}

/**
 * Undoes a Gaussian blur of the given sigma by Van Cittert iteration: repeatedly
 * add back what blurring the current estimate fails to reproduce. Small residuals
 * are cored so film noise is not rebuilt along with the detail, and the result
 * stays within reach of the values around each pixel, so edges come up sharp
 * without growing halos.
 */
function refocus(src, sigma) {
  if (sigma < REFOCUS_MIN_SIGMA) return src;
  const radius = Math.max(Math.ceil(sigma * 2), 1);
  const { lo, hi } = localRange(src, radius);
  const estimate = Float32Array.from(src);
  for (let k = 0; k < REFOCUS_ITERATIONS; k++) {
    const blurred = gaussianBlur(estimate, sigma);
    for (let p = 0; p < CW * CH; p++) {
      const residual = src[p] - blurred[p];
      const magnitude = Math.abs(residual);
      if (magnitude <= REFOCUS_CORE) continue;
      const next = estimate[p] + Math.sign(residual) * (magnitude - REFOCUS_CORE);
      estimate[p] = Math.min(Math.max(next, lo[p] - REFOCUS_OVERSHOOT), hi[p] + REFOCUS_OVERSHOOT);
    }
  }
  return estimate;
}

/** The lowest and highest value within a square of the given radius. */
function localRange(src, radius) {
  const pass = (input, pick, stepInner, countInner, stepOuter, countOuter) => {
    const out = new Float32Array(CW * CH);
    for (let outer = 0; outer < countOuter; outer++) {
      const base = outer * stepOuter;
      for (let inner = 0; inner < countInner; inner++) {
        let v = input[base + inner * stepInner];
        const from = Math.max(inner - radius, 0);
        const to = Math.min(inner + radius, countInner - 1);
        for (let i = from; i <= to; i++) v = pick(v, input[base + i * stepInner]);
        out[base + inner * stepInner] = v;
      }
    }
    return out;
  };
  const along = (pick) => pass(pass(src, pick, 1, CW, CW, CH), pick, CW, CH, 1, CW);
  return { lo: along(Math.min), hi: along(Math.max) };
}

/** A 3x3 median, applied only where the neighbourhood's range is small. */
function despeckle(src) {
  const out = Float32Array.from(src);
  const win = new Float32Array(9);
  for (let y = 1; y < CH - 1; y++) {
    for (let x = 1; x < CW - 1; x++) {
      const p = y * CW + x;
      let k = 0;
      let lo = Infinity;
      let hi = -Infinity;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const v = src[p + dy * CW + dx];
          win[k++] = v;
          if (v < lo) lo = v;
          if (v > hi) hi = v;
        }
      }
      if (hi - lo > DESPECKLE_RANGE) continue;
      win.sort();
      out[p] = win[4];
    }
  }
  return out;
}

/** RGB + coverage -> an RGBA buffer, the stage colour outside the outline. */
function toRgba(rgb, alpha) {
  const out = Buffer.alloc(CW * CH * 4);
  for (let p = 0; p < CW * CH; p++) {
    const a = alpha[p];
    for (let c = 0; c < 3; c++) {
      const v = a > 0 ? rgb[p * 3 + c] : stage[c];
      out[p * 4 + c] = Math.round(Math.min(Math.max(v, 0), 255));
    }
    out[p * 4 + 3] = Math.round(a * 255);
  }
  return out;
}

/* --------------------------------------------------------------- plinth */

/**
 * The plinth is static, so it is built from the whole film at once: dark
 * samples only where the bottle sometimes covers it, the plain median where
 * the logo glows. Noise-free, and the same in every frame by construction.
 */
function buildPlinth(samples, plate) {
  const count = samples.length;
  const out = Buffer.alloc(CROP_BYTES);
  const values = [[], [], []];
  for (let y = 0; y < CH; y++) {
    for (let x = 0; x < CW; x++) {
      const p = y * CW + x;
      if (!inPlinthZone(x, y)) {
        for (let c = 0; c < 3; c++) out[p * 3 + c] = Math.round(plate[p * 3 + c]);
        continue;
      }
      for (const list of values) list.length = 0;
      for (let s = 0; s < count; s++) {
        const f = samples[s];
        if (luma(f[p * 3], f[p * 3 + 1], f[p * 3 + 2]) < 90) {
          for (let c = 0; c < 3; c++) values[c].push(f[p * 3 + c]);
        }
      }
      const useDark = values[0].length >= count * 0.2;
      for (let c = 0; c < 3; c++) {
        let list = values[c];
        if (!useDark) {
          list = [];
          for (let s = 0; s < count; s++) list.push(samples[s][p * 3 + c]);
        }
        list.sort((a, b) => a - b);
        out[p * 3 + c] = list[list.length >> 1];
      }
    }
  }

  // Its outline: the hull of the solid black mass, which leaves out the soft
  // shadow it throws on the backdrop.
  const mask = new Uint8Array(CW * CH);
  for (let y = PLINTH_TOP; y < 1212; y++) {
    for (let x = 10; x < 510; x++) {
      const p = y * CW + x;
      if (luma(out[p * 3], out[p * 3 + 1], out[p * 3 + 2]) < 40) mask[p] = 1;
    }
  }
  const poly = polygonOf(supportOf(mask, PLINTH_TOP, 1212, 400), 0.5);
  const alpha = new Float32Array(CW * CH);
  fillPolygon(poly, alpha);
  return { frame: out, alpha };
}

/**
 * The film blurs the plinth's lit logo into blobs, and sharpening only rings
 * round them. So the logo is redrawn from its own shape: upsampled, cut at a
 * steep threshold, and brought back down — crisp letters with their counters
 * open, plus a little of the original glow behind them.
 */
async function redrawPlinthLogo(rgb) {
  const { left, top, width, height } = PLINTH_LOGO;
  const SCALE = 4;
  const lumaIn = Buffer.alloc(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = (top + y) * CW + left + x;
      const v = luma(rgb[p * 3], rgb[p * 3 + 1], rgb[p * 3 + 2]);
      lumaIn[y * width + x] = Math.round(Math.min(Math.max(v, 0), 255));
    }
  }
  // sharp may hand a greyscale image back as RGB; read whichever it gives.
  const big = await sharp(lumaIn, { raw: { width, height, channels: 1 } })
    .resize(width * SCALE, height * SCALE, { kernel: "cubic" })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const cut = Buffer.alloc(width * SCALE * height * SCALE);
  for (let i = 0; i < cut.length; i++) {
    // The lamp behind the logo falls off toward the bottom: the Z is dimmer
    // than the rest, so the cut comes down with it.
    const row = Math.floor(i / (width * SCALE)) / (height * SCALE);
    const level = LOGO_LEVEL - 52 * Math.min(Math.max((row - 0.78) / 0.12, 0), 1);
    const t = Math.min(Math.max((big.data[i * big.info.channels] - level) / LOGO_SOFTNESS + 0.5, 0), 1);
    cut[i] = Math.round(t * 255);
  }
  const shrunk = await sharp(cut, { raw: { width: width * SCALE, height: height * SCALE, channels: 1 } })
    .resize(width, height, { kernel: "lanczos3" })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const small = shrunk.data;
  const channels = shrunk.info.channels;

  const glow = gaussianBlur(
    (() => {
      const g = new Float32Array(CW * CH);
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) g[(top + y) * CW + left + x] = small[(y * width + x) * channels] / 255;
      }
      return g;
    })(),
    5,
  );

  // The plinth's own black behind the letters: each row runs straight from the
  // film's value at the patch's left edge to its right edge, so the patch has
  // no boundary to see.
  const WHITE = 244;
  const edgeMean = (y, from, to, c) => {
    let v = 0;
    for (let x = from; x < to; x++) v += rgb[(y * CW + x) * 3 + c];
    return v / (to - from);
  };
  const leftEdge = [];
  const rightEdge = [];
  for (let y = 0; y < height; y++) {
    const row = top + y;
    leftEdge.push([0, 1, 2].map((c) => edgeMean(row, left, left + 6, c)));
    rightEdge.push([0, 1, 2].map((c) => edgeMean(row, left + width - 6, left + width, c)));
  }
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = (top + y) * CW + left + x;
      const a = small[(y * width + x) * channels] / 255;
      const t = x / (width - 1);
      for (let c = 0; c < 3; c++) {
        const base = leftEdge[y][c] * (1 - t) + rightEdge[y][c] * t + glow[p] * 22;
        rgb[p * 3 + c] = base * (1 - a) + WHITE * a;
      }
    }
  }
  return rgb;
}

async function buildPlinthImage(plinth, plate) {
  const rgb = await redrawPlinthLogo(relight(plinth.frame, plate, null, { sharpen: 0 }));
  return toRgba(rgb, plinth.alpha);
}

/* ------------------------------------------------------------------ run */

async function writeSized(rgba, width, height, size, box, file) {
  let image = sharp(rgba, { raw: { width, height, channels: 4 } });
  if (box) image = image.extract(box);
  const targetH = Math.round(((box ? box.height : height) * size) / CH);
  const info = await image
    .resize({ height: targetH, kernel: "lanczos3" })
    .webp(WEBP)
    .toFile(file);
  return info;
}

/**
 * How far out of focus each frame is, as the sigma of a Gaussian blur.
 *
 * The film's camera hunts for focus: every second or so the whole picture goes
 * visibly soft for a dozen frames and comes back, and on a turning bottle that
 * reads as the picture breaking up mid-turn. The plinth's logo never moves, so
 * any change in it is the camera, and it makes a calibration target. The sharpest
 * frames' logo is blurred by a range of sigmas, and the closest match to each
 * frame's logo says how soft that frame is against the best the film can do.
 */
function measureFocus() {
  const { left, top, width, height } = PLINTH_LOGO;
  const buffer = Buffer.alloc(CROP_BYTES);
  const logoOf = (frame) => {
    const out = new Float32Array(width * height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const p = (y + top) * CW + x + left;
        out[y * width + x] = luma(frame[p * 3], frame[p * 3 + 1], frame[p * 3 + 2]);
      }
    }
    return out;
  };
  const energy = (logo) => {
    let total = 0;
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const p = y * width + x;
        const v = 4 * logo[p] - logo[p - 1] - logo[p + 1] - logo[p - width] - logo[p + width];
        total += v * v;
      }
    }
    return total;
  };

  const logos = [];
  const energies = [];
  for (let n = 0; n < LOOP_LENGTH; n++) {
    const logo = logoOf(readFrame(n, buffer));
    logos.push(logo);
    energies.push(energy(logo));
  }

  // The reference, on a full frame's worth of luminance so blurring it has real
  // picture to draw on at the logo's edges.
  const ranked = energies.map((e, n) => [e, n]).sort((a, b) => b[0] - a[0]);
  const sharpest = ranked.slice(0, Math.ceil(LOOP_LENGTH / 10)).map(([, n]) => n);
  const reference = new Float32Array(CW * CH);
  for (const n of sharpest) {
    const frame = readFrame(n, buffer);
    for (let p = 0; p < CW * CH; p++) {
      reference[p] += luma(frame[p * 3], frame[p * 3 + 1], frame[p * 3 + 2]) / sharpest.length;
    }
  }
  const sigmas = [];
  for (let s = 0; s <= FOCUS_SIGMA_MAX + 1e-6; s += FOCUS_SIGMA_STEP) sigmas.push(s);
  const candidates = sigmas.map((s) => {
    const blurred = s > 0 ? gaussianBlur(reference, s) : reference;
    const out = new Float32Array(width * height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) out[y * width + x] = blurred[(y + top) * CW + x + left];
    }
    return out;
  });

  const raw = logos.map((logo) => {
    const errors = candidates.map((candidate) => {
      let total = 0;
      for (let p = 0; p < logo.length; p++) {
        const d = logo[p] - candidate[p];
        total += d * d;
      }
      return total;
    });
    let i = 0;
    for (let k = 1; k < errors.length; k++) if (errors[k] < errors[i]) i = k;
    if (i === 0 || i === errors.length - 1) return sigmas[i];
    const [a, b, c] = [errors[i - 1], errors[i], errors[i + 1]];
    return sigmas[i] + (FOCUS_SIGMA_STEP * (a - c)) / (2 * (a - 2 * b + c));
  });

  // Focus moves continuously; what jumps from one frame to the next is noise.
  const wrap = (n) => (n + LOOP_LENGTH) % LOOP_LENGTH;
  const median = raw.map((_, n) =>
    [raw[wrap(n - 1)], raw[n], raw[wrap(n + 1)]].sort((a, b) => a - b)[1],
  );
  const focus = median.map((_, n) =>
    0.25 * median[wrap(n - 1)] + 0.5 * median[n] + 0.25 * median[wrap(n + 1)],
  );

  const sorted = [...focus].sort((a, b) => a - b);
  const at = (q) => sorted[Math.floor((sorted.length - 1) * q)].toFixed(2);
  log(`[focus]  softness sigma: median ${at(0.5)}, p90 ${at(0.9)}, worst ${at(1)}`);
  return focus;
}

async function loadPolygons(plate, drifts, plinth) {
  const file = path.join(CACHE, "polygons.json");
  // `outlines` versions the measuring code: bump it when that or the plate changes.
  const stamp = JSON.stringify({ outlines: 6, DENOISE, LOOP_LENGTH, CAP_THRESHOLD, BODY_THRESHOLD, BASE_LUMA });
  if (fs.existsSync(file)) {
    const saved = JSON.parse(fs.readFileSync(file, "utf8"));
    if (saved.stamp === stamp) {
      log("[shape]  using cached outlines");
      return saved.polygons;
    }
  }
  log("[shape]  measuring the outline of every frame…");
  const caps = [];
  const bodies = [];
  const buffer = Buffer.alloc(CROP_BYTES);
  for (let n = 0; n < LOOP_LENGTH; n++) {
    const { cap, body } = measureFrame(readFrame(n, buffer), plate, driftField(drifts[n]), plinth);
    caps.push(cap);
    bodies.push(body);
    if (n % 100 === 0) log(`[shape]    ${n}/${LOOP_LENGTH}`);
  }
  log("[shape]  smoothing over time…");
  const smoothCaps = smoothSupports(caps);
  const smoothBodies = smoothSupports(bodies);
  const polygons = [];
  for (let n = 0; n < LOOP_LENGTH; n++) {
    polygons.push({
      cap: polygonOf(smoothCaps[n], 0.75),
      body: polygonOf(smoothBodies[n], 0.75),
    });
  }
  fs.writeFileSync(file, JSON.stringify({ stamp, polygons }));
  return polygons;
}

function renderFrame(n, plate, drift, polygons, plinth, focus, buffer) {
  const frame = readFrame(n, buffer);
  const rgb = relight(frame, plate, drift, { defocus: focus[n] });
  const alpha = new Float32Array(CW * CH);
  fillPolygon(polygons[n].cap, alpha);
  fillPolygon(polygons[n].body, alpha);

  // Over the plinth only the frost and the bright highlights stay: the clear
  // rim there just shows the plinth anyway, in a noisy, broken copy, and the
  // film's own soft copy of the plinth's back edge would sit on top of the
  // crisp static one. The static layer shows instead. The test runs on a
  // smoothed copy so the cut itself has no jaggies.
  const bandTop = PLINTH_TOP - 8;
  const bandBottom = BODY_BOTTOM;
  const lumas = new Float32Array(CW * CH);
  for (let y = bandTop - 8; y < bandBottom + 8; y++) {
    for (let x = 0; x < CW; x++) {
      const p = y * CW + x;
      lumas[p] = luma(frame[p * 3], frame[p * 3 + 1], frame[p * 3 + 2]);
    }
  }
  const soft = gaussianBlurBand(lumas, bandTop - 8, bandBottom + 8, 1.2);
  for (let y = bandTop; y < bandBottom; y++) {
    for (let x = 0; x < CW; x++) {
      const p = y * CW + x;
      if (!alpha[p]) continue;
      if (plinth.alpha[p] > 0) {
        alpha[p] *= Math.min(Math.max((soft[p] - 125) / 35, 0), 1);
      } else if (y < PLINTH_TOP + 18) {
        // Just above the back edge: bright against the backdrop, or nothing.
        const lb =
          luma(plate[p * 3], plate[p * 3 + 1], plate[p * 3 + 2]) +
          luma(drift[p * 3], drift[p * 3 + 1], drift[p * 3 + 2]);
        alpha[p] *= Math.min(Math.max((soft[p] - lb - 4) / 12, 0), 1);
      }
    }
  }
  return toRgba(rgb, alpha);
}

/** A Gaussian over just the rows [top, bottom) of a crop-sized field. */
function gaussianBlurBand(src, top, bottom, sigma) {
  const radius = Math.ceil(sigma * 3);
  const kernel = [];
  let total = 0;
  for (let i = -radius; i <= radius; i++) {
    const w = Math.exp(-(i * i) / (2 * sigma * sigma));
    kernel.push(w);
    total += w;
  }
  const out = new Float32Array(CW * CH);
  const tmp = new Float32Array(CW * CH);
  for (let y = top; y < bottom; y++) {
    for (let x = 0; x < CW; x++) {
      let v = 0;
      for (let i = -radius; i <= radius; i++) {
        const xx = Math.min(Math.max(x + i, 0), CW - 1);
        v += src[y * CW + xx] * kernel[i + radius];
      }
      tmp[y * CW + x] = v / total;
    }
  }
  for (let y = top; y < bottom; y++) {
    for (let x = 0; x < CW; x++) {
      let v = 0;
      for (let i = -radius; i <= radius; i++) {
        const yy = Math.min(Math.max(y + i, top), bottom - 1);
        v += tmp[yy * CW + x] * kernel[i + radius];
      }
      out[y * CW + x] = v / total;
    }
  }
  return out;
}

async function main() {
  const started = Date.now();
  log("FLUID OUNCE — building the turning bottle");
  if (!fs.existsSync(SOURCE)) throw new Error(`Missing source film: ${path.relative(ROOT, SOURCE)}`);

  await ensureDenoised();
  const { plate, samples, known } = buildPlate();
  const drifts = measureDrift(plate, known);
  const plinth = buildPlinth(samples, plate);
  const polygons = await loadPolygons(plate, drifts, plinth);
  const plinthRgba = await buildPlinthImage(plinth, plate);
  const focus = measureFocus();

  const debug = process.env.BOTTLE_DEBUG;
  if (debug) {
    const dir = path.join(CACHE, "debug");
    await fsp.mkdir(dir, { recursive: true });
    const buffer = Buffer.alloc(CROP_BYTES);
    for (const part of debug.split(",")) {
      const film = Number(part);
      const n = film - LOOP_START;
      const rgba = renderFrame(n, plate, driftField(drifts[n]), polygons, plinth, focus, buffer);
      log(`[debug]  ${film} softness sigma ${focus[n].toFixed(2)}`);
      const under = await sharp(plinthRgba, { raw: { width: CW, height: CH, channels: 4 } }).png().toBuffer();
      const over = await sharp(rgba, { raw: { width: CW, height: CH, channels: 4 } }).png().toBuffer();
      await sharp({ create: { width: CW, height: CH, channels: 3, background: STAGE } })
        .composite([{ input: under }, { input: over }])
        .png()
        .toFile(path.join(dir, `${film}.png`));
      log(`[debug]  ${film}.png`);
    }
    return;
  }

  /* Where the bottle ever reaches, so its frames carry no empty margin. */
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const { cap, body } of polygons) {
    for (const [x, y] of [...cap, ...body]) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  const box = {
    left: Math.max(Math.floor(minX) - 2, 0),
    top: Math.max(Math.floor(minY) - 2, 0),
  };
  box.width = Math.min(Math.ceil(maxX) + 2, CW) - box.left;
  box.height = Math.min(Math.ceil(maxY) + 2, CH) - box.top;
  log(`[shape]  bottle box ${box.width}x${box.height} at ${box.left},${box.top} of ${CW}x${CH}`);

  await fsp.rm(OUT, { recursive: true, force: true });
  for (const set of SETS) await fsp.mkdir(path.join(OUT, String(set.size)), { recursive: true });

  for (const set of SETS) {
    await writeSized(plinthRgba, CW, CH, set.size, null, path.join(OUT, String(set.size), "plinth.webp"));
  }
  log("[plinth] written");

  const totals = Object.fromEntries(SETS.map((set) => [set.size, 0]));
  const buffer = Buffer.alloc(CROP_BYTES);
  const CONCURRENT = 8;
  let pending = [];

  for (let n = 0; n < LOOP_LENGTH; n++) {
    const wanted = SETS.filter((set) => n % Math.round(LOOP_LENGTH / set.frames) === 0);
    if (!wanted.length) continue;
    const rgba = renderFrame(n, plate, driftField(drifts[n]), polygons, plinth, focus, buffer);
    for (const set of wanted) {
      const index = Math.round((n * set.frames) / LOOP_LENGTH);
      const name = `${String(index).padStart(3, "0")}.webp`;
      pending.push(
        writeSized(rgba, CW, CH, set.size, box, path.join(OUT, String(set.size), name)).then((info) => {
          totals[set.size] += info.size;
        }),
      );
    }
    if (pending.length >= CONCURRENT) {
      await Promise.all(pending);
      pending = [];
    }
    if (n % 100 === 0) log(`[frames] ${n}/${LOOP_LENGTH}`);
  }
  await Promise.all(pending);

  const frameMeta = {};
  for (const set of SETS) {
    const info = await sharp(path.join(OUT, String(set.size), "000.webp")).metadata();
    frameMeta[set.size] = { frames: set.frames, width: info.width, height: info.height };
    log(`[frames] ${set.size}/  ${set.frames} x ${info.width}x${info.height}  ${(totals[set.size] / 1024).toFixed(0)} KB`);
  }

  const lib = `/**
 * Written by scripts/build-bottle.mjs — do not edit by hand.
 *
 * The bottle's frames are cropped to where it ever reaches; \`box\` places them
 * inside the full crop (as fractions of it), the shape the plinth image fills.
 */
export const BOTTLE = {
  /** Width / height of the full crop. */
  aspect: ${CW / CH},
  box: {
    left: ${box.left / CW},
    top: ${box.top / CH},
    width: ${box.width / CW},
    height: ${box.height / CH},
  },
  sets: ${JSON.stringify(frameMeta, null, 2).replace(/\n/g, "\n  ")},
} as const;

/** New with every build: the files are cached as immutable. */
export const BOTTLE_VERSION = "${Date.now().toString(36)}";

export const bottleAsset = (path: string) => \`/media/bottle/\${path}?v=\${BOTTLE_VERSION}\`;
`;
  fs.writeFileSync(LIB, lib);
  log(`[lib]    ${path.relative(ROOT, LIB)}`);
  log(`done in ${((Date.now() - started) / 1000).toFixed(1)}s`);
}

main()
  .catch((err) => {
    console.error("\n[build-bottle] FAILED:", err.message);
    process.exitCode = 1;
  })
  .finally(() => {
    if (rawFd !== null) fs.closeSync(rawFd);
  });
