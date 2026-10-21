import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Play, RotateCcw } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import {
  K_EXTEND,
  H_CODE,
  KERNEL,
  Pipeline,
  RATE,
  SEED,
  SPOT,
  TAU,
  breedenLitzenberger,
  bsCall,
  pBelow,
  runPipeline,
} from './optionsPdfMath';

type Scene = 'chain' | 'smile' | 'butterfly' | 'pdf';
const SCENES: { id: Scene; label: string }[] = [
  { id: 'chain', label: 'Chain' },
  { id: 'smile', label: 'Smile' },
  { id: 'butterfly', label: 'Butterfly' },
  { id: 'pdf', label: 'PDF' },
];

const H_VISUAL = 6;
const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const hexAlpha = (hex: string, a: number) => {
  const h = hex.replace('#', '');
  const n = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return `rgba(${parseInt(n.slice(0, 2), 16)},${parseInt(n.slice(2, 4), 16)},${parseInt(n.slice(4, 6), 16)},${a})`;
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

const typeScale = (w: number) => {
  const t = Math.max(0, Math.min(1, (w - 390) / 430));
  return { title: 11 + t * 5, readout: 10 + t * 5, label: 9 + t * 3.5, small: 8 + t * 4, t };
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

const yScale = (min: number, max: number, top: number, bot: number) => {
  const span = max - min || 1;
  const lo = min - span * 0.08;
  const hi = max + span * 0.08;
  return (v: number) => bot - ((v - lo) / (hi - lo)) * (bot - top);
};

const xScale = (min: number, max: number, left: number, right: number) => {
  const span = max - min || 1;
  return (v: number) => left + ((v - min) / span) * (right - left);
};

type Anim = { t: number; dwell: number };

const OptionsPDF = ({ poster, title }: { poster: string; title: string }) => {
  const { theme } = useTheme();
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(false);
  const [scene, setScene] = useState<Scene>('chain');
  const [autoplay, setAutoplay] = useState(true);
  const [strikeC, setStrikeC] = useState(100);
  const [strikeD, setStrikeD] = useState(100);
  const [ready, setReady] = useState(false);
  const [pRead, setPRead] = useState({ below: 0, above: 1, dens: 0 });

  const sceneRef = useRef<Scene>('chain');
  const autoRef = useRef(true);
  const userRef = useRef(false);
  const inViewRef = useRef(true);
  const reducedRef = useRef(false);
  const colorsRef = useRef<Colors | null>(null);
  const pipeRef = useRef<Pipeline | null>(null);
  const anim = useRef<Record<Scene, Anim>>({
    chain: { t: 0, dwell: 0 },
    smile: { t: 0, dwell: 0 },
    butterfly: { t: 0, dwell: 0 },
    pdf: { t: 0, dwell: 0 },
  });
  const strikeCRef = useRef(100);
  const strikeDRef = useRef(100);
  const pCache = useRef(new Map<number, number>());
  const fade = useRef(1);

  const pipe = useMemo(() => {
    if (!visible) return null;
    return runPipeline(SEED);
  }, [visible]);

  useEffect(() => {
    pipeRef.current = pipe;
    if (pipe) {
      setReady(true);
      const dens = breedenLitzenberger(100, pipe.ivFun);
      const below = pBelow(100, pipe.ivFun);
      pCache.current.set(100, below);
      setPRead({ below, above: 1 - below, dens });
    }
  }, [pipe]);

  useEffect(() => {
    sceneRef.current = scene;
  }, [scene]);
  useEffect(() => {
    autoRef.current = autoplay;
  }, [autoplay]);
  useEffect(() => {
    strikeCRef.current = strikeC;
  }, [strikeC]);
  useEffect(() => {
    strikeDRef.current = strikeD;
    const p = pipeRef.current;
    if (!p) return;
    const key = Math.round(strikeD * 10) / 10;
    let below = pCache.current.get(key);
    if (below === undefined) {
      below = pBelow(key, p.ivFun);
      pCache.current.set(key, below);
    }
    setPRead({ below, above: 1 - below, dens: breedenLitzenberger(key, p.ivFun) });
  }, [strikeD]);
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

  const resetScene = (id: Scene, reduced: boolean) => {
    fade.current = 0;
    anim.current[id] = { t: reduced ? 1 : 0, dwell: 0 };
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
    resetScene('chain', reducedRef.current);
    setScene('chain');
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
      (Object.keys(anim.current) as Scene[]).forEach((k) => {
        anim.current[k] = { t: 1, dwell: 0 };
      });
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

    const order: Scene[] = ['chain', 'smile', 'butterfly', 'pdf'];
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      fade.current = Math.min(1, fade.current + dt * 3.2);
      const sc = sceneRef.current;
      const a = anim.current[sc];
      const reduced = reducedRef.current;
      if (a.t < 1) a.t = Math.min(1, a.t + dt * (reduced ? 8 : sc === 'smile' ? 0.16 : 0.22));
      else {
        a.dwell += dt;
        if (autoRef.current && !userRef.current && a.dwell > 0.85) {
          const i = order.indexOf(sc);
          if (i < order.length - 1) goScene(order[i + 1], false);
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
      const p = pipeRef.current;
      if (!ctx || !pal) return;
      const w = host.clientWidth || 640;
      const h = host.clientHeight || 420;
      ctx.clearRect(0, 0, w, h);
      if (!p) {
        font(ctx, 12);
        fillText(ctx, 'building synthetic chain…', 16, h / 2, pal.comment);
        return;
      }
      ctx.save();
      ctx.globalAlpha = fade.current;
      const fs = typeScale(w);
      const sc = sceneRef.current;
      const t = anim.current[sc].t;
      if (sc === 'chain') drawChain(ctx, w, h, pal, p, t, fs);
      else if (sc === 'smile') drawSmile(ctx, w, h, pal, p, t, fs);
      else if (sc === 'butterfly') drawButterfly(ctx, w, h, pal, p, strikeCRef.current, fs);
      else drawPdf(ctx, w, h, pal, p, strikeDRef.current, fs);
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

  const densC = pipe ? breedenLitzenberger(strikeC, pipe.ivFun) : 0;

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
            {scene === 'chain' && (
              <p className="text-[10px] font-mono leading-snug" style={{ color: 'var(--theme-comment)' }}>
                OTM only (yfinance inTheMoney=false) · OTM put → C = P + S − K e<sup>−rτ</sup> · r = 0.01 · τ = 30/365
                · synthetic chain
              </p>
            )}
            {scene === 'smile' && (
              <p className="text-[10px] font-mono leading-snug" style={{ color: 'var(--theme-comment)' }}>
                Newton σ₀=0.20, tol 1e−8, max 200 · smooth on row index i±{KERNEL} (NaNs poison neighbours) · SVI
                w(k)=a+b(ρ(k−m)+√((k−m)²+σ²)) · k_extend={K_EXTEND}
              </p>
            )}
            {scene === 'butterfly' && (
              <>
                <label className="block min-w-0">
                  <div className="mb-0.5 flex justify-between text-[10px] font-mono" style={{ color: 'var(--theme-comment)' }}>
                    <span>strike K</span>
                    <span>{strikeC.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min={76}
                    max={124}
                    step={0.5}
                    value={strikeC}
                    aria-label="Butterfly strike"
                    onChange={(e) => setStrikeC(Number(e.target.value))}
                    className="op-range w-full"
                  />
                </label>
                <p className="text-[10px] font-mono leading-snug" style={{ color: 'var(--theme-comment)' }}>
                  exp(rτ)(C(K+h)−2C(K)+C(K−h))/h² = {densC.toFixed(4)} · code h={H_CODE} · visual h={H_VISUAL}{' '}
                  (enlarged h) · density at K
                </p>
              </>
            )}
            {scene === 'pdf' && (
              <>
                <label className="block min-w-0">
                  <div className="mb-0.5 flex justify-between text-[10px] font-mono" style={{ color: 'var(--theme-comment)' }}>
                    <span>strike K</span>
                    <span>{strikeD.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min={76}
                    max={124}
                    step={0.5}
                    value={strikeD}
                    aria-label="PDF strike"
                    onChange={(e) => setStrikeD(Number(e.target.value))}
                    className="op-range w-full"
                  />
                </label>
                <p className="text-[10px] font-mono leading-snug" style={{ color: 'var(--theme-foreground)' }}>
                  p_below = {pRead.below.toFixed(4)} · 1 − p_below = {pRead.above.toFixed(4)}
                  <span style={{ color: 'var(--theme-comment)' }}>
                    {' '}
                    · trapezoid 10,000 steps from K=1 · exp(rτ) d²C/dK²
                  </span>
                </p>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="text-[10px] leading-snug" style={{ color: 'var(--theme-comment)' }}>
          synthetic chain · S={SPOT} · seed {SEED} ·{' '}
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
        .op-range {
          -webkit-appearance: none;
          appearance: none;
          height: 28px;
          margin: -11px 0;
          background: transparent;
          outline: none;
          cursor: pointer;
          touch-action: pan-y;
        }
        .op-range::-webkit-slider-runnable-track {
          height: 4px;
          border-radius: 999px;
          background: color-mix(in srgb, var(--theme-method) 55%, var(--theme-border));
        }
        .op-range::-webkit-slider-thumb {
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
        .op-range::-moz-range-track {
          height: 4px;
          border-radius: 999px;
          background: color-mix(in srgb, var(--theme-method) 55%, var(--theme-border));
        }
        .op-range::-moz-range-thumb {
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

function drawChain(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  pal: Colors,
  p: Pipeline,
  t: number,
  fs: TypeScale,
) {
  const pad = 14;
  const top = Math.round(10 + fs.title * 1.4);
  const bot = h - Math.round(10 + fs.small * 1.4);
  const left = pad + 8;
  const right = w - pad;
  const ks = p.calls.map((c) => c.strike);
  const px = [...p.calls.map((c) => c.ask), ...p.puts.map((q) => q.ask), ...p.paritized.map((r) => r.price)];
  const xAt = xScale(Math.min(...ks), Math.max(...ks), left, right);
  const yAt = yScale(0, Math.max(...px), top, bot);

  font(ctx, fs.title, '600');
  fillText(ctx, 'Chain  →  paritized calls', pad, pad + fs.title * 0.2, pal.method);
  font(ctx, fs.small);
  fillText(ctx, 'synthetic chain', w - pad, pad + fs.title * 0.2, pal.comment, 'right');

  const fadeItm = Math.max(0, Math.min(1, (t - 0.12) / 0.22));
  const toDots = Math.max(0, Math.min(1, (t - 0.34) / 0.16));
  const fly = Math.max(0, Math.min(1, (t - 0.52) / 0.32));

  const barW = Math.max(3, (right - left) / ks.length / 3);
  for (const q of [...p.calls, ...p.puts]) {
    const itm = q.inTheMoney;
    const a = itm ? 1 - fadeItm : 1;
    if (a < 0.02) continue;
    const x = xAt(q.strike) + (q.kind === 'call' ? -barW * 0.7 : barW * 0.7);
    ctx.globalAlpha = a * (1 - toDots * 0.85);
    ctx.strokeStyle = q.kind === 'call' ? pal.type : pal.keyword;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, yAt(q.bid));
    ctx.lineTo(x, yAt(q.ask));
    ctx.stroke();
    ctx.fillStyle = q.kind === 'call' ? pal.type : pal.keyword;
    ctx.fillRect(x - 2, yAt(q.mid) - 1.5, 4, 3);
  }
  ctx.globalAlpha = 1;

  for (const q of [...p.calls, ...p.puts]) {
    if (q.inTheMoney && fadeItm > 0.95) continue;
    const a = q.inTheMoney ? 1 - fadeItm : toDots;
    if (a < 0.02) continue;
    ctx.globalAlpha = a;
    ctx.beginPath();
    ctx.fillStyle = q.kind === 'call' ? pal.type : pal.keyword;
    ctx.arc(xAt(q.strike), yAt(q.mid), 3.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  for (const row of p.paritized) {
    if (row.from !== 'put') continue;
    const y0 = yAt(row.raw);
    const y1 = yAt(row.price);
    const y = y0 + (y1 - y0) * fly;
    ctx.beginPath();
    ctx.fillStyle = hexAlpha(pal.string, 0.35 + 0.65 * fly);
    ctx.arc(xAt(row.strike), y, 3.4, 0, Math.PI * 2);
    ctx.fill();
  }

  if (t > 0.72) {
    ctx.beginPath();
    ctx.strokeStyle = pal.variable;
    ctx.lineWidth = 1.6;
    p.paritized.forEach((row, i) => {
      const x = xAt(row.strike);
      const y = yAt(row.price);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = hexAlpha(pal.method, 0.75);
  ctx.beginPath();
  ctx.moveTo(xAt(SPOT), top);
  ctx.lineTo(xAt(SPOT), bot);
  ctx.stroke();
  ctx.setLineDash([]);
  font(ctx, fs.small);
  fillText(ctx, `S=${SPOT}`, xAt(SPOT) + 4, top + fs.small, pal.method);
  fillText(ctx, 'strike', left, bot + fs.small, pal.comment);
  fillText(ctx, 'call  put  parity', w - pad, bot + fs.small, pal.comment, 'right');
}

function drawSmile(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  pal: Colors,
  p: Pipeline,
  t: number,
  fs: TypeScale,
) {
  const pad = 14;
  const top = Math.round(10 + fs.title * 1.4);
  const bot = h - Math.round(28 + fs.small);
  const left = pad + 6;
  const right = w - pad;
  const Ks = p.withIv.map((r) => r.strike);
  const ivs = p.withIv.map((r) => r.iv).filter(Number.isFinite);
  const xAt = xScale(Math.min(...Ks), Math.max(...Ks), left, right);
  const yAt = yScale(Math.min(...ivs) * 0.92, Math.max(...ivs) * 1.08, top, bot);

  font(ctx, fs.title, '600');
  fillText(ctx, 'Smile  ·  IV → smooth → SVI', pad, pad + fs.title * 0.2, pal.method);

  const n = p.withIv.length;
  const newtonN = Math.min(n, Math.floor(Math.max(0, t / 0.34) * n));
  const sweep = Math.max(0, Math.min(1, (t - 0.34) / 0.2));
  const drop = Math.max(0, Math.min(1, (t - 0.54) / 0.1));
  const sviT = Math.max(0, Math.min(1, (t - 0.64) / 0.3));

  for (let i = 0; i < newtonN; i++) {
    const row = p.withIv[i];
    if (!Number.isFinite(row.iv)) continue;
    ctx.beginPath();
    ctx.fillStyle = pal.variable;
    ctx.arc(xAt(row.strike), yAt(row.iv), 3.1, 0, Math.PI * 2);
    ctx.fill();
  }

  if (newtonN > 0 && newtonN <= n && t < 0.36) {
    const row = p.withIv[Math.min(n - 1, newtonN - 1)];
    const tr = row.trace;
    font(ctx, fs.readout);
    fillText(
      ctx,
      `Newton  K=${row.strike}  iters=${tr.iters}  σ=${Number.isFinite(row.iv) ? row.iv.toFixed(3) : 'NaN'}  vega=${tr.vega.toExponential(2)}`,
      pad,
      top + fs.readout * 0.2,
      pal.number,
    );
    const boxX = w - pad - 88;
    const boxY = top + 8;
    ctx.strokeStyle = hexAlpha(pal.number, 0.5);
    ctx.strokeRect(boxX, boxY, 80, 36);
    if (tr.sigma.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = pal.number;
      tr.sigma.forEach((s, i) => {
        const x = boxX + 4 + (72 * i) / (tr.sigma.length - 1);
        const y = boxY + 32 - (s / 1.2) * 28;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }
  }

  if (sweep > 0) {
    const center = Math.min(n - 1, Math.floor(sweep * n));
    const j0 = Math.max(0, center - KERNEL);
    const j1 = Math.min(n - 1, center + KERNEL);
    ctx.fillStyle = hexAlpha(pal.method, 0.1);
    ctx.fillRect(xAt(p.withIv[j0].strike), top, xAt(p.withIv[j1].strike) - xAt(p.withIv[j0].strike), bot - top);
    const bellX = xAt(p.withIv[center].strike);
    ctx.beginPath();
    ctx.strokeStyle = hexAlpha(pal.method, 0.7);
    for (let j = j0; j <= j1; j++) {
      const wt = Math.exp(-((center - j) ** 2) / (2 * KERNEL * KERNEL));
      const x = xAt(p.withIv[j].strike);
      const y = top + 8 + (1 - wt) * 22;
      if (j === j0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    for (let i = 0; i <= center; i++) {
      const iv = p.smoothed[i];
      if (!Number.isFinite(iv)) continue;
      ctx.beginPath();
      ctx.fillStyle = pal.type;
      ctx.arc(xAt(p.withIv[i].strike), yAt(iv), 2.6, 0, Math.PI * 2);
      ctx.fill();
    }
    void bellX;
  }

  if (drop > 0) {
    p.withIv.forEach((row, i) => {
      if (Number.isFinite(p.smoothed[i])) return;
      ctx.globalAlpha = 1 - drop;
      ctx.beginPath();
      ctx.strokeStyle = pal.keyword;
      ctx.arc(xAt(row.strike), yAt(Number.isFinite(row.iv) ? row.iv : Math.min(...ivs)), 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    });
  }

  if (sviT > 0 && p.history.length) {
    const hist = p.history[Math.min(p.history.length - 1, Math.floor(sviT * (p.history.length - 1)))];
    const dens = 80;
    ctx.beginPath();
    ctx.strokeStyle = pal.method;
    ctx.lineWidth = 2;
    for (let i = 0; i < dens; i++) {
      const K = 60 + (80 * i) / (dens - 1);
      const k = Math.log(K / p.F);
      const iv = Math.sqrt(Math.max(0, (hist.a + hist.b * (hist.rho * (k - hist.m) + Math.sqrt((k - hist.m) ** 2 + hist.sigma ** 2))) / TAU));
      const x = xAt(K);
      const y = yAt(iv);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    font(ctx, fs.small);
    fillText(
      ctx,
      `a=${hist.a.toFixed(3)}  b=${hist.b.toFixed(3)}  ρ=${hist.rho.toFixed(2)}  m=${hist.m.toFixed(2)}  σ=${hist.sigma.toFixed(2)}`,
      pad,
      bot + fs.small * 1.1,
      pal.fg,
    );
    const gW = Math.min(120, w * 0.28);
    const gX = w - pad - gW;
    const gY = bot + 2;
    ctx.fillStyle = hexAlpha(pal.border, 0.5);
    ctx.fillRect(gX, gY, gW, 10);
    const ok = hist.minG >= 0;
    ctx.fillStyle = hexAlpha(ok ? pal.type : pal.keyword, 0.85);
    ctx.fillRect(gX, gY, gW * Math.max(0.08, Math.min(1, 0.5 + hist.minG)), 10);
    font(ctx, fs.small);
    fillText(ctx, ok ? `g(k)≥0  min ${hist.minG.toFixed(2)}` : `min g ${hist.minG.toFixed(2)}`, gX, gY + 16, ok ? pal.type : pal.keyword);
  }
}

function drawButterfly(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  pal: Colors,
  p: Pipeline,
  K: number,
  fs: TypeScale,
) {
  const pad = 14;
  const top = Math.round(10 + fs.title * 1.35);
  const mid = h * 0.58;
  const bot = h - Math.round(12 + fs.small);
  const left = pad;
  const right = w - pad;
  const prices = p.repriced.map((r) => r.price);
  const xAt = xScale(60, 140, left, right);
  const yAt = yScale(Math.min(...prices), Math.max(...prices), top, mid - 8);

  font(ctx, fs.title, '600');
  fillText(ctx, 'Butterfly  ·  Breeden–Litzenberger', pad, pad + fs.title * 0.2, pal.method);
  font(ctx, fs.small);
  fillText(ctx, `enlarged h = ${H_VISUAL}   (code h = ${H_CODE})`, w - pad, pad + fs.title * 0.2, pal.string, 'right');

  ctx.beginPath();
  ctx.strokeStyle = pal.variable;
  ctx.lineWidth = 1.6;
  p.repriced.forEach((r, i) => {
    const x = xAt(r.strike);
    const y = yAt(r.price);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  const pts = [
    { k: K - H_VISUAL, w: 1, c: pal.type },
    { k: K, w: -2, c: pal.keyword },
    { k: K + H_VISUAL, w: 1, c: pal.type },
  ];
  for (const pt of pts) {
    const px = bsCall(SPOT, pt.k, TAU, RATE, p.ivFun(pt.k));
    ctx.beginPath();
    ctx.fillStyle = pt.c;
    ctx.arc(xAt(pt.k), yAt(px), 4.2, 0, Math.PI * 2);
    ctx.fill();
    font(ctx, fs.small);
    fillText(ctx, `${pt.w > 0 ? '+' : ''}${pt.w}`, xAt(pt.k), yAt(px) - fs.small, pt.c, 'center');
  }

  const tentT = mid + 8;
  const tentB = bot - 4;
  const peak = tentT + 8;
  const base = tentB;
  ctx.beginPath();
  ctx.moveTo(xAt(K - 2 * H_VISUAL), base);
  // payoff of long K−h, short 2×K, long K+h: zero outside [K−h, K+h], peak h at K
  ctx.lineTo(xAt(K - H_VISUAL), base);
  ctx.lineTo(xAt(K), peak);
  ctx.lineTo(xAt(K + H_VISUAL), base);
  ctx.lineTo(xAt(K + 2 * H_VISUAL), base);
  ctx.strokeStyle = pal.method;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = hexAlpha(pal.method, 0.12);
  ctx.fill();
  font(ctx, fs.small);
  fillText(ctx, 'payoff: +1 / −2 / +1 calls  (visual h)', left, tentT + fs.small, pal.comment);
}

function drawPdf(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  pal: Colors,
  p: Pipeline,
  K: number,
  fs: TypeScale,
) {
  const pad = 14;
  const top = Math.round(10 + fs.title * 1.4);
  const bot = h - Math.round(16 + fs.small);
  const left = pad;
  const right = w - pad;
  const ys = p.pdfY;
  const xAt = xScale(p.pdfK[0], p.pdfK[p.pdfK.length - 1], left, right);
  const yAt = yScale(0, Math.max(...ys), top, bot);

  font(ctx, fs.title, '600');
  fillText(ctx, 'Implied PDF  ·  exp(rτ) d²C/dK²', pad, pad + fs.title * 0.2, pal.method);
  font(ctx, fs.small);
  fillText(ctx, 'synthetic chain', w - pad, pad + fs.title * 0.2, pal.comment, 'right');

  const iCut = p.pdfK.findIndex((k) => k >= K);
  const cut = iCut < 0 ? p.pdfK.length - 1 : iCut;

  ctx.beginPath();
  ctx.fillStyle = hexAlpha(pal.type, 0.28);
  ctx.moveTo(xAt(p.pdfK[0]), yAt(0));
  for (let i = 0; i <= cut; i++) ctx.lineTo(xAt(p.pdfK[i]), yAt(ys[i]));
  ctx.lineTo(xAt(p.pdfK[cut]), yAt(0));
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.fillStyle = hexAlpha(pal.keyword, 0.22);
  ctx.moveTo(xAt(p.pdfK[cut]), yAt(0));
  for (let i = cut; i < p.pdfK.length; i++) ctx.lineTo(xAt(p.pdfK[i]), yAt(ys[i]));
  ctx.lineTo(xAt(p.pdfK[p.pdfK.length - 1]), yAt(0));
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.strokeStyle = pal.variable;
  ctx.lineWidth = 2;
  p.pdfK.forEach((k, i) => {
    const x = xAt(k);
    const y = yAt(ys[i]);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = hexAlpha(pal.method, 0.8);
  ctx.beginPath();
  ctx.moveTo(xAt(SPOT), top);
  ctx.lineTo(xAt(SPOT), bot);
  ctx.stroke();
  ctx.setLineDash([2, 3]);
  ctx.strokeStyle = pal.string;
  ctx.beginPath();
  ctx.moveTo(xAt(K), top);
  ctx.lineTo(xAt(K), bot);
  ctx.stroke();
  ctx.setLineDash([]);

  font(ctx, fs.label);
  fillText(ctx, 'p_below', xAt((p.pdfK[0] + K) / 2), top + fs.label, pal.type, 'center');
  fillText(ctx, '1 − p_below', xAt((K + p.pdfK[p.pdfK.length - 1]) / 2), top + fs.label, pal.keyword, 'center');
  font(ctx, fs.small);
  fillText(ctx, `S=${SPOT}`, xAt(SPOT) + 4, bot - fs.small, pal.method);
}

export default OptionsPDF;
