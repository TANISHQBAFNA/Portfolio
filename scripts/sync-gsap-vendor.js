#!/usr/bin/env node
'use strict';

/**
 * Copy GSAP IIFE builds from node_modules into assets/vendor so the
 * static site keeps <script src="assets/vendor/…"> tags (no ESM rewrite).
 */
var fs = require('fs');
var path = require('path');

var ROOT = path.resolve(__dirname, '..');
var SRC = path.join(ROOT, 'node_modules', 'gsap', 'dist');
var DEST = path.join(ROOT, 'assets', 'vendor');
var FILES = ['gsap.min.js', 'ScrollTrigger.min.js'];

if (!fs.existsSync(SRC)) {
  console.error('gsap is not installed. Run npm install first.');
  process.exit(1);
}

fs.mkdirSync(DEST, { recursive: true });

FILES.forEach(function (name) {
  var from = path.join(SRC, name);
  if (!fs.existsSync(from)) {
    console.error('missing ' + from);
    process.exit(1);
  }
  fs.copyFileSync(from, path.join(DEST, name));
  console.log('copied ' + name + ' -> assets/vendor/' + name);
});
