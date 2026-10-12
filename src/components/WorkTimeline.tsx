import { useEffect, useRef, useState } from 'react';
import { experiences } from '@/data/experience';

interface WorkTimelineProps {
  isSelected?: boolean;
  onNavigationRequest?: (direction: 'left' | 'right') => void;
}

export const WorkTimeline = ({ isSelected = false, onNavigationRequest }: WorkTimelineProps = {}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isInWorkMode, setIsInWorkMode] = useState(false);
  const experienceRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

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
    <div className="relative pt-2 pb-8">
      <div className="w-full max-w-4xl mx-auto">
        <h2 className="text-lg font-semibold mb-2 text-left">Professional Experience</h2>
        <p className="text-sm text-green-400 mb-6 font-mono">"Ain't no rest for the wicked, money don't grow on trees"</p>
        
        {/* Vertical timeline */}
        <div className="relative" ref={containerRef} style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {/* Vertical timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border"></div>
          
          {experiences.map((experience, index) => (
            <div
              key={experience.id}
              ref={el => experienceRefs.current[index] = el}
              className="relative flex items-start mb-12 last:mb-0"
            >
              {/* Timeline dot */}
              <div className={`w-4 h-4 rounded-full border-2 bg-background flex-shrink-0 mt-2 z-10 ${
                (isInWorkMode && activeIndex === index) ? 'border-primary bg-primary' : 'border-border'
              }`}></div>
              
              {/* Experience content */}
              <div className="ml-8 space-y-4 flex-1">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-yellow-400">
                    {experience.title}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-primary">{experience.company}</span>
                  </div>
                  <div className="text-sm font-medium text-purple-400">
                    {experience.period}
                  </div>
                  {(experience.location || experience.type) && (
                    <div className="text-sm text-muted-foreground">
                      {[experience.location, experience.type].filter(Boolean).join(' · ')}
                    </div>
                  )}
                </div>
                
                {experience.description ? (
                  <p className="text-muted-foreground leading-relaxed">
                    {experience.description}
                  </p>
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};