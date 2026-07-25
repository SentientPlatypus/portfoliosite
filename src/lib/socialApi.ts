import { SOCIAL, publicDataUrl } from './socialConfig';

/* -------------------------------------------------------------------------- */
/* helpers                                                                    */
/* -------------------------------------------------------------------------- */

async function getJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`);
  return (await res.json()) as T;
}

/** Tries each loader in order and returns the first one that resolves. */
async function firstOk<T>(loaders: Array<() => Promise<T>>): Promise<T> {
  let lastError: unknown;
  for (const load of loaders) {
    try {
      return await load();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error('All sources failed');
}

const startOfUtcDay = (date: Date) =>
  Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

const DAY_MS = 86_400_000;

/* -------------------------------------------------------------------------- */
/* GitHub                                                                     */
/* -------------------------------------------------------------------------- */

export interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

export interface GitHubRepo {
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  pushed_at: string;
}

export interface GitHubStats {
  login: string;
  name: string | null;
  avatarUrl: string;
  publicRepos: number;
  followers: number;
  following: number;
  repos: GitHubRepo[];
}

export interface ContributionCalendar {
  days: ContributionDay[];
  total: number;
  currentStreak: number;
  longestStreak: number;
  busiestDay: ContributionDay | null;
}

export async function fetchGitHubStats(): Promise<GitHubStats> {
  const { username } = SOCIAL.github;
  const [user, repos] = await Promise.all([
    getJson<Record<string, unknown>>(`https://api.github.com/users/${username}`),
    getJson<GitHubRepo[]>(
      `https://api.github.com/users/${username}/repos?sort=pushed&per_page=6`,
    ),
  ]);

  return {
    login: String(user.login ?? username),
    name: (user.name as string | null) ?? null,
    avatarUrl: String(user.avatar_url ?? ''),
    publicRepos: Number(user.public_repos ?? 0),
    followers: Number(user.followers ?? 0),
    following: Number(user.following ?? 0),
    repos: Array.isArray(repos) ? repos : [],
  };
}

/**
 * Real contribution calendar (the same numbers GitHub shows on a profile),
 * sourced from a public mirror of GitHub's GraphQL contributions API.
 */
export async function fetchContributionCalendar(): Promise<ContributionCalendar> {
  const { username } = SOCIAL.github;
  const data = await getJson<{
    total: Record<string, number>;
    contributions: ContributionDay[];
  }>(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`);

  const today = startOfUtcDay(new Date());
  const days = (data.contributions ?? [])
    .filter((day) => Date.parse(day.date) <= today)
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    days,
    total: data.total?.lastYear ?? days.reduce((sum, day) => sum + day.count, 0),
    ...streaksFrom(days),
    busiestDay: days.reduce<ContributionDay | null>(
      (best, day) => (best === null || day.count > best.count ? day : best),
      null,
    ),
  };
}

function streaksFrom(days: ContributionDay[]) {
  let longestStreak = 0;
  let running = 0;

  for (const day of days) {
    running = day.count > 0 ? running + 1 : 0;
    longestStreak = Math.max(longestStreak, running);
  }

  // An empty day today shouldn't break a streak that is still alive — start
  // counting back from the most recent day that has activity.
  let currentStreak = 0;
  for (let i = days.length - 1; i >= 0; i -= 1) {
    if (days[i].count > 0) {
      currentStreak += 1;
    } else if (i !== days.length - 1) {
      break;
    }
  }

  return { currentStreak, longestStreak };
}

/* -------------------------------------------------------------------------- */
/* LeetCode                                                                   */
/* -------------------------------------------------------------------------- */

interface LeetCodeApiResponse {
  totalSolved: number;
  totalQuestions: number;
  easySolved: number;
  totalEasy: number;
  mediumSolved: number;
  totalMedium: number;
  hardSolved: number;
  totalHard: number;
  ranking: number;
  contributionPoint: number;
  reputation: number;
  submissionCalendar: Record<string, number>;
  recentSubmissions: Array<{
    title: string;
    titleSlug: string;
    timestamp: string;
    statusDisplay: string;
    lang: string;
  }>;
}

export interface LeetCodeSolve {
  title: string;
  titleSlug: string;
  url: string;
  lang: string;
  solvedAt: Date;
}

export interface LeetCodeStats {
  ranking: number;
  totalSolved: number;
  totalQuestions: number;
  breakdown: Array<{
    difficulty: 'Easy' | 'Medium' | 'Hard';
    solved: number;
    total: number;
  }>;
  contributionPoints: number;
  reputation: number;
  activeDays: number;
  currentStreak: number;
  recentSolves: LeetCodeSolve[];
}

export async function fetchLeetCodeStats(): Promise<LeetCodeStats> {
  const { username } = SOCIAL.leetcode;
  const data = await firstOk<LeetCodeApiResponse>([
    () =>
      getJson<LeetCodeApiResponse>(
        `https://leetcode-api-faisalshohag.vercel.app/${username}`,
      ),
    () =>
      getJson<LeetCodeApiResponse>(
        `https://alfa-leetcode-api.onrender.com/userProfile/${username}`,
      ),
  ]);

  const calendar = data.submissionCalendar ?? {};
  const activeTimestamps = Object.entries(calendar)
    .filter(([, count]) => count > 0)
    .map(([seconds]) => Number(seconds) * 1000)
    .sort((a, b) => a - b);

  const seen = new Set<string>();
  const recentSolves = (data.recentSubmissions ?? [])
    .filter((submission) => submission.statusDisplay === 'Accepted')
    .filter((submission) => {
      if (seen.has(submission.titleSlug)) return false;
      seen.add(submission.titleSlug);
      return true;
    })
    .slice(0, 5)
    .map((submission) => ({
      title: submission.title,
      titleSlug: submission.titleSlug,
      url: `https://leetcode.com/problems/${submission.titleSlug}/`,
      lang: submission.lang,
      solvedAt: new Date(Number(submission.timestamp) * 1000),
    }));

  return {
    ranking: data.ranking ?? 0,
    totalSolved: data.totalSolved ?? 0,
    totalQuestions: data.totalQuestions ?? 0,
    breakdown: [
      { difficulty: 'Easy', solved: data.easySolved ?? 0, total: data.totalEasy ?? 0 },
      {
        difficulty: 'Medium',
        solved: data.mediumSolved ?? 0,
        total: data.totalMedium ?? 0,
      },
      { difficulty: 'Hard', solved: data.hardSolved ?? 0, total: data.totalHard ?? 0 },
    ],
    contributionPoints: data.contributionPoint ?? 0,
    reputation: data.reputation ?? 0,
    activeDays: activeTimestamps.length,
    currentStreak: submissionStreak(activeTimestamps),
    recentSolves,
  };
}

