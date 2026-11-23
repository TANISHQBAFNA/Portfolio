#!/usr/bin/env node
'use strict';

/* Sequential mouse-wheel walk. No scrollTo, no injected patches.
   Asserts 01→02→03→04→05→06→end stay in that order and the study
   does not close before the curtain. */
var fs = require('fs');
var path = require('path');
var puppeteer = require('/tmp/qa-s03/node_modules/puppeteer-core');

var CHROME = process.env.CHROME || '/usr/local/bin/google-chrome';
var ORIGIN = process.env.CBX_ORIGIN || 'http://127.0.0.1:8080';
var ART = process.env.CBX_ART || '/opt/cursor/artifacts/sme-qa2';
var ONLY = process.env.CBX_ONLY || '';

var THEMES = [
  { id: 'light', q: 'theme=light&open=sme' },
  { id: 'dark', q: 'theme=dark&open=sme' },
  { id: 'print', q: 'beyond=1&theme=light&open=sme' },
  { id: 'mvdark', q: 'beyond=1&theme=dark&open=sme' }
];
var SIZES = [
  { w: 1440, h: 900 },
  { w: 390, h: 844 }
];

var failed = 0;
var passed = 0;

function log(ok, name, extra) {
  if (ok) passed += 1;
  else failed += 1;
  console.log((ok ? 'ok  - ' : 'fail - ') + name + (extra ? '  ' + extra : ''));
}

function sleep(ms) {
  return new Promise(function (resolve) { setTimeout(resolve, ms); });
}

function shotName(label, key) {
  return path.join(ART, label + '-' + key + '.jpg');
}

async function readState(page) {
  return page.evaluate(function () {
    var html = document.documentElement;
    var y = window.scrollY || 0;
    var max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    var pins = [];
    if (window.ScrollTrigger) {
      window.ScrollTrigger.getAll().forEach(function (st) {
        var t = st.trigger;
        if (!t || !st.pin) return;
        var id = t.getAttribute('data-cbx-section') || (t.hasAttribute('data-cbx-end') ? 'end' : '');
        if (!id && t.hasAttribute('data-cbx-stage')) id = '02';
        if (!id) return;
        pins.push({ id: id, start: Math.round(st.start), end: Math.round(st.end), on: !!st.isActive });
      });
    }
    var seen = {};
    pins = pins.filter(function (p) {
      var k = p.id + ':' + p.start;
      if (seen[k]) return false;
      seen[k] = 1;
      return true;
    });
    pins.sort(function (a, b) { return a.start - b.start; });
    function rangeOf(node) {
      var spacer = node.parentElement && node.parentElement.classList && node.parentElement.classList.contains('pin-spacer')
        ? node.parentElement
        : node;
      var top = spacer.getBoundingClientRect().top + window.scrollY;
      return { top: top, bot: top + spacer.offsetHeight };
    }
    var here = '';
    var stage = document.querySelector('[data-cbx-stage]');
    if (stage) {
      var band = rangeOf(stage);
      if (y >= band.top - 4 && y < band.bot - 4) here = (y - band.top) < window.innerHeight * 0.9 ? '01' : '02';
    }
    var nodes = document.querySelectorAll('[data-cbx-section], [data-cbx-end]');
    Array.prototype.forEach.call(nodes, function (node) {
      var id = node.getAttribute('data-cbx-section') || 'end';
      if (id === '01' || id === '02') return;
      var band = rangeOf(node);
      if (y >= band.top - 4 && y < band.bot - 4) here = id;
    });
    var open = html.classList.contains('is-study') || html.classList.contains('is-study-page');
    var covered = !!document.querySelector('.cbx-growth.is-covered');
    var why = document.querySelector('.cbx-ans__why li');
    var pd = document.querySelector('.cbx-ans__pd');
    var whyPx = why ? parseFloat(getComputedStyle(why).fontSize) : 0;
    var pdPx = pd ? parseFloat(getComputedStyle(pd).fontSize) : 0;
    return {
      y: Math.round(y),
      max: Math.round(max),
      here: here,
      open: open,
      pins: pins,
      covered: covered,
      whyPx: whyPx,
      pdPx: pdPx,
      classes: html.className
    };
  });
}

