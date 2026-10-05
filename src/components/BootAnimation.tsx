import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface BootAnimationProps {
  onComplete: () => void;
}

export const BootAnimation = ({ onComplete }: BootAnimationProps) => {
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const bootLogs = [
    '> Initializing portfolio workspace...',
    '> Loading project configurations...',
    '> Scanning 30+ projects...',
    '> Building file tree...',
    '> Starting editor services...',
    '> Loading syntax highlighting...',
    '> Initializing terminal...',
    '> Workspace ready ✓',
  ];

  useEffect(() => {
    const logInterval = setInterval(() => {
      setLogs(prev => {
        if (prev.length < bootLogs.length) {
          return [...prev, bootLogs[prev.length]];
        }
        return prev;
      });
    }, 200);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          clearInterval(logInterval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => {
      clearInterval(logInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-[#1e1e1e] flex items-center justify-center z-50 font-mono">
      <div className="w-full max-w-2xl px-8">
        <div className="flex items-center gap-3 mb-8">
          <Loader2 className="w-8 h-8 text-[#007acc] animate-spin" />
          <h1 className="text-2xl font-bold text-white">Opening Workspace</h1>
        </div>
        
        <div className="space-y-2 mb-6">
          {logs.map((log, index) => (
            <div
              key={index}
              className="text-[#cccccc] text-sm animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {log}
            </div>
          ))}
        </div>

        <div className="w-full bg-[#3c3c3c] h-1 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#007acc] transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="text-[#858585] text-xs mt-2 text-center">
          {progress}%
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
