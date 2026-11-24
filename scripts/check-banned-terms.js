#!/usr/bin/env node
// Fails if any banned term appears in tracked text files (and, optionally, a rendered page).
// Terms are never stored in the repo. Supply them via:
//   BANNED_TERMS="term one,term two" node scripts/check-banned-terms.js
// or an untracked, git-ignored file `.banned-terms.local` (one term per line).
// Optional path prefixes limit the scan, e.g.
//   node scripts/check-banned-terms.js assets/img/cbx300 assets/js/cbx300 assets/css/cbx300 docs/sme-finish
// Optional: CHECK_URL=http://localhost:8000/index.html?open=sme also scans that page's HTML.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.resolve(__dirname, '..');
let terms = (process.env.BANNED_TERMS || '').split(',');
const local = path.join(root, '.banned-terms.local');
if (!process.env.BANNED_TERMS && fs.existsSync(local)) terms = fs.readFileSync(local, 'utf8').split(/\r?\n/);
terms = terms.map((t) => t.trim()).filter(Boolean);
if (!terms.length) {
  console.error('check-banned-terms: no terms supplied (set BANNED_TERMS or create .banned-terms.local)');
  process.exit(2);
}
const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const re = new RegExp('(' + terms.map(esc).join('|') + ')', 'i');
const textExt = /\.(html?|css|js|mjs|json|md|txt|svg|xml|yml|yaml)$/i;

const files = execSync('git ls-files', { cwd: root, encoding: 'utf8' }).split('\n').filter((f) => f && textExt.test(f));
const scopes = process.argv.slice(2);
const scoped = scopes.length ? files.filter((f) => scopes.some((p) => f.startsWith(p))) : files;
const hits = [];
for (const f of scoped) {
  const lines = fs.readFileSync(path.join(root, f), 'utf8').split('\n');
  lines.forEach((l, i) => { if (re.test(l)) hits.push(`${f}:${i + 1}`); });
}

(async () => {
  if (process.env.CHECK_URL) {
    const res = await fetch(process.env.CHECK_URL);
    if (re.test(await res.text())) hits.push(process.env.CHECK_URL);
  }
  if (hits.length) {
    console.error(`check-banned-terms: ${hits.length} hit(s):\n  ` + hits.join('\n  '));
    process.exit(1);
  }
  console.log(`check-banned-terms: ok (${scoped.length} files, ${terms.length} terms)`);
})();
