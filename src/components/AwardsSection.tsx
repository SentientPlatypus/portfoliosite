import { Award, Trophy, Medal, Star } from 'lucide-react';

interface Award {
  id: string;
  title: string;
  organization: string;
  year: string;
  description: string;
  icon: 'award' | 'trophy' | 'medal' | 'star';
}

const awards: Award[] = [
  {
    id: '1',
    title: 'Amazon Future Engineer 2024',
    organization: 'Amazon',
    year: '2024',
    description: 'Selected for the prestigious Future Engineer program recognizing excellence in computer science',
    icon: 'trophy'
  },
  {
    id: '2',
    title: 'Best Developer Award',
    organization: 'TechCorp',
    year: '2023',
    description: 'Recognized for outstanding performance and innovation',
    icon: 'trophy'
  },
  {
    id: '3',
    title: 'Hackathon Winner',
    organization: 'CodeJam 2023',
    year: '2023',
    description: 'First place in the 48-hour coding competition',
    icon: 'medal'
  },
  {
    id: '4',
    title: 'Employee of the Month',
    organization: 'StartupXYZ',
    year: '2022',
    description: 'Delivered exceptional results and mentored team members',
    icon: 'star'
  },
  {
    id: '5',
    title: 'Open Source Contributor',
    organization: 'GitHub',
    year: '2022',
    description: 'Significant contributions to popular open source projects',
    icon: 'award'
  }
];

const getIcon = (iconType: string) => {
  const iconProps = { size: 20, className: "text-yellow-400" };
  switch (iconType) {
    case 'trophy':
      return <Trophy {...iconProps} />;
    case 'medal':
      return <Medal {...iconProps} />;
    case 'star':
      return <Star {...iconProps} />;
    default:
      return <Award {...iconProps} />;
  }
};

export const AwardsSection = () => {
  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="max-w-4xl">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2 text-left">Awards & Recognition</h2>
          <p className="text-sm text-green-400 font-mono">"Excellence recognized"</p>
        </div>
        
        <div className="relative pr-4" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          <div className="space-y-4">
            {awards.map((award) => (
              <div key={award.id} className="border border-border rounded-lg p-4 bg-card hover:border-primary/50 transition-colors">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(award.icon)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-yellow-400">{award.title}</h3>
                      <span className="text-sm text-purple-400 font-medium">{award.year}</span>
                    </div>
                    <p className="text-sm text-primary font-medium mb-2">{award.organization}</p>
                    <p className="text-sm text-muted-foreground">{award.description}</p>
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