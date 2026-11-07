import type { ReactNode } from 'react';
import type { ProjectTable, ProjectTableCell } from './PortfolioContent';

const renderInline = (text: string): ReactNode => {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code key={i} className="font-mono text-xs">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
};

const renderCell = (cell: ProjectTableCell) => {
  if (typeof cell === 'string') return renderInline(cell);
  return (
    <a
      href={cell.href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[var(--theme-statusBar)] hover:underline"
    >
      {renderInline(cell.text)}
    </a>
  );
};

export const ProjectResultsTable = ({ table }: { table: ProjectTable }) => (
  <div className="mb-6 overflow-x-auto rounded-lg border border-[var(--theme-border)]">
    <table className="min-w-[44rem] w-full text-left text-sm border-collapse">
      <thead className="bg-[var(--theme-sidebar)]">
        <tr>
          {table.headers.map((header) => (
            <th
              key={header}
              className="px-3 py-2 font-semibold whitespace-nowrap text-[var(--theme-type)] border-b border-[var(--theme-border)]"
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {table.rows.map((row, i) => (
          <tr key={i} className="border-b border-[var(--theme-border)] last:border-b-0">
            {row.map((cell, j) => (
              <td
                key={j}
                className={`px-3 py-2 align-top text-[var(--theme-foreground)] ${
                  j === 2 ? 'whitespace-normal min-w-[12rem]' : 'whitespace-nowrap'
                }`}
              >
                {renderCell(cell)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
