/**
 * FLUID OUNCE — charred wood, drawn from nothing.
 *
 * Run with: node scripts/build-wood.mjs
 *
 * The site's dark ground: burnt, brushed timber, the soft early wood gone and the
 * hard late wood standing up in ridges that catch the light. It is a height field
 * lit from one side, not a photograph, so it can be as large and as clean as it
 * needs to be, and it tiles without a seam in either direction.
 *
 * What keeps it from looking drawn is that nothing in it is even. Every growth ring
 * is its own: its width, how hard it grew, which way its slope leans, how crisp its
 * edge is, and where along the board it fades out and comes back. The board's figure
 * comes from long flames and a few knots placed at random, in a burn that is deeper
 * in some places than others.
 *
 *   public/images/wood/char.webp    the timber itself, for the dark sections
 *   public/images/wood/grain.webp   only its shadows, on transparency, laid very
 *                                   lightly over the stone grounds
 *   public/images/wood/light.webp   only its ridges, on transparency: the same
 *                                   timber caught by a lamp, for the dark sections
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "images", "wood");

/** Square, and it must stay a whole number of noise periods to tile. Wide enough that
 * a full-width screen shows little of it twice, so nothing in it reads as repeating. */
const SIZE = 2304;
const LAYER_SIZE = 1024;
/** Growth rings across the tile. A whole number, or they fail to meet at its edge. */
const RINGS = 64;

/* A small seeded generator, so every build draws the same timber. */
let seed = 20261106;
const random = () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
};
const gauss = () => Math.sqrt(-2 * Math.log(Math.max(random(), 1e-9))) * Math.cos(2 * Math.PI * random());

const smoothstep = (from, to, value) => {
  const t = Math.min(Math.max((value - from) / (to - from), 0), 1);
  return t * t * (3 - 2 * t);
};

/** Value noise that wraps every `px` by `py` cells. */
function periodicNoise(px, py) {
  const lattice = new Float32Array(px * py);
  for (let i = 0; i < lattice.length; i++) lattice[i] = random() * 2 - 1;
  return (x, y) => {
    const fx = x * px;
    const fy = y * py;
    const x0 = Math.floor(fx);
    const y0 = Math.floor(fy);
    const tx = fx - x0;
    const ty = fy - y0;
    const sx = tx * tx * (3 - 2 * tx);
    const sy = ty * ty * (3 - 2 * ty);
    const xa = ((x0 % px) + px) % px;
    const xb = (xa + 1) % px;
    const ya = ((y0 % py) + py) % py;
    const yb = (ya + 1) % py;
    const a = lattice[ya * px + xa];
    const b = lattice[ya * px + xb];
    const c = lattice[yb * px + xa];
    const d = lattice[yb * px + xb];
    return (a + (b - a) * sx) * (1 - sy) + (c + (d - c) * sx) * sy;
  };
}

/** Several octaves, every one still whole periods of the tile. */
function fbm(px, py, octaves) {
  const layers = [];
  for (let o = 0; o < octaves; o++) layers.push(periodicNoise(px << o, py << o));
  return (x, y) => {
    let total = 0;
    let weight = 0.5;
    for (const layer of layers) {
      total += layer(x, y) * weight;
      weight *= 0.5;
    }
    return total;
  };
}

/* The board's drift: slow bends along the grain, tighter ones across it, and a figure
 * that is restless in some stretches and all but still in others. */
const bend = fbm(4, 2, 3);
const wander = fbm(9, 4, 3);
const figure = fbm(17, 4, 2);
const restless = fbm(3, 3, 2);
/* How deep the fire went, and the wood's slower changes of tone. */
const burn = fbm(5, 4, 3);
const tone = fbm(6, 4, 3);
const mottle = fbm(21, 13, 3);
const tint = fbm(4, 3, 2);
/* Along the grain, one ring at a time: each comes and goes on its own. */
const ringFade = fbm(RINGS, 11, 2);
const fibre = fbm(210, 13, 3);
const fissure = fbm(105, 7, 3);
const pores = fbm(520, 70, 2);
/* Across the grain, fine and irregular: where the surface has crazed in the fire. */
const crazing = fbm(66, 255, 3);

