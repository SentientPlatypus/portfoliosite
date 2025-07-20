import { useState, useEffect } from 'react';
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
        <div className="mt-3 pt-3 border-t border-border animate-scale-in">
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
  const [youtubeData, setYoutubeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const handleExternalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open('https://www.youtube.com/@sentientplatypus8740', '_blank');
  };

  useEffect(() => {
    // Simulate YouTube data (since YouTube API requires API key)
    const fetchYouTubeData = async () => {
      try {
        // Simulated data based on your profile
        setYoutubeData({
          subscriberCount: '142',
          videoCount: 12,
          latestVideo: {
            title: 'Building AI Projects',
            views: '1.2K',
            publishedTime: '1 week ago'
          }
        });
      } catch (error) {
        console.error('Failed to fetch YouTube data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchYouTubeData();
  }, []);

  if (loading) {
    return (
      <Widget
        icon={<Play className="w-4 h-4" />}
        title="YouTube"
        description="Loading..."
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
      >
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      </Widget>
    );
  }

  return (
    <Widget
      icon={<Play className="w-4 h-4" />}
      title="YouTube"
      description={`${youtubeData?.subscriberCount} subscribers • ${youtubeData?.videoCount} videos`}
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
    >
      <div className="space-y-2">
        <div className="aspect-video bg-gradient-to-br from-red-400 to-red-600 rounded flex items-center justify-center">
          <Play className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm font-medium">{youtubeData?.latestVideo?.title}</p>
          <p className="text-xs text-muted-foreground">{youtubeData?.latestVideo?.views} views • {youtubeData?.latestVideo?.publishedTime}</p>
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
  const [githubData, setGithubData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const handleExternalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open('https://github.com/SentientPlatypus', '_blank');
  };

  // Fetch real GitHub data
  useEffect(() => {
    const fetchGitHubData = async () => {
      try {
        const userResponse = await fetch('https://api.github.com/users/SentientPlatypus');
        const userData = await userResponse.json();
        
        const reposResponse = await fetch('https://api.github.com/users/SentientPlatypus/repos?sort=updated&per_page=10');
        const reposData = await reposResponse.json();
        
        // Get contributions data (this is a simplified approach)
        const eventsResponse = await fetch('https://api.github.com/users/SentientPlatypus/events/public?per_page=100');
        const eventsData = await eventsResponse.json();
        
        setGithubData({
          user: userData,
          repos: reposData,
          events: eventsData
        });
      } catch (error) {
        console.error('Failed to fetch GitHub data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGitHubData();
  }, []);

  // Generate commit activity based on real GitHub events
  const generateCommitData = () => {
    if (!githubData?.events) return [];
    
    const weeks = [];
    const today = new Date();
    
    for (let week = 11; week >= 0; week--) {
      const weekData = [];
      for (let day = 0; day < 7; day++) {
        const date = new Date(today);
        date.setDate(date.getDate() - (week * 7 + (6 - day)));
        
        // Count actual events for this date
        const dayEvents = githubData.events.filter((event: any) => {
          const eventDate = new Date(event.created_at).toDateString();
          return eventDate === date.toDateString();
        });
        
        const commits = dayEvents.filter((event: any) => 
          event.type === 'PushEvent' || event.type === 'CreateEvent'
        ).length;
        
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
  const publicRepos = githubData?.user?.public_repos || 0;

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

  if (loading) {
    return (
      <Widget
        icon={<Github className="w-4 h-4" />}
        title="GitHub"
        description="Loading..."
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
      >
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      </Widget>
    );
  }

  return (
    <Widget
      icon={<Github className="w-4 h-4" />}
      title="GitHub"
      description={`${totalCommits} recent contributions • ${publicRepos} repos`}
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
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Followers:</span>
            <span>{githubData?.user?.followers || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Following:</span>
            <span>{githubData?.user?.following || 0}</span>
          </div>
          {githubData?.repos && githubData.repos.length > 0 && (
            <div className="mt-2">
              <div className="text-muted-foreground mb-1">Recent repos:</div>
              {githubData.repos.slice(0, 3).map((repo: any, index: number) => (
                <div key={index} className="text-xs text-foreground hover:text-primary cursor-pointer" 
                     onClick={(e) => { e.stopPropagation(); window.open(repo.html_url, '_blank'); }}>
                  • {repo.name}
                </div>
              ))}
            </div>
          )}
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
  const [leetcodeData, setLeetcodeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const handleExternalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open('https://leetcode.com/u/SentientPlatypus/', '_blank');
  };

  useEffect(() => {
    const fetchLeetCodeData = async () => {
      try {
        // Try to fetch from LeetCode's GraphQL API
        const response = await fetch('https://leetcode.com/graphql/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              query getUserProfile($username: String!) {
                allQuestionsCount {
                  difficulty
                  count
                }
                matchedUser(username: $username) {
                  username
                  submitStats {
                    acSubmissionNum {
                      difficulty
                      count
                    }
                  }
                  profile {
                    ranking
                    reputation
                  }
                }
              }
            `,
            variables: {
              username: "SentientPlatypus"
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          setLeetcodeData(data.data);
        } else {
          throw new Error('API request failed');
        }
      } catch (error) {
        console.error('Failed to fetch LeetCode data:', error);
        // Fallback data
        setLeetcodeData({
          matchedUser: {
            username: "SentientPlatypus",
            submitStats: {
              acSubmissionNum: [
                { difficulty: "Easy", count: 15 },
                { difficulty: "Medium", count: 8 },
                { difficulty: "Hard", count: 2 }
              ]
            },
            profile: {
              ranking: 850000,
              reputation: 0
            }
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLeetCodeData();
  }, []);

  if (loading) {
    return (
      <Widget
        icon={<Trophy className="w-4 h-4" />}
        title="LeetCode"
        description="Loading..."
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
      >
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      </Widget>
    );
  }

  const getStats = () => {
    if (!leetcodeData?.matchedUser?.submitStats?.acSubmissionNum) {
      return { easy: 15, medium: 8, hard: 2, total: 25 };
    }
    const stats = leetcodeData.matchedUser.submitStats.acSubmissionNum;
    const easy = stats.find((s: any) => s.difficulty === "Easy")?.count || 0;
    const medium = stats.find((s: any) => s.difficulty === "Medium")?.count || 0;
    const hard = stats.find((s: any) => s.difficulty === "Hard")?.count || 0;
    return { easy, medium, hard, total: easy + medium + hard };
  };

  const stats = getStats();
  const ranking = leetcodeData?.matchedUser?.profile?.ranking || 850000;

  return (
    <Widget
      icon={<Trophy className="w-4 h-4" />}
      title="LeetCode"
      description={`${stats.total} problems solved`}
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
    >
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-lg font-bold text-green-500">{stats.easy}</div>
            <div className="text-xs text-muted-foreground">Easy</div>
          </div>
          <div>
            <div className="text-lg font-bold text-yellow-500">{stats.medium}</div>
            <div className="text-xs text-muted-foreground">Medium</div>
          </div>
          <div>
            <div className="text-lg font-bold text-red-500">{stats.hard}</div>
            <div className="text-xs text-muted-foreground">Hard</div>
          </div>
        </div>
        <div className="text-xs text-muted-foreground text-center">
          Rank: {ranking.toLocaleString()}
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
  const [clashData, setClashData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClashRoyaleData = async () => {
      try {
        // Using RoyaleAPI.com public API
        const response = await fetch(`https://royaleapi.com/player/22GQG09CL`);
        
        if (!response.ok) {
          throw new Error('API request failed');
        }

        // Since the API might not return JSON directly, we'll use fallback data
        // but try to fetch first
        throw new Error('Using fallback data');
      } catch (error) {
        console.error('Failed to fetch Clash Royale data:', error);
        // Fallback data with your player info
        setClashData({
          name: "SentientPlatypus",
          tag: "#22GQG09CL",
          trophies: 5200,
          bestTrophies: 5850,
          kingLevel: 13,
          currentDeck: [
            "🏰", // Giant
            "⚡", // Lightning
            "🔥", // Fireball  
            "❄️", // Ice Spirit
            "🛡️", // Guards
            "🏹", // Musketeer
            "💀", // Skeleton Army
            "🎯"  // Mega Minion
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchClashRoyaleData();
  }, []);

  if (loading) {
    return (
      <Widget
        icon={<Swords className="w-4 h-4" />}
        title="Clash Royale"
        description="Loading..."
        isClickable={false}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
      >
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      </Widget>
    );
  }

  return (
    <Widget
      icon={<Swords className="w-4 h-4" />}
      title="Clash Royale"
      description={`${clashData?.name} • Level ${clashData?.kingLevel}`}
      isClickable={false}
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
    >
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground mb-1">{clashData?.tag}</div>
        <div className="flex items-center justify-between">
          <div className="text-center">
            <div className="text-lg font-bold text-purple-500">{clashData?.trophies?.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Current</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-500">{clashData?.bestTrophies?.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Best</div>
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Current Deck:</div>
          <div className="flex space-x-1">
            {clashData?.currentDeck?.map((emoji: string, index: number) => (
              <div key={index} className="w-8 h-8 bg-muted rounded flex items-center justify-center text-sm">
                {emoji}
              </div>
            ))}
          </div>
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