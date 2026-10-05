import { useState, useRef, useEffect } from 'react';
import { X, Minus, Square, Terminal as TerminalIcon } from 'lucide-react';

interface TerminalLine {
  type: 'command' | 'output' | 'error';
  content: string;
}

interface IntegratedTerminalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileOpen: (path: string, name: string) => void;
  onThemeChange: (theme: string) => void;
}

export const IntegratedTerminal = ({ isOpen, onClose, onFileOpen, onThemeChange }: IntegratedTerminalProps) => {
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'output', content: 'Portfolio Terminal v1.0.0' },
    { type: 'output', content: 'Type "help" for available commands.' },
    { type: 'output', content: '' },
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentPath, setCurrentPath] = useState('~/portfolio');
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const files: Record<string, string> = {
    'about.tsx': 'about.tsx - Personal information and bio',
    'contact.md': 'contact.md - Contact information and social links',
    'experience.json': 'experience.json - Work experience and timeline',
    'projects': 'projects/ - All projects and work',
    'pictures': 'pictures/ - Photo gallery',
    'awards.tsx': 'awards.tsx - Awards and achievements',
    'resume.pdf': 'resume.pdf - Professional resume',
    'me.rs': 'me.rs - Portfolio entry point',
  };

  const themes = ['dark-plus', 'monokai', 'github-dark', 'dracula', 'nord', 'solarized-dark'];

  const executeCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim();
    const parts = trimmedCmd.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    setLines(prev => [...prev, { type: 'command', content: `${currentPath} $ ${trimmedCmd}` }]);

    switch (command) {
      case 'help':
        setLines(prev => [...prev,
          { type: 'output', content: 'Available commands:' },
          { type: 'output', content: '  help              - Show this help message' },
          { type: 'output', content: '  ls                - List files and directories' },
          { type: 'output', content: '  cd <dir>          - Change directory' },
          { type: 'output', content: '  cat <file>        - Display file contents' },
          { type: 'output', content: '  open <file>       - Open a file in the editor' },
          { type: 'output', content: '  whoami            - Display current user info' },
          { type: 'output', content: '  contact           - Show contact information' },
          { type: 'output', content: '  theme <name>      - Change color theme' },
          { type: 'output', content: '  clear             - Clear terminal' },
          { type: 'output', content: '  pwd               - Print working directory' },
          { type: 'output', content: '  echo <text>       - Echo text to terminal' },
          { type: 'output', content: '' },
        ]);
        break;

      case 'ls':
        setLines(prev => [...prev,
          { type: 'output', content: '\x1b[34mabout.tsx\x1b[0m          \x1b[34mcontact.md\x1b[0m         \x1b[34mexperience.json\x1b[0m' },
          { type: 'output', content: '\x1b[36mprojects/\x1b[0m          \x1b[36mpictures/\x1b[0m          \x1b[34mawards.tsx\x1b[0m' },
          { type: 'output', content: '\x1b[31mresume.pdf\x1b[0m         \x1b[34mme.rs\x1b[0m' },
          { type: 'output', content: '' },
        ]);
        break;

      case 'pwd':
        setLines(prev => [...prev,
          { type: 'output', content: currentPath },
          { type: 'output', content: '' },
        ]);
        break;

      case 'cd':
        if (args.length === 0 || args[0] === '~') {
          setCurrentPath('~/portfolio');
          setLines(prev => [...prev, { type: 'output', content: '' }]);
        } else if (args[0] === '..') {
          setCurrentPath('~/portfolio');
          setLines(prev => [...prev, { type: 'output', content: '' }]);
        } else if (args[0] === 'projects' || args[0] === './projects') {
          setCurrentPath('~/portfolio/projects');
          setLines(prev => [...prev, { type: 'output', content: '' }]);
        } else if (args[0] === 'pictures' || args[0] === './pictures') {
          setCurrentPath('~/portfolio/pictures');
          setLines(prev => [...prev, { type: 'output', content: '' }]);
        } else {
          setLines(prev => [...prev,
            { type: 'error', content: `cd: ${args[0]}: No such directory` },
            { type: 'output', content: '' },
          ]);
        }
        break;

      case 'cat':
        if (args.length === 0) {
          setLines(prev => [...prev,
            { type: 'error', content: 'cat: missing file operand' },
            { type: 'output', content: '' },
          ]);
        } else if (args[0] === 'contact.md' || args[0] === './contact.md') {
          setLines(prev => [...prev,
            { type: 'output', content: '# Contact Information' },
            { type: 'output', content: '' },
            { type: 'output', content: '📧 Email: gjw62@cornell.edu' },
            { type: 'output', content: '📍 Location: Ithaca, NY' },
            { type: 'output', content: '🔗 GitHub: github.com/SentientPlatypus' },
            { type: 'output', content: '' },
          ]);
        } else {
          setLines(prev => [...prev,
            { type: 'error', content: `cat: ${args[0]}: File cannot be displayed in terminal` },
            { type: 'output', content: 'Use "open" command to view in editor' },
            { type: 'output', content: '' },
          ]);
        }
        break;

      case 'open':
        if (args.length === 0) {
          setLines(prev => [...prev,
            { type: 'error', content: 'open: missing file operand' },
            { type: 'output', content: '' },
          ]);
        } else {
          const fileName = args[0].replace('./', '');
          const fileMap: Record<string, { path: string; name: string }> = {
            'about.tsx': { path: '/portfolio/about.tsx', name: 'about.tsx' },
            'contact.md': { path: '/portfolio/contact.md', name: 'contact.md' },
            'experience.json': { path: '/portfolio/experience.json', name: 'experience.json' },
            'awards.tsx': { path: '/portfolio/awards.tsx', name: 'awards.tsx' },
            'all-projects.tsx': { path: '/portfolio/projects/all-projects.tsx', name: 'all-projects.tsx' },
            'gallery.tsx': { path: '/portfolio/pictures/gallery.tsx', name: 'gallery.tsx' },
            'resume.pdf': { path: '/portfolio/resume.pdf', name: 'resume.pdf' },
            'me.rs': { path: '/me.rs', name: 'me.rs' },
          };

          if (fileMap[fileName]) {
            onFileOpen(fileMap[fileName].path, fileMap[fileName].name);
            setLines(prev => [...prev,
              { type: 'output', content: `Opening ${fileName}...` },
              { type: 'output', content: '' },
            ]);
          } else {
            setLines(prev => [...prev,
              { type: 'error', content: `open: ${fileName}: No such file` },
              { type: 'output', content: '' },
            ]);
          }
        }
        break;

      case 'whoami':
        setLines(prev => [...prev,
          { type: 'output', content: 'Geneustace Wicaksono' },
          { type: 'output', content: 'Electrical & Computer Engineering @ Cornell University' },
          { type: 'output', content: 'Currently @ AWS Cryptography' },
          { type: 'output', content: 'Location: Ithaca, NY' },
          { type: 'output', content: '' },
        ]);
        break;

      case 'contact':
        setLines(prev => [...prev,
          { type: 'output', content: '📧 gjw62@cornell.edu' },
          { type: 'output', content: '📍 Ithaca, NY' },
          { type: 'output', content: '' },
        ]);
        break;

      case 'theme':
        if (args.length === 0) {
          setLines(prev => [...prev,
            { type: 'output', content: 'Available themes:' },
            ...themes.map(t => ({ type: 'output' as const, content: `  - ${t}` })),
            { type: 'output', content: '' },
          ]);
        } else if (themes.includes(args[0])) {
          onThemeChange(args[0]);
          setLines(prev => [...prev,
            { type: 'output', content: `Theme changed to: ${args[0]}` },
            { type: 'output', content: '' },
          ]);
        } else {
          setLines(prev => [...prev,
            { type: 'error', content: `theme: ${args[0]}: Unknown theme` },
            { type: 'output', content: '' },
          ]);
        }
        break;

      case 'clear':
        setLines([]);
        break;

      case 'echo':
        setLines(prev => [...prev,
          { type: 'output', content: args.join(' ') },
          { type: 'output', content: '' },
        ]);
        break;

      case '':
        setLines(prev => [...prev, { type: 'output', content: '' }]);
        break;

      default:
        setLines(prev => [...prev,
          { type: 'error', content: `${command}: command not found` },
          { type: 'output', content: 'Type "help" for available commands.' },
          { type: 'output', content: '' },
        ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (input.trim()) {
        setHistory(prev => [...prev, input]);
        setHistoryIndex(-1);
        executeCommand(input);
      } else {
        setLines(prev => [...prev,
          { type: 'command', content: `${currentPath} $ ` },
          { type: 'output', content: '' },
        ]);
      }
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= history.length) {
          setHistoryIndex(-1);
          setInput('');
        } else {
          setHistoryIndex(newIndex);
          setInput(history[newIndex]);
        }
      }
    }
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="h-64 bg-[#1e1e1e] border-t border-[#2d2d30] flex flex-col">
      {/* Terminal Header */}
      <div className="h-9 bg-[#252526] border-b border-[#2d2d30] flex items-center justify-between px-3">
        <div className="flex items-center gap-2 text-[13px] text-[#cccccc]">
          <TerminalIcon className="w-4 h-4" />
          <span>bash</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLines([])}
            className="text-[#cccccc] hover:bg-[#2a2d2e] p-1 rounded"
            title="Clear terminal"
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            onClick={onClose}
            className="text-[#cccccc] hover:bg-[#2a2d2e] p-1 rounded"
            title="Close terminal"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      <div ref={terminalRef} className="flex-1 overflow-y-auto p-2 font-mono text-[13px]">
        {lines.map((line, index) => (
          <div
            key={index}
            className={`${
              line.type === 'command' ? 'text-[#4ec9b0]' :
              line.type === 'error' ? 'text-[#f48771]' :
              'text-[#cccccc]'
            }`}
          >
            {line.content}
          </div>
        ))}
        
        {/* Input Line */}
        <div className="flex items-center gap-2">
          <span className="text-[#4ec9b0]">{currentPath} $</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-[#cccccc] outline-none"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
};
