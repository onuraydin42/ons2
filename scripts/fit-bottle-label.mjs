/**
 * FLUID OUNCE — where the bottle's print and base are, in every film frame.
 *
 * Run with: node scripts/fit-bottle-label.mjs   (after npm run build-bottle has
 * cached the denoised film). The result, scripts/bottle-label.json, is checked in;
 * build-bottle reads it. Only run this again if the film changes.
 *
 * The film is far too soft to keep the small type on the bottle: its 360 kb/s
 * reduces "ULTRA PREMIUM" to a grey smear. But a rigid bottle on a turntable under
 * a fixed camera is a very small problem, so the print can be redrawn instead, if
 * it lands on the same pixels the real print did. This fits:
 *
 *  1. The camera and the turntable, to the printed front face: axis, distance,
 *     pitch, roll, and the plane of the face.
 *  2. Each frame's small departure from a perfectly steady turn: the turntable's
 *     speed wanders by a degree or so, more than enough to smear a stack of frames.
 *  3. The same for the back face, which has less to hold on to, so its camera is
 *     the front's and only sharp frames count.
 *  4. The bottle's square foot, so its outline can be drawn from geometry rather
 *     than from brightness, which comes and goes with the glare off the plinth.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RAW = path.join(ROOT, "node_modules", ".cache", "fluid-bottle", "denoised.raw");
const OUT = path.join(ROOT, "scripts", "bottle-label.json");

const CW = 520;
const CH = 1240;
const LEAD_IN = 45;
const LOOP = 618;
const FRAME = CW * CH * 3;
const STEP = (2 * Math.PI) / LOOP;

const fd = fs.openSync(RAW, "r");
const buffer = Buffer.alloc(FRAME);
const wrap = (n) => ((Math.round(n) % LOOP) + LOOP) % LOOP;

function boxBlur(src, r) {
  const tmp = new Float32Array(CW * CH);
  const dst = new Float32Array(CW * CH);
  for (let y = 0; y < CH; y++) {
    let s = 0;
    for (let x = -r; x <= r; x++) s += src[y * CW + Math.min(Math.max(x, 0), CW - 1)];
    for (let x = 0; x < CW; x++) {
      tmp[y * CW + x] = s / (2 * r + 1);
      s += src[y * CW + Math.min(x + r + 1, CW - 1)] - src[y * CW + Math.max(x - r, 0)];
    }
  }
  for (let x = 0; x < CW; x++) {
    let s = 0;
    for (let y = -r; y <= r; y++) s += tmp[Math.min(Math.max(y, 0), CH - 1) * CW + x];
    for (let y = 0; y < CH; y++) {
      dst[y * CW + x] = s / (2 * r + 1);
      s += tmp[Math.min(y + r + 1, CH - 1) * CW + x] - tmp[Math.max(y - r, 0) * CW + x];
    }
  }
  return dst;
}

function lumaOf(n) {
  fs.readSync(fd, buffer, 0, FRAME, (LEAD_IN + wrap(n)) * FRAME);
  const out = new Float32Array(CW * CH);
  for (let p = 0; p < CW * CH; p++) out[p] = 0.299 * buffer[p * 3] + 0.587 * buffer[p * 3 + 1] + 0.114 * buffer[p * 3 + 2];
  return out;
}

/** High-passed, so the frost's own shading does not count as a match. */
const highPassed = new Map();
function highPass(n, radius) {
  const key = `${wrap(n)}:${radius}`;
  if (highPassed.has(key)) return highPassed.get(key);
  const l = lumaOf(n);
  const low = boxBlur(boxBlur(l, radius), radius);
  const out = new Float32Array(CW * CH);
  for (let p = 0; p < CW * CH; p++) out[p] = l[p] - low[p];
  highPassed.set(key, out);
  return out;
}

const withTrig = (v) => ({
  ...v,
  cosT: Math.cos(v.tilt),
  sinT: Math.sin(v.tilt),
  cosP: Math.cos(v.pitch),
  sinP: Math.sin(v.pitch),
  cosR: Math.cos(v.roll),
  sinR: Math.sin(v.roll),
});

