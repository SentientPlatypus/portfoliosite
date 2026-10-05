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
    { path: '/portfolio/about.tsx', content: 'Geneustace Wicaksono Electrical Computer Engineering Cornell University AWS Cryptography Jakarta Ithaca robotics AI ML' },
    { path: '/portfolio/experience.json', content: 'AWS Cryptography Cornell FRC Robotics Code Red Makeathon' },
    { path: '/portfolio/projects/all-projects.tsx', content: 'FourierMesh Spinphony GroovyAR Indonesian Coconut QuantJL SeeRound LockD Python Blender RLGYM PyTorch Julia React' },
    { path: '/portfolio/contact.md', content: 'gjw62@cornell.edu Ithaca NY freelance collaboration open source' },
    { path: '/me.rs', content: 'Dev Gene Rust portfolio welcome' },
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
    <div className="w-80 bg-[var(--theme-sidebar)] border-r border-[var(--theme-border)] flex flex-col h-full">
      <div className="p-3 border-b border-[var(--theme-border)] flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#cccccc] uppercase tracking-wider">Search</h3>
        <button
          onClick={onClose}
          className="text-[#858585] hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3 border-b border-[var(--theme-border)]">
        <div className="flex items-center gap-2 bg-[var(--theme-editor)] border border-[var(--theme-border)] rounded px-2 py-1.5">
          <SearchIcon className="w-4 h-4 text-[#858585]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#858585]"
            autoFocus
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isSearching ? (
          <div className="p-4 text-center text-[#858585] text-sm">
            Searching...
          </div>
        ) : results.length === 0 && query ? (
          <div className="p-4 text-center text-[#858585] text-sm">
            No results found
          </div>
        ) : results.length === 0 ? (
          <div className="p-4 text-center text-[#858585] text-sm">
            Type to search across all files
          </div>
        ) : (
          <div className="text-xs">
            <div className="px-3 py-2 text-[#858585] uppercase tracking-wider">
              {results.length} result{results.length !== 1 ? 's' : ''} in {new Set(results.map(r => r.file)).size} file{new Set(results.map(r => r.file)).size !== 1 ? 's' : ''}
            </div>
            {results.map((result, index) => (
              <div
                key={index}
                className="px-3 py-2 hover:bg-[var(--theme-editor)] cursor-pointer border-l-2 border-transparent hover:border-[var(--theme-statusBar)] transition-colors"
                onClick={() => {
                  onResultClick(result.file, result.line);
                  onClose();
                }}
              >
                <div className="text-[#cccccc] font-mono text-xs mb-1 truncate">
                  {result.file.split('/').pop()}
                </div>
                <div className="text-[#858585] text-xs">
                  <span className="text-[#cccccc]">{result.line}</span>: {result.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
