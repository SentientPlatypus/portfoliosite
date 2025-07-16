import { useState, useEffect } from 'react';

interface TypewriterAnimationProps {
  text: string;
  delay?: number;
  onComplete?: () => void;
  className?: string;
}

const applySyntaxHighlighting = (text: string) => {
  if (text === 'me.') {
    return (
      <>
        <span className="syntax-variable">me</span>
        <span className="text-white">.</span>
      </>
    );
  }
  return <span className="syntax-variable">{text}</span>;
};

export const TypewriterAnimation = ({ text, delay = 100, onComplete, className = '' }: TypewriterAnimationProps) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(currentIndex + 1);
      }, delay);

      return () => clearTimeout(timeout);
    } else if (onComplete) {
      const timeout = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, delay, onComplete]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <span className={className}>
      {applySyntaxHighlighting(displayText)}
      <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity`}>|</span>
    </span>
  );
};