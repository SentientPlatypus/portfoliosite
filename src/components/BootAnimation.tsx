import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface BootAnimationProps {
  onComplete: () => void;
}

export const BootAnimation = ({ onComplete }: BootAnimationProps) => {
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [stage, setStage] = useState<'loading' | 'typing' | 'opening'>('loading');

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
    // Fast loading phase
    const loadingInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(loadingInterval);
          setStage('typing');
          return 100;
        }
        return prev + 4;
      });
    }, 20);

    // Rapid log output
    const logInterval = setInterval(() => {
      setLogs(prev => {
        if (prev.length < bootLogs.length) {
          return [...prev, bootLogs[prev.length]];
        }
        return prev;
      });
    }, 150);

    return () => {
      clearInterval(loadingInterval);
      clearInterval(logInterval);
    };
  }, []);

  useEffect(() => {
    if (stage === 'typing') {
      setTimeout(() => setStage('opening'), 1000);
    } else if (stage === 'opening') {
      setTimeout(onComplete, 800);
    }
  }, [stage, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#1e1e1e] flex items-center justify-center z-50 font-mono"
    >
      <div className="w-full max-w-2xl px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <Loader2 className="w-8 h-8 text-[#007acc] animate-spin" />
          <h1 className="text-2xl font-bold text-white">
            {stage === 'loading' && 'Opening Workspace'}
            {stage === 'typing' && 'Initializing Editor'}
            {stage === 'opening' && 'Opening About...'}
          </h1>
        </motion.div>
        
        <div className="space-y-1 mb-6 min-h-[200px]">
          <AnimatePresence mode="popLayout">
            {logs.map((log, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="text-[#cccccc] text-sm"
              >
                {log}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {stage === 'typing' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[#4ec9b0] text-sm mt-4"
            >
              <span className="text-[#569cd6]">let</span>{' '}
              <span className="text-[#ff6b6b]">mut</span>{' '}
              <span className="text-[#9cdcfe]">me</span> = Dev{'{'}...{'}'};
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="inline-block w-2 h-4 bg-white ml-1"
              />
            </motion.div>
          )}
        </div>

        <div className="w-full bg-[#3c3c3c] h-1 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
            className="h-full bg-[#007acc]"
          />
        </div>
        
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-[#858585] text-xs mt-2 text-center"
        >
          {progress}%
        </motion.div>
      </div>
    </motion.div>
  );
};
