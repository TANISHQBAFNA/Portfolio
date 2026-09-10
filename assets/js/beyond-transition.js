(function () {
  'use strict';

  var html = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var isMultiverse = html.classList.contains('is-multiverse');
  var busy = false;

  /* Leave / return on Multiverse only. Arrive gates the Multiverse curtain. */
  var PORTAL_MS = 2100;
  var SETTLE_MS = 1900;
  var ARRIVE_MS = 1600;
  var FADE_MS = 320;

  var STORM = [
    'ट', 'Т', 'Τ', 'ت', '丁', 'अ', 'А', 'Α', 'ا',
    'न', 'Ν', 'ن', 'ब', 'В', 'Β', 'ب', 'क', 'Κ',
    '‡', '◇', '☰', '※', '✦'
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
    e: ['е', 'ε'],
    G: ['Г', 'Γ'],
    O: ['О', 'Ο', '0'],
    E: ['Е', 'Ε'],
    Y: ['Υ', 'Ү'],
    N: ['Ν', 'ن', 'Н'],
    D: ['Д', 'Δ'],
    R: ['Я', 'Ρ'],
    U: ['Ц', '∪'],
    M: ['М', 'Μ'],
    L: ['Л', 'Λ'],
    V: ['Ѵ', 'ν'],
    H: ['Н', 'Η']
  };

  window.__beyondPortal = {
    needed: false,
    done: false,
    waiters: []
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

  function markPortalDone() {
    var gate = window.__beyondPortal;
    gate.done = true;
    gate.waiters.splice(0).forEach(function (fn) {
      try { fn(); } catch (err) { /* ignore */ }
    });
    try {
      window.dispatchEvent(new CustomEvent('beyond:portal-done'));
    } catch (err) { /* ignore */ }
  }

  if (isMultiverse && hasParam('beyond')) {
    html.classList.add('is-beyond-enter');
    window.__beyondPortal.needed = true;
  }

  function ensureOverlay() {
    var el = document.getElementById('beyond-seam');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'beyond-seam';
    el.className = 'beyond-seam';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML =
      '<div class="beyond-seam__void"></div>' +
      '<div class="beyond-seam__vignette"></div>' +
      '<div class="beyond-seam__warp"></div>' +
      '<div class="beyond-seam__portal beyond-seam__portal--core"></div>' +
      '<div class="beyond-seam__portal beyond-seam__portal--mid"></div>' +
      '<div class="beyond-seam__portal beyond-seam__portal--rim"></div>' +
      '<div class="beyond-seam__ring beyond-seam__ring--a"></div>' +
      '<div class="beyond-seam__ring beyond-seam__ring--b"></div>' +
      '<div class="beyond-seam__ring beyond-seam__ring--c"></div>' +
      '<div class="beyond-seam__ring beyond-seam__ring--d"></div>' +
      '<div class="beyond-seam__shards" data-beyond-shards></div>' +
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
    var count = 48;
    var i;
    for (i = 0; i < count; i += 1) {
      var span = document.createElement('span');
      span.className = 'beyond-seam__glyph';
      span.textContent = STORM[Math.floor(Math.random() * STORM.length)];
      var angle = (i / count) * Math.PI * 2;
      var radius = 18 + Math.random() * 38;
      span.style.left = (50 + Math.cos(angle) * radius).toFixed(2) + '%';
      span.style.top = (50 + Math.sin(angle) * radius * 0.72).toFixed(2) + '%';
      span.style.animationDelay = (Math.random() * 0.55).toFixed(2) + 's';
      span.style.fontSize = (0.65 + Math.random() * 2.1).toFixed(2) + 'rem';
      span.style.setProperty('--gx', ((Math.random() - 0.5) * 80).toFixed(1) + 'px');
      span.style.setProperty('--gy', ((Math.random() - 0.5) * 60).toFixed(1) + 'px');
      storm.appendChild(span);
    }
  }

  function fillShards() {
    var host = document.querySelector('[data-beyond-shards]');
    if (!host) return;
    host.innerHTML = '';
    var i;
    for (i = 0; i < 14; i += 1) {
      var shard = document.createElement('span');
      shard.className = 'beyond-seam__shard';
      shard.style.left = (8 + Math.random() * 84).toFixed(2) + '%';
      shard.style.top = (10 + Math.random() * 80).toFixed(2) + '%';
      shard.style.width = (18 + Math.random() * 70).toFixed(1) + 'px';
      shard.style.height = (2 + Math.random() * 4).toFixed(1) + 'px';
      shard.style.transform = 'rotate(' + (Math.random() * 180).toFixed(1) + 'deg)';
      shard.style.animationDelay = (Math.random() * 0.4).toFixed(2) + 's';
      host.appendChild(shard);
    }
  }

  function hardWhisperGlitch(rounds) {
    if (reduceMotion.matches) return;
    var node = document.querySelector('[data-beyond-whisper]');
    if (!node) return;
    var original = (node.textContent || '').trim();
    if (!original) return;
    var left = rounds || 6;

    function tick() {
      if (left <= 0) {
        node.textContent = original;
        return;
      }
      left -= 1;
      var chars = original.split('');
      var i;
      for (i = 0; i < chars.length; i += 1) {
        if (chars[i] === ' ') continue;
        if (Math.random() > 0.5) continue;
        var key = chars[i];
        var options = HITCH_GLYPHS[key] || HITCH_GLYPHS[key.toUpperCase()] || HITCH_GLYPHS[key.toLowerCase()] || STORM;
        chars[i] = options[Math.floor(Math.random() * options.length)];
      }
      node.textContent = chars.join('');
      window.setTimeout(tick, 70 + Math.floor(Math.random() * 55));
    }
    tick();
  }

  function runPhase(phaseClass, duration, done) {
    var seam = ensureOverlay();
    fillStorm();
    fillShards();
    seam.className = 'beyond-seam is-active is-alive ' + phaseClass;
    html.classList.add('is-beyond-crossing');
    document.body.classList.add('is-beyond-crossing');
    /* Second storm refresh mid-beat so glyphs keep moving, not one frozen spray */
    window.setTimeout(function () {
      if (!seam.classList.contains('is-active')) return;
      fillStorm();
      fillShards();
      seam.classList.add('is-pulse');
    }, Math.floor(duration * 0.42));
    window.setTimeout(function () {
      seam.className = 'beyond-seam';
      html.classList.remove('is-beyond-crossing');
      document.body.classList.remove('is-beyond-crossing');
      if (done) done();
    }, duration);
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
    hardWhisperGlitch(9);
    runPhase('is-portal-return', SETTLE_MS, function () { location.href = target; });
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
    if (!(isMultiverse && html.classList.contains('is-beyond-enter'))) {
      markPortalDone();
      return;
    }

    window.setTimeout(function () { stripParams(['beyond']); }, 0);
    setWhisper('GO BEYOND');

    if (reduceMotion.matches) {
      runPhase('is-fade-out', FADE_MS, function () {
        html.classList.remove('is-beyond-enter');
        markPortalDone();
      });
      return;
    }

    hardWhisperGlitch(10);
    runPhase('is-portal-arrive', ARRIVE_MS, function () {
      html.classList.remove('is-beyond-enter');
      markPortalDone();
    });
  }

  function boot() {
    handleArrival();
    if (isMultiverse) wireHomeTab();
  }

  boot();
})();
