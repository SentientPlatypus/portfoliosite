import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, RotateCcw } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import {
  H_CODE,
  KERNEL,
  K_EXTEND,
  Pipeline,
  RATE,
  SEED,
  SPOT,
  TAU,
  breedenLitzenberger,
  bsCall,
  pBelow,
  runPipeline,
  sviG,
  sviW,
} from './optionsPdfMath';

/** Every step maps to real code in OptionsImpliedPDF.jl (src/data.jl, functions.jl, svi.jl, bs.jl). */
type Step = { title: string; caption: string; formula: string; dur: number };
const STEPS: Step[] = [
  {
    title: 'The raw options chain',
    caption:
      'For each strike K, the chain lists what buyers bid and sellers ask, for calls and for puts. The package takes the middle of each quote as its price (or the last trade if a side has no quote).',
    formula: 'mid = (bid + ask) / 2',
    dur: 3.2,
  },
  {
    title: 'Keep out-of-the-money options',
    caption:
      'In-the-money options trade thinly and their prices are noisy, so only rows yfinance marks inTheMoney = false are kept: calls with strikes above spot, puts with strikes below.',
    formula: 'keep rows where inTheMoney == false',
    dur: 2.8,
  },
  {
    title: 'Turn puts into calls (put–call parity)',
    caption:
      'The math downstream needs one curve of call prices. Each kept put becomes the equivalent call price at the same strike, and the rows are sorted by strike.',
    formula: 'C = P + S − K·e^(−rτ)   (r = 0.01, τ = 30/365)',
    dur: 3,
  },
  {
    title: 'Implied volatility by Newton’s method',
    caption:
      'Each price is run backwards through Black–Scholes: which volatility σ makes the model price match the market? Newton starts at σ = 0.20 and corrects by price error ÷ vega until the error is below 1e−8.',
    formula: 'σ ← σ − (BS(σ) − C_mkt) / vega',
    dur: 4.5,
  },
  {
    title: 'Smooth the smile, drop failures',
    caption:
      'A Gaussian kernel averages each implied vol with up to 5 neighbouring rows on each side (by row, not strike distance) to wash out quote noise. A failed (NaN) vol is not skipped, so it turns every smoothed value within 5 rows into NaN too; all NaN rows are then removed.',
    formula: 'σ̃ᵢ = Σⱼ wⱼσⱼ / Σⱼ wⱼ,   wⱼ = e^(−(i−j)²/(2·5²)),  |i−j| ≤ 5',
    dur: 4,
  },
  {
    title: 'Switch to SVI coordinates',
    caption:
      'SVI is fit in log-moneyness against total variance. F is the forward price; in these units the smile becomes a smooth, almost hyperbolic curve.',
    formula: 'k = ln(K/F),   w = σ²τ,   F = S·e^(rτ)',
    dur: 2.8,
  },
  {
    title: 'Fit the SVI curve (Nelder–Mead)',
    caption:
      'A 5-parameter SVI curve is fit to the points by least squares with Nelder–Mead (4000 iterations), with heavy penalties if the fitted variance would go negative.',
    formula: 'w(k) = a + b(ρ(k−m) + √((k−m)² + σ²))',
    dur: 4.5,
  },
  {
    title: 'Check for butterfly arbitrage',
    caption:
      'A smile can fit the data yet still imply negative probabilities. The package evaluates g(k) on 401 points across the data range; if any value is below 0 it throws an error instead of returning a PDF.',
    formula: 'g(k) = (1 − k·w′/2w)² − (w′²/4)(1/w + 1/4) + w″/2 ≥ 0',
    dur: 3.2,
  },
  {
    title: 'Back to clean call prices',
    caption:
      'With a smooth σ(K) from SVI, Black–Scholes now gives a clean call price at any strike. This smooth curve, not the noisy quotes, is what gets differentiated next.',
    formula: 'C(K) = BS(S, K, τ, r, σ_SVI(K)),   σ_SVI = √(w(ln K/F)/τ)',
    dur: 3,
  },
  {
    title: 'Breeden–Litzenberger: curvature = density',
    caption:
      'Buy a call at K−h and one at K+h, sell two at K: this butterfly only pays if the stock ends near K, so its cost measures the probability of ending there. Dividing by h² gives the density. Code uses h = 0.001; drawn with h = 6 so you can see it.',
    formula: 'f(K) = e^(rτ) · (C(K+h) − 2C(K) + C(K−h)) / h²',
    dur: 5,
  },
  {
    title: 'Read off probabilities',
    caption:
      'Adding up the density from K = 1 to your strike (trapezoid rule, 10,000 steps) gives the market-implied chance the stock finishes below it; one minus that is the chance it finishes at or above.',
    formula: 'P(S_T < K) = ∫₁ᴷ f(x) dx,   P(S_T ≥ K) = 1 − P(S_T < K)',
    dur: 3.5,
  },
];
const N_STEPS = STEPS.length;
const H_VISUAL = 6;
const K_MIN_UI = 84;
const K_MAX_UI = 116;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const hexAlpha = (hex: string, a: number) => {
  if (!hex.startsWith('#')) return hex;
  const h = hex.replace('#', '');
  const n = h.length === 3 ? h.split('').map((c) => c + c).join('') : h.slice(0, 6);
  return `rgba(${parseInt(n.slice(0, 2), 16)},${parseInt(n.slice(2, 4), 16)},${parseInt(n.slice(4, 6), 16)},${a})`;
};

type Colors = {
  fg: string;
  comment: string;
  method: string;
  editor: string;
  border: string;
  string: string;
  keyword: string;
  number: string;
  variable: string;
  type: string;
};

/** ≥12px labels from ~700px wide (desktop panel); smaller only on phones. */
const typeScale = (w: number) => {
  const t = Math.max(0, Math.min(1, (w - 390) / 310));
  return { title: 12 + t * 3, label: 10 + t * 3, small: 10 + t * 2 };
};
type TypeScale = ReturnType<typeof typeScale>;

const font = (ctx: CanvasRenderingContext2D, px: number, weight = '500') => {
  ctx.font = `${weight} ${px}px ui-monospace, SFMono-Regular, Menlo, monospace`;
};
const text = (
  ctx: CanvasRenderingContext2D,
  s: string,
  x: number,
  y: number,
  color: string,
  align: CanvasTextAlign = 'left',
) => {
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
};
const lin = (d0: number, d1: number, r0: number, r1: number) => (v: number) =>
  r0 + ((v - d0) / (d1 - d0 || 1)) * (r1 - r0);
