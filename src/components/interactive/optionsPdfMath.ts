/** Pipeline matches SentientPlatypus/OptionsImpliedPDF.jl @ f736bb3 (code, not README). */

export const SEED = 3;
export const SPOT = 100;
export const TAU = 30 / 365;
export const RATE = 0.01;
export const H_CODE = 0.001;
export const KERNEL = 5;
export const K_EXTEND = 1e-4;
/** svi_test.jl params read as annualized variance, x3 (ATM vol ~30%) so Newton from 0.20 converges on most strikes. */
export const VAR_SCALE = 3;
export const TRUE_SVI = { a: 0.01, b: 0.1, rho: -0.5, m: 0, sigma: 0.2 } as const;

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Abramowitz–Stegun erf; good enough for BS N(·). */
export function erf(x: number): number {
  const s = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * ax);
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-ax * ax);
  return s * y;
}

export function normCdf(x: number): number {
  return 0.5 * (1 + erf(x / Math.SQRT2));
}

export function normPdf(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

export function bsCall(S: number, K: number, tau: number, r: number, sigma: number): number {
  if (sigma <= 0 || tau <= 0) return Math.max(S - K * Math.exp(-r * tau), 0);
  const srt = sigma * Math.sqrt(tau);
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * tau) / srt;
  const d2 = d1 - srt;
  return S * normCdf(d1) - K * Math.exp(-r * tau) * normCdf(d2);
}

export function bsPut(S: number, K: number, tau: number, r: number, sigma: number): number {
  if (sigma <= 0 || tau <= 0) return Math.max(K * Math.exp(-r * tau) - S, 0);
  const srt = sigma * Math.sqrt(tau);
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * tau) / srt;
  const d2 = d1 - srt;
  return K * Math.exp(-r * tau) * normCdf(-d2) - S * normCdf(-d1);
}

export function bsVega(S: number, K: number, tau: number, r: number, sigma: number): number {
  if (sigma <= 0 || tau <= 0) return 0;
  const srt = sigma * Math.sqrt(tau);
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * tau) / srt;
  return S * Math.sqrt(tau) * normPdf(d1);
}

export type NewtonTrace = { sigma: number[]; iters: number; iv: number; vega: number; ok: boolean };

export function impliedVolNewton(
  S: number,
  K: number,
  tau: number,
  r: number,
  mkt: number,
  opts?: { tol?: number; maxIter?: number },
): NewtonTrace {
  const tol = opts?.tol ?? 1e-8;
  const maxIter = opts?.maxIter ?? 200;
  let sigma = 0.2;
  const path = [sigma];
  for (let i = 0; i < maxIter; i++) {
    const f = bsCall(S, K, tau, r, sigma) - mkt;
    const vega = bsVega(S, K, tau, r, sigma);
    if (Math.abs(f) < tol) {
      return { sigma: path, iters: i + 1, iv: sigma, vega, ok: true };
    }
    if (vega < 1e-12) {
      return { sigma: path, iters: i + 1, iv: NaN, vega, ok: false };
    }
    sigma -= f / vega;
    sigma = Math.min(5, Math.max(1e-8, sigma));
    path.push(sigma);
  }
  return { sigma: path, iters: maxIter, iv: NaN, vega: bsVega(S, K, tau, r, sigma), ok: false };
}

export function sviW(k: number, a: number, b: number, rho: number, m: number, sigma: number): number {
  const x = k - m;
  return a + b * (rho * x + Math.sqrt(x * x + sigma * sigma));
}

export function sviWp(k: number, a: number, b: number, rho: number, m: number, sigma: number): number {
  const x = k - m;
  const s = Math.sqrt(x * x + sigma * sigma);
  return b * (rho + x / s);
}

export function sviWpp(k: number, _a: number, b: number, _rho: number, m: number, sigma: number): number {
  const x = k - m;
  const s = Math.sqrt(x * x + sigma * sigma);
  return (b * sigma * sigma) / (s * s * s);
}

export function gatheralJacquier(a: number, b: number, rho: number, _m: number, sigma: number): number {
  return a + b * sigma * Math.sqrt(1 - rho * rho);
}

export function sviG(k: number, a: number, b: number, rho: number, m: number, sigma: number): number {
  const wv = sviW(k, a, b, rho, m, sigma);
  if (!Number.isFinite(wv) || wv <= 0) return -Infinity;
  const w1 = sviWp(k, a, b, rho, m, sigma);
  const w2 = sviWpp(k, a, b, rho, m, sigma);
  return (1 - (k * w1) / (2 * wv)) ** 2 - (w1 * w1) / 4 * (1 / wv + 0.25) + w2 / 2;
}

