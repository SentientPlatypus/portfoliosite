/** Formulas match SentientPlatypus/quantjl @ edaecd6 (code, not README). */

export const EXT = 20;
export const SEED = 3;
export const LOOK_BACK = 30;
export const INITIAL_CAPITAL = 1000;
export const BUY_THRESH = -2.0;
export const SELL_THRESH = 1.72;
export const COOLDOWN = 30;
export const RL_THRESH = 1.5;
export const COST_RATE = 0.0002;
export const GAMMA = 0.99;
export const TAU = 0.005;
export const RISK_WINDOW = 20;
export const RISK_AVERSION = 0.1;
export const CAP_PENALTY_W = 0.2;
export const NEG_SCALE = 0.75;
export const TERM_BONUS = 15;
export const DONE_CAPITAL = 950;
export const OU_THETA = 0.15;
export const OU_MU = 0;
export const OU_SIGMA0 = 0.2;
export const OU_DT = 1;
export const OU_DECAY = 5e-5;
export const OU_SIGMA_MIN = 0.05;
export const ACTOR_WIDTHS = [301, 300, 200, 100, 50, 30, 10, 1] as const;
export const FEATURE_NAMES = [
  'buy_sig',
  'sell_sig',
  'd(buy_sig)',
  'd(sell_sig)',
  'EMA(14)',
  'volume',
  'RSI(14)',
  '%B(20)',
  'sin',
  'cos',
] as const;
export const FEATURE_Z = new Set(['EMA(14)', 'RSI(14)']);

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

export function gaussian(rng: () => number): () => number {
  let spare: number | null = null;
  return () => {
    if (spare !== null) {
      const s = spare;
      spare = null;
      return s;
    }
    let u = 0;
    let v = 0;
    let s = 0;
    do {
      u = rng() * 2 - 1;
      v = rng() * 2 - 1;
      s = u * u + v * v;
    } while (s === 0 || s >= 1);
    const m = Math.sqrt((-2 * Math.log(s)) / s);
    spare = v * m;
    return u * m;
  };
}

export function mean(xs: ArrayLike<number>): number {
  let s = 0;
  const n = xs.length;
  for (let i = 0; i < n; i++) s += xs[i];
  return n ? s / n : 0;
}

/** Julia Statistics.std default: corrected=true, divide by n-1. */
export function std(xs: ArrayLike<number>): number {
  const n = xs.length;
  if (n < 2) return 0;
  const m = mean(xs);
  let v = 0;
  for (let i = 0; i < n; i++) {
    const d = xs[i] - m;
    v += d * d;
  }
  return Math.sqrt(v / (n - 1));
}

export function simpleReturns(raw: ArrayLike<number>): number[] {
  const r: number[] = [];
  for (let i = 1; i < raw.length; i++) r.push((raw[i] - raw[i - 1]) / raw[i - 1]);
  return r;
}

export function calibrate(window: ArrayLike<number>) {
  const ret = simpleReturns(window);
  const mu = mean(ret);
  const sigma = std(ret);
  const drift = mu + 0.5 * sigma * sigma;
  return { mu, sigma, drift, s0: window[window.length - 1] };
}

export function pctChanges(closes: number[]): number[] {
  const p = new Array(closes.length);
  p[0] = 0;
  for (let i = 1; i < closes.length; i++) {
    p[i] = ((closes[i] - closes[i - 1]) / closes[i - 1]) * 100;
  }
  return p;
}

export function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

export function zscore(v: number[]): number[] {
  const m = mean(v);
  const s = std(v);
  if (s === 0) return v.map(() => 0);
  return v.map((x) => (x - m) / s);
}

export class GbmWalks {
  readonly s0: number;
  readonly sigma: number;
  readonly drift: number;
  readonly epoch: number;
  readonly ext: number;
  readonly randn: () => number;
  readonly drawLimit: number;
  done = 0;
  above = 0;
  readonly terminals: number[] = [];
  readonly drawn: number[][] = [];

  constructor(
    cal: { s0: number; sigma: number; drift: number },
    epoch: number,
    ext: number,
    randn: () => number,
    drawLimit = 60,
  ) {
    this.s0 = cal.s0;
    this.sigma = cal.sigma;
    this.drift = cal.drift;
    this.epoch = epoch;
    this.ext = ext;
    this.randn = randn;
    this.drawLimit = drawLimit;
  }

  step(count: number) {
    const { ext, s0, sigma, drift, randn, epoch } = this;
    for (let i = 0; i < count && this.done < epoch; i++) {
      let acc = 0;
      const keep = this.drawn.length < this.drawLimit;
      const path = keep ? new Array<number>(ext) : null;
      for (let k = 0; k < ext; k++) {
        acc += randn();
        const p = s0 * Math.exp(sigma * acc + drift * (k + 1));
        if (p > s0) this.above++;
        if (path) path[k] = p;
        if (k === ext - 1) this.terminals.push(p);
      }
      if (path) this.drawn.push(path);
      this.done++;
    }
  }

