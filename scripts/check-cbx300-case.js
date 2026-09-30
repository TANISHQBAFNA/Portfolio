#!/usr/bin/env node
'use strict';

/**
 * Guards CBX300 Section 01 cover + Section 02 D2 worry board +
 * Section 03 camera-into-the-screen. Same markup for cream +
 * Multiverse. Glitch only on Multiverse.
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
var answers = read('assets/js/cbx300-answers.js');
var study = read('assets/js/project-study.js');
var landing = read('assets/js/landing.js');
var mvLanding = read('assets/js/landing-multiverse.js');
var rail = read('assets/js/project-rail.js');
var css = read('assets/css/cbx300-case.css');
var mvCase = read('assets/css/cbx300-case-multiverse.css');
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
  assert.ok(index.indexOf('cbx300-case.css?v=s98') !== -1, 'index.html missing growth cache-bust');
  assert.ok(index.indexOf('cbx300-case.js?v=s86') !== -1, 'index.html missing growth js cache-bust');
  assert.ok(index.indexOf('cbx300-answers.js?v=s16') !== -1, 'index.html missing answers module');
  assert.ok(index.indexOf('cbx300-case-multiverse.css') === -1, 'cream page must not load the Multiverse case skin');
  assert.ok(mvIndex.indexOf('cbx300-case.css?v=s98') !== -1, 'multiverse missing growth css cache-bust');
  assert.ok(mvIndex.indexOf('cbx300-case.js?v=s86') !== -1, 'multiverse missing growth cache-bust');
  assert.ok(mvIndex.indexOf('cbx300-answers.js?v=s16') !== -1, 'multiverse missing answers module');
  assert.ok(mvIndex.indexOf('cbx300-case-multiverse.css?v=mv10') !== -1, 'multiverse missing case skin');
  assert.ok(index.indexOf('project-study.js?v=s46') !== -1, 'index.html missing study cache-bust');
  assert.ok(mvIndex.indexOf('project-study.js?v=s46') !== -1, 'multiverse missing study cache-bust');
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
  var coverFn = pages.slice(pages.indexOf('function buildCover'), pages.indexOf('function beatCopy'));
  var appendType = coverFn.indexOf('inner.appendChild(type)');
  var appendMedia = coverFn.indexOf('inner.appendChild(media)');
  assert.ok(appendType !== -1 && appendMedia !== -1 && appendMedia < appendType, 'media first, type on top');
  assert.ok(coverFn.indexOf("work-card cbx-cover__media") !== -1, 'cover media must reuse .work-card');
  assert.ok(coverFn.indexOf('work-card__media') !== -1, 'cover must use work-card inner media');
  assert.ok(coverFn.indexOf('work-card__img') !== -1, 'cover must use the work-card image');
  assert.ok(pages.indexOf('cin-work-sme.png') !== -1, 'cover must point at the SME work image');
  assert.ok(css.indexOf('.cbx-cover__media.work-card') !== -1, 'cover media must leave the type flow');
  assert.ok(/right:\s*0/.test(css), 'media must sit on the right');
  assert.ok(/top:\s*0/.test(css), 'media must sit in the top-right corner');
  assert.ok(/justify-content:\s*flex-end/.test(css), 'type stack must sit bottom-left');
  assert.ok(css.indexOf('border-radius: var(--work-frame-radius)') !== -1, 'cover must use the shared frame radius token');
  assert.ok(css.indexOf('border-radius: var(--work-frame-media-radius)') !== -1, 'cover must use the shared inner radius token');
  assert.ok(css.indexOf('border-radius: 22px') === -1, 'cover must not hardcode the 22px tile');
  assert.ok(css.indexOf('border-radius: 14px') === -1, 'cover must not hardcode the 14px crop');
  var coverCss = css.slice(0, css.indexOf('.cbx-growth'));
  assert.ok(coverCss.indexOf('dashed') === -1, 'dashed placeholder must stay off the cover');
  var typeRule = coverCss.slice(coverCss.indexOf('.cbx-cover .cbx-cover__type'), coverCss.indexOf('.cbx-cover .hero__heading'));
  var mediaRule = coverCss.slice(coverCss.indexOf('.cbx-cover__media.work-card'), coverCss.indexOf('.cbx-cover__media .work-card__media'));
  assert.ok(/z-index:\s*3/.test(typeRule), 'type must paint over the project image');
  assert.ok(/pointer-events:\s*auto/.test(typeRule), 'cover type must stay clickable');
  assert.ok(/z-index:\s*1/.test(mediaRule), 'media must sit behind type');
  assert.ok(!/z-index:\s*2/.test(mediaRule), 'media must not paint over type');
  assert.ok(/pointer-events:\s*none/.test(mediaRule), 'cover media must not steal clicks');
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
  assert.ok(pages.indexOf("id: 'freelancer'") !== -1, 'missing freelancer beat');
  assert.ok(pages.indexOf("id: 'sole'") !== -1, 'missing sole beat');
  assert.ok(pages.indexOf("id: 'mid'") !== -1, 'missing mid-size beat');
  assert.ok(pages.indexOf("id: 'ten'") === -1, '~10 people stage must be removed');
  assert.ok(pages.indexOf('data-cbx-growth-track') === -1, 'horizontal track must be gone');
  assert.ok(pages.indexOf('travelX') === -1, 'horizontal travel helper must be gone');
  assert.ok(pages.indexOf("x: function") === -1, 'no sideways scrub');
  assert.ok(pages.indexOf('illo-d2-1.svg') !== -1, 'missing freelancer illustration');
  assert.ok(pages.indexOf('illo-d2-2.svg') !== -1, 'missing shop-of-two illustration');
  assert.ok(pages.indexOf('illo-d2-3.svg') !== -1, 'missing mid-size illustration');
  assert.ok(pages.indexOf('people/aisha.png') === -1, 'clay Aisha plate must be gone');
  assert.ok(pages.indexOf('people/teammate-01.png') === -1, 'clay teammate plate must be gone');
  assert.ok(pages.indexOf('cbx-growth__cast') === -1, 'clay cast well must be gone');
  assert.ok(pages.indexOf('data-cbx-board') !== -1, 'missing story-board hook');
  assert.ok(pages.indexOf('data-cbx-rail') !== -1, 'missing glanceable stage rail');
  assert.ok(pages.indexOf('data-cbx-pic') !== -1, 'missing illustration panel');
  assert.ok(pages.indexOf('data-cbx-illo') !== -1, 'missing per-stage illustration slot');
  assert.ok(pages.indexOf('data-cbx-plate') === -1, 'supporting clay plate hook must be gone');
  assert.ok(pages.indexOf('data-cbx-strip') === -1, 'full-bleed portrait-strip hook must be gone');
  assert.ok(pages.indexOf('data-cbx-third') === -1, 'cinematic lower-third hook must be gone');
  assert.ok(pages.indexOf('cbx-growth__third') === -1, 'lower-third markup must be gone');
  assert.ok(pages.indexOf('data-cbx-meet') === -1, 'Meet Aisha stage hook must be gone');
  assert.ok(pages.indexOf('data-cbx-montage') === -1, 'desk/meet montage hook must be gone');
  assert.ok(pages.indexOf('cbx-growth__desk') === -1, 'desk surface must be gone');
  assert.ok(pages.indexOf('cbx-growth__device') === -1, 'product chip must be gone');
  assert.ok(pages.indexOf('data-cbx-chip') === -1, 'tiny product chip hook must be gone');
  assert.ok(pages.indexOf('cbx-growth__prop') === -1, 'desk props must be gone');
  assert.ok(pages.indexOf('data-cbx-desk') === -1, 'desk montage hook must be gone');
  assert.ok(pages.indexOf('cbx-growth__frame') === -1, 'old two-column frame markup must be gone');
  assert.ok(pages.indexOf('cbx-growth__copy') === -1, 'old left copy column must be gone');
  assert.ok(pages.indexOf('data-cbx-ghost') === -1, 'floating ghost UI must be gone');
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

check('later sections stay stubs after answers', function () {
  assert.ok(pages.indexOf('rest.hidden = true') !== -1, 'stubs must stay hidden');
  ['approvals', 'money', 'permissions', 'grammar', 'scale'].forEach(function (id) {
    assert.ok(pages.indexOf("id: '" + id + "'") !== -1, 'missing stub id ' + id);
  });
  assert.ok(pages.indexOf("id: 'roles'") === -1, '03 roles stub must be the live answers section');
  assert.ok(pages.indexOf("id: 'ladder'") === -1, 'ladder stub must be the live growth track');
  assert.ok(pages.indexOf("data-cbx-section', '01'") !== -1, 'cover is 01');
  assert.ok(pages.indexOf("data-cbx-section', '02'") !== -1, 'growth is 02');
  assert.ok(answers.indexOf("data-cbx-section', '03'") !== -1, 'answers is 03');
});

check('Section 03 camera into the screen, phone-hero then both', function () {
  assert.ok(pages.indexOf('Cbx300Answers.build') !== -1, 'case must mount answers');
  assert.ok(pages.indexOf('Cbx300Answers.bind') !== -1, 'case must bind answers');
  assert.ok(pages.indexOf('Cbx300Answers.kill') !== -1, 'case must kill answers');
  assert.ok(pages.indexOf('releaseGrowth') !== -1, 'coffee pane must release into flow for 03');
  assert.ok(pages.indexOf('is-after') !== -1, 'missing coffee is-after handoff');
  assert.ok(answers.indexOf("hero: 'phone'") !== -1, 'Ch1/Ch2 must hero the phone');
  assert.ok(answers.indexOf("hero: 'both'") !== -1, 'Ch3 must share phone and desktop');
  assert.ok(answers.indexOf("phone: '[data-ans-device=\"phone\"]', desk: null") !== -1, 'Ch1/Ch2 must zoom the phone device');
  assert.ok(/\.cbx-ans__pd \{[\s\S]{0,140}font-size: 17px/.test(css), 'does line must be 17px on the 1440 stage');
  assert.ok(/\.cbx-ans__pg \{[\s\S]{0,180}font-size: 17px/.test(css), 'outcome line must be 17px on the 1440 stage');
  assert.ok(answers.indexOf("device: 'phone'") !== -1, 'some pointers land on the phone');
  assert.ok(answers.indexOf("device: 'desk'") !== -1, 'Ch3 pointers 1/3/4 land on desktop');
  assert.ok(answers.indexOf('out meeting a client.') !== -1, 'Ch3 pointer 2 copy missing');
  assert.ok(answers.indexOf("t: '[data-ans-t=\"approve\"]'") !== -1, 'one-tap approve target missing');
  assert.ok(answers.indexOf('data-slot') !== -1, 'device slots missing');
  assert.ok(answers.indexOf('phoneShot') !== -1, 'phone screenshot swap hook missing');
  assert.ok(answers.indexOf('deskShot') !== -1, 'desktop screenshot swap hook missing');
  assert.ok(answers.indexOf('Example UI · real screens to come') !== -1, 'example UI tag missing');
  assert.ok(answers.indexOf('Example copy') !== -1, 'example copy tag missing');
  assert.ok(answers.indexOf('₹ ——') !== -1, 'amounts must stay blank');
  assert.ok(answers.indexOf('Payment received') !== -1, 'Ch1 payment alert missing');
  assert.ok(answers.indexOf('Payday') !== -1, 'Ch2 payday chip missing');
  assert.ok(answers.indexOf('PX_PER_SEC') !== -1, 'prototype timing missing');
  assert.ok(answers.indexOf('var ZOOM = 2.1') !== -1, 'zoom duration must match prototype');
  assert.ok(answers.indexOf('var HOLD = 5.3') !== -1, 'hold duration must match prototype');
  assert.ok(answers.indexOf('prefers-reduced-motion') !== -1, 'reduced motion path missing');
  assert.ok(css.indexOf('.cbx-ans__scene.is-phone .cbx-phone') !== -1, 'phone-hero layering missing');
  assert.ok(css.indexOf('.cbx-ans__scene.is-phone .cbx-desk') !== -1, 'dimmed desktop slot missing');
  assert.ok(css.indexOf('.cbx-ans__scene.is-both .cbx-phone') !== -1, 'Ch3 phone slot missing');
  assert.ok(css.indexOf('.cbx-phone__bezel') !== -1, 'phone cream/coffee bezel missing');
  assert.ok(css.indexOf('.cbx-ans.is-narrow') !== -1, '390px stack missing');
  assert.ok(css.indexOf('.cbx-ans {') !== -1 && css.indexOf('z-index: 12') !== -1, 'answers pane must pin above the released coffee sheet');
  assert.ok(css.indexOf('is-cbx-ans-pin') !== -1, 'Close must raise above the pinned answers stage');
  assert.ok(css.indexOf('html.is-study.is-study-page.is-cbx-ans-pin') !== -1, 'Close z-index must beat the parked chrome rule');
  assert.ok(css.indexOf('overscroll-behavior: auto !important') !== -1, 'study body must not trap wheel overscroll');
  assert.ok(/\.cbx-ph__body \{[\s\S]{0,80}height: auto;/.test(css), 'phone body must hug the invoice card');
  assert.ok(css.indexOf('.cbx-ans__pd b { color: #1E1510; }') !== -1, '390 pointer <b> must stay ink on cream');
  assert.ok(css.indexOf('1440px') !== -1 && css.indexOf('--ans-scale') !== -1, 'desktop must use a uniformly scaled 1440 stage');
  assert.ok(css.indexOf('font-size: 26px') !== -1, 'pointer worry must be 26px Newsreader on the stage');
  assert.ok(css.indexOf('font-size: 44px') !== -1, 'chapter title must be 44px Newsreader on the stage');
  assert.ok(css.indexOf('text-overflow: ellipsis') === -1, 'client names must not ellipsize');
  assert.ok(answers.indexOf('var SCRUB = 0.8') !== -1, 'timeline scrub must be 0.6–1');
  assert.ok(answers.indexOf('BACK') !== -1 && answers.indexOf('k < 2') !== -1, 'Ch3 must share the pull-back');
  assert.ok(pages.indexOf('y > last + DOCK_PX && dy > 0') !== -1, 'S02 wheel must yield after the last stage');
  assert.ok(mvCase.indexOf('html.is-multiverse .cbx-ans {') !== -1, 'Multiverse answers skin missing');
  assert.ok(mvCase.indexOf('.cbx-phone__bezel') === -1, 'Multiverse must not restyle the cream phone');
  assert.ok(mvCase.indexOf('.cbx-ph__row') === -1, 'Multiverse must not skin phone rows');
  assert.ok(mvCase.indexOf('.cbx-desk .cbx-btn') !== -1, 'Multiverse button skin must stay on the desktop');
  assert.ok(css.indexOf('html.is-study-wipe .study .cbx-ans') !== -1, 'wipe must hide answers');
});

check('Section 02 growth field is coffee; cover stays cream', function () {
  var coverCss = css.slice(0, css.indexOf('.cbx-growth {'));
  var growthCss = css.slice(css.indexOf('.cbx-growth {'));
  assert.ok(coverCss.indexOf('background: var(--film-cream)') !== -1, 'cover world must stay cream');
  assert.ok(growthCss.indexOf('background: var(--coffee, #1E1510)') !== -1, 'growth pane must be coffee #1E1510');
  assert.ok(growthCss.indexOf('html.is-light-home .study[data-template="cbx300"] .cbx-growth') !== -1, 'cream home growth must stay coffee');
  var sceneCss = css.slice(css.indexOf('.cbx-growth__scene {'), css.indexOf('.cbx-growth__rail {'));
  assert.ok(sceneCss.indexOf('background: transparent') !== -1, 'scene must not be a boxed plate');
  assert.ok(sceneCss.indexOf('border-radius: 0') !== -1, 'scene must drop the rounded plate');
  assert.ok(sceneCss.indexOf('box-shadow: none') !== -1, 'scene must drop the inset plate ring');
  assert.ok(sceneCss.indexOf('overflow: hidden') !== -1, 'scene must crop the strip into the coffee well');
  assert.ok(sceneCss.indexOf('#2a211c') === -1, 'coffee plate fill must be gone');
  var picCss = css.slice(css.indexOf('.cbx-growth__pic {'), css.indexOf('.cbx-growth__illo {'));
  assert.ok(picCss.indexOf('border-radius: var(--work-frame-radius)') !== -1, 'illustration panel must use the shared frame radius');
  assert.ok(picCss.indexOf('background: var(--work-frame-bg)') !== -1, 'illustration panel must use the shared frame background');
  assert.ok(picCss.indexOf('box-shadow: var(--work-frame-shadow)') !== -1, 'illustration panel must use the shared frame shadow');
  assert.ok(picCss.indexOf('padding: var(--work-frame-pad)') !== -1, 'illustration panel must use the shared frame padding');
  assert.ok(picCss.indexOf('border-radius: 28px') === -1, 'illustration panel must not hardcode 28px');
  assert.ok(picCss.indexOf('#2A1E17') === -1, 'illustration panel must not hardcode coffee2');
  assert.ok(mvCase.indexOf('html.is-multiverse .study[data-template="cbx300"] .cbx-growth__scene') !== -1, 'missing Multiverse scene');
  var mvScene = mvCase.slice(
    mvCase.indexOf('html.is-multiverse .study[data-template="cbx300"] .cbx-growth__scene'),
    mvCase.indexOf('html.is-multiverse .cbx-growth__step')
  );
  assert.ok(mvScene.indexOf('background: transparent') !== -1, 'Multiverse scene must not be a boxed plate');
  assert.ok(landingCss.indexOf('--projects-panel: var(--coffee)') !== -1, 'growth must match landing projects rail coffee');
  assert.ok(landingCss.indexOf('--work-frame-radius: 22px') !== -1, 'cream frame radius lives on the landing token');
  assert.ok(landingCss.indexOf('--work-frame-media-radius: 14px') !== -1, 'cream inner radius lives on the landing token');
  assert.ok(landingCss.indexOf('--work-frame-pad-top: 14px') !== -1, 'cream frame padding lives on the landing token');
  assert.ok(/--work-frame-shadow:\s*none/.test(landingCss), 'cream frame shadow lives on the landing token');
  assert.ok(landingCss.indexOf('border-radius: var(--work-frame-radius)') !== -1, 'landing work-card must consume the radius token');
  assert.ok(mvCss.indexOf('--work-frame-radius: 0px') !== -1, 'multiverse frame radius lives on the landing token');
  assert.ok(mvCss.indexOf('--work-frame-border: 4px solid var(--ink)') !== -1, 'multiverse frame border lives on the landing token');
  assert.ok(/--work-frame-shadow:\s*7px 7px 0 var\(--cyan\)/.test(mvCss), 'multiverse frame shadow lives on the landing token');
  assert.ok(mvCss.indexOf('border-radius: var(--work-frame-radius)') !== -1, 'multiverse work-card must consume the radius token');
  assert.ok(!/html\.is-multiverse \.cbx-growth__pic \{[^}]*border-radius/.test(mvCase), 'skin must not restyle the illustration frame');
  assert.ok(pages.indexOf('cbx-growth__pic-media') !== -1, 'illustration must sit in the inner media well');
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
  assert.ok(mvCase.indexOf('html.is-multiverse .study[data-template="cbx300"]') !== -1, 'missing Multiverse study skin');
  assert.ok(mvCase.indexOf('#0e1018') !== -1, 'missing Multiverse ink');
  assert.ok(mvCase.indexOf('#3de8f5') !== -1, 'missing Multiverse cyan');
  assert.ok(mvCase.indexOf('-webkit-text-fill-color: #f3eee4') !== -1, 'Multiverse cover kicker/word must beat home print fill');
  assert.ok(css.indexOf('html.is-light-home.is-dark .study[data-template="cbx300"]') !== -1, 'cream dark must not steal Multiverse ink');
  assert.ok(css.indexOf('#0e1018') === -1, 'shared sheet must not carry Multiverse ink');
});

check('cream and Multiverse share one cover + growth layout', function () {
  assert.ok(index.indexOf('data-world="cbx300"') !== -1, 'cream index missing world');
  assert.ok(mvIndex.indexOf('data-world="cbx300"') !== -1, 'multiverse missing world');
  assert.ok(css.indexOf('html.is-multiverse .cbx-cover .hero__word') !== -1, 'multiverse must reuse cover type');
  assert.ok(css.indexOf('.cbx-growth__frame') === -1, 'old two-column frame css must be gone');
  assert.ok(css.indexOf('minmax(16.5rem, 22.5rem)') === -1, 'old copy/proof grid must be gone');
  assert.ok(css.indexOf('.cbx-growth__voice') !== -1, 'missing story voice');
  assert.ok(css.indexOf('.cbx-growth.is-static') !== -1, 'reduced-motion must keep the coffee pane');
  assert.ok(css.indexOf('grid-template-columns: 45fr 55fr') !== -1, 'D2 board must be 45/55');
  var mvGrowthPos = mvCase.indexOf('html.is-multiverse .study[data-template="cbx300"] .cbx-growth {');
  var mvGrowthRule = mvCase.slice(mvGrowthPos, mvGrowthPos + 280);
  assert.ok(mvGrowthPos !== -1, 'Multiverse growth skin missing');
  assert.ok(mvGrowthRule.indexOf('grid-template-columns') === -1, 'Multiverse must not reposition the board');
  assert.ok(mvCase.indexOf('html.is-multiverse .study[data-template="cbx300"] .cbx-growth__board') === -1,
    'Multiverse must not fork board positioning');
  assert.ok(css.indexOf('html.is-multiverse .study[data-template="cbx300"] .cbx-growth__board') === -1,
    'shared sheet must not fork Multiverse board positioning');
  assert.ok(pages.indexOf('pulseMvArrive') !== -1, 'stage arrival must pulse the Multiverse glitch');
  assert.ok(pages.indexOf('s01-inv-012') !== -1, 'stage 01 card flicker target missing');
  assert.ok(mvCase.indexOf('@keyframes cbx-mv-ask') !== -1, 'question arrival glitch missing');
  assert.ok(mvCase.indexOf('prefers-reduced-motion: reduce') !== -1, 'reduced motion must keep the static skin');
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
  assert.ok(pages.indexOf("setProperty('--panel-flush'") !== -1, 'applyCbxRise must write landing --panel-flush');
  assert.ok(pages.indexOf('--cbx-panel-flush') === -1, 'do not invent a second flush token');
  assert.ok(pages.indexOf('is-cbx-growth-in') !== -1, 'missing growth-in class');
  assert.ok(css.indexOf('--cbx-rise') !== -1, 'missing --cbx-rise transform');
  assert.ok(css.indexOf('z-index: 40') !== -1, 'growth must sit above cover/header like the landing rail');
  assert.ok(pages.indexOf("clearProps: 'opacity,visibility,pointerEvents,transform,y'") !== -1, 'close must restore chrome');
  assert.ok(pages.indexOf("start: 'top top'") !== -1, 'cover stage must pin at the window top');
  assert.ok(pages.indexOf('data-cbx-stage') !== -1, 'missing parked cover stage');
  assert.ok(pages.indexOf('RISE_DUR') !== -1, 'curtain must occupy its own scrub span before morph');
  assert.ok(css.indexOf('html.is-cbx-growth-in') !== -1, 'missing growth-in pointer-events');
});

check('coffee panel radius matches landing projects rail family', function () {
  var landingFamily = '--panel-radius: clamp(24px, 2.8vw, 36px)';
  var landingFormula = 'border-radius: calc(var(--panel-radius) * (1 - var(--panel-flush, 0)));';
  assert.ok(landingCss.indexOf(landingFamily) !== -1, 'landing cream panel-radius family missing');
  assert.ok(landingCss.indexOf(landingFormula) !== -1, 'landing rail flush radius formula missing');
  assert.ok(mvCss.indexOf(landingFormula) !== -1 || mvCss.indexOf('1 - var(--panel-flush, 0)') !== -1,
    'multiverse rail must share the flush radius formula');
  var growthAt = css.indexOf('.cbx-growth {');
  var sceneAt = css.indexOf('.cbx-growth__scene {');
  assert.ok(growthAt !== -1 && sceneAt > growthAt, '.cbx-growth rule missing');
  var growthCss = css.slice(growthAt, sceneAt);
  assert.ok(growthCss.indexOf(landingFamily) !== -1, '.cbx-growth must set landing --panel-radius');
  assert.ok(growthCss.indexOf(landingFormula) !== -1, '.cbx-growth must reuse landing panel-radius * (1 - panel-flush)');
  assert.ok(growthCss.indexOf('--cbx-panel-flush') === -1, '.cbx-growth must not invent a second flush token');
  assert.ok(css.indexOf('--cbx-panel-flush') === -1, 'css must not invent --cbx-panel-flush');
  assert.ok(growthCss.indexOf('border-radius: 0') === -1, 'rising growth must not hardcode a square radius');
  var staticAt = css.indexOf('.cbx-growth.is-static {');
  var staticSceneAt = css.indexOf('.cbx-growth.is-static .cbx-growth__scene {');
  assert.ok(staticAt !== -1 && staticSceneAt > staticAt, 'static growth rule missing');
  var staticCss = css.slice(staticAt, staticSceneAt);
  assert.ok(staticCss.indexOf('border-radius: 0') !== -1, 'flush/static growth must square to radius 0');
  assert.ok(pages.indexOf('function panelFlushFromRise') !== -1, 'missing landing panelFlushFromRise analog');
  assert.ok(pages.indexOf('rise <= 0') !== -1, 'flush must be 1 when rise is 0 (pinned to top)');
  assert.ok(pages.indexOf('rise >= 0.05') !== -1, 'flush must stay 0 while still rising');
  assert.ok(css.indexOf('--panel-flush: 0') !== -1, 'html must default flush 0 (rounded while below)');
  assert.ok(pages.indexOf("setProperty('--panel-flush'") !== -1, 'applyCbxRise must write landing --panel-flush');
  assert.ok(pages.indexOf("pane.style.setProperty('--panel-flush'") !== -1, 'flush token must live on the coffee pane, not html');
  assert.ok(pages.indexOf("removeProperty('--panel-flush')") !== -1, 'restRise must clear --panel-flush');
});

check('no invented NPS/outcomes; Echo avoid-list stays off the page', function () {
  assert.ok(!/\bNPS\b/.test(pages), 'invented NPS');
  assert.ok(!/maker-checker/i.test(pages), 'maker-checker on page');
  assert.ok(!/\bseamless\b/i.test(pages), 'seamless on page');
  assert.ok(!/\bentitlements\b/i.test(pages), 'entitlements on page');
  assert.ok(!/\bintuitive\b/i.test(pages), 'intuitive on page');
  assert.ok(pages.indexOf('“Did the money land') === -1, 'fake quotes around freelancer need');
});


check('light proof: D2 worry board', function () {
  assert.ok(pages.indexOf('cbx-growth__intro') === -1, 'essay intro must be gone');
  assert.ok(pages.indexOf('cbx-growth__lead') === -1, 'old story title must be gone');
  assert.ok(pages.indexOf('cbx-growth__meet') === -1, 'old story body must be gone');
  assert.ok(pages.indexOf('cbx-growth__ask') !== -1, 'missing worry question');
  assert.ok(pages.indexOf('cbx-growth__sub') !== -1, 'missing worry subtext');
  assert.ok(pages.indexOf('cbx-growth__lab') !== -1, 'missing her-worry label');
  assert.ok(pages.indexOf('cbx-growth__hard') === -1, 'What’s hard stack must be gone');
  assert.ok(pages.indexOf('cbx-growth__change') === -1, 'What we did stack must be gone');
  assert.ok(pages.indexOf('cbx-growth__voice') !== -1, 'missing story voice');
  assert.ok(pages.indexOf('cbx-growth__rail') !== -1, 'missing glanceable stage rail');
  assert.ok(pages.indexOf('cbx-growth__worry') !== -1, 'missing worry column');
  assert.ok(pages.indexOf('cbx-growth__pic') !== -1, 'missing illustration panel');
  assert.ok(pages.indexOf('cbx-growth__eyebrow') === -1, 'Meet Aisha eyebrow must be gone');
  assert.ok(pages.indexOf('cbx-growth__third') === -1, 'cinematic lower-third must be gone');
  assert.ok(pages.indexOf('data-cbx-proof') === -1, 'proof chip hook must be gone');
  assert.ok(pages.indexOf('cbx-growth__talk') === -1, 'talk stack must be gone');
  assert.ok(pages.indexOf("need: '") === -1, 'need field must not pad the caption pack');
  assert.ok(pages.indexOf("fact: '") === -1, 'fact field must not pad the caption pack');
  assert.ok(pages.indexOf('cbx-growth__close') === -1, 'old close line must be gone');
  assert.ok(pages.indexOf('cbx-growth__stamp') === -1, 'FINDING/CHOICE stamp markup must be gone');
  assert.ok(pages.indexOf('data-cbx-device') === -1, 'product chip must be gone');
  assert.ok(pages.indexOf('data-cbx-job') === -1, 'device job must be gone');
  assert.ok(pages.indexOf('cbx-growth__note') === -1, 'sticky-note desk voice must be gone');
  assert.ok(pages.indexOf('cbx-growth__apron') === -1, 'desk apron must be gone');
  assert.ok(pages.indexOf('cbx-growth__desk') === -1, 'desk surface markup must be gone');
  assert.ok(pages.indexOf('cbx-growth__lip') === -1, 'desk lip must be gone');
  assert.ok(pages.indexOf('cbx-growth__prop') === -1, 'desk props must be gone');
  assert.ok(pages.indexOf('Meet Aisha') === -1, 'Meet Aisha must be gone');
  assert.ok(pages.indexOf('Hi — meet Aisha.') === -1, 'essay intro leaked');
  assert.ok(pages.indexOf('Same person. Desk just gets busier.') === -1, 'desk intro metaphor leaked');
  assert.ok(pages.indexOf('Pressure changes. The bank grows with her.') === -1, 'old Echo close leaked');
  assert.ok(pages.indexOf('grows with her desk') === -1, 'desk close metaphor leaked');
  assert.ok(pages.indexOf('What’s hard') === -1, 'What’s hard label leaked');
  assert.ok(pages.indexOf('What we did') === -1, 'What we did label leaked');
  assert.ok(pages.indexOf('Did the client pay yet?') !== -1, 'freelancer question');
  assert.ok(pages.indexOf('Just her, a laptop and a stack of invoices.') !== -1, 'freelancer subtext');
  assert.ok(pages.indexOf('Her worry, every morning') !== -1, 'freelancer worry label');
  assert.ok(pages.indexOf('Just her. One client at a time.') === -1, 'old freelancer whisper leaked');
  assert.ok(pages.indexOf('Did I get paid — can I pay someone?') === -1, 'freelancer hard leaked');
  assert.ok(pages.indexOf('Phone shows pay and cash in.') === -1, 'freelancer change leaked');
  assert.ok(pages.indexOf("job: 'pay'") === -1, 'freelancer device job leaked');
  assert.ok(pages.indexOf("'Get paid'") === -1, 'Get paid chip leaked');
  assert.ok(pages.indexOf("return 'chip'") === -1, 'product chip helper leaked');
  assert.ok(pages.indexOf("return 'phone'") === -1, 'large phone object must be gone');
  assert.ok(pages.indexOf('Can I afford her salary this month?') !== -1, 'shop-of-two question');
  assert.ok(pages.indexOf('One hire, one shared card, and payday every month.') !== -1, 'shop-of-two subtext');
  assert.ok(pages.indexOf('Her worry, once she hires') !== -1, 'shop-of-two worry label');
  assert.ok(pages.indexOf("label: 'Shop of two'") !== -1, 'rail stage 02 must be Shop of two');
  assert.ok(pages.indexOf('Shop of two.') === -1, 'old sole lead leaked');
  assert.ok(pages.indexOf('Spend decisions get sharper.') === -1, 'old sole body leaked');
  assert.ok(pages.indexOf('Now it’s a real shop.') === -1, 'old sole overlay lead leaked');
  assert.ok(pages.indexOf('Two people. Money decisions get sharper.') === -1, 'old sole overlay meet leaked');
  assert.ok(pages.indexOf('Business is real now. Team of two.') === -1, 'old sole meet leaked');
  assert.ok(pages.indexOf("Desk’s fuller") === -1, 'sole desk metaphor leaked');
  assert.ok(pages.indexOf('How much can I safely spend today?') === -1, 'sole hard leaked');
  assert.ok(pages.indexOf('Available sits largest on the propped screen.') === -1, 'sole change leaked');
  assert.ok(pages.indexOf("job: 'balance'") === -1, 'sole device job leaked');
  assert.ok(pages.indexOf("'Available'") === -1, 'Available chip leaked');
  assert.ok(pages.indexOf('12,480.00') === -1, 'balance hero leaked');
  assert.ok(pages.indexOf("return 'tablet'") === -1, 'propped tablet must be gone');
  assert.ok(pages.indexOf("return 'card'") === -1, 'floating card ghost must be gone');
  assert.ok(pages.indexOf("Who's waiting on me today?") !== -1, 'mid-size question');
  assert.ok(pages.indexOf('Eight people, and most of them need her yes.') !== -1, 'mid-size subtext');
  assert.ok(pages.indexOf('Her worry, with a team') !== -1, 'mid-size worry label');
  assert.ok(pages.indexOf('Team energy.') === -1, 'old mid lead leaked');
  assert.ok(pages.indexOf('Approving is the day job.') === -1, 'old mid whisper leaked');
  assert.ok(pages.indexOf('Who’s waiting — can I clear this safely?') === -1, 'mid hard leaked');
  assert.ok(pages.indexOf('Approvals live on the laptop, with who can act.') === -1, 'mid change leaked');
  assert.ok(pages.indexOf("job: 'approvals'") === -1, 'mid device job leaked');
  assert.ok(pages.indexOf('Waiting on me') === -1, 'approvals waiting-on-me leaked');
  assert.ok(pages.indexOf("'Approve (3)'") === -1, 'Approve chip leaked');
  assert.ok(pages.indexOf("return 'laptop'") === -1, 'laptop stage prop must be gone');
  assert.ok(pages.indexOf("return 'door'") === -1, 'floating door ghost must be gone');
  assert.ok(pages.indexOf("label: 'Sole prop'") === -1, 'Sole prop rail label must be gone');
  assert.ok(pages.indexOf('Finding:') === -1, 'FINDING stamps must stay off the film');
  assert.ok(pages.indexOf('Choice:') === -1, 'CHOICE stamps must stay off the film');
  assert.ok(pages.indexOf('Same bank. It just grows up with her.') === -1, 'previous Echo close leaked');
  assert.ok(pages.indexOf('Hi — meet Aisha. She runs her work through SME Banking, and as her business grows, the pressure changes.') === -1, 'previous Echo intro leaked');
  assert.ok(pages.indexOf('She’s freelancing, and the app is basically her bank desk in her pocket.') === -1, 'previous freelancer meet leaked');
  assert.ok(pages.indexOf('She just needs money in and money out.') === -1, 'previous freelancer hard leaked');
  assert.ok(pages.indexOf('Made get-paid and pay work cleanly on her phone.') === -1, 'previous freelancer change leaked');
  assert.ok(pages.indexOf('Now it’s a little shop-of-one — still her, but the money questions get sharper.') === -1, 'previous sole meet leaked');
  assert.ok(pages.indexOf('One big “balance” number can lie about what she can spend.') === -1, 'previous sole hard leaked');
  assert.ok(pages.indexOf('Put available money first, with the other balances beside it.') === -1, 'previous sole change leaked');
  assert.ok(pages.indexOf('She’s got a small team now — people prepare payments, and someone has to sign them off.') === -1, 'previous mid meet leaked');
  assert.ok(pages.indexOf('Approving other people’s money is the job, and it piles up.') === -1, 'previous mid hard leaked');
  assert.ok(pages.indexOf('Gave approvals their own door, and kept every line visible when she signs.') === -1, 'previous mid change leaked');
  assert.ok(pages.indexOf('Hi — meet Aisha. She runs her freelance work on SME Banking.') === -1, 'Iris draft intro leaked');
  assert.ok(pages.indexOf('She’s freelancing and needs money to move today.') === -1, 'Iris draft freelancer hard leaked');
  assert.ok(pages.indexOf('So the home screen is get paid and pay.') === -1, 'Iris draft freelancer change leaked');
  assert.ok(pages.indexOf('Did the money land — can I pay?') === -1, 'Iris draft freelancer need leaked');
  assert.ok(pages.indexOf('One balance number used to lie to her.') === -1, 'Iris draft sole hard leaked');
  assert.ok(pages.indexOf('Available goes first on the card.') === -1, 'Iris draft sole change leaked');
  assert.ok(pages.indexOf('Approving stuff is basically her day now.') === -1, 'Iris draft mid hard leaked');
  assert.ok(pages.indexOf('Paid late, chased invoices') === -1, 'Iris freelancer finding leaked');
  assert.ok(pages.indexOf('Pay & get paid on phone') === -1, 'Iris freelancer choice leaked');
  assert.ok(pages.indexOf('UI: Home = receive + pay.') === -1, 'Iris freelancer UI stamp leaked');
  assert.ok(pages.indexOf('When does my money actually land') === -1, 'Iris freelancer need leaked');
  assert.ok(pages.indexOf('Mobile pay-in and pay-out as one job.') === -1, 'Iris freelancer fact leaked');
  assert.ok(pages.indexOf('One person does everything') === -1, 'old freelancer stamp leaked');
  assert.ok(pages.indexOf('Phone-complete basics') === -1, 'old freelancer choice leaked');
  assert.ok(pages.indexOf('Did I get paid? Can I pay?') === -1, 'old freelancer need leaked');
  assert.ok(pages.indexOf('Pay · Get paid') === -1, 'old freelancer ghost leaked');
  assert.ok(pages.indexOf('One balance number lies.') === -1, 'Iris sole finding leaked');
  assert.ok(pages.indexOf('Lead with available') === -1, 'Iris sole choice leaked');
  assert.ok(pages.indexOf('UI: Available hero; holds sit back.') === -1, 'Iris sole UI stamp leaked');
  assert.ok(pages.indexOf('What can I spend today?') === -1, 'Iris sole need leaked');
  assert.ok(pages.indexOf('pending never wears the crown') === -1, 'Iris sole fact leaked');
  assert.ok(pages.indexOf('Available leads; handoff safe') === -1, 'old sole choice leaked');
  assert.ok(pages.indexOf('Four balances + beneficiary') === -1, 'old sole UI leaked');
  assert.ok(pages.indexOf('Available · Add beneficiary') === -1, 'old sole ghost leaked');
  assert.ok(pages.indexOf('Approvals become a pile') === -1, 'Iris mid finding leaked');
  assert.ok(pages.indexOf('Prepare ∥ approve') === -1, 'Iris mid choice leaked');
  assert.ok(pages.indexOf('UI: Waiting-on-me door.') === -1, 'Iris mid UI stamp leaked');
  assert.ok(pages.indexOf('What needs me before payroll?') === -1, 'Iris mid need leaked');
  assert.ok(pages.indexOf('One queue for her decisions') === -1, 'Iris mid fact leaked');
  assert.ok(pages.indexOf('Finding: Approving is the job') === -1, 'old mid stamp leaked');
  assert.ok(pages.indexOf('Own door; rows stay visible') === -1, 'old mid choice leaked');
  assert.ok(pages.indexOf('Who’s waiting on me?') === -1, 'old mid need leaked');
  assert.ok(pages.indexOf('Approvals · Permissions') === -1, 'old mid ghost leaked');
  assert.ok(pages.indexOf('Same bank. Grows with her.') === -1, 'Iris spine leaked');
  assert.ok(pages.indexOf('Did that invoice land') === -1, 'older freelancer need leaked');
  assert.ok(pages.indexOf('Solo cash is easy to lose') === -1, 'older freelancer stamp leaked');
  assert.ok(pages.indexOf('Who still owes me a yes') === -1, 'older mid need leaked');
  assert.ok(css.indexOf('opacity: 0.42') === -1, 'faint 0.42 phone pass must be gone');
  var growthCss = css.slice(css.indexOf('.cbx-growth {'), css.indexOf('.cbx-ans {'));
  assert.ok(growthCss.indexOf('Syne') === -1, 'growth stage must drop display Syne');
  assert.ok(growthCss.indexOf('#5ecfcf') === -1, 'growth must drop neon teal stamps');
  var askCss = css.slice(css.indexOf('.cbx-growth__ask {'), css.indexOf('.cbx-growth__quote {'));
  assert.ok(askCss.indexOf('Newsreader') !== -1, 'question must be the existing serif');
  assert.ok(askCss.indexOf('italic') !== -1, 'question must stay italic');
  assert.ok(askCss.indexOf('6.67vw') !== -1, 'question must scale toward ~96px at 1440');
  assert.ok(askCss.indexOf('6rem') !== -1, 'question must cap near the mockup size');
  var subCss = css.slice(css.indexOf('.cbx-growth__sub {'), css.indexOf('.cbx-growth__pic {'));
  assert.ok(subCss.indexOf('Outfit') !== -1, 'subtext must be readable sans');
  assert.ok(subCss.indexOf('1.5rem') !== -1, 'subtext must not be a whisper caption');
  assert.ok(css.indexOf('.cbx-growth__k {') === -1, 'What’s hard / What we did labels must be gone');
  assert.ok(css.indexOf('.cbx-growth__chip') === -1, 'stamp chips must stay gone');
  assert.ok(css.indexOf('.cbx-growth__spine') === -1, 'spine chip css must stay gone');
  assert.ok(css.indexOf('.cbx-growth__note') === -1, 'sticky-note css must stay gone');
  assert.ok(css.indexOf('.cbx-growth__apron') === -1, 'apron css must stay gone');
  assert.ok(css.indexOf('.cbx-growth__desk') === -1, 'desk css must stay gone');
  assert.ok(css.indexOf('.cbx-growth__lip') === -1, 'desk lip css must stay gone');
  assert.ok(css.indexOf('.cbx-growth__prop') === -1, 'prop css must stay gone');
  assert.ok(css.indexOf('.cbx-device') === -1, 'product device css must stay gone');
  assert.ok(css.indexOf('.cbx-device--chip') === -1, 'tiny product chip css must stay gone');
  assert.ok(css.indexOf('.cbx-device--phone') === -1, 'large phone object must stay gone');
  assert.ok(css.indexOf('.cbx-device--tablet') === -1, 'propped tablet must stay gone');
  assert.ok(css.indexOf('.cbx-device--laptop') === -1, 'laptop object must stay gone');
  assert.ok(css.indexOf('.cbx-ghost') === -1, 'ghost annotation layer must stay gone');
  assert.ok(css.indexOf('.cbx-device--desktop') === -1, 'desktop dashboard ghost must stay gone');
  assert.ok(css.indexOf('backdrop-filter') === -1, 'no glass');
  assert.ok(pages.indexOf('cbx-growth__step-name') !== -1, 'rail must name Freelancer / Shop of two / Mid-size');
  assert.ok(pages.indexOf("pad(i + 1)") !== -1, 'rail must number the three stages');
  assert.ok(pages.indexOf('travelX') === -1, 'proof pass must not bring back sideways travel');
  assert.ok(pages.indexOf('film-decision') === -1, 'old film decision chips must stay gone');
  assert.ok(css.indexOf('#E8A96B') !== -1, 'amber quote marks missing');
});

check('growth layers lock to the same beat index', function () {
  assert.ok(pages.indexOf('function applyBeat') !== -1, 'missing applyBeat');
  assert.ok(pages.indexOf('applyBeat(pin, beatIndexFromProgress(morphP))') !== -1,
    'onUpdate must drive captions + illustration from one morph index');
  assert.ok(pages.indexOf("pane.setAttribute('data-cbx-live-beat'") !== -1, 'live beat index must be readable');
  assert.ok(pages.indexOf("setAttribute('data-cbx-live-beat', '0')") !== -1, 'growth must start on freelancer beat');
  assert.ok(pages.indexOf('Math.floor(progress * n)') !== -1, 'beats must split the morph into equal floors');
  assert.ok(pages.indexOf('tl.to(ghosts') === -1, 'ghosts must not fade on a delayed timeline');
  assert.ok(pages.indexOf('tl.to(beats') === -1, 'copy must not fade on a delayed timeline');
  assert.ok(pages.indexOf('function markBeat') === -1, 'do not keep a second beat marker');
  assert.ok(pages.indexOf('tl.to({}, { duration: MORPH_VH })') !== -1, 'morph runway must keep pin duration');
  var beatFn = pages.slice(pages.indexOf('function beatCopy'), pages.indexOf('function buildRail'));
  var labAt = beatFn.indexOf("cbx-growth__lab");
  var askAt = beatFn.indexOf("cbx-growth__ask");
  var subAt = beatFn.indexOf("cbx-growth__sub");
  assert.ok(labAt !== -1 && askAt !== -1 && subAt !== -1 && labAt < askAt && askAt < subAt,
    'voice order must be label, question, subtext');
  assert.ok(beatFn.indexOf("cbx-growth__stage") === -1, 'beat copy must not restage the rail');
  assert.ok(beatFn.indexOf("cbx-growth__hard") === -1, 'hard must not be a caption line');
  assert.ok(beatFn.indexOf("cbx-growth__change") === -1, 'change must not be a caption line');
  var illoCss = css.slice(css.indexOf('.cbx-growth__illo {'), css.indexOf('.cbx-growth__illo.is-on {'));
  assert.ok(illoCss.indexOf('visibility: hidden') !== -1, 'off-beat illustrations must leave the text tree');
  assert.ok(css.indexOf('.cbx-growth__illo.is-on') !== -1, 'on-beat illustration must be a class');
  var onIllo = css.slice(css.indexOf('.cbx-growth__illo.is-on {'), css.indexOf('.cbx-growth__illo svg'));
  assert.ok(onIllo.indexOf('opacity: 1') !== -1, 'active illustration must paint');
  assert.ok(onIllo.indexOf('visibility: visible') !== -1, 'active illustration must be in the tree');
  assert.ok(onIllo.indexOf('280ms ease') !== -1, 'illustration must crossfade');
  var beatOn = css.slice(css.indexOf('.cbx-growth__beat.is-on {'), css.indexOf('.cbx-growth__lab {'));
  assert.ok(beatOn.indexOf('opacity: 1') !== -1, 'active copy must be fully on, not a muddy 0.5');
  assert.ok(beatOn.indexOf('visibility: visible') !== -1, 'active copy must be the only readable beat');
  assert.ok(beatOn.indexOf('280ms ease') !== -1, 'incoming copy must crossfade');
  var beatOff = css.slice(css.indexOf('.cbx-growth__beat {'), css.indexOf('.cbx-growth__beat.is-on {'));
  assert.ok(beatOff.indexOf('opacity 280ms ease') !== -1, 'outgoing copy must crossfade');
  assert.ok(pages.indexOf("id: 'mug'") === -1, 'mug prop must be gone');
  assert.ok(pages.indexOf("id: 'chair'") === -1, 'chair prop must be gone');
  assert.ok(pages.indexOf('data-cbx-prop') === -1, 'prop data hook must be gone');
  assert.ok(pages.indexOf('[data-cbx-beat], [data-cbx-illo]') !== -1,
    'morph nodes must be captions + illustrations');
  assert.ok(pages.indexOf('from <= index') === -1, 'clay cast enter-from must be gone');
  assert.ok(pages.indexOf('illo-d2-scene.svg') !== -1, 'missing layered scene illustration');
  assert.ok(pages.indexOf('data-cbx-layer') !== -1, 'missing illustration layer hooks');
  assert.ok(pages.indexOf('cbx-growth__word') !== -1, 'question words must stagger as spans');
  assert.ok(pages.indexOf('cbx-growth__rule') !== -1, 'divider rule must draw, not sit as a static border');
  assert.ok(pages.indexOf('cbx-growth__rail-ink') !== -1, 'stage rail cream underline must slide');
  assert.ok(pages.indexOf('strokeDashoffset') !== -1, 'stage 01 arrow must draw via stroke-dashoffset');
  assert.ok(pages.indexOf('function wireScene') !== -1, 'missing scrubbed scene wiring');
  assert.ok(pages.indexOf('function armIdle') !== -1, 'missing ambient idle loops');
  assert.ok(pages.indexOf('setIdlePlaying') !== -1, 'idle loops must pause off-screen');
  assert.ok(css.indexOf('.cbx-growth__rail-ink') !== -1, 'missing sliding rail ink css');
  assert.ok(css.indexOf('.cbx-growth__word') !== -1, 'missing word span css');
  assert.ok(css.indexOf('.cbx-growth__rule') !== -1, 'missing divider rule css');
  var sceneSvg = read('assets/img/aisha-growth/illo-d2-scene.svg');
  assert.ok(sceneSvg.indexOf('data-cbx-layer="aisha"') !== -1, 'scene must keep Aisha as a persist layer');
  assert.ok(sceneSvg.indexOf('data-cbx-layer="desk"') !== -1, 'scene must keep the desk as a persist layer');
  assert.ok(sceneSvg.indexOf('data-cbx-layer="plant"') !== -1, 'scene must keep the plant as a persist layer');
  assert.ok(sceneSvg.indexOf('data-cbx-layer="mug"') !== -1, 'scene must keep the mug as a persist layer');
  assert.ok(sceneSvg.indexOf('data-cbx-layer="lamp"') !== -1, 'scene must keep the lamp as a persist layer');
  assert.ok(sceneSvg.indexOf('data-cbx-layer="s02-lina"') !== -1, 'scene must isolate Lina');
  assert.ok(sceneSvg.indexOf('data-cbx-layer="s03-pill"') !== -1, 'scene must isolate the waiting pill');
  assert.ok(sceneSvg.indexOf('s01-arrow-draw') !== -1, 'scene must expose the invoice arrow draw path');
  assert.ok(sceneSvg.indexOf('pathLength="1"') !== -1, 'arrow draw path must use pathLength 1');
});

check('D2 worry board replaces clay plate and product chips', function () {
  assert.ok(css.indexOf('.cbx-growth__copy') === -1, 'left essay column css must be gone');
  assert.ok(css.indexOf('.cbx-growth__frame') === -1, 'two-column frame css must be gone');
  assert.ok(css.indexOf('.cbx-growth__well') === -1, 'old proof well must be gone');
  assert.ok(pages.indexOf('cbx-growth__copy') === -1, 'left essay column markup must be gone');
  assert.ok(css.indexOf('.cbx-growth__desk') === -1, 'desk surface css must be gone');
  assert.ok(css.indexOf('.cbx-growth__apron') === -1, 'desk apron css must be gone');
  assert.ok(css.indexOf('.cbx-growth__note') === -1, 'sticky notes css must be gone');
  assert.ok(css.indexOf('.cbx-growth__lip') === -1, 'desk lip css must be gone');
  assert.ok(css.indexOf('.cbx-growth__top') === -1, 'desk top css must be gone');
  assert.ok(css.indexOf('.cbx-prop__shadow') === -1, 'prop contact shadows must be gone');
  assert.ok(css.indexOf('#8a6244') === -1, 'wood desk color must be gone');
  assert.ok(css.indexOf('#e8a07a') === -1, 'urgent paper color must be gone');
  assert.ok(css.indexOf('#e6dfd0') === -1, 'calm paper color must be gone');
  var growthCss = css.slice(css.indexOf('.cbx-growth {'));
  assert.ok(growthCss.indexOf('repeating-linear-gradient') === -1, 'wood grain must be gone');
  assert.ok(css.indexOf('.cbx-growth__third') === -1, 'cinematic lower-third css must be gone');
  var railCss = css.slice(css.indexOf('.cbx-growth__rail {'), css.indexOf('.cbx-growth__step {'));
  assert.ok(railCss.indexOf('display: flex') !== -1, 'stage rail must stay in one glanceable row');
  var boardCss = css.slice(css.indexOf('.cbx-growth__board {'), css.indexOf('.cbx-growth__worry {'));
  assert.ok(boardCss.indexOf('45fr 55fr') !== -1, 'board must keep the D2 45/55 split');
  var worryCss = css.slice(css.indexOf('.cbx-growth__worry {'), css.indexOf('.cbx-growth__voice {'));
  assert.ok(worryCss.indexOf('justify-content: center') !== -1, 'worry column must sit vertically centred');
  var picCss = css.slice(css.indexOf('.cbx-growth__pic {'), css.indexOf('.cbx-growth__illo {'));
  assert.ok(picCss.indexOf('var(--work-frame-radius)') !== -1, 'illustration panel must be the shared work-card frame');
  assert.ok(picCss.indexOf('cbx-growth__pic-media') !== -1, 'illustration sits in the shared inner media well');
  assert.ok(picCss.indexOf('min(420px, 48vh)') === -1, 'old supporting plate height must be gone');
  assert.ok(css.indexOf('min(28%, 16rem)') === -1, 'old left overlay column must be gone');
  var voiceCss = css.slice(css.indexOf('.cbx-growth__voice {'), css.indexOf('.cbx-growth__beat {'));
  assert.ok(voiceCss.indexOf('display: grid') !== -1, 'beats must overlay without a fake min-height band');
  assert.ok(css.indexOf('.cbx-growth__devices') === -1, 'proof chip wrap must be gone');
  assert.ok(css.indexOf('min-height: 16.5rem') === -1, 'empty 16.5rem band between intro and stage must be gone');
  assert.ok(css.indexOf('min-height: 16rem') === -1, 'mobile must not reintroduce the empty beat well');
  var beatOff = css.slice(css.indexOf('.cbx-growth__beat {'), css.indexOf('.cbx-growth__beat.is-on {'));
  assert.ok(beatOff.indexOf('grid-area: 1 / 1') !== -1, 'beats must overlay in one cell');
  assert.ok(beatOff.indexOf('position: absolute') === -1, 'beats must not bottom-pin inside an empty well');
  assert.ok(pages.indexOf('[data-cbx-step]') !== -1, 'applyBeat must light the stage rail');
  assert.ok(pages.indexOf('data-illo-crop') !== -1, 'illustration must fill the landing-card well');
  assert.ok(pages.indexOf("'xMidYMax slice'") !== -1, 'illustration must slice to the card edges, bottom-anchored');
  assert.ok(pages.indexOf("'xMidYMax meet'") === -1, 'contain crop must be gone so the drawing fills the well');
  assert.ok(pages.indexOf("'xMidYMin slice'") === -1, 'top-sliced crop must be gone');
  assert.ok(css.indexOf('122%') === -1, 'side-zoom crop must be gone');
  assert.ok(css.indexOf('.cbx-growth__illo[data-illo-crop="1"]') !== -1, 'illustration fill rule missing');
  var cropCss = css.slice(
    css.indexOf('.cbx-growth__illo[data-illo-crop="1"] {'),
    css.indexOf('.cbx-growth__illo[data-illo-crop="1"] svg')
  );
  assert.ok(cropCss.indexOf('inset: 0') !== -1, 'illustration must meet the inner well edge');
  assert.ok(cropCss.indexOf('inset: 24px') === -1, 'inner mat inset must be gone');
  assert.ok(css.indexOf('object-fit: fill') !== -1, 'illustration viewport must fill the well');
  assert.ok(css.indexOf('object-fit: contain') === -1, 'contain fit must not letterbox the drawing');
  assert.ok(css.indexOf('object-position: center bottom') !== -1, 'illustration must sit on the panel floor');
  var sceneSvg = read('assets/img/aisha-growth/illo-d2-scene.svg');
  assert.ok(sceneSvg.indexOf('""""') === -1, 'masked card digits must not be quote glyphs');
  assert.ok(sceneSvg.indexOf('\u00b7') === -1, 'prop labels must not rely on a middle-dot glyph');
  assert.ok(sceneSvg.indexOf('>4821<') !== -1, 'shared card must keep the visible digits');
  assert.ok(sceneSvg.indexOf('>PAYDAY<') !== -1 && sceneSvg.indexOf('>FRI<') !== -1, 'payday label must split around a drawn dot');
  assert.ok(sceneSvg.indexOf('>PAYROLL<') !== -1, 'payroll label must split around a drawn dot');
  var coffee = [30, 21, 16];
  var cream = [244, 239, 230];
  function srgbToLin(c) {
    var x = c / 255;
    return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  }
  function lum(rgb) {
    return 0.2126 * srgbToLin(rgb[0]) + 0.7152 * srgbToLin(rgb[1]) + 0.0722 * srgbToLin(rgb[2]);
  }
  function blend(fg, bg, a) {
    return [fg[0] * a + bg[0] * (1 - a), fg[1] * a + bg[1] * (1 - a), fg[2] * a + bg[2] * (1 - a)];
  }
  function contrast(fg, bg) {
    var hi = Math.max(lum(fg), lum(bg));
    var lo = Math.min(lum(fg), lum(bg));
    return (hi + 0.05) / (lo + 0.05);
  }
  var askC = contrast(cream, coffee);
  var subC = contrast(blend(cream, coffee, 0.86), coffee);
  assert.ok(askC >= 7, 'question must be readable on coffee (' + askC.toFixed(2) + ')');
  assert.ok(subC >= 7, 'subtext must stay AAA on coffee (' + subC.toFixed(2) + ')');
});

check('coffee curtain docks with landing projects softness', function () {
  var rise = pages.match(/var RISE_DUR = ([0-9.]+)/);
  assert.ok(rise && parseFloat(rise[1]) === 1,
    'RISE_DUR must match landing riseMax (~1vh from .scroll-run 200vh)');
  var lerp = pages.match(/var RISE_LERP = ([0-9.]+)/);
  assert.ok(lerp && parseFloat(lerp[1]) === 0.7,
    'RISE_LERP must match landing tweenBento duration 0.7');
  assert.ok(pages.indexOf('function tweenCbxRise') !== -1, 'missing landing tweenBento analog');
  assert.ok(pages.indexOf("ease: 'power3.out'") !== -1, 'rise lerp must use landing power3.out');
  assert.ok(pages.indexOf('overwrite: true') !== -1, 'rise lerp must overwrite like tweenBento');
  assert.ok(pages.indexOf('scrub: true') !== -1, 'pin playhead must stay 1:1 so morph runs after dock');
  assert.ok(pages.indexOf('fastScrollEnd: true') === -1, 'fastScrollEnd snaps; landing has no snap');
  assert.ok(pages.indexOf("ease: 'power2.out'") === -1, 'power2.out front-loads; too snappy vs landing');
  assert.ok(pages.indexOf('var STAGE_HOLD = 0.55') !== -1, 'stage 01 must dwell ~0.55vh after the curtain docks');
  assert.ok(pages.indexOf('var STEP_PX = 72') !== -1, 'a wheel notch must clear the step threshold');
  assert.ok(pages.indexOf('var GESTURE_QUIET = 80') !== -1, 'a short pause must end the gesture before the next stage');
  assert.ok(pages.indexOf('function bindStageStep') !== -1, 'direction-aware stage step missing');
  assert.ok(pages.indexOf('ctrl.origin + dir') !== -1, 'one gesture may advance only one stage');
  assert.ok(pages.indexOf('function dockScrollY') !== -1, 'stage step must wait until the curtain has docked');
  assert.ok(pages.indexOf("ctrl.kind = 'rise'") !== -1, 'curtain rise stays smooth until the panel is flush');
  assert.ok(pages.indexOf('snapTo:') === -1, 'nearest snap pulls short gestures backward');
  assert.ok(pages.indexOf('directional: false') === -1, 'nearest snap is not direction-aware');
  assert.ok(pages.indexOf('var LINA_X = 112') !== -1, 'Lina must move aside so Aisha stays put');
  assert.ok(pages.indexOf('AISHA_X') === -1, 'Aisha x must stay constant across stages');
  assert.ok(css.indexOf('top: var(--study-head, 72px)') === -1, 'coffee panel must cover the study bar');
  assert.ok(css.indexOf('inset: 0') !== -1, 'coffee panel must meet the viewport edge');
  assert.ok(css.indexOf('height: 100vh') !== -1, 'coffee panel must fill the viewport');
  assert.ok(pages.indexOf('RISE_DUR + STAGE_HOLD') !== -1, '01→02 must wait until after the 01 hold');
  assert.ok(pages.indexOf('RISE_DUR - 0.86') !== -1, 'stage 01 enter must finish before the curtain docks');
  assert.ok(landing.indexOf('duration: opts.duration || 0.7') !== -1, 'landing tweenBento 0.7 must still be source');
  assert.ok(landing.indexOf("ease: opts.ease || 'power3.out'") !== -1, 'landing tweenBento power3.out must still be source');
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
