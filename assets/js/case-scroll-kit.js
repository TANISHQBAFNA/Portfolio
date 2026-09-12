/**
 * CaseScrollKit — shared GSAP + ScrollTrigger grammar for opened-case pages.
 * Free core + ScrollTrigger only. No Flip / SplitText / MorphSVG.
 *
 * Cinematic path: pin chapter, scrub frames, captions land with the beat.
 * prefers-reduced-motion: static stack, same order and captions, no pins/scrub.
 */
window.CaseScrollKit = (function () {
  'use strict';

  var instances = [];

  function reduceQuery() {
    return window.matchMedia('(prefers-reduced-motion: reduce)');
  }

  function framesOf(page) {
    return Array.prototype.slice.call(page.querySelectorAll('[data-case-frame]'));
  }

  function captionsOf(frame) {
    return frame.querySelector('[data-case-caption], figcaption');
  }

  function pageId(page) {
    return page.getAttribute('data-case-page') || '';
  }

  function headerPx(scroller, headerFn) {
    if (typeof headerFn === 'function') return headerFn();
    var chrome = scroller.querySelector('.study__chrome');
    if (!chrome) return 88;
    return Math.round(chrome.getBoundingClientRect().bottom);
  }

  function setStage(page, on) {
    var viz = page.querySelector('[data-case-viz]');
    if (!viz) return;
    viz.classList.toggle('is-stage', !!on);
  }

  function resetStages(world) {
    Array.prototype.forEach.call(world.querySelectorAll('[data-case-page]'), function (page) {
      setStage(page, false);
      page.classList.remove('is-static');
    });
  }

  function revealStatic(world) {
    var pages = world.querySelectorAll('[data-case-page]');
    Array.prototype.forEach.call(pages, function (page) {
      page.classList.add('is-static');
      setStage(page, false);
      var claim = page.querySelector('[data-case-claim]');
      if (claim) {
        claim.style.opacity = '1';
        claim.style.visibility = 'visible';
        claim.style.transform = 'none';
      }
      framesOf(page).forEach(function (frame) {
        frame.style.opacity = '1';
        frame.style.visibility = 'visible';
        frame.style.transform = 'none';
        var cap = captionsOf(frame);
        if (cap) {
          cap.style.opacity = '1';
          cap.style.visibility = 'visible';
          cap.style.transform = 'none';
        }
      });
    });
  }

  function bindStepWatchers(scroller, pages, onStep, onPage, triggers) {
    pages.forEach(function (page, i) {
      triggers.push(window.ScrollTrigger.create({
        trigger: page,
        scroller: scroller,
        start: 'top 55%',
        end: 'bottom 45%',
        onToggle: function (self) {
          if (!self.isActive) return;
          if (onStep) onStep(i);
          if (onPage) onPage(pageId(page), i);
          pages.forEach(function (el, j) {
            el.classList.toggle('is-active', j === i);
          });
        }
      }));
    });
  }

  function bindCinematic(opts, pages, mmCleanup) {
    var scroller = opts.scroller;
    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;
    var triggers = [];
    var head = function () { return headerPx(scroller, opts.headerOffset); };

    pages.forEach(function (page) {
      var pinWanted = page.getAttribute('data-pin') !== 'false';
      var pin = pinWanted && !window.matchMedia('(max-width: 960px)').matches;
      var isCover = page.getAttribute('data-case-page') === 'cover';
      var copy = page.querySelector('[data-case-copy]');
      var claim = page.querySelector('[data-case-claim]');
      var sentence = page.querySelector('.case-sentence');
      var beat = page.querySelector('.case-beat');
      var frameEls = framesOf(page);
      var focusEls = Array.prototype.slice.call(page.querySelectorAll('[data-focus-item]'));
      var hold = page.querySelector('[data-case-hold]') || page;
      var tl = gsap.timeline({
        defaults: { ease: 'none', duration: 1 }
      });

      /* Claim first: type is readable before any viz scrub. */
      [copy, claim, sentence, beat].forEach(function (node) {
        if (node) gsap.set(node, { autoAlpha: 1, y: 0 });
      });

      if (isCover) {
        frameEls.forEach(function (frame) {
          gsap.set(frame, { autoAlpha: 1, y: 0 });
        });
        return;
      }

      var stage = pin && frameEls.length > 0;
      setStage(page, stage);

      if (focusEls.length) {
        gsap.set(focusEls, { autoAlpha: 1 });
      }

      frameEls.forEach(function (frame, i) {
        var cap = captionsOf(frame);
        var isFirst = i === 0;
        if (cap) gsap.set(cap, { autoAlpha: isFirst ? 1 : 0, y: isFirst ? 0 : 8 });
        gsap.set(frame, { autoAlpha: isFirst ? 1 : 0, y: 0 });

        if (!isFirst) {
          tl.to(frameEls[i - 1], { autoAlpha: 0, duration: 0.55 }, '>');
          tl.to(frame, { autoAlpha: 1, duration: 0.7 }, '<');
          if (cap) tl.to(cap, { autoAlpha: 1, y: 0, duration: 0.35 }, '<0.28');
        }

        var localFocus = Array.prototype.slice.call(frame.querySelectorAll('[data-focus-item]'));
        if (localFocus.length) {
          var ends = localFocus.filter(function (el) {
            return el.getAttribute('data-focus-item') === 'end';
          });
          var rest = localFocus.filter(function (el) {
            return el.getAttribute('data-focus-item') !== 'end';
          });
          var focusAt = isFirst ? 0.12 : '>';
          if (ends.length) {
            tl.to(rest, { autoAlpha: 0.22, duration: 0.45 }, focusAt);
            tl.to(ends, { autoAlpha: 1, duration: 0.45 }, '<');
            tl.to(rest.concat(ends), { autoAlpha: 1, duration: 0.5 }, '>');
          } else {
            localFocus.forEach(function (item, fi) {
              tl.to(localFocus, { autoAlpha: 0.22, duration: 0.25 }, fi === 0 ? focusAt : '>');
              tl.to(item, { autoAlpha: 1, duration: 0.4 }, '<');
            });
            tl.to(localFocus, { autoAlpha: 1, duration: 0.45 }, '>');
          }
        }
      });

      var pageFocus = focusEls.filter(function (el) {
        return !el.closest('[data-case-frame]');
      });
      if (pageFocus.length) {
        pageFocus.forEach(function (item, i) {
          tl.to(pageFocus, { autoAlpha: 0.22, duration: 0.25 }, i === 0 ? 0.1 : '>');
          tl.to(item, { autoAlpha: 1, duration: 0.4 }, '<');
        });
        tl.to(pageFocus, { autoAlpha: 1, duration: 0.45 }, '>');
      }

      var pinEnd = '+=' + Math.max(140, 90 + frameEls.length * 80) + '%';
      var st = ScrollTrigger.create({
        trigger: hold,
        scroller: scroller,
        animation: tl,
        start: function () { return pin ? 'top ' + head() + 'px' : 'top 78%'; },
        end: pin ? pinEnd : 'bottom 60%',
        pin: pin ? hold : false,
        pinSpacing: pin,
        scrub: pin ? 0.55 : 0.35,
        anticipatePin: 1,
        invalidateOnRefresh: true
      });
      triggers.push(st);
    });

    bindStepWatchers(scroller, pages, opts.onStep, opts.onPage, triggers);

    mmCleanup.triggers = triggers;
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  }

  function killTriggers(list) {
    (list || []).forEach(function (t) {
      if (t && t.kill) t.kill();
    });
  }

  function goToPage(scroller, world, idOrIndex, instant) {
    var pages = world.querySelectorAll('[data-case-page]');
    var el = null;
    if (typeof idOrIndex === 'number') {
      el = pages[idOrIndex] || null;
    } else if (idOrIndex) {
      var needle = String(idOrIndex).toLowerCase();
      Array.prototype.forEach.call(pages, function (page) {
        if (!el && pageId(page).toLowerCase() === needle) el = page;
      });
    }
    if (!el || !scroller) return;
    var sRect = scroller.getBoundingClientRect();
    var eRect = el.getBoundingClientRect();
    var top = scroller.scrollTop + (eRect.top - sRect.top);
    if (scroller.scrollTo) {
      scroller.scrollTo({
        top: Math.max(0, top),
        behavior: instant ? 'auto' : 'smooth'
      });
    } else {
      scroller.scrollTop = Math.max(0, top);
    }
  }

  function bind(opts) {
    opts = opts || {};
    var world = opts.world;
    var scroller = opts.scroller;
    if (!world || !scroller) {
      return { kill: function () {}, goTo: function () {}, refresh: function () {} };
    }

    var reduce = reduceQuery();
    var pages = Array.prototype.filter.call(
      world.querySelectorAll('[data-case-page]'),
      function (el) { return !el.closest('[hidden]'); }
    );
    var mm = null;
    var staticBound = false;
    var cinematic = { triggers: [] };

    function lightFocus() {
      Array.prototype.forEach.call(world.querySelectorAll('[data-focus-item]'), function (el) {
        el.style.opacity = '1';
        el.style.visibility = 'visible';
      });
    }

    if (opts.onStep) opts.onStep(0);
    pages.forEach(function (el, i) {
      el.classList.toggle('is-active', i === 0);
    });

    function setupStatic() {
      staticBound = true;
      revealStatic(world);
      lightFocus();
      var onScroll = function () {
        var mid = scroller.getBoundingClientRect().top + scroller.clientHeight * 0.4;
        var current = 0;
        pages.forEach(function (page, i) {
          if (page.getBoundingClientRect().top <= mid) current = i;
        });
        pages.forEach(function (el, j) {
          el.classList.toggle('is-active', j === current);
        });
        if (opts.onStep) opts.onStep(current);
        if (opts.onPage) opts.onPage(pageId(pages[current]), current);
      };
      scroller.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
      cinematic.staticScroll = onScroll;
    }

    function teardownStatic() {
      if (cinematic.staticScroll) {
        scroller.removeEventListener('scroll', cinematic.staticScroll);
        cinematic.staticScroll = null;
      }
      staticBound = false;
    }

    if (opts.forceStatic || reduce.matches || typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined') {
      setupStatic();
    } else {
      window.gsap.registerPlugin(window.ScrollTrigger);
      mm = window.gsap.matchMedia();
      mm.add('(prefers-reduced-motion: reduce)', function () {
        setupStatic();
        return teardownStatic;
      });
      mm.add('(prefers-reduced-motion: no-preference)', function () {
        bindCinematic(opts, pages, cinematic);
        return function () {
          killTriggers(cinematic.triggers);
          cinematic.triggers = [];
          resetStages(world);
        };
      });
    }

    if (opts.startPage) {
      requestAnimationFrame(function () {
        goToPage(scroller, world, opts.startPage, true);
      });
    }

    var api = {
      kill: function () {
        teardownStatic();
        killTriggers(cinematic.triggers);
        cinematic.triggers = [];
        resetStages(world);
        if (mm && mm.revert) mm.revert();
        var idx = instances.indexOf(api);
        if (idx >= 0) instances.splice(idx, 1);
      },
      goTo: function (idOrIndex, instant) {
        goToPage(scroller, world, idOrIndex, instant || reduce.matches);
      },
      refresh: function () {
        if (window.ScrollTrigger) window.ScrollTrigger.refresh();
      },
      pageCount: function () { return pages.length; },
      isStatic: function () { return staticBound || reduce.matches; }
    };

    instances.push(api);
    return api;
  }

  return {
    bind: bind,
    goToPage: goToPage,
    instances: instances
  };
})();
