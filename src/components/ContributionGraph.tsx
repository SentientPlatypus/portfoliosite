import { useMemo, useState } from 'react';
import type { ContributionDay } from '@/lib/socialApi';
import { formatDay } from '@/lib/format';

const CELL = 11;
const GAP = 3;
const STEP = CELL + GAP;
const WEEKDAY_LABEL_WIDTH = 26;
const MONTH_LABEL_HEIGHT = 14;

/** GitHub's dark-theme contribution scale. */
const LEVEL_COLORS = ['#2c313a', '#0e4429', '#006d32', '#26a641', '#39d353'];

const WEEKDAYS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

interface HoveredCell {
  day: ContributionDay;
  x: number;
  y: number;
}

interface ContributionGraphProps {
  days: ContributionDay[];
}

export const ContributionGraph = ({ days }: ContributionGraphProps) => {
  const [hovered, setHovered] = useState<HoveredCell | null>(null);

  const { cells, monthLabels, weekCount } = useMemo(() => buildGrid(days), [days]);

  if (cells.length === 0) return null;

  const gridWidth = weekCount * STEP - GAP;

  return (
    <div
      className="relative"
      onMouseLeave={() => setHovered(null)}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="overflow-x-auto scrollbar-hide pb-1">
        <div style={{ width: WEEKDAY_LABEL_WIDTH + gridWidth }}>
          <div
            className="relative"
            style={{ height: MONTH_LABEL_HEIGHT, marginLeft: WEEKDAY_LABEL_WIDTH }}
          >
            {monthLabels.map(({ label, weekIndex }) => (
              <span
                key={`${label}-${weekIndex}`}
                className="absolute top-0 text-[9px] leading-none text-muted-foreground"
                style={{ left: weekIndex * STEP }}
              >
                {label}
              </span>
            ))}
          </div>

          <div className="flex">
            <div
              className="grid shrink-0"
              style={{
                width: WEEKDAY_LABEL_WIDTH,
                gridTemplateRows: `repeat(7, ${CELL}px)`,
                rowGap: GAP,
              }}
            >
              {WEEKDAYS.map((label, index) => (
                <span
                  key={index}
                  className="text-[9px] leading-none text-muted-foreground"
                  style={{ lineHeight: `${CELL}px` }}
                >
                  {label}
                </span>
              ))}
            </div>

            <div
              className="grid"
              style={{
                gridTemplateRows: `repeat(7, ${CELL}px)`,
                gridAutoFlow: 'column',
                gridAutoColumns: `${CELL}px`,
                gap: GAP,
              }}
            >
              {cells.map((day, index) =>
                day === null ? (
                  <div key={`pad-${index}`} />
                ) : (
                  <div
                    key={day.date}
                    className="rounded-[2px] transition-transform duration-100 hover:scale-[1.35]"
                    style={{
                      backgroundColor: LEVEL_COLORS[Math.min(day.level, 4)],
                      boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)',
                    }}
                    aria-label={`${day.count} contributions on ${formatDay(day.date)}`}
                    onMouseEnter={(event) => {
                      const rect = event.currentTarget.getBoundingClientRect();
                      setHovered({
                        day,
                        x: rect.left + rect.width / 2,
                        y: rect.top,
                      });
                    }}
                  />
                ),
              )}
            </div>
          </div>
        </div>
      </div>

      {hovered && (
        <div
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full rounded border border-border bg-popover px-2 py-1 text-[10px] whitespace-nowrap text-popover-foreground shadow-lg"
          style={{ left: hovered.x, top: hovered.y - 6 }}
        >
          <span className="font-medium text-foreground">
            {hovered.day.count === 0
              ? 'No contributions'
              : `${hovered.day.count} contribution${hovered.day.count === 1 ? '' : 's'}`}
          </span>
          <span className="text-muted-foreground"> on {formatDay(hovered.day.date)}</span>
        </div>
      )}
    </div>
  );
};

export const ContributionLegend = () => (
  <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
    <span>Less</span>
    {LEVEL_COLORS.map((color) => (
      <span
        key={color}
        className="rounded-[2px]"
        style={{
          width: 9,
          height: 9,
          backgroundColor: color,
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)',
        }}
      />
    ))}
    <span>More</span>
  </div>
);

function buildGrid(days: ContributionDay[]) {
  if (days.length === 0) return { cells: [], monthLabels: [], weekCount: 0 };

  // Each column is a Sunday-start week, so pad until the first day lines up.
  const leadingBlanks = new Date(`${days[0].date}T00:00:00Z`).getUTCDay();
  const cells: Array<ContributionDay | null> = [
    ...Array<null>(leadingBlanks).fill(null),
    ...days,
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const weekCount = cells.length / 7;
  const monthLabels: Array<{ label: string; weekIndex: number }> = [];
  let lastLabelledMonth = -1;

  for (let weekIndex = 0; weekIndex < weekCount; weekIndex += 1) {
    const firstDay = cells.slice(weekIndex * 7, weekIndex * 7 + 7).find(Boolean);
    if (!firstDay) continue;

    const date = new Date(`${firstDay.date}T00:00:00Z`);
    const month = date.getUTCMonth();
    const previous = monthLabels[monthLabels.length - 1];

    // Skip a label if the month only owns a sliver of this column, or if the
    // previous label is too close to stay readable.
    if (month === lastLabelledMonth) continue;
    if (previous && weekIndex - previous.weekIndex < 3) continue;

    monthLabels.push({
      label: date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }),
      weekIndex,
    });
    lastLabelledMonth = month;
  }

  return { cells, monthLabels, weekCount };
}
