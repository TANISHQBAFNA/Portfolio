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
  var projects = window.PORTFOLIO_PROJECTS || [];

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

  /* ── hero reveal ────────────────────────────────────────────────────── */

  function revealHero() {
    var items = document.querySelectorAll('.reveal');
    if (reduceMotion.matches) {
      items.forEach(function (item) { item.classList.add('is-revealed'); });
      document.body.classList.add('is-ready');
      return;
    }
    items.forEach(function (item, i) {
      item.style.transitionDelay = (0.08 + i * 0.075) + 's';
    });
    // Both a frame and a timer, and the work is idempotent. The hero's heading
    // starts at `opacity: 0` and this is what turns it on — so if the frame
    // never arrives (loaded in a background tab, a throttled renderer) the
    // headline would simply never appear. Every other released-on-a-frame state
    // in this codebase carries the same belt; this one was missing it.
    var reveal = function () {
      document.body.classList.add('is-ready');
      items.forEach(function (item) { item.classList.add('is-revealed'); });
    };
    requestAnimationFrame(reveal);
    setTimeout(reveal, 140);
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

  var INTRO_MS = 1500;   // longest delay + duration, plus a little

  function playIntro() {
    if (!stage || reduceMotion.matches) return;
    stage.classList.add('is-intro');
    // Dropped once it has played, so nothing lingers to interfere with the
    // transform-driven hover and deck states.
    setTimeout(function () { stage.classList.remove('is-intro'); }, INTRO_MS);
  }

  /* ── boot ───────────────────────────────────────────────────────────── */

  renderProjects();
  playIntro();
  wirePortrait();
  wireCursorLight();
  revealHero();

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

    function paintDeckControls(index, count) {
      if (slideCurrent) slideCurrent.textContent = pad(index + 1);
      if (slideTotal) slideTotal.textContent = pad(count);
      if (prevButton) prevButton.disabled = index <= 0;
      if (nextButton) nextButton.disabled = index >= count - 1;

      // A single slide is its own whole story, so show it as complete.
      if (deckProgressFill) {
        var through = count > 1 ? (index + 1) / count : 1;
        deckProgressFill.style.transform = 'scaleX(' + through.toFixed(4) + ')';
      }
      if (status) {
        var pageTitle = document.querySelector('[data-page][data-index="' + index + '"] [data-page-title]');
        var label = pageTitle ? pageTitle.textContent : '';
        status.textContent = 'Page ' + (index + 1) + ' of ' + count + (label ? ': ' + label : '');
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

    /* ── detail view: a folder click pulls the project out of the pile ── */
    var slots = rail.slots();
    detail = window.ProjectDetail.create({
      panel: document.querySelector('[data-detail]'),
      stage: stage,
      projects: projects,
      slots: slots,
      onOpen: function (index, slideCount) {
        slots.forEach(function (slot, i) {
          var link = slot.querySelector('[data-folder]');
          if (link) link.setAttribute('aria-expanded', i === index ? 'true' : 'false');
        });
        enterDeckMode(index, slideCount);
      },
      onSlideChange: function (index, count) { paintDeckControls(index, count); },
      onClose: function () {
        slots.forEach(function (slot) {
          var link = slot.querySelector('[data-folder]');
          if (link) link.setAttribute('aria-expanded', 'false');
        });
        exitDeckMode();
      }
    });

    var openQuery = /[?&]open=([^&]+)/.exec(location.search);
    if (openQuery) {
      var needle = decodeURIComponent(openQuery[1]).replace(/\+/g, ' ').toLowerCase();
      projects.forEach(function (project, i) {
        if (project.status === 'live' && project.title.toLowerCase().indexOf(needle) !== -1) {
          var deepLink = slots[i] && slots[i].querySelector('[data-folder]');
          detail.open(i, deepLink);
          var pageQuery = /[?&]page=(\d+)/.exec(location.search);
          if (pageQuery) {
            var pageNum = parseInt(pageQuery[1], 10);
            if (!isNaN(pageNum) && pageNum > 1) {
              setTimeout(function () { detail.goToSlide(pageNum - 1, false); }, 50);
            }
          }
        }
      });
    }

    function openSlot(slot, trigger, event) {
      if (!slot) return;
      var index = slots.indexOf(slot);
      if (index < 0) return;
      if (event) event.preventDefault();
      var project = projects[index];
      // Empty / non-live folders stay on the rail — no fake case.
      if (!project || project.status !== 'live') return;
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

    homeButton.addEventListener('click', function () { detail.close(); });

    /* ── fill the screen when the columns actually fit ─────────────────────
       The rail is a scrolling row by necessity, not by preference. When the
       viewport is wide enough to hold every folder plus the closing panel at a
       sensible width, they are sized to fill it exactly — no scroll, nothing
       clipped off the right edge, and the arrows disable themselves because
       there is nowhere to go. Below that, the folders keep their minimum width
       and the row scrolls as before. Derived from the live column count, so
       adding a project needs no change here. */

    var MIN_FILL_W = 300;   // below this a folder is too cramped to fill with
    var root = document.documentElement;

    function fitRail() {
      if (!window.matchMedia('(min-width: 768px)').matches) {
        root.style.removeProperty('--card-w');
        root.style.removeProperty('--end-w');
        delete track.dataset.fills;
        return;
      }

      // Measure with any previous override cleared, so this is idempotent.
      root.style.removeProperty('--card-w');
      root.style.removeProperty('--end-w');

      var styles = getComputedStyle(track);
      var columns = track.children.length;               // folders + closing panel
      var gutters = parseFloat(styles.paddingInlineStart) + parseFloat(styles.paddingInlineEnd);
      var gaps = parseFloat(styles.columnGap) * (columns - 1);
      var per = (track.clientWidth - gutters - gaps) / columns;

      if (per >= MIN_FILL_W) {
        root.style.setProperty('--card-w', per.toFixed(2) + 'px');
        root.style.setProperty('--end-w', per.toFixed(2) + 'px');
        track.dataset.fills = 'true';
      } else {
        delete track.dataset.fills;
      }
    }

    fitRail();
    rail.measure();
    window.addEventListener('resize', function () { fitRail(); rail.measure(); });

    // "Work" moves to the first project instead of jumping the document.
    var workLink = document.querySelector('[data-nav-work]');
    if (workLink) {
      workLink.addEventListener('click', function (event) {
        event.preventDefault();
        detail.close();
      });
    }

    // Fonts land after first paint and change card widths.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { fitRail(); rail.measure(); });
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
