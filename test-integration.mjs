// Temporary pre-deploy integration test. Safe to delete.
import { AUCTION_ITEMS, SURPRISE_EVENTS, CITY_ZONES, CITY_REQUIREMENTS } from './src/data/auction-data.js';

const BASE = 'http://localhost:3000';
let pass = 0, fail = 0;
const t = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; console.log(`  FAIL  ${name} ${extra}`); }
};

console.log('\n=== 1. DATA INTEGRITY ===');
const ids = AUCTION_ITEMS.map(i => i.id);
t(`item count = ${AUCTION_ITEMS.length}`, AUCTION_ITEMS.length > 0);
t('no duplicate item ids', new Set(ids).size === ids.length,
  `dupes: ${ids.filter((v, i) => ids.indexOf(v) !== i)}`);
t('every item has id/name/category/base/emoji/desc',
  AUCTION_ITEMS.every(i => i.id && i.name && i.category && typeof i.base === 'number' && i.emoji && i.desc));
t('all base prices > 0', AUCTION_ITEMS.every(i => i.base > 0));
t('special items all have a bonus block',
  AUCTION_ITEMS.filter(i => i.special).every(i => i.bonus && i.bonus.type && typeof i.bonus.value === 'number'));
t('bonus types are known (money|points|shield)',
  AUCTION_ITEMS.filter(i => i.special).every(i => ['money', 'points', 'shield'].includes(i.bonus.type)));

console.log('\n=== 2. CITY REQUIREMENTS reference real items ===');
const badRefs = [];
CITY_REQUIREMENTS.forEach(r => r.needs.forEach(n => { if (!ids.includes(n)) badRefs.push(`${r.id}->${n}`); }));
t('all requirement "needs" map to real item ids', badRefs.length === 0, badRefs.join(', '));
t('no duplicate requirement ids',
  new Set(CITY_REQUIREMENTS.map(r => r.id)).size === CITY_REQUIREMENTS.length);

console.log('\n=== 3. CITY ZONES ===');
t('no duplicate zone ids', new Set(CITY_ZONES.map(z => z.id)).size === CITY_ZONES.length);
t('all zones within 0-100% bounds',
  CITY_ZONES.every(z => z.x >= 0 && z.y >= 0 && z.x + z.w <= 100 && z.y + z.h <= 100),
  CITY_ZONES.filter(z => z.x + z.w > 100 || z.y + z.h > 100).map(z => z.id).join(','));

console.log('\n=== 4. SURPRISE EVENT PREDICATES ===');
t('no duplicate event ids', new Set(SURPRISE_EVENTS.map(e => e.id)).size === SURPRISE_EVENTS.length);
SURPRISE_EVENTS.forEach(e => {
  const hasPred = typeof e.penaltyIf === 'function' || typeof e.bonusIf === 'function';
  t(`event "${e.id}" has a predicate`, hasPred);
  if (e.penaltyIf) t(`event "${e.id}" penalty predicate runs`, typeof e.penaltyIf([]) === 'boolean');
  if (e.bonusIf) t(`event "${e.id}" bonus predicate runs`, typeof e.bonusIf([]) === 'boolean');
});
// Behavioural checks on the documented rules
const cyber = SURPRISE_EVENTS.find(e => e.id === 'cyberattack');
t('cyberattack penalises empty inventory', cyber.penaltyIf([]) === true);
t('cyberattack spares firewall owners', cyber.penaltyIf(['firewall']) === false);
t('cyberattack spares cybersec-upgrade owners', cyber.penaltyIf(['cybersec']) === false);
const power = SURPRISE_EVENTS.find(e => e.id === 'powerfailure');
t('powerfailure spares ups owners', power.penaltyIf(['ups']) === false);
t('powerfailure spares generator owners', power.penaltyIf(['generator']) === false);
const flood = SURPRISE_EVENTS.find(e => e.id === 'flood');
t('flood rewards envsensor owners', flood.bonusIf(['envsensor']) === true);
t('flood ignores others', flood.bonusIf(['router']) === false);
const net = SURPRISE_EVENTS.find(e => e.id === 'netfail');
t('netfail spares fiber owners', net.penaltyIf(['fiber']) === false);
t('netfail spares loadbal owners', net.penaltyIf(['loadbal']) === false);