const pad = (lo: number, hi: number, f = 0.08) => {
  const s = hi - lo || 1;
  return [lo - s * f, hi + s * f] as const;
};
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const phase = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2);
const mix = (a: number, b: number, u: number) => a + (b - a) * u;
const dot = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, c: string) => {
  ctx.beginPath();
  ctx.fillStyle = c;
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
};
const line = (ctx: CanvasRenderingContext2D, pts: [number, number][], c: string, lw = 1.6, dash?: number[]) => {
  if (!pts.length) return;
  ctx.beginPath();
  ctx.strokeStyle = c;
  ctx.lineWidth = lw;
  ctx.setLineDash(dash ?? []);
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.stroke();
  ctx.setLineDash([]);
};

type Box = { l: number; r: number; t: number; b: number };
const frame = (w: number, h: number, fs: TypeScale): Box => ({
  l: 16 + fs.small * 2.6,
  r: w - 14,
  t: 14 + fs.label * 1.6 + fs.small * 1.6,
  b: h - 14 - fs.small * 1.6,
});
const axes = (ctx: CanvasRenderingContext2D, bx: Box, pal: Colors, fs: TypeScale, xl: string, yl: string, alpha = 1) => {
  ctx.globalAlpha = alpha;
  line(ctx, [[bx.l, bx.t], [bx.l, bx.b], [bx.r, bx.b]], hexAlpha(pal.comment, 0.5), 1);
  font(ctx, fs.small);
  text(ctx, xl, bx.r, bx.b + fs.small * 1.1, pal.comment, 'right');
  text(ctx, yl, bx.l - 4, bx.t - fs.small * 1.1, pal.comment, 'left');
  ctx.globalAlpha = 1;
};
const legend = (ctx: CanvasRenderingContext2D, items: [string, string][], x: number, y: number, fs: TypeScale) => {
  font(ctx, fs.small);
  let cx = x;
  for (let i = items.length - 1; i >= 0; i--) {
    const [label, c] = items[i];
    const wd = ctx.measureText(label).width;
    text(ctx, label, cx, y, c, 'right');
    dot(ctx, cx - wd - 8, y, 3.5, c);
    cx -= wd + 22;
  }
};

type Extra = {
  kPts: { k: number; w: number; K: number; iv: number }[];
  dropped: number[];
  gK: number[];
  gV: number[];
  cumBelow: number[];
  pdfMax: number;
};

function buildExtra(p: Pipeline): Extra {
  const kPts = p.filtered.map((r) => ({ K: r.strike, iv: r.iv, k: Math.log(r.strike / p.F), w: r.iv * r.iv * TAU }));
  const dropped = p.withIv.map((_, i) => i).filter((i) => !Number.isFinite(p.smoothed[i]));
  const ks = kPts.map((q) => q.k);
  const k0 = Math.min(...ks) - K_EXTEND;
  const k1 = Math.max(...ks) + K_EXTEND;
  const gK: number[] = [];
  const gV: number[] = [];
  const f = p.fit;
  for (let i = 0; i < 401; i++) {
    const k = k0 + ((k1 - k0) * i) / 400;
    gK.push(k);
    gV.push(sviG(k, f.a, f.b, f.rho, f.m, f.sigma));
  }
  const cumBelow = [pBelow(p.pdfK[0], p.ivFun)];
  for (let i = 1; i < p.pdfK.length; i++) {
    cumBelow.push(cumBelow[i - 1] + 0.5 * (p.pdfY[i] + p.pdfY[i - 1]) * (p.pdfK[i] - p.pdfK[i - 1]));
  }
  return { kPts, dropped, gK, gV, cumBelow, pdfMax: Math.max(...p.pdfY) };
}

type DrawArgs = {
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
  pal: Colors;
  p: Pipeline;
  x: Extra;
  t: number;
  fs: TypeScale;
  K: number;
};

// ---- shared scales ----
const strikeX = (bx: Box) => lin(60, 140, bx.l + 4, bx.r - 4);
const priceY = (p: Pipeline, bx: Box) => {
  const hi = Math.max(...p.calls.map((c) => c.ask), ...p.puts.map((q) => q.ask), ...p.paritized.map((r) => r.price));
  return lin(0, hi * 1.05, bx.b, bx.t);
};
const ivY = (p: Pipeline, bx: Box) => {
  const ivs = p.withIv.map((r) => r.iv).filter(Number.isFinite);
  const [lo, hi] = pad(Math.min(...ivs), Math.max(...ivs), 0.12);
  return lin(lo, hi, bx.b, bx.t);
};
const kwScales = (x: Extra, bx: Box) => {
  const ks = x.kPts.map((q) => q.k);
  const ws = x.kPts.map((q) => q.w);
  const [k0, k1] = pad(Math.min(...ks), Math.max(...ks), 0.04);
  const [w0, w1] = pad(Math.min(...ws), Math.max(...ws), 0.12);
  return { kx: lin(k0, k1, bx.l + 4, bx.r - 4), wy: lin(w0, w1, bx.b, bx.t), k0, k1 };
};

function header(a: DrawArgs, i: number, right?: string) {
  const { ctx, pal, fs, w } = a;
  font(ctx, fs.label, '600');
  text(ctx, `${i + 1}/${N_STEPS}  ${STEPS[i].title}`, 14, 12 + fs.label * 0.5, pal.method);
  if (right && w > 520) {
    font(ctx, fs.small);
    text(ctx, right, w - 14, 12 + fs.label * 0.5, pal.comment, 'right');
  }
}

function spotLine(a: DrawArgs, bx: Box, X: (v: number) => number) {
  line(a.ctx, [[X(SPOT), bx.t], [X(SPOT), bx.b]], hexAlpha(a.pal.method, 0.6), 1, [4, 4]);
  font(a.ctx, a.fs.small);
  text(a.ctx, `spot ${SPOT}`, X(SPOT) + 4, bx.t + a.fs.small * 0.6, a.pal.method);
}

