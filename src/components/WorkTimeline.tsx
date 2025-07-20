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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleWheel = (event: WheelEvent) => {
    event.preventDefault();
    
    if (event.deltaY > 0) {
      // Scroll down - move to next experience
      setActiveIndex((prev) => Math.min(prev + 1, workExperiences.length - 1));
    } else {
      // Scroll up - move to previous experience
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    }
  };

  // Center the active experience
  useEffect(() => {
    if (!scrollRef.current) return;
    
    const experienceWidth = 400; // Width of each experience card
    const spacing = 160; // Space between experiences  
    const totalWidth = experienceWidth + spacing;
    const containerWidth = scrollRef.current.clientWidth;
    const scrollPosition = (activeIndex * totalWidth) - (containerWidth / 2) + (experienceWidth / 2) + 160; // Add padding offset
    
    scrollRef.current.scrollTo({
      left: Math.max(0, scrollPosition),
      behavior: 'smooth'
    });
  }, [activeIndex]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative py-8">
      <div className="w-full">
        <h2 className="text-2xl font-bold mb-12 text-center">Professional Experience</h2>
        
        {/* Horizontal scrolling container */}
        <div 
          ref={scrollRef}
          className="overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex items-start gap-40 px-40 min-w-max relative">
            {/* Continuous timeline line */}
            <div className="absolute bottom-16 left-0 right-0 h-0.5 bg-border"></div>
            
            {workExperiences.map((experience, index) => (
              <div
                key={experience.id}
                className={`relative transition-all duration-500 w-96 flex-shrink-0 ${
                  activeIndex === index 
                    ? 'scale-105 opacity-100' 
                    : 'scale-95 opacity-50'
                }`}
              >
                {/* Experience content without background box */}
                <div className="space-y-4 p-6 mb-8 relative">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-foreground">
                      {experience.title}
                    </h3>
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <span className="font-medium text-primary">{experience.company}</span>
                    </div>
                  </div>
                  
                  <ul className="space-y-1 text-muted-foreground">
                    {experience.description.map((item, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-primary mr-2">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    {experience.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 text-xs bg-primary/10 text-primary rounded-full border border-primary/20"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  
                  {/* Scroll indicator positioned at bottom right of this experience */}
                  {activeIndex === index && index < workExperiences.length - 1 && (
                    <div className="absolute bottom-0 right-0 text-muted-foreground animate-pulse">
                      <div className="flex items-center space-x-1">
                        <span className="text-xs">Scroll right</span>
                        <span className="text-xs">→</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Employment duration under the timeline */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
                  <div className="text-sm font-medium text-primary whitespace-nowrap">
                    {experience.duration}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Visual indicator for scroll left */}
            {activeIndex > 0 && (
              <div className="fixed left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground animate-pulse">
                <div className="flex items-center space-x-1">
                  <span className="text-xs">←</span>
                  <span className="text-xs">Scroll left</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Progress indicator */}
        <div className="flex justify-center mt-8">
          <div className="flex space-x-2">
            {workExperiences.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  activeIndex === index ? 'bg-primary' : 'bg-border'
                }`}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};