console.log('\n=== 5. CURRENCY FORMATTING (formatL) ===');
const formatL = (lakhs) => lakhs >= 100
  ? '₹' + (lakhs / 100).toFixed(lakhs % 100 === 0 ? 0 : 2) + ' Cr'
  : '₹' + lakhs + ' L';
t('40 -> ₹40 L', formatL(40) === '₹40 L', formatL(40));
t('1000 -> ₹10 Cr', formatL(1000) === '₹10 Cr', formatL(1000));
t('150 -> ₹1.50 Cr', formatL(150) === '₹1.50 Cr', formatL(150));
t('99 -> ₹99 L', formatL(99) === '₹99 L', formatL(99));
t('100 -> ₹1 Cr', formatL(100) === '₹1 Cr', formatL(100));

console.log('\n=== 6. AUCTION AFFORDABILITY SANITY ===');
const cheapest = Math.min(...AUCTION_ITEMS.map(i => i.base));
const totalAll = AUCTION_ITEMS.reduce((s, i) => s + i.base, 0);
t(`cheapest item (${cheapest}L) affordable on ₹10Cr budget`, cheapest <= 1000);
console.log(`        (total base value of all items: ${formatL(totalAll)}; budget/team ₹10 Cr)`);
t('no single item costs more than a full 10Cr budget',
  AUCTION_ITEMS.every(i => i.base <= 1000));

console.log('\n=== 7. SERVER API ===');

// Bring the server up ourselves if it isn't already running, so this suite is
// self-contained in CI. Never silently skip: an unreachable server used to make
// the whole server/security/asset section vanish while still exiting 0.
const ping = () => fetch(`${BASE}/api/network-info`).then(r => r.ok).catch(() => false);

let spawned = null;
if (!(await ping())) {
  const { spawn } = await import('child_process');
  console.log('  ...server not running, starting it for this test run');
  spawned = spawn(process.execPath, ['server.js'], { stdio: 'ignore', detached: false });
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline && !(await ping())) {
    await new Promise(r => setTimeout(r, 300));
  }
}

if (!(await ping())) {
  console.log('  FAIL  server did not become reachable on :3000');
  if (spawned) spawned.kill();
  console.log('\n=== RESULT: aborted, server unavailable ===\n');
  process.exit(1);
}

const stopSpawned = () => { if (spawned) { try { spawned.kill(); } catch { /* already gone */ } } };
process.on('exit', stopSpawned);

