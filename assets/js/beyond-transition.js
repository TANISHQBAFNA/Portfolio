(function () {
  'use strict';

  var html = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var isMultiverse = html.classList.contains('is-multiverse');
  var busy = false;

  var ARRIVE_MS = 1400;
  var SETTLE_MS = 1600;
  var FADE_MS = 320;

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
    /* One story beat: cream paper tears → iris opens → Multiverse shows through */
    el.innerHTML =
      '<div class="beyond-seam__stage">' +
        '<div class="beyond-seam__void"></div>' +
        '<img class="beyond-seam__tear" src="assets/img/beyond-tear.svg?v=bx5" alt="" />' +
        '<div class="beyond-seam__well">' +
          '<img class="beyond-seam__spiral" src="assets/img/spiral-ref.svg?v=bx5" alt="" />' +
          '<img class="beyond-seam__iris" src="assets/img/beyond-iris.svg?v=bx5" alt="" />' +
        '</div>' +
        '<div class="beyond-seam__fringe" aria-hidden="true"></div>' +
        '<p class="beyond-seam__whisper" data-beyond-whisper></p>' +
      '</div>';
    document.body.appendChild(el);
    return el;
  }

  function setWhisper(text) {
    var node = document.querySelector('[data-beyond-whisper]');
    if (node) node.textContent = text || '';
  }

  function hitchWhisper(rounds) {
    if (reduceMotion.matches) return;
    var node = document.querySelector('[data-beyond-whisper]');
    if (!node) return;
    var original = (node.textContent || '').trim();
    if (!original) return;
    var glyphs = {
      G: ['Г', 'Γ'], O: ['О', 'Ο'], B: ['Б', 'Β', 'ब'], E: ['Е', 'Ε'],
      Y: ['Υ'], N: ['Ν', 'Н'], D: ['Д', 'Δ'], R: ['Я', 'Ρ'],
      T: ['ट', 'Т'], U: ['Ц'], A: ['А', 'Α'], M: ['М', 'Μ'],
      L: ['Л', 'Λ'], V: ['Ѵ'], H: ['Н', 'Η']
    };
    var left = rounds || 5;
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
        if (Math.random() > 0.55) continue;
        var opts = glyphs[chars[i]] || glyphs[chars[i].toUpperCase()];
        if (!opts) continue;
        chars[i] = opts[Math.floor(Math.random() * opts.length)];
      }
      node.textContent = chars.join('');
      window.setTimeout(tick, 85 + Math.floor(Math.random() * 50));
    }
    tick();
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

  function goHome(href) {
    if (busy) return;
    busy = true;
    var target = withBeyondQuery(href, 'home');
    if (reduceMotion.matches) {
      runPhase('is-fade-out', FADE_MS, function () { location.href = target; });
      return;
    }
    setWhisper('RETURN');
    hitchWhisper(6);
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

    hitchWhisper(7);
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