/* The years. Good ones and lean ones come in runs, so the widths wander rather than
 * alternate. Most leave a modest ridge, a few stand proud, some barely show. A ring's
 * slope leans one way or the other, and its hard edge is crisp or soft, its own way. */
const YEARS = (() => {
  const years = [];
  let climate = 0;
  let total = 0;
  for (let i = 0; i < RINGS; i++) {
    climate = climate * 0.78 + gauss() * 0.62;
    const width = Math.exp(climate * 0.42 + gauss() * 0.25);
    total += width;
    years.push({
      index: i,
      width,
      hard: 0.45 + 0.95 * random() ** 1.6,
      flip: random() < 0.38,
      steep: 0.9 + random() * 2.4,
      edge: 2.5 + random() * 6,
      // A false ring: a check in the year's growth, not in every year.
      falseAt: 0.25 + random() * 0.45,
      falseSize: random() < 0.5 ? 0.06 + random() * 0.18 : 0,
    });
  }
  let at = 0;
  for (const year of years) {
    year.width *= RINGS / total;
    year.start = at;
    at += year.width;
  }
  return years;
})();

function yearAt(u) {
  let low = 0;
  let high = RINGS - 1;
  while (low < high) {
    const middle = (low + high + 1) >> 1;
    if (YEARS[middle].start <= u) low = middle;
    else high = middle - 1;
  }
  return YEARS[low];
}

/* Where the saw ran along a ring's curve, the grain opens into long pointed flames,
 * all of them pointing up the board as the tree grew. Long below the tip, short above. */
const FLAMES = Array.from({ length: 13 }, () => ({
  x: random(),
  y: random(),
  wide: 0.012 + 0.03 * random(),
  up: 0.02 + 0.05 * random(),
  down: 0.1 + 0.26 * random(),
  lift: (random() < 0.5 ? -1 : 1) * (1.2 + 3.6 * random()),
}));

/* Knots: the grain parts and flows around them. */
const KNOTS = Array.from({ length: 4 }, () => ({
  x: random(),
  y: random(),
  size: 0.014 + 0.026 * random(),
  push: (random() < 0.5 ? -1 : 1) * (0.9 + 1.5 * random()),
}));

/* Sines of the distance throughout, which come round to where they began. A plain signed
 * distance leaps from + to - on the far side of the tile from a knot, and the rings leap
 * with it, cutting the wood along a dead straight line. */
const across = (d) => Math.sin(Math.PI * d) / Math.PI;

function flameLift(x, y) {
  let total = 0;
  for (const flame of FLAMES) {
    const dx = across(x - flame.x);
    const width = (dx * dx) / (flame.wide * flame.wide);
    if (width > 8) continue;
    const dy = y - flame.y - Math.round(y - flame.y);
    const reach = Math.abs(dy) / (dy < 0 ? flame.up : flame.down);
    const fade = Math.cos(Math.PI * dy);
    total += flame.lift * Math.exp(-width - reach ** 1.5) * fade * fade;
  }
  return total;
}

function knotShift(x, y) {
  let total = 0;
  for (const knot of KNOTS) {
    const dx = across(x - knot.x);
    // Stretched along the grain: a knot's disturbance runs a long way up and down.
    const dy = across(y - knot.y) * 0.32;
    const d2 = (dx * dx + dy * dy) / (knot.size * knot.size);
    const side = Math.sin(2 * Math.PI * (x - knot.x)) / (2 * Math.PI);
    total += (knot.push * side) / (knot.size * (1 + d2) * 2.2);
  }
  return total;
}

function knotCore(x, y) {
  let total = 0;
  for (const knot of KNOTS) {
    const dx = across(x - knot.x);
    const dy = across(y - knot.y);
    total += Math.exp(-(dx * dx + dy * dy) / (knot.size * knot.size * 0.3));
  }
  return total;
}

function phaseAt(x, y) {
  const unrest = 0.5 + 2 * smoothstep(-0.2, 0.3, restless(x, y));
  return RINGS * x + 9 * bend(x, y) + 3.5 * wander(x, y) + unrest * figure(x, y) + flameLift(x, y) + knotShift(x, y);
}

