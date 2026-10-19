const BASE = '/models/david';

export interface DavidMeta {
  N: number;
  M: number;
  KmaxI8: number;
  HeadModesF16: number;
  bbox_min: number[];
  bbox_max: number[];
}

export interface DavidData {
  n: number;
  kMax: number;
  vertices: Float32Array;
  faces: Uint16Array;
  modes: Float32Array;
  coeffs: Float32Array;
  lambdas: Float32Array;
  bboxDiag: number;
}

const decodeF16 = (halfs: Uint16Array) => {
  const out = new Float32Array(halfs.length);
  for (let i = 0; i < halfs.length; i++) {
    const h = halfs[i];
    const s = h & 0x8000 ? -1 : 1;
    const e = (h >> 10) & 31;
    const m = h & 1023;
    out[i] = e === 0 ? s * m * 5.960464477539063e-8 : s * (1 + m / 1024) * 2 ** (e - 15);
  }
  return out;
};

const fetchBuf = async <T extends ArrayBufferView>(
  name: string,
  Ctor: new (buffer: ArrayBuffer) => T,
) => {
  const res = await fetch(`${BASE}/${name}`);
  if (!res.ok) throw new Error(`Failed to load ${name}`);
  return new Ctor(await res.arrayBuffer());
};

export async function loadDavidData(): Promise<DavidData> {
  const metaRes = await fetch(`${BASE}/meta.json`);
  if (!metaRes.ok) throw new Error('Failed to load meta.json');
  const meta = (await metaRes.json()) as DavidMeta;
  const n = meta.N;
  const kMax = meta.KmaxI8;
  const headCount = meta.HeadModesF16;

  const [vertices, faces, coeffs, lambdas, head16, quant, scales] = await Promise.all([
    fetchBuf('vertices.f32.bin', Float32Array),
    fetchBuf('faces.u16.bin', Uint16Array),
    fetchBuf('coeffs.f32.bin', Float32Array),
    fetchBuf('lambdas.f32.bin', Float32Array),
    fetchBuf('modes256.head.f16.bin', Uint16Array),
    fetchBuf('modes256.tail.i8.bin', Int8Array),
    fetchBuf('modes256.tail.scales.f32.bin', Float32Array),
  ]);

  const head = decodeF16(head16);
  const modes = new Float32Array(kMax * n);
  modes.set(head, 0);
  const tailModes = kMax - headCount;
  for (let j = 0; j < tailModes; j++) {
    const s = scales[j];
    const o = (headCount + j) * n;
    const p = j * n;
    for (let i = 0; i < n; i++) modes[o + i] = quant[p + i] * s;
  }

  const [xmin, ymin, zmin] = meta.bbox_min;
  const [xmax, ymax, zmax] = meta.bbox_max;
  const bboxDiag = Math.hypot(xmax - xmin, ymax - ymin, zmax - zmin);

  return { n, kMax, vertices, faces, modes, coeffs, lambdas, bboxDiag };
}
