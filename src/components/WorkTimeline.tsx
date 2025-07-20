import { useEffect, useRef, useState } from 'react';
import ScrollMagic from 'scrollmagic';

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
  const controllerRef = useRef<ScrollMagic.Controller | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize ScrollMagic controller
    const controller = new ScrollMagic.Controller();
    controllerRef.current = controller;

    // Create scenes for each work experience
    workExperiences.forEach((_, index) => {
      const triggerElement = containerRef.current?.querySelector(`[data-trigger="${index}"]`);
      if (!triggerElement) return;

      new ScrollMagic.Scene({
        triggerElement: triggerElement as Element,
        triggerHook: 0.5,
        offset: -100,
        duration: 200
      })
        .on('enter', () => setActiveIndex(index))
        .addTo(controller);
    });

    return () => {
      controller.destroy(true);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative py-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-12 text-center">Professional Experience</h2>
        
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border"></div>
          
          {/* Timeline items */}
          <div className="space-y-16">
            {workExperiences.map((experience, index) => (
              <div
                key={experience.id}
                data-trigger={index}
                className={`relative transition-all duration-500 ${
                  activeIndex === index 
                    ? 'scale-100 opacity-100' 
                    : 'scale-95 opacity-60'
                }`}
              >
                {/* Timeline dot */}
                <div 
                  className={`absolute left-6 w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                    activeIndex === index
                      ? 'bg-primary border-primary scale-125'
                      : 'bg-background border-border'
                  }`}
                ></div>
                
                {/* Content */}
                <div className="ml-20 space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-foreground">
                      {experience.title}
                    </h3>
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <span className="font-medium text-primary">{experience.company}</span>
                      <span>•</span>
                      <span>{experience.duration}</span>
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
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};