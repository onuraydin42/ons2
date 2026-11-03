/**
 * FLUID OUNCE — the product photographs, cut from the brand's 2026 brochure.
 *
 * Run with: node scripts/prepare-brochure.mjs "<path to FLUID OUNCE 2026.pdf>"
 * (needs mupdf for the run: npm i --no-save mupdf)
 *
 * Only pages 9, 10, 11, 12, 13, 14, 19, 20, 21, 24 and 27 may be used; the rest of
 * the brochure's photographs are not cleared for the site. Most of these sit on
 * white cards, so they are cut out: the white becomes transparency, the soft
 * shadows on it become translucent, and the product stands on the page itself.
 *
 *   public/images/brochure/*.webp
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as mupdf from "mupdf";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "images", "brochure");
const PDF = process.argv[2] ?? "C:/Users/User/Downloads/FLUID OUNCE 2026.pdf";

const ALLOWED = new Set([9, 10, 11, 12, 13, 14, 19, 20, 21, 24, 27]);

const WEBP = { quality: 82, alphaQuality: 90, effort: 6, smartSubsample: true };

/* What each output is. `image` is the page's nth embedded picture at its native
 * size; `render` is the page drawn at 4x, for pages whose picture is cut into tiles.
 * Polygons are in that source's pixels.
 *   protect  always opaque: frosted glass is too close to the white around it to
 *            tell apart by colour, so its shape is given.
 *   exclude  always transparent: words set on the photograph.
 *   keep     transparent outside: a mirrored floor's reflection is too bright and
 *            too broken to cut by colour, and the page has no mirror under it. */
const CUTS = [
  {
    name: "decanter",
    page: 11,
    image: [1059, 1485],
    protect: [
      [[322, 240], [486, 240], [596, 1262], [584, 1338], [244, 1338], [246, 1285]],
      [[756, 822], [834, 822], [888, 1392], [886, 1426], [708, 1426], [708, 1392]],
    ],
  },
  {
    name: "box",
    page: 9,
    image: [1320, 1579],
    protect: [[[1000, 356], [1184, 356], [1224, 1520], [868, 1520]]],
  },
  { name: "box-open", page: 9, image: [1101, 1428] },
  {
    name: "caviar-closed",
    page: 12,
    render: { left: 740, top: 180, width: 1980, height: 2120 },
    keep: [[260, 14], [1744, 14], [1952, 1914], [1822, 2096], [165, 2100], [25, 1906]],
    maxWidth: 1500,
  },
  {
    name: "caviar-top",
    page: 13,
    image: [2940, 2140],
    keep: [[0, 0], [2940, 0], [2940, 1740], [2540, 1900], [2120, 1895], [2110, 1790], [930, 1790], [925, 1875], [410, 1875], [60, 1700], [0, 1650]],
    maxWidth: 1800,
  },
  {
    name: "caviar",
    page: 14,
    image: [2940, 2140],
    keep: [[0, 0], [2940, 0], [2940, 1480], [2565, 1850], [2113, 1800], [805, 1760], [300, 1728], [80, 1350], [0, 1240]],
    maxWidth: 1800,
  },
  { name: "coasters", page: 19, render: { left: 380, top: 600, width: 2640, height: 1290 }, maxWidth: 1800 },
  {
    name: "orchid",
    page: 27,
    image: [482, 791],
    protect: [[[292, 322], [326, 322], [328, 358], [340, 366], [370, 758], [370, 768], [256, 768], [256, 758], [278, 366], [290, 358]]],
    exclude: [[[0, 560], [245, 560], [245, 791], [0, 791]], [[0, 771], [482, 771], [482, 791], [0, 791]]],
  },
];

/* Kept as photographs, with their rounded card corners and anything else trimmed. */
const PLATES = [
  { name: "martini", page: 21, image: [1126, 1397], crop: { left: 10, top: 10, width: 1106, height: 1377 } },
  { name: "retail", page: 24, image: [656, 751], crop: { left: 44, top: 196, width: 366, height: 520 } },
];

const doc = mupdf.Document.openDocument(fs.readFileSync(PDF), "application/pdf");

function embeddedImage(page, width, height) {
  let found = null;
  doc
    .loadPage(page - 1)
    .toStructuredText("preserve-images")
    .walk({
      onImageBlock(_bbox, _matrix, image) {
        if (image.getWidth() === width && image.getHeight() === height) found = image;
      },
    });
  if (!found) throw new Error(`page ${page}: no ${width}x${height} image`);
  const pix = found.toPixmap();
  const rgb = pix.getColorSpace()?.getNumberOfComponents() === 3 ? pix : pix.convertToColorSpace(mupdf.ColorSpace.DeviceRGB);
  return sharp(Buffer.from(rgb.asPNG())).removeAlpha().raw().toBuffer({ resolveWithObject: true });
}

function renderedCrop(page, crop) {
  const pix = doc.loadPage(page - 1).toPixmap(mupdf.Matrix.scale(4, 4), mupdf.ColorSpace.DeviceRGB, false, true);
  return sharp(Buffer.from(pix.asPNG())).extract(crop).removeAlpha().raw().toBuffer({ resolveWithObject: true });
}

const source = (cut) => {
  if (!ALLOWED.has(cut.page)) throw new Error(`page ${cut.page} is not cleared for use`);
  return cut.image ? embeddedImage(cut.page, cut.image[0], cut.image[1]) : renderedCrop(cut.page, cut.render);
};