async function walkOne(browser, theme, size, reduce) {
  var label = theme.id + '-' + size.w + (reduce ? '-reduce' : '');
  if (ONLY && ONLY.indexOf(label) === -1) return;
  var page = await browser.newPage();
  await page.setViewport({ width: size.w, height: size.h, deviceScaleFactor: 1 });
  if (reduce) {
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  }
  var url = ORIGIN + '/index.html?' + theme.q;
  var frames = [];
  var record = !reduce && theme.id === 'light' && size.w === 1440;
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    var ready = false;
    var i;
    for (i = 0; i < 40; i += 1) {
      ready = await page.evaluate(function () {
        var end = document.querySelector('[data-cbx-end]');
        var s03 = document.querySelector('[data-cbx-answers]');
        return !!(end && s03 && s03.dataset && s03.dataset.ready === '1' && window.ScrollTrigger);
      });
      if (ready) break;
      await sleep(250);
    }
    log(ready, label + ' mounts', url);
    if (!ready) {
      await page.screenshot({ path: shotName(label, 'not-ready'), type: 'jpeg', quality: 60 });
      await page.close();
      return;
    }
    await sleep(400);
    var state = await readState(page);
    var starts = state.pins.map(function (p) { return p.id + '@' + p.start; }).join(' ');
    var ordered = true;
    var prev = -1;
    state.pins.forEach(function (p) {
      if (p.start < prev) ordered = false;
      prev = p.start;
    });
    var ids = state.pins.map(function (p) { return p.id; });
    var expect = reduce ? ['02'] : ['02', '03', '04', '05', '06', 'end'];
    var missing = expect.filter(function (id) { return ids.indexOf(id) === -1; });
    var extraPins = reduce && ids.some(function (id) { return id !== '02'; });
    log(ordered && !missing.length && !extraPins, label + ' pin order', starts + (missing.length ? ' missing ' + missing.join(',') : '') + (reduce ? ' (later chapters stay in flow)' : ''));
    log(state.whyPx >= 22 && state.pdPx >= 22, label + ' copy size', 'why ' + state.whyPx + ' does ' + state.pdPx);

    await page.mouse.move(Math.round(size.w / 2), Math.round(size.h / 2));
    var seen = [];
    var last = '';
    var closedEarly = false;
    var stuck = 0;
    var prevY = -1;
    var shotAt = {};
    var t0 = Date.now();
    var steps = 0;
    var maxSteps = reduce ? 500 : 900;
    for (steps = 0; steps < maxSteps; steps += 1) {
      state = await readState(page);
      if (state.here && state.here !== last) {
        seen.push(state.here + '@' + state.y);
        last = state.here;
        if (!shotAt[state.here]) {
          shotAt[state.here] = 1;
          await sleep(180);
          await page.screenshot({ path: shotName(label, state.here), type: 'jpeg', quality: 70 });
        }
      }
      if (!state.open && state.y > 800 && state.here !== 'end' && seen.join(' ').indexOf('end@') === -1) {
        closedEarly = true;
        await page.screenshot({ path: shotName(label, 'closed-early'), type: 'jpeg', quality: 60 });
        break;
      }
      if (state.max > 0 && state.y >= state.max - 40) {
        if (!shotAt.end) {
          await page.screenshot({ path: shotName(label, 'end'), type: 'jpeg', quality: 70 });
        }
        break;
      }
      if (record && Date.now() - t0 < 30000) {
        frames.push(await page.screenshot({ type: 'jpeg', quality: 50 }));
      }
      var delta = reduce ? 280 : (state.here === '02' || state.here === '01' || !state.here ? 140 : 220);
      await page.mouse.wheel({ deltaY: delta });
      await sleep(state.here === '02' ? 140 : 60);
      if (state.y === prevY) stuck += 1;
      else stuck = 0;
      prevY = state.y;
      if (stuck > 18) {
        await sleep(500);
        stuck = 0;
      }
    }
    var need = ['02', '03', '04', '05', '06', 'end'];
    var cursor = 0;
    seen.forEach(function (mark) {
      var id = mark.split('@')[0];
      if (id === need[cursor]) cursor += 1;
    });
    var reached = cursor === need.length && !closedEarly;
    log(reached, label + ' wheel order', seen.join(' > ') + (closedEarly ? ' CLOSED EARLY' : ''));

    if (reduce) {
      var overlap = await page.evaluate(function () {
        var steps = Array.prototype.slice.call(document.querySelectorAll('.cbx-ans__step'));
        var boxes = steps.map(function (el) { return el.getBoundingClientRect(); }).filter(function (r) {
          return r.width > 8 && r.height > 8;
        });
        var hits = 0;
        var i;
        var j;
        for (i = 0; i < boxes.length; i += 1) {
          for (j = i + 1; j < boxes.length; j += 1) {
            var a = boxes[i];
            var b = boxes[j];
            var iw = Math.min(a.right, b.right) - Math.max(a.left, b.left);
            var ih = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
            if (iw > 8 && ih > 8) hits += 1;
          }
        }
        var text = (document.querySelector('[data-cbx-answers]') || {}).innerText || '';
        var trust = (document.querySelector('[data-cbx-trust]') || {}).innerText || '';
        return {
          hits: hits,
          steps: boxes.length,
          hasWorry: text.indexOf('?') !== -1,
          hasTrust: trust.length > 40
        };
      });
      log(overlap.hits === 0 && overlap.steps >= 8 && overlap.hasWorry && overlap.hasTrust, label + ' reduced story', JSON.stringify(overlap));
    }
  } catch (err) {
    log(false, label + ' walk', err && err.message ? err.message : String(err));
  }
  if (frames.length > 20) {
    var dir = path.join(ART, 'frames');
    fs.mkdirSync(dir, { recursive: true });
    frames.forEach(function (buf, n) {
      fs.writeFileSync(path.join(dir, 'f' + String(n).padStart(4, '0') + '.jpg'), buf);
    });
    console.log('frames ' + frames.length);
  }
  await page.close();
}

async function main() {
  fs.mkdirSync(ART, { recursive: true });
  var browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });
  var t;
  var s;
  for (t = 0; t < THEMES.length; t += 1) {
    for (s = 0; s < SIZES.length; s += 1) {
      await walkOne(browser, THEMES[t], SIZES[s], false);
    }
  }
  for (t = 0; t < THEMES.length; t += 1) {
    for (s = 0; s < SIZES.length; s += 1) {
      await walkOne(browser, THEMES[t], SIZES[s], true);
    }
  }
  await browser.close();
  console.log(passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
}

main().catch(function (err) {
  console.error(err);
  process.exit(1);
});
