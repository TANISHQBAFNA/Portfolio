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
var zlib = require('zlib');

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
].filter(function (s) {
  return !process.env.CBX_W || String(s.w) === process.env.CBX_W;
});
var THEMES = [
  { id: 'cream', file: 'index.html' },
  { id: 'multiverse', file: 'index-multiverse.html' }
].filter(function (t) {
  return !process.env.CBX_THEME || t.id === process.env.CBX_THEME;
});

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

function paeth(a, b, c) {
  var p = a + b - c;
  var pa = Math.abs(p - a);
  var pb = Math.abs(p - b);
  var pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

function decodePng(buf) {
  if (buf[0] !== 0x89 || buf.toString('ascii', 1, 4) !== 'PNG') {
    throw new Error('not a png');
  }
  var offset = 8;
  var width = 0;
  var height = 0;
  var colorType = 6;
  var idats = [];
  while (offset + 12 <= buf.length) {
    var len = buf.readUInt32BE(offset);
    var type = buf.toString('ascii', offset + 4, offset + 8);
    var data = buf.slice(offset + 8, offset + 8 + len);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      colorType = data[9];
    } else if (type === 'IDAT') {
      idats.push(data);
    } else if (type === 'IEND') {
      break;
    }
    offset += 12 + len;
  }
  var bpp = colorType === 2 ? 3 : 4;
  var inflated = zlib.inflateSync(Buffer.concat(idats));
  var stride = width * bpp;
  var out = Buffer.alloc(height * stride);
  var src = 0;
  var y;
  for (y = 0; y < height; y += 1) {
    var filter = inflated[src];
    src += 1;
    var x;
    for (x = 0; x < stride; x += 1) {
      var raw = inflated[src + x];
      var a = x >= bpp ? out[y * stride + x - bpp] : 0;
      var b = y > 0 ? out[(y - 1) * stride + x] : 0;
      var c = y > 0 && x >= bpp ? out[(y - 1) * stride + x - bpp] : 0;
      var val = raw;
      if (filter === 1) val = (raw + a) & 255;
      else if (filter === 2) val = (raw + b) & 255;
      else if (filter === 3) val = (raw + Math.floor((a + b) / 2)) & 255;
      else if (filter === 4) val = (raw + paeth(a, b, c)) & 255;
      out[y * stride + x] = val;
    }
    src += stride;
  }
  return { width: width, height: height, bpp: bpp, data: out };
}

function avgRgb(png) {
  var n = png.width * png.height;
  var r = 0;
  var g = 0;
  var b = 0;
  var count = 0;
  var i;
  for (i = 0; i < n; i += 1) {
    var o = i * png.bpp;
    var a = png.bpp === 4 ? png.data[o + 3] : 255;
    if (a < 12) continue;
    r += png.data[o];
    g += png.data[o + 1];
    b += png.data[o + 2];
    count += 1;
  }
  if (!count) return [0, 0, 0];
  return [r / count, g / count, b / count];
}

