#!/usr/bin/env node
'use strict';

/**
 * Guards the Camila toolchain: Vite MPA wrapper, vendored GSAP, no
 * Firebase, public asset URLs unchanged. Does not lock visual design.
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

check('package.json has Vite scripts and pinned GSAP', function () {
  assert.equal(pkg.scripts.dev, 'vite');
  assert.equal(pkg.scripts.build, 'node scripts/build-static.js');
  assert.equal(pkg.scripts.preview, 'vite preview');
  assert.ok(pkg.scripts.check, 'missing check script');
  assert.equal(pkg.dependencies.gsap, '3.15.0');
  assert.ok(pkg.devDependencies.vite, 'missing vite');
  assert.strictEqual(pkg.type, undefined, 'do not set type=module — check scripts use require()');
});

check('no framework rewrite; no Firebase hosting config', function () {
  assert.ok(!fs.existsSync(path.join(ROOT, 'next.config.js')), 'next.config.js must not exist');
  assert.ok(!fs.existsSync(path.join(ROOT, 'next.config.mjs')), 'next.config.mjs must not exist');
  assert.ok(!fs.existsSync(path.join(ROOT, 'astro.config.mjs')), 'astro.config.mjs must not exist');
  assert.ok(!fs.existsSync(path.join(ROOT, 'remix.config.js')), 'remix.config.js must not exist');
  assert.ok(!fs.existsSync(path.join(ROOT, 'firebase.json')), 'firebase.json must not exist');
});

check('pages still load local IIFE GSAP 3.15, not CDN/modules', function () {
  assert.ok(/GSAP 3\.15/.test(gsapVendor), 'vendor gsap.min.js is not 3.15');
  assert.ok(/ScrollTrigger 3\.15/.test(stVendor), 'vendor ScrollTrigger.min.js is not 3.15');
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

check('vite config stays MPA and does not relocate assets/', function () {
  var vite = read('vite.config.mjs');
  assert.ok(vite.indexOf("appType: 'mpa'") !== -1, 'vite must be MPA (no SPA fallback to index.html)');
  assert.ok(vite.indexOf('publicDir: false') !== -1, 'do not move assets into public/');
  assert.ok(vite.indexOf('outDir: \'dist\'') !== -1, 'preview expects dist/');
});

console.log(passed + ' passed, ' + failed + ' failed');
if (failed) process.exit(1);