/** A point in bottle space (X across, Y down, Z out) to the crop, for one frame. */
function toCrop(C, n, n0, alpha, dt, X0, Y0, Z0) {
  const theta = -(n - n0) * STEP + alpha + dt;
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  const X = X0 * c + Z0 * s;
  const Zr = -X0 * s + Z0 * c;
  const Yr = Y0 + C.y0;
  const Y = Yr * C.cosP - Zr * C.sinP;
  const Z = Yr * C.sinP + Zr * C.cosP;
  const k = C.D / (C.D - Z);
  const x = (X - C.e) * k + C.e;
  const y = Y * k;
  return [C.ax + x * C.cosR - y * C.sinR, C.py + x * C.sinR + y * C.cosR];
}

function project(C, n, u, w, face, c) {
  const [x, y] = toCrop(C, n, face.n0, face.alpha, c ? c.dt : 0, u, w * Math.cos(face.tilt), face.r0 + w * Math.sin(face.tilt));
  return [x + (c ? c.dx : 0), y + (c ? c.dy : 0)];
}

function sample(img, x, y) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  if (x0 < 0 || y0 < 0 || x0 >= CW - 1 || y0 >= CH - 1) return 0;
  const tx = x - x0;
  const ty = y - y0;
  const p = y0 * CW + x0;
  return (img[p] * (1 - tx) + img[p + 1] * tx) * (1 - ty) + (img[p + CW] * (1 - tx) + img[p + CW + 1] * tx) * ty;
}

function stack(C, face, frames, corrections, radius) {
  const W = Math.round(face.u1 - face.u0);
  const H = Math.round(face.w1 - face.w0);
  const data = new Float32Array(W * H);
  for (const n of frames) {
    const img = highPass(n, radius);
    const c = corrections?.get(n) ?? null;
    for (let j = 0; j < H; j++) {
      const w = face.w0 + j + 0.5;
      for (let i = 0; i < W; i++) {
        const [x, y] = project(C, n, face.u0 + i + 0.5, w, face, c);
        data[j * W + i] += sample(img, x, y);
      }
    }
  }
  for (let i = 0; i < data.length; i++) data[i] /= frames.length;
  return { W, H, data };
}

function correlate(C, face, template, n, c, radius) {
  const img = highPass(n, radius);
  let st = 0;
  let ss = 0;
  let tt = 0;
  for (let j = 0; j < template.H; j += 2) {
    const w = face.w0 + j + 0.5;
    for (let i = 0; i < template.W; i += 2) {
      const [x, y] = project(C, n, face.u0 + i + 0.5, w, face, c);
      const v = sample(img, x, y);
      const t = template.data[j * template.W + i];
      st += v * t;
      ss += v * v;
      tt += t * t;
    }
  }
  return st / Math.sqrt(ss * tt + 1e-9);
}

function nelderMead(f, start, steps, iterations) {
  const n = start.length;
  let points = [start.slice()];
  for (let i = 0; i < n; i++) {
    const p = start.slice();
    p[i] += steps[i];
    points.push(p);
  }
  let values = points.map(f);
  for (let it = 0; it < iterations; it++) {
    const order = values.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]).map((o) => o[1]);
    points = order.map((i) => points[i]);
    values = order.map((i) => values[i]);
    const c = new Array(n).fill(0);
    for (let i = 0; i < n; i++) for (let d = 0; d < n; d++) c[d] += points[i][d] / n;
    const worst = points[n];
    const reflected = c.map((v, d) => v + (v - worst[d]));
    const fr = f(reflected);
    if (fr < values[0]) {
      const expanded = c.map((v, d) => v + 2 * (v - worst[d]));
      const fe = f(expanded);
      points[n] = fe < fr ? expanded : reflected;
      values[n] = Math.min(fe, fr);
    } else if (fr < values[n - 1]) {
      points[n] = reflected;
      values[n] = fr;
    } else {
      const contracted = c.map((v, d) => v + 0.5 * (worst[d] - v));
      const fc = f(contracted);
      if (fc < values[n]) {
        points[n] = contracted;
        values[n] = fc;
      } else {
        for (let i = 1; i <= n; i++) {
          points[i] = points[i].map((v, d) => points[0][d] + 0.5 * (v - points[0][d]));
          values[i] = f(points[i]);
        }
      }
    }
  }
  const best = values.indexOf(Math.min(...values));
  return { x: points[best], f: values[best] };
}