export function minGOnGrid(
  a: number,
  b: number,
  rho: number,
  m: number,
  sigma: number,
  kmin: number,
  kmax: number,
  n = 401,
): number {
  let minG = Infinity;
  for (let i = 0; i < n; i++) {
    const k = kmin + ((kmax - kmin) * i) / (n - 1);
    minG = Math.min(minG, sviG(k, a, b, rho, m, sigma));
  }
  return minG;
}

export function reparameterize(u: number[], rhoBound = 0.999, sigmaMin = 1e-4) {
  const a = u[0];
  const b = Math.exp(u[1]);
  const rho = rhoBound * Math.tanh(u[2]);
  const m = u[3];
  const sigma = sigmaMin + Math.exp(u[4]);
  return { a, b, rho, m, sigma };
}

export function sviObjective(u: number[], kData: number[], wData: number[], weights: number[]): number {
  const { a, b, rho, m, sigma } = reparameterize(u);
  let penalty = 0;
  const minvar = gatheralJacquier(a, b, rho, m, sigma);
  if (minvar < 0) penalty += 1e6 * minvar * minvar;
  for (const k of kData) {
    const wh = sviW(k, a, b, rho, m, sigma);
    if (!Number.isFinite(wh) || wh <= 0) penalty += 1e6;
  }
  let sse = 0;
  for (let i = 0; i < kData.length; i++) {
    const err = sviW(kData[i], a, b, rho, m, sigma) - wData[i];
    sse += weights[i] * err * err;
  }
  return sse + penalty;
}

/** Classic Nelder–Mead (α=1, γ=2, ρ=0.5, σ=0.5), 5-D, Optim-style 4000 iters. */
export function nelderMead(
  fn: (u: number[]) => number,
  u0: number[],
  maxIter: number,
  onStep?: (iter: number, u: number[], f: number) => void,
): { u: number[]; f: number; iters: number } {
  const n = u0.length;
  const alpha = 1;
  const gamma = 2;
  const rho = 0.5;
  const sigma = 0.5;
  const pts: number[][] = [];
  const fs: number[] = [];
  pts.push(u0.slice());
  fs.push(fn(pts[0]));
  for (let i = 0; i < n; i++) {
    const p = u0.slice();
    p[i] += 0.05 * (Math.abs(u0[i]) > 1e-8 ? Math.abs(u0[i]) : 0.05);
    pts.push(p);
    fs.push(fn(p));
  }
  const order = () => {
    const idx = pts.map((_, i) => i).sort((a, b) => fs[a] - fs[b]);
    const p2 = idx.map((i) => pts[i]);
    const f2 = idx.map((i) => fs[i]);
    for (let i = 0; i <= n; i++) {
      pts[i] = p2[i];
      fs[i] = f2[i];
    }
  };
  let iter = 0;
  for (; iter < maxIter; iter++) {
    order();
    if (onStep && iter % 20 === 0) onStep(iter, pts[0], fs[0]);
    const x0 = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      for (let d = 0; d < n; d++) x0[d] += pts[i][d];
    }
    for (let d = 0; d < n; d++) x0[d] /= n;
    const xr = x0.map((v, d) => v + alpha * (v - pts[n][d]));
    const fr = fn(xr);
    if (fr < fs[0]) {
      const xe = x0.map((v, d) => v + gamma * (xr[d] - v));
      const fe = fn(xe);
      if (fe < fr) {
        pts[n] = xe;
        fs[n] = fe;
      } else {
        pts[n] = xr;
        fs[n] = fr;
      }
    } else if (fr < fs[n - 1]) {
      pts[n] = xr;
      fs[n] = fr;
    } else {
      const outside = fr < fs[n];
      const xc = outside
        ? x0.map((v, d) => v + rho * (xr[d] - v))
        : x0.map((v, d) => v + rho * (pts[n][d] - v));
      const fc = fn(xc);
      if (fc < (outside ? fr : fs[n])) {
        pts[n] = xc;
        fs[n] = fc;
      } else {
        for (let i = 1; i <= n; i++) {
          pts[i] = pts[0].map((v, d) => v + sigma * (pts[i][d] - v));
          fs[i] = fn(pts[i]);
        }
      }
    }
  }
  order();
  if (onStep) onStep(iter, pts[0], fs[0]);
  return { u: pts[0], f: fs[0], iters: iter };
}

export type Quote = {
  strike: number;
  bid: number;
  ask: number;
  mid: number;
  inTheMoney: boolean;
  kind: 'call' | 'put';
};

