import { ChevronRight } from 'lucide-react';

interface BreadcrumbsProps {
  path: string;
  onNavigate?: (path: string) => void;
}

export const Breadcrumbs = ({ path, onNavigate }: BreadcrumbsProps) => {
  const parts = path.split('/').filter(Boolean);
  
  return (
    <div className="h-7 bg-[var(--theme-editor)] border-b border-[var(--theme-border)] flex items-center px-4 text-xs text-[#cccccc] select-none">
      {parts.length === 0 ? (
        <span className="text-[#858585]">No file open</span>
      ) : (
        <div className="flex items-center gap-1">
          {parts.map((part, index) => {
            const isLast = index === parts.length - 1;
            const pathToHere = '/' + parts.slice(0, index + 1).join('/');
            
            return (
              <div key={index} className="flex items-center gap-1">
                <button
                  onClick={() => onNavigate?.(pathToHere)}
                  className={`hover:text-white transition-colors ${
                    isLast ? 'text-white font-medium' : 'text-[#858585]'
                  }`}
                >
                  {part}
                </button>
                {!isLast && <ChevronRight className="w-3 h-3 text-[#858585]" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
