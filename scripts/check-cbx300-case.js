#!/usr/bin/env node
'use strict';

/**
 * Guards CBX300 Section 01 cover: stacked image above larger home-parity type.
 * Later chapters stay stubbed. No 8-beat film / Decision / Three.js in this slice.
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
var data = read('assets/js/project-data.js');
var css = read('assets/css/cbx300-case.css');
var landingCss = read('assets/css/landing.css');

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
    console.log('     ' + (err && err.message ? err && err.message : err));
  }
}

check('wires CBX300 cover into existing ProjectStudy router', function () {
  assert.ok(study.indexOf("template === 'cbx300'") !== -1, 'project-study missing cbx300 bind');
  assert.ok(study.indexOf('Cbx300Case.mount') !== -1, 'does not mount Cbx300Case');
  assert.ok(study.indexOf('is-study-page') !== -1, 'missing is-study-page overflow unlock');
  assert.ok(landing.indexOf("studyTemplate: 'cbx300'") !== -1, 'landing does not set studyTemplate');
  assert.ok(index.indexOf('data-world="cbx300"') !== -1, 'index.html missing cbx300 world');
  assert.ok(mvIndex.indexOf('data-world="cbx300"') !== -1, 'index-multiverse.html missing cbx300 world');
  assert.ok(index.indexOf('cbx300-case.css') !== -1, 'index.html missing case css');
  assert.ok(index.indexOf('cbx300-case.js') !== -1, 'index.html missing case js');
  assert.ok(index.indexOf('cbx300-case.css?v=s03') !== -1, 'index.html missing cover cache-bust');
  assert.ok(mvIndex.indexOf('cbx300-case.js?v=s03') !== -1, 'multiverse missing cover cache-bust');
});

check('Section 01 copy matches cream cover lock', function () {
  assert.ok(pages.indexOf('Case study · CBX300') === -1, 'Case study · CBX300 must be gone');
  assert.ok(pages.indexOf("kicker: 'SME'") !== -1, 'missing SME kicker');
  assert.ok(pages.indexOf("accent: 'BANKING'") !== -1, 'missing BANKING accent');
  assert.ok(pages.indexOf("word: 'GROWTH'") !== -1, 'missing GROWTH word');
  assert.ok(pages.indexOf('Banking that grows with the business.') !== -1, 'missing support hook');
  assert.ok(data.indexOf('Banking that grows with the business.') !== -1, 'project-data missing hook');
});

check('cover stacks image placeholder above home-parity type', function () {
  var coverFn = pages.slice(pages.indexOf('function buildCover'), pages.indexOf('function buildStubs'));
  var mediaAt = coverFn.indexOf("el('figure', 'cbx-cover__media')");
  var typeAt = coverFn.indexOf("el('div', 'hero__type cbx-cover__type')");
  var appendMedia = coverFn.indexOf('inner.appendChild(media)');
  var appendType = coverFn.indexOf('inner.appendChild(type)');
  assert.ok(mediaAt !== -1, 'missing cover media frame');
  assert.ok(typeAt !== -1, 'missing hero__type stack');
  assert.ok(coverFn.indexOf("el('p', 'hero__role'") === -1, 'hero__role must be gone');
  assert.ok(coverFn.indexOf("el('span', 'hero__kicker'") !== -1, 'missing hero__kicker');
  assert.ok(coverFn.indexOf("el('span', 'hero__accent'") !== -1, 'missing hero__accent');
  assert.ok(coverFn.indexOf("el('span', 'hero__word'") !== -1, 'missing hero__word');
  assert.ok(coverFn.indexOf("el('p', 'hero__support'") !== -1, 'missing hero__support');
  var supportAt = coverFn.indexOf("el('p', 'hero__support'");
  var headingAt = coverFn.indexOf("el('h1', 'hero__heading')");
  assert.ok(supportAt !== -1 && headingAt !== -1 && supportAt < headingAt, 'hook must sit above SME / BANKING / GROWTH');
  assert.ok(mediaAt < typeAt, 'media must be created before type');
  assert.ok(appendMedia !== -1 && appendType !== -1 && appendMedia < appendType, 'media must append before type');
  assert.ok(coverFn.indexOf("'Image'") !== -1, 'missing Image empty-state label');
  assert.ok(css.indexOf('flex-direction: column') !== -1, 'cover must stack vertically');
  assert.ok(css.indexOf('aspect-ratio: 16 / 10') !== -1, 'media frame must be ~16:10');
  assert.ok(css.indexOf('dashed') !== -1, 'empty media must look intentional (dashed frame)');
});

check('cover type is larger than cream home shout (8vw)', function () {
  assert.ok(css.indexOf('--cbx-shout:') !== -1, 'missing cover shout token');
  assert.ok(/10\.8vw/.test(css), 'cover shout must scale past home 8vw');
  assert.ok(/min\(var\(--cbx-shout\)/.test(css), 'cover shout must beat home hero !important');
  var homeShout = landingCss.indexOf('--shout: 8vw');
  assert.ok(homeShout !== -1, 'home shout baseline missing — cannot prove cover is larger');
});

check('later sections are stubs, film grammar is not this PR', function () {
  assert.ok(pages.indexOf("data-cbx-rest") !== -1, 'missing stub wrapper');
  assert.ok(pages.indexOf('rest.hidden = true') !== -1, 'stubs must be hidden');
  ['ladder', 'roles', 'approvals', 'money', 'permissions', 'grammar', 'scale'].forEach(function (id) {
    assert.ok(pages.indexOf("id: '" + id + "'") !== -1, 'missing stub id ' + id);
  });
  assert.ok(pages.indexOf('data-film-beat') === -1, 'film beats leaked into cover mount');
  assert.ok(pages.indexOf('data-film-decision') === -1, 'Decision layer leaked into cover');
  assert.ok(css.indexOf('.film-decision') === -1, 'Decision css leaked');
  assert.ok(css.indexOf('perspective: 1500px') === -1, '3D ladder css leaked');
  assert.ok(study.indexOf('CaseScrollKit.bind') === -1, 'cbx300 still binds film scroll kit');
});

check('cream paper, Syne/Outfit, no cover glitch theatre', function () {
  assert.ok(css.indexOf('#f4efe6') !== -1, 'missing cream');
  assert.ok(css.indexOf('#efeae1') !== -1, 'missing paper');
  assert.ok(css.indexOf('#00a0a0') !== -1, 'missing teal');
  assert.ok(css.indexOf('Syne') !== -1 && css.indexOf('Outfit') !== -1, 'missing portfolio type');
  assert.ok(!/@keyframes\s+.*glitch/i.test(css), 'glitch keyframes in cover css');
  assert.ok(css.indexOf('.cbx-cover .glitch') !== -1, 'cover must kill type glitch');
});

check('cream and Multiverse share one cover layout', function () {
  assert.ok(index.indexOf('data-world="cbx300"') !== -1, 'cream index missing world');
  assert.ok(mvIndex.indexOf('data-world="cbx300"') !== -1, 'multiverse missing world');
  assert.ok(css.indexOf('html.is-multiverse .cbx-cover .hero__word') !== -1, 'multiverse must reuse cover type, not a second layout');
  assert.ok(pages.indexOf('multiverse') === -1 || pages.indexOf('buildCover') !== -1, 'do not fork cover markup per theme');
});

check('study page scroll unlocks; close control still present', function () {
  assert.ok(css.indexOf('html.is-study-page') !== -1, 'missing window-scroll page css');
  assert.ok(study.indexOf("html.classList.add('is-study-page')") !== -1, 'open must add is-study-page');
  assert.ok(study.indexOf("html.classList.remove('is-study-page')") !== -1, 'close must drop is-study-page');
  assert.ok(/html\.is-study \.study[\s\S]{0,220}overflow-x:\s*hidden/.test(landingCss), 'study must overflow-x hidden, not clip');
  assert.ok(index.indexOf('data-study-close') !== -1, 'index missing close control');
  assert.ok(mvIndex.indexOf('data-study-close') !== -1, 'multiverse missing close control');
});

check('no invented NPS/outcomes; Echo avoid-list stays off the cover', function () {
  assert.ok(!/\bNPS\b/.test(pages), 'invented NPS');
  assert.ok(!/time saved|time-saved/i.test(pages), 'invented time-saved');
  assert.ok(!/adoption rate/i.test(pages), 'invented adoption');
  assert.ok(!/maker-checker/i.test(pages), 'maker-checker on page');
  assert.ok(!/mental model/i.test(pages), 'mental model on page');
  assert.ok(!/entitlements/i.test(pages), 'entitlements jargon on page');
  assert.ok(!/\bseamless\b/i.test(pages), 'seamless on page');
  assert.ok(!/\bintuitive\b/i.test(pages), 'intuitive on page');
  assert.ok(!/Zillow|Falls Church|Malabar Hill/.test(pages), 'copied Infoviz housing content');
});

console.log(passed + ' passed, ' + failed + ' failed');
if (failed) process.exit(1);