function submissionStreak(activeTimestamps: number[]): number {
  if (activeTimestamps.length === 0) return 0;

  const today = startOfUtcDay(new Date());
  const activeDays = new Set(activeTimestamps.map((ms) => startOfUtcDay(new Date(ms))));
  const mostRecent = Math.max(...activeDays);

  // Only count a live streak; anything older than yesterday has already lapsed.
  if (today - mostRecent > DAY_MS) return 0;

  let streak = 0;
  for (let day = mostRecent; activeDays.has(day); day -= DAY_MS) {
    streak += 1;
  }
  return streak;
}

/* -------------------------------------------------------------------------- */
/* YouTube                                                                    */
/* -------------------------------------------------------------------------- */

export interface YouTubeVideo {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  publishedAt: Date;
}

export interface YouTubeStats {
  channelName: string;
  avatarUrl: string | null;
  subscribers: number;
  views: number;
  videos: number;
  latestVideo: YouTubeVideo | null;
}

export async function fetchYouTubeStats(): Promise<YouTubeStats> {
  const { channelId } = SOCIAL.youtube;

  const [counts, latestVideo] = await Promise.all([
    fetchYouTubeCounts(channelId),
    fetchLatestVideo(channelId).catch(() => null),
  ]);

  return { ...counts, latestVideo };
}

type YouTubeCounts = Omit<YouTubeStats, 'latestVideo'>;

function fetchYouTubeCounts(channelId: string): Promise<YouTubeCounts> {
  return firstOk<YouTubeCounts>([
    async () => {
      const data = await getJson<{
        counts: Array<{ value: string; count: number }>;
        user: Array<{ value: string; count: string }>;
      }>(`https://mixerno.space/api/youtube-channel-counter/user/${channelId}`);

      const pick = (key: string) =>
        data.counts?.find((entry) => entry.value === key)?.count ?? 0;
      const meta = (key: string) =>
        data.user?.find((entry) => entry.value === key)?.count ?? null;

      return {
        channelName: meta('name') ?? 'Sentient Platypus',
        avatarUrl: meta('pfp'),
        subscribers: pick('subscribers'),
        views: pick('views'),
        videos: pick('videos'),
      };
    },
    async () => {
      const data = await getJson<{
        counters: {
          api?: { subscriberCount: number; viewCount: number; videoCount: number };
          estimation?: { subscriberCount: number; viewCount: number; videoCount: number };
        };
      }>(`https://api.socialcounts.org/youtube-live-subscriber-count/${channelId}`);

      const stats = data.counters?.api ?? data.counters?.estimation;
      if (!stats) throw new Error('socialcounts returned no counters');

      return {
        channelName: 'Sentient Platypus',
        avatarUrl: null,
        subscribers: stats.subscriberCount,
        views: stats.viewCount,
        videos: stats.videoCount,
      };
    },
  ]);
}

