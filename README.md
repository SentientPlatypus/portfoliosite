uh oh

A Vite + React + TypeScript portfolio styled like VS Code.

```bash
npm install
npm run dev      # http://localhost:8080
npm run build
```

## Stat widgets

The cards under `me.info()` live in `src/components/InteractiveWidgets.tsx`.
All of the fetching lives in `src/lib/socialApi.ts`, and handles/IDs are
centralised in `src/lib/socialConfig.ts`.

Four of them need no configuration — they read public APIs straight from the
browser:

| Card | Source |
| --- | --- |
| GitHub | `api.github.com` for the profile, `github-contributions-api.jogruber.de` for the real contribution calendar |
| LeetCode | `leetcode-api-faisalshohag.vercel.app`, falling back to `alfa-leetcode-api.onrender.com` |
| YouTube | `mixerno.space` for counts (fallback `api.socialcounts.org`), the channel Atom feed via `rss2json` for the latest upload |
| Spotify (pinned) | `open.spotify.com/oembed` |

### Rocket League

Psyonix publishes no player API, and tracker.gg sits behind Cloudflare, which
rejects anything that isn't a real browser — server included. So the peak 2v2
MMR is just a constant in `src/lib/socialConfig.ts`; edit `rocketLeague.peak`
when it moves.

Two images ship with it. `public/rl-rank-diamond3.png` is Tracker Network's
`s4-15` badge (Diamond III), downscaled to 128px; swap it if the rank changes.
`public/rocket-league-logo.svg` is Psyonix's logo
[from Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Rocket_League_logo.svg),
CC BY-SA 4.0.

### Live Spotify and Clash Royale

These two can't be read from a browser: Spotify's "currently playing" needs a
user OAuth token, and Supercell's API only accepts keys bound to a fixed server
IP. So `scripts/refresh-stats.mjs` fetches them in CI and writes
`public/data/*.json`, which the widgets read at runtime. Until the secrets
exist, both cards say so and show their fallbacks — the build never breaks.

Add these as **repository secrets** (Settings → Secrets and variables → Actions):

- `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET` — from a
  [Spotify app](https://developer.spotify.com/dashboard) with
  `http://127.0.0.1:8888/callback` as a redirect URI.
- `SPOTIFY_REFRESH_TOKEN` — run the one-time helper and paste what it prints:

  ```bash
  SPOTIFY_CLIENT_ID=... SPOTIFY_CLIENT_SECRET=... node scripts/spotify-auth.mjs
  ```

- `CLASH_ROYALE_TOKEN` — a key from
  [developer.clashroyale.com](https://developer.clashroyale.com) whitelisted to
  RoyaleAPI's proxy IP `45.79.218.79` (the script routes through
  `proxy.royaleapi.dev`).

`.github/workflows/deploy.yml` then refreshes the snapshots every 30 minutes and
publishes `dist/` to the `gh-pages` branch, so "now playing" is accurate to
within one cron tick. `npm run deploy` still works for a manual push, it just
won't include the credentialed snapshots.