/** `pull` is how fast the phase is changing here, per pixel. */
function heightAt(phase, pull, x, y) {
  // Everything finer follows the rings: it is the same grain, bent the same way.
  const along = phase / RINGS;
  const year = yearAt(((phase % RINGS) + RINGS) % RINGS);
  const t = Math.min((((phase % RINGS) + RINGS) % RINGS - year.start) / year.width, 1);
  const pixels = year.width / Math.max(pull, 1e-4);

  // The ring: a slope, up to a hard edge that falls away within a few pixels.
  const s = year.flip ? 1 - t : t;
  let h = s ** year.steep * smoothstep(1, 1 - Math.min(0.5, year.edge / pixels), s);
  if (year.falseSize) {
    const d = (t - year.falseAt) / Math.max(0.05, 1.5 / pixels);
    h += year.falseSize * Math.exp(-d * d) * smoothstep(10, 22, pixels);
  }

  // How much of it survives here: packed too tight to draw, rings blur into a tone
  // rather than beat against the pixels; and the fire took more in some places.
  const scorch = smoothstep(-0.3, 0.3, burn(x, y));
  const fade = Math.min(Math.max(0.85 + 1.1 * ringFade((year.index + 0.5) / RINGS, y), 0.25), 1.4);
  h *= year.hard * fade * (0.65 + 0.6 * scorch) * smoothstep(2.5, 8, pixels);
  // Where a ring opens out to nothing at the heart of a flame it lies flat, and the
  // broad top of it would shine like lacquer: charred wood does not.
  h *= 1 - 0.65 * smoothstep(45, 150, pixels);

  // The fibres of the wood, the pores in it, and the splits along them.
  h += fibre(along, y) * 0.2;
  const p = pores(along, y);
  if (p > 0.2) h -= Math.min((p - 0.2) * 1.4, 0.12);
  const f = fissure(along, y);
  if (f > 0.2) h -= Math.min((f - 0.2) * 2.4, 0.3);

  // Crazing, stronger where the fire went deep, and on the raised wood.
  const c = crazing(along, y);
  if (c > 0.2) h -= Math.min((c - 0.2) * 1.3, 0.08) * (1 - 0.7 * scorch) * (0.35 + Math.min(h, 1));

  h -= knotCore(x, y) * 0.3;

  // The wood's own slow change of tone.
  return h + tone(x, y) * 0.26 + mottle(x, y) * 0.1;
}

