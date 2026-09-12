#!/usr/bin/env node
'use strict';

/**
 * Guards the three Multiverse UX bugs:
 * 1. Go Beyond must not remain in the Multiverse dock.
 * 2. Portal must not whisper GO HOME / GO BEYOND.
 * 3. ?beyond=1 first paint is a coffee void until Multiverse CSS has rules.
 * 4. ?home=1 (Go Home return) holds the same coffee cover until cream CSS
 *    has light-home --mark-size / masthead rules — not merely cssRules.length > 10.
 *    Plain cream without home=1 must not pick up either cover.
 * 5. Cream curtain must not copy a premature tiny logo font-size into an
 *    inline lock; Go Home and cold cream share the --mark-size beat size.
 */
var fs = require('fs');
var path = require('path');
var assert = require('assert');

var ROOT = path.resolve(__dirname, '..');
var index = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
var mvIndex = fs.readFileSync(path.join(ROOT, 'index-multiverse.html'), 'utf8');
var mvCss = fs.readFileSync(path.join(ROOT, 'assets/css/landing-multiverse.css'), 'utf8');
var creamCss = fs.readFileSync(path.join(ROOT, 'assets/css/landing.css'), 'utf8');
var beyondJs = fs.readFileSync(path.join(ROOT, 'assets/js/beyond-transition.js'), 'utf8');
var mvLanding = fs.readFileSync(path.join(ROOT, 'assets/js/landing-multiverse.js'), 'utf8');
var mvMotion = fs.readFileSync(path.join(ROOT, 'assets/js/iris-motion-multiverse.js'), 'utf8');
var studyJs = fs.readFileSync(path.join(ROOT, 'assets/js/project-study.js'), 'utf8');
var creamLanding = fs.readFileSync(path.join(ROOT, 'assets/js/landing.js'), 'utf8');

function mediaBlocks(css, query) {
  var needle = '@media (' + query + ')';
  var out = [];
  var from = 0;
  while (from < css.length) {
    var start = css.indexOf(needle, from);
    if (start === -1) break;
    var brace = css.indexOf('{', start);
    if (brace === -1) break;
    var depth = 0;
    var i;
    for (i = brace; i < css.length; i += 1) {
      if (css[i] === '{') depth += 1;
      else if (css[i] === '}') {
        depth -= 1;
        if (depth === 0) {
          out.push(css.slice(brace + 1, i));
          from = i + 1;
          break;
        }
      }
    }
    if (i >= css.length) break;
  }
  return out.join('\n');
}

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

