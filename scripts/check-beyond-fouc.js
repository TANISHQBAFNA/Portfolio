#!/usr/bin/env node
'use strict';

/**
 * Static guards for cream → Multiverse FOUC.
 * Fail if an unstyled stub, async skin inject, or raw home-tab can paint first.
 */

var fs = require('fs');
var path = require('path');

var root = path.resolve(__dirname, '..');
var failed = [];

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function assert(name, ok, detail) {
  if (ok) {
    console.log('ok  ' + name);
    return;
  }
  failed.push(name + (detail ? ' — ' + detail : ''));
  console.log('FAIL  ' + name + (detail ? ' — ' + detail : ''));
}

var index = read('index.html');
var stub = read('index-multiverse.html');
var beyondJs = read('assets/js/beyond-transition.js');
var landingJs = read('assets/js/landing.js');
var multiJs = read('assets/js/landing-multiverse.js');
var creamCss = read('assets/css/landing.css');
var multiCss = read('assets/css/landing-multiverse.css');

assert(
  'index.html Go Beyond points at index.html?beyond=1',
  /class="multiverse-tab"[^>]*href="index\.html\?beyond=1"/.test(index)
    || /href="index\.html\?beyond=1"[^>]*data-beyond-tab/.test(index),
  'Go Beyond still targets a stub page'
);

assert(
  'index.html does not link Go Beyond at index-multiverse.html',
  !/multiverse-tab[^>]{0,200}index-multiverse\.html/.test(index)
);

assert(
  'html starts with is-skin-pending so first paint is covered',
  /<html[^>]*class="[^"]*\bis-skin-pending\b/.test(index)
);

assert(
  'inline critical CSS hides .home-tab before skin arrives',
  /<style[\s\S]*?\.home-tab\s*\{[^}]*display\s*:\s*none/.test(index)
);

assert(
  'inline critical CSS paints coffee void while skin pending',
  /<style[\s\S]*?is-skin-pending[\s\S]*?#1E1510/.test(index)
);

assert(
  'skin link waits for onload and onerror before reveal',
  /skin\.(onload|addEventListener\(\s*['"]load['"])/.test(index)
    && /skin\.(onerror|addEventListener\(\s*['"]error['"])/.test(index)
);

assert(
  'beyond path keeps skin-pending until portal covers',
  /beyond/.test(index) && /is-skin-pending/.test(index)
    && /__tbSkinReady/.test(index)
);

assert(
  'beyond-transition.js defaults beyond URL to index.html',
  /key === 'beyond' \? 'index\.html'/.test(beyondJs),
  beyondJs.match(/key === 'beyond' \? '[^']+'/) && beyondJs.match(/key === 'beyond' \? '[^']+'/)[0]
);

assert(
  'beyond-transition.js does not default to index-multiverse.html',
  !/index-multiverse\.html/.test(beyondJs)
);

assert(
  'portal waits for skin ready before arrival',
  /__tbSkinReady|tb-skin-ready|whenSkinReady/.test(beyondJs)
);

assert(
  'is-beyond-enter is not applied before portal overlay exists',
  !/if \(isMultiverse && hasParam\('beyond'\)\) \{\s*html\.classList\.add\('is-beyond-enter'\)/.test(beyondJs)
);

assert(
  'runPhase or arrival removes is-skin-pending after overlay is active',
  /is-skin-pending/.test(beyondJs)
);

assert(
  'index-multiverse.html is a silent coffee-void redirect',
  stub.length < 2500
    && /location\.replace/.test(stub)
    && /beyond=1/.test(stub)
    && /#1E1510/.test(stub)
);

assert(
  'index-multiverse.html has no visible chrome or home-tab',
  !/home-tab/.test(stub)
    && !/Continue to the multiverse/i.test(stub)
    && !/class="curtain"/.test(stub)
    && !/landing-multiverse\.css/.test(stub)
);

assert(
  'landing-multiverse.js only boots on Multiverse',
  /classList\.contains\('is-multiverse'\)/.test(multiJs.slice(0, 400))
);

assert(
  'cream CSS hides .home-tab',
  /html\.is-light-home \.home-tab\s*\{[^}]*display:\s*none/.test(creamCss)
);

assert(
  'mobile cream dock cannot stay position:fixed',
  /@media \(max-width:\s*767px\)[\s\S]*html\.is-light-home \.work-cta[\s\S]{0,400}position:\s*relative\s*!important/.test(creamCss)
    && /@media \(max-width:\s*767px\)[\s\S]*html\.is-light-home \.edge-dock[\s\S]{0,400}position:\s*relative\s*!important/.test(creamCss)
);

assert(
  'mobile Multiverse dock cannot stay position:fixed',
  /@media \(max-width:\s*767px\)[\s\S]*html\.is-multiverse \.work-cta[\s\S]{0,400}position:\s*relative\s*!important/.test(multiCss)
    && /@media \(max-width:\s*767px\)[\s\S]*html\.is-multiverse \.edge-dock[\s\S]{0,400}position:\s*relative\s*!important/.test(multiCss)
);

assert(
  'cache query bumped for landing.css skin',
  /landing\.css\?v=aeo31/.test(index)
);

assert(
  'cache query bumped for landing-multiverse.css skin',
  /landing-multiverse\.css\?v=mv10/.test(index)
);

assert(
  'cache query bumped for beyond-transition assets',
  /beyond-transition\.css\?v=bx19/.test(index)
    && /beyond-transition\.js\?v=bx19/.test(index)
);

if (failed.length) {
  console.log('\n' + failed.length + ' failing');
  process.exit(1);
}

console.log('\nall fouc guards passed');
