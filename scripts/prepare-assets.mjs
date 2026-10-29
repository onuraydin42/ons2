/**
 * FLUID OUNCE — asset preparation.
 *
 * Repeatable and idempotent. Run with: npm run prepare-assets
 *
 *  1. Moves the source photography out of the image folder into public/images/
 *     (cocktails/ + editorial/) as .webp.
 *  2. Copies the bottle film into public/media/.
 *  3. Keys the solid white background out of the brand logo and writes
 *     public/logo.png, public/favicon.ico and public/apple-touch-icon.png.
 */

import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";
import pngToIco from "png-to-ico";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = path.join(ROOT, "public");

const WEBP_QUALITY = 88;

/* Ambient wash behind the Collection stage — pre-blurred so the browser never
 * has to run a large CSS blur while switching cocktails. */
const BLUR_PLATE_WIDTH = 40;

/* The photo source folder is called `image2` in some drops and `images2` in
 * others, and the extensions vary (.jpg / .jpeg / .png). Both are detected. */
const PHOTO_DIR_CANDIDATES = ["image2", "images2"];

const COCKTAILS = ["cosmo", "velvet", "blonde", "vesper"];
/* boxx is the boxed presentation — the Liquor Store plate on /order, and the
 * bottle-and-box still in the Discover section. */
const EDITORIAL = ["glass", "lux", "lux2", "boxx"];
const IMAGE_EXTS = [".webp", ".png", ".jpg", ".jpeg", ".jfif", ".avif", ".tif", ".tiff"];

/* The rotating-bottle film: the opening, the Restaurant presentation on
 * /order, and the media page all play it. It ships as-is — it is already a
 * lean H.264 file and there is no encoder in this toolchain. Its poster,
 * public/media/rotate-poster.webp, is the film's first frame; if the film is
 * ever replaced, export a new first frame over it so the two still match. */
const FILMS = ["rotate"];
const VIDEO_EXTS = [".mp4"];

/* Anything with every channel at or above WHITE_MAX is background and becomes
 * fully transparent; the band down to WHITE_MIN ramps out so antialiased glyph
 * edges keep a soft shoulder instead of turning into stair-steps. */
const WHITE_MAX = 245;
const WHITE_MIN = 230;

const log = (...a) => console.log(...a);

async function ensureDir(p) {
  await fsp.mkdir(p, { recursive: true });
}

function isImage(name) {
  return IMAGE_EXTS.includes(path.extname(name).toLowerCase());
}

/* ------------------------------------------------------------------ photos */

function resolvePhotoDir() {
  for (const dir of PHOTO_DIR_CANDIDATES) {
    const full = path.join(ROOT, dir);
    if (fs.existsSync(full) && fs.statSync(full).isDirectory()) return full;
  }
  throw new Error(`Photo folder not found (looked for: ${PHOTO_DIR_CANDIDATES.join(", ")}).`);
}

/** Finds `stem` in the listing regardless of extension or case. */
function findByStem(files, stem) {
  const hit = files.find(
    (f) => path.basename(f, path.extname(f)).toLowerCase() === stem.toLowerCase() && isImage(f),
  );
  if (!hit) throw new Error(`Missing source image for "${stem}".`);
  return hit;
}

async function buildPhotos(photoDir) {
  const files = await fsp.readdir(photoDir);
  log(`\n[photos] source: ${path.relative(ROOT, photoDir)}/`);

  const cocktailDir = path.join(PUBLIC, "images", "cocktails");
  const editorialDir = path.join(PUBLIC, "images", "editorial");
  await ensureDir(cocktailDir);
  await ensureDir(editorialDir);

  const groups = [
    [COCKTAILS, cocktailDir, "cocktails"],
    [EDITORIAL, editorialDir, "editorial"],
  ];

  for (const [stems, dir, label] of groups) {
    for (const stem of stems) {
      const src = path.join(photoDir, findByStem(files, stem));
      const dest = path.join(dir, `${stem}.webp`);
      await sharp(src).webp({ quality: WEBP_QUALITY }).toFile(dest);
      const { width, height } = await sharp(dest).metadata();
      log(`[photos] ${label}/${stem}.webp  ${width}x${height}`);

      /* The Collection section puts a hugely blurred copy of the active card
       * behind it as an ambient wash. Doing that with a CSS filter means the
       * browser re-blurs a 1086x1448 bitmap at full-viewport size on every
       * switch, which is what made changing cocktails feel slow.
       *
       * Blurring here instead, at 40px wide, turns that into a ~1KB image the
       * GPU simply stretches. Same look, none of the per-switch cost. */
      if (label === "cocktails") {
        const blurDest = path.join(dir, `${stem}-blur.webp`);
        await sharp(src)
          .resize({ width: BLUR_PLATE_WIDTH })
          .blur(6)
          .webp({ quality: 72 })
          .toFile(blurDest);
        const bytes = (await fsp.stat(blurDest)).size;
        log(`[photos] ${label}/${stem}-blur.webp  ${BLUR_PLATE_WIDTH}px  ${bytes} B`);
      }
    }
  }
}

