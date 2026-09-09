/**
 * PortfolioLanding — bootstraps the landing experience.
 * Renders the rail from projectData, wires the header counter, hero reveal,
 * cursor light and the portrait placeholder fallback.
 */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  var stage = document.querySelector('[data-stage]');
  var track = document.querySelector('[data-rail-track]');
  var html = document.documentElement;
  var WORK = [
    {
      re: /sme banking/i,
      cardTitle: 'SME Banking',
      cardCaption: 'Intellect · Fintech · Money flows that finish',
      cardImage: 'assets/img/work/cin-work-sme.png',
      tone: 'cream'
    },
    {
      re: /agentic|workflow/i,
      cardTitle: 'AI workflow',
      cardCaption: 'AI · Banking · Surfaces that explain themselves',
      cardImage: 'assets/img/work/cin-work-helix.png',
      tone: 'cream'
    },
    {
      re: /plootus/i,
      cardTitle: 'Plootus',
      cardCaption: 'AI · Sales · Agents that call, dashboards that read',
      cardImage: 'assets/img/work/cin-work-plootus.png',
      tone: 'cream'
    },
    {
      re: /daughters/i,
      cardTitle: 'Daughters',
      cardCaption: 'iOS · Care · First session completes the job',
      cardImage: 'assets/img/work/cin-work-daughters.png',
      tone: 'cream'
    }
  ];
  var source = window.PORTFOLIO_PROJECTS || [];
  var projects = WORK.map(function (spec) {
    var found = null;
    source.forEach(function (project) {
      if (!found && spec.re.test(project.title)) found = project;
    });
    if (!found) return null;
    found.cardTitle = spec.cardTitle;
    found.cardCaption = spec.cardCaption;
    found.cardImage = spec.cardImage;
    found.cover = spec.cardImage;
    found.bentoTone = spec.tone;
    return found;
  }).filter(Boolean);

  var indexCurrent = document.querySelector('[data-index-current]');
  var indexTotal = document.querySelector('[data-index-total]');
  var progressFill = document.querySelector('[data-rail-progress]');
  var status = document.querySelector('[data-rail-status]');

  var homeButton = document.querySelector('[data-rail-home]');
  var slideCounter = document.querySelector('[data-rail-counter]');
  var slideCurrent = document.querySelector('[data-rail-counter-current]');
  var slideTotal = document.querySelector('[data-rail-counter-total]');
  var prevButton = document.querySelector('[data-rail-prev]');
  var nextButton = document.querySelector('[data-rail-next]');
  var deckProgress = document.querySelector('[data-deck-progress]');
  var deckProgressFill = document.querySelector('[data-deck-progress-fill]');

  function pad(number) {
    return String(number).length < 2 ? '0' + number : String(number);
  }

  /* ── render the rail ────────────────────────────────────────────────── */

  function renderProjects() {
    if (!track || !projects.length) return;
    var fragment = document.createDocumentFragment();
    projects.forEach(function (project, position) {
      fragment.appendChild(window.FolderCard.create(project, position, projects.length));
    });
    var endPanel = track.querySelector('.rail__end');
    if (endPanel) track.insertBefore(fragment, endPanel);
    else track.appendChild(fragment);
    if (indexTotal) indexTotal.textContent = pad(projects.length);
  }

  function wireStudyCurtainGlitch() {
    var veil = document.querySelector('[data-study-veil]');
    var lastWipe = html.classList.contains('is-study-wipe');

    function hitchVeil() {
      if (veil && window.IrisMotion && window.IrisMotion.hitchCurtain) {
        window.IrisMotion.hitchCurtain(veil, reduceMotion);
      }
    }

    new MutationObserver(function () {
      var wipe = html.classList.contains('is-study-wipe');
      if (wipe && !lastWipe) hitchVeil();
      lastWipe = wipe;
    }).observe(html, { attributes: true, attributeFilter: ['class'] });
  }

  /* ── hero reveal ────────────────────────────────────────────────────── */

  function revealHero() {
    if (window.IrisMotion && window.IrisMotion.revealLanding) {
      window.IrisMotion.revealLanding(html, reduceMotion);
      return;
    }
    var items = document.querySelectorAll(".reveal");
    items.forEach(function (item) { item.classList.add("is-revealed"); item.style.opacity = "1"; item.style.visibility = "visible"; });
    document.body.classList.add("is-ready");
  }

  /* ── portrait: keep a labelled placeholder until the real file loads ── */

  function wirePortrait() {
    var figure = document.querySelector('[data-portrait]');
    if (!figure) return;
    var image = figure.querySelector('.portrait__img');
    if (!image) return;

    function settle() {
      figure.classList.remove('is-pending');
      figure.classList.add('is-loaded');
    }
    if (image.complete && image.naturalWidth > 0) settle();
    else image.addEventListener('load', settle);
    image.addEventListener('error', function () {
      figure.classList.remove('is-pending');
      figure.classList.add('is-missing');
    });
  }

  /* ── cursor light (cheap: one rAF-throttled custom property write) ──── */

  function wireCursorLight() {
    var light = document.querySelector('[data-cursor-light]');
    if (!light || reduceMotion.matches || !window.matchMedia('(pointer: fine)').matches) return;

    var x = 0, y = 0, queued = false;
    window.addEventListener('pointermove', function (event) {
      x = event.clientX; y = event.clientY;
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () {
        queued = false;
        light.style.setProperty('--x', x + 'px');
        light.style.setProperty('--y', y + 'px');
      });
    }, { passive: true });
  }

  /* ── first-load sequence ────────────────────────────────────────────── */

  var CURTAIN_TEXT = 'Tanishq Bafna'; /* full name — never "Tanishq." */
  var NAME_BEATS = ['Tanishk Bafnaa', 'Tanish Bafna', 'Tanishq Bafna'];
  var HOLD_MS = 400; /* short beat on the real name, then lift */
  var EXIT_MS = 900;
  var MOVE_MS = 900;

  function isDesktop() {
    return window.matchMedia('(min-width: 768px)').matches;
  }

  var bentoTarget = 0;
  var bentoState = { p: 0 };
  var bentoTween = null;
  var bentoInputWired = false;

  function riseMax() {
    var run = document.querySelector('.scroll-run');
    return Math.max(1, (run ? run.offsetHeight : window.innerHeight * 2) - window.innerHeight);
  }

  function panelFlushFromRise(rise) {
    if (rise <= 0) return 1;
    if (rise >= 0.05) return 0;
    return 1 - rise / 0.05;
  }

  function updatePanelFlush() {
    if (isDesktop()) {
      var rise = parseFloat(html.style.getPropertyValue('--rise') || '1');
      html.style.setProperty('--panel-flush', panelFlushFromRise(rise).toFixed(4));
      return;
    }
    var rail = document.querySelector('.rail');
    if (!rail) return;
    var top = rail.getBoundingClientRect().top;
    var flush = 0;
    if (top <= 0) flush = 1;
    else if (top < 32) flush = 1 - top / 32;
    html.style.setProperty('--panel-flush', flush.toFixed(4));
  }

  var projectsHitchTimer = 0;
  function hitchProjectsCurtain() {
    if (reduceMotion.matches) return;
    html.classList.add('is-projects-hitching');
    if (projectsHitchTimer) window.clearTimeout(projectsHitchTimer);
    projectsHitchTimer = window.setTimeout(function () {
      html.classList.remove('is-projects-hitching');
    }, 900);
  }

  function applyRiseFromPanel(p) {
    var rise = 1 - Math.max(0, Math.min(1, p));
    html.style.setProperty('--rise', rise.toFixed(4));
    html.style.setProperty('--panel-flush', panelFlushFromRise(rise).toFixed(4));
    html.style.setProperty('--nav-out', '0');
    html.classList.remove('is-nav-away');
    var wasIn = html.classList.contains('is-projects-in');
    var nowIn = p > 0.08;
    html.classList.toggle('is-projects-in', nowIn);
    if (nowIn && !wasIn) hitchProjectsCurtain();
  }

  function tweenBento(next, immediate) {
    bentoTarget = Math.max(0, Math.min(1, next));

    if (immediate || reduceMotion.matches || typeof gsap === 'undefined') {
      if (bentoTween && bentoTween.kill) bentoTween.kill();
      bentoTween = null;
      bentoState.p = bentoTarget;
      applyRiseFromPanel(bentoTarget);
      return;
    }

    bentoTween = gsap.to(bentoState, {
      p: bentoTarget,
      duration: 0.85,
      ease: 'power3.out',
      overwrite: true,
      onUpdate: function () { applyRiseFromPanel(bentoState.p); }
    });
  }

  function progressFromScroll() {
    return Math.max(0, Math.min(1, window.scrollY / riseMax()));
  }

  function wireBentoInput() {
    if (bentoInputWired) return;
    bentoInputWired = true;

    window.addEventListener('scroll', function () {
      if (!html.classList.contains('is-home-scroll')) return;
      if (stage && stage.classList.contains('is-detail')) return;
      tweenBento(progressFromScroll());
    }, { passive: true });

    var workLink = document.querySelector('[data-nav-work]');
    if (workLink) {
      workLink.addEventListener('click', function (event) {
        event.preventDefault();
        if (stage && stage.classList.contains('is-detail')) return;
        window.scrollTo({
          top: riseMax(),
          behavior: reduceMotion.matches ? 'auto' : 'smooth'
        });
        tweenBento(1);
      });
    }
  }

  function enableHomeScroll() {
    if (!isDesktop() || (stage && stage.classList.contains('is-detail')) || html.classList.contains('is-study')) {
      html.classList.remove('is-home-scroll');
      return;
    }
    html.classList.add('is-home-scroll');
    wireBentoInput();
    tweenBento(progressFromScroll(), true);
  }

  function lockHomeScroll() {
    html.classList.remove('is-home-scroll');
    tweenBento(1, true);
  }

  function unlockHomeScroll() {
    enableHomeScroll();
    if (html.classList.contains('is-home-scroll')) {
      window.scrollTo(0, riseMax());
      tweenBento(1, true);
    }
  }

  function applyTheme(printShop) {
    html.classList.toggle('is-print', !!printShop);
    html.classList.remove('is-dark');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', printShop ? '#f3eee4' : '#0e1018');
    var btn = document.querySelector('[data-theme-toggle]');
    if (btn) {
      btn.setAttribute('aria-pressed', printShop ? 'true' : 'false');
      btn.setAttribute('aria-label', printShop ? 'Switch to night mode' : 'Switch to light mode');
    }
  }

  function wireTheme() {
    applyTheme(false);
    var btn = document.querySelector('[data-theme-toggle]');
    if (btn) {
      btn.addEventListener('click', function () {
        applyTheme(!html.classList.contains('is-print'));
      });
    }
  }

  function playCurtain(done) {
    var curtain = document.getElementById('curtain');
    var brand = curtain ? curtain.querySelector('.curtain__brand') : null;
    var mark = document.getElementById('curtain-mark');
    var identity = document.querySelector('.masthead__identity');
    var logo = document.querySelector('.masthead__name');
    var skip = /[?&]open=/.test(location.search);
    var BOLD = '800'; /* curtain + logo stay this weight — no mid-flight jump */

    function revealMasthead() {
      if (logo) {
        logo.style.fontWeight = BOLD;
        logo.classList.add('is-arrived');
        logo.classList.remove('is-awaiting-curtain');
        if (window.IrisMotion && window.IrisMotion.burstGlitch) {
          window.IrisMotion.burstGlitch(logo, reduceMotion);
        }
      }
      if (identity) identity.classList.remove('is-awaiting-curtain');
    }

    if (logo) {
      logo.classList.add('is-awaiting-curtain');
      logo.textContent = CURTAIN_TEXT;
      logo.style.fontWeight = BOLD;
    }
    if (identity) identity.classList.add('is-awaiting-curtain');

    if (!curtain || !brand || !mark || skip) {
      if (curtain) curtain.classList.add('is-skipped');
      html.classList.remove('is-curtain');
      revealMasthead();
      revealHero();
      if (done) done();
      return;
    }
    /* Reduced motion: still show the coffee curtain, skip the typewriter + fly */
    if (reduceMotion.matches) {
      html.classList.add('is-curtain');
      mark.textContent = CURTAIN_TEXT;
      mark.setAttribute('data-text', CURTAIN_TEXT);
      mark.classList.add('glitch');
      mark.style.opacity = '1';
      mark.style.color = getComputedStyle(html).getPropertyValue('--fg').trim() || '#f3eee4';
      whenPageLoaded(function () {
        setTimeout(function () {
          revealHero();
          if (typeof gsap !== 'undefined') {
            curtain.classList.add('is-lifting');
            gsap.to(curtain, { yPercent: -110, duration: 0.55, ease: 'power3.inOut', force3D: true });
          } else {
            curtain.classList.add('is-fading');
          }
          setTimeout(function () {
            curtain.classList.add('is-done');
            curtain.style.display = 'none';
            html.classList.remove('is-curtain');
            revealMasthead();
            if (done) done();
          }, 500);
        }, 500);
      });
      return;
    }

    html.classList.add('is-curtain');
    mark.style.fontFamily = '"Syne", sans-serif';
    mark.style.fontWeight = BOLD;
    mark.style.fontSynthesis = 'none';
    /* Match navbar logo size exactly (shared --mark-size) */
    if (logo) {
      mark.style.fontSize = window.getComputedStyle(logo).fontSize;
      mark.style.letterSpacing = window.getComputedStyle(logo).letterSpacing;
      mark.style.lineHeight = window.getComputedStyle(logo).lineHeight;
    }
    mark.style.whiteSpace = 'nowrap';
    mark.style.color = getComputedStyle(html).getPropertyValue('--fg').trim() || '#f3eee4';
    mark.style.margin = '0';
    mark.style.opacity = '1';
    mark.classList.add('glitch');
    mark.setAttribute('data-text', CURTAIN_TEXT);
    mark.textContent = '';

    var typedReady = false;
    var loadReady = document.readyState === 'complete';
    var liftStarted = false;

    function makeChar(ch) {
      var s = document.createElement('span');
      s.className = ch === ' ' ? 'curtain__ch curtain__ch--space' : 'curtain__ch';
      s.textContent = ch === ' ' ? '\u00a0' : ch;
      s.style.fontWeight = BOLD;
      return s;
    }

    function readMark() {
      return Array.prototype.map.call(mark.children, function (el) {
        return el.classList.contains('curtain__ch--space') ? ' ' : el.textContent;
      }).join('');
    }

    function diffChars(from, to) {
      var a = from.split('');
      var b = to.split('');
      var m = a.length;
      var n = b.length;
      var dp = [];
      var i;
      var j;
      for (i = 0; i <= m; i++) {
        dp[i] = [];
        for (j = 0; j <= n; j++) dp[i][j] = 0;
      }
      for (i = 1; i <= m; i++) {
        for (j = 1; j <= n; j++) {
          dp[i][j] = a[i - 1] === b[j - 1]
            ? dp[i - 1][j - 1] + 1
            : Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
      var ops = [];
      i = m;
      j = n;
      while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
          ops.push({ type: 'keep', ch: a[i - 1] });
          i -= 1;
          j -= 1;
        } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
          ops.push({ type: 'ins', ch: b[j - 1] });
          j -= 1;
        } else {
          ops.push({ type: 'del', ch: a[i - 1] });
          i -= 1;
        }
      }
      ops.reverse();
      return ops;
    }

    function armMarkGlitch(text) {
      mark.classList.add('glitch');
      mark.setAttribute('data-text', text || readMark() || CURTAIN_TEXT);
      if (window.IrisMotion && window.IrisMotion.burstGlitch) {
        window.IrisMotion.burstGlitch(mark, reduceMotion);
      }
    }

    var curtainGlitchId = 0;
    function pulseCurtainGlitch() {
      if (liftStarted || reduceMotion.matches) return;
      armMarkGlitch(readMark() || CURTAIN_TEXT);
    }

    function paintName(text, donePaint) {
      mark.textContent = '';
      var nodes = text.split('').map(makeChar);
      nodes.forEach(function (el) { mark.appendChild(el); });
      armMarkGlitch(text);
      if (typeof gsap === 'undefined') {
        if (donePaint) donePaint();
        return;
      }
      gsap.set(nodes, { opacity: 0, y: 8, filter: 'blur(7px)' });
      gsap.to(nodes, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.55,
        stagger: 0.028,
        ease: 'power3.out',
        onComplete: donePaint
      });
    }

    function morphName(toText, doneMorph) {
      if (typeof gsap === 'undefined') {
        mark.textContent = '';
        toText.split('').forEach(function (ch) { mark.appendChild(makeChar(ch)); });
        armMarkGlitch(toText);
        if (doneMorph) doneMorph();
        return;
      }

      var ops = diffChars(readMark(), toText);
      var existing = Array.prototype.slice.call(mark.children);
      var ei = 0;
      var insertEls = [];
      var deleteEls = [];

      ops.forEach(function (op) {
        if (op.type === 'keep') {
          ei += 1;
        } else if (op.type === 'del') {
          deleteEls.push(existing[ei]);
          ei += 1;
        } else {
          var el = makeChar(op.ch);
          mark.insertBefore(el, existing[ei] || null);
          insertEls.push(el);
        }
      });

      deleteEls.forEach(function (el) {
        if (!el) return;
        el.style.width = el.getBoundingClientRect().width + 'px';
        el.style.overflow = 'hidden';
      });
      insertEls.forEach(function (el) {
        var w = el.getBoundingClientRect().width;
        gsap.set(el, { width: 0, opacity: 0, y: 10, overflow: 'hidden', filter: 'blur(8px)' });
        el.setAttribute('data-w', String(w));
      });

      var tl = gsap.timeline({
        onComplete: function () {
          armMarkGlitch(toText);
          if (doneMorph) doneMorph();
        }
      });
      if (deleteEls.length) {
        tl.to(deleteEls, {
          opacity: 0,
          y: -12,
          width: 0,
          filter: 'blur(8px)',
          duration: 0.38,
          stagger: 0.04,
          ease: 'power2.in',
          onComplete: function () {
            deleteEls.forEach(function (el) {
              if (el && el.parentNode) el.parentNode.removeChild(el);
            });
          }
        }, 0);
      }
      if (insertEls.length) {
        tl.to(insertEls, {
          opacity: 1,
          y: 0,
          width: function (i, el) { return Number(el.getAttribute('data-w')); },
          filter: 'blur(0px)',
          duration: 0.42,
          stagger: 0.04,
          ease: 'power3.out',
          onComplete: function () {
            insertEls.forEach(function (el) {
              el.style.width = '';
              el.style.overflow = '';
              el.style.filter = '';
            });
          }
        }, deleteEls.length ? 0.08 : 0);
      }
    }

    function playNameBeats(doneBeats) {
      var step = 0;
      var BEAT_HOLD = 580;

      function afterBeat() {
        if (NAME_BEATS[step] === CURTAIN_TEXT && loadReady) {
          setTimeout(doneBeats, HOLD_MS);
          return;
        }
        var next = (step + 1) % NAME_BEATS.length;
        morphName(NAME_BEATS[next], function () {
          step = next;
          setTimeout(afterBeat, BEAT_HOLD);
        });
      }

      paintName(NAME_BEATS[0], function () {
        pulseCurtainGlitch();
        setTimeout(afterBeat, BEAT_HOLD);
      });
    }

    function beginLift() {
      if (liftStarted || !typedReady || !loadReady) return;
      liftStarted = true;
      if (curtainGlitchId) window.clearTimeout(curtainGlitchId);

      if (!logo || !identity) {
        revealHero();
        curtain.classList.add('is-done');
        html.classList.remove('is-curtain');
        revealMasthead();
        if (done) done();
        setTimeout(function () { curtain.style.display = 'none'; }, EXIT_MS + 40);
        return;
      }

      var ink = getComputedStyle(html).getPropertyValue('--curtain-ink').trim() || '#f3eee4';
      var logoStyle = window.getComputedStyle(logo);

      /* Flatten typed spans so the name is one solid word */
      mark.textContent = CURTAIN_TEXT;
      mark.style.fontFamily = '"Syne", sans-serif';
      mark.style.fontWeight = BOLD;
      mark.style.fontSynthesis = 'none';
      mark.style.fontSize = logoStyle.fontSize;
      mark.style.letterSpacing = logoStyle.letterSpacing;
      mark.style.lineHeight = logoStyle.lineHeight;
      mark.style.whiteSpace = 'nowrap';
      mark.style.color = getComputedStyle(html).getPropertyValue('--fg').trim() || '#f3eee4';
      mark.style.margin = '0';
      mark.setAttribute('data-text', CURTAIN_TEXT);
      mark.classList.add('glitch', 'is-glitching');
      if (typeof gsap !== 'undefined') gsap.set(mark, { y: 0, opacity: 1, clearProps: 'transform' });
      if (window.IrisMotion && window.IrisMotion.hitchCurtain) {
        window.IrisMotion.hitchCurtain(curtain, reduceMotion);
      }

      /* Pin the same name node over the page so it can rise with the curtain
         and slide left into the masthead seat. No clone, so nothing flashes. */
      var from = brand.getBoundingClientRect();
      var to = logo.getBoundingClientRect();
      curtain.style.transition = 'none';
      curtain.classList.add('is-lifting');
      curtain.style.pointerEvents = 'none';
      brand.classList.add('is-flying');
      brand.style.position = 'fixed';
      brand.style.left = from.left + 'px';
      brand.style.top = from.top + 'px';
      brand.style.margin = '0';
      brand.style.padding = '0';
      brand.style.zIndex = '220';
      brand.style.pointerEvents = 'none';
      brand.style.willChange = 'transform';
      document.body.appendChild(brand);

      from = brand.getBoundingClientRect();
      var dx = to.left - from.left;
      var dy = to.top - from.top;
      var ease = 'power3.inOut';
      var dur = MOVE_MS / 1000;

      function finishLift() {
        revealMasthead();
        if (brand.parentNode) brand.parentNode.removeChild(brand);
        curtain.classList.add('is-done');
        curtain.style.display = 'none';
        html.classList.remove('is-curtain');
        if (done) done();
      }

      /* Landing rises with the curtain, not after it. */
      revealHero();

      /* One clock: curtain goes up, name goes up and left, same duration and ease. */
      if (typeof gsap !== 'undefined') {
        var motion = { p: 0 };
        gsap.set(curtain, { yPercent: 0, force3D: true });
        gsap.set(brand, { x: 0, y: 0, force3D: true });
        gsap.to(motion, {
          p: 1,
          duration: dur,
          ease: ease,
          onUpdate: function () {
            var p = motion.p;
            gsap.set(curtain, { yPercent: -110 * p, force3D: true });
            gsap.set(brand, { x: dx * p, y: dy * p, force3D: true });
          },
          onComplete: finishLift
        });
        gsap.to(mark, { color: ink, duration: dur, ease: ease, overwrite: true });
      } else {
        curtain.classList.add('is-fading');
        brand.style.transition = 'transform ' + MOVE_MS + 'ms cubic-bezier(0.65, 0, 0.35, 1)';
        mark.style.transition = 'color ' + MOVE_MS + 'ms cubic-bezier(0.65, 0, 0.35, 1)';
        requestAnimationFrame(function () {
          brand.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
          mark.style.color = ink;
        });
        setTimeout(finishLift, MOVE_MS + 40);
      }
    }

    playNameBeats(function () {
      typedReady = true;
      beginLift();
    });

    if (!loadReady) {
      window.addEventListener('load', function () {
        loadReady = true;
        beginLift();
      }, { once: true });
    }
  }

  /* ── boot ───────────────────────────────────────────────────────────── */

  function fitHeroType() {
    var box = document.querySelector('.hero__type');
    var words = document.querySelectorAll('.hero__accent, .hero__word');
    if (!box || !words.length) return;
    var target = box.clientWidth;
    if (target < 40) return;

    var current = parseFloat(window.getComputedStyle(words[0]).fontSize);
    if (!current) return;
    var longest = 0;
    var i;
    for (i = 0; i < words.length; i++) {
      longest = Math.max(longest, words[i].getBoundingClientRect().width);
    }
    if (longest < 1) return;
    var size = current * (target / longest) * 0.995;
    size = Math.max(18, Math.min(size, 420));
    html.style.setProperty('--shout', size.toFixed(2) + 'px');
  }

  function wireHeroFit() {
    var queued = false;
    function requestFit() {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () {
        queued = false;
        fitHeroType();
      });
    }
    window.addEventListener('resize', requestFit);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(requestFit);
    requestFit();
  }

  function wireMagneticNav() {
    if (reduceMotion.matches || !window.matchMedia('(pointer: fine)').matches) return;
    var links = document.querySelectorAll('[data-magnetic]');
    links.forEach(function (link) {
      link.addEventListener('pointermove', function (event) {
        var box = link.getBoundingClientRect();
        var dx = (event.clientX - (box.left + box.width / 2)) * 0.18;
        var dy = (event.clientY - (box.top + box.height / 2)) * 0.18;
        link.style.setProperty('--mx', dx.toFixed(1) + 'px');
        link.style.setProperty('--my', dy.toFixed(1) + 'px');
        link.classList.add('is-magnet');
      });
      link.addEventListener('pointerleave', function () {
        link.style.setProperty('--mx', '0px');
        link.style.setProperty('--my', '0px');
        link.classList.remove('is-magnet');
      });
    });
  }

  function wireHeroGlitch() {
    var shouts = document.querySelectorAll('.hero__kicker.glitch, .hero__accent.glitch, .hero__word.glitch, .masthead__name.glitch');
    shouts.forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        if (window.IrisMotion && window.IrisMotion.burstGlitch) {
          window.IrisMotion.burstGlitch(el, reduceMotion);
        }
      });
    });
  }

  renderProjects();
  wireTheme();
  wirePortrait();
  wireCursorLight();
  wireHeroFit();
  wireMagneticNav();
  wireHeroGlitch();
  wireStudyCurtainGlitch();
  if (window.IrisMotion && window.IrisMotion.wireParticles) window.IrisMotion.wireParticles(reduceMotion);
  html.style.setProperty('--rise', /[?&]open=/.test(location.search) ? '0' : '1');
  html.style.setProperty('--nav-out', '0');
  updatePanelFlush();
  window.addEventListener('scroll', updatePanelFlush, { passive: true });
  window.addEventListener('resize', updatePanelFlush);

  function whenPageLoaded(done) {
    if (document.readyState === 'complete') {
      done();
      return;
    }
    window.addEventListener('load', done, { once: true });
  }

  function whenSyneReady(done) {
    var finished = false;
    var finish = function () {
      if (finished) return;
      finished = true;
      done();
    };
    /* Curtain must not type in a fallback face */
    if (document.fonts && document.fonts.load) {
      Promise.all([
        document.fonts.load('800 2.5rem "Syne"'),
        document.fonts.load('800 1.2rem "Syne"'),
        document.fonts.load('700 2.5rem "Syne"')
      ]).then(function () {
        return document.fonts.ready;
      }).then(finish).catch(finish);
      setTimeout(finish, 1800);
    } else {
      finish();
    }
  }

  whenSyneReady(function () {
    fitHeroType();
    var curtainEl = document.getElementById('curtain');
    if (curtainEl) {
      curtainEl.classList.remove('is-skipped', 'is-done', 'is-fading');
      curtainEl.style.display = '';
      curtainEl.style.opacity = '';
      curtainEl.style.transform = '';
    }
    html.classList.remove('curtain-skip');
    playCurtain(function () {
      fitHeroType();
      if (!/[?&]open=/.test(location.search)) enableHomeScroll();
    });
  });

  if (track && track.querySelectorAll('.folder-slot').length) {
    var detail = null;   // assigned below; the rail's callbacks close over it
    var rail = window.ProjectRail.create({
      track: track,
      prevButton: prevButton,
      nextButton: nextButton,
      onLockedStep: function (direction) { if (detail) detail.stepSlide(direction); },
      onLockedStart: function () { if (detail) detail.goToSlide(0, true); },
      onLockedEnd: function () { if (detail) detail.goToSlide(detail.slideCount() - 1, true); },
      onIndexChange: function (index, total) {
        if (detail && detail.isOpen()) return;   // the deck owns the readout
        if (indexCurrent) indexCurrent.textContent = pad(index + 1);
        if (status) status.textContent = 'Project ' + (index + 1) + ' of ' + total +
          ': ' + (projects[index] ? projects[index].title : '');
      },
      onProgress: function (progress) {
        if (progressFill) progressFill.style.transform = 'scaleX(' + Math.max(progress, 0.06) + ')';
        // Hero drifts a little against the rail — parallax, not a ride.
        if (stage && !reduceMotion.matches) {
          stage.style.setProperty('--rail-progress', progress.toFixed(4));
        }
      }
    });

    /* ── folder mode: while a project is open the controls walk its pages ── */

    var beatName = document.querySelector('[data-rail-beat-name]');
    var deckSlides = [];

    function paintDeckControls(index, count) {
      if (slideCurrent) slideCurrent.textContent = pad(index + 1);
      if (slideTotal) slideTotal.textContent = pad(count);
      if (prevButton) prevButton.disabled = index <= 0;
      if (nextButton) nextButton.disabled = index >= count - 1;

      var here = deckSlides[index] || {};
      var next = deckSlides[index + 1];
      if (beatName) beatName.textContent = here.title || here.headline || '';
      if (nextButton) {
        nextButton.setAttribute(
          'aria-label',
          next && next.title ? 'Turn to ' + next.title : 'Next page'
        );
      }
      if (prevButton) {
        var prev = deckSlides[index - 1];
        prevButton.setAttribute(
          'aria-label',
          prev && prev.title ? 'Turn back to ' + prev.title : 'Previous page'
        );
      }

      if (deckProgressFill) {
        var through = count > 1 ? (index + 1) / count : 1;
        deckProgressFill.style.transform = 'scaleX(' + through.toFixed(4) + ')';
      }
      if (status) {
        var label = here.title || here.headline || '';
        status.textContent = (label ? label + '. ' : '') +
          'Beat ' + (index + 1) + ' of ' + count;
      }
    }

    function enterDeckMode(index, count) {
      rail.lock();
      slideCounter.hidden = false;
      homeButton.hidden = false;
      deckProgress.hidden = false;
      prevButton.setAttribute('aria-label', 'Previous page');
      nextButton.setAttribute('aria-label', 'Next page');
      prevButton.setAttribute('aria-controls', 'project-detail');
      nextButton.setAttribute('aria-controls', 'project-detail');
      if (indexCurrent) indexCurrent.textContent = pad(index + 1);
      paintDeckControls(0, count);
    }

    function exitDeckMode() {
      rail.unlock();
      slideCounter.hidden = true;
      homeButton.hidden = true;
      deckProgress.hidden = true;
      if (deckProgressFill) deckProgressFill.style.transform = 'scaleX(0)';
      prevButton.setAttribute('aria-label', 'Previous project');
      nextButton.setAttribute('aria-label', 'Next project');
      prevButton.setAttribute('aria-controls', 'work');
      nextButton.setAttribute('aria-controls', 'work');
      if (indexCurrent) indexCurrent.textContent = pad(rail.activeIndex() + 1);
    }

    /* ── cinematic study: a card click opens the motion screen ── */
    var slots = rail.slots();
    var studyRoot = document.querySelector('[data-study]');
    detail = window.ProjectStudy && studyRoot
      ? window.ProjectStudy.create({
        root: studyRoot,
        projects: projects,
        onOpen: function (index) {
          slots.forEach(function (slot, i) {
            var link = slot.querySelector('[data-folder]');
            if (link) link.setAttribute('aria-expanded', i === index ? 'true' : 'false');
          });
          lockHomeScroll();
        },
        onClose: function () {
          slots.forEach(function (slot) {
            var link = slot.querySelector('[data-folder]');
            if (link) link.setAttribute('aria-expanded', 'false');
          });
          unlockHomeScroll();
        }
      })
      : null;

    var openQuery = /[?&]open=([^&]+)/.exec(location.search);
    if (openQuery && detail) {
      var needle = decodeURIComponent(openQuery[1]).replace(/\+/g, ' ').toLowerCase();
      projects.forEach(function (project, i) {
        if (project.title.toLowerCase().indexOf(needle) !== -1) {
          var deepLink = slots[i] && slots[i].querySelector('[data-folder]');
          detail.open(i, deepLink);
        }
      });
    }

    function openSlot(slot, trigger, event) {
      if (!slot || !detail) return;
      var index = slots.indexOf(slot);
      if (index < 0) return;
      if (event) event.preventDefault();
      var project = projects[index];
      if (!project) return;
      detail.open(index, trigger || slot.querySelector('[data-folder]'));
    }

    track.addEventListener('click', function (event) {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.button > 0) return;
      var slot = event.target.closest('.folder-slot');
      if (!slot) return;
      var link = event.target.closest('[data-folder]') || slot.querySelector('[data-folder]');
      // Whole folder — tab, title, body, cover — opens the case.
      openSlot(slot, link, event);
    });

    track.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      var slot = event.target.closest('.folder-slot');
      if (!slot) return;
      var link = event.target.closest('[data-folder]') || slot.querySelector('[data-folder]');
      if (event.target !== link && event.target !== slot) return;
      openSlot(slot, link, event);
    });

    if (homeButton) {
      homeButton.addEventListener('click', function () { if (detail) detail.close(); });
    }

    rail.measure();
    window.addEventListener('resize', function () {
      rail.measure();
      if (stage && !stage.classList.contains('is-detail') && !html.classList.contains('is-study')) enableHomeScroll();
    });

    var workLink = document.querySelector('[data-nav-work]');
    if (workLink) {
      workLink.addEventListener('click', function (event) {
        event.preventDefault();
        if (stage.classList.contains('is-detail') || (detail && detail.isOpen())) {
          if (detail) detail.close();
          return;
        }
        window.scrollTo({
          top: riseMax(),
          behavior: reduceMotion.matches ? 'auto' : 'smooth'
        });
        tweenBento(1);
      });
    }

    // Fonts land after first paint and change card widths.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { rail.measure(); });
    }
  }

  // No cookies on this site. Idle reload is the session reset: intro, rail,
  // and any open deck all come back as first load.
  var RESET_MS = 90000;
  var resetTimer = null;
  function armReset() {
    clearTimeout(resetTimer);
    resetTimer = setTimeout(function () { location.reload(); }, RESET_MS);
  }
  ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(function (type) {
    window.addEventListener(type, armReset, { passive: true });
  });
  armReset();
})();
