/**
 * CBX300 case study — Section 01 cover + Section 02 D2 worry board.
 * Cover: kicker → accent → word. Image overlaps type from the right;
 * type always paints on top of the image.
 * Growth: coffee panel curtains over the parked cover + chrome
 * (--cbx-rise / --panel-flush, same family as landing --rise /
 * --panel-flush / is-projects-in), then one pinned morph:
 * glanceable three-stage rail (kept), worry question + subtext,
 * inline SVG illustration. No clay cast. No product chip.
 * Cream stays calm. Multiverse uses glitch plates on chrome + type.
 * Section 03 (How our bank answers her) mounts after the coffee pin.
 * Later chapters stay hidden stubs until the next design pass.
 * Lisa Charlie is a demo brand. Aisha is a representative example.
 */
window.Cbx300Case = (function () {
  'use strict';

  var META = {
    kicker: 'Banking that',
    accent: 'Grows with',
    word: 'the Business'
  };

  /* D2 worry board. Rail labels stay. Questions replace the old intro. */
  var BEATS = [
    {
      id: 'freelancer',
      label: 'Freelancer',
      num: '01',
      kicker: 'Her worry, every morning',
      ask: 'Did the client pay yet?',
      sub: 'Just her, a laptop and a stack of invoices.',
      illo: 'assets/img/aisha-growth/illo-d2-1.svg',
      crop: true
    },
    {
      id: 'sole',
      label: 'Shop of two',
      num: '02',
      kicker: 'Her worry, once she hires',
      ask: 'Can I afford her salary this month?',
      sub: 'One hire, one shared card, and payday every month.',
      illo: 'assets/img/aisha-growth/illo-d2-2.svg',
      crop: true
    },
    {
      id: 'mid',
      label: 'Mid-size',
      num: '03',
      kicker: 'Her worry, with a team',
      ask: "Who's waiting on me today?",
      sub: 'Eight people, and most of them need her yes.',
      illo: 'assets/img/aisha-growth/illo-d2-3.svg',
      crop: false
    }
  ];

  var STUBS = [
    { id: 'approvals', num: '04', title: 'My team can prepare. I need to approve.' },
    { id: 'money', num: '05', title: 'Can I afford to pay this supplier today?' },
    { id: 'permissions', num: '06', title: 'My team needs access, but not all access.' },
    { id: 'grammar', num: '07', title: 'Same goal. Different moment.' },
    { id: 'scale', num: '08', title: 'Volume finding. Results stay blank until real numbers exist.' }
  ];

  var SCENE_ILLO = 'assets/img/aisha-growth/illo-d2-scene.svg?v=s8';
  /* Aisha and the plant stay at x 0. Lina shifts right so her laptop
     clears the mug; the stage-03 left figure shifts off the plant. */
  var LINA_X = 112;
  var SIDE_L_X = -28;
  /* Docked stages take one step per gesture. ~72px of travel commits
     the next rail, then the lock swallows the rest of that gesture.
     The curtain rise and fall stay scroll-scrubbed, like the landing
     projects curtain. They are not a threshold snap. */
  var STEP_PX = 72;
  var GESTURE_QUIET = 80;
  /* After a docked stage change, ignore input until the wheel has been
     quiet this long. The quiet window starts when the in-place transition
     ends. 180ms sits in the 150–200ms band that eats a flick's tail. */
  var STEP_LOCK_MS = 180;
  /* Idle in the curtain band, then ease to the nearer end (cover or 01). */
  var RISE_REST_MS = 220;
  var DOCK_PX = 4;
  /* Docked 01↔02↔03 plays in place. The scroll rail jumps immediately
     so deep links and close stay mapped; the panel itself does not move. */
  var SHIFT_DUR = 0.62;
  var SHIFT_COPY = 28;
  var SHIFT_ILLO = 20;
  var STAGE_TOPS = [
    ['s01', 's01-arrow'],
    ['s02', 's02-lina', 's02-arrows'],
    ['s03', 's03-sides', 's03-row', 's03-bench']
  ];
  var STAGE_BITS = [
    ['s01-inv-015', 's01-inv-014', 's01-inv-012', 's01-arrow', 's01-arrow-head'],
    ['s02-lina', 's02-card-shared', 's02-card-payday', 's02-card-free', 's02-arrows'],
    ['s03-side-l', 's03-side-r', 's03-row', 's03-bench', 's03-card-payroll', 's03-card-supplier', 's03-pill']
  ];

  var motion = {
    triggers: [],
    tween: null,
    riseTween: null,
    riseState: { p: 0 },
    refreshTimers: [],
    normalized: false,
    pin: null,
    stage: null,
    idle: null,
    pulsed: {},
    reduce: false,
    onStep: null,
    stepCtrl: null,
    coverPaused: false
  };

  /* Landing projects curtain is the feel source of truth:
     .scroll-run 200vh => riseMax() ≈ 1 viewport of native scroll,
     then tweenBento lerps visual p (duration 0.7, ease power3.out,
     overwrite true). Mirror that family here. Morph still owns the
     long pin after the sheet is flush-top. */
  var RISE_DUR = 1;
  var RISE_LERP = 0.7;
  /* Stage 01 enter used to overlap the curtain and start 01→02 0.42vh
     after dock (~0.18vh of fully-shown 01). Trackpad inertia from the
     rise then landed on 02. Hold 01 after the pin docks; space each
     stage so one flick cannot skip it. */
  var STAGE_HOLD = 0.55;
  var TRANS_12 = 0.64;
  var TRANS_23 = 0.96;
  /* Pin ends on the stage-03 snap. A trailing half-hold was a dead
     tail: one gesture down moved with no visible change. */
  var MORPH_VH = STAGE_HOLD * 2 + TRANS_12 + TRANS_23 + STAGE_HOLD * 0.5;
  /* Stages 01–02 only. 60 local units inside the 1.16 cast scale is
     ~70px on screen. Legs shorten by the same amount so the feet stay
     planted; stage 03 tweens both back. */
  var FLOOR_DROP = 60;
  var CAST_SCALE = 1.16;
  /* Same root-unit shift the cast scale applies to FLOOR_DROP. The
     floor-shift group, Lina, and the connector ends all use this. */
  var FLOOR_ROOT = FLOOR_DROP * CAST_SCALE;
  var LEG_FULL = 104;
  var LEG_ORIGIN = '300 416';

  function isMultiverse() {
    return document.documentElement.classList.contains('is-multiverse');
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null && text !== '') node.textContent = text;
    return node;
  }

  function shout(tag, className, text, glitch) {
    var node = el(tag, glitch ? className + ' glitch' : className, text);
    node.setAttribute('data-latin', text);
    if (glitch) node.setAttribute('data-text', text);
    return node;
  }

  function cardSrc(project) {
    if (project && project.cardImage) return project.cardImage;
    if (project && project.cover) return project.cover;
    return 'assets/img/work/cin-work-sme.png';
  }

  function pad(n) {
    return String(n).length < 2 ? '0' + n : String(n);
  }

  function viewH() {
    var vv = window.visualViewport;
    if (vv && vv.height) return vv.height;
    return window.innerHeight || 800;
  }

  function paneH() {
    return Math.max(280, Math.round(viewH()));
  }

  function studyChrome() {
    return document.querySelector('.study[data-template="cbx300"] .study__chrome');
  }

  function panelFlushFromRise(rise) {
    if (rise <= 0) return 1;
    if (rise >= 0.05) return 0;
    return 1 - rise / 0.05;
  }

  function growthPane() {
    return motion.pin || document.querySelector('[data-cbx-growth]');
  }

  function applyCbxRise(p) {
    var html = document.documentElement;
    var rise = 1 - Math.max(0, Math.min(1, p));
    var flush = panelFlushFromRise(rise).toFixed(4);
    var pane = growthPane();
    html.style.setProperty('--cbx-rise', rise.toFixed(4));
    /* Write --panel-flush on the coffee pane, not html. Landing already
       owns html --panel-flush for the projects rail (flush 1 after open). */
    if (pane) pane.style.setProperty('--panel-flush', flush);
    html.classList.toggle('is-cbx-growth-in', p > 0.08);
    syncCoverParticles(rise);
  }

  /* The constellation canvas sits under the docked curtain. Pause it
     once the sheet covers the viewport, and resume as the sheet falls. */
  function syncCoverParticles(rise) {
    var iris = window.IrisMotion;
    if (!iris || !iris.setCoverPaused) return;
    var onStudy = document.documentElement.classList.contains('is-study-page');
    if (!onStudy) {
      if (motion.coverPaused) {
        motion.coverPaused = false;
        iris.setCoverPaused(false);
      }
      return;
    }
    if (!motion.coverPaused && rise <= 0.03) {
      motion.coverPaused = true;
      iris.setCoverPaused(true);
    } else if (motion.coverPaused && rise >= 0.05) {
      motion.coverPaused = false;
      iris.setCoverPaused(false);
    }
  }

  function tweenCbxRise(next, immediate) {
    var gsap = window.gsap;
    var target = Math.max(0, Math.min(1, next));
    if (immediate || !gsap) {
      if (motion.riseTween && motion.riseTween.kill) motion.riseTween.kill();
      motion.riseTween = null;
      motion.riseState.p = target;
      applyCbxRise(target);
      return;
    }
    motion.riseTween = gsap.to(motion.riseState, {
      p: target,
      duration: RISE_LERP,
      ease: 'power3.out',
      overwrite: true,
      onUpdate: function () { applyCbxRise(motion.riseState.p); },
      onComplete: function () { motion.riseTween = null; }
    });
  }

  function restRise() {
    var html = document.documentElement;
    var pane = growthPane();
    if (motion.riseTween && motion.riseTween.kill) motion.riseTween.kill();
    motion.riseTween = null;
    html.classList.remove('is-cbx-growth-in');
    html.style.removeProperty('--cbx-rise');
    if (pane) pane.style.removeProperty('--panel-flush');
    motion.riseState.p = 0;
    motion.coverPaused = false;
    if (window.IrisMotion && window.IrisMotion.setCoverPaused) {
      window.IrisMotion.setCoverPaused(false);
    }
  }

  function restChrome() {
    var chrome = studyChrome();
    var gsap = window.gsap;
    if (!chrome) return;
    chrome.classList.remove('is-away');
    chrome.removeAttribute('aria-hidden');
    if (gsap) {
      gsap.set(chrome, { clearProps: 'opacity,visibility,pointerEvents,transform,y' });
    } else {
      chrome.style.opacity = '';
      chrome.style.visibility = '';
      chrome.style.pointerEvents = '';
      chrome.style.transform = '';
    }
  }

  function buildCover(project) {
    var glitch = isMultiverse();
    var section = el('section', 'cbx-cover');
    section.setAttribute('data-cbx-section', '01');
    section.setAttribute('data-cbx-live', '');
    section.setAttribute('aria-labelledby', 'cbx-cover-heading');

    var inner = el('div', 'cbx-cover__inner');

    var type = el('div', 'hero__type cbx-cover__type');
    var heading = el('h1', 'hero__heading');
    heading.id = 'cbx-cover-heading';
    heading.appendChild(shout('span', 'hero__kicker', META.kicker, glitch));

    var display = el('span', 'hero__display');
    display.appendChild(shout('span', 'hero__accent', META.accent, glitch));
    display.appendChild(shout('span', 'hero__word', META.word, glitch));
    heading.appendChild(display);
    type.appendChild(heading);

    var media = el('figure', 'work-card cbx-cover__media');
    media.setAttribute('data-tone', 'cream');
    media.setAttribute('aria-label', 'SME Banking');
    var shot = el('span', 'work-card__media');
    var img = document.createElement('img');
    img.className = 'work-card__img';
    img.alt = '';
    img.width = 720;
    img.height = 900;
    img.src = cardSrc(project);
    shot.appendChild(img);
    media.appendChild(shot);

    inner.appendChild(media);
    inner.appendChild(type);
    section.appendChild(inner);
    return section;
  }

  function beatCopy(beat, index, glitch) {
    var beatEl = el('div', 'cbx-growth__beat' + (index === 0 ? ' is-on' : ''));
    beatEl.setAttribute('data-cbx-beat', beat.id);
    beatEl.setAttribute('data-beat-index', String(index));

    var lab = el('p', 'cbx-growth__lab');
    lab.appendChild(el('span', 'cbx-growth__lab-num', beat.num));
    lab.appendChild(el('span', 'cbx-growth__lab-name', beat.kicker));
    beatEl.appendChild(lab);

    var ask = el('h2', 'cbx-growth__ask');
    var quote = el('q', 'cbx-growth__quote');
    var askText = el('span', glitch ? 'cbx-growth__ask-text glitch' : 'cbx-growth__ask-text');
    askText.setAttribute('data-latin', beat.ask);
    if (glitch) askText.setAttribute('data-text', beat.ask);
    var words = beat.ask.split(' ');
    words.forEach(function (part, w) {
      if (w) askText.appendChild(document.createTextNode(' '));
      askText.appendChild(el('span', 'cbx-growth__word', part));
    });
    quote.appendChild(askText);
    ask.appendChild(quote);
    beatEl.appendChild(ask);
    beatEl.appendChild(el('span', 'cbx-growth__rule'));
    beatEl.appendChild(el('p', 'cbx-growth__sub', beat.sub));
    return beatEl;
  }

  function buildRail() {
    var wrap = el('div', 'cbx-growth__rail-wrap');
    var rail = el('ol', 'cbx-growth__rail');
    rail.setAttribute('data-cbx-rail', '');
    rail.setAttribute('aria-label', 'Aisha grows through three stages');
    BEATS.forEach(function (beat, i) {
      var item = el('li', 'cbx-growth__step' + (i === 0 ? ' is-on' : ''));
      item.setAttribute('data-cbx-step', beat.id);
      item.setAttribute('data-step-index', String(i));
      item.appendChild(el('span', 'cbx-growth__step-num', pad(i + 1)));
      item.appendChild(el('span', 'cbx-growth__step-name', beat.label));
      rail.appendChild(item);
    });
    var ink = el('span', 'cbx-growth__rail-ink');
    ink.setAttribute('data-cbx-rail-ink', '');
    wrap.appendChild(rail);
    wrap.appendChild(ink);
    return wrap;
  }

  function illoSlot() {
    var slot = el('div', 'cbx-growth__illo is-on');
    slot.setAttribute('data-cbx-illo', 'scene');
    slot.setAttribute('data-illo-src', SCENE_ILLO);
    slot.setAttribute('data-illo-crop', '1');
    slot.setAttribute('aria-hidden', 'true');
    return slot;
  }

  function tightenIllo(svg, crop) {
    if (!svg) return;
    svg.removeAttribute('width');
    svg.removeAttribute('height');
    /* Fill the card well. Bottom-anchored slice; the viewBox keeps the
       lamp, cards, people, desk and bench inside the widest stage. */
    svg.setAttribute('preserveAspectRatio', crop ? 'xMidYMax slice' : 'xMidYMid slice');
    if (!crop) return;
    svg.setAttribute('viewBox', '-110 -72 860 700');
  }

  function paintIllo(slot, done) {
    var src = slot.getAttribute('data-illo-src');
    var crop = slot.getAttribute('data-illo-crop') === '1';
    var finish = function () {
      if (done) done();
    };
    if (slot.querySelector('svg, img')) {
      finish();
      return;
    };
    if (!src || !window.fetch) {
      finish();
      return;
    }
    window.fetch(src).then(function (res) {
      if (!res.ok) throw new Error('illo ' + src);
      return res.text();
    }).then(function (markup) {
      slot.innerHTML = markup;
      tightenIllo(slot.querySelector('svg'), crop);
      finish();
    }).catch(function () {
      var img = document.createElement('img');
      img.className = 'cbx-growth__illo-img';
      img.alt = '';
      img.src = src;
      slot.appendChild(img);
      finish();
    });
  }

  function fillIllos(root, done) {
    var slots = root ? root.querySelectorAll('[data-cbx-illo]') : [];
    var left = slots.length;
    if (!left) {
      done();
      return;
    }
    Array.prototype.forEach.call(slots, function (slot) {
      paintIllo(slot, function () {
        left -= 1;
        if (left <= 0) done();
      });
    });
  }

  function buildGrowth() {
    var glitch = isMultiverse();
    var section = el('section', 'cbx-growth');
    section.setAttribute('data-cbx-section', '02');
    section.setAttribute('data-cbx-live', '');
    section.setAttribute('data-cbx-growth', '');
    section.setAttribute('data-cbx-live-beat', '0');
    section.setAttribute('aria-label', 'Aisha grows through three worries.');

    var scene = el('div', 'cbx-growth__scene');
    scene.setAttribute('data-cbx-board', '');
    scene.appendChild(buildRail());

    var board = el('div', 'cbx-growth__board');
    var worry = el('div', 'cbx-growth__worry');
    var voice = el('div', 'cbx-growth__voice');
    voice.setAttribute('data-cbx-beats', '');
    BEATS.forEach(function (beat, i) {
      voice.appendChild(beatCopy(beat, i, glitch));
    });
    worry.appendChild(voice);

    var pic = el('div', 'cbx-growth__pic');
    pic.setAttribute('data-cbx-pic', '');
    var picMedia = el('div', 'cbx-growth__pic-media');
    picMedia.appendChild(illoSlot());
    pic.appendChild(picMedia);

    board.appendChild(worry);
    board.appendChild(pic);
    scene.appendChild(board);
    section.appendChild(scene);
    return section;
  }

  function buildStubs() {
    var rest = el('div', 'cbx-rest');
    rest.setAttribute('data-cbx-rest', '');
    rest.hidden = true;
    rest.setAttribute('aria-hidden', 'true');
    STUBS.forEach(function (stub) {
      var section = el('section', 'cbx-stub');
      section.setAttribute('data-cbx-section', stub.num);
      section.setAttribute('data-cbx-stub', stub.id);
      section.appendChild(el('h2', 'cbx-stub__title', stub.title));
      rest.appendChild(section);
    });
    return rest;
  }

  function liveText(node) {
    return (node.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function burstSafe(iris, node, reduce) {
    if (!iris || !iris.burstGlitch) return;
    /* Letter-swap rewrites textContent. Nested chrome (01 / 02) must keep its spans. */
    if (node.children && node.children.length) {
      node.classList.remove('is-glitching', 'is-slam');
      void node.offsetWidth;
      node.classList.add('is-glitching', 'is-slam');
      window.setTimeout(function () {
        node.classList.remove('is-glitching', 'is-slam');
      }, 720);
      return;
    }
    iris.burstGlitch(node, reduce);
  }

  function armGlitch(world, opts) {
    if (!isMultiverse()) return;
    var iris = window.IrisMotion;
    opts = opts || {};
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    var nodes = [];
    if (world) {
      Array.prototype.forEach.call(world.querySelectorAll('.glitch'), function (node) {
        nodes.push(node);
      });
    }
    if (opts.chrome !== false) {
      var studyRoot = document.querySelector('.study[data-template="cbx300"]');
      if (studyRoot) {
        Array.prototype.forEach.call(
          studyRoot.querySelectorAll('.study__word, .study__close, .study__count'),
          function (node) { nodes.push(node); }
        );
      }
    }
    nodes.forEach(function (node) {
      var text = liveText(node);
      if (!text) return;
      node.classList.add('glitch');
      node.setAttribute('data-text', text);
      node.setAttribute('data-latin', text);
      if (iris && iris.armGlitchTarget) iris.armGlitchTarget(node, text);
      burstSafe(iris, node, reduce);
      if (node.getAttribute('data-cbx-glitch-hover')) return;
      node.setAttribute('data-cbx-glitch-hover', '1');
      node.addEventListener('mouseenter', function () {
        var next = liveText(node);
        node.setAttribute('data-text', next);
        node.setAttribute('data-latin', next);
        if (iris && iris.armGlitchTarget) iris.armGlitchTarget(node, next);
        burstSafe(iris, node, reduce);
      });
    });
  }

  function clearTimers() {
    motion.refreshTimers.forEach(function (id) { window.clearTimeout(id); });
    motion.refreshTimers = [];
  }

  function morphNodes(root) {
    if (!root || !root.querySelectorAll) return [];
    return Array.prototype.slice.call(
      root.querySelectorAll('[data-cbx-beat], [data-cbx-illo]')
    );
  }

  function layer(root, name) {
    return root ? root.querySelector('[data-cbx-layer="' + name + '"]') : null;
  }

  function seatConnectors(root, dy) {
    var drop = +dy || 0;
    function yAt(y) {
      return Math.round((y - drop) * 10) / 10;
    }
    var arrowD = 'M470 ' + yAt(176) + ' C 450 ' + yAt(240) + ', 410 290, 362 328';
    var arrow = layer(root, 's01-arrow');
    var line = arrow && arrow.querySelector('path[mask]');
    var draw = layer(root, 's01-arrow-draw');
    if (line) line.setAttribute('d', arrowD);
    if (draw) draw.setAttribute('d', arrowD);
  }

  function posePersist(root, beatIndex) {
    var gsap = window.gsap;
    if (!gsap || !root) return;
    var shift = layer(root, 'floor-shift');
    var aisha = layer(root, 'aisha');
    var plant = layer(root, 'plant');
    var legs = layer(root, 'desk-legs');
    var lina = layer(root, 's02-lina');
    var sideL = layer(root, 's03-side-l');
    var dropped = (beatIndex || 0) < 2;
    var dy = dropped ? FLOOR_ROOT : 0;
    var legScale = dropped ? (LEG_FULL - FLOOR_DROP) / LEG_FULL : 1;
    if (shift) gsap.set(shift, { y: dy });
    seatConnectors(root, dy);
    if (legs) gsap.set(legs, { scaleY: legScale, svgOrigin: LEG_ORIGIN });
    if (aisha) gsap.set(aisha, { x: 0 });
    if (plant) gsap.set(plant, { x: 0 });
    if (lina) gsap.set(lina, { x: LINA_X });
    if (sideL) gsap.set(sideL, { x: SIDE_L_X });
  }

  function setRailInk(root, morphP) {
    var gsap = window.gsap;
    var ink = root && root.querySelector('[data-cbx-rail-ink]');
    if (!gsap || !ink) return;
    var t = Math.max(0, Math.min(1, morphP)) * MORPH_VH;
    var p0 = STAGE_HOLD * 0.5;
    var p1 = STAGE_HOLD + TRANS_12 + STAGE_HOLD * 0.5;
    var p2 = STAGE_HOLD + TRANS_12 + STAGE_HOLD + TRANS_23 + STAGE_HOLD * 0.5;
    var railT = 0;
    if (t <= p0) railT = 0;
    else if (t <= p1) railT = (t - p0) / Math.max(0.0001, p1 - p0);
    else if (t <= p2) railT = 1 + (t - p1) / Math.max(0.0001, p2 - p1);
    else railT = 2;
    gsap.set(ink, { xPercent: railT * 100 });
  }

  function copyBits(beatEl) {
    if (!beatEl) return [];
    return Array.prototype.slice.call(
      beatEl.querySelectorAll('.cbx-growth__lab, .cbx-growth__word, .cbx-growth__rule, .cbx-growth__sub')
    );
  }

  function addCopyEnter(tl, beatEl, at) {
    if (!beatEl) return;
    var lab = beatEl.querySelector('.cbx-growth__lab');
    var words = beatEl.querySelectorAll('.cbx-growth__word');
    var rule = beatEl.querySelector('.cbx-growth__rule');
    var sub = beatEl.querySelector('.cbx-growth__sub');
    if (lab) {
      tl.fromTo(lab, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.16, ease: 'power3.out' }, at);
    }
    if (words.length) {
      tl.fromTo(words, { opacity: 0, y: 14 }, {
        opacity: 1,
        y: 0,
        duration: 0.26,
        stagger: 0.04,
        ease: 'power3.out'
      }, at + 0.05);
    }
    var ruleAt = at + 0.22;
    if (rule) {
      tl.fromTo(rule, { scaleX: 0 }, {
        scaleX: 1,
        duration: 0.2,
        ease: 'power3.out',
        transformOrigin: '0% 50%'
      }, ruleAt);
    }
    if (sub) {
      tl.fromTo(sub, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.2, ease: 'power3.out' }, ruleAt + 0.1);
    }
  }

  function addCopyLeave(tl, beatEl, at) {
    var bits = copyBits(beatEl);
    if (!bits.length) return;
    tl.to(bits, { opacity: 0, y: -8, duration: 0.2, stagger: 0.015, ease: 'power3.in' }, at);
  }

  function dropIn(tl, node, at, rot) {
    if (!node) return;
    tl.fromTo(node,
      { y: -24, rotation: rot || 7, opacity: 0 },
      { y: 0, rotation: 0, opacity: 1, duration: 0.26, ease: 'power3.out' },
      at
    );
  }

  function floatOut(tl, node, at, dx) {
    if (!node) return;
    tl.to(node, { y: -16, x: dx || 0, opacity: 0, duration: 0.24, ease: 'power3.in' }, at);
  }

  function killIdle() {
    var gsap = window.gsap;
    (motion.idle || []).forEach(function (tw) {
      if (tw && tw.kill) tw.kill();
    });
    motion.idle = [];
    motion.pulsed = {};
    if (gsap && motion.pin) {
      Array.prototype.forEach.call(motion.pin.querySelectorAll('[data-cbx-idle]'), function (node) {
        gsap.set(node, { y: 0, rotation: 0 });
      });
    }
  }

  function armIdle(root) {
    var gsap = window.gsap;
    killIdle();
    if (!gsap || !root || motion.reduce) return;
    var tweens = [];
    var lamp = root.querySelector('[data-cbx-idle="lamp"]');
    if (lamp) {
      gsap.set(lamp, { transformOrigin: '50% 0%', svgOrigin: '300 -64' });
      tweens.push(gsap.to(lamp, {
        rotation: 2,
        duration: 1.9,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        paused: true
      }));
    }
    var steamA = layer(root, 'steam-a');
    var steamB = layer(root, 'steam-b');
    if (steamA) {
      tweens.push(gsap.fromTo(steamA, { y: 0, opacity: 0.95 }, {
        y: -4,
        opacity: 0.55,
        duration: 2.2,
        ease: 'sine.out',
        repeat: -1,
        paused: true
      }));
    }
    if (steamB) {
      tweens.push(gsap.fromTo(steamB, { y: 0, opacity: 0.85 }, {
        y: -5,
        opacity: 0.5,
        duration: 2.5,
        delay: 0.35,
        ease: 'sine.out',
        repeat: -1,
        paused: true
      }));
    }
    Array.prototype.forEach.call(root.querySelectorAll('[data-cbx-idle="card"]'), function (card, i) {
      tweens.push(gsap.to(card, {
        y: 3.5,
        duration: 2.4 + (i % 3) * 0.15,
        delay: i * 0.08,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        paused: true
      }));
    });
    motion.idle = tweens;
  }

  function setIdlePlaying(on) {
    (motion.idle || []).forEach(function (tw) {
      if (!tw) return;
      if (on) tw.play();
      else tw.pause();
    });
  }

  function pulseOnce(key, node) {
    var gsap = window.gsap;
    if (!gsap || !node || motion.reduce) return;
    if (motion.pulsed[key]) return;
    motion.pulsed[key] = true;
    gsap.fromTo(node, { scale: 1 }, {
      scale: 1.06,
      duration: 0.32,
      yoyo: true,
      repeat: 1,
      ease: 'sine.inOut',
      transformOrigin: '50% 50%'
    });
  }

  function resetPulse(key, node) {
    if (!motion.pulsed[key]) return;
    motion.pulsed[key] = false;
    if (node && window.gsap) window.gsap.set(node, { scale: 1 });
  }

  function wireScene(tl, pin) {
    var aisha = layer(pin, 'aisha');
    var desk = layer(pin, 'desk');
    var mug = layer(pin, 'mug');
    var plant = layer(pin, 'plant');
    var lampNode = layer(pin, 'lamp');
    var beats = pin.querySelectorAll('[data-cbx-beat]');
    var inv015 = layer(pin, 's01-inv-015');
    var inv014 = layer(pin, 's01-inv-014');
    var inv012 = layer(pin, 's01-inv-012');
    var arrow = layer(pin, 's01-arrow');
    var draw = layer(pin, 's01-arrow-draw');
    var head = layer(pin, 's01-arrow-head');
    var lina = layer(pin, 's02-lina');
    var s02arrows = layer(pin, 's02-arrows');
    var shared = layer(pin, 's02-card-shared');
    var payday = layer(pin, 's02-card-payday');
    var freeAfter = layer(pin, 's02-card-free');
    var sideL = layer(pin, 's03-side-l');
    var sideR = layer(pin, 's03-side-r');
    var row = layer(pin, 's03-row');
    var bench = layer(pin, 's03-bench');
    var payroll = layer(pin, 's03-card-payroll');
    var supplier = layer(pin, 's03-card-supplier');
    var pill = layer(pin, 's03-pill');
    var legs = layer(pin, 'desk-legs');
    var shift = layer(pin, 'floor-shift');
    var floor = [aisha, desk, mug, plant].filter(Boolean);
    var enter01 = Math.max(0, RISE_DUR - 0.86);
    var t12 = RISE_DUR + STAGE_HOLD;
    var t23 = t12 + TRANS_12 + STAGE_HOLD;
    var legShort = (LEG_FULL - FLOOR_DROP) / LEG_FULL;

    if (legs) tl.set(legs, { scaleY: legShort, svgOrigin: LEG_ORIGIN }, 0);
    if (shift) {
      tl.set(shift, { y: FLOOR_ROOT }, 0);
      tl.fromTo(shift, { y: FLOOR_ROOT + 16 * CAST_SCALE }, {
        y: FLOOR_ROOT,
        duration: 0.28,
        ease: 'power3.out'
      }, enter01);
    }
    if (floor.length) {
      tl.fromTo(floor, { opacity: 0 }, {
        opacity: 1,
        duration: 0.28,
        stagger: 0.04,
        ease: 'power3.out'
      }, enter01);
    }
    if (lampNode) {
      tl.fromTo(lampNode, { opacity: 0, y: 16 }, {
        opacity: 1,
        y: 0,
        duration: 0.28,
        ease: 'power3.out'
      }, enter01);
    }
    addCopyEnter(tl, beats[0], enter01);
    dropIn(tl, inv015, enter01 + 0.22, -8);
    dropIn(tl, inv014, enter01 + 0.3, 7);
    dropIn(tl, inv012, enter01 + 0.38, -5);
    if (draw) {
      tl.fromTo(draw, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.36, ease: 'none' }, enter01 + 0.48);
    }
    if (head) {
      tl.fromTo(head, { opacity: 0 }, { opacity: 1, duration: 0.12, ease: 'power3.out' }, enter01 + 0.72);
    }

    addCopyLeave(tl, beats[0], t12);
    addCopyEnter(tl, beats[1], t12 + 0.08);
    floatOut(tl, inv015, t12, -12);
    floatOut(tl, inv014, t12 + 0.04, 14);
    floatOut(tl, inv012, t12 + 0.08, 18);
    if (arrow) floatOut(tl, arrow, t12, 0);
    if (lina) {
      tl.fromTo(lina,
        { x: LINA_X + 48, opacity: 0 },
        { x: LINA_X, opacity: 1, duration: 0.4, ease: 'power3.out' },
        t12 + 0.12
      );
    }
    dropIn(tl, shared, t12 + 0.22, -4);
    dropIn(tl, payday, t12 + 0.3, -7);
    dropIn(tl, freeAfter, t12 + 0.38, 6);
    if (s02arrows) {
      tl.fromTo(s02arrows, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'power3.out' }, t12 + 0.4);
    }

    addCopyLeave(tl, beats[1], t23);
    addCopyEnter(tl, beats[2], t23 + 0.1);
    if (shift) {
      tl.to(shift, { y: 0, duration: 0.42, ease: 'power3.out' }, t23);
    }
    if (legs) {
      tl.to(legs, { scaleY: 1, svgOrigin: LEG_ORIGIN, duration: 0.42, ease: 'power3.out' }, t23);
    }
    floatOut(tl, lina, t23, LINA_X);
    floatOut(tl, shared, t23, 0);
    floatOut(tl, payday, t23 + 0.04, -12);
    floatOut(tl, freeAfter, t23 + 0.08, 12);
    if (s02arrows) floatOut(tl, s02arrows, t23, 0);
    if (sideL) {
      tl.fromTo(sideL,
        { x: SIDE_L_X, y: 22, opacity: 0 },
        { x: SIDE_L_X, y: 0, opacity: 1, duration: 0.32, ease: 'power3.out' },
        t23 + 0.16
      );
    }
    if (sideR) {
      tl.fromTo(sideR, { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 0.32, ease: 'power3.out' }, t23 + 0.32);
    }
    if (row) {
      tl.fromTo(row, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.34, ease: 'power3.out' }, t23 + 0.34);
    }
    if (bench) {
      tl.fromTo(bench, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.28, ease: 'power3.out' }, t23 + 0.38);
    }
    dropIn(tl, payroll, t23 + 0.52, -7);
    dropIn(tl, supplier, t23 + 0.6, 6);
    if (pill) {
      tl.fromTo(pill, { opacity: 0, scale: 0.88 }, {
        opacity: 1,
        scale: 1,
        duration: 0.22,
        ease: 'power3.out'
      }, t23 + 0.74);
    }
    var shiftNow = shift && window.gsap ? window.gsap.getProperty(shift, 'y') : FLOOR_ROOT;
    seatConnectors(pin, shiftNow == null ? FLOOR_ROOT : shiftNow);
  }

  function tickMorph(pin, morphP, riseTarget, self) {
    applyBeat(pin, beatIndexFromProgress(morphP));
    if (motion.reduce) {
      posePersist(pin, beatIndexFromProgress(morphP));
    } else {
      setRailInk(pin, morphP);
      var morphT = morphP * MORPH_VH;
      if (morphT < STAGE_HOLD && riseTarget >= 0.95) pulseOnce('late', layer(pin, 's01-late'));
      else resetPulse('late', layer(pin, 's01-late'));
      if (morphT >= STAGE_HOLD + TRANS_12 + STAGE_HOLD + TRANS_23) pulseOnce('pill', layer(pin, 's03-pill'));
      else resetPulse('pill', layer(pin, 's03-pill'));
      var shift = layer(pin, 'floor-shift');
      var shiftY = shift && window.gsap ? window.gsap.getProperty(shift, 'y') : 0;
      seatConnectors(pin, shiftY);
    }
    setIdlePlaying(!!(self && self.isActive) && riseTarget >= 0.92 && !motion.reduce);
  }

  function releaseGrowth(pin, on) {
    if (!pin) return;
    var was = pin.classList.contains('is-after');
    if (on) pin.classList.add('is-after');
    else pin.classList.remove('is-after');
    if (was === !!on) return;
    window.requestAnimationFrame(function () {
      if (window.ScrollTrigger && window.ScrollTrigger.refresh) window.ScrollTrigger.refresh();
    });
  }

  function kill() {
    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;
    if (window.Cbx300Answers && window.Cbx300Answers.kill) window.Cbx300Answers.kill();
    unbindStageStep();
    clearTimers();
    killIdle();
    if (motion.tween && motion.tween.scrollTrigger && motion.tween.scrollTrigger.kill) {
      motion.tween.scrollTrigger.kill();
    }
    if (motion.tween && motion.tween.kill) motion.tween.kill();
    motion.tween = null;
    motion.triggers.forEach(function (t) {
      if (t && t.kill) t.kill();
    });
    motion.triggers = [];
    restChrome();
    restRise();
    if (motion.stage) {
      motion.stage.style.height = '';
    }
    motion.stage = null;
    if (motion.pin) {
      motion.pin.classList.remove('is-static', 'is-cinematic', 'is-reduce', 'is-after');
      motion.pin.style.height = '';
      if (gsap) {
        morphNodes(motion.pin).forEach(function (node) {
          gsap.set(node, { clearProps: 'opacity,visibility,transform,y,filter' });
        });
        Array.prototype.forEach.call(
          motion.pin.querySelectorAll('[data-cbx-layer], [data-cbx-idle], .cbx-growth__word, .cbx-growth__rule, .cbx-growth__sub, .cbx-growth__lab, [data-cbx-rail-ink]'),
          function (node) {
            gsap.set(node, { clearProps: 'opacity,visibility,transform,x,y,rotation,scale,strokeDashoffset' });
          }
        );
      }
      applyBeat(motion.pin, 0);
    }
    motion.pin = null;
    motion.reduce = false;
    if (motion.normalized && ScrollTrigger && ScrollTrigger.normalizeScroll) {
      ScrollTrigger.normalizeScroll(false);
      motion.normalized = false;
    }
  }

  function watchSteps(cover, pin, onStep) {
    var ScrollTrigger = window.ScrollTrigger;
    if (!ScrollTrigger) return;
    if (cover) {
      motion.triggers.push(ScrollTrigger.create({
        trigger: cover,
        start: 'top 70%',
        end: 'bottom 45%',
        onToggle: function (self) {
          if (self.isActive && onStep) onStep(0);
        }
      }));
    }
    if (pin) {
      motion.triggers.push(ScrollTrigger.create({
        trigger: pin,
        start: 'top 70%',
        end: 'bottom 25%',
        onToggle: function (self) {
          if (self.isActive && onStep) onStep(1);
        }
      }));
    }
  }

  function sizePane(stage) {
    if (!stage) return paneH();
    var h = paneH();
    stage.style.height = h + 'px';
    return h;
  }

  function beatIndexFromProgress(progress) {
    var n = BEATS.length;
    if (n <= 1) return 0;
    if (progress >= 1) return n - 1;
    var equal = Math.min(n - 1, Math.max(0, Math.floor(progress * n)));
    var t = Math.max(0, progress) * MORPH_VH;
    if (t < STAGE_HOLD + TRANS_12 * 0.5) return 0;
    if (t < STAGE_HOLD + TRANS_12 + STAGE_HOLD + TRANS_23 * 0.5) return 1;
    return equal;
  }

  function pinSnapProgress(index) {
    var total = RISE_DUR + MORPH_VH;
    var t = RISE_DUR + STAGE_HOLD * 0.5;
    if (index === 1) t = RISE_DUR + STAGE_HOLD + TRANS_12 + STAGE_HOLD * 0.5;
    else if (index >= 2) return 1;
    return t / total;
  }

  function stageStops(st) {
    var start = st.start;
    var span = Math.max(1, st.end - st.start);
    return [
      start,
      start + pinSnapProgress(0) * span,
      start + pinSnapProgress(1) * span,
      start + pinSnapProgress(2) * span,
      st.end
    ];
  }

  function dockScrollY(st) {
    var span = Math.max(1, st.end - st.start);
    return st.start + span * (RISE_DUR / (RISE_DUR + MORPH_VH));
  }

  function railStops(st) {
    var all = stageStops(st);
    return [all[1], all[2], all[3]];
  }

  function nearestRailIndex(y, rails) {
    var best = 0;
    var bestD = Math.abs(y - rails[0]);
    var i;
    for (i = 1; i < rails.length; i += 1) {
      var d = Math.abs(y - rails[i]);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    if (y > rails[2] + 24) return 3;
    return best;
  }

  function sectionStepFromY(y, st) {
    if (!st) return 0;
    var span = Math.max(1, st.end - st.start);
    var risePx = span * (RISE_DUR / (RISE_DUR + MORPH_VH));
    return y > st.start + risePx * 0.92 ? 1 : 0;
  }

  function publishSectionStep() {
    if (!motion.onStep) return;
    var st = motion.tween && motion.tween.scrollTrigger;
    if (!st) return;
    var y = window.scrollY || document.documentElement.scrollTop || 0;
    motion.onStep(sectionStepFromY(y, st));
  }

  function stageNodes(pin, index, table) {
    var names = table[index] || [];
    var out = [];
    var i;
    for (i = 0; i < names.length; i += 1) {
      var node = layer(pin, names[i]);
      if (node) out.push(node);
    }
    return out;
  }

  function bitX(name) {
    if (name === 's02-lina') return LINA_X;
    if (name === 's03-side-l') return SIDE_L_X;
    return 0;
  }

  function showStageBits(pin, index) {
    var gsap = window.gsap;
    var bits = stageNodes(pin, index, STAGE_BITS);
    if (!gsap || !bits.length) return;
    gsap.set(bits, { opacity: 1, y: 0, rotation: 0, scale: 1 });
    bits.forEach(function (node) {
      gsap.set(node, { x: bitX(node.getAttribute('data-cbx-layer')) });
    });
    if (index === 0) {
      var draw = layer(pin, 's01-arrow-draw');
      if (draw) gsap.set(draw, { strokeDashoffset: 0 });
    }
  }

  function copyNodes(beatEl) {
    var empty = { lab: null, words: [], rule: null, sub: null, all: [] };
    if (!beatEl) return empty;
    var lab = beatEl.querySelector('.cbx-growth__lab');
    var words = Array.prototype.slice.call(beatEl.querySelectorAll('.cbx-growth__word'));
    var rule = beatEl.querySelector('.cbx-growth__rule');
    var sub = beatEl.querySelector('.cbx-growth__sub');
    return {
      lab: lab,
      words: words,
      rule: rule,
      sub: sub,
      all: [lab].concat(words, [rule, sub]).filter(Boolean)
    };
  }

  function clearShiftGroups(pin) {
    var gsap = window.gsap;
    if (!gsap || !pin) return;
    var tops = [];
    var i;
    for (i = 0; i < STAGE_TOPS.length; i += 1) tops = tops.concat(stageNodes(pin, i, STAGE_TOPS));
    if (tops.length) gsap.set(tops, { clearProps: 'opacity,transform,x,y,scale,rotation' });
  }

  function clearShiftText(nodes) {
    var gsap = window.gsap;
    if (!gsap || !nodes || !nodes.length) return;
    /* Only the copy this shift moved. A rule on a stage that did not
       move keeps scaleX; clearing that one draws a full-width divider. */
    var flat = [];
    var i;
    for (i = 0; i < nodes.length; i += 1) {
      if (nodes[i]) flat.push(nodes[i]);
    }
    if (flat.length) gsap.set(flat, { clearProps: 'transform,will-change' });
  }

  function syncScrubPose() {
    var tl = motion.tween;
    if (!tl || !tl.render) return;
    /* Same time still has to re-apply. A plain time() set no-ops when
       the playhead has not moved, and the shift tweens would linger. */
    tl.render(tl.time(), true, true);
    /* A leave tween that has already played renders its start values at
       progress 0, which covers the earlier beat. Replay future tweens
       from the latest start so the resting beat wins. */
    var now = tl.time();
    var kids = tl.getChildren(true, true, false);
    var pending = [];
    var i;
    for (i = 0; i < kids.length; i += 1) {
      if (kids[i].startTime() > now) pending.push(kids[i]);
    }
    pending.sort(function (a, b) { return b.startTime() - a.startTime(); });
    for (i = 0; i < pending.length; i += 1) pending[i].totalTime(0);
  }

  function resumeIdle() {
    var st = motion.tween && motion.tween.scrollTrigger;
    var rise = motion.riseState ? motion.riseState.p : 0;
    setIdlePlaying(!!(st && st.isActive) && rise >= 0.92 && !motion.reduce);
  }

  function unbindStageStep() {
    var ctrl = motion.stepCtrl;
    if (!ctrl) return;
    if (ctrl.timer) window.clearTimeout(ctrl.timer);
    if (ctrl.restTimer) window.clearTimeout(ctrl.restTimer);
    if (ctrl.unlockTimer) window.clearTimeout(ctrl.unlockTimer);
    if (ctrl.tween && ctrl.tween.kill) ctrl.tween.kill();
    if (motion.pin) motion.pin.classList.remove('is-shifting');
    window.removeEventListener('wheel', ctrl.onWheel, true);
    window.removeEventListener('keydown', ctrl.onKey, true);
    window.removeEventListener('touchstart', ctrl.onTouchStart, true);
    window.removeEventListener('touchmove', ctrl.onTouchMove, true);
    window.removeEventListener('touchend', ctrl.onTouchEnd, true);
    window.removeEventListener('touchcancel', ctrl.onTouchEnd, true);
    window.removeEventListener('scroll', ctrl.onScroll);
    motion.stepCtrl = null;
  }

  function bindStageStep() {
    unbindStageStep();
    var ctrl = {
      active: false,
      kind: 'rise',
      origin: 0,
      originY: 0,
      settled: 0,
      park: null,
      travel: 0,
      timer: 0,
      restTimer: 0,
      unlockTimer: 0,
      tween: null,
      pendingDir: 0,
      committed: false,
      locked: false,
      lastInput: 0,
      touchY: 0,
      touchOn: false,
      riseHold: false
    };

    function pinTrigger() {
      return motion.tween && motion.tween.scrollTrigger;
    }

    function yNow() {
      return window.scrollY || document.documentElement.scrollTop || 0;
    }

    function killTween() {
      var tw = ctrl.tween;
      ctrl.tween = null;
      ctrl.pendingDir = 0;
      if (tw && tw.kill) tw.kill();
      var pin = motion.pin;
      var shifting = pin && pin.classList.contains('is-shifting');
      if (pin) pin.classList.remove('is-shifting');
      if (!shifting) return;
      clearShiftGroups(pin);
      syncScrubPose();
      resumeIdle();
    }

    function noteInput() {
      ctrl.lastInput = Date.now();
    }

    function clearIdleTimers() {
      if (ctrl.timer) window.clearTimeout(ctrl.timer);
      if (ctrl.restTimer) window.clearTimeout(ctrl.restTimer);
      ctrl.timer = 0;
      ctrl.restTimer = 0;
    }

    function armUnlock() {
      if (ctrl.unlockTimer) window.clearTimeout(ctrl.unlockTimer);
      var quiet = Date.now() - (ctrl.lastInput || 0);
      var wait = Math.max(0, STEP_LOCK_MS - quiet);
      ctrl.unlockTimer = window.setTimeout(tryUnlock, wait);
    }

    function tryUnlock() {
      ctrl.unlockTimer = 0;
      if (!ctrl.locked) return;
      if (ctrl.tween) return;
      var quiet = Date.now() - (ctrl.lastInput || 0);
      if (quiet < STEP_LOCK_MS) {
        ctrl.unlockTimer = window.setTimeout(tryUnlock, STEP_LOCK_MS - quiet);
        return;
      }
      ctrl.locked = false;
      ctrl.travel = 0;
      ctrl.active = false;
      ctrl.committed = false;
    }

    function lockStep() {
      ctrl.locked = true;
      ctrl.travel = 0;
      ctrl.active = true;
      ctrl.committed = true;
      clearIdleTimers();
    }

    function animateTo(y) {
      killTween();
      lockStep();
      ctrl.park = y;
      var gsap = window.gsap;
      if (!gsap) {
        window.scrollTo(0, y);
        publishSectionStep();
        armUnlock();
        return;
      }
      var proxy = { y: yNow() };
      ctrl.tween = gsap.to(proxy, {
        y: y,
        duration: 0.26,
        ease: 'power3.out',
        overwrite: true,
        onUpdate: function () { window.scrollTo(0, proxy.y); },
        onComplete: function () {
          ctrl.tween = null;
          window.scrollTo(0, y);
          publishSectionStep();
          armUnlock();
        }
      });
    }

    function easeTo(y, opts) {
      opts = opts || {};
      killTween();
      if (ctrl.restTimer) window.clearTimeout(ctrl.restTimer);
      ctrl.restTimer = 0;
      ctrl.park = y;
      ctrl.kind = 'rise';
      var gsap = window.gsap;
      function done() {
        if (opts.onComplete) opts.onComplete();
        else publishSectionStep();
      }
      if (!gsap) {
        window.scrollTo(0, y);
        done();
        return;
      }
      var proxy = { y: yNow() };
      ctrl.tween = gsap.to(proxy, {
        y: y,
        duration: opts.duration || 0.55,
        ease: opts.ease || 'sine.inOut',
        overwrite: true,
        onUpdate: function () {
          if (ctrl.locked) return;
          window.scrollTo(0, proxy.y);
        },
        onComplete: function () {
          ctrl.tween = null;
          if (ctrl.locked) return;
          window.scrollTo(0, y);
          done();
        }
      });
    }

    /* Curtain is fully up from the dock line through stage 01.
       Resting there is stage 01, with the same lock as a full rise. */
    function parkStage(st) {
      var dock = railStops(st)[0];
      ctrl.park = dock;
      ctrl.settled = 0;
      ctrl.origin = 0;
      ctrl.originY = dock;
      ctrl.kind = 'step';
      lockStep();
      window.scrollTo(0, dock);
      publishSectionStep();
      armUnlock();
    }

    function armSettle() {
      if (ctrl.restTimer) window.clearTimeout(ctrl.restTimer);
      ctrl.restTimer = window.setTimeout(function () {
        ctrl.restTimer = 0;
        if (ctrl.locked || ctrl.tween) return;
        var st = pinTrigger();
        if (!st) return;
        var y = yNow();
        var lo = st.start;
        var hi = dockScrollY(st);
        var dock = railStops(st)[0];
        if (y > hi - 2 && y < dock - DOCK_PX) {
          parkStage(st);
          return;
        }
        if (y < lo - 2 || y > hi + 2) return;
        if (y <= lo + 2 || y >= hi - 2) return;
        var towardDock = (hi - y) <= (y - lo);
        ctrl.settled = towardDock ? 0 : -1;
        if (!towardDock) {
          easeTo(lo);
          return;
        }
        easeTo(dock, {
          onComplete: function () {
            var live = pinTrigger();
            if (live) parkStage(live);
          }
        });
      }, RISE_REST_MS);
    }

    function scrubCurtain(st, rails, y, dy) {
      if (!ctrl.locked) killTween();
      ctrl.kind = 'rise';
      ctrl.active = true;
      ctrl.committed = false;
      var lo = st.start;
      var hi = dockScrollY(st);
      var dock = rails[0];
      /* Stage 01 sits past the dock. The curtain is already fully up
         across that band, so an upward gesture skips it and scrubs. */
      if (dy < 0 && y > hi) y = hi;
      var next = y + dy;
      if (dy > 0 && next >= hi - 0.5) {
        window.scrollTo(0, dock);
        ctrl.park = dock;
        ctrl.settled = 0;
        ctrl.origin = 0;
        ctrl.originY = dock;
        lockStep();
        armUnlock();
        return;
      }
      if (next <= lo) {
        clearIdleTimers();
        window.scrollTo(0, lo);
        ctrl.park = lo;
        ctrl.settled = -1;
        ctrl.originY = lo;
        return;
      }
      window.scrollTo(0, next);
      armSettle();
    }

    function dockedAt(y, rails) {
      var i;
      for (i = 0; i < rails.length; i += 1) {
        if (Math.abs(y - rails[i]) <= DOCK_PX) return i;
      }
      return -1;
    }

    function commitStep(rails, origin, dir) {
      ctrl.origin = origin;
      ctrl.originY = rails[origin];
      var dest = Math.max(0, Math.min(rails.length - 1, ctrl.origin + dir));
      if (dest === origin) {
        lockStep();
        armUnlock();
        return;
      }
      ctrl.kind = 'step';
      ctrl.settled = dest;
      ctrl.park = rails[dest];
      playStageShift(origin, dest, rails[dest]);
    }

    /* Scroll jumps to the destination rail in this turn. The pin and the
       fixed curtain keep the panel visually still; this timeline then
       replaces the seek with a directional crossfade before paint. */
    function playStageShift(origin, dest, y) {
      killTween();
      lockStep();
      var pin = motion.pin;
      var gsap = window.gsap;
      var animate = !!(pin && gsap && !motion.reduce);
      if (animate) pin.classList.add('is-shifting');
      window.scrollTo(0, y);
      if (window.ScrollTrigger && window.ScrollTrigger.update) window.ScrollTrigger.update();
      publishSectionStep();
      if (!animate) {
        if (motion.reduce) {
          var token = { kill: function () { token.dead = true; } };
          ctrl.tween = token;
          window.setTimeout(function () {
            if (ctrl.tween !== token) return;
            ctrl.tween = null;
            ctrl.lastInput = Date.now();
            armUnlock();
          }, 200);
          return;
        }
        armUnlock();
        return;
      }
      var forward = dest > origin;
      var outCopyY = forward ? -SHIFT_COPY : SHIFT_COPY;
      var inCopyY = forward ? SHIFT_COPY : -SHIFT_COPY;
      var outIlloY = forward ? -SHIFT_ILLO : SHIFT_ILLO;
      var inIlloY = forward ? SHIFT_ILLO : -SHIFT_ILLO;
      var beats = pin.querySelectorAll('[data-cbx-beat]');
      var outCopy = copyNodes(beats[origin]);
      var inCopy = copyNodes(beats[dest]);
      var outTops = stageNodes(pin, origin, STAGE_TOPS);
      var inTops = stageNodes(pin, dest, STAGE_TOPS);
      if (pin.offsetWidth >= 0) pin.classList.add('is-shifting');
      setIdlePlaying(false);
      showStageBits(pin, origin);
      showStageBits(pin, dest);
      if (outTops.length) gsap.set(outTops, { opacity: 1, y: 0, scale: 1 });
      if (inTops.length) gsap.set(inTops, { opacity: 0, y: inIlloY, scale: 1.02 });
      if (outCopy.all.length) gsap.set(outCopy.all, { opacity: 1, y: 0, force3D: true });
      if (outCopy.rule) gsap.set(outCopy.rule, { scaleX: 1 });
      if (inCopy.all.length) gsap.set(inCopy.all, { opacity: 0, y: inCopyY, force3D: true });
      var ink = pin.querySelector('[data-cbx-rail-ink]');
      if (ink) gsap.set(ink, { xPercent: origin * 100 });
      var floorFrom = origin < 2 ? FLOOR_ROOT : 0;
      var floorTo = dest < 2 ? FLOOR_ROOT : 0;
      var legFrom = origin < 2 ? (LEG_FULL - FLOOR_DROP) / LEG_FULL : 1;
      var legTo = dest < 2 ? (LEG_FULL - FLOOR_DROP) / LEG_FULL : 1;
      var floor = layer(pin, 'floor-shift');
      var legs = layer(pin, 'desk-legs');
      var crossFloor = origin === 2 || dest === 2;
      if (crossFloor && floor) {
        gsap.set(floor, { y: floorFrom });
        seatConnectors(pin, floorFrom);
      }
      if (crossFloor && legs) gsap.set(legs, { scaleY: legFrom, svgOrigin: LEG_ORIGIN });

      var shiftTl = gsap.timeline({
        onComplete: function () {
          if (ctrl.tween !== shiftTl) return;
          var dir = ctrl.pendingDir;
          ctrl.pendingDir = 0;
          ctrl.tween = null;
          pin.classList.remove('is-shifting');
          clearShiftText(outCopy.all.concat(inCopy.all));
          clearShiftGroups(pin);
          syncScrubPose();
          resumeIdle();
          publishSectionStep();
          ctrl.lastInput = Date.now();
          armUnlock();
          if (dir) {
            var st = pinTrigger();
            if (st) commitStep(railStops(st), ctrl.settled, dir);
          }
        }
      });
      ctrl.tween = shiftTl;
      if (outCopy.all.length) {
        shiftTl.fromTo(outCopy.all, { opacity: 1, y: 0 }, {
          opacity: 0,
          y: outCopyY,
          duration: 0.25,
          ease: 'expo.out',
          overwrite: false,
          immediateRender: false,
          force3D: true
        }, 0);
      }
      if (inCopy.lab) {
        shiftTl.fromTo(inCopy.lab, { opacity: 0, y: inCopyY }, {
          opacity: 1, y: 0, duration: 0.46, ease: 'expo.out', overwrite: false, immediateRender: false, force3D: true
        }, 0.12);
      }
      if (inCopy.words.length) {
        shiftTl.fromTo(inCopy.words, { opacity: 0, y: inCopyY }, {
          opacity: 1, y: 0, duration: 0.42, ease: 'expo.out', overwrite: false, immediateRender: false, force3D: true
        }, 0.17);
      }
      if (inCopy.rule) {
        shiftTl.fromTo(inCopy.rule, { opacity: 0, y: inCopyY }, {
          opacity: 1, y: 0, duration: 0.38, ease: 'expo.out', overwrite: false, immediateRender: false, force3D: true
        }, 0.22);
      }
      if (inCopy.sub) {
        shiftTl.fromTo(inCopy.sub, { opacity: 0, y: inCopyY }, {
          opacity: 1, y: 0, duration: 0.36, ease: 'expo.out', overwrite: false, immediateRender: false, force3D: true
        }, 0.26);
      }
      if (outTops.length) {
        shiftTl.to(outTops, {
          opacity: 0, duration: 0.1, ease: 'none', overwrite: false
        }, 0.06);
        shiftTl.to(outTops, {
          y: outIlloY, duration: 0.36, ease: 'expo.out', overwrite: false
        }, 0);
      }
      if (inTops.length) {
        shiftTl.to(inTops, {
          opacity: 1, duration: 0.1, ease: 'none', overwrite: false
        }, 0.06);
        shiftTl.to(inTops, {
          y: 0, scale: 1, duration: 0.52, ease: 'expo.out', overwrite: false
        }, 0);
      }
      if (ink) {
        shiftTl.to(ink, {
          xPercent: dest * 100, duration: SHIFT_DUR, ease: 'expo.out', overwrite: false
        }, 0);
      }
      if (crossFloor && floor) {
        shiftTl.to(floor, {
          y: floorTo,
          duration: SHIFT_DUR,
          ease: 'expo.out',
          overwrite: false,
          onUpdate: function () { seatConnectors(pin, gsap.getProperty(floor, 'y')); }
        }, 0);
      }
      if (crossFloor && legs) {
        shiftTl.to(legs, {
          scaleY: legTo,
          svgOrigin: LEG_ORIGIN,
          duration: SHIFT_DUR,
          ease: 'expo.out',
          overwrite: false
        }, 0);
      }
    }

    function armTravelReset() {
      if (ctrl.timer) window.clearTimeout(ctrl.timer);
      ctrl.timer = window.setTimeout(function () {
        ctrl.timer = 0;
        if (ctrl.locked || ctrl.tween) return;
        ctrl.travel = 0;
        ctrl.active = false;
      }, GESTURE_QUIET);
    }

    function wheelPixels(event) {
      var dy = event.deltaY || 0;
      if (event.deltaMode === 1) dy *= 16;
      else if (event.deltaMode === 2) dy *= viewH();
      return dy;
    }

    function inBand(st, y) {
      return y >= st.start - 2 && y <= st.end + 2;
    }

    function handleDelta(dy, event) {
      if (motion.reduce) return false;
      var st = pinTrigger();
      if (!st || !dy) return false;
      var y = yNow();
      if (y <= st.start + 1 && dy < 0) return false;
      if (y >= st.end - 1) return false;
      if (!inBand(st, y)) return false;
      var rails = railStops(st);
      var last = rails[rails.length - 1];
      /* Past the last stage the pin still owns a spacer. Yield native
         wheel so Section 03 can be reached; do not snap back. */
      if (y > last + DOCK_PX && dy > 0) return false;
      if (dockedAt(y, rails) >= rails.length - 1 && dy > 0) return false;
      noteInput();
      if (event.cancelable) event.preventDefault();
      if (!ctrl.locked && ctrl.tween) {
        killTween();
        y = yNow();
      }
      if (ctrl.locked) {
        if (!ctrl.tween) armUnlock();
        return true;
      }
      var dock = dockedAt(y, rails);
      if (y < rails[0] - 0.5) {
        scrubCurtain(st, rails, y, dy);
        return true;
      }
      if (dock === 0 && dy < 0) {
        scrubCurtain(st, rails, y, dy);
        return true;
      }
      if (y > last + DOCK_PX && dy < 0) {
        animateTo(last);
        return true;
      }
      if (dock < 0) {
        var near = nearestRailIndex(y, rails);
        if (near > 2) near = 2;
        window.scrollTo(0, rails[near]);
        return true;
      }
      if (!ctrl.active || ctrl.kind !== 'step' || ctrl.origin !== dock) {
        ctrl.active = true;
        ctrl.kind = 'step';
        ctrl.origin = dock;
        ctrl.originY = rails[dock];
        ctrl.travel = 0;
        ctrl.committed = false;
      }
      ctrl.travel += dy;
      if (Math.abs(ctrl.travel) >= STEP_PX) {
        var dir = ctrl.travel >= 0 ? 1 : -1;
        if (ctrl.origin === 0 && dir < 0) {
          ctrl.travel = 0;
          scrubCurtain(st, rails, rails[0], dy);
          return true;
        }
        commitStep(rails, ctrl.origin, dir);
        return true;
      }
      window.scrollTo(0, rails[ctrl.origin]);
      armTravelReset();
      return true;
    }

    function onWheel(event) {
      if (event.ctrlKey || event.metaKey) return;
      /* Section 03 owns the wheel while its pin is active. Past S02 the
         native document scroller must keep moving — do not preventDefault. */
      if (document.documentElement.classList.contains('is-cbx-ans-pin')) return;
      handleDelta(wheelPixels(event), event);
    }

    function keyDir(event) {
      if (event.key === 'ArrowDown' || event.key === 'PageDown') return 1;
      if (event.key === 'ArrowUp' || event.key === 'PageUp') return -1;
      if (event.key === ' ' || event.key === 'Spacebar') return event.shiftKey ? -1 : 1;
      return 0;
    }

    function onKey(event) {
      if (motion.reduce) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      var dir = keyDir(event);
      if (!dir) return;
      var target = event.target;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.tagName === 'BUTTON' || target.tagName === 'A' || target.isContentEditable)) return;
      if (!document.documentElement.classList.contains('is-study-page')) return;
      var st = pinTrigger();
      if (!st) return;
      var y = yNow();
      if (!inBand(st, y)) return;
      if (event.repeat) {
        if (event.cancelable) event.preventDefault();
        return;
      }
      noteInput();
      if (ctrl.locked) {
        if (event.cancelable) event.preventDefault();
        if (ctrl.tween) {
          if (motion.pin && motion.pin.classList.contains('is-shifting') && !ctrl.pendingDir) {
            ctrl.pendingDir = dir;
          }
          return;
        }
        ctrl.locked = false;
        ctrl.travel = 0;
        ctrl.active = false;
        ctrl.committed = false;
        if (ctrl.unlockTimer) window.clearTimeout(ctrl.unlockTimer);
        ctrl.unlockTimer = 0;
      }
      var rails = railStops(st);
      var dock = dockedAt(y, rails);
      if (y < rails[0] - DOCK_PX) {
        if (event.cancelable) event.preventDefault();
        if (dir > 0) animateTo(rails[0]);
        return;
      }
      if (dock < 0) {
        dock = nearestRailIndex(y, rails);
        if (dock > 2) dock = 2;
      }
      if (dock === 0 && dir < 0) {
        if (event.cancelable) event.preventDefault();
        ctrl.settled = -1;
        window.scrollTo(0, dockScrollY(st));
        easeTo(st.start, { duration: 0.9, ease: 'power3.inOut' });
        return;
      }
      if (dock >= rails.length - 1 && dir > 0) {
        if (event.cancelable) event.preventDefault();
        animateTo(st.end + 8);
        return;
      }
      if (event.cancelable) event.preventDefault();
      ctrl.origin = dock;
      commitStep(rails, dock, dir);
    }

    function onTouchStart(event) {
      if (motion.reduce || !event.touches || event.touches.length !== 1) {
        ctrl.touchOn = false;
        return;
      }
      ctrl.touchY = event.touches[0].clientY;
      ctrl.touchOn = true;
    }

    function onTouchMove(event) {
      if (!ctrl.touchOn || motion.reduce || !event.touches || event.touches.length !== 1) return;
      var y = event.touches[0].clientY;
      var dy = ctrl.touchY - y;
      ctrl.touchY = y;
      if (!dy) return;
      handleDelta(dy, event);
    }

    function onTouchEnd() {
      ctrl.touchOn = false;
    }

    ctrl.onWheel = onWheel;
    ctrl.onKey = onKey;
    ctrl.onTouchStart = onTouchStart;
    ctrl.onTouchMove = onTouchMove;
    ctrl.onTouchEnd = onTouchEnd;
    function onScroll() {
      publishSectionStep();
      if (ctrl.tween || ctrl.locked) return;
      var st = pinTrigger();
      if (!st) return;
      var y = yNow();
      var hi = dockScrollY(st);
      var dock = railStops(st)[0];
      if (y > hi - 2 && y < dock - DOCK_PX) armSettle();
    }

    ctrl.onScroll = onScroll;
    window.addEventListener('wheel', onWheel, { passive: false, capture: true });
    window.addEventListener('keydown', onKey, { passive: false, capture: true });
    window.addEventListener('touchstart', onTouchStart, { passive: false, capture: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false, capture: true });
    window.addEventListener('touchend', onTouchEnd, { passive: false, capture: true });
    window.addEventListener('touchcancel', onTouchEnd, { passive: false, capture: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    motion.stepCtrl = ctrl;
  }

  var MV_FLICK = ['s01-inv-012', 's02-card-free', 's03-card-supplier'];
  var mvBurstTimer = 0;
  var mvFlickTimer = 0;

  function pulseMvArrive(pane, index) {
    if (!isMultiverse() || motion.reduce || !pane) return;
    var card = pane.querySelector('[data-cbx-layer="' + (MV_FLICK[index] || '') + '"]');
    var prev = pane.querySelector('.is-mv-flick');
    if (prev && prev !== card) prev.classList.remove('is-mv-flick');
    pane.classList.remove('is-mv-burst');
    if (pane.offsetWidth >= 0) pane.classList.add('is-mv-burst');
    if (mvBurstTimer) window.clearTimeout(mvBurstTimer);
    mvBurstTimer = window.setTimeout(function () {
      pane.classList.remove('is-mv-burst');
      mvBurstTimer = 0;
    }, 420);
    if (!card) return;
    card.classList.remove('is-mv-flick');
    if (card.offsetWidth >= 0) card.classList.add('is-mv-flick');
    if (mvFlickTimer) window.clearTimeout(mvFlickTimer);
    mvFlickTimer = window.setTimeout(function () {
      card.classList.remove('is-mv-flick');
      mvFlickTimer = 0;
    }, 420);
  }

  function applyBeat(root, index) {
    var pane = root;
    if (root && root.closest && !root.hasAttribute('data-cbx-growth')) {
      pane = root.closest('[data-cbx-growth]');
    }
    if (!pane) return;
    var arrived = pane.getAttribute('data-cbx-mv-seen') !== String(index);
    pane.setAttribute('data-cbx-live-beat', String(index));
    if (arrived) {
      pane.setAttribute('data-cbx-mv-seen', String(index));
      pulseMvArrive(pane, index);
    }
    Array.prototype.forEach.call(pane.querySelectorAll('[data-cbx-beat]'), function (beat, i) {
      beat.classList.toggle('is-on', i === index);
    });
    Array.prototype.forEach.call(pane.querySelectorAll('[data-cbx-illo]'), function (illo, i) {
      if (illo.getAttribute('data-cbx-illo') === 'scene') {
        illo.classList.add('is-on');
        return;
      }
      illo.classList.toggle('is-on', i === index);
    });
    Array.prototype.forEach.call(pane.querySelectorAll('[data-cbx-step]'), function (step, i) {
      step.classList.toggle('is-on', i === index);
      step.classList.toggle('is-past', i < index);
    });
  }

  function setupStatic(pin) {
    if (!pin) return;
    pin.classList.add('is-static');
    pin.style.height = '';
    var beats = pin.querySelectorAll('[data-cbx-beat]');
    applyBeat(pin, Math.max(0, beats.length - 1));
  }

  function bindCinematic(world, opts) {
    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;
    var stage = world.querySelector('[data-cbx-stage]');
    var pin = world.querySelector('[data-cbx-growth]');
    var cover = world.querySelector('[data-cbx-section="01"]');
    var onStep = opts.onStep;

    motion.pin = pin;
    motion.stage = stage;
    if (!pin || !stage) {
      watchSteps(cover, pin, onStep);
      applyCbxRise(0);
      return;
    }

    pin.classList.remove('is-static');
    pin.classList.toggle('is-cinematic', !motion.reduce);
    pin.classList.toggle('is-reduce', !!motion.reduce);
    sizePane(stage);
    applyCbxRise(0);

    morphNodes(pin).forEach(function (node) {
      gsap.set(node, { clearProps: 'opacity,visibility,transform,y,filter' });
    });
    applyBeat(pin, 0);
    if (motion.reduce) posePersist(pin, 0);
    else setRailInk(pin, 0);

    motion.riseState.p = 0;

    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: stage,
        start: 'top top',
        end: function () {
          sizePane(stage);
          return '+=' + Math.round(paneH() * (RISE_DUR + MORPH_VH));
        },
        pin: true,
        pinSpacing: true,
        scrub: true,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        refreshPriority: 1,
        onRefresh: function () { sizePane(stage); },
        onToggle: function (self) {
          if (!self.isActive) {
            tweenCbxRise(self.progress >= 1 ? 1 : 0, true);
            setIdlePlaying(false);
            releaseGrowth(pin, self.progress >= 1);
          } else {
            releaseGrowth(pin, false);
          }
          if (self.isActive) publishSectionStep();
        },
        onUpdate: function (self) {
          var dur = tl.duration() || 1;
          var morphStart = RISE_DUR / dur;
          var riseTarget = 1;
          if (morphStart > 0) {
            riseTarget = Math.max(0, Math.min(1, self.progress / morphStart));
          }
          tweenCbxRise(riseTarget);
          var morphP = 0;
          if (self.progress > morphStart) {
            morphP = (self.progress - morphStart) / Math.max(0.0001, 1 - morphStart);
          }
          /* A docked step has already seeked this timeline. Leave the
             in-place crossfade in charge of copy, layers, and the ink. */
          if (pin.classList.contains('is-shifting')) {
            applyBeat(pin, beatIndexFromProgress(morphP));
            publishSectionStep();
            return;
          }
          applyBeat(pin, beatIndexFromProgress(morphP));
          tickMorph(pin, morphP, riseTarget, self);
          publishSectionStep();
        }
      }
    });

    tl.to({}, { duration: RISE_DUR });
    tl.to({}, { duration: MORPH_VH });
    tl.addLabel('stage0', RISE_DUR + STAGE_HOLD * 0.5);
    tl.addLabel('stage1', RISE_DUR + STAGE_HOLD + TRANS_12 + STAGE_HOLD * 0.5);
    tl.addLabel('stage2', RISE_DUR + STAGE_HOLD + TRANS_12 + STAGE_HOLD + TRANS_23 + STAGE_HOLD * 0.5);
    if (!motion.reduce) wireScene(tl, pin);
    motion.tween = tl;
    if (tl.scrollTrigger) motion.triggers.push(tl.scrollTrigger);
    motion.onStep = onStep;
    bindStageStep();
    publishSectionStep();
  }

  function refreshSoon() {
    var ScrollTrigger = window.ScrollTrigger;
    if (!ScrollTrigger) return;
    ScrollTrigger.refresh();
    motion.refreshTimers.push(window.setTimeout(function () { ScrollTrigger.refresh(); }, 160));
    motion.refreshTimers.push(window.setTimeout(function () { ScrollTrigger.refresh(); }, 520));
  }

  function whenImages(pin, fn) {
    if (!pin) {
      fn();
      return;
    }
    var imgs = pin.querySelectorAll('img');
    var left = imgs.length;
    if (!left) {
      fn();
      return;
    }
    var done = function () {
      left -= 1;
      if (left <= 0) fn();
    };
    Array.prototype.forEach.call(imgs, function (img) {
      if (img.complete) done();
      else {
        img.addEventListener('load', done, { once: true });
        img.addEventListener('error', done, { once: true });
      }
    });
  }

  function bind(world, opts) {
    kill();
    if (!world) return;
    opts = opts || {};
    var pin = world.querySelector('[data-cbx-growth]');
    var cover = world.querySelector('[data-cbx-section="01"]');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;
    motion.reduce = !!(reduce && reduce.matches);
    motion.onStep = opts.onStep || null;

    function afterIllos() {
      if (!gsap || !ScrollTrigger) {
        setupStatic(pin);
        restRise();
        posePersist(pin, BEATS.length - 1);
        if (ScrollTrigger) {
          watchSteps(cover, pin, opts.onStep);
        }
        bindAnswers(world, opts);
        return;
      }

      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.config({ ignoreMobileResize: true });

      var touch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
      if (touch && ScrollTrigger.normalizeScroll) {
        ScrollTrigger.normalizeScroll(true);
        motion.normalized = true;
      }

      bindCinematic(world, opts);
      if (!motion.reduce) armIdle(pin);
      bindAnswers(world, opts);
      whenImages(pin, refreshSoon);
    }

    fillIllos(pin, afterIllos);
  }

  function bindAnswers(world, opts) {
    if (!window.Cbx300Answers || !window.Cbx300Answers.bind) return;
    window.Cbx300Answers.bind(world, {
      onStep: opts && opts.onStep,
      page: opts && opts.page,
      reduce: motion.reduce
    });
  }

  function liveCount(world) {
    if (!world) return 3;
    var n = world.querySelectorAll('[data-cbx-live]').length;
    return n || 3;
  }

  function mount(world, project) {
    if (!world) return null;
    kill();
    world.innerHTML = '';
    world.classList.remove('film-world');
    world.classList.add('cbx-world');
    var stage = el('div', 'cbx-stage');
    stage.setAttribute('data-cbx-stage', '');
    stage.appendChild(buildCover(project));
    world.appendChild(stage);
    world.appendChild(buildGrowth());
    if (window.Cbx300Answers && window.Cbx300Answers.build) {
      world.appendChild(window.Cbx300Answers.build());
    }
    world.appendChild(buildStubs());
    fillIllos(world, function () { armGlitch(world, { chrome: false }); });
    armGlitch(world, { chrome: false });
    return {
      project: project || null,
      pageCount: function () { return liveCount(world); },
      bind: function (opts) { bind(world, opts || {}); },
      kill: kill
    };
  }

  return {
    mount: mount,
    bind: bind,
    kill: kill,
    armGlitch: armGlitch,
    applyCbxRise: applyCbxRise,
    applyBeat: applyBeat,
    beatIndexFromProgress: beatIndexFromProgress,
    pinSnapProgress: pinSnapProgress,
    stageStops: stageStops,
    dockScrollY: dockScrollY,
    STEP_PX: STEP_PX,
    META: META,
    BEATS: BEATS,
    STUBS: STUBS,
    RISE_DUR: RISE_DUR,
    STAGE_HOLD: STAGE_HOLD,
    TRANS_12: TRANS_12,
    TRANS_23: TRANS_23,
    MORPH_VH: MORPH_VH
  };
})();
