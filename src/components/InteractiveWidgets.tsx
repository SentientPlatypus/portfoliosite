import { useState } from 'react';
import { Github, Music, Play, Trophy, Swords } from 'lucide-react';

interface WidgetProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  isClickable?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

const Widget = ({ icon, title, description, isClickable = true, onClick, children, isExpanded, onToggleExpand }: WidgetProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (onToggleExpand) {
      onToggleExpand();
    }
    if (onClick && isClickable) {
      onClick();
    }
  };

  return (
    <div
      className={`p-3 rounded-lg border transition-all duration-200 ${
        isHovered 
          ? 'border-primary/50 bg-card/80 shadow-md' 
          : 'border-border bg-card/50'
      } ${
        isExpanded ? 'col-span-2' : ''
      } ${
        isClickable || onToggleExpand ? 'cursor-pointer' : 'cursor-default'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div className="flex items-center space-x-2 mb-1">
        <div className="text-primary">{icon}</div>
        <span className="text-sm font-medium text-foreground">{title}</span>
      </div>
      <p className="text-xs text-muted-foreground mb-2">{description}</p>
      
      {isExpanded && children && (
        <div className="mt-3 pt-3 border-t border-border animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
};

const SpotifyWidget = ({ isExpanded, onToggleExpand }: { isExpanded: boolean; onToggleExpand: () => void }) => {
  const handleExternalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open('https://open.spotify.com/user/gene', '_blank');
  };

  return (
    <Widget
      icon={<Music className="w-4 h-4" />}
      title="Spotify"
      description="🎵 Currently Playing"
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
    >
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
            <Music className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Lofi Study Mix</p>
            <p className="text-xs text-muted-foreground">ChilledCow</p>
            <p className="text-xs text-green-500">• Live</p>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>2:34</span>
            <span>3:45</span>
          </div>
          <div className="w-full bg-muted h-1 rounded overflow-hidden">
            <div className="bg-green-500 h-1 rounded w-3/5 animate-pulse"></div>
          </div>
        </div>
        <div className="flex items-center justify-center space-x-4 text-muted-foreground">
          <button className="hover:text-foreground" onClick={handleExternalClick}>Open Spotify</button>
        </div>
      </div>
    </Widget>
  );
};

const YouTubeWidget = ({ isExpanded, onToggleExpand }: { isExpanded: boolean; onToggleExpand: () => void }) => {
  const handleExternalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open('https://youtube.com/@gene', '_blank');
  };

  return (
    <Widget
      icon={<Play className="w-4 h-4" />}
      title="YouTube"
      description="Latest: Building a React Portfolio"
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
    >
      <div className="space-y-2">
        <div className="aspect-video bg-gradient-to-br from-red-400 to-red-600 rounded flex items-center justify-center">
          <Play className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm font-medium">Building a React Portfolio</p>
          <p className="text-xs text-muted-foreground">23K views • 2 days ago</p>
          <button 
            className="mt-2 text-xs text-red-500 hover:text-red-400" 
            onClick={handleExternalClick}
          >
            View on YouTube
          </button>
        </div>
      </div>
    </Widget>
  );
};

const GitHubWidget = ({ isExpanded, onToggleExpand }: { isExpanded: boolean; onToggleExpand: () => void }) => {
  const handleExternalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open('https://github.com/gene', '_blank');
  };

  // Generate a realistic commit pattern for the last 12 weeks
  const generateCommitData = () => {
    const weeks = [];
    const today = new Date();
    
    for (let week = 11; week >= 0; week--) {
      const weekData = [];
      for (let day = 0; day < 7; day++) {
        const date = new Date(today);
        date.setDate(date.getDate() - (week * 7 + (6 - day)));
        
        // Simulate realistic commit patterns (more on weekdays, less on weekends)
        let commits = 0;
        if (day >= 1 && day <= 5) { // Monday to Friday
          commits = Math.floor(Math.random() * 8); // 0-7 commits
        } else { // Weekend
          commits = Math.floor(Math.random() * 3); // 0-2 commits
        }
        
        weekData.push({
          date: date.toISOString().split('T')[0],
          count: commits,
          level: commits === 0 ? 0 : commits <= 2 ? 1 : commits <= 4 ? 2 : commits <= 6 ? 3 : 4
        });
      }
      weeks.push(weekData);
    }
    return weeks;
  };

  const commitWeeks = generateCommitData();
  const totalCommits = commitWeeks.flat().reduce((sum, day) => sum + day.count, 0);

  const getIntensityColor = (level: number) => {
    const colors = [
      'bg-muted', // 0 commits
      'bg-green-200', // 1-2 commits
      'bg-green-400', // 3-4 commits  
      'bg-green-600', // 5-6 commits
      'bg-green-800'  // 7+ commits
    ];
    return colors[level];
  };

  return (
    <Widget
      icon={<Github className="w-4 h-4" />}
      title="GitHub"
      description={`${totalCommits} contributions in last 12 weeks`}
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">12 weeks ago</span>
          <span className="text-muted-foreground">Today</span>
        </div>
        <div className="grid grid-cols-12 gap-0.5">
          {commitWeeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-rows-7 gap-0.5">
              {week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`w-2 h-2 rounded-sm ${getIntensityColor(day.level)}`}
                  title={`${day.count} commits on ${day.date}`}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex space-x-0.5">
            {[0, 1, 2, 3, 4].map(level => (
              <div key={level} className={`w-2 h-2 rounded-sm ${getIntensityColor(level)}`} />
            ))}
          </div>
          <span>More</span>
        </div>
        <button 
          className="mt-2 text-xs text-foreground hover:text-primary" 
          onClick={handleExternalClick}
        >
          View GitHub Profile
        </button>
      </div>
    </Widget>
  );
};

const LeetCodeWidget = ({ isExpanded, onToggleExpand }: { isExpanded: boolean; onToggleExpand: () => void }) => {
  const handleExternalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open('https://leetcode.com/gene', '_blank');
  };

  return (
    <Widget
      icon={<Trophy className="w-4 h-4" />}
      title="LeetCode"
      description="Daily streak: 25 days"
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
    >
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-lg font-bold text-green-500">89</div>
            <div className="text-xs text-muted-foreground">Easy</div>
          </div>
          <div>
            <div className="text-lg font-bold text-yellow-500">45</div>
            <div className="text-xs text-muted-foreground">Medium</div>
          </div>
          <div>
            <div className="text-lg font-bold text-red-500">12</div>
            <div className="text-xs text-muted-foreground">Hard</div>
          </div>
        </div>
        <div className="text-xs text-muted-foreground text-center">
          Rank: 234,567 • Rating: 1,842
        </div>
        <button 
          className="mt-2 text-xs text-foreground hover:text-primary" 
          onClick={handleExternalClick}
        >
          View LeetCode Profile
        </button>
      </div>
    </Widget>
  );
};

const ClashRoyaleWidget = ({ isExpanded, onToggleExpand }: { isExpanded: boolean; onToggleExpand: () => void }) => {
  return (
    <Widget
      icon={<Swords className="w-4 h-4" />}
      title="Clash Royale"
      description="Arena 15 • King Level 14"
      isClickable={false}
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-center">
            <div className="text-lg font-bold text-purple-500">6,428</div>
            <div className="text-xs text-muted-foreground">Trophies</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-500">14</div>
            <div className="text-xs text-muted-foreground">King Level</div>
          </div>
        </div>
        <div className="flex space-x-1">
          {['🏰', '⚡', '🔥', '❄️'].map((emoji, index) => (
            <div key={index} className="w-8 h-8 bg-muted rounded flex items-center justify-center text-sm">
              {emoji}
            </div>
          ))}
        </div>
      </div>
    </Widget>
  );
};

export const InteractiveInfo = () => {
  const [expandedWidget, setExpandedWidget] = useState<string | null>(null);

  const toggleWidget = (widgetId: string) => {
    setExpandedWidget(expandedWidget === widgetId ? null : widgetId);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-2">Hey! I'm Gene</h2>
        <p className="text-sm text-muted-foreground mb-4">
          A passionate developer who loves creating beautiful and functional web applications.
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <SpotifyWidget 
          isExpanded={expandedWidget === 'spotify'} 
          onToggleExpand={() => toggleWidget('spotify')} 
        />
        <YouTubeWidget 
          isExpanded={expandedWidget === 'youtube'} 
          onToggleExpand={() => toggleWidget('youtube')} 
        />
        <GitHubWidget 
          isExpanded={expandedWidget === 'github'} 
          onToggleExpand={() => toggleWidget('github')} 
        />
        <LeetCodeWidget 
          isExpanded={expandedWidget === 'leetcode'} 
          onToggleExpand={() => toggleWidget('leetcode')} 
        />
        <ClashRoyaleWidget 
          isExpanded={expandedWidget === 'clash'} 
          onToggleExpand={() => toggleWidget('clash')} 
        />
      </div>
    </div>
  );
};