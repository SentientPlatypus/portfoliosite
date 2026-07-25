import { useEffect, useState, type ReactNode } from 'react';
import {
  ChevronDown,
  Code2,
  ExternalLink,
  Flame,
  Linkedin,
  Music,
  Trophy,
} from 'lucide-react';
import { ContributionGraph, ContributionLegend } from './ContributionGraph';
import {
  useClashStats,
  useContributionCalendar,
  useGitHubStats,
  useLeetCodeStats,
  useSpotifyTrack,
  useYouTubeStats,
} from '@/hooks/useSocialStats';
import { compactNumber, formatDay, formatDuration, timeAgo } from '@/lib/format';
import { SOCIAL, publicAssetUrl } from '@/lib/socialConfig';

/* -------------------------------------------------------------------------- */
/* shared shell                                                               */
/* -------------------------------------------------------------------------- */

interface WidgetProps {
  icon: ReactNode;
  title: string;
  subtitle: ReactNode;
  href?: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  children?: ReactNode;
}

const Widget = ({
  icon,
  title,
  subtitle,
  href,
  isExpanded,
  onToggleExpand,
  children,
}: WidgetProps) => (
  <div
    className={`group rounded-lg border p-3 transition-all duration-200 ${
      isExpanded
        ? 'col-span-2 border-primary/50 bg-card/80 shadow-md'
        : 'border-border bg-card/50 hover:border-primary/50 hover:bg-card/80 hover:shadow-md'
    } ${children ? 'cursor-pointer' : 'cursor-default'}`}
    role={children ? 'button' : undefined}
    tabIndex={children ? 0 : undefined}
    aria-expanded={children ? isExpanded : undefined}
    onClick={() => children && onToggleExpand()}
    onKeyDown={(event) => {
      if (children && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        onToggleExpand();
      }
    }}
  >
    <div className="flex items-center gap-2">
      <div className="shrink-0 text-primary">{icon}</div>
      <span className="text-sm font-medium text-foreground">{title}</span>

      <div className="ml-auto flex items-center gap-1.5">
        {href && (
          <a
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`Open ${title}`}
            className="text-muted-foreground opacity-0 transition-all hover:text-primary group-hover:opacity-100 focus:opacity-100"
            onClick={(event) => event.stopPropagation()}
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
        {children && (
          <ChevronDown
            className={`h-3 w-3 text-muted-foreground transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        )}
      </div>
    </div>

    <p className="mt-1 truncate text-xs text-muted-foreground">{subtitle}</p>

    {isExpanded && children && (
      <div className="mt-3 animate-in fade-in slide-in-from-top-1 border-t border-border pt-3 duration-200">
        {children}
      </div>
    )}
  </div>
);

const Stat = ({
  label,
  value,
  className = 'text-foreground',
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) => (
  <div className="text-center">
    <div className={`text-base font-bold leading-tight ${className}`}>{value}</div>
    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
  </div>
);

const Loading = ({ label = 'Loading…' }: { label?: string }) => (
  <span className="inline-flex items-center gap-1.5">
    <span className="h-2.5 w-2.5 animate-spin rounded-full border border-primary border-t-transparent" />
    {label}
  </span>
);

/* -------------------------------------------------------------------------- */
/* Spotify                                                                    */
/* -------------------------------------------------------------------------- */

const SOURCE_LABEL: Record<string, string> = {
  'now-playing': 'Now playing',
  'recently-played': 'Last played',
  liked: 'Recently liked',
  pinned: 'On repeat',
};

const Equalizer = () => (
  <span className="flex h-3 items-end gap-[2px]" aria-hidden>
    {[0, 0.2, 0.4, 0.15].map((delay, index) => (
      <span
        key={index}
        className="eq-bar w-[2px] rounded-sm bg-[#1DB954]"
        style={{ height: '100%', animationDelay: `${delay}s` }}
      />
    ))}
  </span>
);

const SpotifyWidget = ({
  isExpanded,
  onToggleExpand,
}: {
  isExpanded: boolean;
  onToggleExpand: () => void;
}) => {
  const { data: track, isLoading } = useSpotifyTrack();
  const progressMs = useLiveProgress(track);

  if (isLoading || !track) {
    return (
      <Widget
        icon={<Music className="h-4 w-4" />}
        title="Now Playing"
        subtitle={isLoading ? <Loading /> : 'Spotify is quiet right now'}
        href={SOCIAL.spotify.profileUrl}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
      />
    );
  }

  const label = SOURCE_LABEL[track.source] ?? 'Now playing';

  return (
    <Widget
      icon={
        track.isPlaying ? (
          <Equalizer />
        ) : (
          <Music className="h-4 w-4 text-[#1DB954]" />
        )
      }
      title={label}
      subtitle={
        <>
          <span className="text-foreground">{track.name}</span>
          {track.artists && <span> — {track.artists}</span>}
        </>
      }
      href={track.url}
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
    >
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          {track.albumImage && (
            <img
              src={track.albumImage}
              alt={track.album ?? track.name}
              className="h-16 w-16 shrink-0 rounded border border-border object-cover shadow-md"
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-[#1DB954]">
              {track.isPlaying && <Equalizer />}
              {label}
            </div>
            <a
              href={track.url}
              target="_blank"
              rel="noreferrer noopener"
              className="block truncate text-sm font-medium text-foreground hover:text-primary"
              onClick={(event) => event.stopPropagation()}
            >
              {track.name}
            </a>
            <p className="truncate text-xs text-muted-foreground">{track.artists}</p>
            {track.album && (
              <p className="truncate text-[10px] text-muted-foreground">{track.album}</p>
            )}
          </div>
        </div>

        {track.durationMs !== null && progressMs !== null && (
          <div className="space-y-1">
            <div className="h-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-[#1DB954] transition-all duration-1000 ease-linear"
                style={{
                  width: `${Math.min(100, (progressMs / track.durationMs) * 100)}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>{formatDuration(progressMs)}</span>
              <span>{formatDuration(track.durationMs)}</span>
            </div>
          </div>
        )}

        <iframe
          title={`Spotify player for ${track.name}`}
          src={`https://open.spotify.com/embed/track/${track.id}?utm_source=generator&theme=0`}
          width="100%"
          height="80"
          frameBorder="0"
          loading="lazy"
          style={{ borderRadius: 8 }}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        />

        <p className="text-[10px] text-muted-foreground">
          {track.updatedAt
            ? `Synced from Spotify ${timeAgo(track.updatedAt)}`
            : 'Live sync not configured yet — showing a pinned track.'}
        </p>
      </div>
    </Widget>
  );
};

/** Ticks the playhead forward between snapshot refreshes. */
function useLiveProgress(
  track: { progressMs: number | null; durationMs: number | null; isPlaying: boolean; updatedAt: Date | null } | undefined,
) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!track?.isPlaying) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [track?.isPlaying]);

  if (!track || track.progressMs === null) return null;
  if (!track.isPlaying || !track.updatedAt) return track.progressMs;

  const elapsed = now - track.updatedAt.getTime();
  return Math.min(track.progressMs + Math.max(elapsed, 0), track.durationMs ?? Infinity);
}

