import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Theme {
  id: string;
  name: string;
  colors: {
    background: string;
    foreground: string;
    editor: string;
    sidebar: string;
    activityBar: string;
    statusBar: string;
    border: string;
    keyword: string;
    string: string;
    number: string;
    comment: string;
    variable: string;
    method: string;
    type: string;
  };
}

const themes: Record<string, Theme> = {
  'dark-plus': {
    id: 'dark-plus',
    name: 'Dark+ (default dark)',
    colors: {
      background: '#1e1e1e',
      foreground: '#d4d4d4',
      editor: '#1e1e1e',
      sidebar: '#252526',
      activityBar: '#333333',
      statusBar: '#007acc',
      border: '#2d2d30',
      keyword: '#569cd6',
      string: '#ce9178',
      number: '#b5cea8',
      comment: '#6a9955',
      variable: '#9cdcfe',
      method: '#dcdcaa',
      type: '#4ec9b0',
    },
  },
  'monokai': {
    id: 'monokai',
    name: 'Monokai',
    colors: {
      background: '#272822',
      foreground: '#f8f8f2',
      editor: '#272822',
      sidebar: '#222218',
      activityBar: '#1e1f1c',
      statusBar: '#75715e',
      border: '#3e3d32',
      keyword: '#f92672',
      string: '#e6db74',
      number: '#ae81ff',
      comment: '#75715e',
      variable: '#f8f8f2',
      method: '#a6e22e',
      type: '#66d9ef',
    },
  },
  'github-dark': {
    id: 'github-dark',
    name: 'GitHub Dark',
    colors: {
      background: '#0d1117',
      foreground: '#c9d1d9',
      editor: '#0d1117',
      sidebar: '#161b22',
      activityBar: '#1c2128',
      statusBar: '#1f6feb',
      border: '#30363d',
      keyword: '#ff7b72',
      string: '#a5d6ff',
      number: '#79c0ff',
      comment: '#8b949e',
      variable: '#ffa657',
      method: '#d2a8ff',
      type: '#7ee787',
    },
  },
  'dracula': {
    id: 'dracula',
    name: 'Dracula',
    colors: {
      background: '#282a36',
      foreground: '#f8f8f2',
      editor: '#282a36',
      sidebar: '#21222c',
      activityBar: '#1e1f29',
      statusBar: '#bd93f9',
      border: '#44475a',
      keyword: '#ff79c6',
      string: '#f1fa8c',
      number: '#bd93f9',
      comment: '#6272a4',
      variable: '#f8f8f2',
      method: '#50fa7b',
      type: '#8be9fd',
    },
  },
  'nord': {
    id: 'nord',
    name: 'Nord',
    colors: {
      background: '#2e3440',
      foreground: '#d8dee9',
      editor: '#2e3440',
      sidebar: '#3b4252',
      activityBar: '#2e3440',
      statusBar: '#5e81ac',
      border: '#3b4252',
      keyword: '#81a1c1',
      string: '#a3be8c',
      number: '#b48ead',
      comment: '#616e88',
      variable: '#d8dee9',
      method: '#88c0d0',
      type: '#8fbcbb',
    },
  },
  'solarized-dark': {
    id: 'solarized-dark',
    name: 'Solarized Dark',
    colors: {
      background: '#002b36',
      foreground: '#839496',
      editor: '#002b36',
      sidebar: '#073642',
      activityBar: '#002b36',
      statusBar: '#268bd2',
      border: '#073642',
      keyword: '#859900',
      string: '#2aa198',
      number: '#d33682',
      comment: '#586e75',
      variable: '#93a1a1',
      method: '#b58900',
      type: '#cb4b16',
    },
  },
};

interface ThemeContextType {
  theme: Theme;
  setTheme: (themeId: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: themes['dark-plus'],
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes['dark-plus']);

  const setTheme = (themeId: string) => {
    if (themes[themeId]) {
      setCurrentTheme(themes[themeId]);
      localStorage.setItem('editor-theme', themeId);
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('editor-theme');
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(themes[savedTheme]);
    }
  }, []);

  useEffect(() => {
    // Apply theme colors as CSS variables
    const root = document.documentElement;
    Object.entries(currentTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--theme-${key}`, value);
    });
  }, [currentTheme]);

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
