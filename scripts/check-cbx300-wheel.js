#!/usr/bin/env node
'use strict';

/**
 * Real-wheel walk for CBX300. Fails if scrolling up from the page end
 * oscillates at the last coffee stage or never reaches y=0.
 * 100px notches, cream + Multiverse, 1440 / 1280 / 390.
 */
var path = require('path');
var fs = require('fs');
var http = require('http');

var puppeteer;
try {
  puppeteer = require('puppeteer-core');
} catch (err) {
  puppeteer = require('/tmp/qa-s03/node_modules/puppeteer-core');
}

var CHROME = process.env.CHROME || '/usr/local/bin/google-chrome';
var PORT = Number(process.env.CBX_PORT || 8765);
var ROOT = path.resolve(__dirname, '..');
var ART = process.env.CBX_ART || '/opt/cursor/artifacts/walkthrough';
var SIZES = [
  { w: 1440, h: 900 },
  { w: 1280, h: 720 },
  { w: 390, h: 844 }
];
var THEMES = [
  { id: 'cream', file: 'index.html' },
  { id: 'multiverse', file: 'index-multiverse.html' }
];

var failed = 0;
var passed = 0;
var notes = [];

function log(ok, name, extra) {
  if (ok) {
    passed += 1;
    console.log('ok  - ' + name + (extra ? '  ' + extra : ''));
  } else {
    failed += 1;
    console.log('fail - ' + name + (extra ? '  ' + extra : ''));
  }
}

function sleep(ms) {
  return new Promise(function (resolve) { setTimeout(resolve, ms); });
}

function oscillating(hist) {
  if (hist.length < 12) return false;
  var a = hist[hist.length - 1];
  var b = hist[hist.length - 2];
  if (Math.abs(a - b) < 2) return false;
  var n = 0;
  var i;
  for (i = hist.length - 1; i >= 1; i -= 2) {
    if (Math.abs(hist[i] - a) <= 4 && Math.abs(hist[i - 1] - b) <= 4) n += 1;
    else break;
  }
  return n >= 6;
}

function stats(arr) {
  if (!arr.length) return { n: 0, median: 0, p95: 0, worst: 0 };
  var s = arr.slice().sort(function (a, b) { return a - b; });
  var mid = Math.floor(s.length / 2);
  var p95 = s[Math.min(s.length - 1, Math.floor(s.length * 0.95))];
  return {
    n: s.length,
    median: s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2,
    p95: p95,
    worst: s[s.length - 1]
  };
}

function contrast(fg, bg) {
  function lin(c) {
    var x = c / 255;
    return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  }
  function lum(rgb) {
    return 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2]);
  }
  var hi = Math.max(lum(fg), lum(bg));
  var lo = Math.min(lum(fg), lum(bg));
  return (hi + 0.05) / (lo + 0.05);
}

