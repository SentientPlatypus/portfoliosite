import { Award, Trophy, Medal, Star, ExternalLink } from 'lucide-react';
interface Award {
  id: string;
  title: string;
  organization: string;
  year: string;
  description: string;
  icon: 'award' | 'trophy' | 'medal' | 'star';
  link: string;
}
const awards: Award[] = [{
  id: '2',
  title: 'Amazon Future Engineer 2024',
  organization: 'Amazon',
  year: '2024',
  description: 'One of 400 students selected nationwide for the Amazon Future Engineer program',
  icon: 'trophy',
  link: 'https://amazon.jobs/en/teams/university-programs/future-engineer'
}, {
  id: '1',
  title: 'Best Hardware Hack',
  organization: 'Cornell Makeathon',
  year: '2025',
  description: 'Proceeded to final presentation round and won best use of Hardware with AuraHat',
  icon: 'trophy',
  link: 'https://makeathon.org/'
}, {
  id: '3',
  title: 'Best Beginner Hack & Finalist',
  organization: 'Big Red Hacks',
  year: '2024',
  description: 'Proceeded to final presentation round and won best beginner hack with Lockd',
  icon: 'medal',
  link: 'https://bigredhacks.com/'
}, {
  id: '4',
  title: 'Semifinalist',
  organization: 'NASA Grabcad',
  year: '2024',
  description: 'Semifinalist in the NASA Lunar Gateway Cargo Storing design challenge',
  icon: 'star',
  link: 'https://grabcad.com/challenges'
}, {
  id: '5',
  title: 'Deans List Semifinalist',
  organization: 'First Robotics Competition',
  year: '2023',
  description: 'Selected to represent Code Red Robotics at the Finger Lakes Regional ',
  icon: 'medal',
  link: 'https://www.firstinspires.org/robotics/frc'
}, {
  id: '6',
  title: 'Cornell University Dept of CS Award',
  organization: 'Ithaca High School',
  year: '2024',
  description: 'Recognized for excellence in CS',
  icon: 'award',
  link: 'https://www.cs.cornell.edu/'
}, {
  id: '7',
  title: 'Ruth E Polson Academic Achievement Award',
  organization: 'Ithaca High School',
  year: '2024',
  description: 'I think this was a top 10 a GPA award (?)',
  icon: 'award',
  link: 'https://www.icsd.k12.ny.us/ihs'
}, {
  id: '8',
  title: 'RIT Computing Medalist',
  organization: 'Rochester Institute of Technology',
  year: '2023',
  description: 'Scholarship',
  icon: 'award',
  link: 'https://www.rit.edu/study/computing-exploration'
}];

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
            {awards.map(award => (
              <a 
                key={award.id} 
                href={award.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block border border-border rounded-lg p-4 bg-card hover:border-primary/50 hover:bg-card/80 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(award.icon)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-yellow-400 group-hover:text-yellow-300 transition-colors">{award.title}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-purple-400 font-medium">{award.year}</span>
                        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                    <p className="text-sm text-primary font-medium mb-2">{award.organization}</p>
                    <p className="text-sm text-muted-foreground">{award.description}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>;
};