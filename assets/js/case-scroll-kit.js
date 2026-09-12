/**
 * CaseScrollKit — Infoviz grammar for opened-case films.
 * Free GSAP core + ScrollTrigger only. No Club plugins.
 *
 * Claim stays readable. Scrub must change meaning: focus, crop/scale,
 * transform-origin, track pan. Opacity dim of context is secondary.
 *
 * Desktop: CSS sticky stage under CLOSE/title; hold is the runway.
 * GSAP scrubs the argument. It does not pin (pin + pinSpacing inside a
 * tall hold added a second spacer and made scroll feel broken).
 * Stage height is leftover viewport (--study-stage), not 100svh.
 * ≤960: staged stack, first proof visible, light focus on that proof.
 * prefers-reduced-motion: calm static stack, same order + captions.
 */
window.CaseScrollKit = (function () {
  'use strict';

  function reduceQuery() {
    return window.matchMedia('(prefers-reduced-motion: reduce)');
  }

  function beatsOf(world) {
    return Array.prototype.slice.call(world.querySelectorAll('[data-film-beat]'));
  }

  function q(root, sel) {
    return root.querySelector(sel);
  }

  function qq(root, sel) {
    return Array.prototype.slice.call(root.querySelectorAll(sel));
  }

  function headPx(scroller, headerFn) {
    if (typeof headerFn === 'function') return headerFn();
    var chrome = scroller.querySelector('.study__chrome');
    if (!chrome) return 72;
    return Math.round(chrome.getBoundingClientRect().bottom);
  }

  function captions(page) {
    return qq(page, '[data-caption]');
  }

  function focusEls(page) {
    return qq(page, '[data-focus]');
  }

  function shots(page) {
    return qq(page, '[data-shot]');
  }

  function askEl(page) {
    return q(page, '[data-film-ask]');
  }

  function setCaption(caps, index) {
    caps.forEach(function (cap, i) {
      var on = i === index;
      window.gsap.set(cap, { autoAlpha: on ? 1 : 0, y: on ? 0 : 8 });
    });
  }

  function pinStage(page, on) {
    var stack = q(page, '[data-shot-stack]');
    if (stack) stack.classList.toggle('is-stage', !!on);
  }

  function resetPage(page) {
    pinStage(page, false);
    page.classList.remove('is-static');
    qq(page, '[data-film-stage], .film-board, [data-focus], [data-shot], [data-caption], [data-film-ask], [data-film-track], .film-sheet, .film-action').forEach(function (el) {
      window.gsap.set(el, { clearProps: 'transform,opacity,visibility,x,y,scale,xPercent,transformOrigin' });
    });
  }

  function setupStatic(world) {
    beatsOf(world).forEach(function (page) {
      page.classList.add('is-static');
      pinStage(page, false);
      qq(page, '[data-caption], [data-film-ask]').forEach(function (cap) {
        window.gsap.set(cap, { autoAlpha: 1, y: 0, clearProps: 'visibility' });
      });
      qq(page, '[data-focus], [data-shot], .film-board, [data-film-track], .film-sheet').forEach(function (el) {
        window.gsap.set(el, { autoAlpha: 1, scale: 1, x: 0, y: 0, xPercent: 0 });
      });
    });
  }

  function watchSteps(scroller, pages, onStep, triggers) {
    pages.forEach(function (page, i) {
      triggers.push(window.ScrollTrigger.create({
        trigger: page,
        scroller: scroller,
        start: 'top 55%',
        end: 'bottom 40%',
        onToggle: function (self) {
          if (!self.isActive) return;
          if (onStep) onStep(i);
          pages.forEach(function (el, j) {
            el.classList.toggle('is-on', j === i);
          });
        }
      }));
    });
  }

  /* Captions sequential like cropSwap: outgoing caption hidden first, then incoming. */
  function captionAt(tl, caps, index, at) {
    if (!caps.length) return;
    var target = Math.max(0, Math.min(index, caps.length - 1));
    var innAt = typeof at === 'number' ? at + 0.28 : '>';
    caps.forEach(function (cap, i) {
      if (i === target) return;
      tl.to(cap, {
        autoAlpha: 0,
        y: 6,
        duration: 0.28,
        overwrite: 'auto'
      }, at);
    });
    tl.to(caps[target], {
      autoAlpha: 1,
      y: 0,
      duration: 0.28,
      overwrite: 'auto'
    }, innAt);
  }

  function askAt(tl, page, at) {
    var ask = askEl(page);
    if (!ask) return;
    tl.to(ask, { autoAlpha: 1, y: 0, duration: 0.4 }, at);
  }

  /* Focus stays in-frame: dim/lift, no board scale. */
  function focusOne(tl, items, index, at) {
    items.forEach(function (el, i) {
      var on = i === index;
      tl.to(el, {
        scale: 1,
        autoAlpha: on ? 1 : 0.34,
        y: on ? -10 : 0,
        duration: 0.55
      }, at);
    });
  }

  function pullBack(tl, items, at) {
    if (items.length) {
      tl.to(items, { scale: 1, autoAlpha: 1, y: 0, duration: 0.5 }, at);
    }
  }

  function cropSwap(tl, outgoing, incoming, at) {
    var innAt = typeof at === 'number' ? at + 0.32 : '>';
    if (outgoing) {
      tl.to(outgoing, {
        y: -10,
        autoAlpha: 0,
        duration: 0.32
      }, at);
    }
    if (incoming) {
      tl.fromTo(incoming, {
        scale: 1.04,
        y: 14,
        autoAlpha: 0,
        visibility: 'visible',
        transformOrigin: '50% 42%'
      }, {
        scale: 1,
        y: 0,
        autoAlpha: 1,
        duration: 0.42
      }, innAt);
    }
  }

  function bindCover(page) {
    var board = q(page, '.film-board');
    var caps = captions(page);
    if (caps.length) window.gsap.set(caps[0], { autoAlpha: 1, y: 0 });
    if (board) window.gsap.set(board, { scale: 1 });
  }

  function bindEnds(page, tl) {
    var items = focusEls(page);
    var caps = captions(page);
    var shotEls = shots(page);
    var n = items.length;
    var ask = askEl(page);
    if (caps.length) setCaption(caps, 0);
    if (ask) window.gsap.set(ask, { autoAlpha: 0, y: 8 });
    if (!n) return;

    window.gsap.set(items, { scale: 1, autoAlpha: 1, y: 0 });

    /* Freelancer end, then medium end, then both, then whole, then accounts crop. */
    focusOne(tl, items, 0, 0.05);
    captionAt(tl, caps, Math.min(1, caps.length - 1), 0.05);
    focusOne(tl, items, n - 1, 0.55);
    captionAt(tl, caps, Math.min(2, caps.length - 1), 0.55);
    if (n > 2) {
      tl.to(items, { autoAlpha: 0.28, y: 0, duration: 0.4 }, 1.05);
      tl.to([items[0], items[n - 1]], { autoAlpha: 1, y: -10, duration: 0.4 }, 1.05);
      captionAt(tl, caps, Math.min(3, caps.length - 1), 1.05);
    }
    pullBack(tl, items, 1.55);
    captionAt(tl, caps, 0, 1.55);

    if (shotEls.length > 1) {
      window.gsap.set(shotEls[0], { autoAlpha: 1, scale: 1, y: 0 });
      window.gsap.set(shotEls.slice(1), { autoAlpha: 0, scale: 1.04, y: 16 });
      cropSwap(tl, shotEls[0], shotEls[1], 2.05);
      captionAt(tl, caps, Math.min(4, caps.length - 1), 2.05);
      askAt(tl, page, 2.35);
    } else {
      askAt(tl, page, 1.7);
    }
  }

  function bindJobs(page, tl) {
    var items = focusEls(page);
    var caps = captions(page);
    var ask = askEl(page);
    if (caps.length) setCaption(caps, 0);
    if (ask) window.gsap.set(ask, { autoAlpha: 0, y: 8 });
    items.forEach(function (el, i) {
      focusOne(tl, items, i, i === 0 ? 0.08 : '>');
      captionAt(tl, caps, Math.min(i + 1, caps.length - 1), '<');
    });
    pullBack(tl, items, '>');
    captionAt(tl, caps, 0, '<');
    askAt(tl, page, '>');
  }

  function bindDoor(page, tl) {
    var door = q(page, '[data-focus="door"]');
    var rest = qq(page, '[data-focus="nav"]');
    var action = q(page, '.film-action');
    var shotEls = shots(page);
    var caps = captions(page);
    var ask = askEl(page);
    if (caps.length) setCaption(caps, 0);
    if (ask) window.gsap.set(ask, { autoAlpha: 0, y: 8 });

    if (door) {
      tl.to(door, { y: -6, duration: 0.55 }, 0.08);
      if (rest.length) tl.to(rest, { autoAlpha: 0.32, duration: 0.55 }, 0.08);
      captionAt(tl, caps, Math.min(1, caps.length - 1), 0.08);
      tl.to(door, { y: 0, duration: 0.45 }, 0.7);
      if (rest.length) tl.to(rest, { autoAlpha: 1, duration: 0.45 }, 0.7);
    }

    if (shotEls.length > 1) {
      window.gsap.set(shotEls[0], { autoAlpha: 1, y: 0, scale: 1 });
      window.gsap.set(shotEls[1], { autoAlpha: 0, y: 16, scale: 1.04 });
      cropSwap(tl, shotEls[0], shotEls[1], 1.15);
      if (action) {
        window.gsap.set(action, { scale: 1 });
        tl.to(action, { y: -4, duration: 0.35 }, 1.35);
        tl.to(action, { y: 0, duration: 0.28 }, 1.7);
      }
      captionAt(tl, caps, Math.min(2, caps.length - 1), 1.15);
      askAt(tl, page, 1.55);
    } else {
      askAt(tl, page, 0.9);
    }
  }

  function bindMoney(page, tl) {
    var bad = qq(page, '.film-row.is-bad');
    var rows = qq(page, '.film-row');
    var shotEls = shots(page);
    var balances = qq(page, '.film-balance');
    var caps = captions(page);
    var ask = askEl(page);
    if (caps.length) setCaption(caps, 0);
    if (ask) window.gsap.set(ask, { autoAlpha: 0, y: 8 });

    if (rows.length) {
      tl.to(rows, { autoAlpha: 0.32, duration: 0.4 }, 0.08);
      if (bad.length) {
        tl.to(bad, { autoAlpha: 1, y: -4, duration: 0.45 }, 0.08);
      }
      captionAt(tl, caps, Math.min(1, caps.length - 1), 0.08);
    }

    if (shotEls.length > 1) {
      window.gsap.set(shotEls[0], { autoAlpha: 1, y: 0, scale: 1 });
      window.gsap.set(shotEls[1], { autoAlpha: 0, y: 16, scale: 1.04 });
      cropSwap(tl, shotEls[0], shotEls[1], 0.7);
      captionAt(tl, caps, Math.min(2, caps.length - 1), 1.02);
      if (balances.length) {
        balances.forEach(function (el, i) {
          tl.to(el, { y: -6, duration: 0.24 }, i === 0 ? 1.35 : '>');
          tl.to(el, { y: 0, duration: 0.2 }, '>');
        });
      }
      askAt(tl, page, 1.7);
    } else {
      askAt(tl, page, 0.8);
    }
  }

  function bindVerbs(page, tl) {
    var heads = qq(page, '.film-grid__head');
    var shotEls = shots(page);
    var caps = captions(page);
    var ask = askEl(page);
    if (caps.length) setCaption(caps, 0);
    if (ask) window.gsap.set(ask, { autoAlpha: 0, y: 8 });
    if (heads.length) {
      tl.to(heads, { autoAlpha: 1, y: -2, duration: 0.4 }, 0.08);
      captionAt(tl, caps, Math.min(1, caps.length - 1), 0.08);
    }
    if (shotEls.length > 1) {
      window.gsap.set(shotEls[0], { autoAlpha: 1, scale: 1 });
      window.gsap.set(shotEls[1], { autoAlpha: 0, scale: 1.04, y: 12 });
      cropSwap(tl, shotEls[0], shotEls[1], 1.15);
      captionAt(tl, caps, Math.min(2, caps.length - 1), 1.15);
      askAt(tl, page, 1.5);
    } else {
      askAt(tl, page, 0.8);
    }
  }

  function bindEnding(page, tl, scroller) {
    var track = q(page, '[data-film-track]');
    var steps = qq(page, '.film-step');
    var shotEls = shots(page);
    var caps = captions(page);
    var ask = askEl(page);
    if (caps.length) setCaption(caps, 0);
    if (ask) window.gsap.set(ask, { autoAlpha: 0, y: 8 });
    if (track && steps.length) {
      window.gsap.set(track, { x: 0 });
      tl.to(track, {
        x: function () {
          var wrap = track.parentNode;
          var max = Math.max(0, track.scrollWidth - (wrap ? wrap.clientWidth : scroller.clientWidth));
          return -max;
        },
        ease: 'none',
        duration: 2.2
      }, 0.05);
      steps.forEach(function (step, i) {
        captionAt(tl, caps, Math.min(i, caps.length - 1), 0.05 + i * 0.7);
      });
    }
    if (shotEls.length > 1) {
      window.gsap.set(shotEls[1], { autoAlpha: 0, y: 16, scale: 1.04 });
      cropSwap(tl, shotEls[0], shotEls[1], 2.3);
      captionAt(tl, caps, Math.min(3, caps.length - 1), 2.62);
      askAt(tl, page, 2.7);
    } else {
      askAt(tl, page, 2.1);
    }
  }

  function bindFinding(page, tl) {
    var sheet = q(page, '.film-sheet');
    var caps = captions(page);
    if (caps.length) setCaption(caps, 0);
    if (!sheet) return;
    window.gsap.set(sheet, { scale: 1.06, transformOrigin: '28% 30%' });
    tl.to(sheet, { scale: 1.02, transformOrigin: '62% 48%', duration: 1, ease: 'none' }, 0);
    captionAt(tl, caps, Math.min(1, caps.length - 1), 0.15);
    tl.to(sheet, { scale: 1, transformOrigin: '50% 50%', duration: 1, ease: 'none' }, 1);
    captionAt(tl, caps, 0, 1);
  }

  function recipeFor(name) {
    switch (name) {
      case 'cover':
        return bindCover;
      case 'ends':
        return bindEnds;
      case 'jobs':
        return bindJobs;
      case 'door':
        return bindDoor;
      case 'money':
        return bindMoney;
      case 'verbs':
        return bindVerbs;
      case 'ending':
        return bindEnding;
      case 'finding':
        return bindFinding;
      default:
        return bindEnds;
    }
  }

  function bindCinematic(opts, pages, triggers) {
    var scroller = opts.scroller;
    var gsap = window.gsap;
    var head = function () { return headPx(scroller, opts.headerOffset); };

    pages.forEach(function (page) {
      var pinWanted = page.getAttribute('data-pin') !== 'false';
      var recipe = page.getAttribute('data-recipe') || 'ends';
      var fn = recipeFor(recipe);
      var hold = q(page, '[data-film-hold]') || page;
      var stage = q(page, '[data-film-stage]') || page;
      var caps = captions(page);
      var shotEls = shots(page);
      var ask = askEl(page);

      if (caps.length) {
        gsap.set(caps[0], { autoAlpha: 1, y: 0 });
        gsap.set(caps.slice(1), { autoAlpha: 0, y: 8 });
      }
      if (ask) gsap.set(ask, { autoAlpha: 0, y: 8 });

      if (!pinWanted) {
        fn(page, gsap.timeline({ paused: true }), scroller);
        return;
      }

      if (shotEls.length > 1) {
        pinStage(page, true);
        gsap.set(shotEls[0], { autoAlpha: 1, x: 0, y: 0, scale: 1, xPercent: 0 });
        gsap.set(shotEls.slice(1), { autoAlpha: 0 });
      }

      var tl = gsap.timeline({ defaults: { ease: 'none' } });
      fn(page, tl, scroller);

      var isLast = page.getAttribute('data-finding') === 'true';
      /* Chrome counted once: sticky stage sits at --study-head.
         Scrub maps hold travel. pin: false — hold already is the spacer.
         Fade the stage off as the hold leaves so the next chapter does not stack. */
      triggers.push(window.ScrollTrigger.create({
        trigger: hold,
        scroller: scroller,
        start: function () { return 'top ' + head() + 'px'; },
        end: 'bottom bottom',
        pin: false,
        scrub: 0.45,
        animation: tl,
        invalidateOnRefresh: true,
        onEnter: function () { gsap.to(stage, { autoAlpha: 1, duration: 0.2, overwrite: 'auto' }); },
        onEnterBack: function () { gsap.to(stage, { autoAlpha: 1, duration: 0.2, overwrite: 'auto' }); },
        onLeave: function () {
          if (isLast) return;
          gsap.to(stage, { autoAlpha: 0, duration: 0.28, overwrite: 'auto' });
        },
        onLeaveBack: function () { gsap.to(stage, { autoAlpha: 0, duration: 0.28, overwrite: 'auto' }); }
      }));
    });
  }

  function bindStaged(opts, pages, triggers) {
    var scroller = opts.scroller;
    var gsap = window.gsap;
    var head = function () { return headPx(scroller, opts.headerOffset); };

    pages.forEach(function (page) {
      pinStage(page, false);
      var items = focusEls(page);
      var caps = captions(page);
      var shotEls = shots(page);
      var ask = askEl(page);
      var recipe = page.getAttribute('data-recipe') || '';

      if (caps.length) {
        gsap.set(caps, { autoAlpha: 1, y: 0 });
      }
      if (ask) gsap.set(ask, { autoAlpha: 1, y: 0 });
      if (shotEls.length) {
        gsap.set(shotEls, { autoAlpha: 1, x: 0, y: 0, scale: 1, xPercent: 0, clearProps: 'visibility' });
      }

      if (!items.length) return;
      if (page.getAttribute('data-pin') === 'false') return;

      var tl = gsap.timeline({ defaults: { ease: 'none' } });
      if (recipe !== 'cover') {
        window.gsap.set(items, { scale: 1, autoAlpha: 1, y: 0 });
        focusOne(tl, items, 0, 0);
        pullBack(tl, items, 0.7);
      }

      triggers.push(window.ScrollTrigger.create({
        trigger: page,
        scroller: scroller,
        start: function () { return 'top ' + (head() + 24) + 'px'; },
        end: 'bottom 55%',
        scrub: 0.5,
        animation: tl,
        invalidateOnRefresh: true
      }));
    });
  }

  function goToBeat(scroller, world, headerFn, idOrIndex) {
    var pages = beatsOf(world);
    var el = typeof idOrIndex === 'number'
      ? pages[idOrIndex]
      : world.querySelector('[data-film-beat="' + idOrIndex + '"]');
    if (!el) return;
    var top = el.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
    var offset = headPx(scroller, headerFn) - 8;
    scroller.scrollTo(0, Math.max(0, top - offset));
  }

  function bind(opts) {
    var world = opts.world;
    var scroller = opts.scroller;
    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;
    var pages = beatsOf(world);
    var mm = null;
    var triggers = [];

    function killLocal() {
      triggers.forEach(function (t) {
        if (t && t.kill) t.kill();
      });
      triggers = [];
      pages.forEach(resetPage);
    }

    function startPage() {
      var id = opts.startPage || '';
      if (!id) return;
      goToBeat(scroller, world, opts.headerOffset, id);
    }

    if (!gsap || !ScrollTrigger || opts.forceStatic || reduceQuery().matches) {
      if (gsap) setupStatic(world);
      else {
        pages.forEach(function (page) { page.classList.add('is-static'); });
      }
      watchSteps(scroller, pages, opts.onStep, triggers);
      window.setTimeout(startPage, 40);
      return {
        kill: killLocal,
        goTo: function (id) { goToBeat(scroller, world, opts.headerOffset, id); },
        pageCount: function () { return pages.length; }
      };
    }

    gsap.registerPlugin(ScrollTrigger);
    mm = gsap.matchMedia();
    mm.add(
      {
        isDesktop: '(min-width: 961px)',
        isTablet: '(max-width: 960px)',
        reduceMotion: '(prefers-reduced-motion: reduce)'
      },
      function (context) {
        var cond = context.conditions || {};
        killLocal();
        watchSteps(scroller, pages, opts.onStep, triggers);
        if (cond.reduceMotion) {
          setupStatic(world);
        } else if (cond.isTablet) {
          bindStaged(opts, pages, triggers);
        } else {
          bindCinematic(opts, pages, triggers);
        }
        return function () { killLocal(); };
      }
    );

    ScrollTrigger.refresh();
    window.setTimeout(startPage, 60);

    return {
      kill: function () {
        if (mm) mm.revert();
        mm = null;
        killLocal();
      },
      goTo: function (id) { goToBeat(scroller, world, opts.headerOffset, id); },
      pageCount: function () { return pages.length; }
    };
  }

  return { bind: bind };
})();
