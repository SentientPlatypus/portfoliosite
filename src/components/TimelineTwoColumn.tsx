import { motion, useReducedMotion } from 'framer-motion';
import { useLayoutEffect, useRef, useState } from 'react';
import { experiences, experienceCategories, monthLabel, periodRange, type Experience } from '@/data/experience';
import { CompanyLogo, CompanyName } from './CompanyLogo';
import { hashFromId } from './GitGraphTimeline';

const laneColor = { main: '#858585', professional: 'var(--theme-method)', research: 'var(--theme-string)' } as const;
const UNDATED = Number.POSITIVE_INFINITY; // "Incoming" sits above the newest real date
const AXIS_W = 96; // label column; the main line runs at its right edge
const LANE_INSET = 12; // lane x offset inside each branch column
const DOT_Y = 22; // commit dot centre from the top of a card

interface Placed {
  exp: Experience;
  index: number; // index in `experiences` (keeps hashes identical to the branch graph)
  top: number;
  bottom: number;
}

/**
 * Wide-screen git graph: main on the left, `professional` and `research-labs`
 * fork off the initial commit and run up through their own columns. Rows are a
 * shared time axis, so roles held at the same time sit at the same height.
 */
export const TimelineTwoColumn = () => {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const rootDotRef = useRef<HTMLSpanElement>(null);
  const [geo, setGeo] = useState<{ w: number; h: number; dots: Record<string, { x: number; y: number }>; root: { x: number; y: number } } | null>(null);

  const placed: Placed[] = [];
  let newest = -Infinity;
  experiences.forEach((exp, index) => {
    const r = periodRange(exp.period);
    if (r) {
      placed.push({ exp, index, top: r.end + 1, bottom: r.start });
      newest = Math.max(newest, r.end + 1);
    }
  });
  experiences.forEach((exp, index) => {
    if (!periodRange(exp.period)) placed.push({ exp, index, top: UNDATED, bottom: newest });
  });
  const lines = [...new Set(placed.flatMap((p) => [p.top, p.bottom]))].sort((a, b) => b - a);
  const line = (v: number) => lines.indexOf(v) + 1;
  const axisLabel = (v: number) =>
    v === UNDATED ? 'Incoming' : v === newest ? 'Now' : monthLabel(placed.some((p) => p.bottom === v) ? v : v - 1);
  const rootRow = lines.length; // extra track for the initial commit

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const measure = () => {
      // offsetLeft/Top ignore transforms, so entrance animations don't skew the lanes.
      const dots: Record<string, { x: number; y: number }> = {};
      for (const p of placed) {
        const card = dotRefs.current[p.exp.id]?.parentElement;
        if (card) dots[p.exp.id] = { x: card.offsetLeft + LANE_INSET, y: card.offsetTop + DOT_Y };
      }
      const rc = rootDotRef.current!.parentElement!;
      setGeo({ w: root.offsetWidth, h: root.offsetHeight, dots, root: { x: rc.offsetLeft + AXIS_W, y: rc.offsetTop + rc.offsetHeight - 13 } });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const branchPath = (cat: 'professional' | 'research') => {
    if (!geo) return '';
    const pts = placed.filter((p) => p.exp.category === cat).map((p) => geo.dots[p.exp.id]);
    if (!pts.length) return '';
    const x = pts[0].x;
    const yTop = Math.min(...pts.map((p) => p.y));
    const { x: x0, y: y0 } = geo.root;
    const c = 34;
    return `M ${x0} ${y0} C ${x0} ${y0 - c}, ${x} ${y0 - c}, ${x} ${y0 - c * 2} L ${x} ${yTop}`;
  };
  const mainTop = geo ? Math.min(...Object.values(geo.dots).map((d) => d.y)) : 0;

  return (
    <div className="relative" data-timeline-variant="two-column">
      {/* Branch headers */}
      <div className="grid gap-x-6 mb-3" style={{ gridTemplateColumns: `${AXIS_W}px 1fr 1fr` }}>
        <div className="text-right text-xs font-mono text-[#858585] pr-3">main</div>
        {experienceCategories.map((cat) => (
          <div key={cat.id} className="flex items-center gap-2" data-timeline-section={cat.id}>
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: laneColor[cat.id] }} />
            <span className="text-xs font-mono" style={{ color: laneColor[cat.id] }}>{cat.branch}</span>
            <span className="text-xs font-mono text-muted-foreground">· {cat.label}</span>
            <span className="h-px flex-1 bg-border" />
          </div>
        ))}
      </div>

      <div
        ref={rootRef}
        className="relative grid gap-x-6"
        style={{
          gridTemplateColumns: `${AXIS_W}px 1fr 1fr`,
          gridTemplateRows: `repeat(${lines.length - 1}, minmax(36px, auto)) 56px`,
        }}
      >
        {/* Time axis ticks */}
        {lines.map((v, i) => (
          <div
            key={`tick-${v}`}
            className="relative pointer-events-none"
            style={{ gridColumn: '1 / -1', gridRow: `${i + 1} / ${i + 1}`, alignSelf: 'start', height: 0 }}
            aria-hidden="true"
          >
            <div className="absolute right-0 top-0 h-px bg-border/30" style={{ left: AXIS_W + 4 }} />
            <span className="absolute left-0 -top-2 text-right text-[11px] font-mono text-muted-foreground" style={{ width: AXIS_W - 18 }}>
              {axisLabel(v)}
            </span>
          </div>
        ))}

        {/* Graph lines */}
        {geo && (
          <svg className="absolute inset-0 pointer-events-none overflow-visible" width={geo.w} height={geo.h} aria-hidden="true" data-graph-lines>
            <line x1={geo.root.x} x2={geo.root.x} y1={mainTop} y2={geo.root.y} stroke={laneColor.main} strokeOpacity={0.4} strokeWidth={2} strokeDasharray="3 4" />
            {(['professional', 'research'] as const).map((cat, i) => (
              <motion.path
                key={cat}
                d={branchPath(cat)}
                fill="none"
                stroke={laneColor[cat]}
                strokeWidth={2}
                strokeLinecap="round"
                data-lane={cat}
                initial={reduce ? false : { pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.85 }}
                transition={{ duration: 1.2, delay: 0.1 + i * 0.25, ease: [0.22, 1, 0.36, 1] }}
              />
            ))}
          </svg>
        )}

        {placed.map(({ exp, index, top, bottom }, i) => {
          const col = exp.category === 'professional' ? 2 : 3;
          const color = laneColor[exp.category];
          const branch = experienceCategories.find((c) => c.id === exp.category)!.branch;
          return (
            <motion.div
              key={exp.id}
              data-timeline-entry={exp.id}
              initial={reduce ? false : { opacity: 0, x: -14 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ delay: reduce ? 0 : (i % 4) * 0.06, type: 'spring', stiffness: 260, damping: 26 }}
              className="relative my-1 group"
              style={{ gridColumn: col, gridRow: `${line(top)} / ${line(bottom)}`, paddingLeft: LANE_INSET + 22 }}
            >
              {/* Commit dot on the lane */}
              <motion.span
                ref={(el) => (dotRefs.current[exp.id] = el)}
                data-commit-dot
                initial={reduce ? false : { scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: reduce ? 0 : 0.3, type: 'spring', stiffness: 420, damping: 18 }}
                className="absolute z-10 w-[14px] h-[14px] rounded-full bg-[var(--theme-editor)] border-2"
                style={{ left: LANE_INSET - 7, top: DOT_Y - 7, borderColor: color }}
              />
              {/* Connector from dot to card */}
              <span className="absolute h-0.5 w-3 rounded-full" style={{ left: LANE_INSET + 7, top: DOT_Y - 1, backgroundColor: color, opacity: 0.6 }} aria-hidden="true" />
              <div className="h-full rounded-lg border border-border/60 bg-[var(--theme-editor)] p-3 shadow-sm transition-colors group-hover:border-border">
                <div className="flex items-start gap-3">
                  <CompanyLogo src={exp.logo} fullBleed={exp.logoFullBleed} company={exp.company} size={36} className="mt-0.5" />
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="text-xs font-mono" style={{ color }} data-hash>{hashFromId(exp.id, index)}</span>
                      <span className="text-[11px] font-mono px-1.5 rounded-full border" style={{ color, borderColor: color }} data-branch-tag>{branch}</span>
                      <span className="text-xs text-purple-400">{exp.period}</span>
                    </div>
                    <h3 className="text-base font-semibold text-yellow-400 leading-snug">{exp.title}</h3>
                    <div className="text-sm font-medium text-primary"><CompanyName company={exp.company} /></div>
                    {(exp.location || exp.type) && (
                      <div className="text-xs text-muted-foreground">{[exp.location, exp.type].filter(Boolean).join(' · ')}</div>
                    )}
                    {exp.description && <p className="text-sm text-muted-foreground leading-relaxed pt-1">{exp.description}</p>}
                    {exp.skills && exp.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {exp.skills.map((s) => (
                          <span key={s} className="px-2 py-0.5 text-[11px] bg-orange-500/10 text-orange-400 rounded-full border border-orange-500/20">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Initial commit on main */}
        <div className="relative" style={{ gridColumn: '1 / 3', gridRow: `${rootRow} / ${rootRow + 1}` }}>
          <span
            ref={rootDotRef}
            data-commit-dot
            className="absolute z-10 w-[14px] h-[14px] rounded-full bg-[var(--theme-editor)] border-2 border-[#858585]"
            style={{ left: AXIS_W - 7, bottom: 6 }}
          />
          <div className="absolute text-xs font-mono whitespace-nowrap" style={{ left: AXIS_W + 14, bottom: 2 }}>
            <span className="text-[#858585]">e1a9b5c</span> <span className="text-[var(--theme-comment)]">chore: portfolio initialized</span>
          </div>
        </div>
      </div>
    </div>
  );
};
