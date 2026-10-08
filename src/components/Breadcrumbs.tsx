import { ChevronRight } from 'lucide-react';

interface BreadcrumbsProps {
  path: string;
  fileName?: string;
  onNavigate?: (path: string) => void;
}

export const Breadcrumbs = ({ path, fileName, onNavigate }: BreadcrumbsProps) => {
  const parts = path.split('/').filter(Boolean);
  
  return (
    <div className="h-7 border-b flex items-center px-4 text-xs select-none" style={{ background: 'var(--theme-breadcrumb)', borderColor: 'var(--theme-border)', color: 'var(--theme-foreground)' }}>
      {parts.length === 0 ? (
        <span style={{ opacity: 0.6 }}>No file open</span>
      ) : (
        <div className="flex items-center gap-1">
          {parts.map((part, index) => {
            const isLast = index === parts.length - 1;
            const pathToHere = '/' + parts.slice(0, index + 1).join('/');
            const displayPart = isLast && fileName ? fileName : part;
            
            return (
              <div key={index} className="flex items-center gap-1">
                <button
                  onClick={() => onNavigate?.(pathToHere)}
                  className={`hover:opacity-100 transition-opacity ${
                    isLast ? 'font-medium' : ''
                  }`}
                  style={{ opacity: isLast ? 1 : 0.6, color: 'var(--theme-foreground)' }}
                >
                  {displayPart}
                </button>
                {!isLast && <ChevronRight className="w-3 h-3" style={{ opacity: 0.6 }} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
