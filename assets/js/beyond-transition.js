(function () {
  'use strict';

  var html = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var isMultiverse = html.classList.contains('is-multiverse');
  var busy = false;
  var PORTAL_MS = 1400;
  var SETTLE_MS = 1200;
  var THRESHOLD_MS = 900;
  var LAND_MS = 700;
  var FADE_MS = 280;
  var STORM = [
    'ट', 'Т', 'Τ', 'ت', '丁',
    'अ', 'А', 'Α', 'ا',
    'न', 'Ν', 'ن',
    'ब', 'В', 'Β', 'ب',
    'क', 'Κ',
    'BEYOND', 'HOME', '‡', '☰', '◇'
  ];
  var HITCH_GLYPHS = {
    T: ['ट', 'Т', 'Τ', 'ت'],
    a: ['а', 'α', 'ا', 'अ'],
    n: ['न', 'Ν', 'ن'],
    i: ['і', 'ι', '工'],
    s: ['ѕ', 'ς'],
    h: ['н', 'η'],
    q: ['ק', 'қ', 'क'],
    B: ['Б', 'Β', 'ب', 'ब'],
    f: ['ф', 'ƒ'],
    A: ['А', 'Α', 'अ'],
    e: ['е', 'ε']
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
      history.replaceState({}, '', url.pathname + (url.search ? url.search : '') + url.hash);
    } catch (err) { /* ignore */ }
  }

  function withBeyondQuery(href, key) {
    var base = href || (key === 'beyond' ? 'index-multiverse.html' : 'index.html');
    if (new RegExp('[?&]' + key + '=').test(base)) return base;
    return base + (base.indexOf('?') === -1 ? '?' : '&') + key + '=1';
  }

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
      '<div class="beyond-seam__void"></div>' +
      '<div class="beyond-seam__portal" data-beyond-portal></div>' +
      '<div class="beyond-seam__ring beyond-seam__ring--a"></div>' +
      '<div class="beyond-seam__ring beyond-seam__ring--b"></div>' +
      '<div class="beyond-seam__ring beyond-seam__ring--c"></div>' +
      '<div class="beyond-seam__scan"></div>' +
      '<div class="beyond-seam__rgb beyond-seam__rgb--r"></div>' +
      '<div class="beyond-seam__rgb beyond-seam__rgb--g"></div>' +
      '<div class="beyond-seam__rgb beyond-seam__rgb--b"></div>' +
      '<div class="beyond-seam__noise"></div>' +
      '<div class="beyond-seam__storm" data-beyond-storm></div>' +
      '<p class="beyond-seam__whisper" data-beyond-whisper></p>';
    document.body.appendChild(el);
    return el;
  }

  function setWhisper(text) {
    var node = document.querySelector('[data-beyond-whisper]');
    if (node) node.textContent = text || '';
  }

  function fillStorm() {
    var storm = document.querySelector('[data-beyond-storm]');
    if (!storm) return;
    storm.innerHTML = '';
    var count = 28;
    var i;
    for (i = 0; i < count; i += 1) {
      var span = document.createElement('span');
      span.className = 'beyond-seam__glyph';
      span.textContent = STORM[Math.floor(Math.random() * STORM.length)];
      span.style.left = (4 + Math.random() * 92).toFixed(2) + '%';
      span.style.top = (6 + Math.random() * 88).toFixed(2) + '%';
      span.style.animationDelay = (Math.random() * 0.45).toFixed(2) + 's';
      span.style.fontSize = (0.7 + Math.random() * 1.8).toFixed(2) + 'rem';
      storm.appendChild(span);
    }
  }

  function hardNameGlitch(rounds) {
    if (reduceMotion.matches) return;
    var logo = document.querySelector('.masthead__name, .curtain__mark');
    if (!logo) return;
    var original = (logo.getAttribute('data-latin') || logo.textContent || 'Tanishq Bafna').trim();
    var left = rounds || 5;

    function tick() {
      if (left <= 0) {
        logo.textContent = original;
        logo.classList.remove('is-beyond-hitch');
        if (window.IrisMotion && window.IrisMotion.burstGlitch) {
          window.IrisMotion.burstGlitch(logo, reduceMotion);
        }
        return;
      }
      left -= 1;
      var chars = original.split('');
      var i;
      for (i = 0; i < chars.length; i += 1) {
        if (chars[i] === ' ') continue;
        if (Math.random() > 0.45) continue;
        var options = HITCH_GLYPHS[chars[i]] || HITCH_GLYPHS[chars[i].toUpperCase()] || HITCH_GLYPHS[chars[i].toLowerCase()];
        if (!options) {
          options = STORM;
        }
        chars[i] = options[Math.floor(Math.random() * options.length)];
      }
      logo.classList.add('is-beyond-hitch');
      logo.textContent = chars.join('');
      if (window.IrisMotion && window.IrisMotion.burstGlitch && left % 2 === 0) {
        window.IrisMotion.burstGlitch(logo, reduceMotion);
      }
      window.setTimeout(tick, 90 + Math.floor(Math.random() * 70));
    }
    tick();
  }

  function runPhase(phaseClass, duration, done) {
    var seam = ensureOverlay();
    fillStorm();
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
    setWhisper('GO BEYOND');
    hardNameGlitch(7);
    runPhase('is-portal-leave', PORTAL_MS, function () { location.href = target; });
  }

  function goHome(href) {
    if (busy) return;
    busy = true;
    var target = withBeyondQuery(href, 'home');
    if (reduceMotion.matches) {
      runPhase('is-fade-out', FADE_MS, function () { location.href = target; });
      return;
    }
    setWhisper('RETURN');
    hardNameGlitch(5);
    runPhase('is-portal-return', SETTLE_MS, function () { location.href = target; });
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
      setWhisper('MULTIVERSE');
      if (reduceMotion.matches) {
        window.setTimeout(function () { html.classList.remove('is-beyond-enter'); }, FADE_MS);
        return;
      }
      hardNameGlitch(4);
      runPhase('is-portal-arrive', THRESHOLD_MS, function () {
        html.classList.remove('is-beyond-enter');
      });
      return;
    }

    if (!isMultiverse && html.classList.contains('is-beyond-home')) {
      window.setTimeout(function () { stripParams(['home']); }, 0);
      setWhisper('ORDINARY');
      if (reduceMotion.matches) {
        window.setTimeout(function () { html.classList.remove('is-beyond-home'); }, FADE_MS);
        return;
      }
      runPhase('is-portal-land', LAND_MS, function () {
        html.classList.remove('is-beyond-home');
      });
    }
  }

  function boot() {
    handleArrival();
    if (isMultiverse) wireHomeTab();
    else wireBeyondTab();
  }

  boot();
})();
