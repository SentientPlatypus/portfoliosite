import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Play, RotateCcw } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { MINUTES, SERIES } from './quantjlData';
import {
  ACTOR_WIDTHS,
  BUY_THRESH,
  COOLDOWN,
  EXT,
  FEATURE_Z,
  GAMMA,
  GbmWalks,
  LOOK_BACK,
  RL_THRESH,
  SEED,
  SELL_THRESH,
  TAU,
  AgentStep,
  FeaturePack,
  Trade,
  backtest,
  buildFeatures,
  calibrate,
  gaussian,
  histogram,
  mulberry32,
  runStandInEpisode,
  vRawWindow,
  zscore,
} from './quantjlMath';

const VS_OBS = 100;
const VS_EPOCH = 400;
const FEAT_EPOCH = 400;
const DRAW_PATHS = 60;

type Scene = 'gbm' | 'vscore' | 'state' | 'agent';
const SCENES: { id: Scene; label: string }[] = [
  { id: 'gbm', label: 'GBM' },
  { id: 'vscore', label: 'V-score' },
  { id: 'state', label: 'State' },
  { id: 'agent', label: 'Agent' },
];

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const hexAlpha = (hex: string, a: number) => {
  const h = hex.replace('#', '');
  const n = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
};

const mix = (a: string, b: string, t: number) => {
  const parse = (hex: string) => {
    const h = hex.replace('#', '');
    const n = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
    return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
  };
  const A = parse(a);
  const B = parse(b);
  const c = A.map((x, i) => Math.round(x + (B[i] - x) * t));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
};

type Colors = {
  fg: string;
  comment: string;
  method: string;
  editor: string;
  sidebar: string;
  border: string;
  string: string;
  keyword: string;
  number: string;
  variable: string;
  type: string;
};

const line = (
  ctx: CanvasRenderingContext2D,
  xs: number[],
  x0: number,
  x1: number,
  yFor: (v: number) => number,
  color: string,
  width = 1.4,
) => {
  if (xs.length < 2) return;
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  for (let i = 0; i < xs.length; i++) {
    const x = x0 + (x1 - x0) * (i / (xs.length - 1));
    const y = yFor(xs[i]);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
};

const yScale = (min: number, max: number, top: number, bot: number) => {
  const span = max - min || 1;
  const pad = span * 0.08;
  const lo = min - pad;
  const hi = max + pad;
  return (v: number) => bot - ((v - lo) / (hi - lo)) * (bot - top);
};

const minMax = (xs: ArrayLike<number>) => {
  let lo = xs[0];
  let hi = xs[0];
  for (let i = 1; i < xs.length; i++) {
    if (xs[i] < lo) lo = xs[i];
    if (xs[i] > hi) hi = xs[i];
  }
  return { lo, hi };
};

/** CSS-pixel type scale: phones (~390) keep 8–11px; ~860px canvas (1440 window) hits 12 / 14–16. */
const typeScale = (w: number) => {
  const t = Math.max(0, Math.min(1, (w - 390) / 430));
  return {
    title: 11 + t * 5,
    readout: 10 + t * 5,
    label: 9 + t * 3.5,
    small: 8 + t * 4,
    t,
  };
};
type TypeScale = ReturnType<typeof typeScale>;

const font = (ctx: CanvasRenderingContext2D, px: number, weight = '500') => {
  ctx.font = `${weight} ${px}px ui-monospace, SFMono-Regular, Menlo, monospace`;
};

const fillText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  align: CanvasTextAlign = 'left',
) => {
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
};

const rr = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill?: string,
  stroke?: string,
) => {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }
};

type GbmState = {
  walks: GbmWalks | null;
  dwell: number;
};
type VsState = {
  raw: number[];
  i: number;
  morph: number;
  vz: number[] | null;
  trades: Trade[];
  capital: number[];
  bench: number[];
  cooldowns: { start: number; end: number }[];
  dwell: number;
  rng: () => number;
};
type StState = {
  i: number;
  flatten: number;
  dwell: number;
};
type AgState = {
  steps: AgentStep[] | null;
  i: number;
  dwell: number;
  flash: number;
};

const closes = SERIES.closes;
const volumes = SERIES.volumes;

const windowAtEnd = (obs: number) => closes.slice(closes.length - (obs + 1));

