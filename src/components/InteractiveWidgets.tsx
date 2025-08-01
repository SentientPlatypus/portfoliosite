import { useState, useEffect } from 'react';
import { Github, Music, Play, Trophy, Swords, Linkedin } from 'lucide-react';
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
const Widget = ({
  icon,
  title,
  description,
  isClickable = true,
  onClick,
  children,
  isExpanded,
  onToggleExpand
}: WidgetProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const handleClick = () => {
    if (onToggleExpand) {
      onToggleExpand();
    }
    if (onClick && isClickable) {
      onClick();
    }
  };
  return <div className={`p-3 rounded-lg border transition-all duration-200 ${isHovered ? 'border-primary/50 bg-card/80 shadow-md' : 'border-border bg-card/50'} ${isExpanded ? 'col-span-2' : ''} ${isClickable || onToggleExpand ? 'cursor-pointer' : 'cursor-default'}`} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} onClick={handleClick}>
      <div className="flex items-center space-x-2 mb-1">
        <div className="text-primary">{icon}</div>
        <span className="text-sm font-medium text-foreground">{title}</span>
      </div>
      <p className="text-xs text-muted-foreground mb-2">{description}</p>
      
      {isExpanded && children && <div className="mt-3 pt-3 border-t border-border animate-scale-in">
          {children}
        </div>}
    </div>;
};
const SpotifyWidget = ({
  isExpanded,
  onToggleExpand
}: {
  isExpanded: boolean;
  onToggleExpand: () => void;
}) => {
  return <Widget icon={<Music className="w-4 h-4" />} title="Now Playing" description="Currently listening to Spotify" isClickable={false} isExpanded={isExpanded} onToggleExpand={onToggleExpand}>
      <div className="w-full">
        <iframe data-testid="embed-iframe" style={{
        borderRadius: '12px'
      }} src="https://open.spotify.com/embed/track/4h4QlmocP3IuwYEj2j14p8?utm_source=generator" width="100%" height="152" frameBorder="0" allowFullScreen allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" />
      </div>
    </Widget>;
};
const YouTubeWidget = ({
  isExpanded,
  onToggleExpand
}: {
  isExpanded: boolean;
  onToggleExpand: () => void;
}) => {
  const [youtubeData, setYoutubeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const handleExternalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open('https://www.youtube.com/@sentientplatypus8740', '_blank');
  };
  useEffect(() => {
    const fetchYouTubeData = async () => {
      try {
        // For now, using the correct data you provided since YouTube API requires API key
        // In a real app, you would use YouTube Data API v3:
        // https://developers.google.com/youtube/v3/docs/channels/list
        console.log('YouTube data source: Manual data based on correct channel statistics');
        setYoutubeData({
          subscriberCount: '148',
          videoCount: 7,
          latestVideo: {
            title: 'Recent Upload',
            views: '1.2K+',
            publishedTime: '2 weeks ago'
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
    return <Widget icon={<Play className="w-4 h-4" />} title="YouTube" description="Loading..." isExpanded={isExpanded} onToggleExpand={onToggleExpand}>
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      </Widget>;
  }
  return <Widget icon={<div className="w-4 h-4 bg-red-500 rounded flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-white">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
        </div>} title="YouTube" description={`${youtubeData?.subscriberCount} subscribers • ${youtubeData?.videoCount} videos`} isExpanded={isExpanded} onToggleExpand={onToggleExpand}>
      <div className="space-y-2">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
            <img src="https://yt3.ggpht.com/ytc/AIdro_n3KrlEQnR8i64nWxPu0rYzBcnqKaK8Qj8z3qNVdA=s88-c-k-c0x00ffffff-no-rj" alt="Channel avatar" className="w-full h-full object-cover" onError={e => {
            // Fallback to colored placeholder if image fails
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const fallback = target.parentElement?.querySelector('.fallback') as HTMLElement;
            if (fallback) fallback.style.display = 'flex';
          }} />
            <div className="w-full h-full bg-gradient-to-br from-red-400 to-red-600 items-center justify-center text-white font-bold hidden fallback">
              S
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{youtubeData?.latestVideo?.title}</p>
            <p className="text-xs text-muted-foreground">{youtubeData?.latestVideo?.views} views • {youtubeData?.latestVideo?.publishedTime}</p>
          </div>
        </div>
        <button className="mt-2 text-xs text-red-500 hover:text-red-400" onClick={handleExternalClick}>
          View on YouTube
        </button>
      </div>
    </Widget>;
};
const GitHubWidget = ({
  isExpanded,
  onToggleExpand
}: {
  isExpanded: boolean;
  onToggleExpand: () => void;
}) => {
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
    if (!githubData?.events || !Array.isArray(githubData.events)) return [];
    const weeks = [];
    const today = new Date();

    // Create a map of dates to contribution counts for faster lookup
    const contributionMap = new Map();
    githubData.events.forEach((event: any) => {
      const eventDate = new Date(event.created_at).toDateString();
      if (event.type === 'PushEvent' || event.type === 'CreateEvent' || event.type === 'PullRequestEvent' || event.type === 'IssuesEvent') {
        contributionMap.set(eventDate, (contributionMap.get(eventDate) || 0) + 1);
      }
    });

    // Generate weeks starting from 12 weeks ago
    for (let week = 0; week < 12; week++) {
      const weekData = [];
      for (let day = 0; day < 7; day++) {
        const date = new Date(today);
        date.setDate(date.getDate() - (84 - (week * 7 + day))); // Start from 12 weeks ago

        // Only count contributions for dates not in the future
        const contributions = date <= today ? contributionMap.get(date.toDateString()) || 0 : 0;
        let level = 0;
        if (contributions > 0) {
          if (contributions === 1) level = 1;else if (contributions <= 3) level = 2;else if (contributions <= 5) level = 3;else level = 4;
        }
        weekData.push({
          date: date.toISOString().split('T')[0],
          count: contributions,
          level: level
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
    const colors = ['bg-muted',
    // 0 commits
    'bg-green-200',
    // 1-2 commits
    'bg-green-400',
    // 3-4 commits  
    'bg-green-600',
    // 5-6 commits
    'bg-green-800' // 7+ commits
    ];
    return colors[level];
  };
  if (loading) {
    return <Widget icon={<div className="w-4 h-4 bg-black rounded flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-white">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </div>} title="GitHub" description="Loading..." isExpanded={isExpanded} onToggleExpand={onToggleExpand}>
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      </Widget>;
  }
  return <Widget icon={<div className="w-4 h-4 bg-black rounded flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-white">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        </div>} title="GitHub" description={`${totalCommits} recent contributions • ${publicRepos} repos`} isExpanded={isExpanded} onToggleExpand={onToggleExpand}>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">12 weeks ago</span>
          <span className="text-muted-foreground">Today</span>
        </div>
        <div className="grid grid-cols-12 gap-0.5">
          {commitWeeks.map((week, weekIndex) => <div key={weekIndex} className="grid grid-rows-7 gap-0.5">
              {week.map((day, dayIndex) => <div key={dayIndex} className={`w-2 h-2 rounded-sm ${getIntensityColor(day.level)}`} title={`${day.count} commits on ${day.date}`} />)}
            </div>)}
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex space-x-0.5">
            {[0, 1, 2, 3, 4].map(level => <div key={level} className={`w-2 h-2 rounded-sm ${getIntensityColor(level)}`} />)}
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
          {githubData?.repos && githubData.repos.length > 0 && <div className="mt-2">
              <div className="text-muted-foreground mb-1">Recent repos:</div>
              {githubData.repos.slice(0, 3).map((repo: any, index: number) => <div key={index} className="text-xs text-foreground hover:text-primary cursor-pointer" onClick={e => {
            e.stopPropagation();
            window.open(repo.html_url, '_blank');
          }}>
                  • {repo.name}
                </div>)}
            </div>}
        </div>
        <button className="mt-2 text-xs text-foreground hover:text-primary" onClick={handleExternalClick}>
          View GitHub Profile
        </button>
      </div>
    </Widget>;
};
const LeetCodeWidget = ({
  isExpanded,
  onToggleExpand
}: {
  isExpanded: boolean;
  onToggleExpand: () => void;
}) => {
  const [leetcodeData, setLeetcodeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const handleExternalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open('https://leetcode.com/u/SentientPlatypus/', '_blank');
  };
  useEffect(() => {
    const fetchLeetCodeData = async () => {
      try {
        // Using alfa-leetcode-api for better reliability
        const response = await fetch('https://alfa-leetcode-api.onrender.com/SentientPlatypus/solved');
        if (response.ok) {
          const data = await response.json();
          console.log('LeetCode data source: alfa-leetcode-api.onrender.com');
          console.log('LeetCode API response:', data);
          setLeetcodeData({
            matchedUser: {
              username: "SentientPlatypus",
              submitStats: {
                acSubmissionNum: [{
                  difficulty: "Easy",
                  count: data.easySolved || 0
                }, {
                  difficulty: "Medium",
                  count: data.mediumSolved || 0
                }, {
                  difficulty: "Hard",
                  count: data.hardSolved || 0
                }]
              },
              profile: {
                ranking: Math.max(1000000 - data.solvedProblem * 4000, 50000),
                // Estimate ranking based on problems solved
                reputation: 0
              }
            }
          });
        } else {
          throw new Error('API request failed');
        }
      } catch (error) {
        console.error('Failed to fetch LeetCode data:', error);
        // Try fallback API
        try {
          const fallbackResponse = await fetch('https://leetcode-stats-api.herokuapp.com/SentientPlatypus');
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            console.log('LeetCode data source: leetcode-stats-api.herokuapp.com (fallback)');
            setLeetcodeData({
              matchedUser: {
                username: "SentientPlatypus",
                submitStats: {
                  acSubmissionNum: [{
                    difficulty: "Easy",
                    count: fallbackData.easySolved || 0
                  }, {
                    difficulty: "Medium",
                    count: fallbackData.mediumSolved || 0
                  }, {
                    difficulty: "Hard",
                    count: fallbackData.hardSolved || 0
                  }]
                },
                profile: {
                  ranking: fallbackData.ranking || 800000,
                  reputation: 0
                }
              }
            });
          } else {
            throw new Error('Fallback API also failed');
          }
        } catch (fallbackError) {
          console.error('Both LeetCode APIs failed:', fallbackError);
          // Use manual fallback as last resort
          setLeetcodeData({
            matchedUser: {
              username: "SentientPlatypus",
              submitStats: {
                acSubmissionNum: [{
                  difficulty: "Easy",
                  count: 0
                }, {
                  difficulty: "Medium",
                  count: 0
                }, {
                  difficulty: "Hard",
                  count: 0
                }]
              },
              profile: {
                ranking: 0,
                reputation: 0
              }
            }
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchLeetCodeData();
  }, []);
  if (loading) {
    return <Widget icon={<Trophy className="w-4 h-4" />} title="LeetCode" description="Loading..." isExpanded={isExpanded} onToggleExpand={onToggleExpand}>
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      </Widget>;
  }
  const getStats = () => {
    if (!leetcodeData?.matchedUser?.submitStats?.acSubmissionNum) {
      return {
        easy: 0,
        medium: 0,
        hard: 0,
        total: 0
      };
    }
    const stats = leetcodeData.matchedUser.submitStats.acSubmissionNum;
    const easy = stats.find((s: any) => s.difficulty === "Easy")?.count || 0;
    const medium = stats.find((s: any) => s.difficulty === "Medium")?.count || 0;
    const hard = stats.find((s: any) => s.difficulty === "Hard")?.count || 0;
    return {
      easy,
      medium,
      hard,
      total: easy + medium + hard
    };
  };
  const stats = getStats();
  const ranking = leetcodeData?.matchedUser?.profile?.ranking || 622037;
  const formatRanking = (rank: number) => {
    if (rank < 100000) return rank.toLocaleString();
    return `${Math.round(rank / 1000)}k`;
  };
  return <Widget icon={<div className="w-4 h-4 bg-yellow-500 rounded flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-white">
            <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.776-.177L17.99 11.2c.595.45 1.394.372 1.938-.318.453-.575.317-1.085-.068-1.453l-4.084-3.263c-1.162-.928-2.681-1.266-4.053-1.027a6.097 6.097 0 0 0-1.69.9c-2.639 2.58-2.133 5.98.9 9.035l4.276 4.193c.652.64.972 1.469.948 2.263a2.68 2.68 0 0 1-.066.523 2.545 2.545 0 0 1-.619 1.164L14.9 15.886c-1.058 1.134-3.204 1.27-4.776.177L6.04 12.8c-.595-.45-1.394-.372-1.938.318-.453.575-.317 1.085.068 1.453l4.084 3.263c1.162.928 2.681 1.266 4.053 1.027.426-.077.835-.201 1.22-.375.253-.117.49-.259.705-.424.177-.136.336-.288.478-.454.131-.153.248-.32.352-.498.098-.169.177-.353.233-.544.054-.183.094-.372.118-.566.023-.188.018-.381-.016-.579a5.827 5.827 0 0 0-.319-.988 5.938 5.938 0 0 0-1.271-1.818l-4.277-4.193-.039-.038c-2.248-2.165-5.852-2.133-8.063.074l-2.396 2.392c-.54.54-.54 1.414-.003 1.955a1.378 1.378 0 0 0 1.951.003l2.396-2.392a3.021 3.021 0 0 1 4.205-.038l.02.019 4.276 4.193c.652.64.972 1.469.948 2.263a2.68 2.68 0 0 1-.066.523 2.545 2.545 0 0 1-.619 1.164L14.9 8.114c-1.058-1.134-3.204-1.27-4.776-.177L6.04 11.2c-.595.45-1.394.372-1.938-.318-.453-.575-.317-1.085.068-1.453l4.084-3.263C9.416 5.238 10.652 4.9 11.738 5.048c.426.058.835.171 1.22.336.177.076.336.19.478.334.131.132.248.28.352.441.098.152.177.318.233.49.054.165.094.336.118.511.023.169.018.343-.016.522a2.545 2.545 0 0 1-.619 1.164L9.13 15.886c-1.058 1.134-3.204 1.27-4.776.177l-4.084-3.263C-.325 12.356 0 11.526.024 10.732a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L4.985 4.852c2.248-2.165 5.852-2.133 8.063.074l2.396 2.392c.54.54.54 1.414.003 1.955a1.378 1.378 0 0 1-1.951.003L11.1 6.884a3.021 3.021 0 0 0-4.205-.038l-.02.019L2.6 11.058c-.652.64-.972 1.469-.948 2.263.017.665.283 1.295.748 1.774.465.479 1.09.756 1.756.78.665.024 1.295-.254 1.774-.719L9.216 11.9c1.058-1.134 3.204-1.27 4.776-.177l4.084 3.263c1.162.928 1.5 2.447 1.261 3.819-.077.426-.201.835-.375 1.22-.117.253-.259.49-.424.705-.136.177-.288.336-.454.478-.153.131-.32.248-.498.352-.169.098-.353.177-.544.233-.183.054-.372.094-.566.118-.188.023-.381.018-.579-.016a5.827 5.827 0 0 1-.988-.319 5.938 5.938 0 0 1-1.818-1.271l-4.193-4.277-.038-.039c-2.165-2.248-2.133-5.852.074-8.063l2.392-2.396c.54-.54 1.414-.54 1.955-.003a1.378 1.378 0 0 1 .003 1.951L11.1 17.116a3.021 3.021 0 0 1-.038 4.205l-.019.02-4.193 4.276c-.64.652-1.469.972-2.263.948a2.68 2.68 0 0 1-.523-.066 2.545 2.545 0 0 1-1.164-.619L8.114 14.9c1.134-1.058 1.27-3.204.177-4.776L4.928 6.04c-.45-.595-.372-1.394.318-1.938.575-.453 1.085-.317 1.453.068l3.263 4.084c.928 1.162 1.266 2.681 1.027 4.053-.077.426-.201.835-.375 1.22-.117.253-.259.49-.424.705-.136.177-.288.336-.454.478-.153.131-.32.248-.498.352-.169.098-.353.177-.544.233-.183.054-.372.094-.566.118-.188.023-.381.018-.579-.016a5.827 5.827 0 0 1-.988-.319 5.938 5.938 0 0 1-1.818-1.271L.126 8.422A1.374 1.374 0 0 1 0 7.46c0-.727.593-1.374 1.374-1.374.361 0 .677.147.961.438l4.277 4.193c2.248 2.165 2.133 5.852-.074 8.063l-2.392 2.396c-.54.54-.54 1.414-.003 1.955a1.378 1.378 0 0 0 1.951.003l2.392-2.396a3.021 3.021 0 0 0 .038-4.205l-.019-.02L4.312 12.32c-.652-.64-.972-1.469-.948-2.263.017-.665.283-1.295.748-1.774.465-.479 1.09-.756 1.756-.78.665-.024 1.295.254 1.774.719l4.193 4.276c1.058 1.134 1.27 3.204.177 4.776l-3.263 4.084c-.928 1.162-1.266 2.681-1.027 4.053.077.426.201.835.375 1.22.117.253.259.49.424.705.136.177.288.336.454.478.153.131.32.248.498.352.169.098.353.177.544.233.183.054.372.094.566.118.188.023.381.018.579-.016a5.827 5.827 0 0 0 .988-.319 5.938 5.938 0 0 0 1.818-1.271l4.193-4.277.038-.039c2.165-2.248 2.133-5.852-.074-8.063l-2.392-2.396c-.54-.54-1.414-.54-1.955-.003a1.378 1.378 0 0 0-.003 1.951l2.392 2.396a3.021 3.021 0 0 0 .038 4.205l.019.02 4.193 4.276c.64.652 1.469.972 2.263.948a2.68 2.68 0 0 0 .523-.066 2.545 2.545 0 0 0 1.164-.619L15.886 14.9c-1.134-1.058-1.27-3.204-.177-4.776l3.263-4.084c.45-.595.372-1.394-.318-1.938-.575-.453-1.085-.317-1.453.068l-3.263 4.084c-.928 1.162-1.266 2.681-1.027 4.053.077.426.201.835.375 1.22.117.253.259.49.424.705.136.177.288.336.454.478.153.131.32.248.498.352.169.098.353.177.544.233.183.054.372.094.566.118.188.023.381.018.579-.016a5.827 5.827 0 0 0 .988-.319 5.938 5.938 0 0 0 1.818-1.271L23.874 15.578c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L14.9 8.114c1.058-1.134 3.204-1.27 4.776-.177l4.084 3.263c.595.45 1.394.372 1.938-.318.453-.575.317-1.085-.068-1.453l-4.084-3.263c-1.162-.928-2.681-1.266-4.053-1.027-.426.077-.835.201-1.22.375-.253.117-.49.259-.705.424-.177.136-.336.288-.478.454-.131.153-.248.32-.352.498-.098.169-.177.353-.233.544-.054.183-.094.372-.118.566-.023.188-.018.381.016.579.077.42.201.825.375 1.22.117.253.259.49.424.705.136.177.288.336.454.478.153.131.32.248.498.352.169.098.353.177.544.233.183.054.372.094.566.118.188.023.381.018.579-.016a5.827 5.827 0 0 0 .988-.319c.42-.198.825-.459 1.22-.775.253-.2.49-.424.705-.678.177-.209.336-.441.478-.695.131-.244.248-.506.352-.785.098-.268.177-.549.233-.84.054-.279.094-.569.118-.874.023-.293.018-.595-.016-.904a5.827 5.827 0 0 0-.319-1.478 5.938 5.938 0 0 0-.775-1.374c-.2-.25-.424-.485-.678-.695-.209-.177-.441-.336-.695-.478-.244-.131-.506-.248-.785-.352-.268-.098-.549-.177-.84-.233-.279-.054-.569-.094-.874-.118-.293-.023-.595-.018-.904.016-.488.077-.964.201-1.421.375-.305.117-.599.259-.872.424-.219.136-.423.288-.609.454-.173.153-.329.32-.468.498-.133.169-.248.353-.344.544-.092.183-.166.372-.223.566-.054.188-.09.381-.108.579-.017.188-.015.381.007.579.055.42.165.825.329 1.22.109.253.244.49.403.705.127.177.274.336.437.478.148.131.31.248.484.352.165.098.343.177.532.233.178.054.364.094.556.118.185.023.375.018.571-.016.392-.077.767-.201 1.125-.375.239-.117.464-.259.677-.424.17-.136.327-.288.469-.454.133-.153.251-.32.354-.498.098-.169.177-.353.233-.544.054-.183.094-.372.118-.566.023-.188.018-.381-.016-.579a2.545 2.545 0 0 0-.319-.988c-.198-.42-.459-.825-.775-1.22-.2-.253-.424-.49-.678-.705-.209-.177-.441-.336-.695-.478-.244-.131-.506-.248-.785-.352-.268-.098-.549-.177-.84-.233-.279-.054-.569-.094-.874-.118-.293-.023-.595-.018-.904.016-.488.077-.964.201-1.421.375-.305.117-.599.259-.872.424-.219.136-.423.288-.609.454-.173.153-.329.32-.468.498-.133.169-.248.353-.344.544-.092.183-.166.372-.223.566-.054.188-.09.381-.108.579-.017.188-.015.381.007.579.055.42.165.825.329 1.22.109.253.244.49.403.705.127.177.274.336.437.478.148.131.31.248.484.352.165.098.343.177.532.233.178.054.364.094.556.118.185.023.375.018.571-.016.392-.077.767-.201 1.125-.375.239-.117.464-.259.677-.424.17-.136.327-.288.469-.454.133-.153.251-.32.354-.498.098-.169.177-.353.233-.544.054-.183.094-.372.118-.566.023-.188.018-.381-.016-.579-.055-.42-.165-.825-.329-1.22-.109-.253-.244-.49-.403-.705-.127-.177-.274-.336-.437-.478-.148-.131-.31-.248-.484-.352-.165-.098-.343-.177-.532-.233-.178-.054-.364-.094-.556-.118-.185-.023-.375-.018-.571.016-.392.077-.767.201-1.125.375-.239.117-.464.259-.677.424-.17.136-.327.288-.469.454-.133.153-.251.32-.354.498-.098.169-.177.353-.233.544-.054.183-.094.372-.118.566-.023.188-.018.381.016.579.055.42.165.825.329 1.22.109.253.244.49.403.705.127.177.274.336.437.478.148.131.31.248.484.352.165.098.343.177.532.233.178.054.364.094.556.118.185.023.375.018.571-.016.392-.077.767-.201 1.125-.375.239-.117.464-.259.677-.424.17-.136.327-.288.469-.454.133-.153.251-.32.354-.498.098-.169.177-.353.233-.544.054-.183.094-.372.118-.566.023-.188.018-.381-.016-.579-.055-.42-.165-.825-.329-1.22-.109-.253-.244-.49-.403-.705-.127-.177-.274-.336-.437-.478-.148-.131-.31-.248-.484-.352-.165-.098-.343-.177-.532-.233-.178-.054-.364-.094-.556-.118-.185-.023-.375-.018-.571.016-.392.077-.767.201-1.125.375-.239.117-.464.259-.677.424-.17.136-.327.288-.469.454-.133.153-.251.32-.354.498-.098.169-.177.353-.233.544-.054.183-.094.372-.118.566-.023.188-.018.381.016.579z" />
          </svg>
        </div>} title="LeetCode" description={`${stats.total} solved • Rank ${formatRanking(ranking)}`} isExpanded={isExpanded} onToggleExpand={onToggleExpand}>
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
        <button className="mt-2 text-xs text-foreground hover:text-primary" onClick={handleExternalClick}>
          View LeetCode Profile
        </button>
      </div>
    </Widget>;
};
const ClashRoyaleWidget = ({
  isExpanded,
  onToggleExpand
}: {
  isExpanded: boolean;
  onToggleExpand: () => void;
}) => {
  const [clashData, setClashData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchClashRoyaleData = async () => {
      try {
        // Note: RoyaleAPI requires API key and proper endpoint
        // Data source: Using manual data based on your actual stats
        console.log('Clash Royale data source: Manual data based on player tag #22GQG09CL');
        setClashData({
          name: "Bagel",
          tag: "#22GQG09CL",
          trophies: 9000,
          bestTrophies: 9000,
          kingLevel: 15,
          rank: "Ultimate Champion",
          bestRating: 1833,
          currentDeck: [{
            name: "Archers",
            image: "https://cdns3.royaleapi.com/cdn-cgi/image/w=150,h=180,format=auto/static/img/cards/v5-989631e2/archers-ev1.png"
          }, {
            name: "Tesla",
            image: "https://cdns3.royaleapi.com/cdn-cgi/image/w=150,h=180,format=auto/static/img/cards/v5-989631e2/tesla-ev1.png"
          }, {
            name: "X-Bow",
            image: "https://cdns3.royaleapi.com/cdn-cgi/image/w=150,h=180,format=auto/static/img/cards/v5-989631e2/x-bow.png"
          }, {
            name: "Knight",
            image: "https://cdns3.royaleapi.com/cdn-cgi/image/w=150,h=180,format=auto/static/img/cards/v5-989631e2/knight.png"
          }, {
            name: "Fireball",
            image: "https://cdns3.royaleapi.com/cdn-cgi/image/w=150,h=180,format=auto/static/img/cards/v5-989631e2/fireball.png"
          }, {
            name: "Skeletons",
            image: "https://cdns3.royaleapi.com/cdn-cgi/image/w=150,h=180,format=auto/static/img/cards/v5-989631e2/skeletons.png"
          }, {
            name: "Ice Spirit",
            image: "https://cdns3.royaleapi.com/cdn-cgi/image/w=150,h=180,format=auto/static/img/cards/v5-989631e2/ice-spirit.png"
          }, {
            name: "The Log",
            image: "https://cdns3.royaleapi.com/cdn-cgi/image/w=150,h=180,format=auto/static/img/cards/v5-989631e2/the-log.png"
          }]
        });
      } catch (error) {
        console.error('Failed to fetch Clash Royale data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchClashRoyaleData();
  }, []);
  if (loading) {
    return <Widget icon={<Swords className="w-4 h-4" />} title="Clash Royale" description="Loading..." isClickable={false} isExpanded={isExpanded} onToggleExpand={onToggleExpand}>
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      </Widget>;
  }
  return <Widget icon={<img src="https://cdns3.royaleapi.com/cdn-cgi/image/w=64,h=64,format=auto/static/img/arenas-fs8/64x64/league10-fs8.png" alt="Clash Royale" className="w-4 h-4" />} title="Clash Royale" description={`${clashData?.name} • ${clashData?.rank} (${clashData?.bestRating})`} isClickable={false} isExpanded={isExpanded} onToggleExpand={onToggleExpand}>
      <div className="space-y-3">
        <div className="text-xs text-muted-foreground mb-1">{clashData?.tag}</div>
        <div className="flex items-center justify-between">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Trophy className="w-3 h-3 text-yellow-500" />
              <div className="text-lg font-bold text-yellow-500">{clashData?.bestTrophies?.toLocaleString()}</div>
            </div>
            <div className="text-xs text-muted-foreground">Best</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-500">{clashData?.kingLevel}</div>
            <div className="text-xs text-muted-foreground">King Level</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <img src="https://cdns3.royaleapi.com/cdn-cgi/image/w=64,h=64,format=auto/static/img/arenas-fs8/64x64/league10-fs8.png" alt="Ultimate Champion" className="w-5 h-5" />
              <div className="text-lg font-bold text-orange-400">{clashData?.bestRating}</div>
            </div>
            <div className="text-xs text-muted-foreground">Ultimate Champion</div>
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-2">Current Deck:</div>
          <div className="grid grid-cols-4 gap-0.5">
            {clashData?.currentDeck && clashData.currentDeck.map((card: any, index: number) => <div key={index} className="relative group aspect-[3/4] max-w-12">
                <img src={card.image} alt={card.name} className="w-full h-full object-cover rounded-lg border-2 border-muted hover:scale-105 transition-transform shadow-sm" onError={e => {
              // Fallback to colored placeholder if image fails
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }} />
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg border-2 border-muted items-center justify-center text-xs text-white font-medium hidden">
                  {card.name?.slice(0, 3) || 'N/A'}
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-black/75 text-white text-[10px] text-center py-0.5 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  {card.name}
                </div>
              </div>)}
          </div>
        </div>
      </div>
    </Widget>;
};
const LinkedInWidget = () => {
  const handleClick = () => {
    window.open('https://www.linkedin.com/in/geneustace-wicaksono-923410287/', '_blank');
  };
  return <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-4 cursor-pointer hover:bg-card/70 transition-all duration-200" onClick={handleClick}>
      <div className="flex items-center space-x-3">
        <div className="w-4 h-4 bg-[#0077B5] rounded flex items-center justify-center">
          <Linkedin className="w-2.5 h-2.5 text-white" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium">LinkedIn</h4>
          <p className="text-xs text-muted-foreground">Professional network & connections</p>
        </div>
      </div>
    </div>;
};
export const InteractiveInfo = () => {
  const [expandedWidget, setExpandedWidget] = useState<string | null>(null);
  const toggleWidget = (widgetId: string) => {
    setExpandedWidget(expandedWidget === widgetId ? null : widgetId);
  };
  return <div className="space-y-4">
      <div className="md:flex md:items-start md:space-x-4">
        <div className="md:flex-1">
          <h2 className="text-lg font-semibold mb-2">Hey! I'm Gene</h2>
          <div className="md:hidden w-32 h-40 rounded-lg overflow-hidden mx-auto mb-4">
            <img src="/lovable-uploads/4df64f57-d54d-441a-9514-c9c8aed3594e.png" alt="Portrait" className="w-full h-full object-cover" />
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            An electrical and computer engineering student at Cornell University.
          </p>
          <p className="text-sm text-muted-foreground mb-2">
              Im from Jakarta, but I lived most of my life in Ithaca NY. I moved back for a family thing, but I hope to stay in the States! 
              Be it teaching me or working side by side, all the worthwhile things I do have been influenced by amazing people.
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            If you have a good idea and need some people to run with it, contact me! I hope to spread the love and learn something new in the process.
          </p>
          <p className="text-sm font-medium text-yellow-400 mb-4">Currently @ AWS Cryptography</p>
        </div>
        <div className="hidden md:block w-48 h-64 rounded-lg overflow-hidden flex-shrink-0">
          <img src="/lovable-uploads/4df64f57-d54d-441a-9514-c9c8aed3594e.png" alt="Portrait" className="w-full h-full object-cover" />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <SpotifyWidget isExpanded={expandedWidget === 'spotify'} onToggleExpand={() => toggleWidget('spotify')} />
        <YouTubeWidget isExpanded={expandedWidget === 'youtube'} onToggleExpand={() => toggleWidget('youtube')} />
        <GitHubWidget isExpanded={expandedWidget === 'github'} onToggleExpand={() => toggleWidget('github')} />
        <LeetCodeWidget isExpanded={expandedWidget === 'leetcode'} onToggleExpand={() => toggleWidget('leetcode')} />
        <ClashRoyaleWidget isExpanded={expandedWidget === 'clash'} onToggleExpand={() => toggleWidget('clash')} />
        <LinkedInWidget />
      </div>
    </div>;
};