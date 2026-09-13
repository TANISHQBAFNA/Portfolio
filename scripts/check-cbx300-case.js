#!/usr/bin/env node
'use strict';

/**
 * Guards CBX300 Aisha cream Infoviz film (Echo 8-beat story).
 * Window scroller, meaning-changing scrub, cream paper, placeholders.
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
var bar = read('docs/case-study-cbx300-aisha-redesign-bar.md');
var source = read('docs/source/cbx300-aisha-case.html');
var viewport = read('assets/js/viewport.js');

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
  assert.ok(index.indexOf('assets/js/viewport.js') !== -1, 'index.html missing viewport.js');
  assert.ok(mvIndex.indexOf('assets/js/viewport.js') !== -1, 'multiverse missing viewport.js');
});

check('eight Echo beats cover through close', function () {
  [
    'cover', 'freelancer', 'sole', 'ten', 'mid', 'devices', 'corporate', 'close'
  ].forEach(function (id) {
    assert.ok(pages.indexOf("id: '" + id + "'") !== -1, 'missing beat ' + id);
  });
  assert.strictEqual((pages.match(/id: '/g) || []).length >= 8, true, 'expected eight beats');
});

check('Aisha source hook + representative disclaimer', function () {
  assert.ok(pages.indexOf('Banking that grows with the business.') !== -1, 'missing Aisha hook');
  [
    'Did I get paid. Can I pay.',
    'How much can I safely spend.',
    'Prepare is not approve.',
    'Control room. Safe handoffs.',
    'Same task. Device-fit.',
    'Control without day-one corporate weight.',
    'A bank she does not outgrow.'
  ].forEach(function (title) {
    assert.ok(pages.indexOf(title) !== -1, 'missing chapter title: ' + title);
  });
  assert.ok(data.indexOf('Banking that grows with the business.') !== -1, 'project-data missing Aisha hook');
  assert.ok(pages.indexOf('representative example') !== -1, 'missing Aisha disclaimer');
  assert.ok(pages.indexOf('not five separate banks') !== -1, 'missing ladder choice');
});

check('Iris slots for all eight beats', function () {
  [
    'title+ladder',
    'phone pay',
    'four-balance+beneficiary',
    'approvals door+list',
    'waiting-on-me+permissions',
    'web∥phone',
    'light vs heavy',
    'finding pin'
  ].forEach(function (slot) {
    assert.ok(pages.indexOf(slot) !== -1, 'missing Iris slot ' + slot);
  });
});

check('proof UI for each beat', function () {
  assert.ok(pages.indexOf('Get paid') !== -1 && pages.indexOf('Pay') !== -1, 'missing phone pay/get paid');
  assert.ok(pages.indexOf('Available') !== -1 && pages.indexOf('Uncleared') !== -1, 'missing four balances');
  assert.ok(pages.indexOf('Confirm beneficiary') !== -1, 'missing beneficiary handoff');
  assert.ok(pages.indexOf('Approve (6)') !== -1, 'missing Approve (N)');
  assert.ok(pages.indexOf('128 transactions · 3 failed system validation') !== -1, 'missing 128/3 validation');
  assert.ok(pages.indexOf('Waiting on me') !== -1, 'missing waiting-on-me');
  assert.ok(pages.indexOf('Start') !== -1 && pages.indexOf('Approve') !== -1, 'missing verb grid');
  assert.ok(pages.indexOf('Command desk') !== -1, 'missing heavy corporate column');
});

check('Infoviz grammar: claim first, meaning-changing scrub, close on finding', function () {
  assert.ok(kit.indexOf('transformOrigin') !== -1, 'kit missing crop/scale origin');
  assert.ok(kit.indexOf('clipPath') !== -1, 'kit missing crop/wipe clip-path');
  assert.ok(kit.indexOf('pin: true') !== -1, 'kit must GSAP-pin the leftover stage');
  assert.ok(kit.indexOf('Claim stays readable') !== -1, 'kit missing claim-first lock');
  assert.ok(kit.indexOf('Opacity-only fades are a fail') !== -1, 'kit missing opacity-only fail lock');
  assert.ok(pages.indexOf("finding: true") !== -1, 'close is not a finding');
  assert.ok(pages.indexOf('259 web screens. 377 mobile screens. ~147 flows. One shared system.') !== -1, 'missing volume finding');
  assert.ok(!/Zillow|Falls Church|Malabar Hill|stamp-duty/.test(pages), 'copied Infoviz housing content');
  [
    'bindKenBurns', 'bindPhone', 'bindMoneyCrop', 'bindSplitDoor',
    'bindControl', 'bindMorph', 'bindSplitWeight', 'bindFinding'
  ].forEach(function (fn) {
    assert.ok(kit.indexOf('function ' + fn) !== -1, 'missing distinct scrub ' + fn);
  });
});

check('prepare/approve split never fades prepare into approve', function () {
  var start = kit.indexOf('function bindSplitDoor');
  var end = kit.indexOf('function bindControl');
  assert.ok(start !== -1 && end > start, 'bindSplitDoor block missing');
  var door = kit.slice(start, end);
  assert.ok(door.indexOf("data-pane=\"prepare\"") !== -1 || door.indexOf("[data-pane=\"prepare\"]") !== -1, 'split missing prepare pane');
  assert.ok(door.indexOf("[data-pane=\"approve\"]") !== -1, 'split missing approve pane');
  assert.ok(!/tl\.to\(\s*prepare[\s\S]{0,120}autoAlpha:\s*0/.test(door), 'prepare pane fades out');
  assert.ok(!/tl\.to\(\s*approve[\s\S]{0,120}autoAlpha:\s*0/.test(door), 'approve pane fades in via opacity');
  assert.ok(door.indexOf('clipPath') !== -1, 'split must crop/clip, not fade');
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
  assert.ok(css.indexOf('#147a4a') !== -1, 'missing bank-green inside product frames');
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
  assert.ok(!/three\.js|@react-three|Spline/i.test(pages + kit), '3D runtime leaked onto cream film');
});

check('GSAP pin holds leftover stage; captions sequential; focus in-frame', function () {
  assert.ok(
    /\[data-pin="true"\] \.film-stage[\s\S]{0,400}--study-stage/.test(css) ||
      /\[data-pin="true"\] \.film-stage[\s\S]{0,400}100svh - var\(--study-head/.test(css) ||
      /\[data-pin="true"\] \.film-stage[\s\S]{0,400}--vvh/.test(css),
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

check('Decision layer on seven chapters, not close', function () {
  var n = (pages.match(/decision:\s*\{/g) || []).length;
  assert.strictEqual(n, 7, 'expected 7 Decision chips, got ' + n);
  assert.ok(pages.indexOf('data-film-decision') !== -1, 'missing Decision chip markup');
  assert.ok(pages.indexOf('film-decision__ui') !== -1, 'Decision chip missing UI line');
  assert.ok(pages.indexOf('Did I get paid') !== -1, 'missing freelancer finding');
  assert.ok(pages.indexOf('Available leads') !== -1, 'missing money choice');
  assert.ok(pages.indexOf('Prepare is not approve') !== -1, 'missing approvals finding');
  assert.ok(pages.indexOf('Waiting on me') !== -1, 'missing control-room proof');
  assert.ok(pages.indexOf('Keep the meaning. Change the layout to fit the device.') !== -1, 'missing device choice');
  assert.ok(pages.indexOf('Keep prepare and approve.') !== -1, 'missing corporate choice');
  assert.ok(pages.indexOf('Ruled out: bury under Payments, or select-all with no line of sight.') !== -1, 'missing approvals ruled-out');
  assert.ok(pages.indexOf('Ruled out: one question per screen.') !== -1, 'missing permissions ruled-out');
  assert.ok(css.indexOf('.film-decision') !== -1, 'missing Decision chip css');
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
  assert.ok(depth > 0, 'reduced-motion closed before kill-transform');
});

check('Aisha redesign bar is the Echo 8-beat lock', function () {
  assert.ok(bar.indexOf('infoviz-cs5764.web.app') !== -1, 'bar missing Infoviz lock');
  assert.ok(bar.indexOf('8-beat') !== -1 || bar.indexOf('eight-beat') !== -1, 'bar missing 8-beat map');
  assert.ok(/no invented research/i.test(bar), 'bar missing no-invented-research lock');
  assert.ok(/opacity-only = fail/i.test(bar), 'bar missing opacity-only fail');
  assert.ok(bar.indexOf('header-only') !== -1 || bar.indexOf('header elements') !== -1, 'bar missing Multiverse header-only glitch');
  assert.ok(bar.indexOf('NEVER fade') !== -1, 'bar missing prepare/approve no-fade lock');
  assert.ok(source.indexOf('Banking that grows with the business.') !== -1, 'source HTML missing hook');
  assert.ok(source.indexOf('representative example') !== -1, 'source HTML missing Aisha disclaimer');
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
  assert.ok(kit.indexOf('layoutViewport') !== -1, 'kit must read layoutViewport / visualViewport');
  assert.ok(css.indexOf('--vvh') !== -1, 'film css missing --vvh');
  assert.ok(viewport.indexOf('visualViewport') !== -1, 'viewport.js missing visualViewport');
  assert.ok(viewport.indexOf('screen.width') === -1 || viewport.indexOf('never device screen') !== -1, 'viewport lock comment ok');
  assert.ok(!/\bscreen\.(width|height|availWidth|availHeight)\b/.test(kit), 'kit must not use screen.*');
  assert.ok(!/\bscreen\.(width|height|availWidth|availHeight)\b/.test(study), 'study must not use screen.*');
  var landingCss = read('assets/css/landing.css');
  assert.ok(/html\.is-study \.study[\s\S]{0,220}overflow-x:\s*hidden/.test(landingCss), 'study must overflow-x hidden, not clip');
});

check('Multiverse glitch is header-only', function () {
  assert.ok(css.indexOf('html:not(.is-multiverse) .study[data-template="cbx300"] .glitch') !== -1, 'cream must kill all case glitch');
  assert.ok(css.indexOf('html.is-multiverse .study[data-template="cbx300"] .film-world .glitch') !== -1, 'multiverse must kill film-body glitch only');
  assert.ok(study.indexOf('armGlitchTarget') !== -1, 'multiverse study mark must still arm hitch');
});

check('Iris 3D stills sit on growth beats 1–4', function () {
  var pngs = [
    'assets/img/aisha-growth/01-freelancer.png',
    'assets/img/aisha-growth/02-sole-prop.png',
    'assets/img/aisha-growth/03-small-company.png',
    'assets/img/aisha-growth/04-midsize.png'
  ];
  var webps = [
    'assets/img/cbx300/aisha-stage-01-freelancer.webp',
    'assets/img/cbx300/aisha-stage-02-soleprop.webp',
    'assets/img/cbx300/aisha-stage-03-team10.webp',
    'assets/img/cbx300/aisha-stage-04-midsize.webp'
  ];
  pngs.forEach(function (rel) {
    assert.ok(pages.indexOf(rel) !== -1, 'case js missing still ' + rel);
    var abs = path.join(ROOT, rel);
    assert.ok(fs.existsSync(abs), 'missing binary ' + rel);
    var buf = fs.readFileSync(abs);
    assert.ok(buf.length > 8000, rel + ' too small');
    assert.ok(buf.slice(0, 8).toString('hex') === '89504e470d0a1a0a', rel + ' is not a PNG');
  });
  webps.forEach(function (rel) {
    var abs = path.join(ROOT, rel);
    assert.ok(fs.existsSync(abs), 'missing mirrored slot ' + rel);
    var buf = fs.readFileSync(abs);
    assert.ok(buf.slice(0, 4).toString() === 'RIFF', rel + ' is not a WebP (RIFF)');
    assert.ok(buf.slice(8, 12).toString() === 'WEBP', rel + ' is not a WebP (WEBP)');
  });
  assert.ok(kit.indexOf('function bindIrisStill') !== -1, 'kit missing still ken-burns');
  assert.ok(css.indexOf('.film-iris') !== -1, 'css missing iris still stage');
  assert.ok(pages.indexOf('Iris drop-in') !== -1, 'missing Iris drop-in placeholder label');
  assert.ok(pages.indexOf('withIris') !== -1, 'beats 1–4 not wrapped with withIris');
});

check('export path reserved for leftover Figma slots', function () {
  assert.ok(fs.existsSync(path.join(ROOT, 'assets/img/cbx300')), 'missing assets/img/cbx300 folder');
  assert.ok(pages.indexOf('designed placeholders') !== -1, 'missing placeholder lock comment');
});

console.log(passed + ' passed, ' + failed + ' failed');
if (failed) process.exit(1);
