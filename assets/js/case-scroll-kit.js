/**
 * CaseScrollKit — Infoviz grammar for opened-case films.
 * Free GSAP core + ScrollTrigger only. No Club plugins.
 *
 * Claim stays readable. Scrub must change meaning: focus, crop/scale,
 * transform-origin, track pan. Opacity dim of context is secondary.
 *
 * Desktop: pin the stage, scrub the argument.
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
    if (!chrome) return 88;
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

  function setCaption(caps, index) {
    caps.forEach(function (cap, i) {
      var on = i === index;
      window.gsap.set(cap, { autoAlpha: on ? 1 : 0, y: on ? 0 : 12 });
    });
  }

  function pinStage(page, on) {
    var stack = q(page, '[data-shot-stack]');
    if (stack) stack.classList.toggle('is-stage', !!on);
  }

  function resetPage(page) {
    pinStage(page, false);
    page.classList.remove('is-static');
    qq(page, '.film-board, [data-focus], [data-shot], [data-caption], [data-film-track], .film-sheet, .film-action').forEach(function (el) {
      window.gsap.set(el, { clearProps: 'transform,opacity,visibility,x,y,scale,xPercent,transformOrigin' });
    });
  }

  function setupStatic(world) {
    beatsOf(world).forEach(function (page) {
      page.classList.add('is-static');
      pinStage(page, false);
      qq(page, '[data-caption]').forEach(function (cap) {
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

  function captionAt(tl, caps, index, at) {
    if (!caps.length) return;
    caps.forEach(function (cap, i) {
      var on = i === index;
      tl.to(cap, {
        autoAlpha: on ? 1 : 0,
        y: on ? 0 : 10,
        duration: 0.28
      }, at);
    });
  }

  function focusOne(tl, items, index, at, origin) {
    items.forEach(function (el, i) {
      var on = i === index;
      tl.to(el, {
        scale: on ? 1.12 : 0.88,
        autoAlpha: on ? 1 : 0.32,
        y: on ? -10 : 14,
        duration: 0.55
      }, at);
    });
    var board = items[0] && items[0].closest('.film-board');
    if (board && origin) {
      tl.to(board, {
        scale: 1.16,
        transformOrigin: origin,
        duration: 0.55
      }, at);
    }
  }

  function pullBack(tl, items, board, at) {
    if (items.length) {
      tl.to(items, { scale: 1, autoAlpha: 1, y: 0, duration: 0.5 }, at);
    }
    if (board) {
      tl.to(board, { scale: 1, transformOrigin: '50% 50%', duration: 0.5 }, at);
    }
  }

  function cropSwap(tl, outgoing, incoming, at) {
    if (outgoing) {
      tl.to(outgoing, {
        scale: 0.86,
        xPercent: -12,
        autoAlpha: 0.08,
        transformOrigin: '20% 50%',
        duration: 0.6
      }, at);
    }
    if (incoming) {
      tl.fromTo(incoming, {
        scale: 1.18,
        xPercent: 14,
        autoAlpha: 0,
        transformOrigin: '78% 42%'
      }, {
        scale: 1,
        xPercent: 0,
        autoAlpha: 1,
        duration: 0.7
      }, at);
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
    var board = q(page, '.film-board');
    var caps = captions(page);
    var shotEls = shots(page);
    var n = items.length;
    if (caps.length) setCaption(caps, 0);
    if (!n) return;

    window.gsap.set(items, { scale: 1, autoAlpha: 1, y: 0 });
    if (board) window.gsap.set(board, { scale: 1, transformOrigin: '50% 50%' });

    /* Freelancer end, then medium end, then both, then whole. */
    focusOne(tl, items, 0, 0.05, '8% 70%');
    captionAt(tl, caps, Math.min(1, caps.length - 1), 0.05);
    focusOne(tl, items, n - 1, 0.55, '92% 70%');
    captionAt(tl, caps, Math.min(2, caps.length - 1), 0.55);
    if (n > 2) {
      tl.to(items, { scale: 0.9, autoAlpha: 0.3, y: 10, duration: 0.4 }, 1.05);
      tl.to([items[0], items[n - 1]], { scale: 1.1, autoAlpha: 1, y: -8, duration: 0.4 }, 1.05);
      if (board) tl.to(board, { scale: 1.06, transformOrigin: '50% 70%', duration: 0.4 }, 1.05);
      captionAt(tl, caps, Math.min(3, caps.length - 1), 1.05);
    }
    pullBack(tl, items, board, 1.55);
    captionAt(tl, caps, 0, 1.55);

    if (shotEls.length > 1) {
      window.gsap.set(shotEls[0], { autoAlpha: 1, scale: 1, xPercent: 0 });
      window.gsap.set(shotEls.slice(1), { autoAlpha: 0, scale: 1.12, xPercent: 10 });
      cropSwap(tl, shotEls[0], shotEls[1], 2.05);
      captionAt(tl, caps, Math.min(4, caps.length - 1), 2.05);
    }
  }

  function bindJobs(page, tl) {
    var items = focusEls(page);
    var caps = captions(page);
    if (caps.length) setCaption(caps, 0);
    items.forEach(function (el, i) {
      focusOne(tl, items, i, i === 0 ? 0.08 : '>');
      captionAt(tl, caps, Math.min(i + 1, caps.length - 1), '<');
    });
    pullBack(tl, items, null, '>');
    captionAt(tl, caps, 0, '<');
  }

  function bindDoor(page, tl) {
    var door = q(page, '[data-focus="door"]');
    var rest = qq(page, '[data-focus="nav"]');
    var board = q(page, '[data-shot="door"] .film-board') || q(page, '.film-board');
    var action = q(page, '.film-action');
    var shotEls = shots(page);
    var caps = captions(page);
    if (caps.length) setCaption(caps, 0);

    if (door) {
      tl.to(door, { scale: 1.18, y: -6, duration: 0.55 }, 0.08);
      if (rest.length) tl.to(rest, { autoAlpha: 0.28, scale: 0.94, duration: 0.55 }, 0.08);
      if (board) tl.to(board, { scale: 1.22, transformOrigin: '12% 42%', duration: 0.55 }, 0.08);
      captionAt(tl, caps, Math.min(1, caps.length - 1), 0.08);
      tl.to(door, { scale: 1, y: 0, duration: 0.45 }, 0.7);
      if (rest.length) tl.to(rest, { autoAlpha: 1, scale: 1, duration: 0.45 }, 0.7);
      if (board) tl.to(board, { scale: 1, transformOrigin: '50% 50%', duration: 0.45 }, 0.7);
    }

    if (shotEls.length > 1) {
      window.gsap.set(shotEls[0], { autoAlpha: 1, xPercent: 0, scale: 1 });
      window.gsap.set(shotEls[1], { autoAlpha: 0, xPercent: 18, scale: 1.08 });
      cropSwap(tl, shotEls[0], shotEls[1], 1.15);
      if (action) {
        window.gsap.set(action, { scale: 0.84 });
        tl.to(action, { scale: 1.08, duration: 0.4 }, 1.35);
        tl.to(action, { scale: 1, duration: 0.3 }, 1.75);
      }
      captionAt(tl, caps, Math.min(2, caps.length - 1), 1.15);
    }
  }

  function bindMoney(page, tl) {
    var bad = qq(page, '.film-row.is-bad');
    var rows = qq(page, '.film-row');
    var shotEls = shots(page);
    var balances = qq(page, '.film-balance');
    var caps = captions(page);
    if (caps.length) setCaption(caps, 0);

    if (rows.length) {
      tl.to(rows, { autoAlpha: 0.35, scale: 0.96, duration: 0.4 }, 0.08);
      if (bad.length) {
        tl.to(bad, { autoAlpha: 1, scale: 1.06, y: -4, duration: 0.45 }, 0.08);
      }
      var board = q(page, '[data-shot="fail"] .film-board');
      if (board) tl.to(board, { scale: 1.2, transformOrigin: '50% 28%', duration: 0.45 }, 0.08);
      captionAt(tl, caps, Math.min(1, caps.length - 1), 0.08);
    }

    if (shotEls.length > 1) {
      window.gsap.set(shotEls[0], { autoAlpha: 1, y: 0, scale: 1 });
      window.gsap.set(shotEls[1], { autoAlpha: 0, y: 40, scale: 1.12 });
      tl.to(shotEls[0], { scale: 0.9, y: -24, autoAlpha: 0.1, duration: 0.55 }, 0.7);
      tl.to(shotEls[1], { autoAlpha: 1, y: 0, scale: 1, duration: 0.65 }, 0.7);
      captionAt(tl, caps, Math.min(2, caps.length - 1), 0.7);
      if (balances.length) {
        balances.forEach(function (el, i) {
          tl.to(el, { scale: 1.08, duration: 0.28 }, i === 0 ? 1.15 : '>');
          tl.to(el, { scale: 1, duration: 0.22 }, '>');
        });
      }
    }
  }

  function bindVerbs(page, tl) {
    var heads = qq(page, '.film-grid__head');
    var board = q(page, '.film-board');
    var shotEls = shots(page);
    var caps = captions(page);
    if (caps.length) setCaption(caps, 0);
    if (board) {
      tl.to(board, { scale: 1.22, transformOrigin: '60% 8%', duration: 0.55 }, 0.08);
      captionAt(tl, caps, Math.min(1, caps.length - 1), 0.08);
      if (heads.length) tl.to(heads, { scale: 1.08, duration: 0.4 }, 0.08);
      tl.to(board, { scale: 1, transformOrigin: '50% 50%', duration: 0.5 }, 0.7);
      if (heads.length) tl.to(heads, { scale: 1, duration: 0.4 }, 0.7);
    }
    if (shotEls.length > 1) {
      window.gsap.set(shotEls[0], { autoAlpha: 1, scale: 1 });
      window.gsap.set(shotEls[1], { autoAlpha: 0, scale: 1.14, xPercent: 8 });
      cropSwap(tl, shotEls[0], shotEls[1], 1.2);
      captionAt(tl, caps, Math.min(2, caps.length - 1), 1.2);
    }
  }

  function bindEnding(page, tl, scroller) {
    var track = q(page, '[data-film-track]');
    var steps = qq(page, '.film-step');
    var shotEls = shots(page);
    var caps = captions(page);
    if (caps.length) setCaption(caps, 0);
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
      window.gsap.set(shotEls[1], { autoAlpha: 0, y: 28, scale: 1.08 });
      tl.to(shotEls[0], { autoAlpha: 0.12, scale: 0.92, y: -16, duration: 0.5 }, 2.3);
      tl.to(shotEls[1], { autoAlpha: 1, y: 0, scale: 1, duration: 0.55 }, 2.3);
      captionAt(tl, caps, Math.min(3, caps.length - 1), 2.3);
    }
  }

  function bindFinding(page, tl) {
    var sheet = q(page, '.film-sheet');
    var caps = captions(page);
    if (caps.length) setCaption(caps, 0);
    if (!sheet) return;
    window.gsap.set(sheet, { scale: 1.34, transformOrigin: '18% 22%' });
    tl.to(sheet, { scale: 1.12, transformOrigin: '62% 48%', duration: 1, ease: 'none' }, 0);
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

      if (caps.length) {
        gsap.set(caps[0], { autoAlpha: 1, y: 0 });
        gsap.set(caps.slice(1), { autoAlpha: 0, y: 12 });
      }

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

      triggers.push(window.ScrollTrigger.create({
        trigger: hold,
        scroller: scroller,
        start: function () { return 'top ' + head() + 'px'; },
        end: 'bottom bottom',
        pin: stage,
        scrub: 0.65,
        animation: tl,
        invalidateOnRefresh: true,
        anticipatePin: 1
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
      var board = q(page, '.film-board');
      var caps = captions(page);
      var shotEls = shots(page);
      var recipe = page.getAttribute('data-recipe') || '';

      if (caps.length) {
        gsap.set(caps, { autoAlpha: 1, y: 0 });
      }
      if (shotEls.length) {
        gsap.set(shotEls, { autoAlpha: 1, x: 0, y: 0, scale: 1, xPercent: 0, clearProps: 'visibility' });
      }

      if (!items.length && !board) return;
      if (page.getAttribute('data-pin') === 'false') return;

      var tl = gsap.timeline({ defaults: { ease: 'none' } });
      if (items.length && recipe !== 'cover') {
        window.gsap.set(items, { scale: 1, autoAlpha: 1, y: 0 });
        focusOne(tl, items, 0, 0, recipe === 'ends' ? '8% 70%' : '50% 50%');
        pullBack(tl, items, board, 0.7);
      } else if (board && recipe === 'finding') {
        tl.fromTo(board, { scale: 1.18, transformOrigin: '30% 30%' }, { scale: 1, duration: 1, ease: 'none' }, 0);
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
