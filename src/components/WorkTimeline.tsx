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

interface WorkTimelineProps {
  isSelected?: boolean;
  onNavigationRequest?: (direction: 'left' | 'right') => void;
}

export const WorkTimeline = ({ isSelected = false, onNavigationRequest }: WorkTimelineProps = {}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isInWorkMode, setIsInWorkMode] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keys when this component is selected
      if (!isSelected) return;

      if (e.key === 'ArrowRight' && !isInWorkMode) {
        e.preventDefault();
        setIsInWorkMode(true);
        setActiveIndex(0);
      } else if (e.key === 'ArrowLeft' && isInWorkMode) {
        e.preventDefault();
        setIsInWorkMode(false);
        onNavigationRequest?.('left');
      } else if (isInWorkMode && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault();
        if (e.key === 'ArrowDown') {
          setActiveIndex(prev => (prev + 1) % workExperiences.length);
        } else {
          setActiveIndex(prev => (prev - 1 + workExperiences.length) % workExperiences.length);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSelected, isInWorkMode, onNavigationRequest]);

  return (
    <div className="relative py-8">
      <div className="w-full max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-12 text-center">Professional Experience</h2>
        
        {/* Vertical timeline */}
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border"></div>
          
          {workExperiences.map((experience, index) => (
            <div
              key={experience.id}
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
                    {experience.duration}
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
                      className="px-3 py-1 text-xs bg-orange-500/10 text-orange-400 rounded-full border border-orange-500/20"
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
  );
};