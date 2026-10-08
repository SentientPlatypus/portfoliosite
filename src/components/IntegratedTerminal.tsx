import { useState, useRef, useEffect } from 'react';
import { X, Minus, Square, Terminal as TerminalIcon } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface TerminalLine {
  type: 'command' | 'output' | 'error' | 'syntax';
  content: string | React.ReactNode;
  color?: 'blue' | 'cyan' | 'red' | 'green' | 'yellow' | 'mixed';
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
  const [isRunning, setIsRunning] = useState(false);
  const [runningCommand, setRunningCommand] = useState<string | null>(null);
  const [height, setHeight] = useState(() => {
    const saved = localStorage.getItem('terminal-height');
    return saved ? parseInt(saved, 10) : 256;
  });
  const [isResizing, setIsResizing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

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

  const projects = [
    { id: 1, name: 'AI Research Platform' },
    { id: 2, name: 'Smart Home Automation' },
    { id: 3, name: 'Robotics Vision System' },
    { id: 4, name: 'Cloud Infrastructure' },
  ];

  const stopRunningProgram = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsRunning(false);
    setRunningCommand(null);
    setLines(prev => [...prev,
      { type: 'output', content: '^C' },
      { type: 'output', content: '' },
    ]);
  };

  const runDonut = () => {
    setIsRunning(true);
    setRunningCommand('donut');
    
    let A = 0, B = 0;
    const donutFrame = () => {
      const b = [];
      const z = [];
      A += 0.04;
      B += 0.02;
      const cA = Math.cos(A), sA = Math.sin(A);
      const cB = Math.cos(B), sB = Math.sin(B);
      
      for (let k = 0; k < 1760; k++) {
        b[k] = k % 80 === 79 ? '\n' : ' ';
        z[k] = 0;
      }
      
      for (let j = 0; j < 6.28; j += 0.07) {
        const ct = Math.cos(j), st = Math.sin(j);
        for (let i = 0; i < 6.28; i += 0.02) {
          const sp = Math.sin(i), cp = Math.cos(i);
          const h = ct + 2;
          const D = 1 / (sp * h * sA + st * cA + 5);
          const t = sp * h * cA - st * sA;
          
          const x = Math.floor(40 + 30 * D * (cp * h * cB - t * sB));
          const y = Math.floor(12 + 15 * D * (cp * h * sB + t * cB));
          const o = x + 80 * y;
          const N = Math.floor(8 * ((st * sA - sp * ct * cA) * cB - sp * ct * sA - st * cA - cp * ct * sB));
          
          if (y < 22 && y >= 0 && x >= 0 && x < 79 && D > z[o]) {
            z[o] = D;
            b[o] = '.,-~:;=!*#$@'[N > 0 ? N : 0];
          }
        }
      }
      
      setLines(prev => {
        const filtered = prev.filter(line => 
          !(line.type === 'output' && typeof line.content === 'string' && line.content.includes('.,-~:;=!*#$@'))
        );
        return [...filtered, { type: 'output', content: b.join(''), color: 'cyan' }];
      });
      
      if (isRunning && runningCommand === 'donut') {
        animationFrameRef.current = requestAnimationFrame(donutFrame);
      }
    };
    
    donutFrame();
  };

  const runMatrix = () => {
    setIsRunning(true);
    setRunningCommand('matrix');
    
    const chars = 'ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ01';
    const columns = 80;
    const drops: number[] = [];
    
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.floor(Math.random() * 20);
    }
    
    let frameCount = 0;
    const maxFrames = 150;
    
    const matrixFrame = () => {
      let output = '';
      
      for (let i = 0; i < 20; i++) {
        for (let j = 0; j < columns; j++) {
          if (i === drops[j]) {
            output += chars[Math.floor(Math.random() * chars.length)];
          } else {
            output += ' ';
          }
        }
        output += '\n';
      }
      
      for (let i = 0; i < columns; i++) {
        if (drops[i] * 20 > 20 && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      
      setLines(prev => {
        const filtered = prev.filter(line => 
          !(line.type === 'output' && typeof line.content === 'string' && (line.content.includes('ﾊ') || line.content.includes('ﾐ')))
        );
        return [...filtered, { type: 'output', content: output, color: 'green' }];
      });
      
      frameCount++;
      if (frameCount < maxFrames && isRunning && runningCommand === 'matrix') {
        setTimeout(() => {
          animationFrameRef.current = requestAnimationFrame(matrixFrame);
        }, 50);
      } else if (frameCount >= maxFrames) {
        stopRunningProgram();
      }
    };
    
    matrixFrame();
  };

  const runSl = () => {
    const train = [
      '      ====        ________                ___________    ',
      '  _D _|  |_______/        \\__I_I_____===__|_________|   ',
      '   |(_)---  |   H\\________/ |   |        =|___ ___|     ',
      '   /     |  |   H  |  |     |   |         ||_| |_||     ',
      '  |      |  |   H  |__--------------------| [___] |     ',
      '  | ________|___H__/__|_____/[][]~\\_______|       |     ',
      '  |/ |   |-----------I_____I [][] []  D   |=======|____ ',
      '__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__|_',
      ' |/-=|___|=O=====O=====O=====O   |_____/~\\___/          ',
      '  \\_/      \\__/  \\__/  \\__/  \\__/      \\_/             ',
    ];
    
    setLines(prev => [...prev, 
      { type: 'output', content: '' },
      ...train.map(line => ({ type: 'output' as const, content: line, color: 'yellow' as const })),
      { type: 'output', content: '' },
    ]);
  };

  const runCowsay = (text: string) => {
    const message = text || 'Hello from the terminal!';
    const border = '_'.repeat(message.length + 2);
    
    setLines(prev => [...prev,
      { type: 'output', content: ` ${border}` },
      { type: 'output', content: `< ${message} >` },
      { type: 'output', content: ` ${'-'.repeat(message.length + 2)}` },
      { type: 'output', content: '        \\   ^__^' },
      { type: 'output', content: '         \\  (oo)\\_______' },
      { type: 'output', content: '            (__)\\       )\\/\\' },
      { type: 'output', content: '                ||----w |' },
      { type: 'output', content: '                ||     ||' },
      { type: 'output', content: '' },
    ]);
  };

  const runNeofetch = () => {
    setLines(prev => [...prev,
      { type: 'output', content: '       _,met$$$$$gg.          gene@portfolio', color: 'cyan' },
      { type: 'output', content: '    ,g$$$$$$$$$$$$$$$P.       ---------------', color: 'cyan' },
      { type: 'output', content: '  ,g$$P"     """Y$$.".        OS: Portfolio v1.0', color: 'cyan' },
      { type: 'output', content: ' ,$$P\'              `$$$.     Host: Vite + React + TypeScript', color: 'cyan' },
      { type: 'output', content: '\',$$P       ,ggs.     `$$b:   Kernel: Tailwind CSS + shadcn/ui', color: 'cyan' },
      { type: 'output', content: '`d$$\'     ,$P"\'   .    $$$    Uptime: Always online', color: 'cyan' },
      { type: 'output', content: ' $$P      d$\'     ,    $$P    Shell: portfolio-bash v1.0.0', color: 'cyan' },
      { type: 'output', content: ' $$:      $$.   -    ,d$$\'    Name: Geneustace Wicaksono', color: 'cyan' },
      { type: 'output', content: ' $$;      Y$b._   _,d$P\'      University: Cornell (ECE)', color: 'cyan' },
      { type: 'output', content: ' Y$$.    `.`"Y$$$$P"\'         Current: AWS Cryptography', color: 'cyan' },
      { type: 'output', content: ' `$$b      "-.__              Location: Ithaca, NY', color: 'cyan' },
      { type: 'output', content: '  `Y$$                        Origin: Jakarta', color: 'cyan' },
      { type: 'output', content: '   `Y$$.                      Email: gjw62@cornell.edu', color: 'cyan' },
      { type: 'output', content: '     `$$b.                    ', color: 'cyan' },
      { type: 'output', content: '       `Y$$b.                 ', color: 'cyan' },
      { type: 'output', content: '          `"Y$b._             ', color: 'cyan' },
      { type: 'output', content: '              `"""            ', color: 'cyan' },
      { type: 'output', content: '' },
    ]);
  };

  const runTree = (depth: string = '.') => {
    if (depth === 'projects' || depth === './projects') {
      setLines(prev => [...prev,
        { type: 'output', content: 'projects/', color: 'cyan' },
        { type: 'output', content: '├── all-projects.tsx', color: 'blue' },
        { type: 'output', content: '├── 1/', color: 'cyan' },
        { type: 'output', content: '│   └── ai-research-platform.md', color: 'blue' },
        { type: 'output', content: '├── 2/', color: 'cyan' },
        { type: 'output', content: '│   └── smart-home-automation.md', color: 'blue' },
        { type: 'output', content: '├── 3/', color: 'cyan' },
        { type: 'output', content: '│   └── robotics-vision-system.md', color: 'blue' },
        { type: 'output', content: '└── 4/', color: 'cyan' },
        { type: 'output', content: '    └── cloud-infrastructure.md', color: 'blue' },
        { type: 'output', content: '' },
      ]);
    } else {
      setLines(prev => [...prev,
        { type: 'output', content: '.', color: 'cyan' },
        { type: 'output', content: '├── about.tsx', color: 'blue' },
        { type: 'output', content: '├── awards.tsx', color: 'blue' },
        { type: 'output', content: '├── contact.md', color: 'green' },
        { type: 'output', content: '├── experience.json', color: 'yellow' },
        { type: 'output', content: '├── me.rs', color: 'red' },
        { type: 'output', content: '├── pictures/', color: 'cyan' },
        { type: 'output', content: '│   └── gallery.tsx', color: 'blue' },
        { type: 'output', content: '├── projects/', color: 'cyan' },
        { type: 'output', content: '│   └── all-projects.tsx', color: 'blue' },
        { type: 'output', content: '└── resume.pdf', color: 'red' },
        { type: 'output', content: '' },
      ]);
    }
  };

  const runProjects = () => {
    setLines(prev => [...prev,
      { type: 'output', content: '📁 Available Projects:', color: 'cyan' },
      { type: 'output', content: '' },
      ...projects.map(p => ({ 
        type: 'output' as const, 
        content: `  ${p.id}. ${p.name}`, 
        color: 'blue' as const 
      })),
      { type: 'output', content: '' },
      { type: 'output', content: 'Use "open-project <id>" to open a project', color: 'green' },
      { type: 'output', content: '' },
    ]);
  };

  const runOpenProject = (id: string) => {
    const projectId = parseInt(id);
    const project = projects.find(p => p.id === projectId);
    
    if (project) {
      onFileOpen(`/projects/${projectId}`, `${project.name.toLowerCase().replace(/\s+/g, '-')}.md`);
      setLines(prev => [...prev,
        { type: 'output', content: `Opening project: ${project.name}...` },
        { type: 'output', content: '' },
      ]);
    } else {
      setLines(prev => [...prev,
        { type: 'error', content: `open-project: invalid project id: ${id}` },
        { type: 'output', content: 'Use "projects" to see available projects' },
        { type: 'output', content: '' },
      ]);
    }
  };

  const runCat = (fileName: string) => {
    const fileContents: Record<string, { content: string; language: string }> = {
      'contact.md': {
        language: 'markdown',
        content: `# Contact Information

📧 Email: gjw62@cornell.edu
📍 Location: Ithaca, NY
🔗 GitHub: github.com/SentientPlatypus`
      },
      'about.tsx': {
        language: 'typescript',
        content: `export const aboutData = {
  name: "Gene",
  fullName: "Geneustace Wicaksono",
  title: "Electrical & Computer Engineering Student",
  university: "Cornell University",
  currentPosition: "AWS Cryptography",
  location: "Ithaca, NY",
  origin: "Jakarta",
  bio: [
    "From Jakarta, but lived most of my life in Ithaca NY.",
    "I moved back for a family thing, but I hope to stay in the States!",
    "All the worthwhile things I do have been influenced by amazing people.",
    "If you have a good idea and need people to run with it, contact me!"
  ],
  email: "gjw62@cornell.edu"
};`
      },
      'me.rs': {
        language: 'rust',
        content: `let mut me = Dev {
  name: String::from("Gene"),
  age: 19
};

me.`
      }
    };

    const file = fileContents[fileName];
    if (file) {
      setLines(prev => [...prev,
        { 
          type: 'syntax', 
          content: (
            <SyntaxHighlighter
              language={file.language}
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                padding: '0.5rem',
                background: 'transparent',
                fontSize: '0.8125rem'
              }}
            >
              {file.content}
            </SyntaxHighlighter>
          )
        },
        { type: 'output', content: '' },
      ]);
    } else {
      setLines(prev => [...prev,
        { type: 'error', content: `cat: ${fileName}: File cannot be displayed in terminal` },
        { type: 'output', content: 'Use "open" command to view in editor' },
        { type: 'output', content: '' },
      ]);
    }
  };

  const getCommandSuggestions = (partial: string): string[] => {
    const allCommands = [
      'help', 'ls', 'cd', 'cat', 'open', 'whoami', 'contact', 'theme',
      'clear', 'pwd', 'echo', 'donut', 'matrix', 'sl', 'cowsay', 'sudo',
      'neofetch', 'tree', 'projects', 'open-project', 'date', 'history', 'exit'
    ];
    
    return allCommands.filter(cmd => cmd.startsWith(partial.toLowerCase()));
  };

  const getFileSuggestions = (partial: string): string[] => {
    return Object.keys(files).filter(file => file.startsWith(partial));
  };

  const handleTab = () => {
    const parts = input.trim().split(' ');
    
    if (parts.length === 1) {
      const suggestions = getCommandSuggestions(parts[0]);
      if (suggestions.length === 1) {
        setInput(suggestions[0] + ' ');
      } else if (suggestions.length > 1) {
        setLines(prev => [...prev,
          { type: 'output', content: suggestions.join('  '), color: 'cyan' },
        ]);
      }
    } else if (parts.length === 2 && ['cat', 'open'].includes(parts[0])) {
      const suggestions = getFileSuggestions(parts[1]);
      if (suggestions.length === 1) {
        setInput(parts[0] + ' ' + suggestions[0]);
      } else if (suggestions.length > 1) {
        setLines(prev => [...prev,
          { type: 'output', content: suggestions.join('  '), color: 'cyan' },
        ]);
      }
    }
  };

  const executeCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim();
    const parts = trimmedCmd.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    setLines(prev => [...prev, { type: 'command', content: `${currentPath} $ ${trimmedCmd}` }]);

    switch (command) {
      case 'help':
        setLines(prev => [...prev,
          { type: 'output', content: '╔══════════════════════════════════════════════════════════════╗', color: 'cyan' },
          { type: 'output', content: '║                    AVAILABLE COMMANDS                        ║', color: 'cyan' },
          { type: 'output', content: '╚══════════════════════════════════════════════════════════════╝', color: 'cyan' },
          { type: 'output', content: '' },
          { type: 'output', content: '📂 File Operations:', color: 'yellow' },
          { type: 'output', content: '  ls                - List files and directories' },
          { type: 'output', content: '  cd <dir>          - Change directory' },
          { type: 'output', content: '  cat <file>        - Display file contents (with syntax highlighting)' },
          { type: 'output', content: '  open <file>       - Open a file in the editor' },
          { type: 'output', content: '  pwd               - Print working directory' },
          { type: 'output', content: '  tree [dir]        - Display directory tree' },
          { type: 'output', content: '' },
          { type: 'output', content: '👤 Information:', color: 'yellow' },
          { type: 'output', content: '  whoami            - Display current user info' },
          { type: 'output', content: '  contact           - Show contact information' },
          { type: 'output', content: '  neofetch          - Display system information' },
          { type: 'output', content: '' },
          { type: 'output', content: '🎨 Customization:', color: 'yellow' },
          { type: 'output', content: '  theme [name]      - Change color theme' },
          { type: 'output', content: '' },
          { type: 'output', content: '🎮 Fun Stuff:', color: 'yellow' },
          { type: 'output', content: '  donut             - Spinning ASCII donut (Ctrl+C to stop)' },
          { type: 'output', content: '  matrix            - Matrix digital rain' },
          { type: 'output', content: '  sl                - Steam locomotive' },
          { type: 'output', content: '  cowsay [text]     - Cowsay' },
          { type: 'output', content: '' },
          { type: 'output', content: '📁 Projects:', color: 'yellow' },
          { type: 'output', content: '  projects          - List all projects' },
          { type: 'output', content: '  open-project <id> - Open a specific project' },
          { type: 'output', content: '' },
          { type: 'output', content: '🔧 System:', color: 'yellow' },
          { type: 'output', content: '  clear             - Clear terminal' },
          { type: 'output', content: '  echo <text>       - Echo text to terminal' },
          { type: 'output', content: '  date              - Display current date and time' },
          { type: 'output', content: '  history           - Show command history' },
          { type: 'output', content: '  sudo              - Do as I say!' },
          { type: 'output', content: '  exit              - Exit terminal' },
          { type: 'output', content: '' },
          { type: 'output', content: '💡 Tips:', color: 'green' },
          { type: 'output', content: '  • Press Tab for command/file completion' },
          { type: 'output', content: '  • Use ↑/↓ arrows to navigate command history' },
          { type: 'output', content: '  • Press Ctrl+C to stop running programs' },
          { type: 'output', content: '' },
        ]);
        break;

      case 'ls':
        setLines(prev => [...prev,
          { type: 'output', content: 'about.tsx          contact.md         experience.json', color: 'blue' },
          { type: 'output', content: 'projects/          pictures/          awards.tsx', color: 'cyan' },
          { type: 'output', content: 'resume.pdf         me.rs', color: 'mixed' },
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
        } else {
          const fileName = args[0].replace('./', '');
          runCat(fileName);
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

      case 'donut':
        runDonut();
        break;

      case 'matrix':
        runMatrix();
        break;

      case 'sl':
        runSl();
        break;

      case 'cowsay':
        runCowsay(args.join(' '));
        break;

      case 'sudo':
        if (args.length === 0) {
          setLines(prev => [...prev,
            { type: 'output', content: 'sudo: missing command' },
            { type: 'output', content: '' },
          ]);
        } else {
          setLines(prev => [...prev,
            { type: 'output', content: `[sudo] password for gene: `, color: 'yellow' },
            { type: 'output', content: 'Nice try! This is a portfolio site, not a real terminal 😄', color: 'cyan' },
            { type: 'output', content: '' },
          ]);
        }
        break;

      case 'neofetch':
        runNeofetch();
        break;

      case 'tree':
        runTree(args[0]);
        break;

      case 'projects':
        runProjects();
        break;

      case 'open-project':
        if (args.length === 0) {
          setLines(prev => [...prev,
            { type: 'error', content: 'open-project: missing project id' },
            { type: 'output', content: 'Usage: open-project <id>' },
            { type: 'output', content: '' },
          ]);
        } else {
          runOpenProject(args[0]);
        }
        break;

      case 'date':
        setLines(prev => [...prev,
          { type: 'output', content: new Date().toString() },
          { type: 'output', content: '' },
        ]);
        break;

      case 'history':
        if (history.length === 0) {
          setLines(prev => [...prev,
            { type: 'output', content: 'No command history yet' },
            { type: 'output', content: '' },
          ]);
        } else {
          setLines(prev => [...prev,
            ...history.map((cmd, i) => ({ 
              type: 'output' as const, 
              content: `  ${i + 1}  ${cmd}` 
            })),
            { type: 'output', content: '' },
          ]);
        }
        break;

      case 'exit':
        setLines(prev => [...prev,
          { type: 'output', content: 'Goodbye! 👋' },
          { type: 'output', content: '' },
        ]);
        setTimeout(() => onClose(), 500);
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
    if (e.ctrlKey && e.key === 'c') {
      e.preventDefault();
      if (isRunning) {
        stopRunningProgram();
      } else {
        setLines(prev => [...prev,
          { type: 'command', content: `${currentPath} $ ${input}^C` },
          { type: 'output', content: '' },
        ]);
        setInput('');
      }
      return;
    }

    if (e.key === 'Enter') {
      if (isRunning) return;
      
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
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (!isRunning) {
        handleTab();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (isRunning) return;
      
      if (history.length > 0) {
        const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (isRunning) return;
      
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
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleTerminalClick = () => {
    if (!isRunning) {
      inputRef.current?.focus();
    }
  };

  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsResizing(true);
    
    const startY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const startHeight = height;
    
    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      const currentY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;
      const delta = startY - currentY;
      const newHeight = Math.min(Math.max(startHeight + delta, 150), 800);
      setHeight(newHeight);
      localStorage.setItem('terminal-height', newHeight.toString());
    };
    
    const handleEnd = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    };
    
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove);
    document.addEventListener('touchend', handleEnd);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="border-t flex flex-col" 
      style={{ height: `${height}px`, background: 'var(--theme-terminal)', borderColor: 'var(--theme-border)' }}
    >
      <div 
        className="terminal-resize-handle h-1 bg-transparent hover:bg-[var(--theme-statusBar)] active:bg-[var(--theme-statusBar)] cursor-ns-resize"
        onMouseDown={handleResizeStart}
        onTouchStart={handleResizeStart}
      />
      <div className="h-9 border-b flex items-center justify-between px-3" style={{ background: 'var(--theme-sidebar)', borderColor: 'var(--theme-border)' }}>
        <div className="flex items-center gap-2 text-[13px]" style={{ color: 'var(--theme-foreground)' }}>
          <TerminalIcon className="w-4 h-4" />
          <span>bash</span>
          {isRunning && <span style={{ color: 'var(--theme-method)' }}>● running {runningCommand}</span>}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLines([])}
            className="hover:bg-[rgba(255,255,255,0.1)] p-1 rounded"
            style={{ color: 'var(--theme-foreground)' }}
            title="Clear terminal"
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            onClick={onClose}
            className="hover:bg-[rgba(255,255,255,0.1)] p-1 rounded"
            style={{ color: 'var(--theme-foreground)' }}
            title="Close terminal"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div 
        ref={terminalRef} 
        className="flex-1 overflow-y-auto p-2 font-mono text-[13px] cursor-text vscode-scrollbar"
        onClick={handleTerminalClick}
      >
        {lines.map((line, index) => {
          let colorClass = 'text-[#cccccc]';
          if (line.type === 'command') colorClass = 'text-[#4ec9b0]';
          if (line.type === 'error') colorClass = 'text-[#f48771]';
          if (line.color === 'blue') colorClass = 'text-[#569cd6]';
          if (line.color === 'cyan') colorClass = 'text-[#4ec9b0]';
          if (line.color === 'red') colorClass = 'text-[#f48771]';
          if (line.color === 'green') colorClass = 'text-[#6a9955]';
          if (line.color === 'yellow') colorClass = 'text-[#dcdcaa]';
          
          if (line.type === 'syntax') {
            return <div key={index}>{line.content}</div>;
          }
          
          return (
            <div key={index} className={colorClass} style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {line.content}
            </div>
          );
        })}
        
        {!isRunning && (
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
              disabled={isRunning}
            />
          </div>
        )}
      </div>
    </div>
  );
};
