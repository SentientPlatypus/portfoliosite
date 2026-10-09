import { Code, Eye } from 'lucide-react';

interface ViewModeToggleProps {
  mode: 'source' | 'preview';
  onModeChange: (mode: 'source' | 'preview') => void;
}

export const ViewModeToggle = ({ mode, onModeChange }: ViewModeToggleProps) => {
  return (
    <div className="flex items-center gap-1 bg-[var(--theme-sidebar)] rounded-md p-1">
      <button
        onClick={() => onModeChange('source')}
        className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded transition-colors ${
          mode === 'source'
            ? 'bg-[var(--theme-editor)] text-white'
            : 'text-[#858585] hover:text-white'
        }`}
      >
        <Code className="w-3 h-3" />
        Source
      </button>
      <button
        onClick={() => onModeChange('preview')}
        className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded transition-colors ${
          mode === 'preview'
            ? 'bg-[var(--theme-editor)] text-white'
            : 'text-[#858585] hover:text-white'
        }`}
      >
        <Eye className="w-3 h-3" />
        Preview
      </button>
    </div>
  );
};
