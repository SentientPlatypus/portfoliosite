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
  className?: string;
}

export const Intellisense = ({ options, onSelectionChange, className }: IntellisenseProps) => {
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
        >
          <div className="w-4 h-4 bg-accent rounded-sm mr-2 flex items-center justify-center text-xs font-bold">
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

export const IntellisenseContent = ({ content, className }: IntellisenseContentProps) => {
  return (
    <div className={cn('intellisense-bg rounded shadow-lg p-3 ml-2', className)}>
      <div className="text-sm whitespace-pre-line">
        {content}
      </div>
    </div>
  );
};