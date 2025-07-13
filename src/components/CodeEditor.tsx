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
  const [step, setStep] = useState<'typing-dev' | 'typing-me' | 'showing-intellisense'>('typing-dev');
  const [showIntellisense, setShowIntellisense] = useState(false);
  const [selectedOption, setSelectedOption] = useState(intellisenseOptions[0]);

  const handleDevComplete = () => {
    setStep('typing-me');
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
    <div className="min-h-screen bg-background text-foreground font-mono flex flex-col">
      {/* VS Code Title Bar */}
      <div className="h-8 bg-[#323233] border-b border-[#2d2d30] flex items-center px-2">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
            <div className="w-3 h-3 rounded-full bg-[#27ca3f]"></div>
          </div>
          <span className="text-xs text-muted-foreground ml-4">Visual Studio Code</span>
        </div>
      </div>

      {/* Menu Bar */}
      <div className="h-8 bg-[#2d2d30] border-b border-[#2d2d30] flex items-center px-2">
        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
          <span className="hover:text-foreground cursor-pointer">File</span>
          <span className="hover:text-foreground cursor-pointer">Edit</span>
          <span className="hover:text-foreground cursor-pointer">View</span>
          <span className="hover:text-foreground cursor-pointer">Go</span>
          <span className="hover:text-foreground cursor-pointer">Run</span>
          <span className="hover:text-foreground cursor-pointer">Terminal</span>
          <span className="hover:text-foreground cursor-pointer">Help</span>
        </div>
      </div>

      {/* File Tabs */}
      <div className="h-9 bg-[#252526] border-b border-border flex items-center">
        <div className="bg-[#1e1e1e] border-r border-border px-4 py-2 text-sm text-foreground flex items-center space-x-2">
          <span>me.rs</span>
          <span className="text-muted-foreground hover:text-foreground cursor-pointer">×</span>
        </div>
        <div className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer">
          portfolio.ts
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex">
        {/* Line numbers */}
        <div className="w-12 bg-[#1e1e1e] border-r border-border">
          <div className="text-editor-line-number text-sm p-2 leading-6">
            <div>1</div>
            <div>2</div>
            <div>3</div>
            <div>4</div>
            <div>5</div>
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 bg-[#1e1e1e] p-4 relative">
          {/* Dev declaration typing animation */}
          <div className="text-lg leading-relaxed">
            {step === 'typing-dev' && (
              <TypewriterAnimation
                text='let mut me = Dev{name: String::from("Gene"), age: 18};'
                delay={80}
                onComplete={handleDevComplete}
                className="syntax-variable"
              />
            )}
            {(step === 'typing-me' || step === 'showing-intellisense') && (
              <>
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
              </>
            )}
          </div>

          {/* Empty line */}
          <div className="h-6"></div>

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
      </div>

      {/* VS Code Status Bar */}
      <div className="h-6 bg-[#007ACC] flex items-center justify-between px-4 text-xs text-white">
        <div className="flex items-center space-x-4">
          <span>Rust</span>
          <span>UTF-8</span>
          <span>LF</span>
          <span>Ln 3, Col 18</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>✓ Prettier</span>
          <span>⚡ Auto Save</span>
        </div>
      </div>

      {/* Footer with instructions */}
      {showIntellisense && (
        <div className="absolute bottom-8 left-16 text-sm text-muted-foreground">
          Use ↑↓ arrow keys or click to navigate • Press tab to select
        </div>
      )}
    </div>
  );
};