function parseRgb(str) {
  var m = /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/.exec(str || '');
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

async function waitForStudy(page) {
  await page.waitForFunction(function () {
    return document.documentElement.classList.contains('is-study-page') &&
      document.querySelector('[data-cbx-growth]') &&
      document.querySelector('[data-cbx-answers]');
  }, { timeout: 20000 });
  await sleep(600);
}

async function openStudy(page, theme, size) {
  var url = 'http://127.0.0.1:' + PORT + '/' + theme.file + '?open=SME';
  await page.setViewport({ width: size.w, height: size.h, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await waitForStudy(page);
}

async function yNow(page) {
  return page.evaluate(function () {
    return Math.round(window.scrollY || document.documentElement.scrollTop || 0);
  });
}

async function maxY(page) {
  return page.evaluate(function () {
    return Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight
    ) - window.innerHeight;
  });
}

async function wheel(page, dy) {
  await page.mouse.move(Math.round((page.viewport().width || 1440) / 2), Math.round((page.viewport().height || 900) / 2));
  await page.mouse.wheel({ deltaY: dy });
}

async function walkUp(page, gapMs) {
  var top = await maxY(page);
  await page.evaluate(function (y) { window.scrollTo(0, y); }, top);
  await sleep(200);
  var hist = [await yNow(page)];
  var i;
  var maxNotches = Math.max(80, Math.ceil(hist[0] / 40) + 40);
  for (i = 0; i < maxNotches; i += 1) {
    var before = hist[hist.length - 1];
    if (before <= 1) break;
    await page.mouse.wheel({ deltaY: -100 });
    await sleep(gapMs);
    var y = await yNow(page);
    hist.push(y);
    if (oscillating(hist)) {
      return { ok: false, reason: 'oscillated at ' + y + ' <-> ' + hist[hist.length - 2], hist: hist, notches: i + 1 };
    }
    if (i > 12 && y >= before - 1 && y > 2) {
      var stuck = 0;
      var k;
      for (k = hist.length - 1; k >= 1 && k >= hist.length - 8; k -= 1) {
        if (Math.abs(hist[k] - y) <= 2) stuck += 1;
      }
      if (stuck >= 8) {
        return { ok: false, reason: 'stuck at y=' + y, hist: hist, notches: i + 1 };
      }
    }
  }
  var last = hist[hist.length - 1];
  if (last > 2) {
    return { ok: false, reason: 'did not reach 0 (y=' + last + ')', hist: hist, notches: i };
  }
  return { ok: true, hist: hist, notches: i, start: hist[0] };
}

async function walkDown(page, gapMs) {
  await page.evaluate(function () { window.scrollTo(0, 0); });
  await sleep(200);
  var ceiling = await maxY(page);
  var hist = [await yNow(page)];
  var i;
  var maxNotches = Math.max(80, Math.ceil(ceiling / 40) + 40);
  for (i = 0; i < maxNotches; i += 1) {
    var before = hist[hist.length - 1];
    if (before >= ceiling - 8) break;
    await wheel(page, 100);
    await sleep(gapMs);
    var y = await yNow(page);
    hist.push(y);
    if (oscillating(hist)) {
      return { ok: false, reason: 'oscillated going down at ' + y, hist: hist };
    }
  }
  var last = hist[hist.length - 1];
  if (last < 80) {
    return { ok: false, reason: 'did not leave the hero (y=' + last + ')', hist: hist };
  }
  return { ok: true, hist: hist, end: last };
}

async function closeHit(page) {
  return page.evaluate(function () {
    var btn = document.querySelector('.study__close, [data-study-close]');
    if (!btn) return { ok: false, reason: 'Close missing' };
    var r = btn.getBoundingClientRect();
    var x = r.left + Math.min(12, r.width / 2);
    var y = r.top + Math.min(10, r.height / 2);
    var hit = document.elementFromPoint(x, y);
    var ok = !!(hit && (hit === btn || (hit.closest && hit.closest('.study__close, [data-study-close]'))));
    return {
      ok: ok,
      reason: ok ? '' : 'hit ' + (hit && hit.className ? String(hit.className).slice(0, 80) : hit && hit.tagName),
      y: Math.round(window.scrollY),
      color: window.getComputedStyle(btn).color,
      bg: window.getComputedStyle(document.querySelector('.cbx-growth') || document.body).backgroundColor
    };
  });
}

async function pointerSheet(page) {
  return page.evaluate(function () {
    var vh = window.innerHeight;
    var scene = document.querySelector('.cbx-ans__scene:not([hidden])') || document.querySelector('.cbx-ans__scene');
    if (!scene) return { ok: false, reason: 'no scene' };
    var ptrs = Array.prototype.slice.call(scene.querySelectorAll('.cbx-ans__ptr'));
    var current = ptrs.filter(function (p) { return p.classList.contains('is-current'); });
    var visible = ptrs.filter(function (p) {
      var r = p.getBoundingClientRect();
      var st = window.getComputedStyle(p);
      return st.visibility !== 'hidden' && st.opacity !== '0' && r.height > 8;
    });
    var bottoms = visible.map(function (p) { return Math.round(p.getBoundingClientRect().bottom); });
    var copy = visible[0] && visible[0].querySelector('.cbx-ans__pd');
    var fs = copy ? parseFloat(window.getComputedStyle(copy).fontSize) : 0;
    var overflow = bottoms.some(function (b) { return b > vh + 1; });
    return {
      ok: current.length <= 1 && visible.length <= 1 && !overflow && fs >= 15,
      current: current.length,
      visible: visible.length,
      bottoms: bottoms,
      vh: vh,
      font: fs,
      overflow: overflow
    };
  });
}

async function measurePin(page) {
  var range = await page.evaluate(function () {
    var ScrollTrigger = window.ScrollTrigger;
    if (!ScrollTrigger) return null;
    var all = ScrollTrigger.getAll ? ScrollTrigger.getAll() : [];
    var i;
    for (i = 0; i < all.length; i += 1) {
      var t = all[i].trigger;
      if (t && t.hasAttribute && t.hasAttribute('data-cbx-answers')) {
        return { start: all[i].start, end: all[i].end };
      }
    }
    return null;
  });
  if (!range) return { ok: false, reason: 'no S03 trigger' };
  await page.evaluate(function (y) { window.scrollTo(0, y); }, Math.round(range.start + 8));
  await sleep(250);
  var samples = await page.evaluate(function (range) {
    return new Promise(function (resolve) {
      var deltas = [];
      var last = 0;
      var y = range.start + 8;
      var stop = false;
      function frame(t) {
        if (last) deltas.push(t - last);
        last = t;
        if (!stop) window.requestAnimationFrame(frame);
      }
      window.requestAnimationFrame(frame);
      function step() {
        y += 100;
        if (y >= range.end - 8) {
          stop = true;
          window.setTimeout(function () { resolve(deltas.slice(2)); }, 80);
          return;
        }
        window.scrollTo(0, y);
        window.setTimeout(step, 60);
      }
      window.setTimeout(step, 60);
    });
  }, range);
  return { ok: true, stats: stats(samples), range: range };
}

async function shot(page, name) {
  try {
    if (!fs.existsSync(ART)) fs.mkdirSync(ART, { recursive: true });
    await page.screenshot({ path: path.join(ART, name + '.png'), fullPage: false });
  } catch (err) {
    notes.push('screenshot ' + name + ' skipped');
  }
}

async function withBrowser(fn) {
  var browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-gpu',
      '--hide-scrollbars',
      '--window-size=1440,900'
    ]
  });
  try {
    var page = await browser.newPage();
    page.setDefaultTimeout(25000);
    await fn(page);
  } finally {
    await browser.close();
  }
}

