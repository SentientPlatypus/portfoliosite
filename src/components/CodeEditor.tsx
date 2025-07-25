import { useState, useEffect } from 'react';
import { TypewriterAnimation } from './TypewriterAnimation';
import { Intellisense, IntellisenseContent } from './Intellisense';
import { InteractiveInfo } from './InteractiveWidgets';
import { ProjectsError } from './ProjectsError';
import { PortfolioContent } from './PortfolioContent';
import { WorkTimeline } from './WorkTimeline';
import { PicturesSection } from './PicturesSection';
import { AwardsSection } from './AwardsSection';
import { FileText, Image, FileCode } from 'lucide-react';
import { RustIcon } from './RustIcon';

interface PictureTab {
  id: string;
  title: string;
  imageUrl: string;
}

export const CodeEditor = () => {
  const [step, setStep] = useState<'typing-dev' | 'typing-me' | 'showing-intellisense'>('typing-dev');
  const [showIntellisense, setShowIntellisense] = useState(false);
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [hoveredOption, setHoveredOption] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('me.rs');
  const [artifactsGenerated, setArtifactsGenerated] = useState(false);
  const [showPortfolioTab, setShowPortfolioTab] = useState(false);
  const [isWorkComponentActive, setIsWorkComponentActive] = useState(false);
  const [pictureTabs, setPictureTabs] = useState<PictureTab[]>([]);

  const getFileIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'rs':
        return <RustIcon className="w-4 h-4 text-orange-500" />;
      case 'ts':
      case 'tsx':
        return <FileCode className="w-4 h-4 text-blue-400" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
        return <Image className="w-4 h-4 text-green-400" />;
      default:
        return <FileText className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const handlePictureClick = (picture: { id: string; title: string; imageUrl: string }) => {
    const existingTab = pictureTabs.find(tab => tab.id === picture.id);
    if (!existingTab) {
      setPictureTabs(prev => [...prev, picture]);
    }
    setActiveTab(picture.id);
  };

  const closePictureTab = (pictureId: string) => {
    setPictureTabs(prev => prev.filter(tab => tab.id !== pictureId));
    if (activeTab === pictureId) {
      setActiveTab('me.rs');
    }
  };

  const intellisenseOptions = [
    {
      id: 'info',
      label: 'info',
      content: <InteractiveInfo />
    },
    {
      id: 'work',
      label: 'work',
      content: <WorkTimeline />
    },
    {
      id: 'pictures',
      label: 'pictures',
      content: <PicturesSection onPictureClick={handlePictureClick} />
    },
    {
      id: 'awards',
      label: 'awards',
      content: <AwardsSection />
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

  const intellisenseOptionsWithProjects = [
    intellisenseOptions[0], // info
    intellisenseOptions[1], // work
    {
      id: 'projects',
      label: 'projects',
      content: (
        <ProjectsError 
          onGenerateArtifacts={() => {
            setArtifactsGenerated(true);
            setShowPortfolioTab(true);
            setActiveTab('portfolio.ts');
          }}
          artifactsGenerated={artifactsGenerated}
          onGoToPortfolio={() => {
            setShowPortfolioTab(true);
            setActiveTab('portfolio.ts');
          }}
        />
      )
    },
    ...intellisenseOptions.slice(2) // pictures, awards, contact
  ];

  // Set initial selected option
  useState(() => {
    setSelectedOption(intellisenseOptions[0]);
  });

  const handleDevComplete = () => {
    // Immediately shift up, then wait 500ms before starting next animation
    setStep('typing-me');
    setTimeout(() => {
      setStep('typing-me');
    }, 500);
  };

  const handleMeComplete = () => {
    setStep('showing-intellisense');
    setTimeout(() => {
      setShowIntellisense(true);
    }, 300);
  };

  const handleSelectionChange = (option: typeof intellisenseOptionsWithProjects[0]) => {
    setSelectedOption(option);
  };

  const handleHoverChange = (option: typeof intellisenseOptionsWithProjects[0] | null) => {
    setHoveredOption(option);
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
      <div className="h-9 bg-[#252526] border-b border-border flex items-center overflow-x-auto">
        <div 
          className={`border-r border-border px-4 py-2 text-sm flex items-center space-x-2 cursor-pointer transition-colors shrink-0 ${
            activeTab === 'me.rs' ? 'bg-[#1e1e1e] text-foreground' : 'bg-[#252526] text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('me.rs')}
        >
          {getFileIcon('me.rs')}
          <span>me.rs</span>
          <span className="text-muted-foreground hover:text-foreground cursor-pointer">×</span>
        </div>
        {showPortfolioTab && (
          <div 
            className={`border-r border-border px-4 py-2 text-sm flex items-center space-x-2 cursor-pointer transition-colors shrink-0 ${
              activeTab === 'portfolio.ts' ? 'bg-[#1e1e1e] text-foreground' : 'bg-[#252526] text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('portfolio.ts')}
          >
            {getFileIcon('portfolio.ts')}
            <span>portfolio.ts</span>
            <span 
              className="text-muted-foreground hover:text-foreground cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setShowPortfolioTab(false);
                if (activeTab === 'portfolio.ts') {
                  setActiveTab('me.rs');
                }
              }}
            >
              ×
            </span>
          </div>
        )}
        {pictureTabs.map((pictureTab) => (
          <div 
            key={pictureTab.id}
            className={`border-r border-border px-4 py-2 text-sm flex items-center space-x-2 cursor-pointer transition-colors shrink-0 ${
              activeTab === pictureTab.id ? 'bg-[#1e1e1e] text-foreground' : 'bg-[#252526] text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab(pictureTab.id)}
          >
            {getFileIcon(pictureTab.title)}
            <span>{pictureTab.title}</span>
            <span 
              className="text-muted-foreground hover:text-foreground cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                closePictureTab(pictureTab.id);
              }}
            >
              ×
            </span>
          </div>
        ))}
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex">
        {/* Line numbers */}
        <div className="w-12 bg-[#1e1e1e] border-r border-border">
          <div className="text-editor-line-number text-sm p-2" style={{ lineHeight: '1.75rem' }}>
            {/* Line numbers transition based on animation step */}
            <div className={`transition-all duration-300 ${step === 'typing-dev' ? 'mt-[35vh] -translate-y-6' : ''}`}>
              1
            </div>
            {(step === 'typing-me' || step === 'showing-intellisense') && (
              <div className="transition-all duration-300">
                2
              </div>
            )}
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 bg-[#1e1e1e] p-4 relative">
          {activeTab === 'me.rs' ? (
            <>
              {/* Dev declaration typing animation - starts in middle of screen */}
              <div className={`text-lg transition-all duration-300 ${
                step === 'typing-dev' ? 'mt-[35vh] -translate-y-6' : ''
              }`} style={{ lineHeight: '1.75rem' }}>
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
                    <span className="syntax-mut">mut</span>{' '}
                    <span className="syntax-variable">me</span>{' '}
                    <span className="text-white">=</span>{' '}
                    <span className="syntax-type">Dev</span>
                    <span className="text-white">{'{'}</span>
                    <span className="text-orange-400">name</span>
                    <span className="text-white">:</span>{' '}
                    <span className="syntax-type">String</span>
                    <span className="text-white">::</span>
                    <span className="syntax-method">from</span>
                    <span className="text-white">(</span>
                    <span className="syntax-string">"Gene"</span>
                    <span className="text-white">)</span>
                    <span className="text-white">,</span>{' '}
                    <span className="text-orange-400">age</span>
                    <span className="text-white">:</span>{' '}
                    <span className="syntax-number">18</span>
                    <span className="text-white">{'}'}</span>
                    <span className="text-white">;</span>
                  </>
                )}
              </div>

              {/* Me typing animation - appears on next line after delay */}
              {(step === 'typing-me' || step === 'showing-intellisense') && (
                <div className="text-lg" style={{ lineHeight: '1.75rem' }}>
                  {step === 'typing-me' && (
                    <TypewriterAnimation
                      text="me."
                      delay={150}
                      onComplete={handleMeComplete}
                      className="syntax-variable"
                    />
                  )}
                  {step === 'showing-intellisense' && selectedOption && (
                    <div className="relative">
                      <span className="syntax-variable">me</span>
                      <span className="text-white">.</span>
                      <span className="syntax-method">
                        {selectedOption.label}()
                      </span>
                      
                      {/* Intellisense tooltips */}
                      {showIntellisense && (
                        <div className="absolute top-6 left-4 flex z-10">
                          <Intellisense
                            options={intellisenseOptionsWithProjects}
                            onSelectionChange={handleSelectionChange}
                            onHoverChange={handleHoverChange}
                            isWorkComponentActive={isWorkComponentActive}
                            onSetWorkComponentActive={setIsWorkComponentActive}
                          />
                          <IntellisenseContent
                            content={selectedOption.content}
                            className="w-[60vw] min-w-96"
                            isWorkSelected={selectedOption.id === 'work' && isWorkComponentActive}
                            onWorkNavigationRequest={(direction) => {
                              if (direction === 'left') {
                                setIsWorkComponentActive(false);
                              }
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : activeTab === 'portfolio.ts' ? (
            <PortfolioContent />
          ) : (
            // Picture tab content
            (() => {
              const pictureTab = pictureTabs.find(tab => tab.id === activeTab);
              return pictureTab ? (
                <div className="flex flex-col h-full p-4">
                  <h2 className="text-xl font-semibold mb-4 text-foreground">{pictureTab.title}</h2>
                  <div className="flex-1 flex items-center justify-center">
                    <img 
                      src={pictureTab.imageUrl} 
                      alt={pictureTab.title}
                      className="max-w-full max-h-full object-contain rounded-lg border border-border"
                    />
                  </div>
                </div>
              ) : null;
            })()
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
          {isWorkComponentActive ? 
            'Use ↑↓ to navigate work experiences • ← to return to methods' : 
            'Use ↑↓ arrow keys to navigate • → to enter work mode'
          }
        </div>
      )}
    </div>
  );
};