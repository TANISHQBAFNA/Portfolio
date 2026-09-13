#!/usr/bin/env node
'use strict';

/**
 * Viewport lock: layout uses the browser pane, never device screen.*.
 */
var fs = require('fs');
var path = require('path');
var vm = require('vm');
var assert = require('assert');

var ROOT = path.resolve(__dirname, '..');
var SRC = fs.readFileSync(path.join(ROOT, 'assets/js/viewport.js'), 'utf8');

var failed = 0;
function check(name, fn) {
  try {
    fn();
    console.log('ok  - ' + name);
  } catch (err) {
    failed += 1;
    console.log('fail - ' + name);
    console.log('     ' + (err && err.message ? err.message : err));
  }
}

function runViewport(opts) {
  opts = opts || {};
  var props = {};
  var screenHits = 0;
  var screen = {
    get width() { screenHits += 1; return 2048; },
    get height() { screenHits += 1; return 2732; },
    get availWidth() { screenHits += 1; return 2048; },
    get availHeight() { screenHits += 1; return 2732; }
  };
  var visual = opts.visual || {
    height: 900,
    width: 1180,
    offsetTop: 12,
    scale: 1,
    addEventListener: function () {}
  };
  var root = {
    clientHeight: opts.clientHeight || 940,
    clientWidth: opts.clientWidth || 1180,
    style: {
      setProperty: function (name, value) { props[name] = value; }
    },
    dispatchEvent: function () {}
  };
  var listeners = {};
  var windowObj = {
    visualViewport: opts.noVisual ? undefined : visual,
    innerHeight: opts.innerHeight || 980,
    innerWidth: opts.innerWidth || 1200,
    screen: screen,
    requestAnimationFrame: function (fn) { fn(); return 1; },
    setTimeout: function (fn) { fn(); return 1; },
    addEventListener: function (type, fn) {
      listeners[type] = listeners[type] || [];
      listeners[type].push(fn);
    },
    CustomEvent: function (type, init) {
      this.type = type;
      this.detail = init && init.detail;
    }
  };
  var document = { documentElement: root };
  windowObj.document = document;
  windowObj.window = windowObj;
  vm.runInNewContext(SRC, {
    window: windowObj,
    document: document,
    CustomEvent: windowObj.CustomEvent
  }, { filename: 'viewport.js' });
  return {
    props: props,
    layout: windowObj.layoutViewport,
    screenHits: screenHits
  };
}

check('sets --vvh/--vvw from visualViewport, not screen', function () {
  var result = runViewport();
  assert.ok(result.layout, 'layoutViewport missing');
  assert.equal(result.props['--vvh'], '900px');
  assert.equal(result.props['--vvw'], '1180px');
  assert.equal(result.props['--vv-offset-top'], '12px');
  assert.equal(result.layout.height(), 900);
  assert.equal(result.screenHits, 0, 'screen.* must not be read');
});

check('falls back to clientHeight when visualViewport is missing', function () {
  var result = runViewport({ noVisual: true, clientHeight: 844, clientWidth: 390 });
  assert.equal(result.props['--vvh'], '844px');
  assert.equal(result.props['--vvw'], '390px');
  assert.equal(result.screenHits, 0);
});

check('pinch-zoom keeps the unzoomed layout pane', function () {
  var result = runViewport({
    visual: {
      height: 400,
      width: 500,
      offsetTop: 80,
      scale: 2,
      addEventListener: function () {}
    },
    clientHeight: 844,
    clientWidth: 390
  });
  assert.equal(result.props['--vvh'], '844px');
  assert.equal(result.props['--vvw'], '390px');
  assert.equal(result.screenHits, 0);
});

if (failed) {
  console.log('\n' + failed + ' failed');
  process.exit(1);
}
console.log('\nall passed');