export type ParityRow = { strike: number; price: number; from: 'call' | 'put'; raw: number };

const callFloor = (S: number, K: number, tau: number, r: number) =>
  Math.max(1e-4, S - K * Math.exp(-r * tau) + 1e-4);

export function makeSyntheticChain(seed = SEED) {
  const rng = mulberry32(seed);
  const F = SPOT * Math.exp(RATE * TAU);
  const strikes: number[] = [];
  for (let k = 60; k <= 140 + 1e-9; k += 2.5) strikes.push(Math.round(k * 10) / 10);
  const calls: Quote[] = [];
  const puts: Quote[] = [];
  for (const K of strikes) {
    const kk = Math.log(K / F);
    const w = sviW(kk, TRUE_SVI.a, TRUE_SVI.b, TRUE_SVI.rho, TRUE_SVI.m, TRUE_SVI.sigma) * TAU * VAR_SCALE;
    const iv = Math.sqrt(Math.max(w, 0) / TAU);
    const c0 = bsCall(SPOT, K, TAU, RATE, iv);
    const p0 = bsPut(SPOT, K, TAU, RATE, iv);
    const cMid = Math.min(SPOT - 1e-4, Math.max(callFloor(SPOT, K, TAU, RATE), c0 * (1 + 0.008 * (rng() * 2 - 1))));
    const pMid = Math.max(0.01, p0 * (1 + 0.008 * (rng() * 2 - 1)));
    const cSpr = Math.max(0.02, 0.02 * cMid);
    const pSpr = Math.max(0.02, 0.02 * pMid);
    calls.push({
      strike: K,
      bid: Math.max(0.01, cMid - cSpr),
      ask: cMid + cSpr,
      mid: cMid,
      inTheMoney: K < SPOT,
      kind: 'call',
    });
    puts.push({
      strike: K,
      bid: Math.max(0.01, pMid - pSpr),
      ask: pMid + pSpr,
      mid: pMid,
      inTheMoney: K > SPOT,
      kind: 'put',
    });
  }
  return { F, strikes, calls, puts };
}

export function paritize(calls: Quote[], puts: Quote[], spot = SPOT, tau = TAU, rate = RATE): ParityRow[] {
  const df = Math.exp(-rate * tau);
  const rows: ParityRow[] = [];
  for (const c of calls) {
    if (!c.inTheMoney) rows.push({ strike: c.strike, price: c.mid, from: 'call', raw: c.mid });
  }
  for (const p of puts) {
    if (!p.inTheMoney) {
      const synth = p.mid + spot - p.strike * df;
      rows.push({ strike: p.strike, price: synth, from: 'put', raw: p.mid });
    }
  }
  rows.sort((a, b) => a.strike - b.strike);
  return rows;
}

export function addIvColumn(rows: ParityRow[], spot = SPOT, rate = RATE, tau = TAU) {
  return rows.map((row) => {
    const tr = impliedVolNewton(spot, row.strike, tau, rate, row.price);
    return { ...row, iv: tr.iv, trace: tr };
  });
}

export function gaussianSmooth(ivs: number[], kernel = KERNEL): number[] {
  const n = ivs.length;
  const out = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    const j0 = Math.max(0, i - kernel);
    const j1 = Math.min(n - 1, i + kernel);
    let ws = 0;
    let vs = 0;
    for (let j = j0; j <= j1; j++) {
      const w = Math.exp(-((i - j) * (i - j)) / (2 * kernel * kernel));
      ws += w;
      vs += w * ivs[j];
    }
    out[i] = vs / ws;
  }
  return out;
}

export function removeNans<T extends { iv: number }>(rows: T[]): T[] {
  return rows.filter((r) => Number.isFinite(r.iv));
}

export type SviFit = { a: number; b: number; rho: number; m: number; sigma: number; minG: number };

