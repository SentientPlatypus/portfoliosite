import { Search as SearchIcon, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SearchResult {
  file: string;
  line: number;
  content: string;
  match: string;
}

interface SearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onResultClick: (path: string, line: number) => void;
}

export const SearchPanel = ({ isOpen, onClose, onResultClick }: SearchPanelProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Searchable content database
  const searchableContent = [
    { path: '/portfolio/about.tsx', content: 'Geneustace Wicaksono Electrical Computer Engineering Cornell University AWS Cryptography Jakarta Ithaca' },
    { path: '/portfolio/experience.json', content: 'AWS Cryptography Cornell FRC Robotics Code Red Makeathon Software Developer Intern' },
    { path: '/portfolio/projects/all-projects.tsx', content: 'FourierMesh Spinphony GroovyAR Indonesian Coconut QuantJL SeeRound LockD Python Blender RLGYM PyTorch Julia React TypeScript' },
    { path: '/portfolio/contact.md', content: 'gjw62@cornell.edu Ithaca NY freelance collaboration open source email' },
    { path: '/me.rs', content: 'Dev Gene Rust portfolio welcome student engineer' },
  ];

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    const searchTimeout = setTimeout(() => {
      const queryLower = query.toLowerCase();
      const foundResults: SearchResult[] = [];

      searchableContent.forEach(({ path, content }) => {
        const contentLower = content.toLowerCase();
        const words = content.split(' ');
        
        words.forEach((word, index) => {
          if (word.toLowerCase().includes(queryLower)) {
            const contextStart = Math.max(0, index - 3);
            const contextEnd = Math.min(words.length, index + 4);
            const context = words.slice(contextStart, contextEnd).join(' ');
            
            foundResults.push({
              file: path,
              line: index + 1,
              content: context,
              match: word,
            });
          }
        });
      });

      setResults(foundResults.slice(0, 50)); // Limit to 50 results
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="w-80 border-r flex flex-col h-full" style={{ background: 'var(--theme-sidebar)', borderColor: 'var(--theme-border)' }}>
      <div className="p-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--theme-border)' }}>
        <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-foreground)' }}>Search</h3>
        <button
          onClick={onClose}
          className="hover:opacity-100 transition-opacity"
          style={{ color: 'var(--theme-foreground)', opacity: 0.6 }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3 border-b" style={{ borderColor: 'var(--theme-border)' }}>
        <div className="flex items-center gap-2 border rounded px-2 py-1.5" style={{ background: 'var(--theme-editor)', borderColor: 'var(--theme-border)' }}>
          <SearchIcon className="w-4 h-4" style={{ color: 'var(--theme-foreground)', opacity: 0.6 }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--theme-foreground)' }}
            autoFocus
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isSearching ? (
          <div className="p-4 text-center text-sm" style={{ color: 'var(--theme-foreground)', opacity: 0.6 }}>
            Searching...
          </div>
        ) : results.length === 0 && query ? (
          <div className="p-4 text-center text-sm" style={{ color: 'var(--theme-foreground)', opacity: 0.6 }}>
            No results found
          </div>
        ) : results.length === 0 ? (
          <div className="p-4 text-center text-sm" style={{ color: 'var(--theme-foreground)', opacity: 0.6 }}>
            Type to search across all files
          </div>
        ) : (
          <div className="text-xs">
            <div className="px-3 py-2 uppercase tracking-wider" style={{ color: 'var(--theme-foreground)', opacity: 0.6 }}>
              {results.length} result{results.length !== 1 ? 's' : ''} in {new Set(results.map(r => r.file)).size} file{new Set(results.map(r => r.file)).size !== 1 ? 's' : ''}
            </div>
            {results.map((result, index) => (
              <div
                key={index}
                className="px-3 py-2 cursor-pointer border-l-2 transition-colors"
                style={{ borderColor: 'transparent' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--theme-editor)';
                  e.currentTarget.style.borderColor = 'var(--theme-statusBar)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
                onClick={() => {
                  onResultClick(result.file, result.line);
                  onClose();
                }}
              >
                <div className="font-mono text-xs mb-1 truncate" style={{ color: 'var(--theme-foreground)' }}>
                  {result.file.split('/').pop()}
                </div>
                <div className="text-xs" style={{ color: 'var(--theme-foreground)', opacity: 0.6 }}>
                  <span style={{ opacity: 1 }}>{result.line}</span>: {result.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