  get vRaw() {
    return this.above / (this.epoch * this.ext);
  }

  get progress() {
    return this.epoch ? this.done / this.epoch : 1;
  }
}

export function vRawWindow(
  raw: number[],
  end: number,
  obs: number,
  epoch: number,
  ext: number,
  randn: () => number,
) {
  const temp = raw.slice(end - obs, end + 1);
  const cal = calibrate(temp);
  let above = 0;
  for (let e = 0; e < epoch; e++) {
    let acc = 0;
    for (let k = 0; k < ext; k++) {
      acc += randn();
      const p = cal.s0 * Math.exp(cal.sigma * acc + cal.drift * (k + 1));
      if (p > cal.s0) above++;
    }
  }
  return { vRaw: above / (epoch * ext), ...cal };
}

export type Trade = { i: number; type: 'buy' | 'sell' };

export function backtest(
  prices: number[],
  vz: number[],
  buy = BUY_THRESH,
  sell = SELL_THRESH,
  cooldown = COOLDOWN,
  capital0 = INITIAL_CAPITAL,
) {
  const n = prices.length;
  const capital = new Array<number>(n);
  const bench = new Array<number>(n);
  const trades: Trade[] = [];
  const cooldowns: { start: number; end: number }[] = [];
  let position = 0;
  let cash = capital0;
  let last = -1e9;
  const shares = capital0 / prices[0];
  for (let i = 0; i < n; i++) {
    const v = vz[i];
    if (Number.isFinite(v) && i - last >= cooldown) {
      if (v > sell && position > 0) {
        cash += position * prices[i];
        position = 0;
        last = i;
        trades.push({ i, type: 'sell' });
        cooldowns.push({ start: i, end: Math.min(n - 1, i + cooldown) });
      } else if (v < buy && position === 0) {
        position = cash / prices[i];
        cash = 0;
        last = i;
        trades.push({ i, type: 'buy' });
        cooldowns.push({ start: i, end: Math.min(n - 1, i + cooldown) });
      }
    }
    capital[i] = cash + position * prices[i];
    bench[i] = shares * prices[i];
  }
  return { capital, bench, trades, cooldowns };
}

export function emaSeries(close: number[], window = 14): number[] {
  const n = close.length;
  const ema = new Array<number>(n).fill(NaN);
  const a = 2 / (window + 1);
  ema[window - 1] = mean(close.slice(0, window));
  for (let t = window; t < n; t++) ema[t] = a * close[t] + (1 - a) * ema[t - 1];
  return ema;
}

export function rsiSeries(close: number[], window = 14): number[] {
  const n = close.length;
  const rsi = new Array<number>(n).fill(NaN);
  if (n < window + 1) return rsi;
  const gains: number[] = [];
  const losses: number[] = [];
  for (let i = 1; i < n; i++) {
    const d = close[i] - close[i - 1];
    gains.push(Math.max(d, 0));
    losses.push(-Math.min(d, 0));
  }
  const avgG = new Array<number>(n - 1).fill(NaN);
  const avgL = new Array<number>(n - 1).fill(NaN);
  avgG[window - 1] = mean(gains.slice(0, window));
  avgL[window - 1] = mean(losses.slice(0, window));
  for (let i = window; i < n - 1; i++) {
    avgG[i] = (avgG[i - 1] * (window - 1) + gains[i]) / window;
    avgL[i] = (avgL[i - 1] * (window - 1) + losses[i]) / window;
  }
  for (let i = window; i < n; i++) {
    const al = avgL[i - 1];
    const ag = avgG[i - 1];
    const rs = al === 0 ? Infinity : ag / al;
    rsi[i] = 100 - 100 / (1 + rs);
  }
  return rsi;
}

export function bbPercentB(close: number[], window = 20): number[] {
  const n = close.length;
  const out = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    if (i < window - 1) {
      out[i] = 0.5;
      continue;
    }
    const sl = close.slice(i - window + 1, i + 1);
    const ma = mean(sl);
    const sd = std(sl);
    const bandw = 4 * sd;
    out[i] = bandw === 0 || !Number.isFinite(bandw) ? 0.5 : (close[i] - (ma - 2 * sd)) / bandw;
  }
  return out;
}

export function volumeLog1000(vol: number[]): number[] {
  const ln = Math.log(1000);
  return vol.map((v) => Math.log(v + 1) / ln);
}

export function timeFeatures(minutes: number[]) {
  const T = 7 * 60;
  return {
    sin: minutes.map((m) => Math.sin((2 * Math.PI * m) / T)),
    cos: minutes.map((m) => Math.cos((2 * Math.PI * m) / T)),
  };
}

export function derivative(xs: number[]): number[] {
  return xs.map((x, i) => (i === 0 ? 0 : x - xs[i - 1]));
}

