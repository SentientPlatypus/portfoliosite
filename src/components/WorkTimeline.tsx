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
    title: 'Software Developer Intern, AWS Identity and Cloud Governance',
    company: 'Amazon Web Services (AWS)',
    duration: '05/2026 - 08/2026',
    description: [
      'Designed and shipped a real-time tracking pipeline for AWSs proprietary internal credential distribution service across 20+ regions using SQS and a single-writer DynamoDB architecture, reducing on-call investigation time by 45 minutes per ticket. Implemented idempotent, monotonic writes resilient to duplicate, out-of-order, and replayed events.',
      'Delivered a paginated, ownership-enforced read API with opaque cursors, summary-first responses, and parent-child change resolution.',
    ],
    skills: ['Java', 'Perl', 'SQS', 'DynamoDB']
  },
  {
    id: '1',
    title: 'Software Developer Intern, AWS Cryptography',
    company: 'Amazon Web Services (AWS)',
    duration: '05/2025 - 08/2025',
    description: [
      'Implemented dynamic throttling for proprietary AWS certificate management system across 54 regions, improving reliability under variable load and reducing on-call rate-limit adjustment time from two hours to under 30 seconds.',
      'Developed metrics, alarms, and canaries to rapidly detect emergent issues, reducing potential customer impact and improving service resilience.',
    ],
    skills: ['Java', 'TypeScript', 'Cloudwatch', 'EC2']
  },
  {
    id: '2',
    title: 'Student Researcher',
    company: 'Cornell Architectural Robotics Laboratory',
    duration: '12/2025 - Present',
    description: [
      'Mitigated excessive current draw in a robotic arm and reduced peak electrical load by 50% mass reduction via multiple iterations of generative design and 3D-printed structural components, alongside improved soldered connections.',
    ],
    skills: ['Generative Design', '3D Printing', 'Robotics', 'Electrical Systems']
  },
  {
    id: '3',
    title: 'Student Researcher, PCB Manufacturing',
    company: 'Cornell Sonic MEMS Laboratory',
    duration: '09/2024 - 12/2025',
    description: [
      'Fabricated and imaged PCBs for a GAN predicting print quality from printer parameters.',
    ],
    skills: ['PCB Design', 'GAN', 'Manufacturing']
  },
  {
    id: '4',
    title: 'Experiment Developer, B2B Experiment',
    company: 'Cornell SC Johnson College of Business',
    duration: '08/2024 - 12/2024',
    description: [
      'Built experimental B2B website to study seller behavior under ranking algorithms and scroll nudges.',
      'Tested with 100+ users; results showed nudges reduced retention.',
    ],
    skills: ['Full Stack Web Development', 'Python', 'User Research', 'Flask']
  },
  {
    id: '5',
    title: 'Research Intern',
    company: 'Cornell Autonomous Systems Laboratory',
    duration: '06/2023 - 12/2023',
    description: [
      'Developed LiDAR-based waypoint navigation ensuring wall collision-free robot movement using ROS.',
      'Collected 18,000 images and trained a support vector machine to detect user hand silhouettes.',
      'Resulted in a 33-participant study showing robot-initiated evacuation improves speed and perceived competence.',
      'Co-authored "Effects of Proactivity of Robot Behavior and Robot Failures on Humans and Robots Achieving a Shared Goal".',
    ],
    skills: ['ROS', 'LiDAR', 'SVM', 'Python', 'Computer Vision']
  },
  {
    id: '6',
    title: 'Systems Engineer Intern, Mission Performance V280 Team',
    company: 'Lockheed Martin',
    duration: '06/2023 - 08/2023',
    description: [
      'Designed ADS-B In, Air Traffic Management, and IFF Antennae functions for the Mission Performance V280 Team.',
    ],
    skills: ['JIRA', 'Confluence', 'Excell']
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