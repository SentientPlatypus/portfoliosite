import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw } from 'lucide-react';
import * as THREE from 'three';
import { loadDavidData, type DavidData } from './loadDavid';

const K_MIN = 4;
const ALL = 257;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const hasWebGL = () => {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
};

const addMode = (
  accum: Float32Array,
  modes: Float32Array,
  coeffs: Float32Array,
  j: number,
  sign: number,
  n: number,
) => {
  const c0 = coeffs[3 * j] * sign;
  const c1 = coeffs[3 * j + 1] * sign;
  const c2 = coeffs[3 * j + 2] * sign;
  const o = j * n;
  for (let i = 0; i < n; i++) {
    const u = modes[o + i];
    accum[3 * i] += u * c0;
    accum[3 * i + 1] += u * c1;
    accum[3 * i + 2] += u * c2;
  }
};

const toThree = (src: Float32Array, dest: Float32Array, n: number) => {
  for (let i = 0; i < n; i++) {
    dest[3 * i] = src[3 * i];
    dest[3 * i + 1] = src[3 * i + 2];
    dest[3 * i + 2] = -src[3 * i + 1];
  }
};

const copyOriginal = (v0: Float32Array, dest: Float32Array, n: number) => {
  for (let i = 0; i < n; i++) {
    dest[3 * i] = v0[3 * i];
    dest[3 * i + 1] = v0[3 * i + 2];
    dest[3 * i + 2] = -v0[3 * i + 1];
  }
};

const rmsError = (pos: Float32Array, v0: Float32Array, n: number, diag: number) => {
  let s = 0;
  for (let i = 0; i < n; i++) {
    const dx = pos[3 * i] - v0[3 * i];
    const dy = pos[3 * i + 1] - v0[3 * i + 2];
    const dz = pos[3 * i + 2] + v0[3 * i + 1];
    s += dx * dx + dy * dy + dz * dz;
  }
  return (100 * Math.sqrt(s / n)) / diag;
};

const logK = (t: number, kMax: number) => {
  const k = Math.round(K_MIN * Math.pow((kMax + 1) / K_MIN, t));
  return Math.min(kMax + 1, Math.max(K_MIN, k));
};

interface FourierModesProps {
  poster: string;
  title: string;
}