export type FeaturePack = {
  names: readonly string[];
  cols: number[][];
  alignedPrice: number[];
  alignedPct: number[];
  vz: number[];
  vRaw: number[];
};

/** get_all_features alignment: slice [LOOK_BACK:] after vscore(OBS=LOOK_BACK). */
export function buildFeatures(
  closes: number[],
  volumes: number[],
  minutes: number[],
  vz: number[],
  vRaw: number[],
  lookBack = LOOK_BACK,
): FeaturePack {
  const buy = vz.map((v) => Math.max(0, -RL_THRESH - v));
  const sell = vz.map((v) => Math.max(0, v - RL_THRESH));
  const ema = emaSeries(closes).slice(lookBack);
  const vol = volumeLog1000(volumes).slice(lookBack);
  const rsi = rsiSeries(closes).slice(lookBack);
  const bb = bbPercentB(closes).slice(lookBack);
  const tf = timeFeatures(minutes);
  const sin = tf.sin.slice(lookBack);
  const cos = tf.cos.slice(lookBack);
  const z = (xs: number[]) => {
    const m = mean(xs);
    const s = Math.max(std(xs), 1e-8);
    return xs.map((x) => (x - m) / s);
  };
  const cols = [buy, sell, derivative(buy), derivative(sell), z(ema), vol, z(rsi), bb, sin, cos];
  const pct = pctChanges(closes);
  return {
    names: FEATURE_NAMES,
    cols,
    alignedPrice: closes.slice(lookBack),
    alignedPct: pct.slice(lookBack),
    vz,
    vRaw,
  };
}

export type AgentStep = {
  t: number;
  a: number;
  eps: number;
  alloc: number;
  cost: number;
  market: number;
  raw: number;
  ret: number;
  risk: number;
  capPen: number;
  reward: number;
  capital: number;
  bench: number;
  done: boolean;
  terminal: boolean;
  v: number;
};

export function runStandInEpisode(feat: FeaturePack, randn: () => number): AgentStep[] {
  const n = feat.cols[0].length;
  const steps: AgentStep[] = [];
  let capital = INITIAL_CAPITAL;
  let alloc = 0;
  let sigma = OU_SIGMA0;
  let x = 0;
  const recent: number[] = [];
  let bench = INITIAL_CAPITAL;
  const t0 = LOOK_BACK - 1;
  for (let t = t0; t < n - 1; t++) {
    const v = feat.vz[t];
    const a = sigmoid(-v);
    x = x + OU_THETA * (OU_MU - x) * OU_DT + sigma * Math.sqrt(OU_DT) * randn();
    sigma = Math.max(OU_SIGMA_MIN, sigma * Math.exp(-OU_DECAY));
    const eps = x;
    const target = Math.min(1, Math.max(0, a + eps));
    const dAlloc = target - alloc;
    const cost = COST_RATE * Math.abs(dAlloc) * capital;
    capital -= cost;
    const prev = capital;
    alloc = target;
    const pct = feat.alignedPct[t + 1];
    const market = alloc * capital * (pct / 100);
    capital += market;
    bench += bench * (pct / 100);
    const raw = market - cost;
    const ret = raw / prev;
    recent.push(ret);
    if (recent.length > 100) recent.shift();
    const risk =
      recent.length >= RISK_WINDOW ? RISK_AVERSION * std(recent.slice(-RISK_WINDOW)) : 0;
    const capPen = capital < 1000 ? CAP_PENALTY_W * (1000 - capital) / 1000 : 0;
    let reward = ret - risk - capPen;
    if (reward < 0) reward *= NEG_SCALE;
    const end = t === n - 2;
    const bust = capital < DONE_CAPITAL;
    const terminal = bust || end;
    if (terminal) reward += TERM_BONUS * (capital - 1000) / 1000;
    steps.push({
      t,
      a,
      eps,
      alloc,
      cost,
      market,
      raw,
      ret,
      risk,
      capPen,
      reward,
      capital,
      bench,
      done: terminal,
      terminal,
      v,
    });
    if (bust) break;
  }
  return steps;
}

export function histogram(values: number[], bins: number, lo?: number, hi?: number) {
  if (!values.length) return { counts: new Array(bins).fill(0), lo: 0, hi: 1, bins };
  let min = lo ?? values[0];
  let max = hi ?? values[0];
  if (lo === undefined || hi === undefined) {
    for (const v of values) {
      if (v < min) min = v;
      if (v > max) max = v;
    }
  }
  if (min === max) max = min + 1e-9;
  const counts = new Array(bins).fill(0);
  const w = (max - min) / bins;
  for (const v of values) {
    let b = Math.floor((v - min) / w);
    if (b < 0) b = 0;
    if (b >= bins) b = bins - 1;
    counts[b]++;
  }
  return { counts, lo: min, hi: max, bins };
}