/** A polygon as a byte mask. */
function polygonMask(polygons, W, H) {
  const mask = new Uint8Array(W * H);
  for (const poly of polygons) {
    for (let y = 0; y < H; y++) {
      const xs = [];
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const [xa, ya] = poly[i];
        const [xb, yb] = poly[j];
        if (ya > y !== yb > y) xs.push(xa + ((y - ya) / (yb - ya)) * (xb - xa));
      }
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2) {
        for (let x = Math.ceil(xs[k]); x <= Math.floor(xs[k + 1]); x++) if (x >= 0 && x < W) mask[y * W + x] = 1;
      }
    }
  }
  return mask;
}

/**
 * White to transparency. The white is walked from the picture's edges: on through
 * anything very light, and on through neutral greys so long as they change gently,
 * which is what a soft shadow does and an object's edge does not. What the walk
 * reaches is un-mixed from white, so a shadow stays as translucent black. So does
 * the thin band where an object's edge is blended with the white, which is what
 * keeps a pale halo from showing on a darker ground.
 */
function cutOut(data, W, H, cut) {
  const protect = polygonMask(cut.protect ?? [], W, H);
  const exclude = polygonMask(cut.exclude ?? [], W, H);
  if (cut.keep) {
    const keep = polygonMask([cut.keep], W, H);
    for (let i = 0; i < W * H; i++) if (!keep[i]) exclude[i] = 1;
  }
  const lowest = new Uint8Array(W * H);
  const spread = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) {
    const r = data[i * 3];
    const g = data[i * 3 + 1];
    const b = data[i * 3 + 2];
    lowest[i] = Math.min(r, g, b);
    spread[i] = Math.max(r, g, b) - lowest[i];
  }

  const LIGHT = 214;
  const NEUTRAL = 14;
  const GENTLE = 9;
  // A shadow fades out long before it gets this dark; a black box starts here.
  const SHADOW_FLOOR = 105;
  const reached = new Uint8Array(W * H);
  const stack = [];
  const start = (i) => {
    if (!reached[i] && !protect[i] && lowest[i] >= LIGHT) {
      reached[i] = 1;
      stack.push(i);
    }
  };
  for (let x = 0; x < W; x++) {
    start(x);
    start((H - 1) * W + x);
  }
  for (let y = 0; y < H; y++) {
    start(y * W);
    start(y * W + W - 1);
  }
  while (stack.length) {
    const i = stack.pop();
    const x = i % W;
    const y = (i - x) / W;
    for (const [nx, ny] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) {
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const n = ny * W + nx;
      if (reached[n] || protect[n]) continue;
      const light = lowest[n] >= LIGHT;
      const gentleGrey = lowest[n] >= SHADOW_FLOOR && spread[n] <= NEUTRAL && Math.abs(lowest[n] - lowest[i]) <= GENTLE;
      if (light || gentleGrey) {
        reached[n] = 1;
        stack.push(n);
      }
    }
  }

  // The band: unreached pixels within two of something reached.
  const band = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (reached[i] || protect[i]) continue;
      for (let dy = -2; dy <= 2 && !band[i]; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && ny >= 0 && nx < W && ny < H && reached[ny * W + nx]) {
            band[i] = 1;
            break;
          }
        }
      }
    }
  }

  const out = Buffer.alloc(W * H * 4);
  for (let i = 0; i < W * H; i++) {
    let a = 1;
    if (exclude[i]) a = 0;
    else if (reached[i] || band[i]) {
      a = 1 - lowest[i] / 255;
      // The JPEG's faint noise on the white goes altogether.
      a = a < 0.03 ? 0 : a;
    }
    for (let c = 0; c < 3; c++) {
      const v = data[i * 3 + c];
      out[i * 4 + c] = a > 0 ? Math.round(Math.min(Math.max((v - (1 - a) * 255) / a, 0), 255)) : 0;
    }
    out[i * 4 + 3] = Math.round(a * 255);
  }
  return out;
}

/** The smallest box round what is there. */
function bounds(rgba, W, H) {
  let [left, top, right, bottom] = [W, H, 0, 0];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (rgba[(y * W + x) * 4 + 3] > 10) {
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
    }
  }
  return { left, top, width: right - left + 1, height: bottom - top + 1 };
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const meta = [];

  for (const cut of CUTS) {
    const { data, info } = await source(cut);
    const rgba = cutOut(data, info.width, info.height, cut);
    let image = sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } }).extract(bounds(rgba, info.width, info.height));
    if (cut.maxWidth) image = image.resize({ width: cut.maxWidth, withoutEnlargement: true, kernel: "lanczos3" });
    const written = await image.webp(WEBP).toFile(path.join(OUT, `${cut.name}.webp`));
    meta.push(`${cut.name}: ${written.width}x${written.height}, ${Math.round(written.size / 1024)} KB`);
  }

  for (const plate of PLATES) {
    if (!ALLOWED.has(plate.page)) throw new Error(`page ${plate.page} is not cleared for use`);
    const { data, info } = await embeddedImage(plate.page, plate.image[0], plate.image[1]);
    const written = await sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } })
      .extract(plate.crop)
      .webp({ quality: 82, effort: 6, smartSubsample: true })
      .toFile(path.join(OUT, `${plate.name}.webp`));
    meta.push(`${plate.name}: ${written.width}x${written.height}, ${Math.round(written.size / 1024)} KB`);
  }
  console.log(meta.join("\n"));
}

main().catch((err) => {
  console.error("[prepare-brochure] FAILED:", err.message);
  process.exitCode = 1;
});
