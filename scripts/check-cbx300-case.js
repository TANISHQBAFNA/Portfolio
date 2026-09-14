#!/usr/bin/env node
'use strict';

/**
 * Guards CBX300 Section 01 cover: type left, overlapping image right.
 * Same markup for cream + Multiverse. Glitch only on Multiverse.
 */
var fs = require('fs');
var path = require('path');
var assert = require('assert');

var ROOT = path.resolve(__dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

var index = read('index.html');
var mvIndex = read('index-multiverse.html');
var pages = read('assets/js/cbx300-case.js');
var study = read('assets/js/project-study.js');
var landing = read('assets/js/landing.js');
var css = read('assets/css/cbx300-case.css');
var landingCss = read('assets/css/landing.css');
var mvCss = read('assets/css/landing-multiverse.css');

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

check('wires CBX300 cover into existing ProjectStudy router', function () {
  assert.ok(study.indexOf("template === 'cbx300'") !== -1, 'project-study missing cbx300 bind');
  assert.ok(study.indexOf('Cbx300Case.mount') !== -1, 'does not mount Cbx300Case');
  assert.ok(study.indexOf('Cbx300Case.armGlitch') !== -1, 'study must re-arm Multiverse glitch after intro');
  assert.ok(study.indexOf('is-study-page') !== -1, 'missing is-study-page overflow unlock');
  assert.ok(landing.indexOf("studyTemplate: 'cbx300'") !== -1, 'landing does not set studyTemplate');
  assert.ok(index.indexOf('data-world="cbx300"') !== -1, 'index.html missing cbx300 world');
  assert.ok(mvIndex.indexOf('data-world="cbx300"') !== -1, 'index-multiverse.html missing cbx300 world');
  assert.ok(index.indexOf('cbx300-case.css?v=s04') !== -1, 'index.html missing cover cache-bust');
  assert.ok(mvIndex.indexOf('cbx300-case.js?v=s04') !== -1, 'multiverse missing cover cache-bust');
  assert.ok(index.indexOf('project-study.js?v=s04') !== -1, 'index.html missing study cache-bust');
});

check('Section 01 copy matches CEO lock', function () {
  assert.ok(pages.indexOf('Case study · CBX300') === -1, 'Case study · CBX300 must be gone');
  assert.ok(pages.indexOf("kicker: 'Banking that'") !== -1, 'missing Banking that kicker');
  assert.ok(pages.indexOf("accent: 'Grows with'") !== -1, 'missing Grows with accent');
  assert.ok(pages.indexOf("word: 'the Business'") !== -1, 'missing the Business word');
  assert.ok(pages.indexOf('hero__support') === -1, 'duplicate support line must be dropped');
  assert.ok(pages.indexOf('hero__role') === -1, 'hero__role must be gone');
});

check('image sits to the right and overlaps type', function () {
  var coverFn = pages.slice(pages.indexOf('function buildCover'), pages.indexOf('function buildStubs'));
  var appendType = coverFn.indexOf('inner.appendChild(type)');
  var appendMedia = coverFn.indexOf('inner.appendChild(media)');
  assert.ok(appendType !== -1 && appendMedia !== -1 && appendType < appendMedia, 'type first, media on top for overlap');
  assert.ok(css.indexOf('position: absolute') !== -1, 'media must leave the type flow');
  assert.ok(/right:\s*0/.test(css), 'media must sit on the right');
  assert.ok(css.indexOf('z-index: 2') !== -1, 'media must paint over type');
  assert.ok(css.indexOf('aspect-ratio: 16 / 10') !== -1, 'media frame must be ~16:10');
  assert.ok(css.indexOf('dashed') !== -1, 'empty media must look intentional');
  assert.ok(css.indexOf('color-mix') !== -1, 'media fill must let type show through');
});

check('cover type is still a large home-parity shout', function () {
  assert.ok(css.indexOf('--cbx-shout:') !== -1, 'missing cover shout token');
  assert.ok(/8\.4vw/.test(css), 'cover shout must stay large');
  var homeShout = landingCss.indexOf('--shout: 8vw');
  assert.ok(homeShout !== -1, 'home shout baseline missing');
});

check('later sections are stubs, film grammar is not this PR', function () {
  assert.ok(pages.indexOf('rest.hidden = true') !== -1, 'stubs must be hidden');
  ['ladder', 'roles', 'approvals', 'money', 'permissions', 'grammar', 'scale'].forEach(function (id) {
    assert.ok(pages.indexOf("id: '" + id + "'") !== -1, 'missing stub id ' + id);
  });
  assert.ok(pages.indexOf('data-film-beat') === -1, 'film beats leaked');
  assert.ok(study.indexOf('CaseScrollKit.bind') === -1, 'cbx300 still binds film scroll kit');
});

check('cream stays calm; Multiverse glitches cover + chrome', function () {
  assert.ok(pages.indexOf("glitch ? className + ' glitch'") !== -1, 'Multiverse cover must add glitch class');
  assert.ok(pages.indexOf("setAttribute('data-text'") !== -1, 'glitch plates need data-text');
  assert.ok(pages.indexOf('armGlitchTarget') !== -1, 'must arm IrisMotion glitch targets');
  assert.ok(pages.indexOf('.study__word') !== -1, 'study chrome word must glitch on Multiverse');
  assert.ok(css.indexOf('html.is-light-home .cbx-cover .glitch::before') !== -1, 'cream must kill cover glitch plates');
  assert.ok(!/@keyframes\s+.*glitch/i.test(css), 'do not fork glitch keyframes in cover css');
  assert.ok(mvCss.indexOf('html.is-multiverse .glitch.is-glitching') !== -1, 'Multiverse sheet missing glitch burst');
});

check('Multiverse study uses ink/glitch blue, not cream paper', function () {
  assert.ok(css.indexOf('html.is-multiverse .study[data-template="cbx300"]') !== -1, 'missing Multiverse study skin');
  assert.ok(css.indexOf('#0e1018') !== -1, 'missing Multiverse ink');
  assert.ok(css.indexOf('#3de8f5') !== -1, 'missing Multiverse cyan');
  assert.ok(css.indexOf('html.is-light-home.is-dark .study[data-template="cbx300"]') !== -1, 'cream dark must not steal Multiverse ink');
});

check('cream and Multiverse share one cover layout', function () {
  assert.ok(index.indexOf('data-world="cbx300"') !== -1, 'cream index missing world');
  assert.ok(mvIndex.indexOf('data-world="cbx300"') !== -1, 'multiverse missing world');
  assert.ok(css.indexOf('html.is-multiverse .cbx-cover .hero__word') !== -1, 'multiverse must reuse cover type');
});

check('study page scroll unlocks; close control still present', function () {
  assert.ok(css.indexOf('html.is-study-page') !== -1, 'missing window-scroll page css');
  assert.ok(index.indexOf('data-study-close') !== -1, 'index missing close control');
  assert.ok(mvIndex.indexOf('data-study-close') !== -1, 'multiverse missing close control');
});

check('no invented NPS/outcomes; Echo avoid-list stays off the cover', function () {
  assert.ok(!/\bNPS\b/.test(pages), 'invented NPS');
  assert.ok(!/maker-checker/i.test(pages), 'maker-checker on page');
  assert.ok(!/\bseamless\b/i.test(pages), 'seamless on page');
  assert.ok(!/\bintuitive\b/i.test(pages), 'intuitive on page');
});

console.log(passed + ' passed, ' + failed + ' failed');
if (failed) process.exit(1);