// 1. raw chain: bars grow, then mids pop in
function drawRaw(a: DrawArgs) {
  const { ctx, p, pal, fs, t } = a;
  const bx = frame(a.w, a.h, fs);
  header(a, 0, 'synthetic chain');
  axes(ctx, bx, pal, fs, 'strike K', 'price');
  const X = strikeX(bx);
  const Y = priceY(p, bx);
  const grow = ease(phase(t, 0, 0.55));
  const mids = phase(t, 0.55, 0.85);
  const bw = Math.max(1.5, (bx.r - bx.l) / 33 / 4);
  for (const q of [...p.calls, ...p.puts]) {
    const c = q.kind === 'call' ? pal.type : pal.keyword;
    const xx = X(q.strike) + (q.kind === 'call' ? -bw : bw);
    const m = Y(q.mid);
    ctx.globalAlpha = 1 - 0.55 * mids;
    line(ctx, [[xx, mix(m, Y(q.bid), grow)], [xx, mix(m, Y(q.ask), grow)]], c, bw * 1.2);
    ctx.globalAlpha = 1;
    if (mids > 0) dot(ctx, xx, m, 2.8 * mids, c);
  }
  spotLine(a, bx, X);
  legend(ctx, [['call', pal.type], ['put', pal.keyword]], bx.r, bx.t + fs.small * 0.6 + (a.w > 520 ? 0 : fs.small * 1.4), fs);
  if (mids > 0.5) {
    font(ctx, fs.small);
    ctx.globalAlpha = phase(mids, 0.5, 1);
    text(ctx, 'bar = bid→ask   dot = mid', bx.l + 8, bx.b - fs.small, pal.fg);
    ctx.globalAlpha = 1;
  }
}

// 2. ITM fade out
function drawOtm(a: DrawArgs) {
  const { ctx, p, pal, fs, t } = a;
  const bx = frame(a.w, a.h, fs);
  header(a, 1, 'synthetic chain');
  axes(ctx, bx, pal, fs, 'strike K', 'price');
  const X = strikeX(bx);
  const Y = priceY(p, bx);
  const f = ease(phase(t, 0.15, 0.75));
  for (const q of [...p.calls, ...p.puts]) {
    const c = q.kind === 'call' ? pal.type : pal.keyword;
    const al = q.inTheMoney ? 1 - 0.9 * f : 1;
    ctx.globalAlpha = al;
    dot(ctx, X(q.strike), Y(q.mid), q.inTheMoney ? 2.8 : 2.8 + 0.8 * f, c);
    ctx.globalAlpha = 1;
  }
  // shade ITM regions
  ctx.fillStyle = hexAlpha(pal.comment, 0.08 * f);
  ctx.fillRect(bx.l, bx.t, X(SPOT) - bx.l, bx.b - bx.t);
  ctx.fillRect(X(SPOT), bx.t, bx.r - X(SPOT), bx.b - bx.t);
  spotLine(a, bx, X);
  font(ctx, fs.small);
  ctx.globalAlpha = f;
  text(ctx, 'OTM puts (K < S)', mix(bx.l, X(SPOT), 0.5), bx.b - fs.small * 3.2, pal.keyword, 'center');
  text(ctx, 'OTM calls (K > S)', mix(X(SPOT), bx.r, 0.5), bx.b - fs.small * 3.2, pal.type, 'center');
  text(ctx, 'ITM rows dropped', mix(bx.l, X(SPOT), 0.5), bx.t + fs.small * 2.4, pal.comment, 'center');
  ctx.globalAlpha = 1;
  legend(ctx, [['call', pal.type], ['put', pal.keyword]], bx.r, bx.t + fs.small * 0.6 + (a.w > 520 ? 0 : fs.small * 1.4), fs);
}

// 3. puts fly up via parity, line joins
function drawParity(a: DrawArgs) {
  const { ctx, p, pal, fs, t } = a;
  const bx = frame(a.w, a.h, fs);
  header(a, 2, 'synthetic chain');
  axes(ctx, bx, pal, fs, 'strike K', 'call price');
  const X = strikeX(bx);
  const Y = priceY(p, bx);
  const fly = ease(phase(t, 0.1, 0.65));
  const join = phase(t, 0.65, 0.95);
  for (const r of p.paritized) {
    const y = r.from === 'put' ? mix(Y(r.raw), Y(r.price), fly) : Y(r.price);
    if (r.from === 'put' && fly > 0 && fly < 1) {
      line(ctx, [[X(r.strike), Y(r.raw)], [X(r.strike), y]], hexAlpha(pal.string, 0.35), 1, [2, 3]);
    }
    const c = r.from === 'put' ? (fly < 1 ? pal.keyword : pal.string) : pal.type;
    dot(ctx, X(r.strike), y, 3.4, c);
  }
  if (join > 0) {
    const n = Math.max(2, Math.floor(join * p.paritized.length));
    line(ctx, p.paritized.slice(0, n).map((r) => [X(r.strike), Y(r.price)]), pal.variable, 1.6);
  }
  spotLine(a, bx, X);
  legend(ctx, [['OTM call', pal.type], ['put → call', pal.string]], bx.r, bx.t + fs.small * 0.6 + (a.w > 520 ? 0 : fs.small * 1.4), fs);
}

