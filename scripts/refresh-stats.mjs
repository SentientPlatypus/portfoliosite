/**
 * Writes the stat snapshots that need private credentials into public/data/.
 *
 * Spotify's "currently playing" and Supercell's player API can't be called from
 * the browser (one needs a user OAuth token, the other a key bound to a server
 * IP), so CI fetches them and the site reads the resulting JSON.
 *
 * Every source is optional: a missing secret or a failing API just skips that
 * file so the build never breaks — the widgets fall back on their own.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../public/data');
const CLASH_TAG = '#22GQG09CL';

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const results = await Promise.allSettled([
    run('spotify.json', buildSpotifySnapshot),
    run('clash-royale.json', buildClashSnapshot),
  ]);

  const failed = results.filter((result) => result.status === 'rejected');
  for (const failure of failed) {
    console.warn(`::warning::${failure.reason}`);
  }
  console.log(`Wrote ${results.length - failed.length}/${results.length} snapshots.`);
}

async function run(filename, build) {
  const snapshot = await build();
  if (snapshot === null) {
    throw new Error(`Skipped ${filename} (missing credentials)`);
  }
  await writeFile(
    resolve(OUT_DIR, filename),
    `${JSON.stringify(snapshot, null, 2)}\n`,
    'utf8',
  );
  console.log(`✓ ${filename}`);
  return snapshot;
}

/* -------------------------------------------------------------------------- */
/* Spotify                                                                    */
/* -------------------------------------------------------------------------- */

async function buildSpotifySnapshot() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) return null;

  const accessToken = await getSpotifyAccessToken(clientId, clientSecret, refreshToken);
  const api = (path) =>
    fetch(`https://api.spotify.com/v1${path}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

  // Prefer what's playing right now, then the last thing played, then the most
  // recently liked song.
  const playing = await api('/me/player/currently-playing?additional_types=track');
  if (playing.status === 200) {
    const body = await playing.json();
    if (body?.item) {
      return {
        updatedAt: new Date().toISOString(),
        isPlaying: Boolean(body.is_playing),
        source: 'now-playing',
        track: toTrack(body.item, body.progress_ms),
      };
    }
  } else if (playing.status !== 204) {
    console.warn(`Spotify currently-playing returned ${playing.status}`);
  }

  const recent = await api('/me/player/recently-played?limit=1');
  if (recent.ok) {
    const item = (await recent.json())?.items?.[0]?.track;
    if (item) {
      return {
        updatedAt: new Date().toISOString(),
        isPlaying: false,
        source: 'recently-played',
        track: toTrack(item, null),
      };
    }
  }

  const liked = await api('/me/tracks?limit=1');
  if (liked.ok) {
    const item = (await liked.json())?.items?.[0]?.track;
    if (item) {
      return {
        updatedAt: new Date().toISOString(),
        isPlaying: false,
        source: 'liked',
        track: toTrack(item, null),
      };
    }
  }

  throw new Error('Spotify returned no playable track');
}

async function getSpotifyAccessToken(clientId, clientSecret, refreshToken) {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken }),
  });

  if (!res.ok) {
    throw new Error(`Spotify token refresh failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()).access_token;
}

function toTrack(item, progressMs) {
  return {
    id: item.id,
    name: item.name,
    artists: (item.artists ?? []).map((artist) => artist.name).join(', '),
    album: item.album?.name ?? null,
    albumImage: item.album?.images?.[0]?.url ?? null,
    url: item.external_urls?.spotify ?? `https://open.spotify.com/track/${item.id}`,
    durationMs: item.duration_ms ?? null,
    progressMs: progressMs ?? null,
  };
}

/* -------------------------------------------------------------------------- */
/* Clash Royale                                                               */
/* -------------------------------------------------------------------------- */

async function buildClashSnapshot() {
  const token = process.env.CLASH_ROYALE_TOKEN;
  if (!token) return null;

  const path = `/v1/players/${encodeURIComponent(CLASH_TAG)}`;
  // RoyaleAPI's proxy has a stable IP, which is what the Supercell key gets
  // whitelisted against; the direct host is only useful for a self-hosted key.
  const hosts = ['https://proxy.royaleapi.dev', 'https://api.clashroyale.com'];

  let lastError = 'no hosts tried';
  for (const host of hosts) {
    const res = await fetch(`${host}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      return { updatedAt: new Date().toISOString(), player: await res.json() };
    }
    lastError = `${host} -> ${res.status} ${await res.text()}`;
  }

  throw new Error(`Clash Royale API failed: ${lastError}`);
}

await main();
