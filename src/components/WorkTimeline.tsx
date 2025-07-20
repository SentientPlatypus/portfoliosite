import { useEffect, useRef, useState } from 'react';

interface WorkExperience {
  id: string;
  title: string;
  company: string;
  duration: string;
  description: string[];
  skills: string[];
}

const workExperiences: WorkExperience[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'TechCorp',
    duration: '2023 - Present',
    description: [
      'Led development of React applications',
      'Improved performance by 40%',
      'Mentored junior developers'
    ],
    skills: ['React', 'TypeScript', 'Next.js', 'GraphQL']
  },
  {
    id: '2',
    title: 'Full Stack Developer',
    company: 'StartupXYZ',
    duration: '2021 - 2023',
    description: [
      'Built scalable web applications',
      'Implemented CI/CD pipelines',
      'Worked with Node.js and PostgreSQL'
    ],
    skills: ['Node.js', 'PostgreSQL', 'Docker', 'AWS']
  },
  {
    id: '3',
    title: 'Frontend Developer',
    company: 'WebAgency',
    duration: '2020 - 2021',
    description: [
      'Developed responsive websites',
      'Collaborated with design team',
      'Optimized for mobile performance'
    ],
    skills: ['Vue.js', 'SCSS', 'Webpack', 'Figma']
  },
  {
    id: '4',
    title: 'Junior Developer',
    company: 'DevCorp',
    duration: '2019 - 2020',
    description: [
      'Maintained legacy applications',
      'Learned modern web technologies',
      'Participated in code reviews'
    ],
    skills: ['JavaScript', 'jQuery', 'PHP', 'MySQL']
  }
];

export const WorkTimeline = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      if (isScrolling) return;
      
      setIsScrolling(true);
      
      if (e.deltaY > 0 && activeIndex < workExperiences.length - 1) {
        setActiveIndex(prev => prev + 1);
      } else if (e.deltaY < 0 && activeIndex > 0) {
        setActiveIndex(prev => prev - 1);
      }
      
      setTimeout(() => setIsScrolling(false), 800);
    };

    const container = containerRef.current;
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [activeIndex, isScrolling]);

  const getVisibleExperiences = () => {
    const visible = [];
    
    // Show previous experience
    if (activeIndex > 0) {
      visible.push({ ...workExperiences[activeIndex - 1], position: 'previous', index: activeIndex - 1 });
    }
    
    // Show current experience
    visible.push({ ...workExperiences[activeIndex], position: 'current', index: activeIndex });
    
    // Show next experience
    if (activeIndex < workExperiences.length - 1) {
      visible.push({ ...workExperiences[activeIndex + 1], position: 'next', index: activeIndex + 1 });
    }
    
    return visible;
  };

  return (
    <div ref={containerRef} className="relative h-screen flex items-center justify-center overflow-hidden bg-background">
      <div className="max-w-4xl mx-auto px-8">
        <div className="relative flex items-center justify-center min-h-[600px]">
          {/* Vertical line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-foreground"></div>
          
          {/* Timeline items */}
          <div className="relative w-full">
            {getVisibleExperiences().map((experience) => {
              const isActive = experience.position === 'current';
              const isPrevious = experience.position === 'previous';
              const isNext = experience.position === 'next';
              
              return (
                <div
                  key={experience.id}
                  className={`relative transition-all duration-700 ease-in-out mb-32 ${
                    isActive 
                      ? 'opacity-100' 
                      : 'opacity-30'
                  } ${
                    isPrevious ? 'transform -translate-y-16' :
                    isNext ? 'transform translate-y-16' :
                    ''
                  }`}
                >
                  {/* Content */}
                  <div className="ml-16">
                    <div className={`transition-all duration-700 ${
                      isActive ? 'text-4xl' : 'text-2xl'
                    } font-light text-foreground mb-4`}>
                      {experience.company}
                    </div>
                    
                    <div className={`transition-all duration-700 ${
                      isActive ? 'text-xl' : 'text-lg'
                    } text-muted-foreground mb-2`}>
                      {experience.title}
                    </div>
                    
                    <div className={`transition-all duration-700 ${
                      isActive ? 'text-base' : 'text-sm'
                    } text-muted-foreground/60 mb-6`}>
                      {experience.duration}
                    </div>
                    
                    {isActive && (
                      <div className="text-muted-foreground/80 space-y-1 animate-fade-in">
                        {experience.description.map((item, i) => (
                          <div key={i} className="text-sm">
                            {item}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Minimal progress indicator */}
          <div className="absolute bottom-8 left-8 text-muted-foreground/40 text-sm font-mono">
            {String(activeIndex + 1).padStart(2, '0')} / {String(workExperiences.length).padStart(2, '0')}
          </div>
        </div>
      </div>
    </div>
  );
};