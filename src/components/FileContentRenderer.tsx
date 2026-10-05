import { InteractiveInfo } from './InteractiveWidgets';
import { WorkTimeline } from './WorkTimeline';
import { PicturesSection } from './PicturesSection';
import { AwardsSection } from './AwardsSection';
import { PortfolioContent } from './PortfolioContent';
import { TypewriterAnimation } from './TypewriterAnimation';
import { useEffect, useRef, useState } from 'react';

interface FileContentRendererProps {
  path: string;
  theme: any;
  onPictureClick?: (picture: { id: string; title: string; description: string; imageUrl: string }) => void;
}

export const FileContentRenderer = ({ path, theme, onPictureClick }: FileContentRendererProps) => {
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(false);
  const [animationStep, setAnimationStep] = useState<'dev' | 'me' | 'complete'>('dev');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (path === '/me.rs') {
      // Check if this is the first time opening
      const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');
      if (!hasSeenWelcome) {
        setShowWelcomeAnimation(true);
        setAnimationStep('dev');
        sessionStorage.setItem('hasSeenWelcome', 'true');
      } else {
        setShowWelcomeAnimation(false);
        setAnimationStep('complete');
      }
    }
  }, [path]);

  const handleDevComplete = () => {
    setTimeout(() => setAnimationStep('me'), 500);
  };

  const handleMeComplete = () => {
    setTimeout(() => setAnimationStep('complete'), 300);
  };

  const renderMeRsContent = () => {
    if (showWelcomeAnimation && animationStep !== 'complete') {
      return (
        <div className="p-8">
          <div className={`text-lg transition-all duration-300 mb-2 ${
            animationStep === 'dev' ? 'mt-[35vh]' : ''
          }`}>
            {animationStep === 'dev' && (
              <TypewriterAnimation
                text='let mut me = Dev{name: String::from("Gene"), age: 19};'
                delay={38}
                onComplete={handleDevComplete}
                className="syntax-variable"
              />
            )}
            {(animationStep === 'me' || animationStep === 'complete') && (
              <>
                <span className="text-[var(--theme-keyword)]">let</span>{' '}
                <span className="text-[#ff6b6b]">mut</span>{' '}
                <span className="text-[var(--theme-variable)]">me</span>{' '}
                <span className="text-white">=</span>{' '}
                <span className="text-[var(--theme-type)]">Dev</span>
                <span className="text-white">{'{'}</span>
                <span className="text-orange-400">name</span>
                <span className="text-white">:</span>{' '}
                <span className="text-[var(--theme-type)]">String</span>
                <span className="text-white">::</span>
                <span className="text-[var(--theme-method)]">from</span>
                <span className="text-white">(</span>
                <span className="text-[var(--theme-string)]">"Gene"</span>
                <span className="text-white">)</span>
                <span className="text-white">,</span>{' '}
                <span className="text-orange-400">age</span>
                <span className="text-white">:</span>{' '}
                <span className="text-[var(--theme-number)]">19</span>
                <span className="text-white">{'}'}</span>
                <span className="text-white">;</span>
              </>
            )}
          </div>
          
          {animationStep === 'me' && (
            <div className="text-lg">
              <TypewriterAnimation
                text="me."
                delay={71}
                onComplete={handleMeComplete}
                className="syntax-variable"
              />
            </div>
          )}
        </div>
      );
    }

    // Static welcome content after animation
    return (
      <div className="p-8">
        <div className="text-lg mb-8">
          <span className="text-[var(--theme-keyword)]">let</span>{' '}
          <span className="text-[#ff6b6b]">mut</span>{' '}
          <span className="text-[var(--theme-variable)]">me</span>{' '}
          <span className="text-white">=</span>{' '}
          <span className="text-[var(--theme-type)]">Dev</span>
          <span className="text-white">{'{'}</span>
          <span className="text-orange-400">name</span>
          <span className="text-white">:</span>{' '}
          <span className="text-[var(--theme-type)]">String</span>
          <span className="text-white">::</span>
          <span className="text-[var(--theme-method)]">from</span>
          <span className="text-white">(</span>
          <span className="text-[var(--theme-string)]">"Gene"</span>
          <span className="text-white">)</span>
          <span className="text-white">,</span>{' '}
          <span className="text-orange-400">age</span>
          <span className="text-white">:</span>{' '}
          <span className="text-[var(--theme-number)]">19</span>
          <span className="text-white">{'}'}</span>
          <span className="text-white">;</span>
        </div>
        
        <div className="text-[var(--theme-comment)] mb-4">
          // 👋 Welcome to my portfolio! Use the file explorer to navigate,
        </div>
        <div className="text-[var(--theme-comment)] mb-4">
          // or press Cmd/Ctrl+P to open the command palette.
        </div>
        <div className="text-[var(--theme-comment)] mb-8">
          // Press Ctrl+` to toggle the terminal and try some commands!
        </div>
        
        <div className="mt-8 p-6 bg-[var(--theme-sidebar)] rounded border border-[var(--theme-border)]">
          <h3 className="text-xl font-bold mb-4 text-[var(--theme-method)]">Quick Links</h3>
          <div className="space-y-2 text-sm">
            <div className="text-[var(--theme-foreground)]">→ about.tsx - Learn about me</div>
            <div className="text-[var(--theme-foreground)]">→ projects/ - View my work</div>
            <div className="text-[var(--theme-foreground)]">→ experience.json - Work history</div>
            <div className="text-[var(--theme-foreground)]">→ contact.md - Get in touch</div>
          </div>
        </div>
      </div>
    );
  };

  switch (path) {
    case '/me.rs':
      return renderMeRsContent();
      
    case '/portfolio/about.tsx':
      return (
        <div ref={contentRef} className="p-6">
          <InteractiveInfo />
        </div>
      );
      
    case '/portfolio/experience.json':
      return (
        <div ref={contentRef} className="p-6">
          <WorkTimeline />
        </div>
      );
      
    case '/portfolio/projects/all-projects.tsx':
      return (
        <div ref={contentRef}>
          <PortfolioContent />
        </div>
      );
      
    case '/portfolio/pictures/gallery.tsx':
      return (
        <div ref={contentRef} className="p-6">
          <PicturesSection onPictureClick={onPictureClick || (() => {})} />
        </div>
      );
      
    case '/portfolio/awards.tsx':
      return (
        <div ref={contentRef} className="p-6">
          <AwardsSection />
        </div>
      );
      
    case '/portfolio/contact.md':
      return (
        <div ref={contentRef} className="p-8 prose prose-invert max-w-none">
          <h1 className="text-3xl font-bold mb-6 text-[var(--theme-method)]">Get In Touch</h1>
          
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📧</span>
              <div>
                <div className="font-semibold text-[var(--theme-variable)]">Email</div>
                <a href="mailto:gjw62@cornell.edu" className="text-[var(--theme-string)] hover:underline">
                  gjw62@cornell.edu
                </a>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-2xl">📍</span>
              <div>
                <div className="font-semibold text-[var(--theme-variable)]">Location</div>
                <div className="text-[var(--theme-foreground)]">Ithaca, NY</div>
              </div>
            </div>
            
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-3 text-[var(--theme-type)]">Available for:</h2>
              <ul className="list-disc list-inside space-y-2 text-[var(--theme-foreground)]">
                <li>Freelance projects</li>
                <li>Full-time opportunities</li>
                <li>Collaboration on open source</li>
                <li>Speaking at events</li>
              </ul>
            </div>
            
            <div className="mt-8 p-4 bg-[var(--theme-sidebar)] rounded border border-[var(--theme-border)]">
              <p className="text-[var(--theme-comment)] italic">
                Let's build something amazing together!
              </p>
            </div>
          </div>
        </div>
      );
      
    case '/portfolio/resume.pdf':
      return (
        <div ref={contentRef} className="p-8">
          <h2 className="text-2xl font-bold mb-4 text-[var(--theme-method)]">Resume</h2>
          <p className="text-[var(--theme-foreground)] mb-4">
            You can view my resume at the link below:
          </p>
          <a
            href="https://drive.google.com/file/d/1x1-A-l2jMiHjsxPrRJ45bN8UB8T-_vE0/view"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-[var(--theme-statusBar)] text-white rounded hover:opacity-90 transition-opacity"
          >
            Open Resume (PDF)
          </a>
        </div>
      );
      
    case '/README.md':
      return (
        <div ref={contentRef} className="p-8 prose prose-invert max-w-none">
          <h1 className="text-3xl font-bold mb-4 text-[var(--theme-method)]">Portfolio Site</h1>
          <p className="text-[var(--theme-foreground)] mb-4">
            This is an interactive portfolio built with Vite + React + TypeScript + Tailwind.
          </p>
          <h2 className="text-2xl font-bold mb-3 mt-6 text-[var(--theme-type)]">Features</h2>
          <ul className="list-disc list-inside space-y-2 text-[var(--theme-foreground)]">
            <li>VS Code-inspired interface</li>
            <li>File explorer navigation</li>
            <li>Command palette (Cmd/Ctrl+P)</li>
            <li>Integrated terminal</li>
            <li>Multiple color themes</li>
            <li>Fully responsive design</li>
          </ul>
        </div>
      );
      
    default:
      return (
        <div ref={contentRef} className="p-8">
          <div className="text-[var(--theme-comment)]">
            // File not found: {path}
          </div>
        </div>
      );
  }
};
