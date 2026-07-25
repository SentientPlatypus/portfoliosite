/**
 * Single place to change handles/IDs for the stat widgets.
 */
export const SOCIAL = {
  github: {
    username: 'SentientPlatypus',
    profileUrl: 'https://github.com/SentientPlatypus',
  },
  leetcode: {
    username: 'SentientPlatypus',
    profileUrl: 'https://leetcode.com/u/SentientPlatypus/',
  },
  youtube: {
    channelId: 'UC4NtIi2ufm8Jx8EDa8XaqTg',
    handle: 'sentientplatypus8740',
    channelUrl: 'https://www.youtube.com/@sentientplatypus8740',
  },
  spotify: {
    username: 'TrexyCrocs',
    profileUrl: 'https://open.spotify.com/user/TrexyCrocs',
    /** Shown when the live snapshot is unavailable. */
    fallbackTrack: {
      id: '4h4QlmocP3IuwYEj2j14p8',
      artists: 'Nicky Youre, hey daisy',
    },
  },
  clashRoyale: {
    tag: '#22GQG09CL',
    /**
     * Path of Legends peak, recorded by hand: the player endpoint only returns
     * legacy trophy seasons, so league placements never appear in the snapshot.
     */
    bestRanked: {
      league: 'Ultimate Champion',
      rating: 1833,
      icon: 'https://cdns3.royaleapi.com/cdn-cgi/image/w=64,h=64,format=auto/static/img/arenas-fs8/64x64/league10-fs8.png',
    },
    get profileUrl() {
      return `https://royaleapi.com/player/${this.tag.replace('#', '')}`;
    },
  },
  rocketLeague: {
    epicName: 'T reximum',
    /**
     * Hand-recorded: Psyonix exposes no public player API, and tracker.gg sits
     * behind Cloudflare, which 403s anything that isn't a real browser. A peak
     * only moves a few times a year, so there's nothing to poll for anyway.
     */
    peak: {
      mmr: 996,
      rank: 'Diamond III',
      playlist: 'Doubles 2v2',
      /** Tracker's s4-15 badge. Indices 10-12 are Platinum, so Diamond starts at 13. */
      rankImage: 'rl-rank-diamond3.png',
    },
    get profileUrl() {
      return `https://rocketleague.tracker.network/rocket-league/profile/epic/${encodeURIComponent(
        this.epicName,
      )}/overview`;
    },
  },
} as const;

/**
 * Resolves a path inside `public/` against the Vite base so the widgets keep
 * working if the site is ever served from a sub-path.
 */
export const publicDataUrl = (file: string) =>
  `${import.meta.env.BASE_URL.replace(/\/$/, '')}/data/${file}`;

/** Same idea for images shipped in `public/`. */
export const publicAssetUrl = (file: string) =>
  `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${file}`;
