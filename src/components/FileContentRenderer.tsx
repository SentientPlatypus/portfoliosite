import { InteractiveInfo } from './InteractiveWidgets';
import { WorkTimeline } from './WorkTimeline';
import { PicturesSection } from './PicturesSection';
import { AwardsSection } from './AwardsSection';
import { PortfolioContent, projects, Project } from './PortfolioContent';
import { TypewriterAnimation } from './TypewriterAnimation';
import { GitGraphTimeline } from './GitGraphTimeline';
import { TechTag } from './TechTag';
import { ExternalLink, Github, FileText } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface FileContentRendererProps {
  path: string;
  theme: any;
  onPictureClick?: (picture: { id: string; title: string; description: string; imageUrl: string }) => void;
  onProjectClick?: (project: any) => void;
  viewMode?: 'source' | 'preview';
  onTypingComplete?: () => void;
}

export const FileContentRenderer = ({ path, theme, onPictureClick, onProjectClick, viewMode = 'preview', onTypingComplete }: FileContentRendererProps) => {
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
    setTimeout(() => {
      setAnimationStep('complete');
      if (onTypingComplete) {
        setTimeout(() => onTypingComplete(), 800);
      }
    }, 300);
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
      if (viewMode === 'source') {
        return (
          <div className="p-6 font-mono text-sm leading-relaxed">
            <div className="text-[var(--theme-comment)]">// portfolio/about.tsx</div>
            <div className="mt-4">
              <span className="text-[var(--theme-keyword)]">export</span> <span className="text-[var(--theme-keyword)]">const</span> <span className="text-[var(--theme-method)]">aboutData</span> = {'{'} 
            </div>
            <div className="pl-4">
              <span className="text-[var(--theme-variable)]">name</span>: <span className="text-[var(--theme-string)]">"Gene"</span>,
            </div>
            <div className="pl-4">
              <span className="text-[var(--theme-variable)]">fullName</span>: <span className="text-[var(--theme-string)]">"Geneustace Wicaksono"</span>,
            </div>
            <div className="pl-4">
              <span className="text-[var(--theme-variable)]">title</span>: <span className="text-[var(--theme-string)]">"Electrical & Computer Engineering Student"</span>,
            </div>
            <div className="pl-4">
              <span className="text-[var(--theme-variable)]">university</span>: <span className="text-[var(--theme-string)]">"Cornell University"</span>,
            </div>
            <div className="pl-4">
              <span className="text-[var(--theme-variable)]">currentPosition</span>: <span className="text-[var(--theme-string)]">"AWS Cryptography"</span>,
            </div>
            <div className="pl-4">
              <span className="text-[var(--theme-variable)]">location</span>: <span className="text-[var(--theme-string)]">"Ithaca, NY"</span>,
            </div>
            <div className="pl-4">
              <span className="text-[var(--theme-variable)]">origin</span>: <span className="text-[var(--theme-string)]">"Jakarta"</span>,
            </div>
            <div className="pl-4">
              <span className="text-[var(--theme-variable)]">bio</span>: [
            </div>
            <div className="pl-8">
              <span className="text-[var(--theme-string)]">"From Jakarta, but lived most of my life in Ithaca NY."</span>,
            </div>
            <div className="pl-8">
              <span className="text-[var(--theme-string)]">"I moved back for a family thing, but I hope to stay in the States!"</span>,
            </div>
            <div className="pl-8">
              <span className="text-[var(--theme-string)]">"All the worthwhile things I do have been influenced by amazing people."</span>,
            </div>
            <div className="pl-8">
              <span className="text-[var(--theme-string)]">"If you have a good idea and need people to run with it, contact me!"</span>
            </div>
            <div className="pl-4">
              ],
            </div>
            <div className="pl-4">
              <span className="text-[var(--theme-variable)]">email</span>: <span className="text-[var(--theme-string)]">"gjw62@cornell.edu"</span>,
            </div>
            <div>
              {'}'};
            </div>
          </div>
        );
      }
      return (
        <div ref={contentRef} className="p-6">
          <InteractiveInfo />
        </div>
      );
      
    case '/portfolio/experience.json':
      if (viewMode === 'source') {
        return (
          <div className="p-6 font-mono text-sm leading-relaxed">
            <div className="text-[var(--theme-comment)]">// portfolio/experience.json</div>
            <div className="mt-4">
              {'{'}
            </div>
            <div className="pl-4">
              <span className="text-[var(--theme-variable)]">"experiences"</span>: [
            </div>
            <div className="pl-8">
              {'{'}
            </div>
            <div className="pl-12">
              <span className="text-[var(--theme-variable)]">"title"</span>: <span className="text-[var(--theme-string)]">"Software Developer Intern, AWS Cryptography"</span>,
            </div>
            <div className="pl-12">
              <span className="text-[var(--theme-variable)]">"company"</span>: <span className="text-[var(--theme-string)]">"Amazon Web Services"</span>,
            </div>
            <div className="pl-12">
              <span className="text-[var(--theme-variable)]">"period"</span>: <span className="text-[var(--theme-string)]">"May 2025 — Present"</span>,
            </div>
            <div className="pl-12">
              <span className="text-[var(--theme-variable)]">"type"</span>: <span className="text-[var(--theme-string)]">"internship"</span>
            </div>
            <div className="pl-8">
              {'}'},
            </div>
            <div className="pl-8">
              {'{'}
            </div>
            <div className="pl-12">
              <span className="text-[var(--theme-variable)]">"title"</span>: <span className="text-[var(--theme-string)]">"Student"</span>,
            </div>
            <div className="pl-12">
              <span className="text-[var(--theme-variable)]">"organization"</span>: <span className="text-[var(--theme-string)]">"Cornell University"</span>,
            </div>
            <div className="pl-12">
              <span className="text-[var(--theme-variable)]">"degree"</span>: <span className="text-[var(--theme-string)]">"Electrical & Computer Engineering"</span>,
            </div>
            <div className="pl-12">
              <span className="text-[var(--theme-variable)]">"period"</span>: <span className="text-[var(--theme-string)]">"August 2022 — Present"</span>
            </div>
            <div className="pl-8">
              {'}'},
            </div>
            <div className="pl-8">
              {'{'}
            </div>
            <div className="pl-12">
              <span className="text-[var(--theme-variable)]">"title"</span>: <span className="text-[var(--theme-string)]">"FRC Robotics - Vision Systems"</span>,
            </div>
            <div className="pl-12">
              <span className="text-[var(--theme-variable)]">"team"</span>: <span className="text-[var(--theme-string)]">"Code Red Robotics"</span>,
            </div>
            <div className="pl-12">
              <span className="text-[var(--theme-variable)]">"period"</span>: <span className="text-[var(--theme-string)]">"September 2020 — June 2024"</span>
            </div>
            <div className="pl-8">
              {'}'}
            </div>
            <div className="pl-4">
              ]
            </div>
            <div>
              {'}'}
            </div>
          </div>
        );
      }
      return (
        <div ref={contentRef} className="p-6">
          <GitGraphTimeline />
        </div>
      );
      
    case '/portfolio/projects/all-projects.tsx':
      return (
        <div ref={contentRef}>
          <PortfolioContent onProjectOpen={(project) => {
            if (onProjectClick) {
              onProjectClick(project);
            }
          }} />
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
      if (viewMode === 'source') {
        return (
          <div className="p-6 font-mono text-sm leading-relaxed">
            <div className="text-[var(--theme-comment)]">// portfolio/contact.md</div>
            <div className="mt-4 space-y-2">
              <div><span className="text-[var(--theme-keyword)]">#</span> <span className="text-[var(--theme-method)]">Get In Touch</span></div>
              <div className="mt-4" />
              <div><span className="text-[var(--theme-keyword)]">##</span> <span className="text-[var(--theme-type)]">Contact Information</span></div>
              <div className="mt-2" />
              <div className="text-[var(--theme-foreground)]">- <span className="text-[var(--theme-variable)]">**Email:**</span> gjw62@cornell.edu</div>
              <div className="text-[var(--theme-foreground)]">- <span className="text-[var(--theme-variable)]">**Location:**</span> Ithaca, NY</div>
            </div>
          </div>
        );
      }
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
      <div className="p-8 prose prose-invert max-w-none">
        <h1 className="text-3xl font-bold mb-4 text-[var(--theme-method)]">Portfolio Site</h1>
        <p className="text-[var(--theme-foreground)] mb-4">
          Interactive portfolio showcasing projects and experience.
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
        <h2 className="text-2xl font-bold mb-3 mt-6 text-[var(--theme-type)]">Tech Stack</h2>
        <p className="text-[var(--theme-foreground)]">
          Built with Vite + React + TypeScript + Tailwind + shadcn/ui
        </p>
      </div>
      );
      
    default:
      // Check if it's a project file
      if (path.startsWith('/projects/')) {
        const projectId = parseInt(path.split('/')[2]);
        const project = projects.find(p => p.id === projectId);
        
        if (project) {
          return (
            <div className="p-8">
              <div className="max-w-4xl mx-auto">
                {/* Project Header */}
                <div className="mb-6">
                  <h1 className="text-3xl font-bold mb-2 text-[var(--theme-method)]">{project.title}</h1>
                  <div className="flex items-center gap-2 text-sm text-[var(--theme-comment)]">
                    <span>{project.date}</span>
                    {project.award && (
                      <>
                        <span>•</span>
                        <span className="text-yellow-600">🏆 {project.award}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Project Image */}
                <div className="mb-6 rounded-lg overflow-hidden border border-[var(--theme-border)] bg-[var(--theme-sidebar)]">
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-auto"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-3 text-[var(--theme-type)]">Overview</h2>
                  <p className="text-[var(--theme-foreground)] leading-relaxed whitespace-pre-line">
                    {project.description}
                  </p>
                </div>

                {/* Technologies */}
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-3 text-[var(--theme-type)]">Technologies</h2>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <TechTag key={tech} tech={tech} />
                    ))}
                  </div>
                </div>

                {/* Links */}
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-3 text-[var(--theme-type)]">Links</h2>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-[var(--theme-sidebar)] border border-[var(--theme-border)] rounded hover:border-[var(--theme-method)] transition-colors"
                    >
                      <Github className="w-4 h-4" />
                      <span>GitHub</span>
                    </a>
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-[var(--theme-sidebar)] border border-[var(--theme-border)] rounded hover:border-[var(--theme-method)] transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>{project.liveUrlLabel || 'Live Demo'}</span>
                      </a>
                    )}
                    {project.paperUrl && (
                      <a
                        href={project.paperUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-[var(--theme-sidebar)] border border-[var(--theme-border)] rounded hover:border-[var(--theme-method)] transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Paper</span>
                      </a>
                    )}
                    {project.pypiUrl && (
                      <a
                        href={project.pypiUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-[var(--theme-sidebar)] border border-[var(--theme-border)] rounded hover:border-[var(--theme-method)] transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>PyPI</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Additional Images */}
                {project.images && project.images.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-3 text-[var(--theme-type)]">Gallery</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {project.images.map((img, idx) => (
                        <div key={idx} className="rounded-lg overflow-hidden border border-[var(--theme-border)]">
                          <img src={img} alt={`${project.title} ${idx + 1}`} className="w-full h-auto" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        }
      }
      
      return (
        <div ref={contentRef} className="p-8">
          <div className="text-[var(--theme-comment)]">
            // File not found: {path}
          </div>
        </div>
      );
  }
};
