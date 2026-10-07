const http = require('http');
const fs = require('fs');
const path = require('path');

function loadEnv(file) {
  let text;
  try {
    text = fs.readFileSync(file, 'utf8');
  } catch {
    return;
  }
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match) continue;
    const value = match[2].replace(/^['"]|['"]$/g, '');
    if (!(match[1] in process.env)) process.env[match[1]] = value;
  }
}

loadEnv(path.join(__dirname, '.env'));

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.OPENWEATHER_API_KEY || '';
const UPSTREAM_URL = 'https://api.openweathermap.org/data/2.5/weather';
const PUBLIC_DIR = path.join(__dirname, 'public');
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const hits = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_LIMIT;
}

function sendJson(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(body));
}

async function handleWeather(res, url) {
  if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
    return sendJson(res, 500, {
      error: 'The server has no API key. Add OPENWEATHER_API_KEY to the .env file and restart the server.',
    });
  }

  const city = (url.searchParams.get('city') || '').trim();
  if (!city || city.length > 100) {
    return sendJson(res, 400, { error: 'Enter a valid city name.' });
  }

  const params = new URLSearchParams({ q: city, appid: API_KEY, units: 'metric' });

  let upstream;
  try {
    upstream = await fetch(`${UPSTREAM_URL}?${params}`, { signal: AbortSignal.timeout(8000) });
  } catch {
    return sendJson(res, 504, { error: 'The weather service did not respond. Try again in a moment.' });
  }

  if (upstream.status === 404) {
    return sendJson(res, 404, { error: "We couldn't find that city. Check the spelling and try again." });
  }
  if (upstream.status === 401) {
    return sendJson(res, 500, { error: 'The API key was rejected. Check the .env file (new keys can take up to 2 hours to activate).' });
  }
  if (upstream.status === 429) {
    return sendJson(res, 429, { error: 'The weather service is busy. Wait a minute, then try again.' });
  }
  if (upstream.status !== 200) {
    return sendJson(res, 502, { error: 'The weather service is having problems. Try again in a moment.' });
  }

  let data;
  try {
    data = await upstream.json();
  } catch {
    return sendJson(res, 502, { error: 'The weather service sent a response we could not read.' });
  }
  sendJson(res, 200, data);
}

function serveStatic(res, url) {
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    res.writeHead(400);
    return res.end('Bad request');
  }
  if (pathname === '/') pathname = '/index.html';

  const file = path.normalize(path.join(PUBLIC_DIR, pathname));
  if (!file.startsWith(PUBLIC_DIR + path.sep)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Not found');
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');

  if (req.method !== 'GET') {
    res.writeHead(405);
    return res.end('Method not allowed');
  }

  if (url.pathname === '/api/weather') {
    if (isRateLimited(req.socket.remoteAddress)) {
      return sendJson(res, 429, { error: 'Too many requests. Wait a minute, then try again.' });
    }
    try {
      return await handleWeather(res, url);
    } catch {
      return sendJson(res, 500, { error: 'Something went wrong on the server. Try again.' });
    }
  }

  serveStatic(res, url);
});

server.listen(PORT, () => {
  console.log(`Weather Dashboard running at http://localhost:${PORT}`);
  if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
    console.warn('Warning: OPENWEATHER_API_KEY is missing. Add it to .env');
  }
});
