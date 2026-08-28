// ============================================================
//  STATIC WIRING CHECK
//  This app wires behaviour to the DOM by id and by inline onclick=,
//  which means a typo or a moved block breaks things silently at runtime
//  with nothing failing at build time. This script closes that gap:
//
//   1. every getElementById('x') in JS has a matching id="x" in some page
//   2. no page defines the same id twice
//   3. every onclick="fn(...)" in HTML maps to a function put on window
//
//  Run with: npm run check
// ============================================================
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const read = (p) => readFileSync(p, 'utf8');

const htmlFiles = readdirSync('.').filter(f => f.endsWith('.html'));
const jsFiles = [];
(function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (f.endsWith('.js')) jsFiles.push(p);
  }
})('src');

let problems = 0;
const problem = (msg) => { problems++; console.log(`  FAIL  ${msg}`); };
const ok = (msg) => console.log(`  PASS  ${msg}`);

// ---- 0. every module parses ----
// A syntax error in a browser module wouldn't fail any HTTP test (the server
// happily serves broken JS), so check it explicitly. `node --check` treats a
// .mjs file as ESM, so parse via a temp copy with that extension.
{
  const { execFileSync } = await import('child_process');
  const { tmpdir } = await import('os');
  const { writeFileSync, unlinkSync } = await import('fs');
  const bad = [];
  for (const f of [...jsFiles, 'server.js']) {
    const isEsm = /^\s*(import|export)\s/m.test(read(f));
    const tmp = join(tmpdir(), `wirecheck-${Math.random().toString(36).slice(2)}.${isEsm ? 'mjs' : 'cjs'}`);
    try {
      writeFileSync(tmp, read(f));
      execFileSync(process.execPath, ['--check', tmp], { stdio: 'pipe' });
    } catch (e) {
      bad.push(`${f}: ${String(e.stderr || e.message).split('\n').find(l => l.includes('Error')) || 'parse error'}`);
    } finally {
      try { unlinkSync(tmp); } catch { /* ignore */ }
    }
  }
  bad.forEach(problem);
  if (!bad.length) ok(`all ${jsFiles.length + 1} JS file(s) parse cleanly`);
}

// ---- collect ids defined per HTML file, and flag duplicates ----
const idsByFile = {};
const allIds = new Set();
for (const f of htmlFiles) {
  const src = read(f);
  const ids = [...src.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  const dupes = ids.filter((v, i) => ids.indexOf(v) !== i);
  if (dupes.length) problem(`${f} defines duplicate id(s): ${[...new Set(dupes)].join(', ')}`);
  idsByFile[f] = new Set(ids);
  ids.forEach(i => allIds.add(i));
}
if (!problems) ok(`no duplicate ids across ${htmlFiles.length} page(s)`);

// Some elements are created on demand rather than living in the HTML
// (showToast builds its own container). Treat ids assigned in JS as valid.
for (const f of jsFiles) {
  for (const m of read(f).matchAll(/\.id\s*=\s*'([^']+)'/g)) allIds.add(m[1]);
}

// ---- ids the JS reaches for ----
// Skip template-literal lookups like getElementById('qr-' + name) — those are
// built at runtime and can't be resolved statically.
const missing = [];
for (const f of jsFiles) {
  const src = read(f);
  for (const m of src.matchAll(/getElementById\(\s*'([^'\\+]+)'\s*\)/g)) {
    const id = m[1];
    if (!allIds.has(id)) missing.push(`${f}: getElementById('${id}') has no matching id in any page`);
  }
}
missing.forEach(problem);
if (!missing.length) ok('every statically-resolvable getElementById target exists in HTML');

// ---- onclick handlers must be exposed on window ----
const exportsSrc = read(join('src', 'lib', 'exports.js'));
const onWindow = new Set([...exportsSrc.matchAll(/window\.(\w+)\s*=/g)].map(m => m[1]));

const inlineHandlers = new Set();
for (const f of htmlFiles) {
  const src = read(f);
  for (const m of src.matchAll(/\bon(?:click|change|input)="\s*([A-Za-z_$][\w$]*)\s*\(/g)) {
    inlineHandlers.add(m[1]);
  }
}
const notExposed = [...inlineHandlers].filter(h => !onWindow.has(h) && !['location', 'history'].includes(h));
notExposed.forEach(h => problem(`inline handler "${h}(...)" is used in HTML but never assigned to window in exports.js`));
if (!notExposed.length) ok(`all ${inlineHandlers.size} inline handler(s) are exposed on window`);

console.log(problems
  ? `\n${problems} wiring problem(s) found\n`
  : '\nWiring OK\n');
process.exit(problems ? 1 : 0);
