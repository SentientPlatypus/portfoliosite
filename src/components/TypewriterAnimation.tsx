import { useState, useEffect } from 'react';

interface TypewriterAnimationProps {
  text: string;
  delay?: number;
  onComplete?: () => void;
  className?: string;
}

const parseRustSyntax = (text: string) => {
  const tokens = [];
  let i = 0;
  
  while (i < text.length) {
    let char = text[i];
    let token = '';
    let className = 'text-white';
    
    // Skip whitespace
    if (char === ' ') {
      tokens.push({ text: char, className: 'text-white' });
      i++;
      continue;
    }
    
    // Handle strings
    if (char === '"') {
      token = '"';
      i++;
      while (i < text.length && text[i] !== '"') {
        token += text[i];
        i++;
      }
      if (i < text.length) token += text[i]; // closing quote
      tokens.push({ text: token, className: 'syntax-string' });
      i++;
      continue;
    }
    
    // Handle numbers
    if (/\d/.test(char)) {
      while (i < text.length && /\d/.test(text[i])) {
        token += text[i];
        i++;
      }
      tokens.push({ text: token, className: 'syntax-number' });
      continue;
    }
    
    // Handle identifiers and keywords
    if (/[a-zA-Z_]/.test(char)) {
      while (i < text.length && /[a-zA-Z0-9_]/.test(text[i])) {
        token += text[i];
        i++;
      }
      
      // Determine token type
      if (token === 'let') className = 'syntax-keyword';
      else if (token === 'mut') className = 'syntax-mut';
      else if (token === 'Dev' || token === 'String') className = 'syntax-type';
      else if (token === 'from') className = 'syntax-method';
      else if (token === 'me' || token === 'name' || token === 'age') className = 'syntax-variable';
      else className = 'text-white';
      
      tokens.push({ text: token, className });
      continue;
    }
    
    // Handle operators and punctuation
    if (char === ':' && i + 1 < text.length && text[i + 1] === ':') {
      tokens.push({ text: '::', className: 'text-white' });
      i += 2;
      continue;
    }
    
    // Single character punctuation
    tokens.push({ text: char, className: 'text-white' });
    i++;
  }
  
  return tokens;
};

const applySyntaxHighlighting = (text: string) => {
  if (text === 'me.') {
    return (
      <>
        <span className="syntax-variable">me</span>
        <span className="text-white">.</span>
      </>
    );
  }
  
  // For Rust code syntax highlighting
  if (text.includes('let') || text.includes('mut') || text.includes('Dev')) {
    const tokens = parseRustSyntax(text);
    return (
      <>
        {tokens.map((token, index) => (
          <span key={index} className={token.className}>
            {token.text}
          </span>
        ))}
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