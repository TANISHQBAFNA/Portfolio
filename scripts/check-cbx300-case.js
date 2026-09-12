#!/usr/bin/env node
'use strict';

/**
 * Guards CBX300 opened-case Phase 1 structure:
 * wired into ProjectStudy, 8 pages, brief captions, Infoviz grammar,
 * designed placeholders, free GSAP only, reduced-motion path, demo brand.
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
var brief = read('docs/case-study-cbx300-build-brief.md');

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

check('wires CBX300 into existing ProjectStudy router', function () {
  assert.ok(study.indexOf("template === 'cbx300'") !== -1, 'project-study missing cbx300 bind');
  assert.ok(study.indexOf('Cbx300Case.mount') !== -1, 'does not mount Cbx300Case');
  assert.ok(study.indexOf('CaseScrollKit.bind') !== -1, 'does not bind shared kit');
  assert.ok(landing.indexOf("studyTemplate: 'cbx300'") !== -1, 'landing does not set studyTemplate');
  assert.ok(index.indexOf('data-world="cbx300"') !== -1, 'index.html missing cbx300 world');
  assert.ok(mvIndex.indexOf('data-world="cbx300"') !== -1, 'index-multiverse.html missing cbx300 world');
});

check('eight pages cover through scale/close', function () {
  ['cover', 'ladder', 'roles', 'approvals', 'money', 'permissions', 'grammar', 'scale'].forEach(function (id) {
    assert.ok(pages.indexOf("id: '" + id + "'") !== -1, 'missing page ' + id);
  });
});

check('Infoviz grammar: numbered beats, claim first, close on finding', function () {
  ['01 · Ladder', '02 · Roles', '03 · Approvals', '04 · Money', '05 · Permissions', '06 · Grammar', '07 · Close'].forEach(function (beat) {
    assert.ok(pages.indexOf(beat) !== -1, 'missing beat ' + beat);
  });
  assert.ok(pages.indexOf('thread:') !== -1, 'missing continuing-question thread');
  assert.ok(pages.indexOf('finding: true') !== -1, 'scale is not a finding close');
  assert.ok(kit.indexOf('Claim first') !== -1 || kit.indexOf('autoAlpha: 1, y: 0') !== -1, 'kit does not keep claim readable first');
  assert.ok(kit.indexOf('data-focus-item') !== -1, 'kit missing progressive focus');
  assert.ok(kit.indexOf('is-stage') !== -1, 'kit missing claim-first viz stage overlay');
  assert.ok(css.indexOf('.case-viz.is-stage') !== -1, 'css missing pinned viz stage');
  assert.ok(css.indexOf('img[hidden]') !== -1, 'img hidden must beat display:block so alt does not leak');
});

check('captions from brief', function () {
  [
    'CBX300 — SME banking across web and mobile. 636 screens, one system.',
    'These are not five audiences. They are five stages of the same customer.',
    'The same layout has to work for a business with no accounts and a business with four.',
    'One person in a freelance business. Three people with three permission sets in a medium one.',
    'On both platforms, approval has a permanent address. It is never something you have to go looking for.',
    'The action is labelled with the number it will perform. No one approves a mystery quantity.',
    'On mobile the whole screen changes mode, and the actions sit in thumb reach.',
    'Three bad rows in a file of 128, surfaced before the approver signs rather than after.',
    '“Balance” is four different numbers to a business. Showing one of them would be a lie.',
    'Initiate, Verify, Inquire, Release, Authorize — for every function, scoped to specific accounts. Visible instead of remembered.',
    'The same screen serves one freelancer and a fourteen-person finance team.',
    'Every money flow ends the same three ways. Learn it once, trust it everywhere.',
    'Week one for every new customer. Each one offers the next action instead of apologising.',
    '259 web screens. 377 mobile screens. One grammar.'
  ].forEach(function (cap) {
    assert.ok(pages.indexOf(cap) !== -1, 'missing caption: ' + cap);
  });
});

check('Figma node IDs on slots', function () {
  ['39409:121739', '14430:56021', '29599:151564', '21058:88167', '36784:110703', '11906:24389', '39899:119009', '22789:130771'].forEach(function (node) {
    assert.ok(pages.indexOf(node) !== -1, 'missing node ' + node);
  });
  assert.ok(pages.indexOf('Exports pending') !== -1, 'missing designed pending label');
  assert.ok(pages.indexOf('Couldn’t load this frame') !== -1 || pages.indexOf("Couldn’t load this frame") !== -1, 'missing error copy');
});

check('Lisa Charlie demo only; no invented NPS/outcomes', function () {
  assert.ok(/demo brand/.test(pages), 'Lisa Charlie not labelled demo');
  assert.ok(!/\bNPS\b/.test(pages), 'invented NPS');
  assert.ok(!/time saved|time-saved/i.test(pages), 'invented time-saved');
  assert.ok(!/adoption rate/i.test(pages), 'invented adoption');
  assert.ok(pages.indexOf('Results stay blank until real numbers exist') !== -1, 'missing honest results line');
});

check('free GSAP + ScrollTrigger only; no Club plugins', function () {
  [kit, pages, study, index].forEach(function (src) {
    assert.ok(!/gsap\/SplitText|MorphSVGPlugin|gsap\/Flip|registerPlugin\(\s*Flip/.test(src), 'Club plugin reference found');
  });
  assert.ok(kit.indexOf('ScrollTrigger') !== -1, 'kit missing ScrollTrigger');
  assert.ok(kit.indexOf('prefers-reduced-motion') !== -1, 'kit missing reduced-motion');
  assert.ok(kit.indexOf('forceStatic') !== -1 || kit.indexOf('setupStatic') !== -1, 'kit missing static path');
  assert.ok(css.indexOf('prefers-reduced-motion') !== -1, 'css missing reduced-motion');
});

check('cream bank-calm; no glitch theatre on case pages', function () {
  assert.ok(css.indexOf('#f3f4f6') !== -1 || css.indexOf('#F3F4F6') !== -1, 'cover grey missing');
  assert.ok(!/@keyframes\s+.*glitch/i.test(css), 'glitch keyframes in case css');
  assert.ok(!/ben-day|benday|comic ink/i.test(css), 'multiverse skin in case css');
});

check('Infoviz locked in brief; grammar stolen not housing maps', function () {
  assert.ok(brief.indexOf('infoviz-cs5764.web.app') !== -1, 'brief missing Infoviz lock');
  assert.ok(!/Zillow|Falls Church|Malabar Hill|stamp-duty/.test(pages), 'copied Infoviz housing content');
});

check('asset swap path documented in module', function () {
  assert.ok(pages.indexOf('assets/img/cbx300/') !== -1, 'missing file root');
  assert.ok(pages.indexOf("src: ''") !== -1, 'slots should ship empty src until exports land');
});

console.log(passed + ' passed, ' + failed + ' failed');
if (failed) process.exit(1);
