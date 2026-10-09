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
    titleBar: string;
    menuBar: string;
    tab: string;
    tabActive: string;
    tabBorder: string;
    tabActiveBorder: string;
    breadcrumb: string;
    terminal: string;
    scrollbar: string;
    scrollbarHover: string;
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
      titleBar: '#323233',
      menuBar: '#2d2d30',
      tab: '#2d2d2e',
      tabActive: '#1e1e1e',
      tabBorder: '#252526',
      tabActiveBorder: '#007acc',
      breadcrumb: '#181818',
      terminal: '#1e1e1e',
      scrollbar: 'rgba(121, 121, 121, 0.4)',
      scrollbarHover: 'rgba(121, 121, 121, 0.7)',
    },
  },
  'monokai': {
    id: 'monokai',
    name: 'Monokai',
    colors: {
      background: '#272822',
      foreground: '#f8f8f2',
      editor: '#272822',
      sidebar: '#1e1f1c',
      activityBar: '#1a1b18',
      statusBar: '#75715e',
      border: '#3e3d32',
      keyword: '#f92672',
      string: '#e6db74',
      number: '#ae81ff',
      comment: '#75715e',
      variable: '#f8f8f2',
      method: '#a6e22e',
      type: '#66d9ef',
      titleBar: '#1a1b18',
      menuBar: '#1a1b18',
      tab: '#1a1b18',
      tabActive: '#272822',
      tabBorder: '#1e1f1c',
      tabActiveBorder: '#f92672',
      breadcrumb: '#1e1f1c',
      terminal: '#272822',
      scrollbar: 'rgba(154, 154, 154, 0.4)',
      scrollbarHover: 'rgba(154, 154, 154, 0.7)',
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
      activityBar: '#010409',
      statusBar: '#1f6feb',
      border: '#30363d',
      keyword: '#ff7b72',
      string: '#a5d6ff',
      number: '#79c0ff',
      comment: '#8b949e',
      variable: '#ffa657',
      method: '#d2a8ff',
      type: '#7ee787',
      titleBar: '#010409',
      menuBar: '#010409',
      tab: '#010409',
      tabActive: '#0d1117',
      tabBorder: '#21262d',
      tabActiveBorder: '#f78166',
      breadcrumb: '#010409',
      terminal: '#0d1117',
      scrollbar: 'rgba(110, 118, 129, 0.4)',
      scrollbarHover: 'rgba(110, 118, 129, 0.7)',
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
      activityBar: '#191a21',
      statusBar: '#bd93f9',
      border: '#44475a',
      keyword: '#ff79c6',
      string: '#f1fa8c',
      number: '#bd93f9',
      comment: '#6272a4',
      variable: '#f8f8f2',
      method: '#50fa7b',
      type: '#8be9fd',
      titleBar: '#191a21',
      menuBar: '#191a21',
      tab: '#191a21',
      tabActive: '#282a36',
      tabBorder: '#1e1f29',
      tabActiveBorder: '#bd93f9',
      breadcrumb: '#21222c',
      terminal: '#282a36',
      scrollbar: 'rgba(189, 147, 249, 0.3)',
      scrollbarHover: 'rgba(189, 147, 249, 0.6)',
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
      border: '#434c5e',
      keyword: '#81a1c1',
      string: '#a3be8c',
      number: '#b48ead',
      comment: '#616e88',
      variable: '#d8dee9',
      method: '#88c0d0',
      type: '#8fbcbb',
      titleBar: '#2e3440',
      menuBar: '#2e3440',
      tab: '#2e3440',
      tabActive: '#3b4252',
      tabBorder: '#2e3440',
      tabActiveBorder: '#88c0d0',
      breadcrumb: '#2e3440',
      terminal: '#2e3440',
      scrollbar: 'rgba(76, 86, 106, 0.4)',
      scrollbarHover: 'rgba(76, 86, 106, 0.7)',
    },
  },
  'solarized-dark': {
    id: 'solarized-dark',
    name: 'Solarized Dark',
    colors: {
      background: '#002b36',
      foreground: '#839496',
      editor: '#002b36',
      sidebar: '#00212b',
      activityBar: '#001e27',
      statusBar: '#268bd2',
      border: '#063642',
      keyword: '#859900',
      string: '#2aa198',
      number: '#d33682',
      comment: '#586e75',
      variable: '#93a1a1',
      method: '#b58900',
      type: '#cb4b16',
      titleBar: '#001e27',
      menuBar: '#001e27',
      tab: '#001e27',
      tabActive: '#002b36',
      tabBorder: '#00212b',
      tabActiveBorder: '#268bd2',
      breadcrumb: '#00212b',
      terminal: '#002b36',
      scrollbar: 'rgba(131, 148, 150, 0.3)',
      scrollbarHover: 'rgba(131, 148, 150, 0.6)',
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
