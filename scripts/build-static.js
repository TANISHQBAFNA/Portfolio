#!/usr/bin/env node
'use strict';

/**
 * Faithful static copy into dist/. Public URLs stay identical to repo root
 * (`index.html`, `about.html`, `assets/…`, CBX300 images). Vite Rollup is
 * not used — it would hash files and miss string image paths in JS.
 */
var fs = require('fs');
var path = require('path');
var assert = require('assert');

var ROOT = path.resolve(__dirname, '..');
var DIST = path.join(ROOT, 'dist');

var ROOT_STATIC = [
  'robots.txt',
  'sitemap.xml',
  'llms.txt',
  '92733d8cd52c4c378948e6b9b0aaad21.txt'
];

function copyFile(rel) {
  var from = path.join(ROOT, rel);
  var to = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
}

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

fs.readdirSync(ROOT).forEach(function (name) {
  if (!name.endsWith('.html')) return;
  copyFile(name);
});

fs.cpSync(path.join(ROOT, 'assets'), path.join(DIST, 'assets'), { recursive: true });

ROOT_STATIC.forEach(function (rel) {
  if (fs.existsSync(path.join(ROOT, rel))) copyFile(rel);
});

var index = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
assert.ok(index.indexOf('assets/vendor/gsap.min.js') !== -1, 'dist index lost GSAP path');
assert.ok(index.indexOf('assets/js/cbx300-case.js') !== -1, 'dist index lost CBX300 script');
assert.ok(fs.existsSync(path.join(DIST, 'assets/img/cbx300')), 'dist missing assets/img/cbx300');
assert.ok(fs.existsSync(path.join(DIST, 'index-multiverse.html')), 'dist missing index-multiverse.html');
assert.ok(fs.existsSync(path.join(DIST, 'about.html')), 'dist missing about.html');
assert.ok(fs.existsSync(path.join(DIST, 'contact.html')), 'dist missing contact.html');
assert.ok(fs.existsSync(path.join(DIST, '404.html')), 'dist missing 404.html');
assert.ok(fs.existsSync(path.join(DIST, 'robots.txt')), 'dist missing robots.txt');

console.log('built dist/ (faithful static copy)');
