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

  return (
    <div ref={containerRef} className="relative h-screen flex items-center justify-center overflow-hidden">
      <div className="w-full max-w-7xl mx-auto px-8">
        <div className="relative flex items-center justify-center h-full">
          {/* Horizontal line that moves */}
          <div 
            className="absolute top-1/2 h-0.5 bg-foreground transition-all duration-700 ease-in-out"
            style={{
              left: `${20 + (activeIndex * 20)}%`,
              width: `${60 - (activeIndex * 10)}%`,
              transform: 'translateY(-50%)'
            }}
          ></div>
          
          {/* Timeline items in horizontal layout */}
          <div className="flex items-center justify-center w-full space-x-32">
            {workExperiences.map((experience, index) => {
              const isActive = index === activeIndex;
              const distance = Math.abs(index - activeIndex);
              
              return (
                <div
                  key={experience.id}
                  className={`relative transition-all duration-700 ease-in-out text-center ${
                    isActive 
                      ? 'opacity-100 scale-100' 
                      : `opacity-${Math.max(20, 60 - distance * 20)} scale-${Math.max(75, 100 - distance * 15)}`
                  }`}
                >
                  {/* Timeline dot */}
                  <div 
                    className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full transition-all duration-500 ${
                      isActive
                        ? 'bg-foreground scale-150'
                        : 'bg-muted-foreground/40 scale-75'
                    }`}
                  ></div>
                  
                  {/* Content */}
                  <div className="pt-16">
                    <div className={`transition-all duration-700 font-light text-foreground mb-2 ${
                      isActive ? 'text-3xl' : 'text-xl'
                    }`}>
                      {experience.company}
                    </div>
                    
                    <div className={`transition-all duration-700 text-muted-foreground mb-1 ${
                      isActive ? 'text-lg' : 'text-sm'
                    }`}>
                      {experience.title}
                    </div>
                    
                    <div className={`transition-all duration-700 text-muted-foreground/60 ${
                      isActive ? 'text-base' : 'text-xs'
                    }`}>
                      {experience.duration}
                    </div>
                    
                    {isActive && (
                      <div className="mt-6 text-muted-foreground/80 space-y-1 animate-fade-in max-w-xs">
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