#!/usr/bin/env node
'use strict';

/**
 * Cream home must keep cream IrisMotion. Multiverse motion may only
 * replace it when html has is-multiverse.
 */
var fs = require('fs');
var path = require('path');
var vm = require('vm');
var assert = require('assert');

var ROOT = path.resolve(__dirname, '..');
var CREAM_MOTION = fs.readFileSync(path.join(ROOT, 'assets/js/iris-motion.js'), 'utf8');
var MV_MOTION = fs.readFileSync(path.join(ROOT, 'assets/js/iris-motion-multiverse.js'), 'utf8');
var MV_LANDING = fs.readFileSync(path.join(ROOT, 'assets/js/landing-multiverse.js'), 'utf8');
var INDEX = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

function makeWindow(htmlClass) {
  var classes = {};
  String(htmlClass || '').split(/\s+/).filter(Boolean).forEach(function (name) {
    classes[name] = true;
  });
  var listenerCount = 0;
  var timeouts = [];
  var emptyList = [];
  emptyList.forEach = Array.prototype.forEach;
  var classList = {
    contains: function (name) { return !!classes[name]; },
    add: function (name) { classes[name] = true; },
    remove: function (name) { delete classes[name]; },
    toggle: function (name, on) {
      if (on) classes[name] = true;
      else delete classes[name];
    }
  };
  var style = {
    setProperty: function () {},
    getPropertyValue: function () { return ''; }
  };
  var documentElement = { classList: classList, style: style };
  var document = {
    documentElement: documentElement,
    body: { classList: classList, style: style },
    readyState: 'complete',
    hidden: false,
    fonts: {
      load: function () { return Promise.resolve(); },
      ready: Promise.resolve()
    },
    querySelector: function () { return null; },
    querySelectorAll: function () { return emptyList; },
    getElementById: function () { return null; },
    addEventListener: function () { listenerCount += 1; },
    createElement: function () {
      return { className: '', setAttribute: function () {}, getAttribute: function () { return null; } };
    }
  };
  var windowObj = {
    document: document,
    location: { search: '' },
    matchMedia: function () {
      return { matches: false, addEventListener: function () {}, addListener: function () {} };
    },
    addEventListener: function () { listenerCount += 1; },
    setTimeout: function (fn, ms) {
      timeouts.push(ms);
      return timeouts.length;
    },
    clearTimeout: function () {},
    requestAnimationFrame: function () { return 1; },
    innerHeight: 800,
    innerWidth: 1280,
    scrollY: 0,
    scrollTo: function () {},
    getComputedStyle: function () {
      return { letterSpacing: '0', getPropertyValue: function () { return ''; } };
    },
    MutationObserver: function () {
      this.observe = function () {};
      this.disconnect = function () {};
    }
  };
  windowObj.window = windowObj;
  windowObj.global = windowObj;
  return { window: windowObj, document: document, listenerCount: function () { return listenerCount; } };
}

function runScripts(htmlClass, sources) {
  var env = makeWindow(htmlClass);
  var ctx = vm.createContext({
    window: env.window,
    document: env.document,
    global: env.window,
    WeakMap: WeakMap,
    Promise: Promise,
    Math: Math,
    Array: Array,
    String: String,
    Number: Number,
    Object: Object,
    parseFloat: parseFloat,
    parseInt: parseInt,
    setTimeout: env.window.setTimeout,
    clearTimeout: env.window.clearTimeout,
    requestAnimationFrame: env.window.requestAnimationFrame,
    MutationObserver: env.window.MutationObserver,
    location: env.window.location,
    console: console
  });
  sources.forEach(function (src) {
    vm.runInContext(src, ctx, { filename: 'script.js' });
  });
  return { iris: ctx.window.IrisMotion, listenerCount: env.listenerCount(), window: ctx.window };
}

var failed = 0;
function check(name, fn) {
  try {
    fn();
    console.log('ok  ' + name);
  } catch (err) {
    failed += 1;
    console.log('FAIL  ' + name);
    console.log('  ' + (err && err.message ? err.message : err));
  }
}