// 4. Newton: dots morph price -> sigma sequentially, inset trace
function drawNewton(a: DrawArgs) {
  const { ctx, p, pal, fs, t } = a;
  const bx = frame(a.w, a.h, fs);
  header(a, 3);
  const X = strikeX(bx);
  const PY = priceY(p, bx);
  const VY = ivY(p, bx);
  const n = p.withIv.length;
  const prog = phase(t, 0.05, 0.85) * n;
  axes(ctx, bx, pal, fs, 'strike K', prog < n / 2 ? 'call price → implied vol σ' : 'implied vol σ');
  let cur = -1;
  p.withIv.forEach((r, i) => {
    const u = ease(clamp01(prog - i));
    if (u > 0 && u < 1) cur = i;
    if (!Number.isFinite(r.iv)) {
      ctx.globalAlpha = 1 - u * 0.4;
      dot(ctx, X(r.strike), PY(r.price), 3, u > 0.5 ? pal.keyword : pal.variable);
      ctx.globalAlpha = 1;
      if (u > 0.5) {
        font(ctx, fs.small);
        text(ctx, 'NaN', X(r.strike), PY(r.price) - fs.small, pal.keyword, 'center');
      }
      return;
    }
    dot(ctx, X(r.strike), mix(PY(r.price), VY(r.iv), u), 3.2, u >= 1 ? pal.number : pal.variable);
  });
  if (cur < 0 && prog < n) cur = Math.min(n - 1, Math.floor(prog));
  if (cur >= 0 && prog < n) {
    const r = p.withIv[cur];
    const tr = r.trace;
    const iw = Math.min(230, (bx.r - bx.l) * 0.5);
    const ih = Math.min(110, (bx.b - bx.t) * 0.38);
    const ix = bx.r - iw;
    const iy = bx.t + fs.small * 1.8;
    ctx.fillStyle = hexAlpha(pal.editor, 0.92);
    ctx.fillRect(ix, iy, iw, ih);
    ctx.strokeStyle = hexAlpha(pal.number, 0.6);
    ctx.lineWidth = 1;
    ctx.strokeRect(ix, iy, iw, ih);
    font(ctx, fs.small);
    text(ctx, iw > 200 ? `K=${r.strike}  σ per Newton step` : `K=${r.strike}  σ steps`, ix + 6, iy + fs.small * 0.9, pal.fg);
    const sv = tr.sigma;
    const shown = Math.max(1, Math.ceil(clamp01(prog - cur) * sv.length));
    const sMax = Math.max(0.5, ...sv);
    const sx = lin(0, Math.max(1, sv.length - 1), ix + 8, ix + iw - 8);
    const sy = lin(0, sMax, iy + ih - fs.small * 1.6, iy + fs.small * 2);
    line(ctx, sv.slice(0, shown).map((s, j) => [sx(j), sy(s)]), pal.number, 1.6);
    sv.slice(0, shown).forEach((s, j) => dot(ctx, sx(j), sy(s), 2.4, pal.number));
    text(
      ctx,
      `0.20 → ${Number.isFinite(r.iv) ? r.iv.toFixed(3) : 'NaN'} in ${tr.iters} it`,
      ix + 6,
      iy + ih - fs.small * 0.8,
      Number.isFinite(r.iv) ? pal.number : pal.keyword,
    );
  }
}

// 5. smoothing sweep + NaN drop
function drawSmooth(a: DrawArgs) {
  const { ctx, p, x, pal, fs, t } = a;
  const bx = frame(a.w, a.h, fs);
  header(a, 4);
  axes(ctx, bx, pal, fs, 'strike K', 'implied vol σ');
  const X = strikeX(bx);
  const Y = ivY(p, bx);
  const n = p.withIv.length;
  const sweep = phase(t, 0.05, 0.75);
  const drop = phase(t, 0.78, 0.95);
  const center = Math.min(n - 1, Math.floor(sweep * n));
  p.withIv.forEach((r, i) => {
    if (Number.isFinite(r.iv)) dot(ctx, X(r.strike), Y(r.iv), 2.6, hexAlpha(pal.number, 0.45));
  });
  if (sweep < 1) {
    const j0 = Math.max(0, center - KERNEL);
    const j1 = Math.min(n - 1, center + KERNEL);
    ctx.fillStyle = hexAlpha(pal.method, 0.1);
    ctx.fillRect(X(p.withIv[j0].strike) - 4, bx.t, X(p.withIv[j1].strike) - X(p.withIv[j0].strike) + 8, bx.b - bx.t);
    const bh = (bx.b - bx.t) * 0.18;
    const pts: [number, number][] = [];
    for (let j = j0; j <= j1; j++) {
      const wt = Math.exp(-((center - j) ** 2) / (2 * KERNEL * KERNEL));
      const xx = X(p.withIv[j].strike);
      line(ctx, [[xx, bx.b], [xx, bx.b - wt * bh]], hexAlpha(pal.method, 0.7), 2);
      pts.push([xx, bx.b - wt * bh]);
    }
    line(ctx, pts, pal.method, 1.2);
    font(ctx, fs.small);
    text(ctx, 'kernel weights, rows i±5', X(p.withIv[center].strike), bx.b - bh - fs.small, pal.method, 'center');
  }
  const upto = sweep >= 1 ? n - 1 : center;
  for (let i = 0; i <= upto; i++) {
    const v = p.smoothed[i];
    if (Number.isFinite(v)) dot(ctx, X(p.withIv[i].strike), Y(v), 3.2, pal.type);
    else if (drop < 1) {
      ctx.globalAlpha = 1 - drop;
      const xx = X(p.withIv[i].strike);
      const yy = bx.t + (bx.b - bx.t) * 0.5;
      font(ctx, fs.small);
      text(ctx, '×', xx, yy + drop * 30, pal.keyword, 'center');
      ctx.globalAlpha = 1;
    }
  }
  legend(ctx, [['raw σ', hexAlpha(pal.number, 0.6)], ['smoothed', pal.type]], bx.r, bx.t + fs.small * 0.6, fs);
  if (drop > 0) {
    font(ctx, fs.small);
    text(
      ctx,
      `${x.dropped.length} NaN row${x.dropped.length === 1 ? '' : 's'} dropped · ${x.kPts.length} left`,
      bx.l + 8,
      bx.t + fs.small * 2.2,
      pal.fg,
    );
  }
}

// 6. morph (K, σ) -> (k, w)
function drawCoords(a: DrawArgs) {
  const { ctx, p, x, pal, fs, t } = a;
  const bx = frame(a.w, a.h, fs);
  header(a, 5);
  const u = ease(phase(t, 0.1, 0.8));
  const X = strikeX(bx);
  const Y = ivY(p, bx);
  const { kx, wy } = kwScales(x, bx);
  axes(ctx, bx, pal, fs, u < 0.5 ? 'strike K' : 'k = ln(K/F)', u < 0.5 ? 'implied vol σ' : 'total variance w = σ²τ');
  for (const q of x.kPts) dot(ctx, mix(X(q.K), kx(q.k), u), mix(Y(q.iv), wy(q.w), u), 3.2, pal.type);
  if (u > 0.95) {
    line(ctx, [[kx(0), bx.t], [kx(0), bx.b]], hexAlpha(pal.method, 0.6), 1, [4, 4]);
    font(ctx, fs.small);
    text(ctx, 'k = 0 (at the forward)', kx(0) + 4, bx.t + fs.small * 0.6, pal.method);
  }
}

