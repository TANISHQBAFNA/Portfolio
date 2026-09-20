#!/usr/bin/env node
'use strict';

/**
 * Guards CBX300 Section 01 cover + Section 02 Aisha growth track.
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
var mvLanding = read('assets/js/landing-multiverse.js');
var rail = read('assets/js/project-rail.js');
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
  assert.ok(index.indexOf('cbx300-case.css?v=s42') !== -1, 'index.html missing growth cache-bust');
  assert.ok(mvIndex.indexOf('cbx300-case.js?v=s22') !== -1, 'multiverse missing growth cache-bust');
  assert.ok(index.indexOf('project-study.js?v=s42') !== -1, 'index.html missing study cache-bust');
  assert.ok(index.indexOf('project-rail.js?v=hz99') !== -1, 'index.html missing rail cache-bust');
  assert.ok(mvIndex.indexOf('project-rail.js?v=hz99') !== -1, 'multiverse missing rail cache-bust');
});

check('Section 01 copy matches CEO lock', function () {
  assert.ok(pages.indexOf('Case study · CBX300') === -1, 'Case study · CBX300 must be gone');
  assert.ok(pages.indexOf("kicker: 'Banking that'") !== -1, 'missing Banking that kicker');
  assert.ok(pages.indexOf("accent: 'Grows with'") !== -1, 'missing Grows with accent');
  assert.ok(pages.indexOf("word: 'the Business'") !== -1, 'missing the Business word');
  assert.ok(pages.indexOf('hero__support') === -1, 'duplicate support line must be dropped');
  assert.ok(pages.indexOf('hero__role') === -1, 'hero__role must be gone');
});

check('image sits in the project work-card frame', function () {
  var coverFn = pages.slice(pages.indexOf('function buildCover'), pages.indexOf('function cutout'));
  var appendType = coverFn.indexOf('inner.appendChild(type)');
  var appendMedia = coverFn.indexOf('inner.appendChild(media)');
  assert.ok(appendType !== -1 && appendMedia !== -1 && appendType < appendMedia, 'type first, media on top');
  assert.ok(coverFn.indexOf("work-card cbx-cover__media") !== -1, 'cover media must reuse .work-card');
  assert.ok(coverFn.indexOf('work-card__media') !== -1, 'cover must use work-card inner media');
  assert.ok(coverFn.indexOf('work-card__img') !== -1, 'cover must use the work-card image');
  assert.ok(pages.indexOf('cin-work-sme.png') !== -1, 'cover must point at the SME work image');
  assert.ok(css.indexOf('.cbx-cover__media.work-card') !== -1, 'cover media must leave the type flow');
  assert.ok(/right:\s*0/.test(css), 'media must sit on the right');
  assert.ok(/top:\s*0/.test(css), 'media must sit in the top-right corner');
  assert.ok(/justify-content:\s*flex-end/.test(css), 'type stack must sit bottom-left');
  assert.ok(css.indexOf('border-radius: 22px') !== -1, 'cream cover must use the work-card 22px tile');
  assert.ok(css.indexOf('border-radius: 14px') !== -1, 'cream cover must use the work-card 14px inner crop');
  var coverCss = css.slice(0, css.indexOf('.cbx-growth'));
  assert.ok(coverCss.indexOf('dashed') === -1, 'dashed placeholder must stay off the cover');
  assert.ok(css.indexOf('z-index: 2') !== -1, 'media must paint over type');
});

check('cover type is still a large home-parity shout', function () {
  assert.ok(css.indexOf('--cbx-shout:') !== -1, 'missing cover shout token');
  assert.ok(/8\.4vw/.test(css), 'cover shout must stay large');
  var homeShout = landingCss.indexOf('--shout: 8vw');
  assert.ok(homeShout !== -1, 'home shout baseline missing');
});

check('Section 02 is Aisha growth, not the old 8-beat film', function () {
  assert.ok(pages.indexOf("data-cbx-growth") !== -1, 'missing growth track');
  assert.ok(pages.indexOf("var BEATS") !== -1, 'missing BEATS morph model');
  assert.ok(pages.indexOf("var PEOPLE") !== -1, 'missing PEOPLE cast layers');
  assert.ok(pages.indexOf("id: 'freelancer'") !== -1, 'missing freelancer beat');
  assert.ok(pages.indexOf("id: 'sole'") !== -1, 'missing sole beat');
  assert.ok(pages.indexOf("id: 'mid'") !== -1, 'missing mid-size beat');
  assert.ok(pages.indexOf("id: 'ten'") === -1, '~10 people stage must be removed');
  assert.ok(pages.indexOf('data-cbx-growth-track') === -1, 'horizontal track must be gone');
  assert.ok(pages.indexOf('travelX') === -1, 'horizontal travel helper must be gone');
  assert.ok(pages.indexOf("x: function") === -1, 'no sideways scrub');
  assert.ok(pages.indexOf('people/aisha.png') !== -1, 'missing Aisha person layer');
  assert.ok(pages.indexOf('people/teammate-01.png') !== -1, 'missing first teammate layer');
  assert.ok(pages.indexOf('cbx-growth__cast') !== -1, 'missing cast well markup');
  assert.ok(pages.indexOf('data-film-beat') === -1, 'film beats leaked');
  assert.ok(pages.indexOf('film-decision') === -1, 'Decision chips leaked');
  assert.ok(pages.indexOf('maker-checker') === -1, 'maker-checker leaked');
  assert.ok(study.indexOf('CaseScrollKit.bind') === -1, 'cbx300 still binds film scroll kit');
  assert.ok(study.indexOf('Cbx300Case.bind') !== -1, 'study must bind growth ScrollTrigger after intro');
  assert.ok(pages.indexOf('pin: true') !== -1, 'growth must pin');
  assert.ok(pages.indexOf('pinSpacing: true') !== -1, 'pinSpacing must unlock later stubs');
  assert.ok(pages.indexOf('visualViewport') !== -1, 'pane height must use visualViewport');
  assert.ok(pages.indexOf('ignoreMobileResize') !== -1, 'iOS URL-bar must not rebuild the pin');
  assert.ok(pages.indexOf('THREE') === -1 && pages.indexOf('three.js') === -1, 'Three.js is off-limits');
});

check('later sections stay stubs after growth', function () {
  assert.ok(pages.indexOf('rest.hidden = true') !== -1, 'stubs must stay hidden');
  ['roles', 'approvals', 'money', 'permissions', 'grammar', 'scale'].forEach(function (id) {
    assert.ok(pages.indexOf("id: '" + id + "'") !== -1, 'missing stub id ' + id);
  });
  assert.ok(pages.indexOf("id: 'ladder'") === -1, 'ladder stub must be the live growth track');
  assert.ok(pages.indexOf("data-cbx-section', '01'") !== -1, 'cover is 01');
  assert.ok(pages.indexOf("data-cbx-section', '02'") !== -1, 'growth is 02');
});

check('Section 02 growth field is coffee; cover stays cream', function () {
  var coverCss = css.slice(0, css.indexOf('.cbx-growth {'));
  var growthCss = css.slice(css.indexOf('.cbx-growth {'));
  assert.ok(coverCss.indexOf('background: var(--film-cream)') !== -1, 'cover world must stay cream');
  assert.ok(growthCss.indexOf('background: var(--coffee, #1E1510)') !== -1, 'growth pane must be coffee #1E1510');
  assert.ok(growthCss.indexOf('html.is-light-home .study[data-template="cbx300"] .cbx-growth') !== -1, 'cream home growth must stay coffee');
  var wellCss = css.slice(css.indexOf('.cbx-growth__well {'), css.indexOf('.cbx-growth__cast {'));
  assert.ok(wellCss.indexOf('background: transparent') !== -1, 'cast well must not be a boxed plate');
  assert.ok(wellCss.indexOf('border-radius: 0') !== -1, 'well must drop the rounded plate');
  assert.ok(wellCss.indexOf('box-shadow: none') !== -1, 'well must drop the inset plate ring');
  assert.ok(wellCss.indexOf('overflow: visible') !== -1, 'well must not clip the cast');
  assert.ok(wellCss.indexOf('#2a211c') === -1, 'coffee plate fill must be gone');
  var castCss = css.slice(css.indexOf('.cbx-growth__cast {'), css.indexOf('.cbx-growth__person {'));
  assert.ok(castCss.indexOf('position: relative') !== -1, 'cast must sit in flow on the coffee field');
  assert.ok(castCss.indexOf('position: absolute') === -1, 'cast must not be an inset plate');
  assert.ok(css.indexOf('html.is-multiverse .study[data-template="cbx300"] .cbx-growth__well') !== -1, 'missing Multiverse well');
  var mvWell = css.slice(
    css.indexOf('html.is-multiverse .study[data-template="cbx300"] .cbx-growth__well'),
    css.indexOf('html.is-cream-home .study[data-template="cbx300"] .cbx-growth')
  );
  assert.ok(mvWell.indexOf('background: transparent') !== -1, 'Multiverse well must not be a boxed plate');
  assert.ok(landingCss.indexOf('--projects-panel: var(--coffee)') !== -1, 'growth must match landing projects rail coffee');
});

check('cream stays calm; Multiverse glitches cover + chrome', function () {
  assert.ok(pages.indexOf("glitch ? className + ' glitch'") !== -1, 'Multiverse cover must add glitch class');
  assert.ok(pages.indexOf("setAttribute('data-text'") !== -1, 'glitch plates need data-text');
  assert.ok(pages.indexOf('armGlitchTarget') !== -1, 'must arm IrisMotion glitch targets');
  assert.ok(pages.indexOf('.study__word') !== -1, 'study chrome word must glitch on Multiverse');
  assert.ok(pages.indexOf("chrome: false") !== -1, 'mount must not glitch chrome before page count is set');
  assert.ok(pages.indexOf('node.children') !== -1, 'must not letter-swap nested chrome count');
  assert.ok(pages.indexOf("classList.add('glitch')") !== -1, 'chrome must get glitch class even if IrisMotion is late');
  assert.ok(study.indexOf('Cbx300Case.armGlitch') !== -1 && study.indexOf('setTotal(caseMount') !== -1, 'open must arm chrome after setTotal');
  assert.ok(css.indexOf('html.is-light-home .cbx-cover .glitch::before') !== -1, 'cream must kill cover glitch plates');
  assert.ok(!/@keyframes\s+.*glitch/i.test(css), 'do not fork glitch keyframes in cover css');
  assert.ok(mvCss.indexOf('html.is-multiverse .glitch.is-glitching') !== -1, 'Multiverse sheet missing glitch burst');
});

check('Multiverse study uses ink/glitch blue, not cream paper', function () {
  assert.ok(css.indexOf('html.is-multiverse .study[data-template="cbx300"]') !== -1, 'missing Multiverse study skin');
  assert.ok(css.indexOf('#0e1018') !== -1, 'missing Multiverse ink');
  assert.ok(css.indexOf('#3de8f5') !== -1, 'missing Multiverse cyan');
  assert.ok(css.indexOf('-webkit-text-fill-color: #f3eee4') !== -1, 'Multiverse cover kicker/word must beat home print fill');
  assert.ok(css.indexOf('html.is-light-home.is-dark .study[data-template="cbx300"]') !== -1, 'cream dark must not steal Multiverse ink');
});

check('cream and Multiverse share one cover + growth layout', function () {
  assert.ok(index.indexOf('data-world="cbx300"') !== -1, 'cream index missing world');
  assert.ok(mvIndex.indexOf('data-world="cbx300"') !== -1, 'multiverse missing world');
  assert.ok(css.indexOf('html.is-multiverse .cbx-cover .hero__word') !== -1, 'multiverse must reuse cover type');
  assert.ok(css.indexOf('.cbx-growth__frame') !== -1, 'missing growth frame css');
  assert.ok(css.indexOf('.cbx-growth.is-static') !== -1, 'reduced-motion must show full cast');
});

check('study page scroll unlocks; coffee panel curtains over parked chrome', function () {
  assert.ok(css.indexOf('html.is-study-page') !== -1, 'missing window-scroll page css');
  assert.ok(index.indexOf('data-study-close') !== -1, 'index missing close control');
  assert.ok(mvIndex.indexOf('data-study-close') !== -1, 'multiverse missing close control');
  var chromeSel = 'html.is-study.is-study-page .study[data-template="cbx300"] .study__chrome';
  var chromeAt = css.indexOf(chromeSel);
  assert.ok(chromeAt !== -1, 'missing CBX chrome selector');
  var chromeRule = css.slice(chromeAt, chromeAt + 420);
  assert.ok(/position:\s*fixed\s*!important/.test(chromeRule), 'chrome stays parked on the cover');
  assert.ok(/z-index:\s*21/.test(chromeRule), 'chrome stays under the coffee panel');
  assert.ok(css.indexOf('.study__chrome.is-away') === -1, 'chrome must not fade away as the growth entry');
  assert.ok(pages.indexOf('function linkChromeToCover') === -1, 'cover chrome scrub must be gone');
  assert.ok(pages.indexOf("end: 'bottom top'") === -1, 'chrome must not scrub out as cover leaves');
  assert.ok(pages.indexOf('function applyCbxRise') !== -1, 'missing landing-style rise handle');
  assert.ok(pages.indexOf('--cbx-rise') !== -1, 'missing --cbx-rise write');
  assert.ok(pages.indexOf('is-cbx-growth-in') !== -1, 'missing growth-in class');
  assert.ok(css.indexOf('--cbx-rise') !== -1, 'missing --cbx-rise transform');
  assert.ok(css.indexOf('z-index: 40') !== -1, 'growth must sit above cover/header like the landing rail');
  assert.ok(pages.indexOf("clearProps: 'opacity,visibility,pointerEvents,transform,y'") !== -1, 'close must restore chrome');
  assert.ok(pages.indexOf("start: 'top top'") !== -1, 'cover stage must pin at the window top');
  assert.ok(pages.indexOf('data-cbx-stage') !== -1, 'missing parked cover stage');
  assert.ok(pages.indexOf('RISE_DUR') !== -1, 'curtain must occupy its own scrub span before morph');
  assert.ok(css.indexOf('html.is-cbx-growth-in') !== -1, 'missing growth-in pointer-events');
});

check('no invented NPS/outcomes; Echo avoid-list stays off the page', function () {
  assert.ok(!/\bNPS\b/.test(pages), 'invented NPS');
  assert.ok(!/maker-checker/i.test(pages), 'maker-checker on page');
  assert.ok(!/\bseamless\b/i.test(pages), 'seamless on page');
  assert.ok(!/\bentitlements\b/i.test(pages), 'entitlements on page');
  assert.ok(!/\bintuitive\b/i.test(pages), 'intuitive on page');
});

check('light proof: Echo LIGHT pack verbatim on the three beats', function () {
  assert.ok(pages.indexOf('cbx-growth__stamp') !== -1, 'missing decision stamp markup');
  assert.ok(pages.indexOf('cbx-growth__need') !== -1, 'missing need line');
  assert.ok(pages.indexOf('cbx-growth__fact') !== -1, 'missing fact line');
  assert.ok(pages.indexOf('data-cbx-ghost') !== -1, 'missing UI ghost');
  assert.ok(pages.indexOf('Same bank. Grows with her.') !== -1, 'missing spine chip');
  assert.ok(pages.indexOf('One person does everything') !== -1, 'freelancer stamp finding');
  assert.ok(pages.indexOf('Phone-complete basics') !== -1, 'freelancer stamp choice');
  assert.ok(pages.indexOf('Pay / get paid') !== -1, 'freelancer stamp UI');
  assert.ok(pages.indexOf('“Did I get paid? Can I pay?”') !== -1, 'freelancer need');
  assert.ok(pages.indexOf('Phone shows pay and cash') !== -1, 'freelancer fact');
  assert.ok(pages.indexOf('Pay · Get paid') !== -1, 'freelancer ghost label');
  assert.ok(pages.indexOf('One balance number lies') !== -1, 'sole stamp finding');
  assert.ok(pages.indexOf('Available leads; handoff safe') !== -1, 'sole stamp choice');
  assert.ok(pages.indexOf('Four balances + beneficiary') !== -1, 'sole stamp UI');
  assert.ok(pages.indexOf('“How much can I safely spend?”') !== -1, 'sole need');
  assert.ok(pages.indexOf('Available is largest; helper appears') !== -1, 'sole fact');
  assert.ok(pages.indexOf('Available · Add beneficiary') !== -1, 'sole ghost label');
  assert.ok(pages.indexOf('Approving is the job') !== -1, 'mid stamp finding');
  assert.ok(pages.indexOf('Own door; rows stay visible') !== -1, 'mid stamp choice');
  assert.ok(pages.indexOf('Approvals + who can act') !== -1, 'mid stamp UI');
  assert.ok(pages.indexOf('“Who’s waiting on me?”') !== -1, 'mid need');
  assert.ok(pages.indexOf('Queue and limits show up') !== -1, 'mid fact');
  assert.ok(pages.indexOf('Approvals · Permissions') !== -1, 'mid ghost label');
  assert.ok(pages.indexOf('Did that invoice land') === -1, 'old freelancer need leaked');
  assert.ok(pages.indexOf('Solo cash is easy to lose') === -1, 'old freelancer stamp leaked');
  assert.ok(pages.indexOf('Who still owes me a yes') === -1, 'old mid need leaked');
  assert.ok(css.indexOf('opacity: 0.26') !== -1, 'ghost must stay a light 20–30% pass');
  assert.ok(css.indexOf('.cbx-growth__chip') !== -1, 'stamp chips missing');
  assert.ok(css.indexOf('.cbx-growth__spine') !== -1, 'spine chip css missing');
  assert.ok(css.indexOf('.cbx-ghost--phone') !== -1, 'phone ghost missing');
  assert.ok(css.indexOf('.cbx-ghost--desktop') !== -1, 'desktop ghost missing');
  assert.ok(pages.indexOf('travelX') === -1, 'proof pass must not bring back sideways travel');
  assert.ok(pages.indexOf('film-decision') === -1, 'old film decision chips must stay gone');
});

check('rail wheel yields to open study so CBX300 window-scroll can pin-scrub', function () {
  var start = rail.indexOf('function onWheel');
  var end = rail.indexOf('/* ── input: keyboard');
  assert.ok(start !== -1 && end > start, 'onWheel missing');
  var onWheel = rail.slice(start, end);
  var studyGuard = onWheel.indexOf("classList.contains('is-study')");
  var pageGuard = onWheel.indexOf("classList.contains('is-study-page')");
  var prevent = onWheel.indexOf('event.preventDefault');
  assert.ok(studyGuard !== -1, 'onWheel must early-return when html.is-study');
  assert.ok(pageGuard !== -1, 'onWheel must early-return when html.is-study-page');
  assert.ok(prevent !== -1, 'onWheel still preventDefaults rail gestures');
  assert.ok(studyGuard < prevent, 'is-study guard must run before preventDefault');
  assert.ok(pageGuard < prevent, 'is-study-page guard must run before preventDefault');
  assert.ok(onWheel.indexOf('rail.lock') === -1, 'do not lock the rail from onWheel');
  assert.ok(index.indexOf('project-rail.js?v=hz99') !== -1, 'index.html must bump rail cache');
  assert.ok(mvIndex.indexOf('project-rail.js?v=hz99') !== -1, 'index-multiverse.html must bump rail cache');
});

check('landing idle wheel does not steal study scroll', function () {
  var creamReset = landing.slice(landing.indexOf("['pointerdown'"));
  creamReset = creamReset.slice(0, creamReset.indexOf('armReset();') + 12);
  assert.ok(creamReset.indexOf("'wheel'") !== -1, 'cream idle reset listens to wheel');
  assert.ok(creamReset.indexOf('passive: true') !== -1, 'cream idle wheel must stay passive');
  assert.ok(creamReset.indexOf('preventDefault') === -1, 'cream idle wheel must not preventDefault');
  var mvReset = mvLanding.slice(mvLanding.indexOf("['pointerdown'"));
  mvReset = mvReset.slice(0, mvReset.indexOf('armReset();') + 12);
  assert.ok(mvReset.indexOf("'wheel'") !== -1, 'multiverse idle reset listens to wheel');
  assert.ok(mvReset.indexOf('passive: true') !== -1, 'multiverse idle wheel must stay passive');
  assert.ok(mvReset.indexOf('preventDefault') === -1, 'multiverse idle wheel must not preventDefault');
  assert.ok(landing.indexOf('onOpen') !== -1 && /onOpen:[\s\S]{0,400}rail\.lock\(/.test(landing) === false,
    'cream study onOpen must not rail.lock (ArrowDown would steal CBX300 window scroll)');
  assert.ok(mvLanding.indexOf('onOpen') !== -1 && /onOpen:[\s\S]{0,400}rail\.lock\(/.test(mvLanding) === false,
    'multiverse study onOpen must not rail.lock');
});

console.log(passed + ' passed, ' + failed + ' failed');
if (failed) process.exit(1);
