import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Box } from 'lucide-react';

interface IntellisenseOption {
  id: string;
  label: string;
  content: string | React.ReactNode;
}

interface IntellisenseProps {
  options: IntellisenseOption[];
  onSelectionChange?: (option: IntellisenseOption) => void;
  onHoverChange?: (option: IntellisenseOption | null) => void;
  className?: string;
  isWorkComponentActive?: boolean;
  onSetWorkComponentActive?: (active: boolean) => void;
}

export const Intellisense = ({ 
  options, 
  onSelectionChange, 
  onHoverChange, 
  className,
  isWorkComponentActive = false,
  onSetWorkComponentActive
}: IntellisenseProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (options[selectedIndex] && onSelectionChange) {
      onSelectionChange(options[selectedIndex]);
    }
  }, [selectedIndex, options, onSelectionChange]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle navigation if work component is active
      if (isWorkComponentActive) return;
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % options.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + options.length) % options.length);
      } else if (e.key === 'ArrowRight' && options[selectedIndex]?.id === 'work') {
        e.preventDefault();
        onSetWorkComponentActive?.(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [options.length, isWorkComponentActive, selectedIndex, onSetWorkComponentActive]);

  const handleWorkNavigationRequest = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      onSetWorkComponentActive?.(false);
    }
  };

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
          <Box className="w-4 h-4 mr-2 text-blue-400" />
          <span className="text-[13px]">{option.label}</span>
        </div>
      ))}
    </div>
  );
};

interface IntellisenseContentProps {
  content: string | React.ReactNode;
  className?: string;
  isWorkSelected?: boolean;
  onWorkNavigationRequest?: (direction: 'left' | 'right') => void;
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

export const IntellisenseContent = ({ content, className, isWorkSelected, onWorkNavigationRequest }: IntellisenseContentProps) => {
  const renderContent = () => {
    if (typeof content === 'string') {
      return parseMarkdown(content);
    }
    
    // If it's a React component and it's the WorkTimeline, pass the props
    if (React.isValidElement(content) && typeof content.type === 'function' && content.type.name === 'WorkTimeline') {
      return React.cloneElement(content as React.ReactElement<any>, {
        isSelected: isWorkSelected,
        onNavigationRequest: onWorkNavigationRequest
      });
    }
    
    return content;
  };

  return (
    <div className={cn('intellisense-bg rounded shadow-lg p-3 ml-2 max-h-[77vh] overflow-y-auto scrollbar-hide', className)}>
      <div className="text-sm">
        {renderContent()}
      </div>
    </div>
  );
};