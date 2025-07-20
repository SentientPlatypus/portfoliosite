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
      <div className="w-full max-w-6xl mx-auto">
        <div className="relative flex items-center justify-center h-full">
          {/* Horizontal line */}
          <div className="absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-foreground transform -translate-y-1/2"></div>
          
          {/* Timeline container that slides */}
          <div 
            className="flex items-center transition-transform duration-700 ease-in-out"
            style={{
              transform: `translateX(-${activeIndex * 100}vw)`,
              width: `${workExperiences.length * 100}vw`
            }}
          >
            {workExperiences.map((experience, index) => {
              const isActive = index === activeIndex;
              
              return (
                <div
                  key={experience.id}
                  className="w-screen flex items-center justify-center relative"
                >
                  {/* Timeline dot */}
                  <div 
                    className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full transition-all duration-500 z-10 ${
                      isActive
                        ? 'bg-foreground scale-150'
                        : 'bg-muted-foreground/40'
                    }`}
                  ></div>
                  
                  {/* Content */}
                  <div className={`text-center transition-all duration-700 ${
                    isActive ? 'opacity-100' : 'opacity-0'
                  }`}>
                    <div className="pt-16">
                      <div className="text-4xl font-light text-foreground mb-4">
                        {experience.company}
                      </div>
                      
                      <div className="text-xl text-muted-foreground mb-2">
                        {experience.title}
                      </div>
                      
                      <div className="text-base text-muted-foreground/60 mb-8">
                        {experience.duration}
                      </div>
                      
                      {isActive && (
                        <div className="text-muted-foreground/80 space-y-2 animate-fade-in max-w-md mx-auto">
                          {experience.description.map((item, i) => (
                            <div key={i} className="text-sm">
                              {item}
                            </div>
                          ))}
                          
                          <div className="flex flex-wrap gap-2 justify-center mt-6">
                            {experience.skills.map((skill) => (
                              <span
                                key={skill}
                                className="px-3 py-1 text-xs bg-muted/20 text-muted-foreground rounded-full border border-muted"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
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