/* ------------------------------------------------------------------- films */

async function buildFilms(photoDir) {
  const files = await fsp.readdir(photoDir);
  const mediaDir = path.join(PUBLIC, "media");
  await ensureDir(mediaDir);

  for (const stem of FILMS) {
    const hit = files.find(
      (f) =>
        path.basename(f, path.extname(f)).toLowerCase() === stem &&
        VIDEO_EXTS.includes(path.extname(f).toLowerCase()),
    );
    if (!hit) throw new Error(`Missing source film for "${stem}".`);

    const dest = path.join(mediaDir, `${stem}${path.extname(hit).toLowerCase()}`);
    await fsp.copyFile(path.join(photoDir, hit), dest);
    const bytes = (await fsp.stat(dest)).size;
    log(`\n[films]  media/${path.basename(dest)}  ${(bytes / 1024 / 1024).toFixed(1)} MB`);
  }
}

/* -------------------------------------------------------------------- logo */

/**
 * Keys a solid white background out to full transparency.
 *
 * Uses the *minimum* channel rather than a weighted luminance: white is the
 * only colour where all three channels are simultaneously pinned high, so
 * min(r,g,b) rejects bright-but-saturated brand colours (the gold here) that a
 * luma calculation would happily erase.
 */
async function keyWhiteToAlpha(srcPath) {
  const { data, info } = await sharp(srcPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const span = WHITE_MAX - WHITE_MIN;

  for (let i = 0; i < data.length; i += info.channels) {
    const min = Math.min(data[i], data[i + 1], data[i + 2]);
    if (min >= WHITE_MAX) {
      data[i + 3] = 0;
    } else if (min > WHITE_MIN) {
      const keep = Math.round((255 * (WHITE_MAX - min)) / span);
      data[i + 3] = Math.min(data[i + 3], keep);
    }
  }

  // Trim the now-transparent margin so the mark sits tight in its box.
  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: info.channels },
  })
    .png()
    .trim({ threshold: 1 })
    .toBuffer({ resolveWithObject: true });
}

/**
 * Splits the lockup into its horizontal bands of opaque pixels.
 *
 * The supplied logo is a monogram sitting above a small "FLUID OUNCE"
 * wordmark. At navbar scale that wordmark collapses into an illegible smudge,
 * so small placements get the monogram alone. The two are separated by a fully
 * transparent gutter, which makes the split detectable rather than guessed.
 */
