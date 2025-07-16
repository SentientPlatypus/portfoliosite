import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface IntellisenseOption {
  id: string;
  label: string;
  content: string;
}

interface IntellisenseProps {
  options: IntellisenseOption[];
  onSelectionChange?: (option: IntellisenseOption) => void;
  onHoverChange?: (option: IntellisenseOption | null) => void;
  className?: string;
}

export const Intellisense = ({ options, onSelectionChange, onHoverChange, className }: IntellisenseProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (options[selectedIndex] && onSelectionChange) {
      onSelectionChange(options[selectedIndex]);
    }
  }, [selectedIndex, options, onSelectionChange]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % options.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + options.length) % options.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [options.length]);

  const handleOptionClick = (index: number) => {
    setSelectedIndex(index);
  };

  return (
    <div className={cn('intellisense-bg rounded shadow-lg p-1 min-w-48', className)}>
      <div className="text-xs text-muted-foreground px-2 py-1 border-b border-border">
        methods
      </div>
      {options.map((option, index) => (
        <div
          key={option.id}
          className={cn(
            'flex items-center px-2 py-1 cursor-pointer text-sm',
            index === selectedIndex ? 'intellisense-selected' : 'hover:bg-muted/50'
          )}
          onClick={() => handleOptionClick(index)}
          onMouseEnter={() => onHoverChange?.(option)}
          onMouseLeave={() => onHoverChange?.(null)}
        >
          <div className="w-4 h-4 rounded-sm mr-2 flex items-center justify-center text-xs font-bold" style={{ backgroundColor: 'hsl(var(--intellisense-icon))' }}>
            M
          </div>
          {option.label}
        </div>
      ))}
    </div>
  );
};

interface IntellisenseContentProps {
  content: string;
  className?: string;
}

const parseMarkdown = (text: string) => {
  const lines = text.split('\n');
  return lines.map((line, index) => {
    // Handle H1 (# heading)
    if (line.startsWith('# ')) {
      return <h1 key={index} className="text-lg font-bold mb-2">{line.slice(2)}</h1>;
    }
    // Handle bullets (•)
    if (line.startsWith('• ')) {
      return <div key={index} className="ml-2 mb-1">{line}</div>;
    }
    // Handle empty lines
    if (line.trim() === '') {
      return <div key={index} className="h-2"></div>;
    }
    // Regular text
    return <div key={index} className="mb-1">{line}</div>;
  });
};

export const IntellisenseContent = ({ content, className }: IntellisenseContentProps) => {
  return (
    <div className={cn('intellisense-bg rounded shadow-lg p-3 ml-2', className)}>
      <div className="text-sm">
        {parseMarkdown(content)}
      </div>
    </div>
  );
};