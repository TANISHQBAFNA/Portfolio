(function () {
  'use strict';

  var html = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var isMultiverse = html.classList.contains('is-multiverse');
  var busy = false;
  var TEAR_MS = 820;
  var SETTLE_MS = 780;
  var THRESHOLD_MS = 520;
  var LAND_MS = 420;
  var FADE_MS = 280;
  var HITCH_GLYPHS = {
    T: ['ट', 'Т', 'Τ'],
    a: ['а', 'α', 'ا'],
    n: ['न', 'п', 'ن'],
    i: ['і', 'ι', '工'],
    s: ['ѕ', 'ς'],
    h: ['н', 'η'],
    q: ['ק', 'қ'],
    B: ['Б', 'Β', 'ب'],
    f: ['ф', 'ƒ']
  };

  function hasParam(name) {
    try {
      return new URLSearchParams(location.search).get(name) === '1';
    } catch (err) {
      return new RegExp('[?&]' + name + '=1(?:&|$)').test(location.search);
    }
  }

  function stripParams(names) {
    try {
      var url = new URL(location.href);
      var changed = false;
      names.forEach(function (name) {
        if (url.searchParams.has(name)) {
          url.searchParams.delete(name);
          changed = true;
        }
      });
      if (!changed) return;
      var next = url.pathname + (url.search ? url.search : '') + url.hash;
      history.replaceState({}, '', next);
    } catch (err) { /* ignore */ }
  }

  function withBeyondQuery(href, key) {
    var base = href || (key === 'beyond' ? 'index-multiverse.html' : 'index.html');
    if (new RegExp('[?&]' + key + '=').test(base)) return base;
    return base + (base.indexOf('?') === -1 ? '?' : '&') + key + '=1';
  }

  /* Sync flags before later defer scripts (landing*) boot. */
  if (isMultiverse && hasParam('beyond')) html.classList.add('is-beyond-enter');
  if (!isMultiverse && hasParam('home')) html.classList.add('is-beyond-home');

  function ensureOverlay() {
    var el = document.getElementById('beyond-seam');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'beyond-seam';
    el.className = 'beyond-seam';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML =
      '<div class="beyond-seam__plate beyond-seam__plate--cream"></div>' +
      '<div class="beyond-seam__plate beyond-seam__plate--ink"></div>' +
      '<div class="beyond-seam__chroma beyond-seam__chroma--r"></div>' +
      '<div class="beyond-seam__chroma beyond-seam__chroma--c"></div>' +
      '<div class="beyond-seam__slit"></div>' +
      '<div class="beyond-seam__hitch"></div>' +
      '<p class="beyond-seam__whisper" data-beyond-whisper></p>';
    document.body.appendChild(el);
    return el;
  }

  function setWhisper(text) {
    var node = document.querySelector('[data-beyond-whisper]');
    if (node) node.textContent = text || '';
  }

  function softNameHitch() {
    if (reduceMotion.matches) return;
    var logo = document.querySelector('.masthead__name');
    if (!logo) return;

    if (window.IrisMotion && typeof window.IrisMotion.burstGlitch === 'function') {
      window.IrisMotion.burstGlitch(logo, reduceMotion);
      return;
    }

    var original = (logo.getAttribute('data-latin') || logo.textContent || 'Tanishq Bafna').trim();
    var chars = original.split('');
    var i;
    var swaps = 0;
    for (i = 0; i < chars.length && swaps < 3; i += 1) {
      var options = HITCH_GLYPHS[chars[i]];
      if (!options || !options.length) continue;
      if (Math.random() > 0.55) continue;
      chars[i] = options[Math.floor(Math.random() * options.length)];
      swaps += 1;
    }
    logo.classList.add('is-beyond-hitch');
    if (swaps) logo.textContent = chars.join('');
    window.setTimeout(function () {
      logo.textContent = original;
      logo.classList.remove('is-beyond-hitch');
    }, 420);
  }

  function runPhase(phaseClass, duration, done) {
    var seam = ensureOverlay();
    seam.className = 'beyond-seam is-active ' + phaseClass;
    html.classList.add('is-beyond-crossing');
    document.body.classList.add('is-beyond-crossing');
    window.setTimeout(function () {
      seam.className = 'beyond-seam';
      html.classList.remove('is-beyond-crossing');
      document.body.classList.remove('is-beyond-crossing');
      if (done) done();
    }, duration);
  }

  function goBeyond(href) {
    if (busy) return;
    busy = true;
    var target = withBeyondQuery(href, 'beyond');
    if (reduceMotion.matches) {
      runPhase('is-fade-out', FADE_MS, function () { location.href = target; });
      return;
    }
    softNameHitch();
    setWhisper('beyond');
    runPhase('is-leave-cream', TEAR_MS, function () { location.href = target; });
  }

  function goHome(href) {
    if (busy) return;
    busy = true;
    var target = withBeyondQuery(href, 'home');
    if (reduceMotion.matches) {
      runPhase('is-fade-out', FADE_MS, function () { location.href = target; });
      return;
    }
    setWhisper('home');
    runPhase('is-leave-multiverse', SETTLE_MS, function () { location.href = target; });
  }

  function wireBeyondTab() {
    var tab = document.querySelector('[data-beyond-tab]');
    if (!tab) return;
    tab.addEventListener('click', function (event) {
      if (event.defaultPrevented) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (typeof event.button === 'number' && event.button !== 0) return;
      event.preventDefault();
      goBeyond(tab.getAttribute('href') || 'index-multiverse.html');
    });
  }

  function wireHomeTab() {
    var tab = document.querySelector('a.home-tab');
    if (!tab) return;
    tab.addEventListener('click', function (event) {
      if (event.defaultPrevented) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (typeof event.button === 'number' && event.button !== 0) return;
      event.preventDefault();
      goHome(tab.getAttribute('href') || 'index.html');
    });
  }

  function handleArrival() {
    if (isMultiverse && html.classList.contains('is-beyond-enter')) {
      window.setTimeout(function () { stripParams(['beyond']); }, 0);
      if (reduceMotion.matches) {
        window.setTimeout(function () { html.classList.remove('is-beyond-enter'); }, FADE_MS);
        return;
      }
      runPhase('is-enter-threshold', THRESHOLD_MS, function () {
        html.classList.remove('is-beyond-enter');
      });
      return;
    }

    if (!isMultiverse && html.classList.contains('is-beyond-home')) {
      window.setTimeout(function () { stripParams(['home']); }, 0);
      if (reduceMotion.matches) {
        window.setTimeout(function () { html.classList.remove('is-beyond-home'); }, FADE_MS);
        return;
      }
      runPhase('is-land-home', LAND_MS, function () {
        html.classList.remove('is-beyond-home');
      });
    }
  }

  function boot() {
    handleArrival();
    if (isMultiverse) wireHomeTab();
    else wireBeyondTab();
  }

  /* defer scripts run after parse — body is ready */
  boot();
})();