// 7. Nelder-Mead SVI fit animates
function drawSvi(a: DrawArgs) {
  const { ctx, p, x, pal, fs, t } = a;
  const bx = frame(a.w, a.h, fs);
  header(a, 6);
  axes(ctx, bx, pal, fs, 'k = ln(K/F)', 'total variance w');
  const { kx, wy, k0, k1 } = kwScales(x, bx);
  for (const q of x.kPts) dot(ctx, kx(q.k), wy(q.w), 3.2, pal.type);
  const hp = p.history;
  const u = phase(t, 0.08, 0.9);
  const idx = Math.min(hp.length - 1, Math.floor(Math.pow(u, 2.2) * (hp.length - 1)));
  const s = hp[idx];
  const pts: [number, number][] = [];
  for (let i = 0; i <= 120; i++) {
    const k = k0 + ((k1 - k0) * i) / 120;
    const wv = sviW(k, s.a, s.b, s.rho, s.m, s.sigma);
    pts.push([kx(k), Math.max(bx.t - 10, Math.min(bx.b + 10, wy(wv)))]);
  }
  ctx.save();
  ctx.beginPath();
  ctx.rect(bx.l, bx.t - 4, bx.r - bx.l, bx.b - bx.t + 4);
  ctx.clip();
  line(ctx, pts, pal.method, 2.2);
  ctx.restore();
  let sse = 0;
  for (const q of x.kPts) sse += (sviW(q.k, s.a, s.b, s.rho, s.m, s.sigma) - q.w) ** 2;
  font(ctx, fs.small);
  const lines = [
    `iter ${Math.round((idx / Math.max(1, hp.length - 1)) * 4000)}/4000   SSE ${sse.toExponential(2)}`,
    `a=${s.a.toFixed(4)} b=${s.b.toFixed(3)} ρ=${s.rho.toFixed(2)}`,
    `m=${s.m.toFixed(3)} σ=${s.sigma.toFixed(3)}`,
  ];
  const cx = (bx.l + bx.r) / 2;
  lines.forEach((l, i) => text(ctx, l, cx, bx.t + fs.small * (0.8 + i * 1.35), i ? pal.fg : pal.number, 'center'));
}

// 8. g(k) full plot
function drawG(a: DrawArgs) {
  const { ctx, x, pal, fs, t } = a;
  const bx = frame(a.w, a.h, fs);
  header(a, 7);
  axes(ctx, bx, pal, fs, 'k = ln(K/F)  (401 check points)', 'g(k)');
  const gmin = Math.min(...x.gV);
  const gmax = Math.max(...x.gV);
  const Y = lin(Math.min(0, gmin) - 0.1 * (gmax - Math.min(0, gmin)), gmax * 1.08, bx.b, bx.t);
  const X = lin(x.gK[0], x.gK[x.gK.length - 1], bx.l + 4, bx.r - 4);
  ctx.fillStyle = hexAlpha(pal.keyword, 0.08);
  ctx.fillRect(bx.l, Y(0), bx.r - bx.l, bx.b - Y(0));
  line(ctx, [[bx.l, Y(0)], [bx.r, Y(0)]], hexAlpha(pal.keyword, 0.8), 1, [5, 4]);
  font(ctx, fs.small);
  text(ctx, 'g < 0 → arbitrage → error', bx.r - 4, Y(0) + fs.small, pal.keyword, 'right');
  const n = Math.max(2, Math.floor(ease(phase(t, 0.05, 0.75)) * x.gK.length));
  const ok = gmin >= 0;
  line(ctx, x.gK.slice(0, n).map((k, i) => [X(k), Y(x.gV[i])]), ok ? pal.type : pal.keyword, 2.2);
  if (n >= x.gK.length) {
    const im = x.gV.indexOf(gmin);
    dot(ctx, X(x.gK[im]), Y(gmin), 4.5, ok ? pal.type : pal.keyword);
    font(ctx, fs.label, '600');
    text(
      ctx,
      ok ? `min g = ${gmin.toFixed(3)} ≥ 0  ✓ passes` : `min g = ${gmin.toFixed(3)} < 0  ✗`,
      Math.min(Math.max(X(x.gK[im]), bx.l + 120), bx.r - 120),
      Y(gmin) - fs.label * 1.4,
      ok ? pal.type : pal.keyword,
      'center',
    );
  }
}

// 9. reprice: market dots vs smooth BS curve drawn across
function drawReprice(a: DrawArgs) {
  const { ctx, p, pal, fs, t } = a;
  const bx = frame(a.w, a.h, fs);
  header(a, 8);
  axes(ctx, bx, pal, fs, 'strike K', 'call price');
  const X = strikeX(bx);
  const Y = priceY(p, bx);
  for (const r of p.paritized) dot(ctx, X(r.strike), Y(r.price), 3, hexAlpha(pal.comment, 0.75));
  const u = ease(phase(t, 0.1, 0.85));
  const kEnd = 60 + 80 * u;
  const pts: [number, number][] = [];
  for (let K = 60; K <= kEnd; K += 0.5) pts.push([X(K), Y(bsCall(SPOT, K, TAU, RATE, p.ivFun(K)))]);
  line(ctx, pts, pal.variable, 2.2);
  if (u < 1 && pts.length) {
    const [lx, ly] = pts[pts.length - 1];
    dot(ctx, lx, ly, 4, pal.variable);
    font(ctx, fs.small);
    text(ctx, `σ_SVI=${p.ivFun(kEnd).toFixed(3)}`, lx + 6, ly - fs.small, pal.variable);
  }
  for (const r of p.repriced) if (r.strike <= kEnd) dot(ctx, X(r.strike), Y(r.price), 2, pal.method);
  spotLine(a, bx, X);
  legend(ctx, [['market (parity)', hexAlpha(pal.comment, 0.9)], ['SVI repriced', pal.variable]], bx.r, bx.t + fs.small * 2, fs);
}