const QuantJL = ({ poster, title }: { poster: string; title: string }) => {
  const { theme } = useTheme();
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(false);
  const [scene, setScene] = useState<Scene>('gbm');
  const [autoplay, setAutoplay] = useState(true);
  const [obs, setObs] = useState(100);
  const [epoch, setEpoch] = useState(1000);
  const [rlFeat, setRlFeat] = useState(false);
  const [busy, setBusy] = useState(false);
  const [readout, setReadout] = useState(() => {
    const c = calibrate(windowAtEnd(100));
    return { ...c, vRaw: 0, progress: 0 };
  });

  const sceneRef = useRef<Scene>('gbm');
  const autoRef = useRef(true);
  const userRef = useRef(false);
  const obsRef = useRef(100);
  const epochRef = useRef(1000);
  const rlRef = useRef(false);
  const inViewRef = useRef(true);
  const reducedRef = useRef(false);
  const colorsRef = useRef<Colors | null>(null);
  const gbm = useRef<GbmState>({ walks: null, dwell: 0 });
  const vs = useRef<VsState>({
    raw: [],
    i: 0,
    morph: 0,
    vz: null,
    trades: [],
    capital: [],
    bench: [],
    cooldowns: [],
    dwell: 0,
    rng: gaussian(mulberry32(SEED)),
  });
  const st = useRef<StState>({ i: LOOK_BACK - 1, flatten: 0, dwell: 0 });
  const ag = useRef<AgState>({ steps: null, i: 0, dwell: 0, flash: 0 });
  const feat = useRef<{
    pack: FeaturePack | null;
    raw: number[];
    i: number;
    rng: () => number;
  }>({ pack: null, raw: [], i: LOOK_BACK, rng: gaussian(mulberry32(SEED + 1)) });
  const fade = useRef(1);

  useEffect(() => {
    sceneRef.current = scene;
  }, [scene]);
  useEffect(() => {
    autoRef.current = autoplay;
  }, [autoplay]);
  useEffect(() => {
    obsRef.current = obs;
    const c = calibrate(windowAtEnd(obs));
    setReadout((r) => ({ ...r, ...c }));
  }, [obs]);
  useEffect(() => {
    epochRef.current = epoch;
  }, [epoch]);
  useEffect(() => {
    rlRef.current = rlFeat;
  }, [rlFeat]);
  useEffect(() => {
    colorsRef.current = {
      fg: theme.colors.foreground,
      comment: theme.colors.comment,
      method: theme.colors.method,
      editor: theme.colors.editor,
      sidebar: theme.colors.sidebar,
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

  const startGbm = (full: boolean) => {
    const cal = calibrate(windowAtEnd(obsRef.current));
    const walks = new GbmWalks(cal, epochRef.current, EXT, gaussian(mulberry32(SEED)), DRAW_PATHS);
    if (full) walks.step(walks.epoch);
    gbm.current = { walks, dwell: 0 };
    setReadout({ ...cal, vRaw: walks.vRaw, progress: walks.progress });
    setBusy(!full);
  };

  const resetScene = (id: Scene, reduced: boolean) => {
    fade.current = 0;
    if (id === 'gbm') {
      if (reduced) startGbm(true);
      else {
        gbm.current = { walks: null, dwell: 0 };
        const c = calibrate(windowAtEnd(obsRef.current));
        setReadout({ ...c, vRaw: 0, progress: 0 });
        setBusy(false);
      }
    } else if (id === 'vscore') {
      vs.current = {
        raw: [],
        i: VS_OBS,
        morph: reduced ? 1 : 0,
        vz: null,
        trades: [],
        capital: [],
        bench: [],
        cooldowns: [],
        dwell: 0,
        rng: gaussian(mulberry32(SEED)),
      };
    } else if (id === 'state') {
      st.current = {
        i: LOOK_BACK - 1,
        flatten: reduced ? 1 : 0,
        dwell: 0,
      };
    } else {
      ag.current = { steps: null, i: 0, dwell: 0, flash: 0 };
    }
  };

  const goScene = (id: Scene, fromUser: boolean) => {
    if (fromUser) stopAuto();
    resetScene(id, reducedRef.current);
    setScene(id);
  };

  const replay = () => {
    userRef.current = false;
    autoRef.current = !reducedRef.current;
    setAutoplay(!reducedRef.current);
    resetScene('gbm', reducedRef.current);
    setScene('gbm');
    if (!reducedRef.current) startGbm(false);
  };

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
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
      startGbm(true);
    } else {
      startGbm(false);
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

    const stepFeat = (n: number) => {
      const f = feat.current;
      if (f.pack) return;
      for (let k = 0; k < n && f.i < closes.length; k++) {
        const { vRaw } = vRawWindow(closes, f.i, LOOK_BACK, FEAT_EPOCH, EXT, f.rng);
        f.raw.push(vRaw);
        f.i++;
      }
      if (f.i >= closes.length) {
        const vz = zscore(f.raw);
        f.pack = buildFeatures(closes, volumes, MINUTES, vz, f.raw, LOOK_BACK);
      }
    };

    const finishVs = (raw: number[]) => {
      const vz = zscore(raw);
      const prices = closes.slice(VS_OBS);
      const bt = backtest(prices, vz);
      vs.current.vz = vz;
      vs.current.trades = bt.trades;
      vs.current.capital = bt.capital;
      vs.current.bench = bt.bench;
      vs.current.cooldowns = bt.cooldowns;
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      fade.current = Math.min(1, fade.current + dt * 3.2);
      const reduced = reducedRef.current;
      stepFeat(reduced ? 40 : 3);

      const sc = sceneRef.current;
      if (sc === 'gbm') {
        const w = gbm.current.walks;
        if (w && w.done < w.epoch) {
          w.step(reduced ? w.epoch : Math.max(12, Math.ceil(w.epoch * dt * 1.6)));
          if (w.done >= w.epoch || (w.done & 31) === 0) {
            const live = calibrate(windowAtEnd(obsRef.current));
            setReadout({ ...live, vRaw: w.vRaw, progress: w.progress });
          }
          if (w.done >= w.epoch) setBusy(false);
        } else if (w && w.done >= w.epoch) {
          gbm.current.dwell += dt;
          if (autoRef.current && !userRef.current && gbm.current.dwell > 1.05) goScene('vscore', false);
        } else if (autoRef.current && !userRef.current && !w && !reduced) {
          startGbm(false);
        }
      } else if (sc === 'vscore') {
        const s = vs.current;
        if (s.i < closes.length) {
          const batch = reduced ? closes.length : Math.max(1, Math.floor(dt * 90));
          for (let k = 0; k < batch && s.i < closes.length; k++) {
            const { vRaw } = vRawWindow(closes, s.i, VS_OBS, VS_EPOCH, EXT, s.rng);
            s.raw.push(vRaw);
            s.i++;
          }
          if (s.i >= closes.length) finishVs(s.raw);
        } else {
          s.morph = Math.min(1, s.morph + dt * (reduced ? 8 : 0.85));
          if (s.morph >= 1) {
            s.dwell += dt;
            if (autoRef.current && !userRef.current && s.dwell > 0.95) goScene('state', false);
          }
        }
      } else if (sc === 'state') {
        if (!feat.current.pack) return;
        const s = st.current;
        const maxI = feat.current.pack.cols[0].length - 1;
        if (s.i < maxI - 8 && s.flatten < 0.02) {
          s.i = Math.min(maxI - 8, s.i + (reduced ? 400 : dt * 28));
        } else {
          s.flatten = Math.min(1, s.flatten + dt * (reduced ? 8 : 1.15));
          if (s.flatten >= 1) {
            s.dwell += dt;
            if (autoRef.current && !userRef.current && s.dwell > 0.9) goScene('agent', false);
          }
        }
      } else {
        const f = feat.current.pack;
        if (!f) return;
        if (!ag.current.steps) {
          ag.current.steps = runStandInEpisode(f, gaussian(mulberry32(SEED)));
          if (reduced) ag.current.i = ag.current.steps.length - 1;
        }
        const s = ag.current;
        if (s.steps && s.i < s.steps.length - 1) {
          s.i = Math.min(s.steps.length - 1, s.i + (reduced ? 999 : dt * 14));
        } else {
          s.dwell += dt;
          if (s.steps && s.steps[Math.round(s.i)]?.terminal) s.flash = reduced ? 0.25 : (s.flash + dt) % 1;
          if (autoRef.current && !userRef.current && s.dwell > 1.2) {
            autoRef.current = false;
            setAutoplay(false);
          }
        }
      }
    };

    const draw = () => {
      const ctx = canvas.getContext('2d');
      const pal = colorsRef.current;
      if (!ctx || !pal) return;
      const w = host.clientWidth || 640;
      const h = host.clientHeight || 420;
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.globalAlpha = fade.current;
      const sc = sceneRef.current;
      const fs = typeScale(w);
      if (sc === 'gbm') drawGbm(ctx, w, h, pal, gbm.current, obsRef.current, fs);
      else if (sc === 'vscore') drawVscore(ctx, w, h, pal, vs.current, rlRef.current, fs);
      else if (sc === 'state') drawState(ctx, w, h, pal, st.current, feat.current.pack, fs);
      else drawAgent(ctx, w, h, pal, ag.current, feat.current.pack, fs);
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
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
        if (entry.isIntersecting) startLoop();
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

  const calLive = calibrate(windowAtEnd(obs));

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
        className="relative w-full min-w-0 overflow-hidden rounded-t-lg aspect-[4/5] sm:aspect-[4/3] lg:aspect-[16/10] lg:min-h-0 lg:flex-1 lg:max-h-[calc(85vh-17rem)]"
        style={{ background: 'var(--theme-editor)' }}
      >
        {!visible && (
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
        className="space-y-2.5 border-t px-3 py-3 sm:px-4 lg:shrink-0"
        style={{ background: 'var(--theme-sidebar)', borderColor: 'var(--theme-border)' }}
      >
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
            {SCENES.map((s) => {
              const on = scene === s.id;
              return (
                <motion.button
                  key={s.id}
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => goScene(s.id, true)}
                  className="rounded-md border px-2.5 py-1 text-[11px] font-medium"
                  style={{
                    borderColor: on ? 'var(--theme-method)' : 'var(--theme-border)',
                    color: on ? 'var(--theme-editor)' : 'var(--theme-foreground)',
                    background: on ? 'var(--theme-method)' : 'var(--theme-editor)',
                  }}
                >
                  {s.label}
                </motion.button>
              );
            })}
          </div>
          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={(e) => {
              e.stopPropagation();
              replay();
            }}
            className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 py-1 text-[11px] font-medium"
            style={{
              borderColor: 'var(--theme-border)',
              color: 'var(--theme-foreground)',
              background: 'var(--theme-editor)',
            }}
          >
            {autoplay ? <RotateCcw className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            {autoplay ? 'playing' : 'replay'}
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={scene}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-2"
          >
            {scene === 'gbm' && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    stopAuto();
                    startGbm(false);
                  }}
                  className="w-full rounded-md border px-3 py-2 text-sm font-semibold tracking-wide"
                  style={{
                    borderColor: 'var(--theme-method)',
                    background: 'var(--theme-method)',
                    color: 'var(--theme-editor)',
                  }}
                >
                  {busy ? 'Simulating walks…' : 'Simulate walks'}
                </button>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <label className="block min-w-0">
                    <div className="mb-0.5 flex justify-between text-[10px] font-mono" style={{ color: 'var(--theme-comment)' }}>
                      <span>OBS</span>
                      <span>{obs}</span>
                    </div>
                    <input
                      type="range"
                      min={20}
                      max={100}
                      value={obs}
                      aria-label="Observation window"
                      onChange={(e) => setObs(Number(e.target.value))}
                      className="qj-range w-full"
                    />
                  </label>
                  <label className="block min-w-0">
                    <div className="mb-0.5 flex justify-between text-[10px] font-mono" style={{ color: 'var(--theme-comment)' }}>
                      <span>EPOCH</span>
                      <span>{epoch}</span>
                    </div>
                    <input
                      type="range"
                      min={100}
                      max={5000}
                      step={100}
                      value={epoch}
                      aria-label="Monte Carlo paths"
                      onChange={(e) => setEpoch(Number(e.target.value))}
                      className="qj-range w-full"
                    />
                  </label>
                </div>
                <div className="text-[11px] font-mono leading-relaxed" style={{ color: 'var(--theme-foreground)' }}>
                  μ = {calLive.mu.toExponential(3)} · σ = {calLive.sigma.toExponential(3)} · drift = μ + ½σ² ={' '}
                  {calLive.drift.toExponential(3)}
                  <span style={{ color: 'var(--theme-comment)' }}>
                    {' '}
                    · v_raw = {readout.vRaw.toFixed(3)} · EXT = {EXT}
                  </span>
                </div>
                <p className="text-[10px] font-mono leading-snug" style={{ color: 'var(--theme-comment)' }}>
                  paths = s0 · exp(σ · cumsum(Z) + (μ + ½σ²) · t) · v_raw = count(path &gt; s0) / (EPOCH · EXT)
                </p>
              </>
            )}
            {scene === 'vscore' && (
              <>
                <label className="inline-flex items-center gap-2 text-[11px]" style={{ color: 'var(--theme-foreground)' }}>
                  <input
                    type="checkbox"
                    checked={rlFeat}
                    onChange={(e) => setRlFeat(e.target.checked)}
                  />
                  RL features buy_sig / sell_sig at ±1.5
                </label>
                <p className="text-[10px] font-mono leading-snug" style={{ color: 'var(--theme-comment)' }}>
                  v = (v_raw − mean) / std · buy v &lt; −2.0 · sell v &gt; 1.72 · cooldown 30 · EPOCH={VS_EPOCH} EXT=
                  {EXT} · all-in / all-out
                </p>
              </>
            )}
            {scene === 'state' && (
              <p className="text-[10px] font-mono leading-snug" style={{ color: 'var(--theme-comment)' }}>
                s = concat(x<sub>t−29:t</sub> × 10 features) ⊕ alloc ∈ ℝ³⁰¹ · s′ = shift 1 bar · only RSI &amp; EMA
                z-scored · MACD / VWAP not in state
              </p>
            )}
            {scene === 'agent' && (
              <p className="text-[10px] font-mono leading-snug" style={{ color: 'var(--theme-comment)' }}>
                stand-in a = σ(−v) — not the trained DDPG actor · alloc = clip(a+ε, 0, 1) · cost = 2e−4 |Δalloc|
                capital · γ={GAMMA} τ={TAU} · replay FIFO 10k · batch 256
              </p>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="text-[10px] leading-snug" style={{ color: 'var(--theme-comment)' }}>
          {SERIES.ticker} {SERIES.date} minute bars from{' '}
          <a
            href={SERIES.repo}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
            style={{ color: 'var(--theme-method)' }}
          >
            quantjl
          </a>{' '}
          {SERIES.file} · seed {SEED}
        </div>
      </div>

      <style>{`
        .qj-range {
          -webkit-appearance: none;
          appearance: none;
          height: 28px;
          margin: -11px 0;
          background: transparent;
          outline: none;
          cursor: pointer;
          touch-action: pan-y;
        }
        .qj-range::-webkit-slider-runnable-track {
          height: 4px;
          border-radius: 999px;
          background: color-mix(in srgb, var(--theme-method) 55%, var(--theme-border));
        }
        .qj-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          box-sizing: border-box;
          width: 16px;
          height: 16px;
          margin-top: -6px;
          border-radius: 999px;
          background: var(--theme-method);
          border: 2px solid var(--theme-sidebar);
          cursor: pointer;
          box-shadow: 0 0 0 1px var(--theme-border);
        }
        .qj-range::-moz-range-track {
          height: 4px;
          border-radius: 999px;
          background: color-mix(in srgb, var(--theme-method) 55%, var(--theme-border));
        }
        .qj-range::-moz-range-thumb {
          box-sizing: border-box;
          width: 16px;
          height: 16px;
          border-radius: 999px;
          background: var(--theme-method);
          border: 2px solid var(--theme-sidebar);
          cursor: pointer;
        }
      `}</style>
    </motion.div>
  );
};

function drawGbm(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  pal: Colors,
  st: GbmState,
  obs: number,
  fs: TypeScale,
) {
  const pad = 14;
  const histW = Math.max(52, Math.min(78, w * 0.14));
  const plotR = w - pad - histW - 8;
  const plotL = pad;
  const top = Math.round(8 + fs.title * 1.45);
  const bot = h - Math.round(8 + fs.small * 1.35);
  const win = windowAtEnd(obs);
  const walks = st.walks;
  const s0 = walks?.s0 ?? win[win.length - 1];
  let lo = Math.min(...win);
  let hi = Math.max(...win);
  if (walks) {
    for (const p of walks.drawn) {
      for (const x of p) {
        if (x < lo) lo = x;
        if (x > hi) hi = x;
      }
    }
    for (const t of walks.terminals) {
      if (t < lo) lo = t;
      if (t > hi) hi = t;
    }
  }
  const y = yScale(lo, hi, top, bot);
  const histStart = win.length - 1;
  const totalX = histStart + EXT;
  const xAt = (i: number) => plotL + ((plotR - plotL) * i) / totalX;

  ctx.fillStyle = hexAlpha(pal.variable, 0.06);
  ctx.fillRect(plotL, top, xAt(histStart) - plotL, bot - top);

  line(ctx, win, plotL, xAt(histStart), y, pal.fg, 1.6);
  ctx.beginPath();
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = hexAlpha(pal.method, 0.7);
  ctx.lineWidth = 1;
  ctx.moveTo(plotL, y(s0));
  ctx.lineTo(plotR, y(s0));
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.beginPath();
  ctx.strokeStyle = hexAlpha(pal.comment, 0.5);
  ctx.moveTo(xAt(histStart), top);
  ctx.lineTo(xAt(histStart), bot);
  ctx.stroke();

  if (walks) {
    for (const p of walks.drawn) {
      const last = p[p.length - 1];
      ctx.beginPath();
      ctx.strokeStyle = last > s0 ? hexAlpha(pal.type, 0.45) : hexAlpha(pal.keyword, 0.4);
      ctx.lineWidth = 1;
      ctx.moveTo(xAt(histStart), y(s0));
      for (let k = 0; k < p.length; k++) ctx.lineTo(xAt(histStart + 1 + k), y(p[k]));
      ctx.stroke();
    }
    const hist = histogram(walks.terminals, 22);
    const maxC = Math.max(1, ...hist.counts);
    for (let i = 0; i < hist.counts.length; i++) {
      const y0 = bot - ((i + 1) / hist.bins) * (bot - top);
      const y1 = bot - (i / hist.bins) * (bot - top);
      const binMid = hist.lo + ((i + 0.5) / hist.bins) * (hist.hi - hist.lo);
      const bw = histW * (hist.counts[i] / maxC);
      ctx.fillStyle = binMid > s0 ? hexAlpha(pal.type, 0.7) : hexAlpha(pal.keyword, 0.7);
      ctx.fillRect(plotR + 6, y0, Math.max(bw, hist.counts[i] ? 1.5 : 0), y1 - y0 - 0.6);
    }
  }

  font(ctx, fs.title, '600');
  fillText(ctx, 'Monte Carlo GBM', pad, pad + fs.title * 0.15, pal.method);
  font(ctx, fs.readout);
  fillText(ctx, `s0  ${s0.toFixed(4)}`, w - pad, pad + fs.title * 0.15, pal.comment, 'right');
  font(ctx, fs.small);
  fillText(ctx, 'price', plotL, bot + fs.small * 1.05, pal.comment);
  fillText(ctx, '+EXT', xAt(histStart + EXT), bot + fs.small * 1.05, pal.comment, 'right');
  fillText(ctx, 'term', w - pad, bot + fs.small * 1.05, pal.comment, 'right');
}

function drawVscore(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  pal: Colors,
  st: VsState,
  rl: boolean,
  fs: TypeScale,
) {
  const pad = 14;
  const top = Math.round(8 + fs.title * 1.45);
  const pBot = h * 0.42;
  const vTop = h * 0.46;
  const vBot = h * 0.72;
  const cTop = h * 0.76;
  const cBot = h - Math.round(8 + fs.small);
  const nShow = st.raw.length;
  const prices = closes;
  const x0 = pad;
  const x1 = w - pad;

  font(ctx, fs.title, '600');
  fillText(ctx, w < 460 ? 'V-score' : 'V-score  ·  z-score of GBM exceedance', pad, pad + fs.title * 0.15, pal.method);

  if (!prices.length) return;
  const py = yScale(minMax(prices).lo, minMax(prices).hi, top, pBot);
  line(ctx, prices, x0, x1, py, pal.fg, 1.4);

  const endIdx = nShow ? VS_OBS + nShow - 1 : VS_OBS;
  const xAt = (i: number) => x0 + ((x1 - x0) * i) / Math.max(1, prices.length - 1);
  const wx0 = xAt(Math.max(0, endIdx - VS_OBS));
  const wx1 = xAt(Math.min(prices.length - 1, endIdx));
  ctx.fillStyle = hexAlpha(pal.method, 0.12);
  ctx.fillRect(Math.min(wx0, wx1), top, Math.max(2, Math.abs(wx1 - wx0)), pBot - top);

  for (const t of st.trades) {
    const pi = t.i + VS_OBS;
    if (pi >= prices.length) continue;
    const x = xAt(pi);
    ctx.beginPath();
    ctx.strokeStyle = t.type === 'buy' ? pal.type : pal.keyword;
    ctx.lineWidth = 1.2;
    ctx.moveTo(x, top);
    ctx.lineTo(x, pBot);
    ctx.stroke();
    ctx.beginPath();
    ctx.fillStyle = t.type === 'buy' ? pal.type : pal.keyword;
    ctx.arc(x, py(prices[pi]), 3.2, 0, Math.PI * 2);
    ctx.fill();
  }

  const raw = st.raw;
  const shown = raw.map((v, i) => {
    if (!st.vz || st.morph <= 0) return v;
    return v + (st.vz[i] - v) * st.morph;
  });
  if (shown.length > 1) {
    for (const cd of st.cooldowns) {
      const a = xAt(cd.start + VS_OBS);
      const b = xAt(cd.end + VS_OBS);
      ctx.fillStyle = hexAlpha(pal.string, 0.1);
      ctx.fillRect(a, vTop, b - a, vBot - vTop);
    }
    const padLeft = (xs: number[]) => {
      const out = new Array(VS_OBS).fill(NaN).concat(xs);
      return out;
    };
    const strokeSkipNan = (
      xs: number[],
      y: (v: number) => number,
      color: string,
      width = 1.4,
    ) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      let started = false;
      for (let i = 0; i < xs.length; i++) {
        if (!Number.isFinite(xs[i])) {
          started = false;
          continue;
        }
        const x = xAt(i);
        if (!started) {
          ctx.moveTo(x, y(xs[i]));
          started = true;
        } else ctx.lineTo(x, y(xs[i]));
      }
      ctx.stroke();
    };
    let series = padLeft(shown);
    let lo = Math.min(...shown);
    let hi = Math.max(...shown);
    if (rl && st.vz) {
      const buy = padLeft(st.vz.map((v) => Math.max(0, -RL_THRESH - v)));
      const sell = padLeft(st.vz.map((v) => Math.max(0, v - RL_THRESH)));
      lo = 0;
      hi = Math.max(...st.vz.map((v) => Math.max(0, -RL_THRESH - v, v - RL_THRESH)), 0.2);
      const y = yScale(lo, hi, vTop, vBot);
      strokeSkipNan(buy, y, pal.type);
      strokeSkipNan(sell, y, pal.keyword);
      font(ctx, fs.small);
      fillText(ctx, 'buy_sig  sell_sig', x0, vTop + fs.small, pal.comment);
    } else {
      if (st.morph > 0.6) {
        lo = Math.min(lo, BUY_THRESH - 0.3);
        hi = Math.max(hi, SELL_THRESH + 0.3);
      }
      const y = yScale(lo, hi, vTop, vBot);
      strokeSkipNan(series, y, pal.variable, 1.5);
      if (st.morph > 0.35) {
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = hexAlpha(pal.type, 0.8);
        ctx.beginPath();
        ctx.moveTo(x0, y(BUY_THRESH));
        ctx.lineTo(x1, y(BUY_THRESH));
        ctx.stroke();
        ctx.strokeStyle = hexAlpha(pal.keyword, 0.8);
        ctx.beginPath();
        ctx.moveTo(x0, y(SELL_THRESH));
        ctx.lineTo(x1, y(SELL_THRESH));
        ctx.stroke();
        ctx.setLineDash([]);
        font(ctx, fs.small);
        fillText(ctx, '−2.0 buy', x1, y(BUY_THRESH) + fs.small * 1.05, pal.type, 'right');
        fillText(ctx, '1.72 sell', x1, y(SELL_THRESH) - fs.small * 1.05, pal.keyword, 'right');
      }
      font(ctx, fs.small);
      fillText(ctx, st.morph > 0.7 ? 'v  z-score' : 'v_raw  P(path > s0)', x0, vTop + fs.small, pal.comment);
    }
  }

  if (st.capital.length > 1) {
    const capN = Math.min(st.capital.length, shown.length);
    const cap = new Array(VS_OBS).fill(NaN).concat(st.capital.slice(0, capN));
    const ben = new Array(VS_OBS).fill(NaN).concat(st.bench.slice(0, capN));
    const mm = minMax([...st.capital.slice(0, capN), ...st.bench.slice(0, capN)]);
    const y = yScale(mm.lo, mm.hi, cTop, cBot);
    const stroke = (xs: number[], color: string, width: number) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      let started = false;
      for (let i = 0; i < xs.length; i++) {
        if (!Number.isFinite(xs[i])) {
          started = false;
          continue;
        }
        const x = xAt(i);
        if (!started) {
          ctx.moveTo(x, y(xs[i]));
          started = true;
        } else ctx.lineTo(x, y(xs[i]));
      }
      ctx.stroke();
    };
    stroke(cap, pal.method, 1.5);
    stroke(ben, hexAlpha(pal.comment, 0.85), 1.1);
    font(ctx, fs.small);
    fillText(ctx, 'capital', x0, cTop + fs.small, pal.method);
    fillText(ctx, 'buy & hold', x0 + fs.small * 7.2, cTop + fs.small, pal.comment);
  }

  font(ctx, fs.small);
  fillText(ctx, `${nShow} / ${closes.length - VS_OBS} windows`, w - pad, pad + fs.title * 0.15, pal.comment, 'right');
}

function drawState(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  pal: Colors,
  st: StState,
  pack: FeaturePack | null,
  fs: TypeScale,
) {
  font(ctx, fs.title, '600');
  fillText(ctx, 'Environment state  ·  10 × 30 → ℝ³⁰¹', 14, 10 + fs.title * 0.35, pal.method);
  if (!pack) {
    font(ctx, fs.readout);
    fillText(ctx, 'calibrating features (GBM v-score)…', 14, h / 2, pal.comment);
    return;
  }
  const names = pack.names;
  const short = ['buy_sig', 'sell_sig', 'd buy', 'd sell', 'EMA', 'vol', 'RSI', '%B', 'sin', 'cos'];
  const end = Math.min(pack.cols[0].length - 1, Math.max(LOOK_BACK - 1, Math.floor(st.i)));
  const start = end - LOOK_BACK + 1;
  const labelW = w < 420 ? 44 : Math.max(68, fs.label * 7.2);
  const pad = 12;
  const gridL = pad + labelW;
  const gridR = w - pad;
  const gridT = Math.round(12 + fs.title * 1.35);
  const gridB = h - Math.round(16 + fs.small * 1.4);
  const cols = LOOK_BACK;
  const rows = names.length;
  const f = st.flatten;

  for (let r = 0; r < rows; r++) {
    const row = pack.cols[r];
    const sl = row.slice(start, end + 1);
    const mm = minMax(sl);
    const span = mm.hi - mm.lo || 1;
    for (let c = 0; c < sl.length; c++) {
      const gx = gridL + (c / cols) * (gridR - gridL);
      const gy = gridT + (r / rows) * (gridB - gridT);
      const gw = (gridR - gridL) / cols - 0.6;
      const gh = (gridB - gridT) / rows - 1.2;
      const t = (sl[c] - mm.lo) / span;
      const flatI = r * cols + c;
      const sx = pad + (flatI / 301) * (w - pad * 2 - 10);
      const sy = h * 0.42;
      const sw = (w - pad * 2 - 10) / 301;
      const sh = 26;
      const x = gx + (sx - gx) * f;
      const y = gy + (sy - gy) * f;
      const cw = gw + (sw - gw) * f;
      const ch = gh + (sh - gh) * f;
      ctx.fillStyle = mix(pal.keyword, pal.type, t);
      ctx.fillRect(x, y, Math.max(cw, 0.8), Math.max(ch, 0.8));
    }
    if (f < 0.55) {
      font(ctx, w < 420 ? fs.small : fs.label);
      const z = FEATURE_Z.has(names[r]) ? ' z' : '';
      fillText(ctx, short[r] + z, pad, gridT + ((r + 0.5) / rows) * (gridB - gridT), pal.comment);
    }
  }

  const allocX = pad + (300 / 301) * (w - pad * 2 - 10);
  const allocY = h * 0.42 + (gridT + ((rows - 0.5) / rows) * (gridB - gridT) - h * 0.42) * (1 - f);
  ctx.fillStyle = pal.method;
  ctx.globalAlpha = 0.35 + 0.65 * f;
  ctx.fillRect(allocX, allocY, Math.max(4, (w - pad * 2) / 40), 26);
  ctx.globalAlpha = 1;
  if (f > 0.4) {
    font(ctx, fs.label);
    fillText(ctx, 'alloc', allocX, h * 0.42 + 20 + fs.label, pal.method, 'center');
    fillText(ctx, 's ∈ ℝ³⁰¹', pad, h - 8 - fs.small * 0.2, pal.fg);
    fillText(ctx, "s′ = shift 1", w - pad, h - 8 - fs.small * 0.2, pal.comment, 'right');
  }
}

function drawAgent(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  pal: Colors,
  st: AgState,
  pack: FeaturePack | null,
  fs: TypeScale,
) {
  font(ctx, fs.title, '600');
  const narrow = w < 460;
  fillText(ctx, narrow ? 'Agent step' : 'Agent step  ·  stand-in policy', 14, 10 + fs.title * 0.25, pal.method);
  const badgeH = Math.max(16, fs.small + 8);
  const badgeW = narrow ? 176 : Math.max(154, 14 + fs.small * 16);
  rr(ctx, w - 14 - badgeW, 6, badgeW, badgeH, 4, hexAlpha(pal.string, 0.16), hexAlpha(pal.string, 0.5));
  font(ctx, fs.small, '700');
  fillText(ctx, narrow ? 'stand-in · NOT the trained actor' : 'NOT the trained actor', w - 14 - badgeW / 2, 6 + badgeH / 2, pal.string, 'center');

  if (!pack) {
    font(ctx, fs.readout);
    fillText(ctx, 'waiting on feature tape…', 14, h / 2, pal.comment);
    return;
  }
  if (!st.steps || !st.steps.length) {
    font(ctx, fs.readout);
    fillText(ctx, 'rolling stand-in episode…', 14, h / 2, pal.comment);
    return;
  }

  const idx = Math.min(st.steps.length - 1, Math.round(st.i));
  const step = st.steps[idx];
  const netT = Math.round(12 + fs.title * 1.2);
  const netB = h * 0.3;
  const maxW = Math.max(...ACTOR_WIDTHS);
  const boxW = (w - 28) / ACTOR_WIDTHS.length - 6;
  ACTOR_WIDTHS.forEach((n, i) => {
    const x = 14 + i * (boxW + 6);
    const hh = 16 + (n / maxW) * (netB - netT - 22);
    const y = netT + (netB - netT - hh) / 2;
    rr(ctx, x, y, boxW, hh, 4, hexAlpha(pal.variable, 0.12), hexAlpha(pal.variable, 0.45));
    font(ctx, w < 400 ? fs.small : fs.label);
    fillText(ctx, String(n), x + boxW / 2, y + hh / 2, pal.variable, 'center');
    if (i < ACTOR_WIDTHS.length - 1) {
      ctx.beginPath();
      ctx.strokeStyle = hexAlpha(pal.comment, 0.5);
      ctx.moveTo(x + boxW, y + hh / 2);
      ctx.lineTo(x + boxW + 6, y + hh / 2);
      ctx.stroke();
    }
  });
  font(ctx, fs.small);
  fillText(ctx, 'ReLU →  sigmoid', 14, netB + fs.small * 0.35, pal.comment);

  const midT = h * 0.36;
  const midB = h * 0.62;
  font(ctx, fs.readout);
  fillText(ctx, `a = σ(−v) = ${step.a.toFixed(3)}`, 14, midT + fs.readout * 0.8, pal.fg);
  fillText(ctx, `ε ~ OU  ${step.eps.toFixed(3)}`, 14, midT + fs.readout * 2.15, pal.number);
  fillText(ctx, `v = ${step.v.toFixed(2)}`, 14, midT + fs.readout * 3.5, pal.comment);

  const barX = w * 0.42;
  const barW = w - barX - 14;
  const barH = Math.max(12, fs.label);
  rr(ctx, barX, midT + 4, barW, barH, 4, hexAlpha(pal.border, 0.6));
  rr(ctx, barX, midT + 4, Math.max(2, barW * step.alloc), barH, 4, hexAlpha(pal.type, 0.85));
  font(ctx, fs.label);
  fillText(ctx, `alloc ${step.alloc.toFixed(2)}`, barX, midT + 8 + barH + fs.label * 0.55, pal.type);

  const parts = [
    { k: 'return', v: step.ret, c: pal.type },
    { k: '−risk', v: -step.risk, c: pal.keyword },
    { k: '−cap', v: -step.capPen, c: pal.string },
  ];
  const maxAbs = Math.max(0.002, ...parts.map((p) => Math.abs(p.v)));
  parts.forEach((p, i) => {
    const x = barX + i * (barW / 3);
    const mag = (Math.abs(p.v) / maxAbs) * 28;
    const y = midT + 36 + fs.label * 2;
    ctx.fillStyle = hexAlpha(p.c, 0.8);
    if (p.v >= 0) ctx.fillRect(x, y - mag, barW / 3 - 6, mag);
    else ctx.fillRect(x, y, barW / 3 - 6, mag);
    font(ctx, fs.small);
    fillText(ctx, p.k, x, y + fs.small * 1.5, p.c);
  });
  font(ctx, fs.label);
  fillText(
    ctx,
    `r = ${step.reward.toFixed(4)}${step.reward < 0 ? '  ×0.75' : ''}${step.terminal ? '  +term' : ''}`,
    barX,
    midB - 4,
    pal.method,
  );
  font(ctx, fs.small);
  fillText(ctx, `cost ${step.cost.toFixed(4)}  mkt ${step.market.toFixed(4)}`, 14, midT + fs.readout * 5, pal.comment);

  const captionH = fs.small + 6;
  const pillH = 10;
  const capT = h * 0.66;
  const capB = h - captionH - pillH - 10;
  const caps = st.steps.slice(0, idx + 1).map((s) => s.capital);
  const bens = st.steps.slice(0, idx + 1).map((s) => s.bench);
  if (caps.length > 1) {
    const mm = minMax([...caps, ...bens]);
    const y = yScale(mm.lo, mm.hi, capT, capB);
    line(ctx, caps, 14, w - 14, y, pal.method, 1.5);
    line(ctx, bens, 14, w - 14, y, hexAlpha(pal.comment, 0.75), 1.1);
  }
  if (step.terminal) {
    ctx.fillStyle = hexAlpha(pal.keyword, 0.12 + 0.12 * Math.sin(st.flash * Math.PI * 2));
    ctx.fillRect(0, capT, w, capB - capT);
    font(ctx, fs.label, '700');
    fillText(
      ctx,
      step.capital < 950 ? 'done  capital < 950' : 'day end  + 15·(C−1000)/1000',
      w / 2,
      capT + fs.label,
      pal.keyword,
      'center',
    );
  }

  const pills = Math.min(narrow ? 10 : 18, idx + 1);
  const pillY = h - captionH - pillH - 2;
  for (let i = 0; i < pills; i++) {
    ctx.fillStyle = hexAlpha(pal.variable, 0.25 + 0.6 * (i / pills));
    ctx.fillRect(w - 14 - (pills - i) * 7, pillY, 5, 8);
  }
  font(ctx, fs.small);
  fillText(
    ctx,
    narrow
      ? `(s,a,r,s′,d) → replay ${idx + 1}/10k · batch 256`
      : `(s, a, r, s′, d) → replay  ${idx + 1} / 10000 FIFO · minibatch 256 uniform`,
    14,
    h - captionH / 2 - 1,
    pal.comment,
  );
}

export default QuantJL;