const FourierModes = ({ poster, title }: FourierModesProps) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(false);
  const [failed, setFailed] = useState(!hasWebGL());
  const [loading, setLoading] = useState(true);
  const [wireOn, setWireOn] = useState(false);
  const [dotsOn, setDotsOn] = useState(false);
  const [sweeping, setSweeping] = useState(false);
  const labelRef = useRef<HTMLDivElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLInputElement>(null);
  const targetK = useRef(K_MIN);
  const userTouched = useRef(false);
  const sweepingRef = useRef(false);
  const api = useRef<{
    setTarget: (k: number) => void;
    setWire: (v: boolean) => void;
    setDots: (v: boolean) => void;
    startSweep: () => void;
    stopSweep: () => void;
  } | null>(null);

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
    if (!visible || failed) return;
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return;

    let disposed = false;
    let renderer: THREE.WebGLRenderer | null = null;
    let raf = 0;
    let data: DavidData | null = null;

    const boot = async () => {
      try {
        data = await loadDavidData();
        if (disposed) return;

        const { n, kMax, vertices: V0, faces, modes, coeffs, bboxDiag } = data;
        const pos = new Float32Array(n * 3);
        const accum = new Float32Array(n * 3);
        const geo = new THREE.BufferGeometry();
        const pa = new THREE.BufferAttribute(pos, 3);
        geo.setAttribute('position', pa);
        geo.setIndex(new THREE.BufferAttribute(faces, 1));

        const clay = new THREE.MeshStandardMaterial({
          color: 0xb4aca4,
          roughness: 0.75,
          metalness: 0,
          side: THREE.DoubleSide,
          polygonOffset: true,
          polygonOffsetFactor: 1,
          polygonOffsetUnits: 1,
        });
        const wireMat = new THREE.MeshBasicMaterial({
          color: 0x5fa8ff,
          wireframe: true,
          transparent: true,
          opacity: 0.42,
        });
        const dotMat = new THREE.PointsMaterial({
          color: 0xff9a2e,
          size: 2.2,
          sizeAttenuation: false,
        });
        const mesh = new THREE.Mesh(geo, clay);
        const wire = new THREE.Mesh(geo, wireMat);
        const dots = new THREE.Points(geo, dotMat);
        wire.visible = false;
        dots.visible = false;

        const shadow = new THREE.Mesh(
          new THREE.CircleGeometry(0.55, 48),
          new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.22,
            depthWrite: false,
          }),
        );
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.y = -1.02;

        const root = new THREE.Group();
        root.add(mesh, wire, dots, shadow);

        renderer = new THREE.WebGLRenderer({
          canvas,
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        });
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;

        const scene = new THREE.Scene();
        scene.add(root);
        scene.add(new THREE.HemisphereLight(0xcfd8ff, 0x30303a, 0.55));
        const key = new THREE.DirectionalLight(0xfff1e0, 2.2);
        key.position.set(1.6, 1.4, 2.2);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0xaec4ff, 0.9);
        rim.position.set(-1.5, 1.2, -2);
        scene.add(rim);

        const cam = new THREE.PerspectiveCamera(28, 1, 0.1, 30);
        cam.position.set(0, 0, 4.4);

        const fit = () => {
          const w = host.clientWidth || 640;
          const h = host.clientHeight || 420;
          renderer!.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
          renderer!.setSize(w, h, false);
          cam.aspect = w / h;
          cam.updateProjectionMatrix();
        };
        fit();
        const ro = new ResizeObserver(fit);
        ro.observe(host);

        let applied = 0;
        let showingAll = false;
        const apply = (k: number) => {
          if (k > kMax) {
            copyOriginal(V0, pos, n);
            showingAll = true;
            applied = kMax + 1;
          } else {
            if (showingAll || applied > k) {
              accum.fill(0);
              for (let j = 0; j < k; j++) addMode(accum, modes, coeffs, j, 1, n);
            } else if (applied < k) {
              for (let j = applied; j < k; j++) addMode(accum, modes, coeffs, j, 1, n);
            }
            toThree(accum, pos, n);
            showingAll = false;
            applied = k;
          }
          pa.needsUpdate = true;
          geo.computeVertexNormals();
          geo.computeBoundingSphere();
          const err = k > kMax ? 0 : rmsError(pos, V0, n, bboxDiag);
          const detail = k > kMax ? 100 : Math.min(100, (k / kMax) * 100);
          if (labelRef.current) {
            labelRef.current.textContent = k > kMax ? `all ${n} vertices modes` : `k = ${k} modes`;
          }
          if (metaRef.current) {
            metaRef.current.textContent =
              err < 0.005
                ? 'reconstruction error ≈ 0%'
                : `rms error ${err.toFixed(2)}% of bbox · ${detail.toFixed(0)}% mode budget`;
          }
          if (sliderRef.current && document.activeElement !== sliderRef.current) {
            sliderRef.current.value = String(k);
          }
        };

        const reduced = prefersReducedMotion();
        let display = reduced ? kMax + 1 : K_MIN;
        targetK.current = display;
        apply(display);
        setLoading(false);

        let sweepT = 0;
        let sweepOn = !reduced;
        sweepingRef.current = sweepOn;
        setSweeping(sweepOn);

        let yaw = 0.35;
        let pitch = 0.06;
        let yawV = 0;
        let pitchV = 0;
        let dragging = false;
        let armed = false;
        let sx = 0;
        let sy = 0;
        let syaw = 0;
        let spitch = 0;
        let pid: number | null = null;
        let inView = true;

        const visIo = new IntersectionObserver(
          ([entry]) => {
            inView = entry.isIntersecting;
          },
          { threshold: 0.02 },
        );
        visIo.observe(host);

        const onDown = (e: PointerEvent) => {
          armed = true;
          dragging = false;
          sx = e.clientX;
          sy = e.clientY;
          syaw = yaw;
          spitch = pitch;
          pid = e.pointerId;
        };
        const onMove = (e: PointerEvent) => {
          if (!armed || pid !== e.pointerId) return;
          const dx = e.clientX - sx;
          const dy = e.clientY - sy;
          if (!dragging) {
            if (Math.abs(dx) < 7 && Math.abs(dy) < 7) return;
            if (Math.abs(dy) > Math.abs(dx) * 1.2) {
              armed = false;
              return;
            }
            dragging = true;
            canvas.setPointerCapture(e.pointerId);
          }
          yaw = syaw + dx * 0.01;
          pitch = Math.max(-1.15, Math.min(1.15, spitch + dy * 0.01));
          yawV = 0;
          pitchV = 0;
        };
        const onUp = (e: PointerEvent) => {
          if (pid !== e.pointerId) return;
          armed = false;
          dragging = false;
          pid = null;
        };
        canvas.addEventListener('pointerdown', onDown);
        canvas.addEventListener('pointermove', onMove);
        canvas.addEventListener('pointerup', onUp);
        canvas.addEventListener('pointercancel', onUp);

        const stopSweep = () => {
          sweepOn = false;
          sweepingRef.current = false;
          setSweeping(false);
        };
        const startSweep = () => {
          userTouched.current = false;
          sweepT = 0;
          sweepOn = true;
          sweepingRef.current = true;
          setSweeping(true);
        };

        api.current = {
          setTarget: (k) => {
            targetK.current = k;
          },
          setWire: (v) => {
            wire.visible = v;
          },
          setDots: (v) => {
            dots.visible = v;
          },
          startSweep,
          stopSweep,
        };

        const loop = () => {
          if (disposed) return;
          if (inView) {
            if (sweepOn && !userTouched.current) {
              sweepT += 0.0048;
              if (sweepT >= 1) {
                targetK.current = kMax + 1;
                stopSweep();
              } else {
                targetK.current = logK(sweepT, kMax);
              }
            }
            const damp = reduced ? 1 : 0.16;
            display += (targetK.current - display) * damp;
            if (Math.abs(targetK.current - display) < 0.35) display = targetK.current;
            const kInt = Math.round(display);
            if (kInt !== applied) apply(kInt);

            if (!dragging && !reduced) {
              yaw += 0.0035;
              yawV += -0;
              pitchV += (0.06 - pitch) * 0.02;
              pitchV *= 0.9;
              pitch += pitchV;
            } else if (!dragging) {
              yawV *= 0.86;
              pitchV *= 0.86;
              yaw += yawV;
              pitch += pitchV;
            }
            root.rotation.set(pitch, yaw, 0);
            renderer!.render(scene, cam);
          }
          raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);

        return () => {
          canvas.removeEventListener('pointerdown', onDown);
          canvas.removeEventListener('pointermove', onMove);
          canvas.removeEventListener('pointerup', onUp);
          canvas.removeEventListener('pointercancel', onUp);
          ro.disconnect();
          visIo.disconnect();
          geo.dispose();
          clay.dispose();
          wireMat.dispose();
          dotMat.dispose();
          shadow.geometry.dispose();
          (shadow.material as THREE.Material).dispose();
        };
      } catch {
        if (!disposed) setFailed(true);
      }
    };

    const cleanupP = boot();
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      cleanupP.then((fn) => fn?.());
      renderer?.dispose();
      api.current = null;
    };
  }, [visible, failed]);

  if (failed) {
    return (
      <img
        src={poster}
        alt={title}
        className="w-full h-auto"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="w-full"
    >
      <div
        ref={hostRef}
        className="relative w-full overflow-hidden rounded-t-lg"
        style={{
          aspectRatio: '4 / 3',
          background: 'var(--theme-editor)',
        }}
      >
        {loading && (
          <div className="absolute inset-0">
            <img src={poster} alt="" className="h-full w-full object-cover opacity-40" />
            <div className="absolute inset-0 animate-pulse bg-[var(--theme-sidebar)]/40" />
            <div className="absolute inset-0 flex items-center justify-center text-xs font-mono text-[var(--theme-comment)]">
              Loading FourierMesh modes…
            </div>
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          style={{ touchAction: 'pan-y', cursor: 'grab' }}
        />
      </div>

      <div
        className="space-y-3 border-t px-3 py-3 sm:px-4"
        style={{
          background: 'var(--theme-sidebar)',
          borderColor: 'var(--theme-border)',
        }}
      >
        <div className="flex items-end justify-between gap-3">
          <div>
            <div
              ref={labelRef}
              className="text-lg font-semibold font-mono sm:text-xl"
              style={{ color: 'var(--theme-method)' }}
            >
              k = 4 modes
            </div>
            <div ref={metaRef} className="text-[11px] font-mono" style={{ color: 'var(--theme-comment)' }}>
              reconstructing…
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={() => {
                userTouched.current = false;
                api.current?.startSweep();
              }}
              className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-medium"
              style={{
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-foreground)',
                background: 'var(--theme-editor)',
              }}
            >
              {sweeping ? <RotateCcw className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              {sweeping ? 'sweeping' : 'replay sweep'}
            </motion.button>
          </div>
        </div>

        <label className="block">
          <input
            ref={sliderRef}
            type="range"
            min={K_MIN}
            max={ALL}
            defaultValue={K_MIN}
            aria-label="FourierMesh mode count"
            onPointerDown={() => {
              userTouched.current = true;
              api.current?.stopSweep();
            }}
            onChange={(e) => {
              userTouched.current = true;
              api.current?.stopSweep();
              const k = Number(e.target.value);
              targetK.current = k;
              api.current?.setTarget(k);
            }}
            className="fm-range w-full"
          />
        </label>

        <div className="flex flex-wrap items-center gap-3 text-[11px]" style={{ color: 'var(--theme-foreground)' }}>
          <label className="inline-flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={wireOn}
              onChange={(e) => {
                setWireOn(e.target.checked);
                api.current?.setWire(e.target.checked);
              }}
            />
            wireframe
          </label>
          <label className="inline-flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={dotsOn}
              onChange={(e) => {
                setDotsOn(e.target.checked);
                api.current?.setDots(e.target.checked);
              }}
            />
            vertices
          </label>
          <span className="ml-auto text-[10px] leading-snug" style={{ color: 'var(--theme-comment)' }}>
            FourierMesh · first k eigenmodes of the mesh graph Laplacian{' '}
            <a
              href="https://github.com/SentientPlatypus/FourierMesh"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
              style={{ color: 'var(--theme-method)' }}
            >
              repo
            </a>
          </span>
        </div>
      </div>

      <style>{`
        .fm-range {
          -webkit-appearance: none;
          appearance: none;
          height: 4px;
          border-radius: 999px;
          background: color-mix(in srgb, var(--theme-method) 55%, var(--theme-border));
          outline: none;
        }
        .fm-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 999px;
          background: var(--theme-method);
          border: 2px solid var(--theme-sidebar);
          cursor: pointer;
          box-shadow: 0 0 0 1px var(--theme-border);
        }
        .fm-range::-moz-range-thumb {
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

export default FourierModes;
