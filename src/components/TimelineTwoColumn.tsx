import { motion, useReducedMotion } from 'framer-motion';
import { experiences, experienceCategories, monthLabel, periodRange, type Experience } from '@/data/experience';
import { CompanyLogo, CompanyName } from './CompanyLogo';

const colColor = { professional: 'var(--theme-method)', research: 'var(--theme-string)' } as const;
const UNDATED = Number.POSITIVE_INFINITY; // "Incoming" sits above the newest real date

interface Placed {
  exp: Experience;
  top: number; // newer boundary
  bottom: number; // older boundary
}

/**
 * Wide-screen variant: one column per branch on a shared vertical time axis.
 * Every start/end month becomes a grid line, so roles that overlap in time
 * span the same grid rows and sit side by side.
 */
export const TimelineTwoColumn = () => {
  const reduce = useReducedMotion();
  const placed: Placed[] = [];
  let newest = -Infinity;
  for (const exp of experiences) {
    const r = periodRange(exp.period);
    if (r) {
      placed.push({ exp, top: r.end + 1, bottom: r.start }); // end month is inclusive
      newest = Math.max(newest, r.end + 1);
    }
  }
  for (const exp of experiences) {
    if (!periodRange(exp.period)) placed.push({ exp, top: UNDATED, bottom: newest });
  }
  const lines = [...new Set(placed.flatMap((p) => [p.top, p.bottom]))].sort((a, b) => b - a);
  const line = (v: number) => lines.indexOf(v) + 1; // CSS grid lines are 1-based

  const axisLabel = (v: number) => (v === UNDATED ? 'Incoming' : v === newest ? 'Now' : monthLabel(placed.some((p) => p.bottom === v) ? v : v - 1));

  return (
    <div className="relative" data-timeline-variant="two-column">
      {/* Column headers */}
      <div className="grid gap-x-6 mb-4" style={{ gridTemplateColumns: '84px 1fr 1fr' }}>
        <div />
        {experienceCategories.map((cat) => (
          <div key={cat.id} className="flex items-center gap-2" data-timeline-section={cat.id}>
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: colColor[cat.id] }} />
            <span className="text-xs font-mono uppercase tracking-wider" style={{ color: colColor[cat.id] }}>
              {cat.label}
            </span>
            <span className="text-xs font-mono text-muted-foreground">({cat.branch})</span>
            <span className="h-px flex-1 bg-border" />
          </div>
        ))}
      </div>

      <div
        className="relative grid gap-x-6"
        style={{
          gridTemplateColumns: '84px 1fr 1fr',
          gridTemplateRows: `repeat(${lines.length - 1}, minmax(36px, auto))`,
        }}
      >
        {/* Axis ticks + guide lines across both columns */}
        {lines.map((v, i) => (
          <div
            key={`tick-${v}`}
            className="relative pointer-events-none"
            style={{ gridColumn: '1 / -1', gridRow: `${i + 1} / ${i + 1}`, alignSelf: 'start', height: 0 }}
            aria-hidden="true"
          >
            <div className="absolute left-[92px] right-0 top-0 h-px bg-border/40" />
            <span className="absolute left-0 -top-2 w-[78px] text-right text-[11px] font-mono text-muted-foreground">
              {axisLabel(v)}
            </span>
          </div>
        ))}
        <div className="pointer-events-none" style={{ gridColumn: '1', gridRow: `1 / ${lines.length}` }} aria-hidden="true">
          <div className="ml-auto mr-0 h-full w-px bg-border" />
        </div>

        {placed.map(({ exp, top, bottom }, i) => {
          const col = exp.category === 'professional' ? 2 : 3;
          const color = colColor[exp.category];
          return (
            <motion.div
              key={exp.id}
              data-timeline-entry={exp.id}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: reduce ? 0 : (i % 4) * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex gap-3 rounded-lg border border-border/60 bg-[var(--theme-editor)] p-3 my-1 hover:border-border shadow-sm transition-colors"
              style={{ gridColumn: col, gridRow: `${line(top)} / ${line(bottom)}` }}
            >
              {/* Duration bar */}
              <motion.span
                className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full origin-top"
                style={{ backgroundColor: color }}
                initial={reduce ? false : { scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                aria-hidden="true"
              />
              <CompanyLogo src={exp.logo} fullBleed={exp.logoFullBleed} company={exp.company} size={40} className="ml-1" />
              <div className="min-w-0 space-y-1">
                <h3 className="text-base font-semibold text-yellow-400 leading-snug">{exp.title}</h3>
                <div className="text-sm font-medium text-primary">
                  <CompanyName company={exp.company} />
                </div>
                <div className="text-xs font-medium text-purple-400">{exp.period}</div>
                {(exp.location || exp.type) && (
                  <div className="text-xs text-muted-foreground">{[exp.location, exp.type].filter(Boolean).join(' · ')}</div>
                )}
                {exp.description && <p className="text-sm text-muted-foreground leading-relaxed pt-1">{exp.description}</p>}
                {exp.skills && exp.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {exp.skills.map((s) => (
                      <span key={s} className="px-2 py-0.5 text-[11px] bg-orange-500/10 text-orange-400 rounded-full border border-orange-500/20">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
