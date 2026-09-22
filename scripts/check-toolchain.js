#!/usr/bin/env node
'use strict';

/**
 * Guards conservative Camila toolchain: zero-build static serve, vendored
 * GSAP 3.12.5 left in place, no Vite/Next (Iris motion walk is mid-flight).
 */
var fs = require('fs');
var path = require('path');
var assert = require('assert');

var ROOT = path.resolve(__dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

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

var pkg = JSON.parse(read('package.json'));
var index = read('index.html');
var mvIndex = read('index-multiverse.html');
var gsapVendor = read('assets/vendor/gsap.min.js').slice(0, 400);
var stVendor = read('assets/vendor/ScrollTrigger.min.js').slice(0, 400);

check('package.json is serve + check only (no Vite, no npm GSAP)', function () {
  assert.ok(/python3 -m http\.server/.test(pkg.scripts.dev), 'dev must be python static server');
  assert.ok(/python3 -m http\.server/.test(pkg.scripts.start), 'start must be python static server');
  assert.ok(pkg.scripts.check, 'missing check script');
  assert.ok(!pkg.scripts.build, 'no build step — zero-build site');
  assert.ok(!pkg.scripts.preview, 'no vite preview');
  assert.ok(!pkg.dependencies || !pkg.dependencies.gsap, 'do not npm-install gsap while film is mid-flight');
  assert.ok(!pkg.devDependencies || !pkg.devDependencies.vite, 'Vite skipped — injects type=module into index.html');
  assert.strictEqual(pkg.type, undefined, 'do not set type=module — check scripts use require()');
});

check('no framework rewrite; no Firebase; no Vite config', function () {
  assert.ok(!fs.existsSync(path.join(ROOT, 'vite.config.js')), 'vite.config.js must not exist');
  assert.ok(!fs.existsSync(path.join(ROOT, 'vite.config.mjs')), 'vite.config.mjs must not exist');
  assert.ok(!fs.existsSync(path.join(ROOT, 'next.config.js')), 'next.config.js must not exist');
  assert.ok(!fs.existsSync(path.join(ROOT, 'next.config.mjs')), 'next.config.mjs must not exist');
  assert.ok(!fs.existsSync(path.join(ROOT, 'astro.config.mjs')), 'astro.config.mjs must not exist');
  assert.ok(!fs.existsSync(path.join(ROOT, 'remix.config.js')), 'remix.config.js must not exist');
  assert.ok(!fs.existsSync(path.join(ROOT, 'firebase.json')), 'firebase.json must not exist');
});

check('pages still load local IIFE GSAP 3.12.5, not CDN/modules', function () {
  assert.ok(/GSAP 3\.12\.5/.test(gsapVendor), 'vendor gsap.min.js must stay 3.12.5 until Iris film is proven on a bump');
  assert.ok(/ScrollTrigger 3\.12\.5/.test(stVendor), 'vendor ScrollTrigger.min.js must stay 3.12.5');
  assert.ok(index.indexOf('assets/vendor/gsap.min.js') !== -1, 'index missing vendor GSAP');
  assert.ok(index.indexOf('assets/vendor/ScrollTrigger.min.js') !== -1, 'index missing vendor ScrollTrigger');
  assert.ok(mvIndex.indexOf('assets/vendor/gsap.min.js') !== -1, 'multiverse missing vendor GSAP');
  assert.ok(!/jsdelivr|unpkg|cdnjs|cdn\.jsdelivr/.test(index), 'index must not load GSAP from a CDN');
  assert.ok(!/jsdelivr|unpkg|cdnjs/.test(mvIndex), 'multiverse must not load GSAP from a CDN');
});

check('classic script tags (JSON-LD excluded) stay non-module', function () {
  function classicSrc(html) {
    var re = /<script\b([^>]*)>/gi;
    var match;
    while ((match = re.exec(html))) {
      var attrs = match[1];
      if (/type\s*=\s*["']application\/ld\+json["']/.test(attrs)) continue;
      if (/type\s*=\s*["']module["']/.test(attrs)) {
        throw new Error('found type=module script: ' + attrs.trim());
      }
    }
  }
  classicSrc(index);
  classicSrc(mvIndex);
  classicSrc(read('about.html'));
  classicSrc(read('contact.html'));
});

check('case-study and leaf URLs still sit at repo root', function () {
  assert.ok(index.indexOf('data-world="cbx300"') !== -1, 'CBX300 world missing from index');
  assert.ok(mvIndex.indexOf('data-world="cbx300"') !== -1, 'CBX300 world missing from multiverse');
  assert.ok(fs.existsSync(path.join(ROOT, 'assets/img/cbx300')), 'assets/img/cbx300 missing');
  assert.ok(fs.existsSync(path.join(ROOT, 'about.html')), 'about.html missing');
  assert.ok(fs.existsSync(path.join(ROOT, 'contact.html')), 'contact.html missing');
  assert.ok(fs.existsSync(path.join(ROOT, 'index-multiverse.html')), 'index-multiverse.html missing');
});

console.log(passed + ' passed, ' + failed + ' failed');
if (failed) process.exit(1);
