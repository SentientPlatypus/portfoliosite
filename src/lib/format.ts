/** 16521 -> "16.5K", 1400000 -> "1.4M" */
export function compactNumber(value: number): string {
  if (!Number.isFinite(value)) return '—';
  if (Math.abs(value) < 1000) return String(value);

  const units = [
    { limit: 1e9, suffix: 'B' },
    { limit: 1e6, suffix: 'M' },
    { limit: 1e3, suffix: 'K' },
  ];
  const unit = units.find(({ limit }) => Math.abs(value) >= limit)!;
  const scaled = value / unit.limit;

  return `${scaled >= 100 ? Math.round(scaled) : scaled.toFixed(1).replace(/\.0$/, '')}${unit.suffix}`;
}

const SECONDS_PER_UNIT: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ['year', 31_557_600],
  ['month', 2_629_800],
  ['week', 604_800],
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
];

export function timeAgo(date: Date): string {
  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (Math.abs(seconds) < 45) return 'just now';

  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const match = SECONDS_PER_UNIT.find(([, size]) => Math.abs(seconds) >= size);
  const [unit, size] = match ?? (['second', 1] as [Intl.RelativeTimeFormatUnit, number]);

  return formatter.format(-Math.round(seconds / size), unit);
}

export function formatDay(date: Date | string): string {
  const value = typeof date === 'string' ? new Date(`${date}T00:00:00Z`) : date;
  return value.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