/** Each frame's correction, then median and Gaussian smoothing over the turn. */
function fitCorrections(C, face, template, frames, corrections, radius) {
  let total = 0;
  for (const n of frames) {
    const c0 = corrections.get(n);
    const r = nelderMead(
      (x) => -correlate(C, face, template, n, { dt: x[0], dx: x[1], dy: x[2] }, radius),
      [c0.dt, c0.dx, c0.dy],
      [0.008, 0.6, 0.6],
      34,
    );
    corrections.set(n, { dt: r.x[0], dx: r.x[1], dy: r.x[2] });
    total -= r.f;
  }
  const keys = ["dt", "dx", "dy"];
  const median = new Map();
  frames.forEach((n, i) => {
    const out = {};
    for (const key of keys) {
      const win = [];
      for (let j = -4; j <= 4; j++) win.push(corrections.get(frames[Math.min(Math.max(i + j, 0), frames.length - 1)])[key]);
      win.sort((a, b) => a - b);
      out[key] = win[4];
    }
    median.set(n, out);
  });
  frames.forEach((n, i) => {
    const out = { dt: 0, dx: 0, dy: 0 };
    let weight = 0;
    for (let j = -5; j <= 5; j++) {
      const w = Math.exp(-(j * j) / (2 * 2.5 * 2.5));
      weight += w;
      const m = median.get(frames[Math.min(Math.max(i + j, 0), frames.length - 1)]);
      for (const key of keys) out[key] += m[key] * w;
    }
    for (const key of keys) out[key] /= weight;
    corrections.set(n, out);
  });
  return total / frames.length;
}

const range = (centre, reach, step = 1) => {
  const out = [];
  for (let d = -reach; d <= reach; d += step) out.push(centre + d);
  return out;
};

/* ------------------------------------------------------------- the front */

let camera = { ax: 257.54, py: 421.5, D: 2507.7, y0: 110.15, e: 50.9, pitch: -0.129, roll: 0.008, tilt: 0.088 };
const front = { alpha: 0, n0: -2.8, tilt: 0.088, r0: 98.27, u0: -90, u1: 90, w0: -20, w1: 430 };
const frontFrames = range(0, 112);
const frontFix = new Map(frontFrames.map((n) => [n, { dt: 0, dx: 0, dy: 0 }]));
let template = stack(withTrig(camera), front, range(0, 16, 4), null, 6);

const KEYS = ["ax", "py", "D", "y0", "e", "pitch", "roll"];
for (let round = 0; round < 3; round++) {
  const spread = range(0, 112, 16);
  const f = (x) => {
    const C = withTrig({ ...camera, ...Object.fromEntries(KEYS.map((k, i) => [k, x[i]])) });
    const face = { ...front, n0: x[7], tilt: x[8], r0: x[9] };
    let total = 0;
    for (const n of spread) total += correlate(C, face, template, n, frontFix.get(n), 6);
    return -total / spread.length;
  };
  const res = nelderMead(
    f,
    [...KEYS.map((k) => camera[k]), front.n0, front.tilt, front.r0],
    [2, 6, 200, 4, 6, 0.008, 0.002, 1, 0.008, 3],
    140,
  );
  KEYS.forEach((k, i) => (camera[k] = res.x[i]));
  front.n0 = res.x[7];
  front.tilt = res.x[8];
  front.r0 = res.x[9];
  const C = withTrig(camera);
  const score = fitCorrections(C, front, template, frontFrames, frontFix, 6);
  template = stack(C, front, frontFrames.filter((_, i) => i % 3 === 0), frontFix, 6);
  console.log(`[front] round ${round}: correlation ${score.toFixed(4)}`);
}

/* -------------------------------------------------------------- the back */

highPassed.clear();
const C = withTrig(camera);

// Sharp frames only: the film's focus hunting all but wipes this small type.
const LOGO = { left: 124, top: 1024, width: 268, height: 170 };
const energies = [];
for (let n = 0; n < LOOP; n++) {
  const l = lumaOf(n);
  let e = 0;
  for (let y = LOGO.top + 1; y < LOGO.top + LOGO.height - 1; y++) {
    for (let x = LOGO.left + 1; x < LOGO.left + LOGO.width - 1; x++) {
      const p = y * CW + x;
      const v = 4 * l[p] - l[p - 1] - l[p + 1] - l[p - CW] - l[p + CW];
      e += v * v;
    }
  }
  energies.push(e);
}
const sharpLine = [...energies].sort((a, b) => a - b)[Math.floor(LOOP * 0.6)];
const isSharp = (n) => energies[wrap(n)] >= sharpLine;

