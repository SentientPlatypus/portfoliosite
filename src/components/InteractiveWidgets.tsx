import { useState } from 'react';
import { Github, Music, Play, Trophy, Swords } from 'lucide-react';

interface WidgetProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  isClickable?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}

const Widget = ({ icon, title, description, isClickable = true, onClick, children }: WidgetProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`relative p-3 rounded-lg border border-border bg-card/50 backdrop-blur-sm transition-all duration-200 ${
        isClickable ? 'cursor-pointer hover:bg-card/80 hover:scale-105' : 'cursor-default hover:bg-card/70'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={isClickable ? onClick : undefined}
    >
      <div className="flex items-center space-x-2 mb-1">
        <div className="text-primary">{icon}</div>
        <span className="text-sm font-medium text-foreground">{title}</span>
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
      
      {isHovered && children && (
        <div className="absolute top-full left-0 mt-2 p-3 bg-popover border border-border rounded-lg shadow-lg z-10 min-w-64">
          {children}
        </div>
      )}
    </div>
  );
};

const SpotifyWidget = () => {
  const handleClick = () => {
    window.open('https://open.spotify.com/user/gene', '_blank');
  };

  return (
    <Widget
      icon={<Music className="w-4 h-4" />}
      title="Spotify"
      description="Currently listening to Lo-Fi Hip Hop"
      onClick={handleClick}
    >
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded"></div>
          <div>
            <p className="text-sm font-medium">Lo-Fi Study Beats</p>
            <p className="text-xs text-muted-foreground">Chill Playlist</p>
          </div>
        </div>
        <div className="w-full bg-muted h-1 rounded">
          <div className="bg-green-500 h-1 rounded w-1/3"></div>
        </div>
      </div>
    </Widget>
  );
};

const YouTubeWidget = () => {
  const handleClick = () => {
    window.open('https://youtube.com/@gene', '_blank');
  };

  return (
    <Widget
      icon={<Play className="w-4 h-4" />}
      title="YouTube"
      description="Latest: Building a React Portfolio"
      onClick={handleClick}
    >
      <div className="space-y-2">
        <div className="aspect-video bg-gradient-to-br from-red-400 to-red-600 rounded flex items-center justify-center">
          <Play className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm font-medium">Building a React Portfolio</p>
          <p className="text-xs text-muted-foreground">23K views • 2 days ago</p>
        </div>
      </div>
    </Widget>
  );
};

const GitHubWidget = () => {
  const handleClick = () => {
    window.open('https://github.com/gene', '_blank');
  };

  const commitData = [
    { day: 'Mon', commits: 3 },
    { day: 'Tue', commits: 7 },
    { day: 'Wed', commits: 2 },
    { day: 'Thu', commits: 5 },
    { day: 'Fri', commits: 8 },
    { day: 'Sat', commits: 1 },
    { day: 'Sun', commits: 4 },
  ];

  return (
    <Widget
      icon={<Github className="w-4 h-4" />}
      title="GitHub"
      description="42 commits this week"
      onClick={handleClick}
    >
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Contribution Activity</span>
          <span className="text-xs text-muted-foreground">This week</span>
        </div>
        <div className="flex space-x-1">
          {commitData.map((data, index) => (
            <div key={index} className="text-center">
              <div
                className="w-6 h-6 rounded bg-green-500/20 border border-green-500/40 mb-1"
                style={{
                  backgroundColor: `hsl(142 76% 36% / ${Math.min(data.commits / 10, 1)})`,
                }}
              ></div>
              <span className="text-xs text-muted-foreground">{data.day.charAt(0)}</span>
            </div>
          ))}
        </div>
      </div>
    </Widget>
  );
};

const LeetCodeWidget = () => {
  const handleClick = () => {
    window.open('https://leetcode.com/gene', '_blank');
  };

  return (
    <Widget
      icon={<Trophy className="w-4 h-4" />}
      title="LeetCode"
      description="Daily streak: 25 days"
      onClick={handleClick}
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
      </div>
    </Widget>
  );
};

const ClashRoyaleWidget = () => {
  return (
    <Widget
      icon={<Swords className="w-4 h-4" />}
      title="Clash Royale"
      description="Arena 15 • King Level 14"
      isClickable={false}
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
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-2">Hey! I'm Gene</h2>
        <p className="text-sm text-muted-foreground mb-4">
          A passionate developer who loves creating beautiful and functional web applications.
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <SpotifyWidget />
        <YouTubeWidget />
        <GitHubWidget />
        <LeetCodeWidget />
        <ClashRoyaleWidget />
      </div>
    </div>
  );
};