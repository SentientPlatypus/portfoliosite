import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ActivityBar } from './ActivityBar';
import { FileExplorer } from './FileExplorer';
import { CommandPalette } from './CommandPalette';
import { IntegratedTerminal } from './IntegratedTerminal';
import { EnhancedStatusBar } from './EnhancedStatusBar';
import { Breadcrumbs } from './Breadcrumbs';
import { EditorTabs } from './EditorTabs';
import { FileContentRenderer } from './FileContentRenderer';
import { ThemeProvider, useTheme } from './ThemeProvider';
import { Minimap } from './Minimap';
import { BootAnimation } from './BootAnimation';
import { SearchPanel } from './SearchPanel';
import { ViewModeToggle } from './ViewModeToggle';
import { GitGraphTimeline } from './GitGraphTimeline';
import { Settings } from './Settings';
import { X } from 'lucide-react';

interface Tab {
  id: string;
  path: string;
  name: string;
  isDirty: boolean;
}

const CodeEditorInner = () => {
  const { theme, setTheme } = useTheme();
  const [showBoot, setShowBoot] = useState(true);
  const [activeView, setActiveView] = useState<'explorer' | 'search' | 'git' | 'settings' | 'terminal'>('explorer');
  const [isExplorerOpen, setIsExplorerOpen] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isGitOpen, setIsGitOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'source' | 'preview'>('preview');
  const [tabs, setTabs] = useState<Tab[]>([
    { id: 'me.rs', path: '/me.rs', name: 'me.rs', isDirty: false }
  ]);
  const [activeTab, setActiveTab] = useState('me.rs');
  const [lineNumber, setLineNumber] = useState(1);
  const [columnNumber, setColumnNumber] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    // Check if boot animation has been seen
    const hasSeenBoot = sessionStorage.getItem('hasSeenBoot');
    const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');
    if (hasSeenBoot && hasSeenWelcome) {
      setShowBoot(false);
      // Returning visitors land on About directly
      const timer = setTimeout(() => {
        if (tabs.length === 1 && tabs[0].path === '/me.rs') {
          handleFileSelect('/portfolio/about.tsx', 'about.tsx');
        }
      }, 200);
      return () => clearTimeout(timer);
    } else if (hasSeenBoot) {
      setShowBoot(false);
    }
  }, [tabs]);

  const handleBootComplete = () => {
    sessionStorage.setItem('hasSeenBoot', 'true');
    setShowBoot(false);
  };

  const handleTypingComplete = () => {
    handleFileSelect('/portfolio/about.tsx', 'about.tsx');
  };

  const handleSearchResultClick = (path: string, name: string) => {
    handleFileSelect(path, name);
  };

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsExplorerOpen(false);
        setIsSearchOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command Palette: Cmd/Ctrl+P or Cmd/Ctrl+K
      if ((e.metaKey || e.ctrlKey) && (e.key === 'p' || e.key === 'k')) {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      
      // Toggle Terminal: Ctrl+`
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        setTerminalOpen(prev => !prev);
      }
      
      // Toggle Sidebar: Cmd/Ctrl+B
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setIsExplorerOpen(prev => !prev);
      }
      
      // Toggle Search: Cmd/Ctrl+Shift+F
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'f') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
        setActiveView('search');
      }
      
      // Close Tab: Cmd/Ctrl+W
      if ((e.metaKey || e.ctrlKey) && e.key === 'w') {
        e.preventDefault();
        if (tabs.length > 1) {
          handleTabClose(activeTab);
        }
      }
      
      // Next Tab: Cmd/Ctrl+Tab
      if ((e.metaKey || e.ctrlKey) && e.key === 'Tab') {
        e.preventDefault();
        const currentIndex = tabs.findIndex(t => t.id === activeTab);
        const nextIndex = (currentIndex + 1) % tabs.length;
        setActiveTab(tabs[nextIndex].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, tabs]);

  const handleFileSelect = (path: string, name: string) => {
    const existingTab = tabs.find(t => t.path === path);
    
    if (existingTab) {
      setActiveTab(existingTab.id);
    } else {
      const newTab: Tab = {
        id: path,
        path,
        name,
        isDirty: false
      };
      setTabs(prev => [...prev, newTab]);
      setActiveTab(newTab.id);
    }
    
    // Close explorer on mobile after selection
    if (isMobile) {
      setIsExplorerOpen(false);
    }
    
    // Reset view mode to preview when opening a new file
    setViewMode('preview');
  };

  const handleTabClose = (tabId: string) => {
    if (tabs.length === 1) return; // Don't close the last tab
    
    const tabIndex = tabs.findIndex(t => t.id === tabId);
    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);
    
    // If closing active tab, switch to adjacent tab
    if (activeTab === tabId) {
      const newActiveIndex = Math.max(0, tabIndex - 1);
      setActiveTab(newTabs[newActiveIndex].id);
    }
  };

  const handlePictureClick = (picture: { id: string; title: string; description: string; imageUrl: string }) => {
    handleFileSelect(`/picture/${picture.id}`, picture.title);
  };
  
  const handleProjectClick = (project: any) => {
    const fileName = `${project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}.md`;
    handleFileSelect(`/projects/${project.id}`, fileName);
  };

  const currentTab = tabs.find(t => t.id === activeTab);
  const currentPath = currentTab?.path || '';
  const currentLanguage = currentTab?.name.split('.').pop()?.toUpperCase() || 'TEXT';

  // Update scroll measurements
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const updateMeasurements = () => {
      setContainerHeight(editor.clientHeight);
      setContentHeight(editor.scrollHeight);
    };

    updateMeasurements();
    const resizeObserver = new ResizeObserver(updateMeasurements);
    resizeObserver.observe(editor);

    return () => resizeObserver.disconnect();
  }, [activeTab]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const handleMinimapScroll = (position: number) => {
    if (editorRef.current) {
      editorRef.current.scrollTop = position;
    }
  };

  return (
    <div 
      className="h-screen flex flex-col font-mono overflow-hidden"
      style={{
        height: '100dvh',
        background: `var(--theme-background)`,
        color: `var(--theme-foreground)`,
      }}
    >
      {/* VS Code Title Bar */}
      <div 
        className="h-8 flex items-center px-2 select-none"
        style={{ background: 'var(--theme-titleBar)', borderBottom: `1px solid var(--theme-border)` }}
      >
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
            <div className="w-3 h-3 rounded-full bg-[#27ca3f]"></div>
          </div>
          <span className="text-xs ml-4 hidden sm:inline" style={{ color: 'var(--theme-foreground)' }}>
            Gene's Portfolio - Visual Studio Code
          </span>
        </div>
      </div>

      {/* Menu Bar */}
      <div 
        className="h-8 hidden md:flex items-center px-4"
        style={{ background: 'var(--theme-menuBar)', borderBottom: `1px solid var(--theme-border)` }}
      >
        <div className="flex items-center space-x-4 text-xs" style={{ color: 'var(--theme-foreground)' }}>
          <span className="hover:opacity-80 cursor-pointer">File</span>
          <span className="hover:opacity-80 cursor-pointer">Edit</span>
          <span className="hover:opacity-80 cursor-pointer">View</span>
          <span className="hover:opacity-80 cursor-pointer">Go</span>
          <span className="hover:opacity-80 cursor-pointer">Run</span>
          <span className="hover:opacity-80 cursor-pointer">Terminal</span>
          <span className="hover:opacity-80 cursor-pointer">Help</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Activity Bar */}
        {!isMobile && (
          <ActivityBar activeView={activeView} onViewChange={(view) => {
            setActiveView(view);
            if (view === 'terminal') {
              setTerminalOpen(true);
              setIsSearchOpen(false);
              setIsGitOpen(false);
            } else if (view === 'explorer') {
              setIsExplorerOpen(true);
              setIsSearchOpen(false);
              setIsGitOpen(false);
            } else if (view === 'search') {
              setIsSearchOpen(true);
              setIsExplorerOpen(false);
              setIsGitOpen(false);
            } else if (view === 'git') {
              setIsGitOpen(true);
              setIsExplorerOpen(false);
              setIsSearchOpen(false);
              setIsSettingsOpen(false);
            } else if (view === 'settings') {
              setIsSettingsOpen(true);
              handleFileSelect('/settings', 'Settings');
              setIsExplorerOpen(false);
              setIsSearchOpen(false);
              setIsGitOpen(false);
            }
          }} />
        )}

        {/* File Explorer Sidebar */}
        {isExplorerOpen && !isMobile && (
          <FileExplorer
            onFileSelect={handleFileSelect}
            selectedFile={currentPath}
          />
        )}
        
        {/* Search Panel */}
        {isSearchOpen && !isMobile && (
          <SearchPanel
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
            onResultClick={handleSearchResultClick}
          />
        )}
        
        {/* Git Panel */}
        {isGitOpen && !isMobile && (
          <div className="w-80 bg-[var(--theme-sidebar)] border-r border-[var(--theme-border)] flex flex-col h-full overflow-y-auto">
            <div className="p-3 border-b border-[var(--theme-border)] flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-foreground)' }}>Source Control</h3>
              <button
                onClick={() => setIsGitOpen(false)}
                className="hover:opacity-80 transition-opacity"
                style={{ color: 'var(--theme-foreground)' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <GitGraphTimeline />
          </div>
        )}
        
        {/* Mobile Explorer Drawer */}
        {isExplorerOpen && isMobile && (
          <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setIsExplorerOpen(false)}>
            <div 
              className="w-64 h-full bg-[var(--theme-sidebar)] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-14 flex items-center justify-between px-4 border-b border-[var(--theme-border)]">
                <span className="font-semibold text-[#cccccc]">Explorer</span>
                <button onClick={() => setIsExplorerOpen(false)}>
                  <X className="w-5 h-5 text-[#cccccc]" />
                </button>
              </div>
              <FileExplorer
                onFileSelect={handleFileSelect}
                selectedFile={currentPath}
              />
            </div>
          </div>
        )}

        {/* Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Tabs */}
          <EditorTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabClick={setActiveTab}
            onTabClose={handleTabClose}
          />

          {/* Breadcrumbs */}
          <div className="flex items-center justify-between">
            <Breadcrumbs path={currentPath} fileName={currentTab?.name} />
            {/* View Mode Toggle for applicable files */}
            {(currentPath.includes('.tsx') || currentPath.includes('.md')) && (
              <div className="pr-4">
                <ViewModeToggle mode={viewMode} onModeChange={setViewMode} />
              </div>
            )}
          </div>

          {/* Editor Content */}
          <div className="flex-1 flex overflow-hidden min-h-0">
            {/* Main Editor with Line Numbers */}
            <div 
              ref={editorRef}
              className="flex-1 overflow-auto vscode-scrollbar"
              style={{ background: 'var(--theme-editor)' }}
              onScroll={handleScroll}
            >
              <div className="flex">
                {/* Line numbers (scrolls with content) */}
                <div 
                  className="w-12 flex-shrink-0 select-none sticky left-0"
                  style={{ 
                    background: 'var(--theme-editor)',
                    borderRight: '1px solid var(--theme-border)',
                  }}
                >
                  <div className="text-xs text-right p-2 leading-6" style={{ color: 'var(--theme-foreground)', opacity: 0.4 }}>
                    {Array.from({ length: 50 }, (_, i) => (
                      <div key={i + 1}>{i + 1}</div>
                    ))}
                  </div>
                </div>

                {/* File Content */}
                <div className="flex-1 min-w-0">
                  <FileContentRenderer
                    path={currentPath}
                    theme={theme}
                    onPictureClick={handlePictureClick}
                    onProjectClick={handleProjectClick}
                    viewMode={viewMode}
                    onTypingComplete={handleTypingComplete}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Terminal */}
          {terminalOpen && (
            <IntegratedTerminal
              isOpen={terminalOpen}
              onClose={() => setTerminalOpen(false)}
              onFileOpen={handleFileSelect}
              onThemeChange={setTheme}
            />
          )}
        </div>
      </div>

      {/* Status Bar */}
      <EnhancedStatusBar
        currentFile={currentTab?.name || ''}
        lineNumber={lineNumber}
        columnNumber={columnNumber}
        language={currentLanguage}
        theme={theme.name}
      />

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onFileOpen={handleFileSelect}
        onThemeChange={setTheme}
        onTerminalOpen={() => setTerminalOpen(true)}
        currentTheme={theme.id}
      />

      {/* Mobile FAB for command palette */}
      {isMobile && !commandPaletteOpen && (
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-[var(--theme-statusBar)] text-white shadow-lg flex items-center justify-center z-30"
        >
          <span className="text-2xl">⌘</span>
        </button>
      )}

      {/* Mobile menu button */}
      {isMobile && !isExplorerOpen && (
        <button
          onClick={() => setIsExplorerOpen(true)}
          className="fixed bottom-4 right-4 w-14 h-14 rounded-full bg-[var(--theme-statusBar)] text-white shadow-lg flex items-center justify-center z-30"
        >
          <span className="text-xl">☰</span>
        </button>
      )}
    </div>
  );
};

export const CodeEditor = () => {
  return (
    <ThemeProvider>
      <CodeEditorInner />
    </ThemeProvider>
  );
};