check('home=1 path: coffee void until cream light-home mark rules, then drop pending', function () {
  var boot = headBootScript(index);
  var homeArriveIdx = boot.indexOf('if (homeArrive)');
  assert.ok(homeArriveIdx !== -1, 'boot script missing homeArrive branch');
  var skinAppend = boot.indexOf('document.head.appendChild(skin)');
  assert.ok(skinAppend !== -1 && skinAppend > homeArriveIdx, 'boot script missing skin append');
  var waitHomeIdx = boot.indexOf('else if (homeArrive)');
  assert.ok(waitHomeIdx !== -1, 'boot script missing homeArrive cream-skin wait');
  var homeBlock = boot.slice(homeArriveIdx, skinAppend) + boot.slice(waitHomeIdx);
  var homeWait = boot.slice(waitHomeIdx);
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
    /--mark-size/.test(homeWait) && /is-light-home/.test(homeWait),
    'homeArrive must wait for light-home --mark-size, not a raw cssRules count'
  );
  assert.ok(
    !/cssRules\.length\s*>\s*10/.test(homeWait),
    'homeArrive must not drop the cover on cssRules.length > 10 (fires before --mark-size)'
  );
  assert.ok(
    /classList\.remove\(\s*['"]is-home-arrive-pending['"]\s*\)/.test(homeBlock),
    'homeArrive must drop is-home-arrive-pending after cream mark rules apply'
  );
  assert.ok(
    /\.multiverse-tab/.test(homeBlock) && /\.home-tab/.test(homeBlock),
    'homeArrive pending CSS must hide .multiverse-tab and .home-tab during FOUC'
  );
});

check('base masthead name size sits before cream --mark-size (the premature copy)', function () {
  var baseName = creamCss.indexOf('.masthead__name {');
  var markVar = creamCss.indexOf('--mark-size:');
  var lightName = creamCss.indexOf('html.is-light-home .masthead__name');
  assert.ok(baseName !== -1 && markVar !== -1 && lightName !== -1, 'landing.css missing mark size rules');
  assert.ok(
    baseName < markVar && baseName < lightName,
    'base .masthead__name (tiny clamp) must precede --mark-size so a >10 cssRules poll copies the speck'
  );
});

check('cream playCurtain does not lock mark font-size from a premature logo compute', function () {
  var start = creamLanding.indexOf('function playCurtain');
  var end = creamLanding.indexOf('function fitHeroType');
  assert.ok(start !== -1 && end !== -1 && end > start, 'landing.js missing playCurtain');
  var play = creamLanding.slice(start, end);
  assert.ok(
    /getPropertyValue\(\s*['"]--mark-size['"]\s*\)/.test(play),
    'playCurtain must read computed --mark-size before locking curtain type'
  );
  assert.ok(
    !/mark\.style\.fontSize\s*=\s*window\.getComputedStyle\(logo\)\.fontSize/.test(play),
    'playCurtain must not copy logo fontSize before layout is known'
  );
  assert.ok(
    /1\.15/.test(play),
    'playCurtain must keep a --mark-size floor so base masthead clamp cannot lock a speck'
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

check('cache queries bumped for My Work glitch skin', function () {
  assert.ok(
    /landing-multiverse\.css\?v=mv12/.test(index),
    'index.html must bump landing-multiverse.css cache to mv12'
  );
  assert.ok(
    /landing-multiverse\.css\?v=mv12/.test(mvIndex),
    'index-multiverse.html must bump landing-multiverse.css cache to mv12'
  );
  assert.ok(
    /iris-motion-multiverse\.js\?v=mv9/.test(index),
    'index.html must bump iris-motion-multiverse.js cache to mv9'
  );
  assert.ok(
    /iris-motion-multiverse\.js\?v=mv9/.test(mvIndex),
    'index-multiverse.html must bump iris-motion-multiverse.js cache to mv9'
  );
  assert.ok(
    /landing-multiverse\.js\?v=mv10/.test(index),
    'index.html must bump landing-multiverse.js cache to mv10'
  );
  assert.ok(
    /landing-multiverse\.js\?v=mv10/.test(mvIndex),
    'index-multiverse.html must bump landing-multiverse.js cache to mv10'
  );
  assert.ok(
    /project-study\.js\?v=hz129/.test(index),
    'index.html must bump project-study.js cache to hz129'
  );
  assert.ok(
    /landing\.css\?v=aeo32/.test(index),
    'index.html must bump landing.css cache to aeo32 for shared chrome layout'
  );
  assert.ok(
    /landing\.css\?v=aeo32/.test(mvIndex),
    'index-multiverse.html must load shared landing.css (aeo32)'
  );
  assert.ok(
    /beyond-transition\.js\?v=bx20/.test(index),
    'index.html must keep beyond-transition.js cache at bx20 (Go Home FOUC cover)'
  );
  assert.ok(
    /landing\.js\?v=aeo33/.test(index),
    'index.html must bump landing.js cache for cream curtain mark-size lock'
  );
});

check('shared markup wraps My Work in landing-chrome', function () {
  assert.ok(
    /<div class="landing-screen">[\s\S]*<div class="landing-chrome">[\s\S]*class="work-cta"[\s\S]*class="edge-dock"[\s\S]*<\/div>\s*<\/div>/.test(index),
    'index.html must wrap hero chrome in landing-screen / landing-chrome'
  );
  assert.ok(
    /<div class="landing-screen">[\s\S]*<div class="landing-chrome">[\s\S]*class="work-cta"[\s\S]*class="edge-dock"[\s\S]*<\/div>\s*<\/div>/.test(mvIndex),
    'index-multiverse.html must wrap hero chrome in landing-screen / landing-chrome'
  );
});

function sharedChrome(sel) {
  return new RegExp(
    'html\\.is-light-home ' + sel + '\\s*,\\s*html\\.is-multiverse ' + sel
  );
}

check('My Work + landing-chrome + rise live in one shared landing.css rule set', function () {
  assert.ok(
    sharedChrome('\\.work-cta').test(creamCss),
    'landing.css must list html.is-light-home .work-cta, html.is-multiverse .work-cta'
  );
  assert.ok(
    sharedChrome('\\.landing-chrome').test(creamCss),
    'landing.css must list html.is-light-home .landing-chrome, html.is-multiverse .landing-chrome'
  );
  var desk = mediaBlocks(creamCss, 'min-width: 768px');
  assert.ok(desk.length, 'landing.css missing min-width 768px block');
  assert.ok(
    sharedChrome('\\.work-cta').test(desk) &&
      /translate3d\(\s*-50%\s*,\s*calc\(\s*\(var\(--rise,\s*1\)\s*-\s*1\)\s*\*\s*100svh\s*\)/.test(desk),
    'desktop shared .work-cta must use one --rise handle math for both worlds'
  );
  assert.ok(
    /html\.is-light-home\.is-curtain \.work-cta\s*,\s*html\.is-multiverse\.is-curtain \.work-cta[\s\S]{0,180}translate3d\(\s*-50%\s*,\s*36px/.test(creamCss),
    'curtain hide must keep My Work centered (-50%) so it does not jump on lift'
  );
  var creamMobile = mediaBlocks(creamCss, 'max-width: 767px');
  assert.ok(
    sharedChrome('\\.landing-chrome').test(creamMobile) &&
      /position:\s*absolute/.test(creamMobile.match(/html\.is-light-home \.landing-chrome[\s\S]{0,280}/)[0]),
    'shared mobile landing-chrome must sit on the first screen'
  );
  assert.ok(
    sharedChrome('\\.work-cta').test(creamMobile) &&
      /position:\s*relative/.test(creamMobile.match(/html\.is-light-home \.work-cta[\s\S]{0,420}/)[0]),
    'shared mobile .work-cta must drop position:fixed'
  );
});

check('Multiverse CSS does not re-specify My Work / chrome layout', function () {
  function isHandleRule(rule) {
    var sel = rule.split('{')[0];
    return sel.split(',').some(function (part) {
      var s = part.replace(/\/\*[\s\S]*?\*\//g, '').trim();
      if (/::/.test(s) || /\.work-cta__/.test(s)) return false;
      return /\.work-cta(?:\.[a-zA-Z0-9_-]+)*\s*$/.test(s);
    });
  }
  var workRules = mvCss.match(/html\.is-multiverse[^{}]*\.work-cta[^{]*\{[^}]*\}/g) || [];
  workRules.forEach(function (rule) {
    if (!isHandleRule(rule)) return;
    assert.ok(
      !/\bposition\s*:/.test(rule),
      'landing-multiverse.css .work-cta must not set position: ' + rule.slice(0, 120)
    );
    assert.ok(
      !/\btransform\s*:/.test(rule),
      'landing-multiverse.css .work-cta handle must not set transform: ' + rule.slice(0, 120)
    );
    assert.ok(
      !/--rise/.test(rule),
      'landing-multiverse.css .work-cta must not set --rise: ' + rule.slice(0, 120)
    );
  });
  assert.ok(
    !/html\.is-multiverse \.landing-chrome\s*\{/.test(mvCss),
    'landing-multiverse.css must not redefine .landing-chrome layout'
  );
  assert.ok(
    /html\.is-light-home \.home-tab\s*\{[^}]*display:\s*none/.test(creamCss),
    'cream must hide .home-tab so Go Home does not leak onto production dock'
  );
});

check('Multiverse My Work has comic / RGB skin; cream does not', function () {
  var mvBlock = mvCss.match(/html\.is-multiverse \.work-cta\s*\{[^}]+\}/);
  assert.ok(mvBlock, 'landing-multiverse.css must skin html.is-multiverse .work-cta');
  assert.ok(/border-radius:\s*0/.test(mvBlock[0]), 'Multiverse My Work must be square comic');
  assert.ok(
    /box-shadow:[\s\S]*cyan/.test(mvBlock[0]) && /box-shadow:[\s\S]*ink/.test(mvBlock[0]),
    'Multiverse My Work must use cyan + ink comic offset'
  );
  assert.ok(
    /html\.is-multiverse \.work-cta::before/.test(mvCss) &&
      /html\.is-multiverse \.work-cta::after/.test(mvCss),
    'Multiverse My Work must have RGB fringe plates'
  );
  assert.ok(
    /function burstWorkCta\(/.test(mvMotion) && /burstWorkCta\(reduceMotion/.test(mvLanding),
    'Multiverse hitch loop + hover must pulse My Work'
  );
  assert.ok(
    !/html\.is-light-home \.work-cta\s*\{[^}]*border-radius:\s*0/.test(creamCss),
    'cream landing.css must not square My Work'
  );
  assert.ok(
    /border-radius:\s*18px 18px 0 0/.test(creamCss),
    'shared landing.css must keep cream My Work as a rounded pull-tab'
  );
});

check('both worlds load shared landing.css; Multiverse adds glitch sheet after', function () {
  assert.ok(
    /landing\.css\?v=aeo32/.test(index),
    'index.html must load shared landing.css'
  );
  assert.ok(
    /landing\.css\?v=aeo32/.test(mvIndex),
    'index-multiverse.html must load shared landing.css'
  );
  var mvLink = mvIndex.indexOf('landing-multiverse.css?v=mv12');
  var layoutLink = mvIndex.indexOf('landing.css?v=aeo32');
  assert.ok(layoutLink !== -1 && mvLink !== -1 && layoutLink < mvLink,
    'index-multiverse.html must load landing.css before landing-multiverse.css');
});

check('project curtain name stays bottom-left in Multiverse', function () {
  assert.ok(
    /html\.is-multiverse \.study__veil\s*\{[\s\S]{0,280}align-items:\s*flex-end/.test(mvCss),
    'Multiverse study veil must align the name to the bottom'
  );
  assert.ok(
    /html\.is-multiverse \.study__veil\s*\{[\s\S]{0,280}justify-content:\s*flex-start/.test(mvCss),
    'Multiverse study veil must keep the name on the left, not centered like curtain__mark'
  );
  assert.ok(
    !/html\.is-multiverse \.study__veil[\s\S]{0,200}justify-content:\s*center/.test(mvCss),
    'Multiverse study veil must not center the project name'
  );
});

check('project open curtain uses the same IrisMotion hitch / letter-glitch as home', function () {
  assert.ok(
    /pulseStudyCurtain/.test(mvMotion),
    'iris-motion-multiverse.js must export pulseStudyCurtain'
  );
  assert.ok(
    /pulseStudyCurtain\(\s*['"]plate['"]\s*\)/.test(studyJs) ||
      /pulseStudyCurtain\([^)]*['"]plate['"]/.test(studyJs),
    'project-study.js must hitch the veil plate after it lands (not at wipe start)'
  );
  assert.ok(
    /pulseStudyCurtain\([^)]*['"]name['"]/.test(studyJs),
    'project-study.js must burst letter-glitch on study__curtain-name after paint'
  );
  assert.ok(
    !/is-study-wipe[\s\S]{0,180}hitchVeil/.test(mvLanding),
    'landing-multiverse.js must not hitch the project curtain on is-study-wipe start (veil still offscreen)'
  );
});

if (failed) {
  console.log('\n' + failed + ' failed, ' + passed + ' passed');
  process.exit(1);
}
console.log('\nall passed');
