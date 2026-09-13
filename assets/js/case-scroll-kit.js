/**
 * CaseScrollKit — Infoviz grammar for opened-case films.
 * Free GSAP core + ScrollTrigger only. No Club plugins.
 *
 * Claim stays readable. Opacity-only fades are a fail.
 * Scrub must transform: scale, crop (clip-path), focus, draw, split, pan.
 *
 * GSAP pin holds the stage under CLOSE/title. pinSpacing is the runway.
 * Do not also CSS-tall the hold (that double-spacer was the dead film).
 * Stage height is leftover viewport (--study-stage), not extra 100svh.
 * Viewport is the scroller (Infoviz). Nested .study + overflow-x:clip
 * was a Safari dead-scroll: html overflow hidden, study never panned.
 * prefers-reduced-motion: calm static stack, same order + Decision chips.
 */
window.CaseScrollKit = (function () {
  'use strict';

  var END_RATIO = {
    kenburns: 2.15,
    phone: 2.35,
    moneyCrop: 2.55,
    splitDoor: 2.85,
    control: 2.65,
    morph: 2.55,
    splitWeight: 2.45,
    finding: 2.05
  };

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

  function isView(scroller) {
    return !scroller || scroller === window || scroller === document.documentElement || scroller === document.body;
  }

  function viewH(scroller) {
    if (isView(scroller)) {
      if (window.layoutViewport && typeof window.layoutViewport.height === 'function') {
        return window.layoutViewport.height() || 800;
      }
      if (window.visualViewport && window.visualViewport.height) {
        return window.visualViewport.height;
      }
      return window.innerHeight || 800;
    }
    return scroller.clientHeight || 800;
  }

  function viewY(scroller) {
    if (isView(scroller)) return window.pageYOffset || document.documentElement.scrollTop || 0;
    return scroller.scrollTop || 0;
  }

  function scrollToY(scroller, y) {
    if (isView(scroller)) window.scrollTo(0, y);
    else scroller.scrollTo(0, y);
  }

  function stVars(scroller, extra) {
    var vars = extra || {};
    if (!isView(scroller)) vars.scroller = scroller;
    return vars;
  }

  function headPx(scroller, headerFn) {
    if (typeof headerFn === 'function') return headerFn();
    var root = isView(scroller) ? document : scroller;
    var chrome = root.querySelector ? root.querySelector('.study__chrome') : null;
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

  function chipEl(page) {
    return q(page, '[data-film-decision]');
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

  var CLEAR = 'transform,opacity,visibility,x,y,z,rotationX,rotationY,scale,scaleX,scaleY,xPercent,yPercent,transformOrigin,clipPath';

  function resetPage(page) {
    pinStage(page, false);
    page.classList.remove('is-static');
    qq(page, '[data-film-stage], [data-film-hold], .film-board, [data-focus], [data-shot], [data-caption], [data-film-ask], [data-film-decision], [data-film-ruled], [data-ladder-strip], .film-ladder-strip__row, .film-rung, .film-ladder__fill, .film-phone-stage, .film-pay-face, .film-balance, .film-confirm, .film-handoff__msg, .film-split-door, .film-split-panes, .film-split-pane, .film-nav__item, .film-row, .film-action, .film-waiting, .film-control, .film-cell, .film-grid__head, .film-morph, .film-device, .film-weight, .film-weight-split, .film-finding-stage').forEach(function (el) {
      window.gsap.set(el, { clearProps: CLEAR });
    });
  }

  function setupStatic(world) {
    beatsOf(world).forEach(function (page) {
      page.classList.add('is-static');
      pinStage(page, false);
      qq(page, '[data-caption], [data-film-ask], [data-film-decision], [data-film-ruled]').forEach(function (cap) {
        window.gsap.set(cap, { autoAlpha: 1, y: 0, clearProps: 'visibility' });
      });
      qq(page, '[data-focus], [data-shot], .film-board, .film-rung, .film-pay-face, .film-balance, .film-split-pane, .film-cell, .film-device, .film-weight, .film-waiting, .film-confirm, .film-nav__item').forEach(function (el) {
        window.gsap.set(el, {
          autoAlpha: 1, scale: 1, scaleX: 1, scaleY: 1,
          x: 0, y: 0, z: 0, rotationX: 0, rotationY: 0,
          xPercent: 0, clipPath: 'inset(0% 0% 0% 0%)'
        });
      });
    });
  }

  function watchSteps(scroller, pages, onStep, triggers) {
    pages.forEach(function (page, i) {
      triggers.push(window.ScrollTrigger.create(stVars(scroller, {
        trigger: page,
        start: 'top 55%',
        end: 'bottom 40%',
        onToggle: function (self) {
          if (!self.isActive) return;
          if (onStep) onStep(i);
          pages.forEach(function (el, j) {
            el.classList.toggle('is-on', j === i);
          });
        }
      })));
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

  /* Claim + Decision readable before viz work. Transform settle, not a fade-in of the argument. */
  function leadDecision(tl, page) {
    var chip = chipEl(page);
    var ruled = q(page, '[data-film-ruled]');
    if (chip) {
      window.gsap.set(chip, { autoAlpha: 1, y: 0 });
      tl.fromTo(chip, { y: 14 }, { y: 0, duration: 0.55 }, 0);
    }
    if (ruled) window.gsap.set(ruled, { autoAlpha: 0.4, y: 0 });
    return 0.58;
  }

  function cropIn(tl, outgoing, incoming, at) {
    var innAt = typeof at === 'number' ? at + 0.28 : '>';
    if (outgoing) {
      tl.to(outgoing, {
        scale: 1.14,
        y: -18,
        clipPath: 'inset(0% 0% 42% 0%)',
        transformOrigin: '50% 32%',
        autoAlpha: 0,
        duration: 0.42
      }, at);
    }
    if (incoming) {
      tl.fromTo(incoming, {
        scale: 1.22,
        y: 20,
        autoAlpha: 1,
        visibility: 'visible',
        clipPath: 'inset(16% 10% 22% 10%)',
        transformOrigin: '50% 42%'
      }, {
        scale: 1,
        y: 0,
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 0.5,
        immediateRender: false
      }, innAt);
    }
  }

  function wipeSplit(tl, outgoing, incoming, at) {
    if (!incoming) return;
    tl.fromTo(incoming, {
      autoAlpha: 1,
      visibility: 'visible',
      xPercent: 42,
      clipPath: 'inset(0% 0% 0% 68%)',
      scale: 1
    }, {
      xPercent: 0,
      clipPath: 'inset(0% 0% 0% 0%)',
      duration: 0.6,
      immediateRender: false
    }, at);
    if (outgoing) {
      tl.to(outgoing, {
        xPercent: -22,
        scale: 1.08,
        transformOrigin: '8% 50%',
        clipPath: 'inset(0% 52% 0% 0%)',
        duration: 0.55
      }, at);
      tl.to(outgoing, { autoAlpha: 0, duration: 0.2 }, at + 0.55);
    }
  }

  /* Cover: title already pinned in claim. Ladder strip ken-burns across rungs. */
  function bindKenBurns(page, tl) {
    var t0 = leadDecision(tl, page);
    var strip = q(page, '[data-ladder-strip]');
    var row = q(page, '.film-ladder-strip__row');
    var rungs = qq(page, '.film-rung');
    var fill = q(page, '[data-ladder-fill]');
    var caps = captions(page);
    if (caps.length) setCaption(caps, 0);
    if (strip) {
      window.gsap.set(strip, { scale: 1.22, xPercent: -10, transformOrigin: '8% 50%' });
    }
    if (row) window.gsap.set(row, { xPercent: 0 });
    if (rungs.length) window.gsap.set(rungs, { scale: 0.92, y: 12, transformOrigin: '50% 80%' });
    if (fill) window.gsap.set(fill, { scaleX: 0.18, transformOrigin: '0% 50%' });
    if (strip) {
      tl.to(strip, { scale: 1.1, xPercent: -4, duration: 0.85 }, t0);
    }
    rungs.forEach(function (el, i) {
      var at = t0 + i * 0.28;
      tl.to(el, { scale: 1.06, y: -6, duration: 0.32 }, at);
      if (i > 0) tl.to(rungs[i - 1], { scale: 1, y: 0, duration: 0.28 }, at);
      if (fill) tl.to(fill, { scaleX: (i + 1) / Math.max(rungs.length, 1), duration: 0.32 }, at);
    });
    var tEnd = t0 + Math.max(rungs.length, 1) * 0.28 + 0.2;
    if (strip) tl.to(strip, { scale: 1, xPercent: 0, duration: 0.7 }, tEnd);
    tl.to(rungs, { scale: 1, y: 0, duration: 0.4 }, tEnd);
    captionAt(tl, caps, 0, t0);
  }

  function irisStillEl(page) {
    return q(page, '[data-iris-still]');
  }

  function bindIrisStill(page, tl, t0, origin) {
    var still = irisStillEl(page);
    if (!still) return;
    window.gsap.set(still, {
      scale: 0.94,
      y: 18,
      transformOrigin: origin || '50% 62%'
    });
    tl.to(still, { scale: 1.05, y: 0, duration: 0.65 }, t0);
    tl.to(still, { scale: 1, duration: 0.4 }, t0 + 0.9);
  }

  /* Freelancer: phone-frame focus scrub between get paid and pay. Crop/scale, not fade. */
  function bindPhone(page, tl) {
    var t0 = leadDecision(tl, page);
    bindIrisStill(page, tl, t0, '50% 70%');
    var phone = q(page, '[data-phone-stage]');
    var inn = q(page, '[data-pay-face="in"]');
    var out = q(page, '[data-pay-face="out"]');
    var caps = captions(page);
    var ask = askEl(page);
    if (caps.length) setCaption(caps, 0);
    if (ask) window.gsap.set(ask, { autoAlpha: 0, y: 8 });
    if (phone) {
      window.gsap.set(phone, { scale: 0.9, y: 28, transformOrigin: '50% 80%' });
      tl.to(phone, { scale: 1.04, y: 0, duration: 0.55 }, t0);
    }
    if (inn) {
      window.gsap.set(inn, {
        autoAlpha: 1,
        scale: 1,
        clipPath: 'inset(0% 0% 0% 0%)',
        transformOrigin: '50% 20%'
      });
    }
    if (out) {
      window.gsap.set(out, {
        autoAlpha: 1,
        scale: 1.08,
        clipPath: 'inset(72% 0% 0% 0%)',
        transformOrigin: '50% 80%'
      });
    }
    captionAt(tl, caps, 0, t0);
    var tCrop = t0 + 0.7;
    if (inn) {
      tl.to(inn, {
        clipPath: 'inset(0% 0% 58% 0%)',
        scale: 1.1,
        y: -12,
        duration: 0.65
      }, tCrop);
    }
    if (out) {
      tl.to(out, {
        clipPath: 'inset(0% 0% 0% 0%)',
        scale: 1,
        y: 0,
        duration: 0.65
      }, tCrop);
    }
    captionAt(tl, caps, 1, tCrop);
    if (phone) tl.to(phone, { scale: 1, duration: 0.35 }, tCrop + 0.65);
    askAt(tl, page, tCrop + 0.75);
  }

  /* Sole prop: available scale-up, then crop to beneficiary. */
  function bindMoneyCrop(page, tl) {
    var t0 = leadDecision(tl, page);
    bindIrisStill(page, tl, t0, '50% 58%');
    var lead = q(page, '.film-balance.is-lead');
    var rest = qq(page, '.film-balance:not(.is-lead)');
    var bands = qq(page, '.film-balance .film-ui-band');
    var shotEls = shots(page);
    var confirm = q(page, '.film-confirm');
    var msg = q(page, '.film-handoff__msg');
    var caps = captions(page);
    var ask = askEl(page);
    var ruled = q(page, '[data-film-ruled]');
    if (caps.length) setCaption(caps, 0);
    if (ask) window.gsap.set(ask, { autoAlpha: 0, y: 8 });
    captionAt(tl, caps, 0, t0);
    if (lead) {
      window.gsap.set(lead, { scale: 0.92, y: 16, transformOrigin: '50% 40%' });
      if (bands[0]) window.gsap.set(bands[0], { scaleX: 0.22, transformOrigin: '0% 50%' });
      tl.to(lead, { scale: 1.14, y: -10, duration: 0.55 }, t0);
      if (bands[0]) tl.to(bands[0], { scaleX: 1, duration: 0.55 }, t0);
    }
    if (rest.length) {
      window.gsap.set(rest, { scale: 0.88, y: 14 });
      rest.forEach(function (el, i) {
        tl.to(el, { scale: 1, y: 0, duration: 0.28 }, t0 + 0.45 + i * 0.12);
      });
    }
    if (shotEls.length > 1) {
      window.gsap.set(shotEls[0], { autoAlpha: 1, clipPath: 'inset(0% 0% 0% 0%)', scale: 1 });
      cropIn(tl, shotEls[0], shotEls[1], t0 + 1.15);
      captionAt(tl, caps, 1, t0 + 1.2);
    }
    if (confirm) {
      window.gsap.set(confirm, { scale: 0.94, y: 18 });
      tl.to(confirm, { scale: 1, y: 0, duration: 0.4 }, t0 + 1.45);
    }
    if (msg) {
      window.gsap.set(msg, { scale: 0.96, y: 10 });
      tl.to(msg, { scale: 1.02, y: 0, duration: 0.3 }, t0 + 1.7);
      tl.to(msg, { scale: 1, duration: 0.18 }, t0 + 2.0);
    }
    if (ruled) tl.to(ruled, { autoAlpha: 1, duration: 0.3 }, t0 + 1.8);
    askAt(tl, page, t0 + 2.05);
  }

  /* ~10 people: door crop then split prepare || approve. NEVER fade prepare into approve. */
  function bindSplitDoor(page, tl) {
    var t0 = leadDecision(tl, page);
    bindIrisStill(page, tl, t0, '42% 58%');
    var door = q(page, '[data-focus="door"]');
    var rest = qq(page, '[data-focus="nav"]');
    var prepare = q(page, '[data-pane="prepare"]');
    var approve = q(page, '[data-pane="approve"]');
    var panes = q(page, '[data-split-panes]');
    var action = q(page, '.film-action');
    var bad = qq(page, '.film-row.is-bad');
    var ok = qq(page, '.film-split-pane--approve .film-row:not(.is-bad)');
    var caps = captions(page);
    var ask = askEl(page);
    var ruled = q(page, '[data-film-ruled]');
    if (caps.length) setCaption(caps, 0);
    if (ask) window.gsap.set(ask, { autoAlpha: 0, y: 8 });

    if (door) {
      window.gsap.set(door, { scale: 1, x: 0, transformOrigin: '12% 50%' });
      tl.to(door, { scale: 1.14, x: 8, y: -6, duration: 0.7 }, t0);
    }
    if (rest.length) tl.to(rest, { scale: 0.92, x: -8, y: 8, duration: 0.7 }, t0);
    captionAt(tl, caps, 0, t0);

    if (prepare) {
      window.gsap.set(prepare, {
        autoAlpha: 1,
        xPercent: 0,
        clipPath: 'inset(0% 0% 0% 0%)'
      });
    }
    if (approve) {
      window.gsap.set(approve, {
        autoAlpha: 1,
        xPercent: 18,
        clipPath: 'inset(0% 0% 0% 92%)'
      });
    }

    var tSplit = t0 + 0.85;
    if (prepare) {
      tl.to(prepare, {
        clipPath: 'inset(0% 6% 0% 0%)',
        xPercent: -4,
        scale: 1,
        duration: 0.7
      }, tSplit);
    }
    if (approve) {
      tl.to(approve, {
        clipPath: 'inset(0% 0% 0% 0%)',
        xPercent: 0,
        scale: 1,
        duration: 0.7
      }, tSplit);
    }
    if (panes) {
      window.gsap.set(panes, { scale: 1, transformOrigin: '50% 50%' });
      tl.to(panes, { scale: 1.02, duration: 0.35 }, tSplit);
      tl.to(panes, { scale: 1, duration: 0.3 }, tSplit + 0.4);
    }
    captionAt(tl, caps, 1, tSplit);

    var tFail = tSplit + 0.75;
    if (bad.length) tl.to(bad, { scale: 1.08, y: -6, duration: 0.4 }, tFail);
    if (ok.length) tl.to(ok, { scale: 0.96, y: 4, duration: 0.35 }, tFail);
    if (action) {
      window.gsap.set(action, { scale: 1, transformOrigin: '80% 50%' });
      tl.to(action, { scale: 1.08, y: -4, duration: 0.3 }, tFail);
      tl.to(action, { scale: 1, y: 0, duration: 0.22 }, tFail + 0.32);
    }
    captionAt(tl, caps, 2, tFail);
    if (ruled) tl.to(ruled, { autoAlpha: 1, y: 0, duration: 0.3 }, tFail + 0.2);
    askAt(tl, page, tFail + 0.45);
  }

  /* Mid-size: control-room pin, then matrix draw. */
  function bindControl(page, tl) {
    var t0 = leadDecision(tl, page);
    bindIrisStill(page, tl, t0, '42% 58%');
    var waiting = q(page, '[data-waiting]');
    var rows = qq(page, '[data-waiting] .film-row');
    var cells = qq(page, '[data-shot="grid"] .film-cell');
    var heads = qq(page, '[data-shot="grid"] .film-grid__head');
    var grid = q(page, '.film-grid');
    var caps = captions(page);
    var ask = askEl(page);
    var ruled = q(page, '[data-film-ruled]');
    if (caps.length) setCaption(caps, 0);
    if (ask) window.gsap.set(ask, { autoAlpha: 0, y: 8 });

    if (waiting) {
      window.gsap.set(waiting, { scale: 0.94, y: 18, transformOrigin: '50% 20%' });
      tl.to(waiting, { scale: 1.06, y: -8, duration: 0.55 }, t0);
    }
    if (rows.length) {
      window.gsap.set(rows, { x: 16, scale: 0.96 });
      rows.forEach(function (row, i) {
        tl.to(row, { x: 0, scale: 1, duration: 0.28 }, t0 + 0.2 + i * 0.16);
      });
    }
    captionAt(tl, caps, 0, t0);

    var tGrid = t0 + 0.95;
    if (waiting) tl.to(waiting, { scale: 1, y: 0, duration: 0.35 }, tGrid);
    if (grid) {
      window.gsap.set(grid, { y: 20, scale: 0.96, transformOrigin: '50% 100%' });
      tl.to(grid, { y: 0, scale: 1, duration: 0.4 }, tGrid);
    }
    if (heads.length) {
      window.gsap.set(heads, { y: 10, scale: 0.92 });
      tl.to(heads, { y: 0, scale: 1, duration: 0.3 }, tGrid);
    }
    if (cells.length) {
      window.gsap.set(cells, { scaleY: 0, transformOrigin: '50% 100%' });
      tl.to(cells, { scaleY: 1, duration: 0.28, stagger: 0.045 }, tGrid + 0.12);
    }
    captionAt(tl, caps, 1, tGrid);
    if (ruled) tl.to(ruled, { autoAlpha: 1, duration: 0.3 }, tGrid + 0.5);
    askAt(tl, page, tGrid + 0.7);
  }

  /* Mobile: web ↔ phone morph of the same approval task. */
  function bindMorph(page, tl) {
    var t0 = leadDecision(tl, page);
    var stage = q(page, '[data-morph-stage]');
    var web = q(page, '[data-morph="web"]');
    var phone = q(page, '[data-morph="phone"]');
    var caps = captions(page);
    var ask = askEl(page);
    if (caps.length) setCaption(caps, 0);
    if (ask) window.gsap.set(ask, { autoAlpha: 0, y: 8 });

    if (web) {
      window.gsap.set(web, {
        autoAlpha: 1,
        scale: 0.92,
        xPercent: 0,
        clipPath: 'inset(0% 0% 0% 0%)',
        transformOrigin: '18% 50%'
      });
      tl.to(web, { scale: 1, duration: 0.45 }, t0);
    }
    if (phone) {
      window.gsap.set(phone, {
        autoAlpha: 1,
        scale: 0.72,
        xPercent: 28,
        clipPath: 'inset(0% 0% 0% 70%)',
        transformOrigin: '85% 90%'
      });
    }
    captionAt(tl, caps, 0, t0);

    var tMorph = t0 + 0.7;
    if (web) {
      tl.to(web, {
        scale: 0.86,
        xPercent: -8,
        clipPath: 'inset(0% 38% 0% 0%)',
        duration: 0.75
      }, tMorph);
    }
    if (phone) {
      tl.to(phone, {
        scale: 1.04,
        xPercent: 0,
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 0.75
      }, tMorph);
    }
    captionAt(tl, caps, 1, tMorph);
    if (stage) {
      window.gsap.set(stage, { scale: 1 });
      tl.to(stage, { scale: 1.02, duration: 0.3 }, tMorph + 0.5);
      tl.to(stage, { scale: 1, duration: 0.25 }, tMorph + 0.8);
    }
    if (phone) tl.to(phone, { scale: 1, duration: 0.3 }, tMorph + 0.75);
    askAt(tl, page, tMorph + 0.9);
  }

  /* vs corporate: light vs heavy split-compare scrub. */
  function bindSplitWeight(page, tl) {
    var t0 = leadDecision(tl, page);
    var light = q(page, '[data-weight="light"]');
    var heavy = q(page, '[data-weight="heavy"]');
    var caps = captions(page);
    var ask = askEl(page);
    if (caps.length) setCaption(caps, 0);
    if (ask) window.gsap.set(ask, { autoAlpha: 0, y: 8 });

    if (light) {
      window.gsap.set(light, {
        autoAlpha: 1,
        scale: 1.08,
        xPercent: 0,
        clipPath: 'inset(0% 0% 0% 0%)',
        transformOrigin: '50% 20%'
      });
    }
    if (heavy) {
      window.gsap.set(heavy, {
        autoAlpha: 1,
        scale: 0.88,
        xPercent: 10,
        clipPath: 'inset(0% 0% 0% 42%)',
        transformOrigin: '100% 20%'
      });
    }
    captionAt(tl, caps, 0, t0);

    var tHeavy = t0 + 0.85;
    if (light) {
      tl.to(light, {
        scale: 0.9,
        xPercent: -6,
        clipPath: 'inset(0% 8% 0% 0%)',
        duration: 0.7
      }, tHeavy);
    }
    if (heavy) {
      tl.to(heavy, {
        scale: 1.06,
        xPercent: 0,
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 0.7
      }, tHeavy);
    }
    captionAt(tl, caps, 1, tHeavy);

    var tEven = tHeavy + 0.75;
    if (light) tl.to(light, { scale: 1, xPercent: 0, clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5 }, tEven);
    if (heavy) tl.to(heavy, { scale: 1, xPercent: 0, clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5 }, tEven);
    askAt(tl, page, tEven + 0.2);
  }

  /* Close: finding pin, ladder complete. */
  function bindFinding(page, tl) {
    var strip = q(page, '[data-ladder-strip]');
    var rungs = qq(page, '.film-rung');
    var fill = q(page, '[data-ladder-fill]');
    var caps = captions(page);
    if (caps.length) setCaption(caps, 0);
    if (strip) {
      window.gsap.set(strip, { scale: 1.16, transformOrigin: '20% 40%' });
      tl.to(strip, { scale: 1.04, transformOrigin: '55% 48%', duration: 1.0 }, 0);
    }
    if (rungs.length) {
      window.gsap.set(rungs, { scale: 0.86, y: 16 });
      tl.to(rungs, { scale: 1, y: 0, duration: 0.45, stagger: 0.08 }, 0.12);
    }
    if (fill) {
      window.gsap.set(fill, { scaleX: 0.2, transformOrigin: '0% 50%' });
      tl.to(fill, { scaleX: 1, duration: 0.9 }, 0.15);
    }
    captionAt(tl, caps, 0, 0.2);
    if (strip) tl.to(strip, { scale: 1, transformOrigin: '50% 50%', duration: 0.8 }, 1.05);
    captionAt(tl, caps, Math.min(1, caps.length - 1), 1.1);
  }

  function recipeFor(name) {
    switch (name) {
      case 'kenburns':
        return bindKenBurns;
      case 'phone':
        return bindPhone;
      case 'moneyCrop':
        return bindMoneyCrop;
      case 'splitDoor':
        return bindSplitDoor;
      case 'control':
        return bindControl;
      case 'morph':
        return bindMorph;
      case 'splitWeight':
        return bindSplitWeight;
      case 'finding':
        return bindFinding;
      default: {
        var unknown = name;
        return unknown ? bindKenBurns : bindKenBurns;
      }
    }
  }

  function endRatio(recipe) {
    return END_RATIO[recipe] || 2.4;
  }

  function bindCinematic(opts, pages, triggers) {
    var scroller = opts.scroller;
    var gsap = window.gsap;
    var head = function () { return headPx(scroller, opts.headerOffset); };

    pages.forEach(function (page) {
      var pinWanted = page.getAttribute('data-pin') !== 'false';
      var recipe = page.getAttribute('data-recipe') || 'kenburns';
      var fn = recipeFor(recipe);
      var hold = q(page, '[data-film-hold]') || page;
      var caps = captions(page);
      var shotEls = shots(page);
      var ask = askEl(page);
      var chip = chipEl(page);

      if (caps.length) {
        gsap.set(caps[0], { autoAlpha: 1, y: 0 });
        gsap.set(caps.slice(1), { autoAlpha: 0, y: 8 });
      }
      if (ask) gsap.set(ask, { autoAlpha: 0, y: 8 });
      if (chip) gsap.set(chip, { autoAlpha: 1, y: 0 });

      if (shotEls.length > 1) {
        pinStage(page, true);
        gsap.set(shotEls[0], {
          autoAlpha: 1, x: 0, y: 0, scale: 1, xPercent: 0,
          clipPath: 'inset(0% 0% 0% 0%)'
        });
        gsap.set(shotEls.slice(1), { autoAlpha: 0, clipPath: 'inset(100% 0% 0% 0%)' });
      }

      var tl = gsap.timeline({ defaults: { ease: 'none' } });
      fn(page, tl, scroller);

      if (!pinWanted) return;

      var index = pages.indexOf(page);

      /* Chrome counted once: pin the leftover stage under --study-head.
         pinSpacing is the runway. pin: true — sticky CSS is not the hold.
         preventOverlaps stops the last chapter from sitting on the next. */
      triggers.push(window.ScrollTrigger.create(stVars(scroller, {
        trigger: hold,
        start: function () { return 'top ' + head() + 'px'; },
        end: function () {
          return '+=' + Math.round(Math.max(viewH(scroller), 480) * endRatio(recipe));
        },
        pin: true,
        pinSpacing: true,
        /* Higher scrub lag = chapters play under trackpad instead of jumping to end. */
        scrub: 1.1,
        animation: tl,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        /* preventOverlaps + fastScrollEnd made fast Mac flicks skip the film. */
        preventOverlaps: false,
        fastScrollEnd: false,
        onToggle: function (self) {
          if (!self.isActive) return;
          if (opts.onStep) opts.onStep(index);
          pages.forEach(function (el, j) {
            el.classList.toggle('is-on', j === index);
          });
        }
      })));
    });
  }

  function goToBeat(scroller, world, headerFn, idOrIndex) {
    var pages = beatsOf(world);
    var el = typeof idOrIndex === 'number'
      ? pages[idOrIndex]
      : world.querySelector('[data-film-beat="' + idOrIndex + '"]');
    if (!el) return;
    var top;
    if (isView(scroller)) {
      top = el.getBoundingClientRect().top + viewY(scroller);
    } else {
      top = el.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
    }
    var offset = headPx(scroller, headerFn) - 8;
    scrollToY(scroller, Math.max(0, top - offset));
  }

  function bind(opts) {
    var world = opts.world;
    var scroller = opts.scroller;
    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;
    var pages = beatsOf(world);
    var mm = null;
    var triggers = [];
    var refreshTimers = [];

    var normalized = false;

    function killLocal() {
      refreshTimers.forEach(function (id) { window.clearTimeout(id); });
      refreshTimers = [];
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

    function refreshSoon() {
      if (!ScrollTrigger) return;
      ScrollTrigger.refresh();
      refreshTimers.push(window.setTimeout(function () { ScrollTrigger.refresh(); }, 160));
      refreshTimers.push(window.setTimeout(function () { ScrollTrigger.refresh(); }, 520));
    }

    if (!gsap || !ScrollTrigger || opts.forceStatic) {
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
    if (ScrollTrigger.normalizeScroll && !opts.forceStatic) {
      /* Coarse pointer only. Mac trackpads often report maxTouchPoints > 0;
         normalizeScroll there can swallow wheel / make the film feel dead. */
      var coarse = false;
      try {
        coarse = window.matchMedia('(pointer: coarse)').matches;
      } catch (err) {
        coarse = false;
      }
      if (coarse) {
        ScrollTrigger.normalizeScroll(isView(scroller) ? true : { target: scroller, allowNestedScroll: true });
        normalized = true;
      }
    }
    mm = gsap.matchMedia();
    mm.add(
      {
        motion: '(prefers-reduced-motion: no-preference)',
        reduceMotion: '(prefers-reduced-motion: reduce)'
      },
      function (context) {
        var cond = context.conditions || {};
        killLocal();
        if (cond.reduceMotion) {
          watchSteps(scroller, pages, opts.onStep, triggers);
          setupStatic(world);
        } else {
          bindCinematic(opts, pages, triggers);
        }
        return function () { killLocal(); };
      }
    );

    refreshSoon();
    window.setTimeout(startPage, 80);

    return {
      kill: function () {
        if (mm) mm.revert();
        mm = null;
        killLocal();
        if (normalized && ScrollTrigger && ScrollTrigger.normalizeScroll) {
          ScrollTrigger.normalizeScroll(false);
          normalized = false;
        }
      },
      goTo: function (id) { goToBeat(scroller, world, opts.headerOffset, id); },
      pageCount: function () { return pages.length; }
    };
  }

  return { bind: bind };
})();
