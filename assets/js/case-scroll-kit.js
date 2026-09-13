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
    cover: 1.5,
    ends: 4.8,
    jobs: 2.7,
    door: 2.55,
    money: 2.6,
    verbs: 2.8,
    ending: 3.15,
    finding: 2.0
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
    if (isView(scroller)) return window.innerHeight || 800;
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
    qq(page, '[data-film-stage], [data-film-hold], .film-board, [data-focus], [data-shot], [data-caption], [data-film-ask], [data-film-decision], [data-film-ruled], [data-film-track], .film-sheet, .film-sheet i, .film-action, .film-ladder, .film-ladder__world, .film-ladder__row, .film-ladder__fill, .film-cell, .film-grid__head, .film-balance, .film-job__screen, .film-device, .film-ui-band, .film-empty article, .film-step').forEach(function (el) {
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
      qq(page, '[data-focus], [data-shot], .film-board, [data-film-track], .film-sheet, .film-sheet i, .film-cell, .film-device, .film-empty article, .film-step, .film-ladder__row, .film-ladder__world, .film-ladder__fill').forEach(function (el) {
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

  function bindCover(page, tl) {
    var web = q(page, '.film-device--web');
    var phone = q(page, '.film-device--phone');
    var caps = captions(page);
    if (caps.length) setCaption(caps, 0);
    if (web) {
      tl.fromTo(web, {
        scale: 0.88,
        y: 42,
        transformOrigin: '48% 62%'
      }, {
        scale: 1,
        y: 0,
        duration: 1.15
      }, 0.2);
    }
    if (phone) {
      tl.fromTo(phone, {
        scale: 0.78,
        x: 56,
        y: 32,
        transformOrigin: '85% 90%'
      }, {
        scale: 1,
        x: 0,
        y: 0,
        duration: 1.1
      }, 0.38);
    }
  }

  /* 3D ladder: camera walks the rungs. Distance on Z/Y/rotationY, not opacity. */
  function rungPose(i, focus) {
    var d = i - focus;
    var abs = d < 0 ? -d : d;
    return {
      x: d * 186,
      y: 4 + d * 58,
      z: d === 0 ? 90 : -abs * 140,
      rotationY: d * -22,
      rotationX: 12 + abs * 5,
      scale: abs === 0 ? 1.12 : Math.max(0.68, 0.9 - abs * 0.1),
      autoAlpha: abs === 0 ? 1 : abs === 1 ? 0.88 : abs === 2 ? 0.48 : 0.14
    };
  }

  function placeRungs(tl, items, focus, at) {
    items.forEach(function (el, i) {
      var pose = rungPose(i, focus);
      tl.set(el, { zIndex: i === focus ? 32 : 22 - Math.abs(i - focus) }, at);
      tl.to(el, {
        x: pose.x,
        y: pose.y,
        z: pose.z,
        rotationY: pose.rotationY,
        rotationX: pose.rotationX,
        scale: pose.scale,
        autoAlpha: pose.autoAlpha,
        duration: 0.62
      }, at);
    });
  }

  function bindEnds(page, tl) {
    var t0 = leadDecision(tl, page);
    var items = focusEls(page);
    var world = q(page, '[data-ladder-world]');
    var fill = q(page, '[data-ladder-fill]');
    var caps = captions(page);
    var shotEls = shots(page);
    var n = items.length;
    var ask = askEl(page);
    var threeD = window.matchMedia('(min-width: 641px)').matches;
    var step = threeD ? 0.7 : 0.45;
    if (caps.length) setCaption(caps, 0);
    if (ask) window.gsap.set(ask, { autoAlpha: 0, y: 8 });
    if (!n) return;

    if (fill) window.gsap.set(fill, { scaleX: 1 / n, transformOrigin: '0% 50%' });

    if (threeD) {
      if (world) window.gsap.set(world, { rotationY: -12, rotationX: 14, z: 0, force3D: true, transformPerspective: 1500 });
      window.gsap.set(q(page, '.film-ladder__row') || items[0].parentNode, { transformStyle: 'preserve-3d', force3D: true });
      items.forEach(function (el, i) {
        var pose = rungPose(i, 0);
        window.gsap.set(el, {
          xPercent: -50,
          x: pose.x,
          y: pose.y,
          z: pose.z,
          rotationY: pose.rotationY,
          rotationX: pose.rotationX,
          scale: pose.scale,
          autoAlpha: pose.autoAlpha,
          transformOrigin: '50% 80%',
          force3D: true,
          zIndex: i === 0 ? 32 : 22 - i
        });
      });
      items.forEach(function (_el, i) {
        var at = t0 + i * step;
        placeRungs(tl, items, i, at);
        if (world) {
          tl.to(world, {
            rotationY: -12 + i * 4.5,
            rotationX: 14 - i * 1.6,
            z: i * 20,
            duration: 0.62
          }, at);
        }
        if (fill) tl.to(fill, { scaleX: (i + 1) / n, duration: 0.62 }, at);
        captionAt(tl, caps, Math.min(i, caps.length - 1), at);
      });
    } else {
      window.gsap.set(items, { scale: 0.9, y: 10, transformOrigin: '50% 80%' });
      items.forEach(function (_el, i) {
        var at = t0 + i * step;
        items.forEach(function (card, j) {
          var on = i === j;
          tl.to(card, {
            scale: on ? 1.06 : 0.9,
            y: on ? -8 : 8,
            autoAlpha: on ? 1 : 0.5,
            duration: 0.4
          }, at);
        });
        if (fill) tl.to(fill, { scaleX: (i + 1) / n, duration: 0.4 }, at);
        captionAt(tl, caps, Math.min(i, caps.length - 1), at);
      });
    }

    var tWalk = t0 + n * step;
    if (shotEls.length > 1) {
      window.gsap.set(shotEls[0], {
        autoAlpha: 1, x: 0, y: 0, scale: 1, xPercent: 0,
        clipPath: 'inset(0% 0% 0% 0%)'
      });
      window.gsap.set(shotEls.slice(1), {
        autoAlpha: 0,
        clipPath: 'inset(100% 0% 0% 0%)'
      });
      cropIn(tl, shotEls[0], shotEls[1], tWalk + 0.15);
      captionAt(tl, caps, Math.min(n, caps.length - 1), tWalk + 0.15);
      askAt(tl, page, tWalk + 0.55);
    } else {
      askAt(tl, page, tWalk);
    }
  }

  function bindJobs(page, tl) {
    var t0 = leadDecision(tl, page);
    var items = focusEls(page);
    var caps = captions(page);
    var ask = askEl(page);
    var screens = qq(page, '.film-job__screen');
    if (caps.length) setCaption(caps, 0);
    if (ask) window.gsap.set(ask, { autoAlpha: 0, y: 8 });

    window.gsap.set(items, { scale: 0.78, y: 48, x: 0, transformOrigin: '50% 70%' });
    items.forEach(function (el, i) {
      tl.to(el, { scale: 1, y: 0, duration: 0.4 }, t0 + i * 0.16);
    });

    var tCycle = t0 + 0.7;
    items.forEach(function (el, i) {
      var at = tCycle + i * 0.7;
      items.forEach(function (card, j) {
        var on = i === j;
        tl.to(card, {
          scale: on ? 1.14 : 0.86,
          y: on ? -18 : 16,
          x: on ? 0 : (j - i) * 8,
          duration: 0.5
        }, at);
      });
      screens.forEach(function (screen, j) {
        var phone = items[j] && items[j].getAttribute('data-focus') === 'approver';
        var on = i === j;
        tl.to(screen, {
          scaleX: on && phone ? 0.62 : 1,
          scaleY: on && phone ? 1.12 : 1,
          transformOrigin: '50% 0%',
          duration: 0.5
        }, at);
      });
      captionAt(tl, caps, Math.min(i, caps.length - 1), at);
    });

    var tBack = tCycle + items.length * 0.7;
    tl.to(items, { scale: 1, y: 0, x: 0, duration: 0.45 }, tBack);
    tl.to(screens, { scaleX: 1, scaleY: 1, duration: 0.45 }, tBack);
    captionAt(tl, caps, 0, tBack);
    askAt(tl, page, tBack + 0.2);
  }

  function bindDoor(page, tl) {
    var t0 = leadDecision(tl, page);
    var door = q(page, '[data-focus="door"]');
    var rest = qq(page, '[data-focus="nav"]');
    var action = q(page, '.film-action');
    var shotEls = shots(page);
    var caps = captions(page);
    var ask = askEl(page);
    var ruled = q(page, '[data-film-ruled]');
    if (caps.length) setCaption(caps, 0);
    if (ask) window.gsap.set(ask, { autoAlpha: 0, y: 8 });

    if (door) {
      window.gsap.set(door, { scale: 1, x: 0, transformOrigin: '12% 50%' });
      tl.to(door, { scale: 1.1, x: 6, y: -4, duration: 0.7 }, t0);
      if (rest.length) {
        tl.to(rest, { scale: 0.94, x: -10, y: 6, duration: 0.7 }, t0);
      }
      captionAt(tl, caps, Math.min(1, caps.length - 1), t0);
    }

    if (shotEls.length > 1) {
      window.gsap.set(shotEls[0], { autoAlpha: 1, xPercent: 0, scale: 1, clipPath: 'inset(0% 0% 0% 0%)' });
      wipeSplit(tl, shotEls[0], shotEls[1], t0 + 0.85);
      if (action) {
        window.gsap.set(action, { scale: 1, transformOrigin: '80% 50%' });
        tl.to(action, { scale: 1.08, y: -6, duration: 0.35 }, t0 + 1.25);
        tl.to(action, { scale: 1, y: 0, duration: 0.28 }, t0 + 1.6);
      }
      captionAt(tl, caps, Math.min(2, caps.length - 1), t0 + 0.85);
      if (ruled) tl.to(ruled, { autoAlpha: 1, y: 0, duration: 0.4 }, t0 + 1.15);
      askAt(tl, page, t0 + 1.55);
    } else {
      askAt(tl, page, t0 + 0.9);
    }
  }

  function bindMoney(page, tl) {
    var t0 = leadDecision(tl, page);
    var bad = qq(page, '.film-row.is-bad');
    var ok = qq(page, '.film-row:not(.is-bad)');
    var fail = q(page, '[data-shot="fail"] .film-board') || q(page, '.film-fail');
    var shotEls = shots(page);
    var balances = qq(page, '.film-balance');
    var bands = qq(page, '.film-balance .film-ui-band');
    var caps = captions(page);
    var ask = askEl(page);
    if (caps.length) setCaption(caps, 0);
    if (ask) window.gsap.set(ask, { autoAlpha: 0, y: 8 });

    if (fail) {
      window.gsap.set(fail, { scale: 1, transformOrigin: '50% 18%' });
      tl.to(fail, { scale: 1.16, y: -12, duration: 0.55 }, t0);
    }
    if (ok.length) tl.to(ok, { scale: 0.92, y: 10, duration: 0.45 }, t0);
    if (bad.length) tl.to(bad, { scale: 1.08, y: -8, duration: 0.5 }, t0);
    captionAt(tl, caps, Math.min(1, caps.length - 1), t0);

    if (shotEls.length > 1) {
      window.gsap.set(shotEls[0], { autoAlpha: 1, xPercent: 0, scale: 1, clipPath: 'inset(0% 0% 0% 0%)' });
      window.gsap.set(shotEls[1], { autoAlpha: 0, xPercent: 28, scale: 1, clipPath: 'inset(0% 0% 0% 100%)' });
      tl.to(shotEls[0], {
        xPercent: -24,
        scale: 0.92,
        clipPath: 'inset(0% 40% 0% 0%)',
        duration: 0.5
      }, t0 + 0.75);
      tl.fromTo(shotEls[1], {
        autoAlpha: 1,
        xPercent: 28,
        clipPath: 'inset(0% 0% 0% 100%)'
      }, {
        xPercent: 0,
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 0.55,
        immediateRender: false
      }, t0 + 0.75);
      tl.to(shotEls[0], { autoAlpha: 0, duration: 0.2 }, t0 + 1.2);
      captionAt(tl, caps, Math.min(2, caps.length - 1), t0 + 0.85);
      if (balances.length) {
        window.gsap.set(balances, { scale: 0.86, y: 18 });
        window.gsap.set(bands, { scaleX: 0.18, transformOrigin: '0% 50%' });
        balances.forEach(function (el, i) {
          var at = t0 + 1.35 + i * 0.22;
          tl.to(el, { scale: 1.06, y: -6, duration: 0.22 }, at);
          if (bands[i]) tl.to(bands[i], { scaleX: 1, duration: 0.22 }, at);
          tl.to(el, { scale: 1, y: 0, duration: 0.16 }, at + 0.22);
        });
      }
      askAt(tl, page, t0 + 2.2);
    } else {
      askAt(tl, page, t0 + 0.8);
    }
  }

  function bindVerbs(page, tl) {
    var t0 = leadDecision(tl, page);
    var cells = qq(page, '[data-shot="grid"] .film-cell');
    var heads = qq(page, '[data-shot="grid"] .film-grid__head');
    var shotEls = shots(page);
    var caps = captions(page);
    var ask = askEl(page);
    var ruled = q(page, '[data-film-ruled]');
    if (caps.length) setCaption(caps, 0);
    if (ask) window.gsap.set(ask, { autoAlpha: 0, y: 8 });

    if (cells.length) {
      window.gsap.set(cells, { scaleY: 0, transformOrigin: '50% 100%' });
      window.gsap.set(heads, { y: 10, scale: 0.92 });
      tl.to(heads, { y: 0, scale: 1, duration: 0.35 }, t0);
      tl.to(cells, { scaleY: 1, duration: 0.28, stagger: 0.045 }, t0 + 0.12);
      captionAt(tl, caps, Math.min(1, caps.length - 1), t0);
    }

    if (shotEls.length > 1) {
      window.gsap.set(shotEls[0], { autoAlpha: 1, scale: 1, transformOrigin: '50% 50%', clipPath: 'inset(0% 0% 0% 0%)' });
      window.gsap.set(shotEls[1], { autoAlpha: 0, scale: 0.92, clipPath: 'inset(100% 0% 0% 0%)' });
      cropIn(tl, shotEls[0], shotEls[1], t0 + 1.35);
      captionAt(tl, caps, Math.min(2, caps.length - 1), t0 + 1.45);
      if (ruled) tl.to(ruled, { autoAlpha: 1, duration: 0.35 }, t0 + 1.6);
      askAt(tl, page, t0 + 1.95);
    } else {
      askAt(tl, page, t0 + 0.9);
    }
  }

  function bindEnding(page, tl, scroller) {
    var t0 = leadDecision(tl, page);
    var track = q(page, '[data-film-track]');
    var steps = qq(page, '.film-step');
    var empties = qq(page, '.film-empty article');
    var shotEls = shots(page);
    var caps = captions(page);
    var ask = askEl(page);
    if (caps.length) setCaption(caps, 0);
    if (ask) window.gsap.set(ask, { autoAlpha: 0, y: 8 });

    if (track && steps.length) {
      var wrap = track.parentNode;
      function sizeSteps() {
        var w = wrap ? wrap.clientWidth : 0;
        if (!w) return 0;
        steps.forEach(function (step) {
          step.style.flex = '0 0 ' + w + 'px';
          step.style.width = w + 'px';
        });
        return w;
      }
      sizeSteps();
      window.gsap.set(track, { x: 0 });
      window.gsap.set(steps, { scale: 0.94, y: 14 });
      tl.to(steps[0], { scale: 1, y: 0, duration: 0.35 }, t0);
      steps.forEach(function (step, i) {
        var at = t0 + i * 0.9;
        if (i > 0) {
          tl.to(track, {
            x: function () { return -Math.round(sizeSteps() * i); },
            duration: 0.45
          }, at);
          tl.to(steps[i - 1], { scale: 0.92, y: 10, duration: 0.35 }, at);
          tl.to(step, { scale: 1, y: 0, duration: 0.4 }, at);
        }
        captionAt(tl, caps, Math.min(i, caps.length - 1), at);
      });
    }

    var tFan = t0 + Math.max(1, steps.length) * 0.85;
    if (shotEls.length > 1) {
      window.gsap.set(shotEls[1], { autoAlpha: 0, scale: 1, y: 0, clipPath: 'inset(100% 0% 0% 0%)' });
      cropIn(tl, shotEls[0], shotEls[1], tFan);
      if (empties.length) {
        window.gsap.set(empties, { scale: 0.7, y: 28, rotation: 0 });
        tl.to(empties, {
          scale: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.08
        }, tFan + 0.4);
      }
      captionAt(tl, caps, Math.min(3, caps.length - 1), tFan);
      askAt(tl, page, tFan + 0.7);
    } else {
      askAt(tl, page, tFan);
    }
  }

  function bindFinding(page, tl) {
    var sheet = q(page, '.film-sheet');
    var tiles = qq(page, '.film-sheet i');
    var caps = captions(page);
    if (caps.length) setCaption(caps, 0);
    if (!sheet) return;
    window.gsap.set(sheet, { scale: 1.16, transformOrigin: '30% 32%' });
    if (tiles.length) window.gsap.set(tiles, { scale: 0.55, transformOrigin: '50% 50%' });
    tl.to(sheet, { scale: 1.06, transformOrigin: '58% 46%', duration: 1.05 }, 0);
    if (tiles.length) {
      tl.to(tiles, { scale: 1, duration: 0.55, stagger: { each: 0.018, from: 'center' } }, 0.15);
    }
    captionAt(tl, caps, Math.min(1, caps.length - 1), 0.2);
    tl.to(sheet, { scale: 1, transformOrigin: '50% 50%', duration: 0.9 }, 1.1);
    captionAt(tl, caps, 0, 1.15);
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

  function endRatio(recipe) {
    return END_RATIO[recipe] || 2.4;
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
        scrub: 0.55,
        animation: tl,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        preventOverlaps: true,
        fastScrollEnd: true,
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
      var touch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
      if (touch) {
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