export function fitSviSmile(
  K: number[],
  iv: number[],
  F: number,
  T: number,
  kExtend = K_EXTEND,
  onStep?: (iter: number, params: SviFit) => void,
): { fit: SviFit; ivFun: (k: number) => number; history: SviFit[] } {
  const kData: number[] = [];
  const wData: number[] = [];
  for (let i = 0; i < K.length; i++) {
    if (Number.isFinite(K[i]) && Number.isFinite(iv[i]) && iv[i] > 0) {
      kData.push(Math.log(K[i] / F));
      wData.push(iv[i] * iv[i] * T);
    }
  }
  const weights = kData.map(() => 1);
  const u0 = [Math.min(...wData) * 0.5, Math.log(0.1), 0, 0, Math.log(0.1)];
  const history: SviFit[] = [];
  const snap = (u: number[]): SviFit => {
    const p = reparameterize(u);
    const kmin = Math.min(...kData) - kExtend;
    const kmax = Math.max(...kData) + kExtend;
    return { ...p, minG: minGOnGrid(p.a, p.b, p.rho, p.m, p.sigma, kmin, kmax) };
  };
  const res = nelderMead((u) => sviObjective(u, kData, wData, weights), u0, 4000, (iter, u) => {
    const s = snap(u);
    history.push(s);
    onStep?.(iter, s);
  });
  const fit = snap(res.u);
  const ivFun = (Kq: number) => {
    const k = Math.log(Kq / F);
    return Math.sqrt(Math.max(sviW(k, fit.a, fit.b, fit.rho, fit.m, fit.sigma), 0) / T);
  };
  return { fit, ivFun, history };
}

export function reprice(strikes: number[], ivFun: (k: number) => number, spot = SPOT, rate = RATE, tau = TAU) {
  return strikes.map((K) => ({ strike: K, price: bsCall(spot, K, tau, rate, ivFun(K)) }));
}

export function breedenLitzenberger(
  K: number,
  ivFun: (k: number) => number,
  spot = SPOT,
  r = RATE,
  tau = TAU,
  h = H_CODE,
): number {
  const C = (Kx: number) => bsCall(spot, Kx, tau, r, ivFun(Kx));
  const d2C = K <= h ? (C(K + 2 * h) - 2 * C(K + h) + C(K)) / (h * h) : (C(K + h) - 2 * C(K) + C(K - h)) / (h * h);
  return Math.exp(r * tau) * d2C;
}

export function pBelow(
  K: number,
  ivFun: (k: number) => number,
  spot = SPOT,
  r = RATE,
  tau = TAU,
): number {
  const lower = 1;
  const n = 10000;
  const dk = (K - lower) / n;
  let integral = 0;
  let prev = breedenLitzenberger(lower, ivFun, spot, r, tau);
  for (let i = 0; i < n; i++) {
    const k2 = lower + (i + 1) * dk;
    const cur = breedenLitzenberger(k2, ivFun, spot, r, tau);
    integral += 0.5 * (prev + cur) * dk;
    prev = cur;
  }
  return integral;
}

export function sampleStd(xs: number[]): number {
  const n = xs.length;
  if (n < 2) return 0;
  const m = xs.reduce((s, x) => s + x, 0) / n;
  let v = 0;
  for (const x of xs) v += (x - m) * (x - m);
  return Math.sqrt(v / (n - 1));
}

export type Pipeline = {
  F: number;
  calls: Quote[];
  puts: Quote[];
  paritized: ParityRow[];
  withIv: ReturnType<typeof addIvColumn>;
  smoothed: number[];
  filtered: ReturnType<typeof addIvColumn>;
  fit: SviFit;
  history: SviFit[];
  ivFun: (k: number) => number;
  repriced: { strike: number; price: number }[];
  pdfK: number[];
  pdfY: number[];
  stdK: number[];
};

export function runPipeline(seed = SEED): Pipeline {
  const { F, strikes, calls, puts } = makeSyntheticChain(seed);
  const paritized = paritize(calls, puts);
  const withIv = addIvColumn(paritized);
  const smoothed = gaussianSmooth(withIv.map((r) => r.iv));
  const smoothedRows = withIv.map((r, i) => ({ ...r, iv: smoothed[i] }));
  const filtered = removeNans(smoothedRows);
  const { fit, ivFun, history } = fitSviSmile(
    filtered.map((r) => r.strike),
    filtered.map((r) => r.iv),
    F,
    TAU,
  );
  const repriced = reprice(
    paritized.map((r) => r.strike),
    ivFun,
  );
  const stdK = sampleStd(repriced.map((r) => r.strike));
  const kMin = SPOT - stdK;
  const kMax = SPOT + stdK;
  const pdfK: number[] = [];
  const pdfY: number[] = [];
  for (let i = 0; i < 500; i++) {
    const K = kMin + ((kMax - kMin) * i) / 499;
    pdfK.push(K);
    pdfY.push(breedenLitzenberger(K, ivFun));
  }
  return {
    F,
    calls,
    puts,
    paritized,
    withIv,
    smoothed,
    filtered,
    fit,
    history,
    ivFun,
    repriced,
    pdfK,
    pdfY,
    stdK: [stdK],
  };
}