/* -------------------------------------------------------------------------- */
/* YouTube                                                                    */
/* -------------------------------------------------------------------------- */

const YouTubeIcon = () => (
  <div className="flex h-4 w-4 items-center justify-center rounded bg-red-600">
    <svg viewBox="0 0 24 24" className="h-2.5 w-2.5 fill-white">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  </div>
);

const YouTubeWidget = ({
  isExpanded,
  onToggleExpand,
}: {
  isExpanded: boolean;
  onToggleExpand: () => void;
}) => {
  const { data, isLoading, isError } = useYouTubeStats();

  const subtitle = isLoading ? (
    <Loading />
  ) : isError || !data ? (
    'Stats unavailable'
  ) : (
    `${compactNumber(data.subscribers)} subscribers • ${compactNumber(data.views)} views`
  );

  return (
    <Widget
      icon={<YouTubeIcon />}
      title="YouTube"
      subtitle={subtitle}
      href={SOCIAL.youtube.channelUrl}
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
    >
      {data && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {data.avatarUrl && (
              <img
                src={data.avatarUrl}
                alt={data.channelName}
                className="h-10 w-10 rounded-full border border-border object-cover"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {data.channelName}
              </p>
              <p className="text-xs text-muted-foreground">
                {SOCIAL.youtube.handle}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded border border-border bg-background/40 py-2">
            <Stat
              label="Subs"
              value={data.subscribers.toLocaleString()}
              className="text-red-500"
            />
            <Stat label="Views" value={compactNumber(data.views)} />
            <Stat label="Videos" value={data.videos} />
          </div>

          {data.latestVideo && (
            <a
              href={data.latestVideo.url}
              target="_blank"
              rel="noreferrer noopener"
              className="flex gap-3 rounded border border-border p-2 transition-colors hover:border-red-500/60 hover:bg-card"
              onClick={(event) => event.stopPropagation()}
            >
              <img
                src={data.latestVideo.thumbnail}
                alt={data.latestVideo.title}
                className="h-12 w-20 shrink-0 rounded object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Latest upload
                </p>
                <p className="truncate text-xs font-medium text-foreground">
                  {data.latestVideo.title}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {timeAgo(data.latestVideo.publishedAt)}
                </p>
              </div>
            </a>
          )}
        </div>
      )}
    </Widget>
  );
};

/* -------------------------------------------------------------------------- */
/* GitHub                                                                     */
/* -------------------------------------------------------------------------- */

const GitHubIcon = () => (
  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-foreground">
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-background">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  </div>
);

const GitHubWidget = ({
  isExpanded,
  onToggleExpand,
}: {
  isExpanded: boolean;
  onToggleExpand: () => void;
}) => {
  const profile = useGitHubStats();
  const calendar = useContributionCalendar();

  const subtitle = calendar.isLoading ? (
    <Loading />
  ) : calendar.data ? (
    `${calendar.data.total.toLocaleString()} contributions this year • ${
      profile.data?.publicRepos ?? 0
    } repos`
  ) : (
    `${profile.data?.publicRepos ?? 0} public repos`
  );

  return (
    <Widget
      icon={<GitHubIcon />}
      title="GitHub"
      subtitle={subtitle}
      href={SOCIAL.github.profileUrl}
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
    >
      <div className="space-y-3">
        {calendar.data ? (
          <>
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">
                  {calendar.data.total.toLocaleString()}
                </span>{' '}
                contributions in the last year
              </span>
              <ContributionLegend />
            </div>

            <ContributionGraph days={calendar.data.days} />

            <div className="grid grid-cols-3 gap-2 rounded border border-border bg-background/40 py-2">
              <Stat
                label="Current streak"
                value={
                  <span className="inline-flex items-center gap-1">
                    <Flame className="h-3.5 w-3.5 text-orange-400" />
                    {calendar.data.currentStreak}
                  </span>
                }
              />
              <Stat label="Longest streak" value={calendar.data.longestStreak} />
              <Stat
                label="Busiest day"
                value={calendar.data.busiestDay?.count ?? 0}
                className="text-[#39d353]"
              />
            </div>
            {calendar.data.busiestDay && (
              <p className="text-center text-[10px] text-muted-foreground">
                Best day was {formatDay(calendar.data.busiestDay.date)}
              </p>
            )}
          </>
        ) : (
          <p className="text-xs text-muted-foreground">
            {calendar.isLoading ? <Loading label="Loading contributions…" /> : 'Contribution graph unavailable right now.'}
          </p>
        )}

        {profile.data && (
          <>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <Stat label="Repos" value={profile.data.publicRepos} />
              <Stat label="Followers" value={profile.data.followers} />
              <Stat label="Following" value={profile.data.following} />
            </div>

            {profile.data.repos.length > 0 && (
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Recently pushed
                </p>
                {profile.data.repos.slice(0, 3).map((repo) => (
                  <a
                    key={repo.name}
                    href={repo.html_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex items-center gap-2 rounded px-1 py-0.5 text-xs text-foreground hover:bg-muted hover:text-primary"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <span className="truncate">{repo.name}</span>
                    {repo.language && (
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {repo.language}
                      </span>
                    )}
                    <span className="ml-auto shrink-0 text-[10px] text-muted-foreground">
                      {timeAgo(new Date(repo.pushed_at))}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Widget>
  );
};

/* -------------------------------------------------------------------------- */
/* LeetCode                                                                   */
/* -------------------------------------------------------------------------- */

const DIFFICULTY_COLOR = {
  Easy: { text: 'text-[#00b8a3]', bar: 'bg-[#00b8a3]' },
  Medium: { text: 'text-[#ffc01e]', bar: 'bg-[#ffc01e]' },
  Hard: { text: 'text-[#ff375f]', bar: 'bg-[#ff375f]' },
} as const;

const SolvedRing = ({ solved, total }: { solved: number; total: number }) => {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const ratio = total > 0 ? Math.min(solved / total, 1) : 0;

  return (
    <div className="relative h-16 w-16 shrink-0">
      <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          strokeWidth="6"
          className="stroke-muted"
        />
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          className="stroke-[#ffa116] transition-[stroke-dashoffset] duration-700"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - ratio)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-bold leading-none text-foreground">{solved}</span>
        <span className="text-[9px] text-muted-foreground">solved</span>
      </div>
    </div>
  );
};

const LeetCodeWidget = ({
  isExpanded,
  onToggleExpand,
}: {
  isExpanded: boolean;
  onToggleExpand: () => void;
}) => {
  const { data, isLoading, isError } = useLeetCodeStats();

  const subtitle = isLoading ? (
    <Loading />
  ) : isError || !data ? (
    'Stats unavailable'
  ) : (
    `${data.totalSolved} solved • rank #${data.ranking.toLocaleString()}`
  );

  return (
    <Widget
      icon={
        <div className="flex h-4 w-4 items-center justify-center rounded bg-[#ffa116]">
          <Code2 className="h-2.5 w-2.5 text-background" strokeWidth={3} />
        </div>
      }
      title="LeetCode"
      subtitle={subtitle}
      href={SOCIAL.leetcode.profileUrl}
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
    >
      {data && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <SolvedRing solved={data.totalSolved} total={data.totalQuestions} />
            <div className="flex-1 space-y-1.5">
              {data.breakdown.map(({ difficulty, solved, total }) => (
                <div key={difficulty}>
                  <div className="flex justify-between text-[10px]">
                    <span className={DIFFICULTY_COLOR[difficulty].text}>{difficulty}</span>
                    <span className="text-muted-foreground">
                      {solved}
                      <span className="opacity-60">/{total}</span>
                    </span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${DIFFICULTY_COLOR[difficulty].bar} transition-all duration-700`}
                      style={{ width: `${total > 0 ? (solved / total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded border border-border bg-background/40 py-2">
            <Stat
              label="Global rank"
              value={`#${data.ranking.toLocaleString()}`}
              className="text-[#ffa116]"
            />
            <Stat
              label="Streak"
              value={
                <span className="inline-flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5 text-orange-400" />
                  {data.currentStreak}
                </span>
              }
            />
            <Stat label="Active days" value={data.activeDays} />
          </div>

          {data.recentSolves.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Recently solved
              </p>
              {data.recentSolves.slice(0, 4).map((solve) => (
                <a
                  key={solve.titleSlug}
                  href={solve.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center gap-2 rounded px-1 py-0.5 text-xs text-foreground hover:bg-muted hover:text-primary"
                  onClick={(event) => event.stopPropagation()}
                >
                  <span className="truncate">{solve.title}</span>
                  <span className="ml-auto shrink-0 text-[10px] text-muted-foreground">
                    {timeAgo(solve.solvedAt)}
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </Widget>
  );
};

/* -------------------------------------------------------------------------- */
/* Clash Royale                                                               */
/* -------------------------------------------------------------------------- */

const ClashRoyaleWidget = ({
  isExpanded,
  onToggleExpand,
}: {
  isExpanded: boolean;
  onToggleExpand: () => void;
}) => {
  const { data, isLoading } = useClashStats();
  const { bestRanked } = SOCIAL.clashRoyale;

  const subtitle = isLoading ? (
    <Loading />
  ) : data ? (
    `${data.name} • ${data.trophies.toLocaleString()} trophies`
  ) : (
    'Stats unavailable'
  );

  return (
    <Widget
      icon={<img src={bestRanked.icon} alt="" className="h-4 w-4" />}
      title="Clash Royale"
      subtitle={subtitle}
      href={SOCIAL.clashRoyale.profileUrl}
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
    >
      {data && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{data.tag}</span>
            {data.clan && <span className="text-muted-foreground">{data.clan}</span>}
          </div>

          <div className="grid grid-cols-2 gap-2 rounded border border-border bg-background/40 py-2">
            <Stat
              label="Trophies"
              value={
                <span className="inline-flex items-center gap-1">
                  <Trophy className="h-3.5 w-3.5 text-yellow-500" />
                  {data.trophies.toLocaleString()}
                </span>
              }
              className="text-yellow-500"
            />
            <Stat
              label={`Best ranked • ${bestRanked.league}`}
              value={
                <span className="inline-flex items-center gap-1">
                  <img src={bestRanked.icon} alt="" className="h-4 w-4" />
                  {bestRanked.rating.toLocaleString()}
                </span>
              }
              className="text-purple-300"
            />
          </div>

          {(data.wins !== null || data.arena) && (
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              {data.arena && (
                <span className="inline-flex items-center gap-1">
                  {data.arenaIcon && (
                    <img src={data.arenaIcon} alt="" className="h-4 w-4" />
                  )}
                  {data.arena}
                </span>
              )}
              {data.wins !== null && (
                <span>
                  {data.wins.toLocaleString()}W / {(data.losses ?? 0).toLocaleString()}L
                  {data.threeCrownWins !== null &&
                    ` • ${data.threeCrownWins.toLocaleString()} three-crown`}
                </span>
              )}
            </div>
          )}

          {data.currentDeck.length > 0 && (
            <div>
              <p className="mb-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                Current deck
              </p>
              <div className="grid grid-cols-8 gap-1">
                {data.currentDeck.map((card) => (
                  <div key={card.name} className="group/card relative aspect-[3/4]">
                    <img
                      src={card.image}
                      alt={card.name}
                      className="h-full w-full rounded border border-border object-cover transition-transform group-hover/card:scale-105"
                    />
                    {card.level !== null && (
                      <span className="absolute bottom-0 left-0 right-0 rounded-b bg-black/75 text-center text-[8px] text-white">
                        {card.level}
                      </span>
                    )}
                    <span className="pointer-events-none absolute inset-x-0 -bottom-4 text-center text-[8px] text-muted-foreground opacity-0 transition-opacity group-hover/card:opacity-100">
                      {card.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-[10px] text-muted-foreground">
            {data.isLive && data.updatedAt
              ? `Synced from the Clash Royale API ${timeAgo(data.updatedAt)}`
              : 'Live sync not configured yet — showing last recorded stats.'}
          </p>
        </div>
      )}
    </Widget>
  );
};

/* -------------------------------------------------------------------------- */
/* Rocket League                                                              */
/* -------------------------------------------------------------------------- */

const RocketLeagueWidget = ({
  isExpanded,
  onToggleExpand,
}: {
  isExpanded: boolean;
  onToggleExpand: () => void;
}) => {
  const { peak, profileUrl } = SOCIAL.rocketLeague;

  return (
    <Widget
      icon={
        <img
          src={publicAssetUrl('rocket-league-logo.svg')}
          alt=""
          className="h-3.5 w-auto"
        />
      }
      title="Rocket League"
      subtitle={`${peak.rank} • ${peak.mmr.toLocaleString()} peak MMR in doubles`}
      href={profileUrl}
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
    >
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2 rounded border border-border bg-background/40 py-2">
          <Stat
            label="Peak MMR"
            value={
              <span className="inline-flex items-center gap-1">
                <Trophy className="h-3.5 w-3.5 text-yellow-500" />
                {peak.mmr.toLocaleString()}
              </span>
            }
            className="text-yellow-500"
          />
          <Stat
            label="Rank"
            value={
              <img
                src={publicAssetUrl(peak.rankImage)}
                alt={peak.rank}
                title={peak.rank}
                className="mx-auto h-8 w-8"
              />
            }
          />
          <Stat label="Playlist" value={peak.playlist} />
        </div>

        <p className="text-[10px] text-muted-foreground">
          Recorded by hand — Rocket League has no public stats API.
        </p>
      </div>
    </Widget>
  );
};

/* -------------------------------------------------------------------------- */
/* LinkedIn                                                                   */
/* -------------------------------------------------------------------------- */

const LinkedInWidget = () => (
  <a
    href="https://www.linkedin.com/in/geneustace-wicaksono-923410287/"
    target="_blank"
    rel="noreferrer noopener"
    className="group rounded-lg border border-border bg-card/50 p-3 transition-all duration-200 hover:border-primary/50 hover:bg-card/80 hover:shadow-md"
  >
    <div className="flex items-center gap-2">
      <div className="flex h-4 w-4 items-center justify-center rounded bg-[#0077B5]">
        <Linkedin className="h-2.5 w-2.5 text-white" />
      </div>
      <span className="text-sm font-medium text-foreground">LinkedIn</span>
      <ExternalLink className="ml-auto h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
    <p className="mt-1 text-xs text-muted-foreground">Professional network &amp; connections</p>
  </a>
);

/* -------------------------------------------------------------------------- */
/* layout                                                                     */
/* -------------------------------------------------------------------------- */

export const InteractiveInfo = () => {
  const [expandedWidget, setExpandedWidget] = useState<string | null>(null);
  const toggle = (id: string) =>
    setExpandedWidget((current) => (current === id ? null : id));

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-start md:space-x-4 space-y-4 md:space-y-0">
        <div className="flex-1 order-2 md:order-1">
          <h2 className="text-lg font-semibold mb-2">Hey! I'm Gene</h2>
          <p className="text-sm text-muted-foreground mb-2">
            An electrical and computer engineering student at Cornell University.
          </p>
          <p className="text-sm text-muted-foreground mb-2">
            Im from Jakarta, but I lived most of my life in Ithaca NY. I moved back for a
            family thing, but I hope to stay in the States! Be it teaching me or working side
            by side, all the worthwhile things I do have been influenced by amazing people.
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            If you have a good idea and need some people to run with it, contact me! I hope to
            spread the love and learn something new in the process.
          </p>
          <p className="text-sm font-medium text-yellow-400 mb-4">
            Currently @ AWS Cryptography
          </p>
        </div>
        <div className="w-32 h-40 md:w-48 md:h-64 rounded-lg overflow-hidden flex-shrink-0 mx-auto md:mx-0 order-1 md:order-2 bg-muted/10">
          <img
            src="/lovable-uploads/4df64f57-d54d-441a-9514-c9c8aed3594e.png"
            alt="Portrait"
            className="w-full h-full object-cover"
            style={{ minWidth: '128px', minHeight: '160px' }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <SpotifyWidget
          isExpanded={expandedWidget === 'spotify'}
          onToggleExpand={() => toggle('spotify')}
        />
        <YouTubeWidget
          isExpanded={expandedWidget === 'youtube'}
          onToggleExpand={() => toggle('youtube')}
        />
        <GitHubWidget
          isExpanded={expandedWidget === 'github'}
          onToggleExpand={() => toggle('github')}
        />
        <LeetCodeWidget
          isExpanded={expandedWidget === 'leetcode'}
          onToggleExpand={() => toggle('leetcode')}
        />
        <ClashRoyaleWidget
          isExpanded={expandedWidget === 'clash'}
          onToggleExpand={() => toggle('clash')}
        />
        <RocketLeagueWidget
          isExpanded={expandedWidget === 'rocket-league'}
          onToggleExpand={() => toggle('rocket-league')}
        />
        <LinkedInWidget />
      </div>
    </div>
  );
};
