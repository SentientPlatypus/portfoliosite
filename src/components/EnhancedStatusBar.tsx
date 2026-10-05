import { useState, useEffect } from 'react';
import { GitBranch, Wifi, Bell, Zap, Clock } from 'lucide-react';

interface EnhancedStatusBarProps {
  currentFile: string;
  lineNumber: number;
  columnNumber: number;
  language: string;
  theme: string;
}

export const EnhancedStatusBar = ({ 
  currentFile, 
  lineNumber, 
  columnNumber, 
  language,
  theme 
}: EnhancedStatusBarProps) => {
  const [time, setTime] = useState(new Date());
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="h-6 bg-[var(--theme-statusBar)] flex items-center justify-between px-4 text-xs text-white shrink-0 select-none">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 hover:bg-white/10 px-2 py-0.5 rounded cursor-pointer transition-colors">
          <GitBranch className="w-3 h-3" />
          <span>main</span>
        </div>
        {!isMobile && (
          <>
            <div className="flex items-center gap-1.5 hover:bg-white/10 px-2 py-0.5 rounded cursor-pointer transition-colors">
              <Zap className="w-3 h-3" />
              <span>Auto Save</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Wifi className="w-3 h-3" />
            </div>
          </>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        {!isMobile && (
          <>
            <div className="hover:bg-white/10 px-2 py-0.5 rounded cursor-pointer transition-colors">
              Ln {lineNumber}, Col {columnNumber}
            </div>
            <div className="hover:bg-white/10 px-2 py-0.5 rounded cursor-pointer transition-colors">
              {language}
            </div>
            <div className="hover:bg-white/10 px-2 py-0.5 rounded cursor-pointer transition-colors">
              UTF-8
            </div>
            <div className="hover:bg-white/10 px-2 py-0.5 rounded cursor-pointer transition-colors">
              LF
            </div>
            <div className="hover:bg-white/10 px-2 py-0.5 rounded cursor-pointer transition-colors">
              {theme}
            </div>
          </>
        )}
        <div className="flex items-center gap-1.5 hover:bg-white/10 px-2 py-0.5 rounded cursor-pointer transition-colors">
          <Clock className="w-3 h-3" />
          <span>{formatTime(time)}</span>
        </div>
        {!isMobile && (
          <div className="hover:bg-white/10 px-2 py-0.5 rounded cursor-pointer transition-colors">
            <Bell className="w-3 h-3" />
          </div>
        )}
      </div>
    </div>
  );
};