function draw() {
  const phases = new Float32Array(SIZE * SIZE);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) phases[y * SIZE + x] = phaseAt(x / SIZE, y / SIZE);
  }

  const heights = new Float32Array(SIZE * SIZE);
  for (let y = 0; y < SIZE; y++) {
    const above = ((y + SIZE - 1) % SIZE) * SIZE;
    const below = ((y + 1) % SIZE) * SIZE;
    const here = y * SIZE;
    for (let x = 0; x < SIZE; x++) {
      // Across the tile's edge the phase carries on by one whole round of rings.
      const left = x > 0 ? phases[here + x - 1] : phases[here + SIZE - 1] - RINGS;
      const right = x < SIZE - 1 ? phases[here + x + 1] : phases[here] + RINGS;
      const pull = Math.hypot((right - left) / 2, (phases[below + x] - phases[above + x]) / 2);
      heights[here + x] = heightAt(phases[here + x], pull, x / SIZE, y / SIZE);
    }
  }

  const charred = Buffer.alloc(SIZE * SIZE * 3);
  const shadows = Buffer.alloc(SIZE * SIZE * 4);
  const ridges = Buffer.alloc(SIZE * SIZE * 4);
  const BASE = [14, 13, 12];
  const LIT = [104, 110, 100];
  for (let y = 0; y < SIZE; y++) {
    const above = ((y + SIZE - 1) % SIZE) * SIZE;
    const below = ((y + 1) % SIZE) * SIZE;
    const here = y * SIZE;
    for (let x = 0; x < SIZE; x++) {
      const left = (x + SIZE - 1) % SIZE;
      const right = (x + 1) % SIZE;
      const dx = heights[here + right] - heights[here + left];
      const dy = heights[below + x] - heights[above + x];
      const h = heights[here + x];
      // A low lamp from the upper left: what faces it is lit, the rest falls away.
      const facing = -dx * 1.5 - dy * 0.5;
      const light = Math.min(Math.max(0.46 * h + facing * 1.4, 0), 1);
      const depth = Math.min(Math.max(0.42 - h * 0.42 + Math.max(-facing, 0) * 1.3, 0), 1);
      const i = here + x;

      // The char is not one colour: a little warmer here, a little greyer there.
      const warm = tint(x / SIZE, y / SIZE) * 14;
      const lit = [LIT[0] + warm, LIT[1], LIT[2] - warm];
      for (let c = 0; c < 3; c++) {
        charred[i * 3 + c] = Math.round(BASE[c] + (lit[c] - BASE[c]) * light * (1 - depth * 0.35));
      }
      // The two transparent layers: only the shadows, and only the lit ridges.
      shadows[i * 4] = 18;
      shadows[i * 4 + 1] = 17;
      shadows[i * 4 + 2] = 15;
      shadows[i * 4 + 3] = Math.round(Math.pow(depth, 1.4) * 255);
      ridges[i * 4] = 214;
      ridges[i * 4 + 1] = 208;
      ridges[i * 4 + 2] = 186;
      ridges[i * 4 + 3] = Math.round(Math.pow(light, 1.15) * 255);
    }
  }
  return { charred, shadows, ridges };
}

/** A layer's smaller size, made across the tile's edge: the resampling kernel reaches
 * past the last pixel, and has to find the first one there or the edge shows as a line. */
async function shrinkTile(raw) {
  const CHANNELS = 4;
  const margin = 16;
  const PAD = (margin * SIZE) / LAYER_SIZE;
  const padded = SIZE + PAD * 2;
  const wrapped = Buffer.alloc(padded * padded * CHANNELS);
  for (let y = 0; y < padded; y++) {
    const row = (y - PAD + SIZE) % SIZE;
    for (let x = 0; x < padded; x++) {
      const from = (row * SIZE + ((x - PAD + SIZE) % SIZE)) * CHANNELS;
      raw.copy(wrapped, (y * padded + x) * CHANNELS, from, from + CHANNELS);
    }
  }
  const shrunk = await sharp(wrapped, { raw: { width: padded, height: padded, channels: CHANNELS } })
    .resize(LAYER_SIZE + margin * 2, LAYER_SIZE + margin * 2, { kernel: "lanczos3" })
    .png()
    .toBuffer();
  return sharp(shrunk).extract({ left: margin, top: margin, width: LAYER_SIZE, height: LAYER_SIZE });
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const { charred, shadows, ridges } = draw();
  const report = async (name, info) => console.log(`[wood] ${name}  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`);

  // A generous quality: the encoder's blocks know nothing of the far side of the tile,
  // and at a lower one its top and bottom rows stop matching and show as a line.
  await report(
    "char.webp",
    await sharp(charred, { raw: { width: SIZE, height: SIZE, channels: 3 } })
      .webp({ quality: 82, effort: 6, smartSubsample: false })
      .toFile(path.join(OUT, "char.webp")),
  );
  // The transparent layers are only ever seen faintly, so they can be smaller. Their
  // transparency keeps enough levels to fade smoothly: fewer than this and the wood
  // falls into flat terraces with a hard edge round each one.
  await report(
    "grain.webp",
    await (await shrinkTile(shadows)).webp({ quality: 20, alphaQuality: 60, effort: 6 }).toFile(path.join(OUT, "grain.webp")),
  );
  await report(
    "light.webp",
    await (await shrinkTile(ridges)).webp({ quality: 20, alphaQuality: 60, effort: 6 }).toFile(path.join(OUT, "light.webp")),
  );
}

main().catch((err) => {
  console.error("[build-wood] FAILED:", err.message);
  process.exitCode = 1;
});
