// ============================================================
//  SMART CITY AUCTION – STATIC FILE + SHARED STATE SERVER
//  Serves the game's HTML/CSS/JS and exposes a small JSON API
//  (/api/state) so every device on the network shares ONE game
//  state. Uses only Node's built-in modules (no dependencies).
// ============================================================
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = __dirname;
const PORT = process.env.PORT || 3000;
const STATE_FILE = path.join(ROOT, '.smartcity-state.json');
const MAX_BODY_BYTES = 2_000_000; // guard against oversized/abusive request bodies

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// ---- shared game state, persisted to disk so a server restart mid-event doesn't wipe it ----
let state = null;
try {
  state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
} catch {
  state = null;
}

function saveState() {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to persist state:', err.message);
  }
}

// Rejects payloads that clearly aren't a valid game state. This is a
// corruption guard, not an auth boundary — see the README security note.
// Returns an error string, or null when the payload looks acceptable.
function validateGameState(s) {
  if (s === null) return null;                       // explicit reset is allowed
  if (typeof s !== 'object' || Array.isArray(s)) return 'state must be an object or null';
  if (!('started' in s)) return 'missing "started" flag';
  if (typeof s.started !== 'boolean') return '"started" must be a boolean';

  if (s.started) {
    if (!Array.isArray(s.teams) || s.teams.length === 0) return 'a started game needs a non-empty teams array';
    for (const t of s.teams) {
      if (!t || typeof t !== 'object') return 'each team must be an object';
      if (typeof t.name !== 'string' || !t.name.trim()) return 'each team needs a name';
      if (typeof t.budget !== 'number' || !Number.isFinite(t.budget)) return `team "${t.name}" has an invalid budget`;
      if (!Array.isArray(t.inventory)) return `team "${t.name}" has an invalid inventory`;
    }
    const names = s.teams.map(t => t.name);
    if (new Set(names).size !== names.length) return 'duplicate team names';
    if (!Array.isArray(s.auctionItems) || s.auctionItems.length === 0) return 'a started game needs auctionItems';
    if (typeof s.currentItemIdx !== 'number' || s.currentItemIdx < 0 || s.currentItemIdx >= s.auctionItems.length) {
      return 'currentItemIdx out of range';
    }
  }
  return null;
}

function sendJson(res, code, data) {
  const body = JSON.stringify(data);
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function serveStatic(req, res) {
  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.normalize(path.join(ROOT, reqPath));

  // Prevent path traversal outside the project root
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api/network-info')) {
    if (req.method !== 'GET') {
      res.writeHead(405, { 'Content-Type': 'text/plain' });
      res.end('Method Not Allowed');
      return;
    }
    sendJson(res, 200, { port: PORT, ips: getLocalIps() });
    return;
  }

  if (req.url.startsWith('/api/state')) {
    if (req.method === 'GET') {
      sendJson(res, 200, state);
      return;
    }

    if (req.method === 'POST') {
      let body = '';
      let tooLarge = false;
      req.on('data', (chunk) => {
        body += chunk;
        if (body.length > MAX_BODY_BYTES) {
          tooLarge = true;
          req.destroy();
        }
      });
      req.on('end', () => {
        if (tooLarge) {
          sendJson(res, 413, { ok: false, error: 'Payload too large' });
          return;
        }
        let parsed;
        try {
          parsed = JSON.parse(body);
        } catch {
          sendJson(res, 400, { ok: false, error: 'Invalid JSON' });
          return;
        }
        const problem = validateGameState(parsed);
        if (problem) {
          // Reject rather than overwrite — a bad payload must never be able
          // to wipe a live game that teams are actively bidding in.
          console.warn('Rejected invalid state write:', problem);
          sendJson(res, 422, { ok: false, error: problem });
          return;
        }
        state = parsed;
        saveState();
        sendJson(res, 200, { ok: true });
      });
      return;
    }

    if (req.method === 'DELETE') {
      state = null;
      saveState();
      sendJson(res, 200, { ok: true });
      return;
    }

    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method Not Allowed');
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method Not Allowed');
    return;
  }

  serveStatic(req, res);
});

// Returns every non-internal IPv4 address, with the real WiFi adapter
// ranked first. Virtual adapters (VirtualBox/VMware/Hyper-V/WSL/Docker)
// are pushed to the end since phones on the venue WiFi can't reach those
// — detected both by adapter name AND by their well-known default IP
// ranges (VirtualBox host-only defaults to 192.168.56.0/24, for example).
function getLocalIps() {
  const nets = os.networkInterfaces();
  const candidates = [];
  const VIRTUAL_NAME_HINTS = /virtual|vbox|vmware|hyper-v|wsl|docker|loopback/i;
  const VIRTUAL_IP_RANGES = [
    /^192\.168\.56\./,   // VirtualBox host-only default
    /^192\.168\.99\./,   // Common VM NAT range
    /^10\.0\.2\./,        // VirtualBox NAT default
    /^172\.(1[6-9]|2\d|3[01])\./, // Docker/Hyper-V default bridge range
  ];
  const WIFI_NAME_HINT = /wi-?fi|wireless|wlan/i;

  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        const likelyVirtual = VIRTUAL_NAME_HINTS.test(name) || VIRTUAL_IP_RANGES.some(r => r.test(net.address));
        const isWifi = WIFI_NAME_HINT.test(name);
        candidates.push({ name, address: net.address, likelyVirtual, isWifi });
      }
    }
  }

  // Real WiFi first, then other real adapters, then likely-virtual ones last.
  candidates.sort((a, b) => {
    if (a.likelyVirtual !== b.likelyVirtual) return Number(a.likelyVirtual) - Number(b.likelyVirtual);
    if (a.isWifi !== b.isWifi) return Number(b.isWifi) - Number(a.isWifi);
    return 0;
  });
  return candidates;
}

server.listen(PORT, () => {
  const ips = getLocalIps();
  console.log('\n  🏙️  Smart City Auction server running!\n');
  console.log(`     Local:    http://localhost:${PORT}`);
  if (ips.length) {
    console.log('     Network (share the one matching your WiFi/Ethernet adapter):');
    ips.forEach(({ name, address }) => {
      console.log(`       http://${address}:${PORT}   (${name})`);
    });
  } else {
    console.log('     Network:  (no LAN IP detected — participants must be on the same machine)');
  }
  console.log('');
});