const back = { alpha: Math.PI, n0: 3, tilt: 0.108, r0: 94.5, u0: -118, u1: 118, w0: 300, w1: 440 };
const backFrames = range(309, 104);
const backFix = new Map(backFrames.map((n) => [n, { dt: 0, dx: 0, dy: 0 }]));
const sharpBack = backFrames.filter(isSharp);
template = stack(C, back, sharpBack.filter((n) => Math.abs(n - 309) <= 50), null, 3);
for (let round = 0; round < 2; round++) {
  const score = fitCorrections(C, back, template, backFrames, backFix, 3);
  template = stack(C, back, sharpBack, backFix, 3);
  console.log(`[back]  round ${round}: correlation ${score.toFixed(4)}`);
}

/* ---------------------------------------------------------------- the foot */

highPassed.clear();
const footFrames = range(0, 309, 8);
const lumas = new Map(footFrames.map((n) => [n, lumaOf(n)]));
const inPoly = (poly, x, y) => {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};
const footCorners = (n, f) => {
  const pts = [];
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, -1], [-1, 1]]) {
    pts.push(toCrop(C, n, front.n0, 0, 0, f.cx + sx * f.half, f.y, f.cz + sz * f.half));
  }
  return pts;
};
// Against the plinth's black, frost is bright and everything else is not. What is
// fitted is the frost's edge, not the clear chamfer around it: dark inside counts
// for a little more, because the glare outside comes and goes.
const footCost = (x) => {
  const f = { half: x[0], y: x[1], cx: x[2], cz: x[3] };
  let wrong = 0;
  for (const n of footFrames) {
    const poly = footCorners(n, f);
    const l = lumas.get(n);
    for (let y = 900; y < 1020; y += 2) {
      for (let px = 60; px < 460; px += 2) {
        const bright = l[y * CW + px] > 165;
        const inside = inPoly(poly, px + 0.5, y + 0.5);
        if (inside && !bright) wrong += 1.4;
        else if (!inside && bright) wrong += 1;
      }
    }
  }
  return wrong;
};
let bestFoot = { x: [135, 430, 0, 0], f: Infinity };
for (const half of [128, 132, 136, 140]) {
  for (const y of [405, 420, 435]) {
    const c = footCost([half, y, 0, 0]);
    if (c < bestFoot.f) bestFoot = { x: [half, y, 0, 0], f: c };
  }
}
bestFoot = nelderMead(footCost, bestFoot.x, [6, 8, 4, 4], 110);
console.log("[foot]  half", bestFoot.x[0].toFixed(2), "y", bestFoot.x[1].toFixed(2), "offset", bestFoot.x[2].toFixed(2), bestFoot.x[3].toFixed(2), "wrong", bestFoot.f);

/* ------------------------------------------------------------------- out */

const round = (v, d) => +v.toFixed(d);
const series = (frames, fix) => frames.map((n) => {
  const c = fix.get(n);
  return [n, round(c.dt, 5), round(c.dx, 3), round(c.dy, 3)];
});
const saved = {
  camera: Object.fromEntries(Object.entries(camera).filter(([k]) => k !== "tilt").map(([k, v]) => [k, round(v, 5)])),
  faces: {
    front: { ...Object.fromEntries(Object.entries(front).map(([k, v]) => [k, round(v, 5)])), artwork: "bottle-label-front.svg", corrections: series(frontFrames, frontFix) },
    back: { ...Object.fromEntries(Object.entries(back).map(([k, v]) => [k, round(v, 5)])), artwork: "bottle-label-back.svg", corrections: series(backFrames, backFix) },
  },
  foot: { n0: round(front.n0, 5), half: round(bestFoot.x[0], 3), y: round(bestFoot.x[1], 3), cx: round(bestFoot.x[2], 3), cz: round(bestFoot.x[3], 3) },
};
fs.writeFileSync(OUT, `${JSON.stringify(saved)}\n`);
console.log(`[out]   ${path.relative(ROOT, OUT)}`);
