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

check('Aisha simple-story beats + six chapter titles', function () {
  assert.ok(pages.indexOf('Banking that grows with the business.') !== -1, 'missing Aisha hook');
  [
    'Meet Aisha.',
    'I designed for roles, not one user.',
    'My team can prepare. I need to approve.',
    'Can I afford to pay this supplier today?',
    'My team needs access, but not all access.',
    'Same goal. Different moment.'
  ].forEach(function (title) {
    assert.ok(pages.indexOf(title) !== -1, 'missing chapter title: ' + title);
  });
  assert.ok(pages.indexOf('grows') !== -1, 'missing grow-with-business promise');
  assert.ok(data.indexOf('Banking that grows with the business.') !== -1, 'project-data missing Aisha hook');
  assert.ok(pages.indexOf('Independent professional') !== -1, 'missing 3D ladder rung copy');
});

check('Infoviz grammar: claim first, meaning-changing scrub, close on finding', function () {
  assert.ok(kit.indexOf('transformOrigin') !== -1, 'kit missing crop/scale origin');
  assert.ok(kit.indexOf('clipPath') !== -1, 'kit missing crop/wipe clip-path');
  assert.ok(kit.indexOf('scaleY') !== -1, 'kit missing matrix draw');
  assert.ok(kit.indexOf('data-film-track') !== -1, 'kit missing horizontal pan ending');
  assert.ok(kit.indexOf('pin: true') !== -1, 'kit must GSAP-pin the leftover stage');
  assert.ok(kit.indexOf('preventOverlaps: true') !== -1, 'pin triggers must prevent chapter overlap');
  assert.ok(kit.indexOf('Claim stays readable') !== -1, 'kit missing claim-first lock');
  assert.ok(kit.indexOf('Opacity-only fades are a fail') !== -1, 'kit missing opacity-only fail lock');
  assert.ok(pages.indexOf("finding: true") !== -1, 'close is not a finding');
  assert.ok(pages.indexOf('259 web screens. 377 mobile screens. ~147 flows. One shared system.') !== -1, 'missing volume finding');
  assert.ok(pages.indexOf('Who prepared this payment? Does it need my approval?') !== -1, 'missing carrying question');
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

check('tablet keeps pin/scrub; reduced-motion static stack', function () {
  assert.ok(css.indexOf('max-width: 960px') !== -1, 'missing tablet breakpoint');
  assert.ok(kit.indexOf('bindCinematic') !== -1, 'kit missing cinematic pin path');
  assert.ok(kit.indexOf('setupStatic') !== -1, 'kit missing static path');
  assert.ok(kit.indexOf('prefers-reduced-motion') !== -1, 'kit missing reduced-motion');
  assert.ok(css.indexOf('prefers-reduced-motion') !== -1, 'css missing reduced-motion');
  assert.ok(kit.indexOf('bindStaged') === -1, 'dead tablet stack path leaked back');
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

check('GSAP pin holds leftover stage; captions sequential; focus in-frame', function () {
  assert.ok(
    /\[data-pin="true"\] \.film-stage[\s\S]{0,400}--study-stage/.test(css) ||
      /\[data-pin="true"\] \.film-stage[\s\S]{0,400}100svh - var\(--study-head/.test(css),
    'pinned stage must be leftover viewport under chrome, not extra 100svh'
  );
  assert.ok(kit.indexOf("start: function () { return 'top ' + head() + 'px'; }") !== -1, 'scrub start must sit below chrome');
  assert.ok(kit.indexOf('pin: true') !== -1, 'GSAP must pin the leftover stage');
  assert.ok(kit.indexOf('pinSpacing: true') !== -1, 'pinSpacing must be the runway');
  assert.ok(study.indexOf('return 72') !== -1, 'headPx fallback must match --study-head');
  assert.ok(study.indexOf('--study-stage') !== -1, 'syncHead must set leftover stage height from scroller');
});

check('crop/wipe hard-hides outgoing shot; captions sequential', function () {
  assert.ok(/autoAlpha:\s*0\.08/.test(kit) === false, 'crop still leaves ghost opacity');
  assert.ok(kit.indexOf('immediateRender: false') !== -1, 'incoming crop/wipe must not paint before its beat');
  assert.ok(kit.indexOf('autoAlpha: 0') !== -1, 'outgoing shot must fully hide after crop/wipe');
  assert.ok(kit.indexOf('outgoing caption hidden first') !== -1, 'captions must sequential-swap like crop');
  assert.ok(kit.indexOf('at + 0.28') !== -1, 'captionAt must wait for outgoing to hide before incoming');
  assert.ok(!/function captionAt[\s\S]{0,320}autoAlpha: on \? 1 : 0/.test(kit), 'captionAt still dual-fades at the same time');
  assert.ok(
    /film-caption-stack \[data-caption\] \+ \[data-caption\][\s\S]{0,220}visibility:\s*hidden/.test(css),
    'stacked captions must overlay hidden, not flow as two live lines'
  );
});

check('Decision layer on six chapters, not cover or scale', function () {
  var n = (pages.match(/decision:\s*\{/g) || []).length;
  assert.strictEqual(n, 6, 'expected 6 Decision chips, got ' + n);
  assert.ok(pages.indexOf("data-film-decision") !== -1, 'missing Decision chip markup');
  assert.ok(pages.indexOf('banking became a shared job') !== -1, 'missing ladder finding');
  assert.ok(pages.indexOf('not five separate banks') !== -1, 'missing ladder choice');
  assert.ok(pages.indexOf('people with very different jobs') !== -1, 'missing roles finding');
  assert.ok(pages.indexOf('not one generic user') !== -1, 'missing roles choice');
  assert.ok(pages.indexOf('Preparing a payment is not the same as approving it') !== -1, 'missing approvals finding');
  assert.ok(pages.indexOf('batch approve names the count') !== -1, 'missing approvals choice');
  assert.ok(pages.indexOf('One balance can be misleading') !== -1, 'missing money finding');
  assert.ok(pages.indexOf('Available balance leads the page') !== -1, 'missing money choice');
  assert.ok(pages.indexOf('A role name does not explain') !== -1, 'missing permissions finding');
  assert.ok(pages.indexOf('person, an action, and the right financial scope') !== -1, 'missing permissions choice');
  assert.ok(pages.indexOf('Shrinking the desktop onto a phone') !== -1, 'missing grammar finding');
  assert.ok(pages.indexOf('change the layout for the device') !== -1, 'missing grammar choice');
  assert.ok(pages.indexOf('Ruled out: bury under Payments, or select-all with no line of sight.') !== -1, 'missing approvals ruled-out');
  assert.ok(pages.indexOf('Ruled out: one big number, or a clean list that fails after submit.') !== -1, 'missing money ruled-out');
  assert.ok(pages.indexOf('Ruled out: one question per screen.') !== -1, 'missing permissions ruled-out');
  assert.ok(bar.indexOf('3D staircase') !== -1, 'bar missing 3D ladder motion lock');
  assert.ok(css.indexOf('.film-decision') !== -1, 'missing Decision chip css');
  assert.ok(kit.indexOf('function rungPose') !== -1, 'ladder must walk a 3D staircase');
  assert.ok(css.indexOf('perspective: 1500px') !== -1, 'ladder stage missing 3D perspective');
  assert.ok(css.indexOf('.film-beat[data-recipe="ends"] .film-shot-stack') !== -1, 'ladder 3D fan must unclip shot-stack');
  var reduceAt = css.indexOf('@media (prefers-reduced-motion: reduce)');
  var bang = css.indexOf('transform: none !important');
  assert.ok(reduceAt !== -1 && bang > reduceAt, 'kill-transform must live inside reduced-motion');
  var slice = css.slice(reduceAt, bang);
  var depth = 0;
  var i;
  for (i = 0; i < slice.length; i += 1) {
    if (slice[i] === '{') depth += 1;
    if (slice[i] === '}') depth -= 1;
  }
  assert.ok(depth > 0, 'reduced-motion closed before kill-transform — 3D ladder would flatten');
});

check('redesign bar is the experience lock', function () {
  assert.ok(bar.indexOf('infoviz-cs5764.web.app') !== -1, 'bar missing Infoviz lock');
  assert.ok(bar.indexOf('PR #18 rejected') !== -1, 'bar missing reject note');
  assert.ok(bar.indexOf('7. Decision layer') !== -1, 'bar missing Decision layer lock');
  assert.ok(/no invented research/i.test(bar), 'bar missing no-invented-research lock');
  assert.ok(bar.indexOf('8. Motion variety lock') !== -1, 'bar missing motion variety lock');
  assert.ok(/opacity-only = fail/i.test(bar), 'bar missing opacity-only fail');
});

check('viewport is the film scroller; GSAP is local; Safari clip is gone', function () {
  assert.ok(index.indexOf('assets/vendor/gsap.min.js') !== -1, 'index missing local GSAP');
  assert.ok(index.indexOf('assets/vendor/ScrollTrigger.min.js') !== -1, 'index missing local ScrollTrigger');
  assert.ok(mvIndex.indexOf('assets/vendor/gsap.min.js') !== -1, 'multiverse missing local GSAP');
  assert.ok(fs.existsSync(path.join(ROOT, 'assets/vendor/gsap.min.js')), 'vendored gsap.min.js missing');
  assert.ok(fs.existsSync(path.join(ROOT, 'assets/vendor/ScrollTrigger.min.js')), 'vendored ScrollTrigger.min.js missing');
  assert.ok(study.indexOf("scroller: null") !== -1, 'cbx300 must bind viewport scroller, not nested .study');
  assert.ok(study.indexOf('is-study-film') !== -1, 'missing is-study-film class');
  assert.ok(css.indexOf('html.is-study-film') !== -1, 'missing window-scroll film css');
  assert.ok(kit.indexOf('function isView') !== -1, 'kit missing viewport scroller helper');
  assert.ok(kit.indexOf('viewH(scroller)') !== -1, 'pin end must use viewH, not scroller.clientHeight');
  assert.ok(kit.indexOf('normalizeScroll') !== -1, 'kit missing iOS normalizeScroll');
  var landingCss = read('assets/css/landing.css');
  assert.ok(/html\.is-study \.study[\s\S]{0,220}overflow-x:\s*hidden/.test(landingCss), 'study must overflow-x hidden, not clip');
});

check('export path reserved, not required for this slice', function () {
  assert.ok(fs.existsSync(path.join(ROOT, 'assets/img/cbx300')), 'missing assets/img/cbx300 folder');
  assert.ok(pages.indexOf('Designed placeholders') !== -1, 'missing placeholder lock comment');
});

console.log(passed + ' passed, ' + failed + ' failed');
if (failed) process.exit(1);
