#!/usr/bin/env node
'use strict';

/**
 * Guards the three Multiverse UX bugs:
 * 1. Go Beyond must not remain in the Multiverse dock.
 * 2. Portal must not whisper GO HOME / GO BEYOND.
 * 3. ?beyond=1 first paint is a coffee void until Multiverse CSS has rules.
 * 4. ?home=1 (Go Home return) holds the same coffee cover until cream CSS
 *    has rules. Plain cream without home=1 must not pick up either cover.
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
  var homeArriveIdx = boot.indexOf('if (homeArrive)');
  assert.ok(homeArriveIdx !== -1 && homeArriveIdx > creamIdx, 'boot script missing homeArrive branch');
  var creamPlain = boot.slice(creamIdx, homeArriveIdx);
  assert.ok(
    !/is-mv-skin-pending/.test(creamPlain),
    'plain cream must not add is-mv-skin-pending'
  );
  assert.ok(
    !/is-home-arrive-pending/.test(creamPlain),
    'plain cream must not add is-home-arrive-pending'
  );
  assert.ok(
    !/::before/.test(creamPlain),
    'plain cream must not inject a FOUC cover'
  );
});

check('home=1 path: coffee void until cream cssRules, then drop pending', function () {
  var boot = headBootScript(index);
  var homeArriveIdx = boot.indexOf('if (homeArrive)');
  assert.ok(homeArriveIdx !== -1, 'boot script missing homeArrive branch');
  var skinAppend = boot.indexOf('document.head.appendChild(skin)');
  assert.ok(skinAppend !== -1 && skinAppend > homeArriveIdx, 'boot script missing skin append');
  var waitHomeIdx = boot.indexOf('else if (homeArrive)');
  assert.ok(waitHomeIdx !== -1, 'boot script missing homeArrive cssRules wait');
  var homeBlock = boot.slice(homeArriveIdx, skinAppend) + boot.slice(waitHomeIdx);
  assert.ok(
    !/is-mv-skin-pending/.test(homeBlock),
    'homeArrive must not reuse is-mv-skin-pending'
  );
  assert.ok(
    /is-home-arrive-pending/.test(homeBlock),
    'homeArrive must gate the void on is-home-arrive-pending'
  );
  assert.ok(
    /#1E1510/.test(homeBlock),
    'homeArrive must paint coffee void #1E1510'
  );
  assert.ok(
    /::before/.test(homeBlock),
    'homeArrive must inject a full-viewport coffee cover'
  );
  assert.ok(
    /cssRules/.test(homeBlock),
    'homeArrive must wait for cream stylesheet cssRules'
  );
  assert.ok(
    /classList\.remove\(\s*['"]is-home-arrive-pending['"]\s*\)/.test(homeBlock),
    'homeArrive must drop is-home-arrive-pending after cream CSS has rules'
  );
  assert.ok(
    /\.multiverse-tab/.test(homeBlock) && /\.home-tab/.test(homeBlock),
    'homeArrive pending CSS must hide .multiverse-tab and .home-tab during FOUC'
  );
});

check('Go Home keeps ?home=1 so cream return can cover FOUC', function () {
  var match = beyondJs.match(/function goHome\([\s\S]*?\n  function /);
  assert.ok(match, 'beyond-transition.js missing goHome');
  var goHomeFn = match[0];
  assert.ok(
    /withBeyondQuery\(/.test(goHomeFn) && /['"]home['"]/.test(goHomeFn),
    'goHome must keep ?home=1 via withBeyondQuery(..., \'home\')'
  );
  assert.ok(
    !/\.split\(\s*['"]\?['"]/.test(goHomeFn),
    'goHome must not strip the query string (that drops ?home=1)'
  );
});

check('cream CSS file does not gain skin-pending / FOUC cover', function () {
  assert.ok(
    !/is-skin-pending|is-mv-skin-pending|is-home-arrive-pending/.test(creamCss),
    'landing.css must stay free of FOUC pending classes'
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
  assert.ok(
    /beyond-transition\.js\?v=bx20/.test(index),
    'index.html must bump beyond-transition.js cache past bx19'
  );
});

if (failed) {
  console.log('\n' + failed + ' failed, ' + passed + ' passed');
  process.exit(1);
}
console.log('\nall passed');
