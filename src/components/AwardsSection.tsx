import { Award, Trophy, Medal, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState } from 'react';
interface Award {
  id: string;
  title: string;
  organization: string;
  year: string;
  description: string;
  icon: 'award' | 'trophy' | 'medal' | 'star';
}
const awards: Award[] = [{
  id: '2',
  title: 'Amazon Future Engineer 2024',
  organization: 'Amazon',
  year: '2024',
  description: 'One of 400 students selected nationwide for the Amazon Future Engineer program',
  icon: 'trophy'
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
    default:
      return <Award {...iconProps} />;
  }
};
export const AwardsSection = () => {
  const [selectedAward, setSelectedAward] = useState<Award | null>(null);

  return <div className="p-4 h-full overflow-y-auto">
      <div className="max-w-4xl">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2 text-left">Awards & Recognition</h2>
          <p className="text-sm text-green-400 font-mono">
            Click on any award to view details
          </p>
        </div>
        
        <div className="relative pr-4" style={{
        maxHeight: '60vh',
        overflowY: 'auto'
      }}>
          <div className="space-y-4">
            {awards.map(award => 
              <Dialog key={award.id}>
                <DialogTrigger asChild>
                  <div className="border border-border rounded-lg p-4 bg-card hover:border-primary/50 hover:bg-card/80 transition-all cursor-pointer transform hover:scale-[1.02]">
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
                        <p className="text-sm text-muted-foreground line-clamp-2">{award.description}</p>
                      </div>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                      {getIcon(award.icon)}
                      <span className="text-yellow-400">{award.title}</span>
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-primary">{award.organization}</span>
                      <span className="text-sm text-purple-400 font-medium">{award.year}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{award.description}</p>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>
    </div>;
};