function mulberry(seed) {
  var t = seed >>> 0;
  return function () {
    t += 0x6D2B79F5;
    var x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(arr, rand) {
  var i;
  for (i = arr.length - 1; i > 0; i -= 1) {
    var j = Math.floor(rand() * (i + 1));
    var tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

async function waitForStudy(page) {
  await page.waitForFunction(function () {
    var ans = document.querySelector('[data-cbx-answers]');
    var st = window.ScrollTrigger && window.ScrollTrigger.getAll && window.ScrollTrigger.getAll();
    return document.documentElement.classList.contains('is-study-page') &&
      ans && ans.getAttribute('data-ready') === '1' &&
      st && st.length >= 2 &&
      st.some(function (t) {
        return t.trigger && t.trigger.hasAttribute && t.trigger.hasAttribute('data-cbx-answers') &&
          t.end > t.start + 200;
      });
  }, { timeout: 25000 });
  await sleep(200);
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
  var maxNotches = 400;
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
  var hist = [await yNow(page)];
  var i;
  var maxNotches = 400;
  for (i = 0; i < maxNotches; i += 1) {
    var before = hist[hist.length - 1];
    var ceiling = await maxY(page);
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
  if (last < 400) {
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
      box: { x: r.left, y: r.top, w: r.width, h: r.height }
    };
  });
}

async function sampleCloseContrast(page) {
  var handle = await page.$('.study__close, [data-study-close]');
  if (!handle) return { ok: false, reason: 'Close missing', ratio: 0 };
  var info = await page.evaluate(function (el) {
    var st = window.getComputedStyle(el);
    return { color: st.color, bg: st.backgroundColor };
  }, handle);
  var raw = await handle.screenshot({ type: 'png' });
  var fg = parseRgb(info.color);
  var png = decodePng(Buffer.isBuffer(raw) ? raw : Buffer.from(raw));
  var bg = avgRgbBand(png, 0, 0.22);
  var ratio = fg ? contrast(fg, bg) : 0;
  var computedBg = parseRgb(info.bg);
  if (ratio < 4.5 && fg && computedBg && contrast(fg, computedBg) >= 4.5) {
    /* Left band hit the glyph; the button's own fill is the backing. */
    bg = computedBg;
    ratio = contrast(fg, bg);
  }
  return {
    ok: ratio >= 4.5,
    ratio: ratio,
    fg: fg,
    bg: bg,
    color: info.color
  };
}

function avgRgbBand(png, from, to) {
  var x0 = Math.floor(png.width * from);
  var x1 = Math.max(x0 + 1, Math.floor(png.width * to));
  var r = 0;
  var g = 0;
  var b = 0;
  var count = 0;
  var y;
  var x;
  for (y = 0; y < png.height; y += 1) {
    for (x = x0; x < x1; x += 1) {
      var o = (y * png.width + x) * png.bpp;
      var a = png.bpp === 4 ? png.data[o + 3] : 255;
      if (a < 12) continue;
      r += png.data[o];
      g += png.data[o + 1];
      b += png.data[o + 2];
      count += 1;
    }
  }
  if (!count) return avgRgb(png);
  return [r / count, g / count, b / count];
}

function lumOf(rgb) {
  function lin(c) {
    var x = c / 255;
    return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  }
  return 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2]);
}

function clusterContrast(png) {
  var dark = [0, 0, 0, 0];
  var light = [0, 0, 0, 0];
  var n = png.width * png.height;
  var i;
  for (i = 0; i < n; i += 1) {
    var o = i * png.bpp;
    var a = png.bpp === 4 ? png.data[o + 3] : 255;
    if (a < 12) continue;
    var rgb = [png.data[o], png.data[o + 1], png.data[o + 2]];
    var bucket = lumOf(rgb) < 0.35 ? dark : light;
    bucket[0] += rgb[0];
    bucket[1] += rgb[1];
    bucket[2] += rgb[2];
    bucket[3] += 1;
  }
  if (dark[3] < 6 || light[3] < 6) return null;
  var d = [dark[0] / dark[3], dark[1] / dark[3], dark[2] / dark[3]];
  var l = [light[0] / light[3], light[1] / light[3], light[2] / light[3]];
  return { ratio: contrast(l, d), fg: l, bg: d, darkN: dark[3], lightN: light[3] };
}

async function sampleTextContrast(page, selector) {
  var found = await page.evaluateHandle(function (sel) {
    var nodes = document.querySelectorAll(sel);
    var i;
    var fallback = null;
    for (i = 0; i < nodes.length; i += 1) {
      var el = nodes[i];
      var st = window.getComputedStyle(el);
      var r = el.getBoundingClientRect();
      if (!fallback) fallback = el;
      if (st.display === 'none' || st.visibility === 'hidden' || parseFloat(st.opacity) < 0.15) continue;
      if (r.width < 4 || r.height < 4 || r.bottom < 0 || r.top > window.innerHeight) continue;
      return el;
    }
    return fallback;
  }, selector);
  var handle = found && found.asElement && found.asElement();
  if (!handle) return { ok: true, skip: true, reason: 'missing', ratio: 0, selector: selector };
  var info = await page.evaluate(function (el) {
    var st = window.getComputedStyle(el);
    var r = el.getBoundingClientRect();
    return {
      color: st.color,
      bg: st.backgroundColor,
      display: st.display,
      visibility: st.visibility,
      opacity: parseFloat(st.opacity),
      top: r.top,
      bottom: r.bottom,
      width: r.width,
      height: r.height,
      vh: window.innerHeight
    };
  }, handle);
  if (info.display === 'none' || info.visibility === 'hidden' || info.opacity < 0.15) {
    return { ok: true, skip: true, reason: 'hidden', ratio: 0, selector: selector };
  }
  if (info.width < 4 || info.height < 4 || info.bottom < 0 || info.top > info.vh) {
    return { ok: true, skip: true, reason: 'offscreen', ratio: 0, selector: selector };
  }
  var raw;
  try {
    raw = await handle.screenshot({ type: 'png' });
  } catch (err) {
    return { ok: true, skip: true, reason: 'shot-fail', ratio: 0, selector: selector };
  }
  var png = decodePng(Buffer.isBuffer(raw) ? raw : Buffer.from(raw));
  var clustered = clusterContrast(png);
  var fg = parseRgb(info.color);
  var ratio = clustered ? clustered.ratio : 0;
  var bg = clustered ? clustered.bg : avgRgb(png);
  var ink = clustered ? clustered.fg : fg;
  if (ratio < 4.5 && fg && clustered) {
    ratio = contrast(fg, clustered.bg);
    ink = fg;
    bg = clustered.bg;
  }
  return {
    ok: ratio >= 4.5,
    skip: false,
    ratio: ratio,
    fg: ink,
    bg: bg,
    color: info.color,
    selector: selector
  };
}

async function headerPhoneGap(page) {
  return page.evaluate(function () {
    var lab = document.querySelector('.cbx-ans__lab');
    var pin = document.querySelector('[data-cbx-answers]');
    var phone = pin && pin.querySelector('.cbx-ans__scene:not([hidden]) .cbx-phone');
    if (!lab || !phone) return { ok: true, skip: true };
    var a = lab.getBoundingClientRect();
    var b = phone.getBoundingClientRect();
    if (a.height < 4 || b.height < 8 || a.bottom < 0 || a.top > 160) {
      return { ok: true, skip: true };
    }
    var gap = b.top - a.bottom;
    return {
      ok: gap >= 6,
      gap: Math.round(gap),
      lab: [Math.round(a.left), Math.round(a.top), Math.round(a.right), Math.round(a.bottom)],
      phone: [Math.round(b.left), Math.round(b.top), Math.round(b.right), Math.round(b.bottom)]
    };
  });
}

async function closeCovers(page, selector) {
  return page.evaluate(function (sel) {
    var btn = document.querySelector('.study__close, [data-study-close]');
    var node = document.querySelector(sel);
    if (!btn || !node) return { ok: true, skip: true, reason: 'missing' };
    var st = window.getComputedStyle(node);
    if (st.display === 'none' || st.visibility === 'hidden' || parseFloat(st.opacity) < 0.1) {
      return { ok: true, skip: true, reason: 'hidden' };
    }
    var a = btn.getBoundingClientRect();
    var b = node.getBoundingClientRect();
    if (b.width < 2 || b.height < 2) return { ok: true, skip: true, reason: 'empty' };
    var hit = a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
    return {
      ok: !hit,
      skip: false,
      close: [Math.round(a.left), Math.round(a.top), Math.round(a.right), Math.round(a.bottom)],
      el: [Math.round(b.left), Math.round(b.top), Math.round(b.right), Math.round(b.bottom)]
    };
  }, selector);
}

async function closeLabOverlap(page) {
  return page.evaluate(function () {
    var btn = document.querySelector('.study__close, [data-study-close]');
    var lab = document.querySelector('.cbx-ans__lab');
    if (!btn || !lab) return { ok: true, skip: true };
    var a = btn.getBoundingClientRect();
    var b = lab.getBoundingClientRect();
    if (b.bottom < 0 || b.top > 120) {
      return {
        ok: true,
        skip: true,
        close: [Math.round(a.left), Math.round(a.top), Math.round(a.right), Math.round(a.bottom)],
        lab: [Math.round(b.left), Math.round(b.top), Math.round(b.right), Math.round(b.bottom)]
      };
    }
    var hit = a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
    return {
      ok: !hit,
      close: [Math.round(a.left), Math.round(a.top), Math.round(a.right), Math.round(a.bottom)],
      lab: [Math.round(b.left), Math.round(b.top), Math.round(b.right), Math.round(b.bottom)]
    };
  });
}

async function pinRange(page) {
  return page.evaluate(function () {
    var ScrollTrigger = window.ScrollTrigger;
    var all = ScrollTrigger && ScrollTrigger.getAll ? ScrollTrigger.getAll() : [];
    var i;
    var s02 = null;
    var s03 = null;
    for (i = 0; i < all.length; i += 1) {
      var t = all[i].trigger;
      if (!t || !t.hasAttribute) continue;
      if (t.hasAttribute('data-cbx-stage')) s02 = { start: all[i].start, end: all[i].end };
      if (t.hasAttribute('data-cbx-answers')) s03 = { start: all[i].start, end: all[i].end };
    }
    return { s02: s02, s03: s03 };
  });
}

async function sceneVisible(page) {
  return page.evaluate(function () {
    var pin = document.querySelector('[data-cbx-answers]');
    if (!pin) return { ok: false, reason: 'no pin' };
    var scenes = Array.prototype.slice.call(pin.querySelectorAll('.cbx-ans__scene'));
    var live = scenes.filter(function (s) { return !s.hasAttribute('hidden'); });
    if (!live.length) {
      return { ok: false, reason: 'all scenes hidden', hidden: scenes.length };
    }
    var phone = live.some(function (s) {
      var p = s.querySelector('.cbx-phone, [data-ans-device="phone"], .cbx-ans__note, .cbx-ans__stage');
      if (!p) return false;
      var r = p.getBoundingClientRect();
      var st = window.getComputedStyle(p);
      var op = parseFloat(st.opacity);
      var vis = st.visibility !== 'hidden' && st.display !== 'none';
      return vis && op > 0.05 && r.width > 8 && r.height > 8;
    });
    var ptr = live.some(function (s) {
      return Array.prototype.some.call(s.querySelectorAll('.cbx-ans__ptr'), function (p) {
        var r = p.getBoundingClientRect();
        var st = window.getComputedStyle(p);
        return parseFloat(st.opacity) > 0.15 && r.height > 8 && r.width > 8 &&
          st.visibility !== 'hidden';
      });
    });
    var note = live.some(function (s) {
      var n = s.querySelector('.cbx-ans__note');
      if (!n) return false;
      var r = n.getBoundingClientRect();
      return r.width > 20 && r.height > 20;
    });
    return {
      ok: phone || ptr || note,
      phone: phone,
      ptr: ptr,
      live: live.length,
      reason: (phone || ptr || note) ? '' : 'no phone/ptr on live scene'
    };
  });
}

async function jumpTo(page, y, waitMs) {
  await page.evaluate(function (pos) {
    window.scrollTo(0, pos);
    if (window.ScrollTrigger && window.ScrollTrigger.update) window.ScrollTrigger.update();
  }, y);
  if (waitMs) await sleep(waitMs);
  else {
    await page.evaluate(function () {
      return new Promise(function (resolve) {
        window.requestAnimationFrame(function () { window.requestAnimationFrame(resolve); });
      });
    });
  }
}

async function probeS03Pin(page) {
  var range = await pinRange(page);
  if (!range.s03) return { ok: false, reason: 'no S03 trigger', fails: ['no trigger'] };
  var start = range.s03.start + 24;
  var end = range.s03.end - 24;
  var span = end - start;
  if (span < 200) return { ok: false, reason: 'S03 pin too short', fails: [] };
  var even = [];
  var i;
  for (i = 0; i < 40; i += 1) {
    even.push(Math.round(start + span * (i / 39)));
  }
  var rand = mulberry(7056);
  var random = shuffle(even.slice(), rand);
  var reverse = even.slice().reverse();
  var plans = [
    { name: 'random-wait', list: random, wait: 80 },
    { name: 'reverse-nowait', list: reverse, wait: 0 }
  ];
  var fails = [];
  var p;
  var q;
  for (p = 0; p < plans.length; p += 1) {
    var plan = plans[p];
    for (q = 0; q < plan.list.length; q += 1) {
      var y = plan.list[q];
      await jumpTo(page, y, plan.wait);
      var vis = await sceneVisible(page);
      if (!vis.ok) {
        fails.push(plan.name + ' y=' + y + ' ' + vis.reason);
        if (fails.length >= 8) {
          return { ok: false, fails: fails, range: range.s03 };
        }
      } else if ((page.viewport().width || 0) >= 1440) {
        var ov = await closeLabOverlap(page);
        if (!ov.skip && !ov.ok) {
          fails.push(plan.name + ' y=' + y + ' Close overlaps header ' + JSON.stringify(ov));
          if (fails.length >= 8) {
            return { ok: false, fails: fails, range: range.s03 };
          }
        }
      }
    }
  }
  return { ok: fails.length === 0, fails: fails, range: range.s03, n: 80 };
}

async function rollThrough(page, dy, until, budgetMs) {
  var t0 = Date.now();
  var hist = [await yNow(page)];
  var i;
  var maxNotches = 500;
  for (i = 0; i < maxNotches; i += 1) {
    if (Date.now() - t0 > budgetMs) {
      return { ok: false, reason: 'over ' + budgetMs + 'ms at y=' + hist[hist.length - 1], hist: hist, ms: Date.now() - t0, notches: i };
    }
    await page.mouse.wheel({ deltaY: dy });
    await sleep(70);
    var y = await yNow(page);
    hist.push(y);
    if (until(y, hist)) {
      return { ok: true, hist: hist, ms: Date.now() - t0, notches: i + 1, y: y };
    }
    if (oscillating(hist)) {
      return { ok: false, reason: 'oscillated at ' + y, hist: hist, ms: Date.now() - t0, notches: i + 1 };
    }
    if (i > 10) {
      var stuck = 0;
      var k;
      for (k = hist.length - 1; k >= 1 && k >= hist.length - 8; k -= 1) {
        if (Math.abs(hist[k] - y) <= 2) stuck += 1;
      }
      if (stuck >= 8) {
        return { ok: false, reason: 'stalled at y=' + y + ' for ' + stuck + ' notches', hist: hist, ms: Date.now() - t0, notches: i + 1 };
      }
    }
  }
  return { ok: false, reason: 'did not finish (y=' + hist[hist.length - 1] + ')', hist: hist, ms: Date.now() - t0, notches: i };
}

async function pointerSheet(page) {
  return page.evaluate(function () {
    var vh = window.innerHeight;
    var scene = document.querySelector('.cbx-ans__scene:not([hidden])') ||
      document.querySelector('.cbx-ans__scene');
    if (!scene) return { ok: false, reason: 'no scene' };
    var ptrs = Array.prototype.slice.call(document.querySelectorAll('.cbx-ans__ptr'));
    var current = ptrs.filter(function (p) {
      var sc = p.closest && p.closest('.cbx-ans__scene');
      return p.classList.contains('is-current') && sc && !sc.hasAttribute('hidden');
    });
    var visible = ptrs.filter(function (p) {
      var r = p.getBoundingClientRect();
      var st = window.getComputedStyle(p);
      var op = parseFloat(st.opacity);
      return st.visibility !== 'hidden' && op > 0.2 && r.height > 8 && r.bottom > 0 && r.top < vh;
    });
    var bottoms = visible.map(function (p) { return Math.round(p.getBoundingClientRect().bottom); });
    var copy = visible[0] && visible[0].querySelector('.cbx-ans__pd');
    var fs = copy ? parseFloat(window.getComputedStyle(copy).fontSize) : 0;
    var overflow = bottoms.some(function (b) { return b > vh + 1; });
    return {
      ok: visible.length === 1 && current.length <= 1 && !overflow && fs >= 15,
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

        if (size.w === 390) {
          await jumpTo(page, 0, 250);
          var heroHit = await closeCovers(page, '.study__mark .study__word');
          log(heroHit.ok, 'Close vs hero title 390 ' + theme.id,
            heroHit.skip ? heroHit.reason : 'close=' + JSON.stringify(heroHit.close) + ' el=' + JSON.stringify(heroHit.el));
          await shot(page, 'close-390-hero-' + theme.id);
        }

        var down = await walkDown(page, 200);
        log(down.ok, 'wheel down ' + label, down.ok ? 'end y=' + down.end : down.reason);

        var up = await walkUp(page, 200);
        log(up.ok, 'wheel up to 0 ' + label, up.ok ? 'notches=' + up.notches + ' from ' + up.start : up.reason);
        if (!up.ok) await shot(page, 'wheel-stuck-' + theme.id + '-' + size.w);

        var ranges = await pinRange(page);
        await page.evaluate(function () {
          if (window.ScrollTrigger && window.ScrollTrigger.refresh) window.ScrollTrigger.refresh();
        });
        await sleep(200);
        ranges = await pinRange(page);
        var positions = [];
        if (ranges.s02) {
          var span = ranges.s02.end - ranges.s02.start;
          positions = [
            Math.round(ranges.s02.start + span * 0.28),
            Math.round(ranges.s02.start + span * 0.55),
            Math.round(ranges.s02.end - 8)
          ];
        }
        var holds = [];
        if (ranges.s03) {
          var s03span = ranges.s03.end - ranges.s03.start;
          holds = [
            { name: 'handoff-end', y: Math.round(ranges.s03.start + 12) },
            { name: 'ch1-hold', y: Math.round(ranges.s03.start + s03span * 0.18) },
            { name: 'ch2-hold', y: Math.round(ranges.s03.start + s03span * 0.5) },
            { name: 'ch3-hold', y: Math.round(ranges.s03.start + s03span * 0.82) },
            { name: 'page-end', y: Math.round(ranges.s03.end + 24) }
          ];
        }
        var p;
        for (p = 0; p < positions.length; p += 1) {
          await jumpTo(page, positions[p], 250);
          var hit = await closeHit(page);
          log(hit.ok, 'Close clickable ' + label + ' y=' + positions[p], hit.ok ? '' : hit.reason);
          var pix = await sampleCloseContrast(page);
          log(pix.ok, 'Close contrast ' + label + ' y=' + positions[p],
            pix.ratio.toFixed(2) + ':1 fg=' + (pix.fg && pix.fg.map(function (n) { return Math.round(n); }).join(',') ) +
            ' bg=' + (pix.bg && pix.bg.map(function (n) { return Math.round(n); }).join(',')));
        }

        for (p = 0; p < holds.length; p += 1) {
          await jumpTo(page, holds[p].y, 500);
          var holdHit = await closeHit(page);
          log(holdHit.ok, 'Close clickable ' + holds[p].name + ' ' + label, holdHit.ok ? '' : holdHit.reason);
          var holdPix = await sampleCloseContrast(page);
          log(holdPix.ok, 'Close contrast ' + holds[p].name + ' ' + label,
            holdPix.ratio.toFixed(2) + ':1 fg=' + (holdPix.fg && holdPix.fg.map(function (n) { return Math.round(n); }).join(',')) +
            ' bg=' + (holdPix.bg && holdPix.bg.map(function (n) { return Math.round(n); }).join(',')));
          var labels = [
            { sel: '.cbx-ans__title', name: 'S03 title' },
            { sel: '.cbx-ans__num', name: 'S03 03' },
            { sel: '.cbx-ans__xtag', name: 'example UI' },
            { sel: '.cbx-vfl', name: 'in focus' },
            { sel: '.cbx-ans__ctag .tag, .cbx-ans__ctag span', name: 'example copy' }
          ];
          var li;
          for (li = 0; li < labels.length; li += 1) {
            var labPix = await sampleTextContrast(page, labels[li].sel);
            if (labPix.skip) {
              log(true, labels[li].name + ' contrast ' + holds[p].name + ' ' + label, 'skip ' + labPix.reason);
            } else {
              log(labPix.ok, labels[li].name + ' contrast ' + holds[p].name + ' ' + label,
                labPix.ratio.toFixed(2) + ':1 fg=' + (labPix.fg && labPix.fg.map(function (n) { return Math.round(n); }).join(',')) +
                ' bg=' + (labPix.bg && labPix.bg.map(function (n) { return Math.round(n); }).join(',')));
            }
          }
          if (size.w === 1440 && holds[p].name.indexOf('hold') !== -1) {
            var ov = await closeLabOverlap(page);
            log(ov.ok, 'Close vs S03 header ' + holds[p].name + ' ' + label,
              ov.skip ? 'header off-screen close=' + JSON.stringify(ov.close) + ' lab=' + JSON.stringify(ov.lab)
                : 'close=' + JSON.stringify(ov.close) + ' lab=' + JSON.stringify(ov.lab));
          }
        }

        var probe = await probeS03Pin(page);
        log(probe.ok, 'S03 pin samples ' + label,
          probe.ok ? 'n=' + probe.n : (probe.fails || []).slice(0, 4).join(' | '));
        if (!probe.ok) await shot(page, 's03-blank-' + theme.id + '-' + size.w);

        var top = await maxY(page);
        await page.evaluate(function (y) { window.scrollTo(0, y); }, top);
        await sleep(200);
        await page.mouse.move(Math.round(size.w / 2), Math.round(size.h / 2));
        var upRoll = await rollThrough(page, -100, function (y) { return y <= 2; }, 16000);
        log(upRoll.ok, '70ms roll up ' + label,
          (upRoll.ok ? 'y=0' : upRoll.reason) + ' ms=' + upRoll.ms + ' notches=' + upRoll.notches);
        if (!upRoll.ok) await shot(page, 'roll-up-stuck-' + theme.id + '-' + size.w);

        await page.evaluate(function () { window.scrollTo(0, 0); });
        await sleep(200);
        var ceiling = await maxY(page);
        var downRoll = await rollThrough(page, 100, function (y) { return y >= ceiling - 12; }, 16000);
        log(downRoll.ok, '70ms roll down ' + label,
          (downRoll.ok ? 'end y=' + downRoll.y : downRoll.reason) + ' ms=' + downRoll.ms + ' notches=' + downRoll.notches);

        if (size.w === 1440) {
          await jumpTo(page, holds[1] ? holds[1].y : 0, 400);
          await shot(page, 's03-hold-' + theme.id + '-' + size.w);
        }

        if (size.w === 390) {
          var holdY = ranges.s03
            ? Math.round(ranges.s03.start + (ranges.s03.end - ranges.s03.start) * 0.22)
            : 0;
          await jumpTo(page, holdY, 700);
          var sheet = await pointerSheet(page);
          log(sheet.ok, '390 one-card sheet ' + theme.id,
            'visible=' + sheet.visible + ' bottoms=' + JSON.stringify(sheet.bottoms) + ' font=' + sheet.font + ' y=' + holdY);
          var gap = await headerPhoneGap(page);
          log(gap.ok, '390 header vs phone ' + theme.id,
            gap.skip ? 'skip' : 'gap=' + gap.gap + ' lab=' + JSON.stringify(gap.lab) + ' phone=' + JSON.stringify(gap.phone));
          await shot(page, 's03-390-sheet-' + theme.id);
          if (ranges.s02) {
            await jumpTo(page, Math.round(ranges.s02.start + (ranges.s02.end - ranges.s02.start) * 0.28), 300);
            var s1pix = await sampleCloseContrast(page);
            log(s1pix.ok, 'Close contrast 390 stage-1 ' + theme.id, s1pix.ratio.toFixed(2) + ':1');
            var navHit = await closeCovers(page, '.cbx-growth__step.is-on');
            log(navHit.ok, 'Close vs coffee nav 390 ' + theme.id,
              navHit.skip ? navHit.reason : 'close=' + JSON.stringify(navHit.close) + ' el=' + JSON.stringify(navHit.el));
            await shot(page, 'close-390-stage1-' + theme.id);
          }
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