async function findBands(pngBuffer) {
  const { data, info } = await sharp(pngBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const bands = [];
  let start = null;

  for (let y = 0; y < info.height; y += 1) {
    let opaque = false;
    for (let x = 0; x < info.width; x += 1) {
      if (data[(y * info.width + x) * info.channels + 3] > 12) {
        opaque = true;
        break;
      }
    }
    if (opaque && start === null) start = y;
    if (!opaque && start !== null) {
      bands.push([start, y - 1]);
      start = null;
    }
  }
  if (start !== null) bands.push([start, info.height - 1]);

  return { bands, width: info.width, height: info.height };
}

async function buildLogo(photoDir) {
  const files = await fsp.readdir(photoDir);
  const src = path.join(photoDir, findByStem(files, "logo"));
  log(`\n[logo]   source: ${path.basename(src)}`);

  const { data: logoPng, info } = await keyWhiteToAlpha(src);
  await fsp.writeFile(path.join(PUBLIC, "logo.png"), logoPng);
  log(`[logo]   public/logo.png  ${info.width}x${info.height}  (white keyed out, alpha preserved)`);

  // Monogram only — everything above the final transparent gutter.
  const { bands, width } = await findBands(logoPng);
  let markPng = logoPng;

  if (bands.length > 1) {
    const monogram = bands.slice(0, -1);
    const bottom = monogram[monogram.length - 1][1];
    markPng = await sharp(logoPng)
      .extract({ left: 0, top: 0, width, height: bottom + 1 })
      .trim({ threshold: 1 })
      .png()
      .toBuffer();
    log(`[logo]   detected ${bands.length} bands — wordmark cropped off for small placements`);
  } else {
    log("[logo]   single band — mark and lockup are identical");
  }

  const markMeta = await sharp(markPng).metadata();
  await fsp.writeFile(path.join(PUBLIC, "logo-mark.png"), markPng);
  log(`[logo]   public/logo-mark.png  ${markMeta.width}x${markMeta.height}`);

  // Square, transparent, contain-fit renditions for the icon set. The monogram
  // is used here for the same legibility reason as the navbar.
  const square = (size) =>
    sharp(markPng)
      .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();

  await fsp.writeFile(path.join(PUBLIC, "apple-touch-icon.png"), await square(180));
  log("[logo]   public/apple-touch-icon.png  180x180");

  const ico = await pngToIco([await square(16), await square(32), await square(48)]);
  await fsp.writeFile(path.join(PUBLIC, "favicon.ico"), ico);
  log("[logo]   public/favicon.ico  16/32/48");

  return {
    logo: { width: info.width, height: info.height },
    mark: { width: markMeta.width, height: markMeta.height },
  };
}

/* -------------------------------------------------------------- dimensions */

/** Keeps the intrinsic logo dimensions in lib/brand.ts honest. */
async function patchBrandDimensions(dims) {
  const target = path.join(ROOT, "lib", "brand.ts");
  if (!fs.existsSync(target)) {
    log("[dims]   lib/brand.ts not generated yet");
    return;
  }

  const src = await fsp.readFile(target, "utf8");
  const next = src
    .replace(/export const LOGO_WIDTH\s*=\s*\d+\s*;/, `export const LOGO_WIDTH = ${dims.logo.width};`)
    .replace(
      /export const LOGO_HEIGHT\s*=\s*\d+\s*;/,
      `export const LOGO_HEIGHT = ${dims.logo.height};`,
    )
    .replace(/export const MARK_WIDTH\s*=\s*\d+\s*;/, `export const MARK_WIDTH = ${dims.mark.width};`)
    .replace(
      /export const MARK_HEIGHT\s*=\s*\d+\s*;/,
      `export const MARK_HEIGHT = ${dims.mark.height};`,
    );

  if (next !== src) {
    await fsp.writeFile(target, next);
    log(
      `[dims]   lib/brand.ts -> logo ${dims.logo.width}x${dims.logo.height}, mark ${dims.mark.width}x${dims.mark.height}`,
    );
  } else {
    log("[dims]   lib/brand.ts already in sync");
  }
}

/* ----------------------------------------------------------------- listing */

async function printTree(dir, indent = "  ") {
  const rel = path.relative(ROOT, dir).replace(/\\/g, "/");
  const items = (await fsp.readdir(dir, { withFileTypes: true })).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  const dirs = items.filter((i) => i.isDirectory());
  const filesOnly = items.filter((i) => i.isFile());

  log(`${indent}${rel}/`);
  if (filesOnly.length > 8) {
    const first = filesOnly.slice(0, 3).map((f) => f.name);
    const last = filesOnly[filesOnly.length - 1].name;
    log(`${indent}  ${first.join(", ")} … ${last}   (${filesOnly.length} files)`);
  } else {
    for (const f of filesOnly) log(`${indent}  ${f.name}`);
  }
  for (const d of dirs) await printTree(path.join(dir, d.name), indent);
}

/* --------------------------------------------------------------------- run */

async function main() {
  const started = Date.now();
  log("FLUID OUNCE — preparing assets");

  await ensureDir(PUBLIC);
  const photoDir = resolvePhotoDir();

  await buildPhotos(photoDir);
  await buildFilms(photoDir);
  const dims = await buildLogo(photoDir);
  await patchBrandDimensions(dims);

  log("\n──────────────────────────────────────────────");
  log("RESOLVED PUBLIC DIRECTORY");
  log("──────────────────────────────────────────────");
  await printTree(PUBLIC);

  log("\n──────────────────────────────────────────────");
  log(`done in ${((Date.now() - started) / 1000).toFixed(1)}s`);
  log("──────────────────────────────────────────────");
}

main().catch((err) => {
  console.error("\n[prepare-assets] FAILED:", err.message);
  process.exitCode = 1;
});
