#!/usr/bin/env node
'use strict';

/**
 * Guards CBX300 cream Infoviz film (rebuild after PR #18 reject).
 * Echo copy, no Pages rail, cream paper, meaning-changing scrub, placeholders.
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
var kit = read('assets/js/case-scroll-kit.js');
var pages = read('assets/js/cbx300-case.js');
var study = read('assets/js/project-study.js');
var landing = read('assets/js/landing.js');
var data = read('assets/js/project-data.js');
var css = read('assets/css/cbx300-case.css');
var bar = read('docs/case-study-cbx300-redesign-bar.md');

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

check('wires CBX300 film into existing ProjectStudy router', function () {
  assert.ok(study.indexOf("template === 'cbx300'") !== -1, 'project-study missing cbx300 bind');
  assert.ok(study.indexOf('Cbx300Case.mount') !== -1, 'does not mount Cbx300Case');
  assert.ok(study.indexOf('CaseScrollKit.bind') !== -1, 'does not bind shared kit');
  assert.ok(landing.indexOf("studyTemplate: 'cbx300'") !== -1, 'landing does not set studyTemplate');
  assert.ok(index.indexOf('data-world="cbx300"') !== -1, 'index.html missing cbx300 world');
  assert.ok(mvIndex.indexOf('data-world="cbx300"') !== -1, 'index-multiverse.html missing cbx300 world');
  assert.ok(index.indexOf('cbx300-case.css') !== -1, 'index.html missing film css');
  assert.ok(index.indexOf('case-scroll-kit.js') !== -1, 'index.html missing scroll kit');
  assert.ok(index.indexOf('cbx300-case.js') !== -1, 'index.html missing case js');
});

check('eight beats cover through close', function () {
  ['cover', 'ladder', 'roles', 'approvals', 'money', 'permissions', 'grammar', 'scale'].forEach(function (id) {
    assert.ok(pages.indexOf("id: '" + id + "'") !== -1, 'missing beat ' + id);
  });
});

check('Echo locked hook + six plain chapter titles', function () {
  assert.ok(pages.indexOf('Banking for a company, not for one person.') !== -1, 'missing Echo hook');
  [
    'One product for every size of small business',
    'Three jobs: owner, maker, approver',
    'Approvals get their own door',
    'Show the real money, catch mistakes early',
    'Who can do what — in a clear grid',
    'Every money path ends the same way'
  ].forEach(function (title) {
    assert.ok(pages.indexOf(title) !== -1, 'missing chapter title: ' + title);
  });
  assert.ok(pages.indexOf('grows with the company') !== -1, 'missing Echo promise');
  assert.ok(data.indexOf('Banking for a company, not for one person.') !== -1, 'project-data missing Echo hook');
});

check('Infoviz grammar: claim first, meaning-changing scrub, close on finding', function () {
  assert.ok(kit.indexOf('transformOrigin') !== -1, 'kit missing crop/scale origin');
  assert.ok(kit.indexOf('focusOne') !== -1, 'kit missing progressive focus');
  assert.ok(kit.indexOf('cropSwap') !== -1, 'kit missing crop/crossfade with scale');
  assert.ok(kit.indexOf('data-film-track') !== -1, 'kit missing horizontal pan ending');
  assert.ok(kit.indexOf("pin: stage") !== -1, 'kit missing pinned stage');
  assert.ok(kit.indexOf('Claim stays readable') !== -1, 'kit missing claim-first lock');
  assert.ok(pages.indexOf("finding: true") !== -1, 'close is not a finding');
  assert.ok(pages.indexOf('259 web screens. 377 mobile screens. One grammar.') !== -1, 'missing volume finding');
  assert.ok(!/Zillow|Falls Church|Malabar Hill|stamp-duty/.test(pages), 'copied Infoviz housing content');
});

check('no Pages rail as primary wayfinding', function () {
  assert.ok(css.indexOf('.case-tabs') === -1, 'case-tabs css leaked from rejected wireframe');
  assert.ok(pages.indexOf('case-tabs') === -1, 'Pages rail markup in case js');
  assert.ok(pages.indexOf("tab: 'Cover'") === -1, 'tabbed TOC copy still in case js');
});

check('cream paper, not cool grey wireframe', function () {
  assert.ok(css.indexOf('#f4efe6') !== -1, 'missing cream');
  assert.ok(css.indexOf('#efeae1') !== -1, 'missing paper');
  assert.ok(css.indexOf('#00a0a0') !== -1, 'missing teal');
  assert.ok(css.indexOf('#F3F4F6') === -1 && css.indexOf('#f3f4f6') === -1, 'cool grey cover leaked');
  assert.ok(css.indexOf('#e7e9ed') === -1, 'wireframe slot grey leaked');
  assert.ok(css.indexOf('Syne') !== -1 && css.indexOf('Outfit') !== -1, 'missing portfolio type');
  assert.ok(!/@keyframes\s+.*glitch/i.test(css), 'glitch keyframes in film css');
});

check('tablet staged film + reduced-motion static stack', function () {
  assert.ok(css.indexOf('max-width: 960px') !== -1, 'missing tablet breakpoint');
  assert.ok(kit.indexOf('bindStaged') !== -1, 'kit missing staged tablet path');
  assert.ok(kit.indexOf('first proof visible') !== -1 || kit.indexOf('isTablet') !== -1, 'kit missing tablet branch');
  assert.ok(kit.indexOf('setupStatic') !== -1, 'kit missing static path');
  assert.ok(kit.indexOf('prefers-reduced-motion') !== -1, 'kit missing reduced-motion');
  assert.ok(css.indexOf('prefers-reduced-motion') !== -1, 'css missing reduced-motion');
});

check('Lisa Charlie demo only; no invented NPS/outcomes', function () {
  assert.ok(/demo brand/.test(pages), 'Lisa Charlie not labelled demo');
  assert.ok(!/\bNPS\b/.test(pages), 'invented NPS');
  assert.ok(!/time saved|time-saved/i.test(pages), 'invented time-saved');
  assert.ok(!/adoption rate/i.test(pages), 'invented adoption');
  assert.ok(pages.indexOf('Results stay blank until real numbers exist') !== -1, 'missing honest results line');
});

check('Echo avoid-list stays off the film', function () {
  assert.ok(!/maker-checker/i.test(pages), 'maker-checker on page');
  assert.ok(!/mental model/i.test(pages), 'mental model on page');
  assert.ok(!/entitlements/i.test(pages), 'entitlements jargon on page');
  assert.ok(!/dual control/i.test(pages), 'dual control on page');
  assert.ok(!/\bseamless\b/i.test(pages), 'seamless on page');
  assert.ok(!/\bintuitive\b/i.test(pages), 'intuitive on page');
});

check('free GSAP + ScrollTrigger only; no Club plugins', function () {
  [kit, pages, study, index].forEach(function (src) {
    assert.ok(!/gsap\/SplitText|MorphSVGPlugin|gsap\/Flip|registerPlugin\(\s*Flip/.test(src), 'Club plugin reference found');
  });
  assert.ok(kit.indexOf('ScrollTrigger') !== -1, 'kit missing ScrollTrigger');
});

check('redesign bar is the experience lock', function () {
  assert.ok(bar.indexOf('infoviz-cs5764.web.app') !== -1, 'bar missing Infoviz lock');
  assert.ok(bar.indexOf('PR #18 rejected') !== -1, 'bar missing reject note');
});

check('export path reserved, not required for this slice', function () {
  assert.ok(fs.existsSync(path.join(ROOT, 'assets/img/cbx300')), 'missing assets/img/cbx300 folder');
  assert.ok(pages.indexOf('Designed placeholders') !== -1, 'missing placeholder lock comment');
});

console.log(passed + ' passed, ' + failed + ' failed');
if (failed) process.exit(1);