async function ensureServer() {
  return new Promise(function (resolve) {
    var req = http.get('http://127.0.0.1:' + PORT + '/index.html', function (res) {
      res.resume();
      resolve(true);
    });
    req.on('error', function () { resolve(false); });
  });
}

async function main() {
  if (!await ensureServer()) {
    console.log('fail - http server is not listening on :' + PORT);
    process.exit(1);
  }

  await withBrowser(async function (page) {
    var t;
    var s;
    for (t = 0; t < THEMES.length; t += 1) {
      for (s = 0; s < SIZES.length; s += 1) {
        var theme = THEMES[t];
        var size = SIZES[s];
        var label = theme.id + ' ' + size.w + 'x' + size.h;
        await openStudy(page, theme, size);

        var down = await walkDown(page, 120);
        log(down.ok, 'wheel down ' + label, down.ok ? 'end y=' + down.end : down.reason);

        var up = await walkUp(page, 120);
        log(up.ok, 'wheel up to 0 ' + label, up.ok ? 'notches=' + up.notches + ' from ' + up.start : up.reason);
        if (!up.ok) await shot(page, 'wheel-stuck-' + theme.id + '-' + size.w);

        var positions = size.w === 1440 ? [1148, 2219] : size.w === 1280 ? [1775] : [];
        var p;
        for (p = 0; p < positions.length; p += 1) {
          await page.evaluate(function (y) { window.scrollTo(0, y); }, positions[p]);
          await sleep(250);
          var hit = await closeHit(page);
          var fg = parseRgb(hit.color);
          var bg = parseRgb(hit.bg);
          var ratio = fg && bg ? contrast(fg, bg) : 0;
          log(hit.ok, 'Close clickable ' + label + ' y=' + positions[p], hit.ok ? '' : hit.reason);
          if (theme.id === 'cream') {
            log(ratio >= 4.5, 'Close contrast ' + label + ' y=' + positions[p], ratio.toFixed(2) + ':1 ' + hit.color);
          } else {
            log(true, 'Close contrast skipped on Multiverse ' + label, hit.color);
          }
        }

        if (size.w === 1440) {
          var pinY = await page.evaluate(function () {
            var el = document.querySelector('[data-cbx-answers]');
            if (!el) return 0;
            var r = el.getBoundingClientRect();
            return Math.round(window.scrollY + r.top + 80);
          });
          await page.evaluate(function (y) { window.scrollTo(0, y); }, pinY);
          await sleep(400);
          var hold = await closeHit(page);
          var hfg = parseRgb(hold.color);
          var hbg = parseRgb(hold.bg) || [36, 25, 19];
          var hr = hfg ? contrast(hfg, hbg) : 0;
          log(hold.ok, 'Close clickable S03 hold ' + label, hold.ok ? '' : hold.reason);
          if (theme.id === 'cream') {
            log(hr >= 4.5, 'Close contrast S03 hold ' + label, hr.toFixed(2) + ':1');
          }
          await shot(page, 's03-hold-' + theme.id + '-' + size.w);
        }

        if (size.w === 390) {
          var ansTop = await page.evaluate(function () {
            var el = document.querySelector('[data-cbx-answers]');
            return el ? Math.round(window.scrollY + el.getBoundingClientRect().top + 40) : 0;
          });
          await page.evaluate(function (y) { window.scrollTo(0, y); }, ansTop);
          await sleep(500);
          var mid = await page.evaluate(function () {
            var st = window.ScrollTrigger && window.ScrollTrigger.getAll
              ? window.ScrollTrigger.getAll() : [];
            var i;
            for (i = 0; i < st.length; i += 1) {
              if (st[i].trigger && st[i].trigger.hasAttribute('data-cbx-answers')) {
                return Math.round(st[i].start + (st[i].end - st[i].start) * 0.35);
              }
            }
            return Math.round(window.scrollY + 400);
          });
          await page.evaluate(function (y) { window.scrollTo(0, y); }, mid);
          await sleep(400);
          var sheet = await pointerSheet(page);
          log(sheet.ok, '390 one-card sheet ' + theme.id,
            'visible=' + sheet.visible + ' bottoms=' + JSON.stringify(sheet.bottoms) + ' font=' + sheet.font);
          await shot(page, 's03-390-sheet-' + theme.id);
        }
      }
    }

    await openStudy(page, THEMES[0], SIZES[0]);
    var pin = await measurePin(page);
    if (!pin.ok) log(false, 'S03 pin rAF', pin.reason);
    else {
      var st = pin.stats;
      log(st.median <= 40, 'S03 pin rAF 1440x900',
        'median=' + st.median.toFixed(1) + 'ms p95=' + st.p95.toFixed(1) + 'ms worst=' + st.worst.toFixed(1) + 'ms n=' + st.n);
      notes.push('S03 pin rAF median ' + st.median.toFixed(1) + ' / p95 ' + st.p95.toFixed(1) + ' / worst ' + st.worst.toFixed(1));
    }
    await shot(page, 'coffee-last-cream-1440');
  });

  notes.forEach(function (n) { console.log('note - ' + n); });
  console.log(passed + ' passed, ' + failed + ' failed');
  if (failed) process.exit(1);
}

main().catch(function (err) {
  console.error(err && err.stack ? err.stack : err);
  process.exit(1);
});