// 10. BL: butterfly on curve + density trace
function drawBL(a: DrawArgs, Kfixed: number | null) {
  const { ctx, p, pal, fs, t, w, h } = a;
  header(a, 9, `drawn h = ${H_VISUAL} · code h = ${H_CODE}`);
  const top = 14 + fs.label * 1.6;
  const split = top + (h - top) * 0.52;
  const b1: Box = { l: 16 + fs.small * 2.6, r: w - 14, t: top + fs.small * 1.8, b: split - 6 };
  const b2: Box = { l: b1.l, r: b1.r, t: split + fs.small * 1.6, b: h - 14 - fs.small * 1.6 };
  const lo = 76;
  const hi = 124;
  const X = lin(lo, hi, b1.l + 4, b1.r - 4);
  const C = (K: number) => bsCall(SPOT, K, TAU, RATE, p.ivFun(K));
  const cs: number[] = [];
  for (let K = lo; K <= hi; K += 0.5) cs.push(C(K));
  const Y1 = lin(Math.min(...cs), Math.max(...cs) * 1.04, b1.b, b1.t);
  const K = Kfixed ?? mix(K_MIN_UI, K_MAX_UI, ease(phase(t, 0.05, 0.92)));
  axes(ctx, b1, pal, fs, '', 'call price C(K)');
  const curve: [number, number][] = [];
  for (let k = lo; k <= hi; k += 0.5) curve.push([X(k), Y1(C(k))]);
  line(ctx, curve, pal.variable, 1.8);
  const kl = K - H_VISUAL;
  const kr = K + H_VISUAL;
  const pL: [number, number] = [X(kl), Y1(C(kl))];
  const pM: [number, number] = [X(K), Y1(C(K))];
  const pR: [number, number] = [X(kr), Y1(C(kr))];
  line(ctx, [pL, pR], hexAlpha(pal.string, 0.9), 1.4, [4, 3]);
  const chordY = (pL[1] + pR[1]) / 2;
  ctx.fillStyle = hexAlpha(pal.string, 0.35);
  ctx.fillRect(pM[0] - 3, chordY, 6, pM[1] - chordY);
  dot(ctx, ...pL, 4.2, pal.type);
  dot(ctx, ...pR, 4.2, pal.type);
  dot(ctx, ...pM, 4.2, pal.keyword);
  font(ctx, fs.small);
  text(ctx, 'buy 1', pL[0] - 6, pL[1] - fs.small * 0.6, pal.type, 'right');
  text(ctx, 'sell 2', pM[0] - 6, pM[1] + fs.small * 0.9, pal.keyword, 'right');
  text(ctx, 'buy 1', pR[0] + 6, pR[1] - fs.small * 0.6, pal.type, 'left');
  // butterfly payoff tent inset (top-right, over the flat tail)
  const tw = Math.min(170, (b1.r - b1.l) * 0.34);
  const th = Math.min(70, (b1.b - b1.t) * 0.45);
  const tx = b1.r - tw;
  const ty = b1.t;
  ctx.fillStyle = hexAlpha(pal.editor, 0.9);
  ctx.fillRect(tx, ty, tw, th);
  ctx.strokeStyle = hexAlpha(pal.border, 1);
  ctx.lineWidth = 1;
  ctx.strokeRect(tx, ty, tw, th);
  const TX = lin(-2, 2, tx + 6, tx + tw - 6);
  const base = ty + th - 8;
  const peak = ty + fs.small * 1.8;
  line(ctx, [[TX(-2), base], [TX(-1), base], [TX(0), peak], [TX(1), base], [TX(2), base]], pal.method, 1.8);
  font(ctx, fs.small);
  text(ctx, tw > 150 ? 'payoff at expiry' : 'payoff', tx + 6, ty + fs.small * 0.8, pal.comment);
  text(ctx, 'K', TX(0), base + 1, pal.method, 'center');

  // density panel
  const ys = p.pdfY;
  const Y2 = lin(0, Math.max(...ys) * 1.12, b2.b, b2.t);
  axes(ctx, b2, pal, fs, 'strike K', 'density f(K)');
  const tr: [number, number][] = [];
  const done = Kfixed !== null;
  p.pdfK.forEach((k, i) => {
    if (k >= lo && k <= hi && (done || k <= K)) tr.push([X(k), Y2(ys[i])]);
  });
  line(ctx, tr, pal.type, 2.2);
  const fK = breedenLitzenberger(K, p.ivFun);
  line(ctx, [[pM[0], pM[1]], [pM[0], Y2(fK)]], hexAlpha(pal.string, 0.5), 1, [2, 3]);
  dot(ctx, X(K), Y2(fK), 4.5, pal.string);
  font(ctx, fs.small);
  const lab = `K=${K.toFixed(1)}  f(K)=${fK.toFixed(4)}`;
  const lw = ctx.measureText(lab).width;
  text(ctx, lab, Math.min(Math.max(X(K) - lw / 2, b2.l + 4), b2.r - lw), b2.t + fs.small * 0.2, pal.string);
}

