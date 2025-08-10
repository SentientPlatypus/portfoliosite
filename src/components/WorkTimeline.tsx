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
    title: 'Amazon Future Engineer Intern',
    company: 'AWS Cryptography',
    duration: '4/27/2025 - 8/15/2025',
    description: [
      'Implemented Dynamic Throttling for Certificate Authority',
      'Improved throttling performance for over 54 regions',
    ],
    skills: ['Java', 'TypeScript', 'Cloudwatch', 'EC2']
  },
  {
    id: '2',
    title: 'Intern',
    company: 'Cornell SonicMEMS Lab',
    duration: '2024 - Present',
    description: [
      'Print and image PCBs for GAN network. In SonicMEMS lab under Prof. Amit Lal.',
    ],
    skills: ['Volterra', 'BotFactory']
  },
  {
    id: '3',
    title: 'Experiment Developer',
    company: 'Cornell SC Johnson',
    duration: '2024',
    description: [
      'Created website to study how "nudging" affects B2B consumer behavior',
    ],
    skills: ['Python', 'Flask']
  },
  {
    id: '4',
    title: 'Research Intern',
    company: 'Cornell Autonommous Systems Lab',
    duration: '2023',
    description: [
      'Study determining whether human-initiated/robot-initiated evactuations are more effective.',
    ],
    skills: ['ROS', 'MatLab', 'Python']
  },
  {
    id: '5',
    title: 'Systems Intern',
    company: 'Lockheed Martin',
    duration: '2023',
    description: [
      'Designed ADS-B In, Air Traffic Management, and IFF Antennae status functions for the Mission Performance V280 Team.'
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
    <div className="relative pt-2 pb-8">
      <div className="w-full max-w-4xl mx-auto">
        <h2 className="text-lg font-semibold mb-2 text-left">Professional Experience</h2>
        <p className="text-sm text-green-400 mb-6 font-mono">"Ain't no rest for the wicked, money don't grow on trees"</p>
        
        {/* Vertical timeline */}
        <div className="relative" ref={containerRef} style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {/* Vertical timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border"></div>
          
          {workExperiences.map((experience, index) => (
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