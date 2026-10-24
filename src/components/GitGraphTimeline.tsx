import { GitBranch } from 'lucide-react';
import { WorkTimeline } from './WorkTimeline';
import { motion, useReducedMotion } from 'framer-motion';
import { useLayoutEffect, useRef, useState } from 'react';
import { experiences, experienceCategories, isUpcoming, type ExperienceCategory } from '@/data/experience';
import { CompanyLogo, CompanyName } from './CompanyLogo';

export const hashFromId = (id: string, index: number) => {
  const source = `${id}:${index}`;
  let hash = 0;
  for (let i = 0; i < source.length; i++) {
    hash = (hash * 31 + source.charCodeAt(i)) >>> 0;
  }
  hash ^= (index + 1) * 0x9e3779b1;
  return (hash >>> 0).toString(16).padStart(7, '0').slice(0, 7);
};

// Lane geometry (px). main = 0, then one lane per category.
const LANE_GAP = 18;
const LANE0 = 9;
const DOT_Y = 15; // commit dot centre from top of row
const laneX = (lane: number) => LANE0 + lane * LANE_GAP;
const laneOf: Record<ExperienceCategory, number> = { professional: 1, research: 2 };
const laneColor: Record<ExperienceCategory | 'main', string> = {
  main: '#858585',
  professional: 'var(--theme-method)',
  research: 'var(--theme-string)',
};
const GUTTER = laneX(2) + 22;

