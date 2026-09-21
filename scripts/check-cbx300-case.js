#!/usr/bin/env node
'use strict';

/**
 * Guards CBX300 Section 01 cover + Section 02 Aisha desk montage.
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
  assert.ok(index.indexOf('cbx300-case.css?v=s60') !== -1, 'index.html missing growth cache-bust');
  assert.ok(index.indexOf('cbx300-case.js?v=s56') !== -1, 'index.html missing growth js cache-bust');
  assert.ok(mvIndex.indexOf('cbx300-case.css?v=s60') !== -1, 'multiverse missing growth css cache-bust');
  assert.ok(mvIndex.indexOf('cbx300-case.js?v=s56') !== -1, 'multiverse missing growth cache-bust');
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
  var coverFn = pages.slice(pages.indexOf('function buildCover'), pages.indexOf('function personFig'));
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
  assert.ok(pages.indexOf('data-cbx-desk') !== -1, 'missing desk montage hook');
  assert.ok(pages.indexOf('data-cbx-montage') !== -1, 'missing montage hook');
  assert.ok(pages.indexOf('cbx-growth__desk') !== -1, 'missing desk surface');
  assert.ok(pages.indexOf('cbx-growth__device') !== -1, 'missing desk app object');
  assert.ok(pages.indexOf('cbx-growth__prop') !== -1, 'missing desk props');
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
  var sceneCss = css.slice(css.indexOf('.cbx-growth__scene {'), css.indexOf('.cbx-growth__cast {'));
  assert.ok(sceneCss.indexOf('background: transparent') !== -1, 'desk scene must not be a boxed plate');
  assert.ok(sceneCss.indexOf('border-radius: 0') !== -1, 'scene must drop the rounded plate');
  assert.ok(sceneCss.indexOf('box-shadow: none') !== -1, 'scene must drop the inset plate ring');
  assert.ok(sceneCss.indexOf('overflow: visible') !== -1, 'scene must not clip the cast');
  assert.ok(sceneCss.indexOf('#2a211c') === -1, 'coffee plate fill must be gone');
  var castCss = css.slice(css.indexOf('.cbx-growth__cast {'), css.indexOf('.cbx-growth__person {'));
  assert.ok(castCss.indexOf('position: absolute') !== -1, 'cast stands behind the desk, unboxed');
  assert.ok(castCss.indexOf('background: transparent') !== -1, 'cast must not be an inset plate');
  assert.ok(css.indexOf('html.is-multiverse .study[data-template="cbx300"] .cbx-growth__scene') !== -1, 'missing Multiverse scene');
  var mvScene = css.slice(
    css.indexOf('html.is-multiverse .study[data-template="cbx300"] .cbx-growth__scene'),
    css.indexOf('html.is-cream-home .study[data-template="cbx300"] .cbx-growth')
  );
  assert.ok(mvScene.indexOf('background: transparent') !== -1, 'Multiverse scene must not be a boxed plate');
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
  assert.ok(css.indexOf('.cbx-growth__frame') === -1, 'old two-column frame css must be gone');
  assert.ok(css.indexOf('minmax(16.5rem, 22.5rem)') === -1, 'old copy/proof grid must be gone');
  assert.ok(css.indexOf('.cbx-growth__desk') !== -1, 'missing desk surface css');
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
  var staticBeatAt = css.indexOf('.cbx-growth.is-static .cbx-growth__beat {');
  assert.ok(staticAt !== -1 && staticBeatAt > staticAt, 'static growth rule missing');
  var staticCss = css.slice(staticAt, staticBeatAt);
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

check('light proof: desk voice and product objects on the desk', function () {
  assert.ok(pages.indexOf('cbx-growth__intro') !== -1, 'missing meet-Aisha intro');
  assert.ok(pages.indexOf('cbx-growth__meet') !== -1, 'missing per-beat meet line');
  assert.ok(pages.indexOf('cbx-growth__hard') !== -1, 'missing hard line');
  assert.ok(pages.indexOf('cbx-growth__change') !== -1, 'missing change line');
  assert.ok(pages.indexOf("need: '") === -1, 'need field must not pad the desk-life pack');
  assert.ok(pages.indexOf("fact: '") === -1, 'fact field must not pad the desk-life pack');
  assert.ok(pages.indexOf('cbx-growth__close') !== -1, 'missing close chip');
  assert.ok(pages.indexOf('cbx-growth__stamp') === -1, 'FINDING/CHOICE stamp markup must be gone');
  assert.ok(pages.indexOf('data-cbx-device') !== -1, 'missing desk app object');
  assert.ok(pages.indexOf('data-cbx-job') !== -1, 'device must name its job');
  assert.ok(pages.indexOf('cbx-growth__note') !== -1, 'missing sticky-note desk voice');
  assert.ok(pages.indexOf('cbx-growth__apron') !== -1, 'missing desk-apron lower third');
  assert.ok(pages.indexOf('Hi — meet Aisha. Same person. Desk just gets busier.') !== -1, 'missing Echo intro');
  assert.ok(pages.indexOf('Pressure changes. The bank grows with her desk.') !== -1, 'missing Echo close');
  assert.ok(pages.indexOf('What’s hard') !== -1, 'missing casual What’s hard label');
  assert.ok(pages.indexOf('What we did') !== -1, 'missing casual What we did label');
  assert.ok(pages.indexOf('Just her. One client at a time.') !== -1, 'freelancer meet');
  assert.ok(pages.indexOf('“Did I get paid — can I pay someone?”') !== -1, 'freelancer hard');
  assert.ok(pages.indexOf('Phone shows pay and cash in.') !== -1, 'freelancer change');
  assert.ok(pages.indexOf("job: 'pay'") !== -1, 'freelancer device job');
  assert.ok(pages.indexOf("'Get paid'") !== -1, 'pay home missing Get paid');
  assert.ok(pages.indexOf("'Pay'") !== -1, 'pay home missing Pay');
  assert.ok(pages.indexOf("'Receive'") === -1, 'old Receive ghost leaked');
  assert.ok(pages.indexOf("return 'phone'") !== -1, 'freelancer device must stay a phone');
  assert.ok(pages.indexOf('Business is real now. Desk’s fuller.') !== -1, 'sole meet');
  assert.ok(pages.indexOf('“How much can I safely spend today?”') !== -1, 'sole hard');
  assert.ok(pages.indexOf('Available sits largest on the propped screen.') !== -1, 'sole change');
  assert.ok(pages.indexOf("job: 'balance'") !== -1, 'sole device job');
  assert.ok(pages.indexOf("'Available'") !== -1, 'balance missing Available');
  assert.ok(pages.indexOf('12,480.00') !== -1, 'balance missing available hero');
  assert.ok(pages.indexOf('Ledger  13,850.00') !== -1, 'balance missing ledger chip');
  assert.ok(pages.indexOf("return 'tablet'") !== -1, 'sole device must be a propped tablet');
  assert.ok(pages.indexOf("return 'card'") === -1, 'floating card ghost must be gone');
  assert.ok(pages.indexOf('Team energy. Approving is the day job.') !== -1, 'mid meet');
  assert.ok(pages.indexOf('“Who’s waiting — can I clear this safely?”') !== -1, 'mid hard');
  assert.ok(pages.indexOf('Approvals live on the laptop, with who can act.') !== -1, 'mid change');
  assert.ok(pages.indexOf("job: 'approvals'") !== -1, 'mid device job');
  assert.ok(pages.indexOf('Waiting on me') !== -1, 'approvals missing waiting-on-me');
  assert.ok(pages.indexOf("'Approve (3)'") !== -1, 'approvals missing Approve (n)');
  assert.ok(pages.indexOf("'Payroll'") !== -1, 'approvals missing queue rows');
  assert.ok(pages.indexOf("return 'laptop'") !== -1, 'mid device must be a laptop');
  assert.ok(pages.indexOf("return 'door'") === -1, 'floating door ghost must be gone');
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
  assert.ok(css.indexOf('font-variant-numeric: tabular-nums') !== -1, 'money must be tabular');
  var growthCss = css.slice(css.indexOf('.cbx-growth {'));
  assert.ok(growthCss.indexOf('Syne') === -1, 'growth stage and money must drop display Syne');
  assert.ok(growthCss.indexOf('#5ecfcf') === -1, 'growth must drop neon teal stamps');
  var introCss = css.slice(css.indexOf('.cbx-growth__intro {'), css.indexOf('.cbx-growth__close {'));
  assert.ok(introCss.indexOf('Newsreader') !== -1, 'intro must feel spoken, not a chip');
  assert.ok(introCss.indexOf('italic') !== -1, 'intro must stay italic');
  assert.ok(introCss.indexOf('0.86') !== -1, 'intro cream must stay warm on coffee');
  var stageCss = css.slice(css.indexOf('.cbx-growth__stage {'), css.indexOf('.cbx-growth__note {'));
  assert.ok(stageCss.indexOf('Outfit') !== -1, 'stage must be product sans');
  assert.ok(stageCss.indexOf('0.875rem') !== -1, 'stage must stay small 01 · label, not a billboard');
  assert.ok(stageCss.indexOf('0.78') !== -1, 'stage cream must stay readable on coffee');
  var meetCss = css.slice(css.indexOf('.cbx-growth__meet {'), css.indexOf('.cbx-growth__k {'));
  assert.ok(meetCss.indexOf('Newsreader') !== -1, 'meet line must be handwritten-adjacent serif');
  assert.ok(meetCss.indexOf('italic') !== -1, 'meet line must stay spoken, not product UI');
  assert.ok(meetCss.indexOf('0.875rem') !== -1, 'meet line is spoken body, not a stamp');
  var kCss = css.slice(css.indexOf('.cbx-growth__k {'), css.indexOf('.cbx-growth__hard,'));
  assert.ok(kCss.indexOf('text-transform: none') !== -1, 'What’s hard / What we did must stay sentence case');
  assert.ok(kCss.indexOf('uppercase') === -1, 'talk labels must not shout uppercase');
  assert.ok(kCss.indexOf('0.75rem') !== -1, 'talk labels stay small');
  var talkCss = css.slice(css.indexOf('.cbx-growth__hard,'), css.indexOf('.cbx-growth__props {'));
  assert.ok(talkCss.indexOf('Newsreader') !== -1, 'hard/change must be handwritten-adjacent serif');
  assert.ok(talkCss.indexOf('0.875rem') !== -1, 'hard/change are spoken body, not stamps');
  assert.ok(css.indexOf('.cbx-growth__chip') === -1, 'stamp chips must stay gone');
  assert.ok(css.indexOf('.cbx-growth__spine') === -1, 'spine chip css must stay gone');
  var heroCss = css.slice(css.indexOf('.cbx-device__hero {'), css.indexOf('.cbx-device__subs {'));
  assert.ok(heroCss.indexOf('Outfit') !== -1, 'Available amount must be product sans');
  assert.ok(heroCss.indexOf('2.4rem') === -1, 'Available must not be oversized display');
  assert.ok(heroCss.indexOf('3.75rem') === -1, 'Available must not be billboard money');
  assert.ok(heroCss.indexOf('max-width: 100%') !== -1, 'Available must stay inside the card');
  assert.ok(heroCss.indexOf('tabular-nums') !== -1, 'Available must use tabular figures');
  var tabletCss = css.slice(css.indexOf('.cbx-device--tablet {'), css.indexOf('.cbx-device--laptop {'));
  assert.ok(tabletCss.indexOf('container-type: inline-size') !== -1, 'Available tablet must size money to its width');
  assert.ok(pages.indexOf("pad(index + 1) + ' · ' + beat.label") !== -1, 'stage must read 01 · Freelancer');
  assert.ok(pages.indexOf("data-cbx-money") !== -1, 'Available hero must be measurable');
  assert.ok(pages.indexOf('function fitMoney') !== -1, 'money must shrink to the card, not spill');
  assert.ok(css.indexOf('.cbx-device--phone') !== -1, 'phone object missing');
  assert.ok(css.indexOf('.cbx-device--tablet') !== -1, 'propped tablet missing');
  assert.ok(css.indexOf('.cbx-device--laptop') !== -1, 'laptop object missing');
  assert.ok(css.indexOf('.cbx-device__screen--pay') !== -1, 'pay home missing');
  assert.ok(css.indexOf('.cbx-device__screen--balance') !== -1, 'balance screen missing');
  assert.ok(css.indexOf('.cbx-device__screen--approvals') !== -1, 'approvals screen missing');
  assert.ok(css.indexOf('.cbx-ghost') === -1, 'ghost annotation layer must stay gone');
  assert.ok(css.indexOf('.cbx-device--desktop') === -1, 'desktop dashboard ghost must stay gone');
  assert.ok(css.indexOf('backdrop-filter') === -1, 'no glass');
  assert.ok(css.indexOf('.cbx-device__screen') !== -1 && css.indexOf('inset 0 0 16px rgba(255, 236, 200, 0.2)') !== -1,
    'device screens need a tiny warm glow, not a neon halo');
  assert.ok(!/#5ecfcf|#3de8f5/.test(css.slice(css.indexOf('.cbx-device'))), 'no neon glow on device');
  assert.ok(pages.indexOf('travelX') === -1, 'proof pass must not bring back sideways travel');
  assert.ok(pages.indexOf('film-decision') === -1, 'old film decision chips must stay gone');
});

check('desk layers lock to the same beat index', function () {
  assert.ok(pages.indexOf('function applyBeat') !== -1, 'missing applyBeat');
  assert.ok(pages.indexOf('applyBeat(pin, beatIndexFromProgress(morphP))') !== -1,
    'onUpdate must drive notes + device + cast + props from one morph index');
  assert.ok(pages.indexOf("pane.setAttribute('data-cbx-live-beat'") !== -1, 'live beat index must be readable');
  assert.ok(pages.indexOf("setAttribute('data-cbx-live-beat', '0')") !== -1, 'growth must start on freelancer beat');
  assert.ok(pages.indexOf('Math.floor(progress * n)') !== -1, 'beats must split the morph into equal floors');
  assert.ok(pages.indexOf('tl.to(ghosts') === -1, 'ghosts must not fade on a delayed timeline');
  assert.ok(pages.indexOf('tl.to(beats') === -1, 'copy must not fade on a delayed timeline');
  assert.ok(pages.indexOf('function markBeat') === -1, 'do not keep a second beat marker');
  assert.ok(pages.indexOf('tl.to({}, { duration: MORPH_VH })') !== -1, 'morph runway must keep pin duration');
  assert.ok(pages.indexOf('from <= index') !== -1, 'cast must enter from the live beat, not all-on');
  assert.ok(pages.indexOf("figure.classList.add('is-in')") !== -1, 'freelancer must start in');
  var beatFn = pages.slice(pages.indexOf('function beatCopy'), pages.indexOf('function productScreen'));
  var stageAt = beatFn.indexOf("cbx-growth__stage");
  var meetAt = beatFn.indexOf("cbx-growth__meet");
  var hardAt = beatFn.indexOf("cbx-growth__hard");
  var changeAt = beatFn.indexOf("cbx-growth__change");
  assert.ok(stageAt !== -1 && meetAt !== -1 && hardAt !== -1 && changeAt !== -1
    && stageAt < meetAt && meetAt < hardAt && hardAt < changeAt,
    'desk voice order must be stage, meet, hard, change');
  assert.ok(beatFn.indexOf("cbx-growth__need") === -1, 'need must not be a fourth caption line');
  assert.ok(beatFn.indexOf("cbx-growth__fact") === -1, 'fact must not be a fifth caption line');
  var devicesBlock = pages.slice(pages.indexOf('var DEVICES'), pages.indexOf('var PEOPLE'));
  assert.ok(/id: 'freelancer'[\s\S]*job: 'pay'/.test(devicesBlock), 'freelancer device is pay');
  assert.ok(/id: 'sole'[\s\S]*job: 'balance'/.test(devicesBlock), 'sole device is balance');
  assert.ok(/id: 'mid'[\s\S]*job: 'approvals'/.test(devicesBlock), 'mid device is approvals');
  var deviceCss = css.slice(css.indexOf('.cbx-growth__device {'), css.indexOf('.cbx-growth__device.is-on {'));
  assert.ok(deviceCss.indexOf('visibility: hidden') !== -1, 'off-beat devices must leave the text tree');
  assert.ok(css.indexOf('.cbx-growth__device.is-on') !== -1, 'on-beat device must be a class, not a leftover opacity');
  var onDevice = css.slice(css.indexOf('.cbx-growth__device.is-on {'), css.indexOf('.cbx-growth__device[data-cbx-job="pay"]'));
  assert.ok(onDevice.indexOf('opacity: 1') !== -1, 'active device must paint');
  assert.ok(onDevice.indexOf('visibility: visible') !== -1, 'active device must be in the text tree');
  assert.ok(onDevice.indexOf('150ms linear 90ms') !== -1, 'incoming device must wait until outgoing has faded');
  var beatOn = css.slice(css.indexOf('.cbx-growth__beat.is-on {'), css.indexOf('.cbx-growth__stage {'));
  assert.ok(beatOn.indexOf('opacity: 1') !== -1, 'active copy must be fully on, not a muddy 0.5');
  assert.ok(beatOn.indexOf('visibility: visible') !== -1, 'active copy must be the only readable beat');
  assert.ok(beatOn.indexOf('150ms linear 90ms') !== -1, 'incoming copy must wait until outgoing has faded');
  var beatOff = css.slice(css.indexOf('.cbx-growth__beat {'), css.indexOf('.cbx-growth__beat.is-on {'));
  assert.ok(beatOff.indexOf('opacity 90ms linear') !== -1, 'outgoing copy must fade out first');
  assert.ok(css.indexOf('.cbx-growth__person.is-in') !== -1, 'cast in-play class missing');
  assert.ok(css.indexOf('.cbx-growth__person[data-from="0"]') !== -1, 'freelancer must be the default body');
  var personCss = css.slice(css.indexOf('.cbx-growth__person {'), css.indexOf('.cbx-growth__person.is-in'));
  assert.ok(personCss.indexOf('opacity: 0') !== -1, 'teammates must start hidden');
  assert.ok(personCss.indexOf('visibility: hidden') !== -1, 'teammates must not occupy the well before their beat');
  assert.ok(personCss.indexOf('opacity 260ms ease') !== -1, 'cast must fade in with the beat, not pop at opacity 1');
  assert.ok(pages.indexOf("id: 'mug'") !== -1, 'freelancer desk needs a mug');
  assert.ok(pages.indexOf("id: 'chair'") !== -1, 'mid-size desk needs a chair edge');
});

check('desk montage replaces the two-column copy/proof frame', function () {
  assert.ok(css.indexOf('.cbx-growth__copy') === -1, 'left essay column css must be gone');
  assert.ok(css.indexOf('.cbx-growth__frame') === -1, 'two-column frame css must be gone');
  assert.ok(css.indexOf('.cbx-growth__well') === -1, 'old proof well must be gone');
  assert.ok(pages.indexOf('cbx-growth__copy') === -1, 'left essay column markup must be gone');
  assert.ok(css.indexOf('.cbx-growth__desk') !== -1, 'desk surface missing');
  assert.ok(css.indexOf('.cbx-growth__apron') !== -1, 'desk apron / lower third missing');
  assert.ok(css.indexOf('.cbx-growth__note') !== -1, 'sticky notes missing');
  var deskCss = css.slice(css.indexOf('.cbx-growth__desk {'), css.indexOf('.cbx-growth__top {'));
  assert.ok(deskCss.indexOf('position: absolute') !== -1, 'desk must sit in the coffee room');
  var topCss = css.slice(css.indexOf('.cbx-growth__top {'), css.indexOf('.cbx-growth__apron {'));
  assert.ok(topCss.indexOf('#8a6244') !== -1, 'desk top must read as wood, not UI chrome');
  assert.ok(topCss.indexOf('repeating-linear-gradient') !== -1, 'desk top needs wood grain');
  assert.ok(css.indexOf('.cbx-growth__lip') !== -1, 'desk needs a front edge lip');
  assert.ok(css.indexOf('.cbx-prop__shadow') !== -1, 'props need contact shadows that fade with them');
  assert.ok(css.indexOf('cbx-growth__note--hard') !== -1 && css.indexOf('#e8a07a') !== -1, 'hard note must be the urgent paper');
  assert.ok(css.indexOf('cbx-growth__note--did') !== -1 && css.indexOf('#e6dfd0') !== -1, 'did note must be the calm paper');
  var notesCss = css.slice(css.indexOf('.cbx-growth__notes {'), css.indexOf('.cbx-growth__beat {'));
  assert.ok(notesCss.indexOf('position: absolute') !== -1, 'notes sit on the desk, not in a left column');
  assert.ok(notesCss.indexOf('display: grid') !== -1, 'beats must overlay without a fake min-height band');
  assert.ok(css.indexOf('min-height: 16.5rem') === -1, 'empty 16.5rem band between intro and stage must be gone');
  assert.ok(css.indexOf('min-height: 16rem') === -1, 'mobile must not reintroduce the empty beat well');
  var beatOff = css.slice(css.indexOf('.cbx-growth__beat {'), css.indexOf('.cbx-growth__beat.is-on {'));
  assert.ok(beatOff.indexOf('grid-area: 1 / 1') !== -1, 'beats must share one cell so notes sit on the desk');
  assert.ok(beatOff.indexOf('position: absolute') === -1, 'beats must not bottom-pin inside an empty well');
  var coffee = [30, 21, 16];
  var cream = [244, 239, 230];
  var yellow = [243, 226, 122];
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
  var introC = contrast(blend(cream, coffee, 0.86), coffee);
  var stageC = contrast(blend(cream, coffee, 0.78), coffee);
  var closeC = contrast(blend(cream, coffee, 0.7), coffee);
  var noteC = contrast(coffee, yellow);
  assert.ok(introC >= 7, 'intro cream must be readable on coffee (' + introC.toFixed(2) + ')');
  assert.ok(stageC >= 7, 'stage cream must be readable on coffee (' + stageC.toFixed(2) + ')');
  assert.ok(closeC >= 4.5, 'close chip must stay AA on coffee (' + closeC.toFixed(2) + ')');
  assert.ok(noteC >= 7, 'sticky notes must read coffee ink on paper (' + noteC.toFixed(2) + ')');
  assert.ok(introC > stageC && stageC > closeC, 'apron hierarchy must be intro > stage > close');
});

check('coffee curtain docks on a slight scroll', function () {
  var rise = pages.match(/var RISE_DUR = ([0-9.]+)/);
  assert.ok(rise && parseFloat(rise[1]) > 0 && parseFloat(rise[1]) <= 0.28,
    'RISE_DUR must be a short vh so a slight nudge docks the sheet');
  var scrub = pages.match(/scrub:\s*([0-9.]+)/);
  assert.ok(scrub && parseFloat(scrub[1]) > 0 && parseFloat(scrub[1]) <= 0.4,
    'curtain scrub lag must stay snappy');
  assert.ok(pages.indexOf("ease: 'power2.out'") !== -1, 'rise ease must front-load the dock');
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