// 11. probabilities
function drawProb(a: DrawArgs, K: number) {
  const { ctx, p, x, pal, fs, t } = a;
  const bx = frame(a.w, a.h, fs);
  header(a, 10, 'synthetic chain');
  axes(ctx, bx, pal, fs, 'price at expiry', 'density');
  const ks = p.pdfK;
  const ys = p.pdfY;
  const X = lin(ks[0], ks[ks.length - 1], bx.l + 4, bx.r - 4);
  const Y = lin(0, x.pdfMax * 1.25, bx.b, bx.t);
  const target = ks.findIndex((k) => k >= K);
  const cut = target < 0 ? ks.length - 1 : target;
  const fill = Math.round(mix(0, cut, ease(phase(t, 0.1, 0.8))));
  ctx.beginPath();
  ctx.moveTo(X(ks[0]), Y(0));
  for (let i = 0; i <= fill; i++) ctx.lineTo(X(ks[i]), Y(ys[i]));
  ctx.lineTo(X(ks[fill]), Y(0));
  ctx.closePath();
  ctx.fillStyle = hexAlpha(pal.type, 0.3);
  ctx.fill();
  const showAbove = phase(t, 0.82, 1);
  if (showAbove > 0) {
    ctx.beginPath();
    ctx.moveTo(X(ks[cut]), Y(0));
    for (let i = cut; i < ks.length; i++) ctx.lineTo(X(ks[i]), Y(ys[i]));
    ctx.lineTo(X(ks[ks.length - 1]), Y(0));
    ctx.closePath();
    ctx.fillStyle = hexAlpha(pal.keyword, 0.24 * showAbove);
    ctx.fill();
  }
  line(ctx, ks.map((k, i) => [X(k), Y(ys[i])]), pal.variable, 2.2);
  line(ctx, [[X(SPOT), bx.t], [X(SPOT), bx.b]], hexAlpha(pal.method, 0.5), 1, [4, 4]);
  line(ctx, [[X(K), bx.t], [X(K), bx.b]], pal.string, 1.4, [2, 3]);
  const pb = x.cumBelow[fill];
  font(ctx, fs.label, '600');
  const yLab = bx.t + fs.label * 0.8;
  const nearL = X(K) - bx.l < 150;
  const nearR = bx.r - X(K) < 150;
  text(ctx, `P(below ${K.toFixed(1)}) = ${pb.toFixed(3)}`, X(K) + (nearL ? 6 : -6), yLab, pal.type, nearL ? 'left' : 'right');
  if (showAbove > 0) {
    ctx.globalAlpha = showAbove;
    text(
      ctx,
      `P(at/above) = ${(1 - x.cumBelow[cut]).toFixed(3)}`,
      X(K) + (nearR ? -6 : 6),
      yLab + fs.label * 1.5,
      pal.keyword,
      nearR ? 'right' : 'left',
    );
    ctx.globalAlpha = 1;
  }
  font(ctx, fs.small);
  text(ctx, `K=${K.toFixed(1)}`, X(K), bx.b + fs.small * 1.1, pal.string, 'center');
  text(ctx, `spot ${SPOT}`, X(SPOT) + 4, bx.b - fs.small, pal.method);
}

type Anim = { t: number; dwell: number };

