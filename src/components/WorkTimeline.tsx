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
    <div ref={containerRef} className="relative h-screen flex items-center justify-center overflow-hidden">
      <div className="max-w-6xl mx-auto px-8">
        <h2 className="text-2xl font-bold mb-16 text-center">Professional Experience</h2>
        
        <div className="relative flex items-center justify-center min-h-[600px]">
          {/* Vertical line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border transform -translate-x-1/2 z-0"></div>
          
          {/* Timeline items */}
          <div className="relative w-full flex flex-col items-center justify-center space-y-8">
            {getVisibleExperiences().map((experience) => {
              const isActive = experience.position === 'current';
              const isPrevious = experience.position === 'previous';
              const isNext = experience.position === 'next';
              
              return (
                <div
                  key={experience.id}
                  className={`relative transition-all duration-700 ease-in-out flex items-center w-full ${
                    isActive 
                      ? 'scale-100 opacity-100 z-10' 
                      : 'scale-75 opacity-40 z-5'
                  } ${
                    isPrevious ? 'transform -translate-y-8 translate-x-8' :
                    isNext ? 'transform translate-y-8 translate-x-8' :
                    ''
                  }`}
                >
                  {/* Timeline dot */}
                  <div 
                    className={`absolute left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full border-2 transition-all duration-500 z-20 ${
                      isActive
                        ? 'bg-primary border-primary scale-125 shadow-lg shadow-primary/50'
                        : 'bg-background border-border scale-75'
                    }`}
                  ></div>
                  
                  {/* Content */}
                  <div className={`bg-card rounded-lg border shadow-lg p-8 transition-all duration-700 ${
                    isActive 
                      ? 'w-full max-w-3xl ml-12' 
                      : 'w-80 ml-16'
                  }`}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h3 className={`font-semibold text-foreground transition-all duration-500 ${
                          isActive ? 'text-2xl' : 'text-lg'
                        }`}>
                          {experience.title}
                        </h3>
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <span className="font-medium text-primary">{experience.company}</span>
                          <span>•</span>
                          <span>{experience.duration}</span>
                        </div>
                      </div>
                      
                      {isActive && (
                        <>
                          <ul className="space-y-2 text-muted-foreground">
                            {experience.description.map((item, i) => (
                              <li key={i} className="flex items-start">
                                <span className="text-primary mr-2 mt-1">•</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                          
                          <div className="flex flex-wrap gap-2 mt-6">
                            {experience.skills.map((skill) => (
                              <span
                                key={skill}
                                className="px-3 py-1 text-xs bg-primary/10 text-primary rounded-full border border-primary/20"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Navigation hint */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center text-muted-foreground text-sm">
            Scroll to navigate • {activeIndex + 1} of {workExperiences.length}
          </div>
        </div>
      </div>
    </div>
  );
};