check('cream: Multiverse motion does not replace cream IrisMotion', function () {
  var result = runScripts('is-light-home', [CREAM_MOTION, MV_MOTION]);
  assert.ok(result.iris, 'IrisMotion missing');
  assert.equal(typeof result.iris.revealLanding, 'function');
  assert.equal(typeof result.iris.wireParticles, 'function');
  assert.equal(typeof result.iris.startGlitchLoop, 'undefined', 'startGlitchLoop leaked onto cream');
  assert.equal(typeof result.iris.burstGlitch, 'undefined', 'burstGlitch leaked onto cream');
  assert.equal(typeof result.iris.armGlitchTarget, 'undefined', 'armGlitchTarget leaked onto cream');
  assert.ok(!result.iris.NAME_SEQUENCE, 'Multiverse NAME_SEQUENCE leaked onto cream');
});

check('multiverse: IrisMotion exports glitch API', function () {
  var result = runScripts('is-multiverse', [CREAM_MOTION, MV_MOTION]);
  assert.ok(result.iris, 'IrisMotion missing');
  assert.equal(typeof result.iris.revealLanding, 'function');
  assert.equal(typeof result.iris.startGlitchLoop, 'function');
  assert.equal(typeof result.iris.burstGlitch, 'function');
  assert.equal(typeof result.iris.armGlitchTarget, 'function');
  assert.equal(typeof result.iris.pulseStudyCurtain, 'function');
  assert.equal(typeof result.iris.hitchCurtain, 'function');
  assert.ok(Array.isArray(result.iris.NAME_SEQUENCE));
});

check('cream: pulseStudyCurtain does not leak onto cream IrisMotion', function () {
  var result = runScripts('is-light-home', [CREAM_MOTION, MV_MOTION]);
  assert.equal(typeof result.iris.pulseStudyCurtain, 'undefined', 'pulseStudyCurtain leaked onto cream');
  assert.equal(typeof result.iris.hitchCurtain, 'undefined', 'hitchCurtain leaked onto cream');
});

check('cream: landing-multiverse.js does not boot', function () {
  var before = runScripts('is-light-home', []);
  var after = runScripts('is-light-home', [MV_LANDING]);
  assert.equal(after.listenerCount, before.listenerCount, 'landing-multiverse attached listeners on cream');
});

check('multiverse: landing-multiverse.js boots', function () {
  var after = runScripts('is-multiverse', [MV_LANDING]);
  assert.ok(after.listenerCount > 0, 'landing-multiverse did not attach listeners when is-multiverse');
});

function htmlScriptSrcTags(html) {
  return html.match(/^\s*<script\s+src=["'][^"']+["'][^>]*>/gm) || [];
}

check('index.html loads Multiverse motion only when is-multiverse', function () {
  var tags = htmlScriptSrcTags(INDEX);
  assert.ok(
    tags.every(function (tag) { return !/iris-motion-multiverse\.js/.test(tag); }),
    'iris-motion-multiverse.js still loads unconditionally'
  );
  assert.ok(
    /is-multiverse[\s\S]{0,400}iris-motion-multiverse\.js/.test(INDEX),
    'index.html does not load iris-motion-multiverse.js behind is-multiverse'
  );
});

check('index.html loads Multiverse landing only when is-multiverse', function () {
  var tags = htmlScriptSrcTags(INDEX);
  assert.ok(
    tags.every(function (tag) { return !/landing-multiverse\.js/.test(tag); }),
    'landing-multiverse.js still loads unconditionally'
  );
  assert.ok(
    /is-multiverse[\s\S]{0,400}landing-multiverse\.js/.test(INDEX),
    'index.html does not load landing-multiverse.js behind is-multiverse'
  );
});

if (failed) {
  console.log('\n' + failed + ' failed');
  process.exit(1);
}
console.log('\nall passed');