const OptionsPDF = ({ poster, title }: { poster: string; title: string }) => {
  const { theme } = useTheme();
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [strike, setStrike] = useState(96);
  const [ready, setReady] = useState(false);

  const stepRef = useRef(0);
  const autoRef = useRef(true);
  const userRef = useRef(false);
  const inViewRef = useRef(true);
  const reducedRef = useRef(false);
  const colorsRef = useRef<Colors | null>(null);
  const dataRef = useRef<{ p: Pipeline; x: Extra } | null>(null);
  const anim = useRef<Anim>({ t: 0, dwell: 0 });
  const strikeRef = useRef(96);
  const touchedRef = useRef(false);
  const fade = useRef(1);

  const data = useMemo(() => {
    if (!visible) return null;
    const p = runPipeline(SEED);
    return { p, x: buildExtra(p) };
  }, [visible]);

  useEffect(() => {
    dataRef.current = data;
    if (data) setReady(true);
  }, [data]);
  useEffect(() => {
    stepRef.current = step;
  }, [step]);
  useEffect(() => {
    autoRef.current = autoplay;
  }, [autoplay]);
  useEffect(() => {
    strikeRef.current = strike;
  }, [strike]);
  useEffect(() => {
    colorsRef.current = {
      fg: theme.colors.foreground,
      comment: theme.colors.comment,
      method: theme.colors.method,
      editor: theme.colors.editor,
      border: theme.colors.border,
      string: theme.colors.string,
      keyword: theme.colors.keyword,
      number: theme.colors.number,
      variable: theme.colors.variable,
      type: theme.colors.type,
    };
  }, [theme]);

  const stopAuto = () => {
    userRef.current = true;
    autoRef.current = false;
    setAutoplay(false);
  };
  const goStep = (i: number, fromUser: boolean) => {
    const j = Math.max(0, Math.min(N_STEPS - 1, i));
    if (fromUser) stopAuto();
    fade.current = 0;
    anim.current = { t: reducedRef.current ? 1 : 0, dwell: 0 };
    touchedRef.current = false;
    stepRef.current = j;
    setStep(j);
  };
  const replay = () => {
    userRef.current = false;
    autoRef.current = !reducedRef.current;
    setAutoplay(!reducedRef.current);
    goStep(0, false);
  };

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true);
      },
      { rootMargin: '80px', threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return;
    reducedRef.current = prefersReducedMotion();
    if (reducedRef.current) {
      autoRef.current = false;
      setAutoplay(false);
      anim.current = { t: 1, dwell: 0 };
      fade.current = 1;
    }
    let disposed = false;
    let raf = 0;
    let running = false;
    let last = performance.now();

    const fit = () => {
      const w = host.clientWidth || 640;
      const h = host.clientHeight || 420;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(host);

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const reduced = reducedRef.current;
      fade.current = reduced ? 1 : Math.min(1, fade.current + dt * 3.2);
      const a = anim.current;
      const s = stepRef.current;
      if (a.t < 1) a.t = Math.min(1, a.t + dt / (reduced ? 0.01 : STEPS[s].dur));
      else {
        a.dwell += dt;
        if (autoRef.current && !userRef.current && a.dwell > 1.6) {
          if (s < N_STEPS - 1) goStep(s + 1, false);
          else {
            autoRef.current = false;
            setAutoplay(false);
          }
        }
      }
    };

    const draw = () => {
      const ctx = canvas.getContext('2d');
      const pal = colorsRef.current;
      const d = dataRef.current;
      if (!ctx || !pal) return;
      const w = host.clientWidth || 640;
      const h = host.clientHeight || 420;
      ctx.clearRect(0, 0, w, h);
      if (!d) {
        font(ctx, 12);
        text(ctx, 'building synthetic chain…', 16, h / 2, pal.comment);
        return;
      }
      ctx.save();
      ctx.globalAlpha = fade.current;
      const s = stepRef.current;
      const args: DrawArgs = { ctx, w, h, pal, p: d.p, x: d.x, t: anim.current.t, fs: typeScale(w), K: strikeRef.current };
      const fns = [drawRaw, drawOtm, drawParity, drawNewton, drawSmooth, drawCoords, drawSvi, drawG, drawReprice];
      if (s < fns.length) fns[s](args);
      else if (s === 9) drawBL(args, anim.current.t >= 1 || touchedRef.current ? strikeRef.current : null);
      else drawProb(args, strikeRef.current);
      ctx.restore();
    };

    const loop = (now: number) => {
      if (disposed) return;
      if (!inViewRef.current) {
        running = false;
        raf = 0;
        return;
      }
      tick(now);
      draw();
      raf = requestAnimationFrame(loop);
    };
    const startLoop = () => {
      if (running || disposed) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const visIo = new IntersectionObserver(
      ([e]) => {
        inViewRef.current = e.isIntersecting;
        if (e.isIntersecting) startLoop();
      },
      { threshold: 0.02 },
    );
    visIo.observe(host);
    startLoop();
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      visIo.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const st = STEPS[step];
  const btn = 'rounded-md border text-[11px] lg:text-[12px] font-medium';
  const chipStyle = (on: boolean) => ({
    borderColor: on ? 'var(--theme-method)' : 'var(--theme-border)',
    color: on ? 'var(--theme-editor)' : 'var(--theme-foreground)',
    background: on ? 'var(--theme-method)' : 'var(--theme-editor)',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="w-full min-w-0 lg:max-h-[85vh] lg:flex lg:flex-col"
      onPointerDownCapture={stopAuto}
    >
      <div
        ref={hostRef}
        className="relative w-full min-w-0 overflow-hidden rounded-t-lg aspect-[4/5] sm:aspect-[4/3] lg:aspect-[16/10] lg:min-h-0 lg:flex-1 lg:max-h-[calc(85vh-16rem)]"
        style={{ background: 'var(--theme-editor)' }}
      >
        {(!visible || !ready) && (
          <div className="absolute inset-0">
            <img src={poster} alt="" className="h-full w-full object-cover opacity-40" />
            <div className="absolute inset-0 animate-pulse bg-[var(--theme-sidebar)]/40" />
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          style={{ touchAction: 'pan-y' }}
          aria-label={title}
        />
      </div>

      <div
        className="space-y-2 border-t px-3 py-2.5 sm:px-4 lg:shrink-0"
        style={{ background: 'var(--theme-sidebar)', borderColor: 'var(--theme-border)' }}
      >
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            aria-label="Previous step"
            disabled={step === 0}
            onClick={() => goStep(step - 1, true)}
            className={`${btn} shrink-0 px-1.5 py-1 disabled:opacity-40`}
            style={chipStyle(false)}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </motion.button>
          <div className="order-first flex w-full min-w-0 flex-wrap gap-[3px] sm:order-none sm:w-auto sm:flex-1 sm:gap-1">
            {STEPS.map((s, i) => (
              <motion.button
                key={s.title}
                type="button"
                whileTap={{ scale: 0.94 }}
                aria-label={`Step ${i + 1}: ${s.title}`}
                aria-current={step === i ? 'step' : undefined}
                onClick={() => goStep(i, true)}
                className={`${btn} min-w-[1.45rem] px-0.5 py-0.5 tabular-nums sm:min-w-[1.6rem] sm:px-1`}
                style={chipStyle(step === i)}
              >
                {i + 1}
              </motion.button>
            ))}
          </div>
          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            aria-label="Next step"
            disabled={step === N_STEPS - 1}
            onClick={() => goStep(step + 1, true)}
            className={`${btn} shrink-0 px-1.5 py-1 disabled:opacity-40`}
            style={chipStyle(false)}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={(e) => {
              e.stopPropagation();
              replay();
            }}
            className={`${btn} ml-auto inline-flex shrink-0 items-center gap-1 whitespace-nowrap px-2 py-1 sm:ml-0`}
            style={chipStyle(false)}
          >
            {autoplay ? <RotateCcw className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            {autoplay ? 'playing' : 'replay'}
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-1"
            data-step={step + 1}
          >
            <div className="text-[12px] lg:text-[13px] font-semibold" style={{ color: 'var(--theme-method)' }}>
              Step {step + 1} of {N_STEPS} · {st.title}
            </div>
            <p className="text-[11.5px] lg:text-[12.5px] leading-snug" style={{ color: 'var(--theme-foreground)' }}>
              {st.caption}
            </p>
            <p className="font-mono text-[11px] lg:text-[12px] leading-snug break-words" style={{ color: 'var(--theme-string)' }}>
              {st.formula}
            </p>
            {step >= 9 && (
              <label className="block min-w-0 pt-1">
                <div className="mb-0.5 flex justify-between font-mono text-[11px] lg:text-[12px]" style={{ color: 'var(--theme-comment)' }}>
                  <span>drag strike K</span>
                  <span>{strike.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min={K_MIN_UI}
                  max={K_MAX_UI}
                  step={0.5}
                  value={strike}
                  aria-label="Strike"
                  onChange={(e) => {
                    touchedRef.current = true;
                    anim.current.t = Math.max(anim.current.t, step === 10 ? 1 : 0);
                    setStrike(Number(e.target.value));
                  }}
                  className="op-range w-full"
                />
              </label>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="text-[11px] lg:text-[12px] leading-snug" style={{ color: 'var(--theme-comment)' }}>
          synthetic chain (not market data) · S={SPOT} · seed {SEED} ·{' '}
          <a
            href="https://github.com/SentientPlatypus/OptionsImpliedPDF.jl"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
            style={{ color: 'var(--theme-method)' }}
          >
            OptionsImpliedPDF.jl
          </a>
        </div>
      </div>

      <style>{`
        .op-range { -webkit-appearance: none; appearance: none; height: 28px; margin: -8px 0; background: transparent; outline: none; cursor: pointer; touch-action: pan-y; }
        .op-range::-webkit-slider-runnable-track { height: 4px; border-radius: 999px; background: color-mix(in srgb, var(--theme-method) 55%, var(--theme-border)); }
        .op-range::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; box-sizing: border-box; width: 16px; height: 16px; margin-top: -6px; border-radius: 999px; background: var(--theme-method); border: 2px solid var(--theme-sidebar); cursor: pointer; box-shadow: 0 0 0 1px var(--theme-border); }
        .op-range::-moz-range-track { height: 4px; border-radius: 999px; background: color-mix(in srgb, var(--theme-method) 55%, var(--theme-border)); }
        .op-range::-moz-range-thumb { box-sizing: border-box; width: 16px; height: 16px; border-radius: 999px; background: var(--theme-method); border: 2px solid var(--theme-sidebar); cursor: pointer; }
      `}</style>
    </motion.div>
  );
};

export default OptionsPDF;