export const GitGraphTimeline = ({ compact = false }: { compact?: boolean } = {}) => {
  const reduce = useReducedMotion();
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const [ys, setYs] = useState<number[]>([]);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const measure = () => {
      setYs(rowRefs.current.map((el) => (el ? el.offsetTop + DOT_Y + 8 : 0)));
      setHeight(root.offsetHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    return () => ro.disconnect();
  }, []);

  const rootIdx = experiences.length; // the initial commit row
  const ready = ys.length === rootIdx + 1;

  // Build one path per branch: forks off main at the initial commit, runs up through its commits.
  const paths = experienceCategories.map((cat) => {
    const idx = experiences.map((e, i) => (e.category === cat.id ? i : -1)).filter((i) => i >= 0);
    if (!ready || idx.length === 0) return { cat, d: '' };
    const x0 = laneX(0);
    const x = laneX(laneOf[cat.id]);
    const yRoot = ys[rootIdx];
    const yBottom = ys[idx[idx.length - 1]];
    const yTop = ys[idx[0]];
    const curve = Math.min(26, (yRoot - yBottom) / 2);
    const d = `M ${x0} ${yRoot} C ${x0} ${yRoot - curve}, ${x} ${yRoot - curve}, ${x} ${yRoot - curve * 2} L ${x} ${yTop}`;
    return { cat, d };
  });
  const mainTop = ready ? ys[0] : 0;

  return (
    <div className={compact ? 'p-4' : 'p-6'} data-git-graph={compact ? 'sidebar' : 'editor'}>
      <div className="mb-4 flex items-center gap-3">
        <GitBranch className="w-5 h-5 text-[var(--theme-method)]" />
        <h2 className={`${compact ? 'text-base' : 'text-xl'} font-bold text-[var(--theme-method)]`}>Experience Timeline</h2>
        <span className="text-xs text-[#858585] ml-auto">main</span>
      </div>

      {/* Branch legend */}
      <div className="mb-5 flex flex-wrap gap-2 text-xs font-mono">
        {experienceCategories.map((cat, i) => (
          <motion.span
            key={cat.id}
            initial={reduce ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.1 }}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--theme-border)] px-2 py-0.5"
            data-branch-chip={cat.branch}
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: laneColor[cat.id] }} />
            <span style={{ color: laneColor[cat.id] }}>{cat.branch}</span>
            <span className="text-[var(--theme-comment)]">· {cat.label}</span>
          </motion.span>
        ))}
      </div>

      <div className="relative" ref={rootRef}>
        {/* Git graph lanes */}
        {ready && (
          <svg
            className="absolute left-0 top-0 pointer-events-none overflow-visible"
            width={GUTTER}
            height={height}
            aria-hidden="true"
          >
            <line x1={laneX(0)} x2={laneX(0)} y1={mainTop} y2={ys[rootIdx]} stroke={laneColor.main} strokeOpacity={0.35} strokeWidth={2} strokeDasharray="3 4" />
            {paths.map(({ cat, d }, i) => (
              <motion.path
                key={cat.id}
                d={d}
                fill="none"
                stroke={laneColor[cat.id]}
                strokeWidth={2}
                strokeLinecap="round"
                initial={reduce ? false : { pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.85 }}
                transition={{ duration: 1.1, delay: 0.1 + i * 0.25, ease: [0.22, 1, 0.36, 1] }}
              />
            ))}
          </svg>
        )}

        {experiences.map((exp, index) => {
          const lane = laneOf[exp.category];
          const color = laneColor[exp.category];
          const branch = experienceCategories.find((c) => c.id === exp.category)!.branch;
          return (
            <motion.div
              key={exp.id}
              ref={(el) => (rowRefs.current[index] = el)}
              initial={reduce ? false : { opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + index * 0.08, type: 'spring', stiffness: 260, damping: 26 }}
              className="relative pb-6 group rounded transition-colors hover:bg-[var(--theme-sidebar)]/50 p-2 -ml-2"
              style={{ paddingLeft: GUTTER }}
              data-exp-row={exp.id}
              data-branch={branch}
            >
              {/* Commit dot on its lane */}
              <motion.div
                initial={reduce ? false : { scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + index * 0.08, type: 'spring', stiffness: 420, damping: 18 }}
                className="absolute w-[14px] h-[14px] rounded-full bg-[var(--theme-editor)] border-2 z-10 transition-shadow group-hover:shadow-[0_0_0_4px_var(--theme-sidebar)]"
                style={{ left: laneX(lane) - 7 + 8, top: DOT_Y - 7 + 8, borderColor: color }}
              />
              <div className="flex items-start gap-3">
                <CompanyLogo src={exp.logo} fullBleed={exp.logoFullBleed} company={exp.company} size={32} className="mt-0.5 transition-transform group-hover:scale-105" />
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="text-xs font-mono" style={{ color }} data-hash>{hashFromId(exp.id, index)}</span>
                    <span className="text-[11px] font-mono px-1.5 rounded-full border" style={{ color, borderColor: color }}>
                      {branch}
                    </span>
                    <span className="text-xs text-[#858585]">{exp.period}</span>
                    {isUpcoming(exp) && <span className="text-[10px] font-mono uppercase tracking-wide px-1.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-400/30" data-upcoming>upcoming</span>}
                  </div>
                  <div className="text-sm font-semibold text-[var(--theme-foreground)]">{exp.title}</div>
                  <div className="text-sm text-[var(--theme-variable)]">
                    <CompanyName company={exp.company} />
                  </div>
                  {exp.location && <div className="text-xs text-[var(--theme-comment)]">{exp.location}</div>}
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Initial commit */}
        <div
          ref={(el) => (rowRefs.current[rootIdx] = el)}
          className="relative pb-4 group hover:bg-[var(--theme-sidebar)]/50 -ml-2 p-2 rounded transition-colors"
          style={{ paddingLeft: GUTTER }}
        >
          <div
            className="absolute w-[14px] h-[14px] rounded-full bg-[var(--theme-editor)] border-2 border-[#858585] z-10"
            style={{ left: laneX(0) - 7 + 8, top: DOT_Y - 7 + 8 }}
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[var(--theme-string)]">e1a9b5c</span>
              <span className="text-xs text-[#858585]">Initial commit</span>
            </div>
            <div className="text-xs text-[var(--theme-comment)] font-mono">chore: portfolio initialized</div>
          </div>
        </div>
      </div>

      {!compact && (
      <div className="mt-8 pt-6 border-t border-[var(--theme-border)]">
        <details className="cursor-pointer">
          <summary className="text-sm font-semibold text-[var(--theme-method)] hover:text-[var(--theme-string)] transition-colors">
            View Detailed Timeline
          </summary>
          <div className="mt-4">
            <WorkTimeline />
          </div>
        </details>
      </div>
      )}
    </div>
  );
};
