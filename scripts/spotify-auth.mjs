/**
 * One-time helper that turns a Spotify app's client ID/secret into the refresh
 * token that CI needs.
 *
 *   1. Create an app at https://developer.spotify.com/dashboard
 *   2. Add http://127.0.0.1:8888/callback as a Redirect URI
 *   3. SPOTIFY_CLIENT_ID=... SPOTIFY_CLIENT_SECRET=... node scripts/spotify-auth.mjs
 *
 * It opens the consent screen, catches the redirect, and prints the refresh
 * token to paste into the repository secrets.
 */
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';

const PORT = 8888;
const REDIRECT_URI = `http://127.0.0.1:${PORT}/callback`;
const SCOPES = [
  'user-read-currently-playing',
  'user-read-playback-state',
  'user-read-recently-played',
  'user-library-read',
].join(' ');

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error('Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET first.');
  process.exit(1);
}

const state = Math.random().toString(36).slice(2);
const authorizeUrl = `https://accounts.spotify.com/authorize?${new URLSearchParams({
  client_id: clientId,
  response_type: 'code',
  redirect_uri: REDIRECT_URI,
  scope: SCOPES,
  state,
})}`;

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  if (url.pathname !== '/callback') {
    res.writeHead(404).end();
    return;
  }

  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error || url.searchParams.get('state') !== state) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end(`Authorization failed: ${error ?? 'state mismatch'}`);
    server.close();
    process.exit(1);
  }

  const token = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
    }),
  });

  const body = await token.json();
  res.writeHead(token.ok ? 200 : 400, { 'Content-Type': 'text/plain' });

  if (!token.ok) {
    res.end(`Token exchange failed: ${JSON.stringify(body)}`);
    console.error(body);
    server.close();
    process.exit(1);
  }

  res.end('Done — check your terminal for the refresh token, then close this tab.');
  console.log('\nAdd this as the SPOTIFY_REFRESH_TOKEN repository secret:\n');
  console.log(body.refresh_token);
  console.log();
  server.close();
  process.exit(0);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Listening on ${REDIRECT_URI}`);
  console.log(`If a browser doesn't open, visit:\n${authorizeUrl}\n`);
  openBrowser(authorizeUrl);
});

function openBrowser(url) {
  // Never route this through a shell: cmd.exe reads the query string's & as a
  // command separator and hands Spotify a URL truncated after client_id.
  const [command, args] =
    process.platform === 'win32'
      ? ['explorer.exe', [url]]
      : process.platform === 'darwin'
        ? ['open', [url]]
        : ['xdg-open', [url]];
  spawn(command, args, { stdio: 'ignore', detached: true }).unref();
}
