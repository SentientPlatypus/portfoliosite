import { useState, useEffect } from 'react';
import { TypewriterAnimation } from './TypewriterAnimation';
import { Intellisense, IntellisenseContent } from './Intellisense';

const intellisenseOptions = [
  {
    id: 'info',
    label: 'info',
    content: `Hey! I'm Gene

A passionate developer who loves creating 
beautiful and functional web applications.

I specialize in React, TypeScript, and 
modern web technologies.

When I'm not coding, you can find me 
exploring new technologies or contributing 
to open-source projects.`
  },
  {
    id: 'work',
    label: 'work',
    content: `Professional Experience

• Senior Frontend Developer at TechCorp
  - Led development of React applications
  - Improved performance by 40%
  - Mentored junior developers

• Full Stack Developer at StartupXYZ
  - Built scalable web applications
  - Implemented CI/CD pipelines
  - Worked with Node.js and PostgreSQL

Skills: React, TypeScript, Node.js, 
Python, AWS, Docker`
  },
  {
    id: 'fun',
    label: 'fun',
    content: `Personal Projects & Hobbies

🎮 Game Development
  - Built indie games with Unity
  - Participated in game jams

📸 Photography
  - Landscape and street photography
  - Digital art and photo manipulation

🎵 Music Production
  - Electronic music composition
  - Sound design for games

🏃‍♂️ Running & Fitness
  - Marathon runner
  - Outdoor enthusiast`
  },
  {
    id: 'contact',
    label: 'contact',
    content: `Get In Touch

📧 Email: gene@example.com
🐦 Twitter: @gene_codes
💼 LinkedIn: linkedin.com/in/gene
🐙 GitHub: github.com/gene

📍 Location: San Francisco, CA

Available for:
• Freelance projects
• Full-time opportunities
• Collaboration on open source
• Speaking at events

Let's build something amazing together!`
  }
];

export const CodeEditor = () => {
  const [step, setStep] = useState<'typing-code' | 'moving-code' | 'typing-me' | 'showing-intellisense'>('typing-code');
  const [showIntellisense, setShowIntellisense] = useState(false);
  const [selectedOption, setSelectedOption] = useState(intellisenseOptions[0]);
  const [codePosition, setCodePosition] = useState({ x: '50%', y: '50%', transform: 'translate(-50%, -50%)' });

  const handleCodeComplete = () => {
    setStep('moving-code');
    // Animate to top right
    setTimeout(() => {
      setCodePosition({ x: 'calc(100% - 6rem)', y: '2rem', transform: 'translate(0, 0)' });
      setTimeout(() => {
        setStep('typing-me');
      }, 800);
    }, 100);
  };

  const handleMeComplete = () => {
    setStep('showing-intellisense');
    setTimeout(() => {
      setShowIntellisense(true);
    }, 300);
  };

  const handleSelectionChange = (option: typeof intellisenseOptions[0]) => {
    setSelectedOption(option);
  };

  return (
    <div className="min-h-screen editor-bg text-foreground font-mono relative overflow-hidden">
      {/* Line numbers */}
      <div className="absolute left-0 top-0 w-12 h-full border-r border-border bg-muted/10">
        <div className="text-editor-line-number text-sm p-2 leading-6">
          <div>1</div>
          <div>2</div>
          <div>3</div>
          <div>4</div>
          <div>5</div>
        </div>
      </div>

      {/* Main content area */}
      <div className="ml-12 p-4 relative">
        {/* Code declaration line */}
        <div className="text-lg leading-relaxed">
          <span className="syntax-keyword">let</span>{' '}
          <span className="syntax-variable">mut</span>{' '}
          <span className="syntax-variable">me</span>{' '}
          <span className="syntax-keyword">=</span>{' '}
          <span className="syntax-type">Dev</span>
          <span className="syntax-keyword">{'{'}</span>
          <span className="syntax-variable">name</span>
          <span className="syntax-keyword">:</span>{' '}
          <span className="syntax-type">String</span>
          <span className="syntax-keyword">::</span>
          <span className="syntax-method">from</span>
          <span className="syntax-keyword">(</span>
          <span className="syntax-string">"Gene"</span>
          <span className="syntax-keyword">)</span>
          <span className="syntax-keyword">,</span>{' '}
          <span className="syntax-variable">age</span>
          <span className="syntax-keyword">:</span>{' '}
          <span className="syntax-number">18</span>
          <span className="syntax-keyword">{'}'}</span>
          <span className="syntax-keyword">;</span>
        </div>

        {/* Empty line */}
        <div className="h-6"></div>

        {/* Code typing animation */}
        <div 
          className="absolute text-xl font-bold transition-all duration-700 ease-in-out"
          style={{
            left: codePosition.x,
            top: codePosition.y,
            transform: codePosition.transform,
          }}
        >
          {step === 'typing-code' && (
            <TypewriterAnimation
              text="code"
              delay={150}
              onComplete={handleCodeComplete}
              className="syntax-keyword"
            />
          )}
          {(step === 'moving-code' || step === 'typing-me' || step === 'showing-intellisense') && (
            <span className="syntax-keyword">code</span>
          )}
        </div>

        {/* Me typing animation */}
        {(step === 'typing-me' || step === 'showing-intellisense') && (
          <div className="text-lg mt-16">
            <span className="syntax-variable">me</span>
            <span className="syntax-keyword">.</span>
            {step === 'typing-me' && (
              <TypewriterAnimation
                text=""
                delay={150}
                onComplete={handleMeComplete}
              />
            )}
            
            {/* Intellisense tooltips */}
            {showIntellisense && (
              <div className="relative inline-block">
                <div className="absolute top-6 left-0 flex z-10">
                  <Intellisense
                    options={intellisenseOptions}
                    onSelectionChange={handleSelectionChange}
                  />
                  <IntellisenseContent
                    content={selectedOption.content}
                    className="max-w-md"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer with instructions */}
      {showIntellisense && (
        <div className="absolute bottom-4 left-16 text-sm text-muted-foreground">
          Use ↑↓ arrow keys or click to navigate • Press tab to select
        </div>
      )}
    </div>
  );
};