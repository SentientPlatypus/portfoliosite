import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { experiences as allExperiences, experienceCategories, isUpcoming } from '@/data/experience';
import { CompanyLogo, CompanyName } from './CompanyLogo';
import { TimelineTwoColumn } from './TimelineTwoColumn';

export const WIDE_MIN = 860; // px of available content width

// Flat list ordered by branch so keyboard navigation follows the visual order.
const experiences = experienceCategories.flatMap((cat) => allExperiences.filter((e) => e.category === cat.id));
const sectionStart = new Map(
  experienceCategories.map((cat) => [experiences.findIndex((e) => e.category === cat.id), cat]),
);

interface WorkTimelineProps {
  isSelected?: boolean;
  onNavigationRequest?: (direction: 'left' | 'right') => void;
  /** Standalone page: flow with the editor scroll instead of an inner scroller. */
  fill?: boolean;
}

export const WorkTimeline = ({ isSelected = false, onNavigationRequest, fill = false }: WorkTimelineProps = {}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isInWorkMode, setIsInWorkMode] = useState(false);
  const experienceRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const outerRef = useRef<HTMLDivElement>(null);
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWide(e.contentRect.width >= WIDE_MIN));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Scroll to active experience
  useEffect(() => {
    if (isInWorkMode && experienceRefs.current[activeIndex] && containerRef.current) {
      const experienceElement = experienceRefs.current[activeIndex];
      const container = containerRef.current;
      
      const containerRect = container.getBoundingClientRect();
      const experienceRect = experienceElement.getBoundingClientRect();
      
      // Calculate scroll position to center the experience
      const scrollTop = experienceElement.offsetTop - container.offsetTop - (containerRect.height / 2) + (experienceRect.height / 2);
      
      container.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
      });
    }
  }, [activeIndex, isInWorkMode]);

  // Sync work mode with selection state
  useEffect(() => {
    if (isSelected && !isInWorkMode) {
      setIsInWorkMode(true);
      setActiveIndex(0);
    } else if (!isSelected && isInWorkMode) {
      setIsInWorkMode(false);
    }
  }, [isSelected]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keys when this component is selected and in work mode
      if (!isSelected || !isInWorkMode) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setIsInWorkMode(false);
        onNavigationRequest?.('left');
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (e.key === 'ArrowDown') {
          setActiveIndex(prev => (prev + 1) % experiences.length);
        } else {
          setActiveIndex(prev => (prev - 1 + experiences.length) % experiences.length);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSelected, isInWorkMode, onNavigationRequest]);

  return (
    <div className="relative pt-2 pb-8" ref={outerRef}>
      <div className={`w-full mx-auto ${wide ? 'max-w-6xl' : 'max-w-4xl'}`}>
        <h2 className="text-lg font-semibold mb-2 text-left">Experience</h2>
        <p className="text-sm text-green-400 mb-6 font-mono">"Ain't no rest for the wicked, money don't grow on trees"</p>

        {wide ? (
          <div style={fill ? { overflowX: 'hidden' } : { maxHeight: '70vh', overflowY: 'auto', overflowX: 'hidden' }} className="pt-2">
            <TimelineTwoColumn />
          </div>
        ) : (
        <div className="relative" ref={containerRef} style={{ maxHeight: '60vh', overflowY: 'auto', overflowX: 'hidden' }}>
          {experiences.map((experience, index) => {
            const section = sectionStart.get(index);
            const lineColor = experience.category === 'research' ? 'var(--theme-string)' : 'var(--theme-method)';
            const active = isInWorkMode && activeIndex === index;
            return (
              <div key={experience.id}>
                {section && (
                  <div className={`flex items-center gap-2 mb-5 ${index > 0 ? 'mt-4' : ''}`} data-timeline-section={section.id}>
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: lineColor }} />
                    <span className="text-xs font-mono uppercase tracking-wider" style={{ color: lineColor }}>
                      {section.label}
                    </span>
                    <span className="hidden sm:inline text-xs font-mono text-muted-foreground">({section.branch})</span>
                    <span className="h-px flex-1 bg-border" />
                  </div>
                )}
                <motion.div
                  ref={(el) => (experienceRefs.current[index] = el)}
                  initial={reduce ? false : { opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="relative flex items-start gap-4 sm:gap-6 pb-10"
                  data-timeline-entry={experience.id}
                >
                  {/* Branch line segment + logo node */}
                  <div className="relative flex flex-col items-center self-stretch">
                    <span
                      className="absolute top-12 bottom-0 w-0.5 rounded-full"
                      style={{ backgroundColor: lineColor, opacity: 0.35 }}
                      aria-hidden="true"
                    />
                    <div
                      className={`relative z-10 rounded-xl transition-shadow duration-300 ${active ? 'shadow-[0_0_0_3px_hsl(var(--primary))]' : ''}`}
                    >
                      <CompanyLogo src={experience.logo} fullBleed={experience.logoFullBleed} company={experience.company} size={44} />
                    </div>
                  </div>

                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="space-y-1.5">
                      <h3 className="text-lg sm:text-xl font-semibold text-yellow-400">{experience.title}</h3>
                      <div className="font-medium text-primary">
                        <CompanyName company={experience.company} />
                      </div>
                      <div className="flex items-center gap-2 text-sm font-medium text-purple-400">{experience.period}
                        {isUpcoming(experience) && <span className="text-[10px] font-mono uppercase tracking-wide px-1.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-400/30" data-upcoming>upcoming</span>}</div>
                      {(experience.location || experience.type) && (
                        <div className="text-sm text-muted-foreground">
                          {[experience.location, experience.type].filter(Boolean).join(' · ')}
                        </div>
                      )}
                    </div>

                    {experience.description ? (
                      <p className="text-muted-foreground leading-relaxed">{experience.description}</p>
                    ) : (
                      <div className="h-px w-12 bg-border" aria-hidden="true" />
                    )}

                    {experience.skills && experience.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {experience.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-3 py-1 text-xs bg-orange-500/10 text-orange-400 rounded-full border border-orange-500/20"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
        )}
      </div>
    </div>
  );
};
