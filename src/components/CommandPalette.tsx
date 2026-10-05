import { useState, useEffect, useRef } from 'react';
import { Search, FileText, Palette, Terminal as TerminalIcon, ChevronRight } from 'lucide-react';

interface Command {
  id: string;
  label: string;
  description?: string;
  category: 'file' | 'theme' | 'action' | 'terminal';
  icon?: React.ReactNode;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onFileOpen: (path: string, name: string) => void;
  onThemeChange: (theme: string) => void;
  onTerminalOpen: () => void;
  currentTheme: string;
}

export const CommandPalette = ({ 
  isOpen, 
  onClose, 
  onFileOpen, 
  onThemeChange,
  onTerminalOpen,
  currentTheme 
}: CommandPaletteProps) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const files = [
    { path: '/portfolio/about.tsx', name: 'about.tsx', label: 'About Me' },
    { path: '/portfolio/contact.md', name: 'contact.md', label: 'Contact Information' },
    { path: '/portfolio/experience.json', name: 'experience.json', label: 'Work Experience' },
    { path: '/portfolio/projects/all-projects.tsx', name: 'all-projects.tsx', label: 'All Projects' },
    { path: '/portfolio/pictures/gallery.tsx', name: 'gallery.tsx', label: 'Picture Gallery' },
    { path: '/portfolio/awards.tsx', name: 'awards.tsx', label: 'Awards & Achievements' },
    { path: '/portfolio/resume.pdf', name: 'resume.pdf', label: 'Resume' },
    { path: '/me.rs', name: 'me.rs', label: 'Welcome' },
  ];

  const themes = [
    { id: 'dark-plus', name: 'Dark+ (default dark)' },
    { id: 'monokai', name: 'Monokai' },
    { id: 'github-dark', name: 'GitHub Dark' },
    { id: 'dracula', name: 'Dracula' },
    { id: 'nord', name: 'Nord' },
    { id: 'solarized-dark', name: 'Solarized Dark' },
  ];

  const commands: Command[] = [
    ...files.map(file => ({
      id: `file:${file.path}`,
      label: file.label,
      description: file.name,
      category: 'file' as const,
      icon: <FileText className="w-4 h-4" />,
      action: () => {
        onFileOpen(file.path, file.name);
        onClose();
      }
    })),
    ...themes.map(theme => ({
      id: `theme:${theme.id}`,
      label: theme.name,
      description: currentTheme === theme.id ? '(current)' : undefined,
      category: 'theme' as const,
      icon: <Palette className="w-4 h-4" />,
      action: () => {
        onThemeChange(theme.id);
        onClose();
      }
    })),
    {
      id: 'action:terminal',
      label: 'Toggle Terminal',
      description: 'Open integrated terminal',
      category: 'terminal' as const,
      icon: <TerminalIcon className="w-4 h-4" />,
      action: () => {
        onTerminalOpen();
        onClose();
      }
    }
  ];

  const filteredCommands = commands.filter(cmd => {
    const searchLower = search.toLowerCase();
    return cmd.label.toLowerCase().includes(searchLower) || 
           cmd.description?.toLowerCase().includes(searchLower);
  });

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center pt-[15vh] z-50" onClick={onClose}>
      <div 
        className="w-full max-w-2xl bg-[#252526] border border-[#454545] rounded-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#454545]">
          <Search className="w-4 h-4 text-[#858585]" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search files, themes, and commands..."
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-[#858585]"
          />
          <kbd className="text-xs text-[#858585] bg-[#3c3c3c] px-2 py-1 rounded">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-8 text-center text-[#858585] text-sm">
              No results found
            </div>
          ) : (
            <div className="py-1">
              {filteredCommands.map((cmd, index) => (
                <div
                  key={cmd.id}
                  className={`flex items-center gap-3 px-4 py-2 cursor-pointer ${
                    index === selectedIndex ? 'bg-[#094771]' : 'hover:bg-[#2a2d2e]'
                  }`}
                  onClick={() => cmd.action()}
                >
                  <span className={index === selectedIndex ? 'text-white' : 'text-[#858585]'}>
                    {cmd.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{cmd.label}</div>
                    {cmd.description && (
                      <div className="text-xs text-[#858585] truncate">{cmd.description}</div>
                    )}
                  </div>
                  {index === selectedIndex && (
                    <ChevronRight className="w-4 h-4 text-white flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-[#454545] flex items-center justify-between text-xs text-[#858585]">
          <span>↑↓ to navigate</span>
          <span>↵ to select</span>
        </div>
      </div>
    </div>
  );
};