/**
 * The channel's Atom feed has the newest upload but no CORS headers, so it has
 * to come through a reader/proxy.
 */
function fetchLatestVideo(channelId: string): Promise<YouTubeVideo | null> {
  const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

  return firstOk<YouTubeVideo | null>([
    async () => {
      const data = await getJson<{
        status: string;
        items?: Array<{
          title: string;
          link: string;
          guid: string;
          pubDate: string;
          thumbnail: string;
        }>;
      }>(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`);

      const item = data.items?.[0];
      if (!item) throw new Error('rss2json returned no items');

      const id = item.guid.replace('yt:video:', '');
      return {
        id,
        title: item.title,
        url: item.link,
        thumbnail: item.thumbnail || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        publishedAt: new Date(item.pubDate.replace(' ', 'T') + 'Z'),
      };
    },
    async () => {
      const res = await fetch(
        `https://corsproxy.io/?url=${encodeURIComponent(feedUrl)}`,
      );
      if (!res.ok) throw new Error(`Feed proxy failed: ${res.status}`);

      const feed = new DOMParser().parseFromString(await res.text(), 'text/xml');
      const entry = feed.querySelector('entry');
      if (!entry) throw new Error('Feed contained no entries');

      const id = entry.getElementsByTagName('yt:videoId')[0]?.textContent ?? '';
      return {
        id,
        title: entry.querySelector('title')?.textContent ?? 'Latest upload',
        url: `https://www.youtube.com/watch?v=${id}`,
        thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        publishedAt: new Date(entry.querySelector('published')?.textContent ?? Date.now()),
      };
    },
  ]);
}

/* -------------------------------------------------------------------------- */
/* Spotify                                                                    */
/* -------------------------------------------------------------------------- */

export type SpotifySource = 'now-playing' | 'recently-played' | 'liked' | 'pinned';

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: string;
  album: string | null;
  albumImage: string | null;
  url: string;
  durationMs: number | null;
  progressMs: number | null;
  isPlaying: boolean;
  source: SpotifySource;
  /** When the snapshot behind this track was generated. */
  updatedAt: Date | null;
}

interface SpotifySnapshot {
  updatedAt?: string;
  isPlaying?: boolean;
  source?: SpotifySource;
  track?: {
    id: string;
    name: string;
    artists: string;
    album?: string | null;
    albumImage?: string | null;
    url?: string;
    durationMs?: number | null;
    progressMs?: number | null;
  };
}

export async function fetchSpotifyTrack(): Promise<SpotifyTrack> {
  return firstOk<SpotifyTrack>([
    async () => {
      const snapshot = await getJson<SpotifySnapshot>(
        `${publicDataUrl('spotify.json')}?t=${Date.now()}`,
        { cache: 'no-store' },
      );
      const track = snapshot.track;
      if (!track?.id) throw new Error('Snapshot has no track');

      return {
        id: track.id,
        name: track.name,
        artists: track.artists,
        album: track.album ?? null,
        albumImage: track.albumImage ?? null,
        url: track.url ?? `https://open.spotify.com/track/${track.id}`,
        durationMs: track.durationMs ?? null,
        progressMs: track.progressMs ?? null,
        isPlaying: Boolean(snapshot.isPlaying),
        source: snapshot.source ?? 'now-playing',
        updatedAt: snapshot.updatedAt ? new Date(snapshot.updatedAt) : null,
      };
    },
    // No snapshot yet: fall back to the pinned track, hydrated through the
    // keyless oEmbed endpoint so the artwork and title stay correct.
    async () => {
      const { id, artists } = SOCIAL.spotify.fallbackTrack;
      const data = await getJson<{ title: string; thumbnail_url: string }>(
        `https://open.spotify.com/oembed?url=https://open.spotify.com/track/${id}`,
      );

      return {
        id,
        name: data.title,
        artists,
        album: null,
        albumImage: data.thumbnail_url ?? null,
        url: `https://open.spotify.com/track/${id}`,
        durationMs: null,
        progressMs: null,
        isPlaying: false,
        source: 'pinned',
        updatedAt: null,
      };
    },
  ]);
}

/* -------------------------------------------------------------------------- */
/* Clash Royale                                                               */
/* -------------------------------------------------------------------------- */

export interface ClashCard {
  name: string;
  level: number | null;
  image: string;
}

export interface ClashStats {
  name: string;
  tag: string;
  trophies: number;
  bestTrophies: number;
  kingLevel: number;
  arena: string | null;
  arenaIcon: string | null;
  leagueRating: number | null;
  bestLeagueRating: number | null;
  wins: number | null;
  losses: number | null;
  threeCrownWins: number | null;
  clan: string | null;
  currentDeck: ClashCard[];
  updatedAt: Date | null;
  isLive: boolean;
}

