import { useState, useEffect } from 'react';
import { useTheme } from './ThemeProvider';
import { Check } from 'lucide-react';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Settings = ({ isOpen, onClose }: SettingsProps) => {
  const { theme, setTheme } = useTheme();
  const [fontSize, setFontSize] = useState(() => {
    return parseInt(localStorage.getItem('editor-font-size') || '14', 10);
  });
  const [terminalFontSize, setTerminalFontSize] = useState(() => {
    return parseInt(localStorage.getItem('terminal-font-size') || '13', 10);
  });
  const [reduceAnimations, setReduceAnimations] = useState(() => {
    return localStorage.getItem('reduce-animations') === 'true';
  });

  const themes = [
    { id: 'dark-plus', name: 'Dark+ (default dark)' },
    { id: 'monokai', name: 'Monokai' },
    { id: 'github-dark', name: 'GitHub Dark' },
    { id: 'dracula', name: 'Dracula' },
    { id: 'nord', name: 'Nord' },
    { id: 'solarized-dark', name: 'Solarized Dark' },
  ];

  useEffect(() => {
    if (reduceAnimations) {
      document.documentElement.style.setProperty('--animation-duration', '0.01ms');
      document.body.classList.add('reduce-motion');
    } else {
      document.documentElement.style.removeProperty('--animation-duration');
      document.body.classList.remove('reduce-motion');
    }
  }, [reduceAnimations]);

  const handleFontSizeChange = (size: number) => {
    setFontSize(size);
    localStorage.setItem('editor-font-size', size.toString());
    document.documentElement.style.setProperty('--editor-font-size', `${size}px`);
  };

  const handleTerminalFontSizeChange = (size: number) => {
    setTerminalFontSize(size);
    localStorage.setItem('terminal-font-size', size.toString());
    document.documentElement.style.setProperty('--terminal-font-size', `${size}px`);
  };

  const handleReduceAnimationsChange = (value: boolean) => {
    setReduceAnimations(value);
    localStorage.setItem('reduce-animations', value.toString());
  };

  const handleReset = () => {
    setTheme('dark-plus');
    handleFontSizeChange(14);
    handleTerminalFontSizeChange(13);
    handleReduceAnimationsChange(false);
    localStorage.removeItem('terminal-height');
    window.location.reload();
  };

  if (!isOpen) return null;

  return (
    <div className="flex-1 overflow-auto vscode-scrollbar" style={{ background: 'var(--theme-editor)' }}>
      <div className="p-8 max-w-3xl">
        <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--theme-method)' }}>Settings</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--theme-comment)' }}>
          Customize your editor experience
        </p>

        {/* Color Theme */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--theme-type)' }}>
            Color Theme
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--theme-comment)' }}>
            Select your preferred color theme
          </p>
          <div className="space-y-2">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className="w-full flex items-center justify-between px-4 py-3 rounded border transition-colors"
                style={{
                  background: theme.id === t.id ? 'var(--theme-tabActive)' : 'var(--theme-sidebar)',
                  borderColor: theme.id === t.id ? 'var(--theme-statusBar)' : 'var(--theme-border)',
                  color: 'var(--theme-foreground)',
                }}
              >
                <span>{t.name}</span>
                {theme.id === t.id && <Check className="w-4 h-4" style={{ color: 'var(--theme-statusBar)' }} />}
              </button>
            ))}
          </div>
        </div>

        {/* Editor Font Size */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--theme-type)' }}>
            Editor Font Size
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--theme-comment)' }}>
            Controls the font size in the editor (px)
          </p>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="10"
              max="24"
              value={fontSize}
              onChange={(e) => handleFontSizeChange(parseInt(e.target.value, 10))}
              className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
              style={{
                background: 'var(--theme-sidebar)',
              }}
            />
            <span className="text-sm font-mono w-12 text-right" style={{ color: 'var(--theme-foreground)' }}>
              {fontSize}px
            </span>
          </div>
        </div>

        {/* Terminal Font Size */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--theme-type)' }}>
            Terminal Font Size
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--theme-comment)' }}>
            Controls the font size in the integrated terminal (px)
          </p>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="10"
              max="20"
              value={terminalFontSize}
              onChange={(e) => handleTerminalFontSizeChange(parseInt(e.target.value, 10))}
              className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
              style={{
                background: 'var(--theme-sidebar)',
              }}
            />
            <span className="text-sm font-mono w-12 text-right" style={{ color: 'var(--theme-foreground)' }}>
              {terminalFontSize}px
            </span>
          </div>
        </div>

        {/* Reduce Animations */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--theme-type)' }}>
            Reduce Animations
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--theme-comment)' }}>
            Minimize or disable animations for better performance
          </p>
          <button
            onClick={() => handleReduceAnimationsChange(!reduceAnimations)}
            className="flex items-center gap-3 px-4 py-3 rounded border transition-all hover:opacity-80"
            style={{
              background: 'var(--theme-sidebar)',
              borderColor: 'var(--theme-border)',
              color: 'var(--theme-foreground)',
            }}
          >
            <div
              className="relative w-11 h-6 rounded-full transition-colors"
              style={{
                background: reduceAnimations ? 'var(--theme-statusBar)' : 'var(--theme-border)',
              }}
            >
              <div
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform"
                style={{
                  transform: reduceAnimations ? 'translateX(22px)' : 'translateX(2px)',
                }}
              />
            </div>
            <span>Reduce animations</span>
          </button>
        </div>

        {/* Reset Button */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--theme-type)' }}>
            Reset Settings
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--theme-comment)' }}>
            Reset all settings to their default values
          </p>
          <button
            onClick={handleReset}
            className="px-6 py-2 rounded border transition-colors hover:opacity-80"
            style={{
              background: 'var(--theme-sidebar)',
              borderColor: 'var(--theme-border)',
              color: 'var(--theme-foreground)',
            }}
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
};
