#!/usr/bin/env node
'use strict';

/**
 * Guards the three Multiverse UX bugs:
 * 1. Go Beyond must not remain in the Multiverse dock.
 * 2. Portal must not whisper GO HOME / GO BEYOND.
 * 3. ?beyond=1 first paint is a coffee void until Multiverse CSS has rules.
 *    Cream path must not pick up that cover.
 */
var fs = require('fs');
var path = require('path');
var assert = require('assert');

var ROOT = path.resolve(__dirname, '..');
var index = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
var mvCss = fs.readFileSync(path.join(ROOT, 'assets/css/landing-multiverse.css'), 'utf8');
var creamCss = fs.readFileSync(path.join(ROOT, 'assets/css/landing.css'), 'utf8');
var beyondJs = fs.readFileSync(path.join(ROOT, 'assets/js/beyond-transition.js'), 'utf8');

var failed = 0;
var passed = 0;

function check(name, fn) {
  try {
    fn();
    passed += 1;
    console.log('ok  - ' + name);
  } catch (err) {
    failed += 1;
    console.log('fail - ' + name);
    console.log('     ' + (err && err.message ? err.message : err));
  }
}

function headBootScript(html) {
  var marker = html.indexOf('var beyond = /[?&]beyond=1');
  assert.ok(marker !== -1, 'index.html missing head boot script');
  var start = html.lastIndexOf('<script>', marker);
  var end = html.indexOf('</script>', marker);
  assert.ok(start !== -1 && end !== -1, 'index.html missing head boot script bounds');
  return html.slice(start, end);
}

check('multiverse CSS hides .multiverse-tab', function () {
  assert.ok(
    /html\.is-multiverse\s+\.multiverse-tab\s*\{[^}]*display\s*:\s*none/.test(mvCss),
    'landing-multiverse.css must hide .multiverse-tab under html.is-multiverse'
  );
});

check('multiverse CSS still shows .home-tab', function () {
  assert.ok(
    /html\.is-multiverse\s+\.home-tab\s*\{[\s\S]{0,400}display\s*:\s*flex/.test(mvCss),
    'landing-multiverse.css must keep .home-tab visible'
  );
});

check('portal JS does not set GO HOME / GO BEYOND whispers', function () {
  assert.ok(
    !/setWhisper\(\s*['"]GO HOME['"]\s*\)/.test(beyondJs),
    'beyond-transition.js still calls setWhisper(\'GO HOME\')'
  );
  assert.ok(
    !/setWhisper\(\s*['"]GO BEYOND['"]\s*\)/.test(beyondJs),
    'beyond-transition.js still calls setWhisper(\'GO BEYOND\')'
  );
  assert.ok(
    !/['"]GO HOME['"]/.test(beyondJs),
    'beyond-transition.js still contains GO HOME copy'
  );
  assert.ok(
    !/['"]GO BEYOND['"]/.test(beyondJs),
    'beyond-transition.js still contains GO BEYOND copy'
  );
});

check('html markup is not globally skin-pending (cream first paint stays cream)', function () {
  assert.ok(
    /<html\s+lang="en"\s+class="is-curtain"\s*>/.test(index),
    'html class must stay is-curtain only — no is-skin-pending on the tag'
  );
  assert.ok(
    !/\bis-skin-pending\b/.test(index),
    'index.html must not revive rejected is-skin-pending (broke cream)'
  );
});

check('beyond path only: coffee void until cssRules, then drop pending', function () {
  var boot = headBootScript(index);
  var beyondIdx = boot.indexOf('if (beyond)');
  assert.ok(beyondIdx !== -1, 'boot script missing beyond branch');
  var beyondBlock = boot.slice(beyondIdx);
  assert.ok(
    /#1E1510/.test(beyondBlock),
    'beyond branch must paint coffee void #1E1510'
  );
  assert.ok(
    /is-mv-skin-pending/.test(beyondBlock),
    'beyond branch must gate the void on is-mv-skin-pending'
  );
  assert.ok(
    /cssRules/.test(beyondBlock),
    'beyond branch must wait for stylesheet cssRules'
  );
  assert.ok(
    /classList\.remove\(\s*['"]is-mv-skin-pending['"]\s*\)/.test(beyondBlock),
    'beyond branch must drop is-mv-skin-pending after skin has rules'
  );
  assert.ok(
    /\.multiverse-tab/.test(beyondBlock) && /\.home-tab/.test(beyondBlock),
    'beyond pending CSS must hide .multiverse-tab and .home-tab during FOUC'
  );
  var creamIdx = boot.indexOf("root.classList.add('is-light-home')");
  assert.ok(creamIdx !== -1, 'boot script missing cream else branch');
  var creamEnd = boot.indexOf('document.head.appendChild(skin)');
  assert.ok(creamEnd !== -1 && creamEnd > creamIdx, 'boot script missing skin append after cream branch');
  var creamBlock = boot.slice(creamIdx, creamEnd);
  assert.ok(
    !/is-mv-skin-pending/.test(creamBlock),
    'cream else branch must not add is-mv-skin-pending'
  );
  assert.ok(
    !/#1E1510.*::before|is-mv-skin-pending/.test(creamBlock),
    'cream else branch must not inject the Multiverse FOUC cover'
  );
});

check('cream CSS file does not gain skin-pending / FOUC cover', function () {
  assert.ok(
    !/is-skin-pending|is-mv-skin-pending/.test(creamCss),
    'landing.css must stay free of Multiverse FOUC pending classes'
  );
});

check('cache queries bumped for touched Multiverse CSS/JS', function () {
  assert.ok(
    /landing-multiverse\.css\?v=mv9/.test(index),
    'index.html must bump landing-multiverse.css cache past mv8'
  );
  assert.ok(
    /landing\.css\?v=aeo30/.test(index),
    'cream landing.css cache must stay aeo30 (do not revive FOUC PR cream bump)'
  );
});

if (failed) {
  console.log('\n' + failed + ' failed, ' + passed + ' passed');
  process.exit(1);
}
console.log('\nall passed');