{
  const info = await (await fetch(`${BASE}/api/network-info`)).json();
  t('/api/network-info returns port + ips', info.port === 3000 && Array.isArray(info.ips));
  t('every adapter entry is well-formed',
    info.ips.every(i => typeof i.address === 'string' && typeof i.name === 'string'
      && typeof i.likelyVirtual === 'boolean'));
  // CI runners often only expose a Docker-range address, which we correctly
  // classify as virtual — so this is informational, not a pass/fail condition.
  const shareable = info.ips.filter(i => !i.likelyVirtual);
  console.log(shareable.length
    ? `        shareable address: http://${shareable[0].address}:${info.port}`
    : '        (no shareable LAN address here — expected on a CI runner)');

  // state round trip
  const sample = {
    started: true,
    teams: [{ name: 'Alpha', budget: 1000, inventory: [] }],
    auctionItems: [{ id: 'router', name: 'Router', base: 40 }],
    currentItemIdx: 0,
  };
  await fetch(`${BASE}/api/state`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sample) });
  const got = await (await fetch(`${BASE}/api/state`)).json();
  t('state POST then GET round-trips', got && got.teams && got.teams[0].name === 'Alpha');

  // persistence across read
  const again = await (await fetch(`${BASE}/api/state`)).json();
  t('state is stable across repeated GETs', JSON.stringify(again) === JSON.stringify(got));

  // malformed JSON rejected
  const bad = await fetch(`${BASE}/api/state`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{not json' });
  t('malformed JSON rejected with 400', bad.status === 400, `got ${bad.status}`);

  // state survived the bad write
  const after = await (await fetch(`${BASE}/api/state`)).json();
  t('bad write did NOT corrupt existing state', after && after.teams && after.teams[0].name === 'Alpha');

  // unsupported method
  const put = await fetch(`${BASE}/api/state`, { method: 'PUT', body: '{}' });
  t('unsupported method returns 405', put.status === 405, `got ${put.status}`);

  console.log('\n=== 8. STATIC ASSETS ===');
  for (const p of ['/', '/index.html', '/team.html', '/join.html', '/style.css', '/team.css',
                   '/vendor/qrcode.min.js', '/src/index.js', '/src/team.js',
                   '/src/admin/admin-app.js', '/src/team/team-panel.js',
                   '/src/shared/state.js', '/src/shared/utils.js',
                   '/src/data/auction-data.js', '/src/lib/exports.js']) {
    const r = await fetch(BASE + p);
    t(`${p} -> 200`, r.status === 200, `got ${r.status}`);
  }

  console.log('\n=== 8b. STATE VALIDATION GUARD ===');
  // restore a good live game first
  const live = {
    started: true,
    teams: [{ name: 'Alpha', budget: 1000, inventory: [] }, { name: 'Beta', budget: 1000, inventory: [] }],
    auctionItems: [{ id: 'router', name: 'Router', base: 40 }],
    currentItemIdx: 0,
  };
  const okWrite = await fetch(`${BASE}/api/state`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(live) });
  t('valid game state accepted', okWrite.status === 200, `got ${okWrite.status}`);

  const badPayloads = [
    ['a bare string', '"hello"'],
    ['an array', '[1,2,3]'],
    ['object missing "started"', '{"teams":[]}'],
    ['started with no teams', '{"started":true,"teams":[]}'],
    ['team with no name', '{"started":true,"teams":[{"budget":10,"inventory":[]}],"auctionItems":[{"id":"a"}],"currentItemIdx":0}'],
    ['team with NaN budget', '{"started":true,"teams":[{"name":"X","budget":"lots","inventory":[]}],"auctionItems":[{"id":"a"}],"currentItemIdx":0}'],
    ['duplicate team names', '{"started":true,"teams":[{"name":"X","budget":1,"inventory":[]},{"name":"X","budget":1,"inventory":[]}],"auctionItems":[{"id":"a"}],"currentItemIdx":0}'],
    ['currentItemIdx out of range', '{"started":true,"teams":[{"name":"X","budget":1,"inventory":[]}],"auctionItems":[{"id":"a"}],"currentItemIdx":99}'],
  ];
  for (const [label, payload] of badPayloads) {
    const r = await fetch(`${BASE}/api/state`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload });
    t(`rejects ${label} (422)`, r.status === 422, `got ${r.status}`);
  }
  const stillLive = await (await fetch(`${BASE}/api/state`)).json();
  t('live game survived all rejected writes',
    stillLive && stillLive.teams && stillLive.teams.length === 2 && stillLive.teams[0].name === 'Alpha');

  t('explicit null reset still allowed',
    (await fetch(`${BASE}/api/state`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: 'null' })).status === 200);

  console.log('\n=== 9. SECURITY ===');
  const trav = await fetch(`${BASE}/../../../Windows/win.ini`);
  t('path traversal blocked (403/404)', trav.status === 403 || trav.status === 404, `got ${trav.status}`);
  const trav2 = await fetch(`${BASE}/..%2f..%2fserver.js`);
  t('encoded traversal blocked', trav2.status === 403 || trav2.status === 404, `got ${trav2.status}`);
  const junk = await fetch(`${BASE}/api/state`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ hacked: true }) });
  t('random junk payload rejected (422)', junk.status === 422, `got ${junk.status}`);
  // A *well-formed* hostile payload still succeeds — there is no auth layer.
  const hostile = await fetch(`${BASE}/api/state`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ started: true, teams: [{ name: 'Cheater', budget: 999999, inventory: [] }], auctionItems: [{ id: 'a' }], currentItemIdx: 0 }),
  });
  t('NOTE: well-formed unauthenticated write still accepted', hostile.status === 200,
    '<- expected; no auth layer. See summary.');

  // cleanup
  await fetch(`${BASE}/api/state`, { method: 'DELETE' });
  const cleared = await (await fetch(`${BASE}/api/state`)).json();
  t('DELETE clears state', cleared === null);
}

console.log(`\n=== RESULT: ${pass} passed, ${fail} failed ===\n`);
process.exit(fail > 0 ? 1 : 0);
