import { Award, Trophy, Medal, Star, Smile } from 'lucide-react';
interface Award {
  id: string;
  title: string;
  organization: string;
  year: string;
  description: string;
  icon: 'award' | 'trophy' | 'medal' | 'star' | 'amazon' | 'aws-smile';
}
const awards: Award[] = [{
  id: '2',
  title: 'Amazon Future Engineer 2024',
  organization: 'Amazon',
  year: '2024',
  description: 'One of 400 students selected nationwide for the Amazon Future Engineer program',
  icon: 'amazon'
}, {
  id: '1',
  title: 'Best Hardware Hack',
  organization: 'Cornell Makeathon',
  year: '2025',
  description: 'Proceeded to final presentation round and won best use of Hardware with AuraHat',
  icon: 'trophy'
}, {
  id: '3',
  title: 'Best Beginner Hack & Finalist',
  organization: 'Big Red Hacks',
  year: '2024',
  description: 'Proceeded to final presentation round and won best beginner hack with Lockd',
  icon: 'medal'
}, {
  id: '4',
  title: 'Semifinalist',
  organization: 'NASA Grabcad',
  year: '2024',
  description: 'Semifinalist in the NASA Lunar Gateway Cargo Storing design challenge',
  icon: 'star'
}, {
  id: '5',
  title: 'Deans List Semifinalist',
  organization: 'First Robotics Competition',
  year: '2023',
  description: 'Selected to represent Code Red Robotics at the Finger Lakes Regional ',
  icon: 'medal'
}, {
  id: '6',
  title: 'Cornell University Dept of CS Award',
  organization: 'Ithaca High School',
  year: '2024',
  description: 'Recognized for excellence in CS',
  icon: 'award'
}, {
  id: '7',
  title: 'Ruth E Polson Academic Achievement Award',
  organization: 'Ithaca High School',
  year: '2024',
  description: 'I think this was a top 10 a GPA award (?)',
  icon: 'award'
}, { id: '8',
  title: 'RIT Computing Medalist',
  organization: 'Rochester Institute of Technology',
  year: '2023',
  description: 'Scholarship',
  icon: 'award'}];

const getIcon = (iconType: string) => {
  const iconProps = {
    size: 20,
    className: "text-yellow-400"
  };
  switch (iconType) {
    case 'trophy':
      return <Trophy {...iconProps} />;
    case 'medal':
      return <Medal {...iconProps} />;
    case 'star':
      return <Star {...iconProps} />;
    case 'amazon':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-yellow-400">
          <path d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595.161-.102.276-.094.348.022.071.116.029.23-.126.344-3.744 2.166-7.785 3.25-12.092 3.25-2.938 0-5.84-.55-8.708-1.649-2.868 1.099-5.77 1.649-8.708 1.649-4.307 0-8.348-1.084-12.092-3.25-.155-.114-.197-.228-.126-.344zm8.31-10.96c0-1.224.995-2.219 2.219-2.219 1.224 0 2.219.995 2.219 2.219 0 1.224-.995 2.219-2.219 2.219-1.224 0-2.219-.995-2.219-2.219zm6.64 0c0-1.224.995-2.219 2.219-2.219 1.224 0 2.219.995 2.219 2.219 0 1.224-.995 2.219-2.219 2.219-1.224 0-2.219-.995-2.219-2.219z"/>
        </svg>
      );
    case 'aws-smile':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-yellow-400">
          <path d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595.161-.102.276-.094.348.022.071.116.029.23-.126.344-3.744 2.166-7.785 3.25-12.092 3.25-2.938 0-5.84-.55-8.708-1.649-2.868 1.099-5.77 1.649-8.708 1.649-4.307 0-8.348-1.084-12.092-3.25-.155-.114-.197-.228-.126-.344z"/>
        </svg>
      );
    default:
      return <Award {...iconProps} />;
  }
};
export const AwardsSection = () => {
  return <div className="p-4 h-full overflow-y-auto">
      <div className="max-w-4xl">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2 text-left">Awards & Recognition</h2>
          <p className="text-sm text-green-400 font-mono">
        </p>
        </div>
        
        <div className="relative pr-4" style={{
        maxHeight: '60vh',
        overflowY: 'auto'
      }}>
          <div className="space-y-4">
            {awards.map(award => <div key={award.id} className="border border-border rounded-lg p-4 bg-card hover:border-primary/50 transition-colors">
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
              </div>)}
          </div>
        </div>
      </div>
    </div>;
};