interface ClashSnapshot {
  updatedAt?: string;
  player?: {
    name: string;
    tag: string;
    trophies: number;
    bestTrophies: number;
    expLevel: number;
    wins?: number;
    losses?: number;
    threeCrownWins?: number;
    arena?: { name?: string };
    clan?: { name?: string };
    currentPathOfLegendSeasonResult?: { trophies?: number | null };
    bestPathOfLegendSeasonResult?: { trophies?: number | null };
    currentDeck?: Array<{ name: string; level: number; maxLevel: number; iconUrls?: { medium?: string } }>;
  };
}

/**
 * Supercell's API rejects browser requests (it needs a key bound to a server
 * IP), so live numbers arrive as a snapshot generated by CI. Without it we fall
 * back to the last values recorded by hand.
 */
export async function fetchClashStats(): Promise<ClashStats> {
  return firstOk<ClashStats>([
    async () => {
      const snapshot = await getJson<ClashSnapshot>(
        `${publicDataUrl('clash-royale.json')}?t=${Date.now()}`,
        { cache: 'no-store' },
      );
      const player = snapshot.player;
      if (!player?.tag) throw new Error('Snapshot has no player');

      return {
        name: player.name,
        tag: player.tag,
        trophies: player.trophies,
        bestTrophies: player.bestTrophies,
        kingLevel: player.expLevel,
        arena: player.arena?.name ?? null,
        arenaIcon: leagueIcon(player.arena?.name),
        leagueRating: player.currentPathOfLegendSeasonResult?.trophies ?? null,
        bestLeagueRating: player.bestPathOfLegendSeasonResult?.trophies ?? null,
        wins: player.wins ?? null,
        losses: player.losses ?? null,
        threeCrownWins: player.threeCrownWins ?? null,
        clan: player.clan?.name ?? null,
        currentDeck: (player.currentDeck ?? []).map((card) => ({
          name: card.name,
          level: card.maxLevel ? card.level + (14 - card.maxLevel) : card.level,
          image: card.iconUrls?.medium ?? '',
        })),
        updatedAt: snapshot.updatedAt ? new Date(snapshot.updatedAt) : null,
        isLive: true,
      };
    },
    async () => CLASH_FALLBACK,
  ]);
}

const LEAGUE_NUMBERS: Record<string, number> = {
  'challenger i': 1,
  'challenger ii': 2,
  'challenger iii': 3,
  'master i': 4,
  'master ii': 5,
  'master iii': 6,
  champion: 7,
  'grand champion': 8,
  'royal champion': 9,
  'ultimate champion': 10,
};

function leagueIcon(arenaName?: string): string | null {
  const league = LEAGUE_NUMBERS[arenaName?.trim().toLowerCase() ?? ''];
  return league
    ? `https://cdns3.royaleapi.com/cdn-cgi/image/w=64,h=64,format=auto/static/img/arenas-fs8/64x64/league${league}-fs8.png`
    : null;
}

const CDN = 'https://cdns3.royaleapi.com/cdn-cgi/image/w=150,h=180,format=auto/static/img/cards/v5-989631e2';

/** Last hand-recorded values for #22GQG09CL. */
const CLASH_FALLBACK: ClashStats = {
  name: 'Bagel',
  tag: SOCIAL.clashRoyale.tag,
  trophies: 9000,
  bestTrophies: 10000,
  kingLevel: 15,
  arena: 'Ultimate Champion',
  arenaIcon:
    'https://cdns3.royaleapi.com/cdn-cgi/image/w=64,h=64,format=auto/static/img/arenas-fs8/64x64/league10-fs8.png',
  leagueRating: null,
  bestLeagueRating: 1833,
  wins: null,
  losses: null,
  threeCrownWins: null,
  clan: null,
  currentDeck: [
    { name: 'Archers', level: null, image: `${CDN}/archers-ev1.png` },
    { name: 'Tesla', level: null, image: `${CDN}/tesla-ev1.png` },
    { name: 'X-Bow', level: null, image: `${CDN}/x-bow.png` },
    { name: 'Knight', level: null, image: `${CDN}/knight.png` },
    { name: 'Fireball', level: null, image: `${CDN}/fireball.png` },
    { name: 'Skeletons', level: null, image: `${CDN}/skeletons.png` },
    { name: 'Ice Spirit', level: null, image: `${CDN}/ice-spirit.png` },
    { name: 'The Log', level: null, image: `${CDN}/the-log.png` },
  ],
  updatedAt: null,
  isLive: false,
};
