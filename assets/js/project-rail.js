/**
 * ProjectRail + HorizontalNavigation
 * ---------------------------------------------------------------------------
 * Desktop: vertical wheel / trackpad input is translated into horizontal
 * movement, one folder per gesture however hard it is thrown. Arrow keys and the
 * on-screen buttons move one card too; dragging is free, with a snap on release.
 *
 * Touch / small screens: native scrolling with CSS scroll-snap is left alone,
 * so the page never traps a phone user.
 *
 * Nothing here assumes a fixed card width — positions are measured from the
 * DOM, so changing card size in CSS needs no JS change.
 */
window.ProjectRail = (function () {
  'use strict';

  var LERP = 0.085;           // softer glide: settles ~450–550ms
  var WHEEL_STEP = 40;        // wheel px that counts as a deliberate gesture
  var WHEEL_QUIET = 140;      // ms of stillness that ends a gesture
  var DRAG_THRESHOLD = 6;     // px before a mouse drag suppresses the click
  var EDGE = 2;               // px tolerance for "we are at an end"

  function clamp(value, min, max) {
    return value < min ? min : value > max ? max : value;
  }

  function create(options) {
    var track = options.track;
    var slots = [];
    var positions = [];
    var padLeft = 0;
    var maxScroll = 0;
    var target = 0;
    var current = 0;   // authoritative position; never read back from the DOM
    var frame = null;
    var settleTimer = null;
    var activeIndex = -1;
    var keyboardIntent = false;   // was the last input a key, or a pointer?
    var locked = false;           // true while a project deck owns the arrows
    var wheelBank = 0;            // delta accumulated within the current gesture
    var wheelSpent = false;       // this gesture has already moved us one step
    var progressListeners = [];
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    /* ── geometry ─────────────────────────────────────────────────────── */

    function measure() {
      slots = Array.prototype.slice.call(track.querySelectorAll('.folder-slot'));
      padLeft = parseFloat(getComputedStyle(track).paddingInlineStart) || 0;
      positions = slots.map(function (slot) { return slot.offsetLeft - padLeft; });
      maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
      current = clamp(track.scrollLeft, 0, maxScroll);
      target = current;
      report();
    }

    /** True when we drive the rail ourselves rather than letting the OS scroll. */
    function isManaged() {
      return window.matchMedia('(min-width: 768px) and (pointer: fine)').matches && maxScroll > 1;
    }

    function nearestIndex(scrollLeft) {
      var best = 0;
      var bestDistance = Infinity;
      for (var i = 0; i < positions.length; i++) {
        var distance = Math.abs(clamp(positions[i], 0, maxScroll) - scrollLeft);
        if (distance < bestDistance) { bestDistance = distance; best = i; }
      }
      return best;
    }

    /* ── movement ─────────────────────────────────────────────────────── */

    /**
     * Position is integrated in JS and only written to the DOM. Reading
     * scrollLeft back each frame invites sub-pixel rounding feedback, which
     * can leave the rail a pixel or two short of a card.
     */
    function run() {
      var distance = target - current;

      if (reduceMotion.matches || Math.abs(distance) < 0.5) {
        current = target;
        track.scrollLeft = current;
        frame = null;
        report();
        return;
      }

      current += distance * LERP;
      track.scrollLeft = current;
      report();
      frame = requestAnimationFrame(run);
    }

    function moveTo(scrollLeft) {
      target = clamp(scrollLeft, 0, maxScroll);
      // Always re-arm rather than trusting a stored handle: a frame that never
      // ran (backgrounded tab, interrupted paint) must not wedge the rail.
      if (frame !== null) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(run);
    }

    function goToIndex(index) {
      var bounded = clamp(index, 0, positions.length - 1);
      moveTo(positions[bounded]);
      return bounded;
    }

    function step(direction) {
      if (locked) {
        if (options.onLockedStep) options.onLockedStep(direction);
        return;
      }
      goToIndex(nearestIndex(target) + direction);
    }

    /* ── reporting: counter, progress, active card, controls ──────────── */

    function report() {
      var scrollLeft = frame === null ? track.scrollLeft : current;
      var index = nearestIndex(scrollLeft);
      var progress = maxScroll > 0 ? clamp(scrollLeft / maxScroll, 0, 1) : 0;

      if (index !== activeIndex) {
        activeIndex = index;
        slots.forEach(function (slot, i) { slot.classList.toggle('is-active', i === index); });
        if (options.onIndexChange) options.onIndexChange(index, slots.length);
      }

      if (options.onProgress) options.onProgress(progress);
      progressListeners.forEach(function (listener) { listener(progress); });

      if (!locked) {
        if (options.prevButton) options.prevButton.disabled = maxScroll <= EDGE || scrollLeft <= EDGE;
        if (options.nextButton) options.nextButton.disabled = maxScroll <= EDGE || scrollLeft >= maxScroll - EDGE;
      }
    }

    /* ── input: wheel ─────────────────────────────────────────────────── */

    function normaliseWheel(event) {
      var delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      if (event.deltaMode === 1) delta *= 16;               // lines
      else if (event.deltaMode === 2) delta *= track.clientWidth; // pages
      return delta;
    }

    /**
     * One gesture moves one card. Not one wheel event, and not one card per
     * however-many-pixels — a trackpad flick fires wheel events for the length
     * of its momentum, and a spun mouse wheel fires dozens, either of which
     * would fly through the row. So: accumulate until the delta looks
     * deliberate, move exactly one card, then ignore the rest of the gesture.
     * A gesture ends only once the wheel has been still for WHEEL_QUIET, so the
     * momentum tail cannot buy a second step.
     */
    function endGesture() {
      wheelSpent = false;
      wheelBank = 0;
    }

    function onWheel(event) {
      if (locked) return;   // the board owns wheel while a project is open
      if (!isManaged() || event.ctrlKey) return;   // ctrl+wheel is browser zoom
      var rise = parseFloat(document.documentElement.style.getPropertyValue('--rise') || '1');
      if (document.documentElement.classList.contains('is-home-scroll') && rise > 0.01) {
        return;
      }
      var delta = normaliseWheel(event);
      if (!delta) return;
      event.preventDefault();

      // Every event pushes the end of the gesture further out.
      clearTimeout(settleTimer);
      settleTimer = setTimeout(endGesture, WHEEL_QUIET);

      if (wheelSpent) return;

      // A change of direction is a new intention, so start counting again.
      if (wheelBank !== 0 && (wheelBank > 0) !== (delta > 0)) wheelBank = 0;
      wheelBank += delta;
      if (Math.abs(wheelBank) < WHEEL_STEP) return;

      var direction = wheelBank > 0 ? 1 : -1;
      wheelBank = 0;
      wheelSpent = true;

      if (locked) {
        if (options.onLockedStep) options.onLockedStep(direction);
      } else {
        goToIndex(nearestIndex(target) + direction);
      }
    }

    /* ── input: keyboard ──────────────────────────────────────────────── */

    function isTypingTarget(node) {
      if (!node) return false;
      return /^(input|textarea|select)$/i.test(node.tagName) || node.isContentEditable;
    }

    function onKeydown(event) {
      if (event.metaKey || event.ctrlKey || event.altKey || isTypingTarget(event.target)) return;

      if (event.key === 'ArrowRight' || (locked && event.key === 'ArrowDown')) {
        event.preventDefault();
        step(1);
      } else if (event.key === 'ArrowLeft' || (locked && event.key === 'ArrowUp')) {
        event.preventDefault();
        step(-1);
      } else if (event.key === 'Home') {
        event.preventDefault();
        if (locked) {
          if (options.onLockedStart) options.onLockedStart();
        } else goToIndex(0);
      } else if (event.key === 'End') {
        event.preventDefault();
        if (locked) {
          if (options.onLockedEnd) options.onLockedEnd();
        } else goToIndex(positions.length - 1);
      } else return;

      clearTimeout(settleTimer);
    }

    /* ── input: mouse drag ────────────────────────────────────────────── */

    function bindDrag() {
      var dragging = false;
      var suppressClick = false;
      var startX = 0;
      var startScroll = 0;

      track.addEventListener('pointerdown', function (event) {
        if (event.pointerType !== 'mouse' || event.button !== 0 || !isManaged()) return;
        dragging = true;
        suppressClick = false;
        startX = event.clientX;
        startScroll = track.scrollLeft;
        clearTimeout(settleTimer);
      });

      track.addEventListener('pointermove', function (event) {
        if (!dragging) return;
        var travelled = event.clientX - startX;
        if (!suppressClick && Math.abs(travelled) > DRAG_THRESHOLD) {
          suppressClick = true;
          track.dataset.dragging = 'true';
        }
        if (suppressClick) {
          event.preventDefault();
          if (frame !== null) { cancelAnimationFrame(frame); frame = null; }
          current = clamp(startScroll - travelled, 0, maxScroll);
          target = current;
          track.scrollLeft = current;
          report();
        }
      });

      function endDrag() {
        if (!dragging) return;
        dragging = false;
        delete track.dataset.dragging;
        if (suppressClick) goToIndex(nearestIndex(target));
      }

      window.addEventListener('pointerup', endDrag);
      window.addEventListener('pointercancel', endDrag);

      // A drag must never navigate.
      track.addEventListener('click', function (event) {
        if (suppressClick) { event.preventDefault(); suppressClick = false; }
      }, true);
      track.addEventListener('dragstart', function (event) { event.preventDefault(); });
    }

    /* ── wiring ───────────────────────────────────────────────────────── */

    measure();
    bindDrag();

    // Native scrolling (touch swipe, scrollbar, browser scroll-into-view) is the
    // source of truth whenever we are not animating.
    track.addEventListener('scroll', function () {
      if (frame !== null) return;
      current = track.scrollLeft;
      target = current;
      report();
    }, { passive: true });
    window.addEventListener('wheel', onWheel, { passive: false });
    document.addEventListener('keydown', onKeydown);

    // Intent tracking: a pointer press clears it, a navigation key sets it.
    window.addEventListener('pointerdown', function () { keyboardIntent = false; }, true);
    window.addEventListener('keydown', function (event) {
      if (event.key === 'Tab' || event.key.indexOf('Arrow') === 0 ||
          event.key === 'Home' || event.key === 'End') keyboardIntent = true;
    }, true);
    window.addEventListener('resize', measure);

    // Tabbing to an off-screen folder brings it into view. Clicking one — or
    // having focus handed back when a project closes — must not move the rail:
    // position belongs to the user, changed only by wheel, arrows or drag.
    track.addEventListener('focusin', function (event) {
      var slot = event.target.closest('.folder-slot');
      if (!slot || !isManaged() || !keyboardIntent) return;
      goToIndex(slots.indexOf(slot));
      // Folders extend past the bottom edge, so the browser's own
      // scroll-into-view would drag the composition up. Undo it only
      // while a case is open — home now owns vertical scroll.
      var stage = track.closest('[data-stage]');
      if (stage && stage.classList.contains('is-detail')) {
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        stage.scrollTop = 0;
        stage.scrollLeft = 0;
      }
      track.scrollTop = 0;
    });

    if (options.prevButton) options.prevButton.addEventListener('click', function () { step(-1); });
    if (options.nextButton) options.nextButton.addEventListener('click', function () { step(1); });

    return {
      measure: measure,
      goToIndex: goToIndex,
      step: step,
      slots: function () { return slots; },
      activeIndex: function () { return activeIndex; },
      lock: function () { locked = true; endGesture(); },
      unlock: function () { locked = false; endGesture(); report(); },
      onProgress: function (listener) { progressListeners.push(listener); listener(0); }
    };
  }

  return { create: create };
})();
