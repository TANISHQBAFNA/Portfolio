/**
 * CBX300 case study — Section 01 cover + Section 02 Aisha growth morph.
 * Cover: kicker → accent → word. Image overlaps type from the right.
 * Growth: coffee panel curtains over the parked cover + chrome (--cbx-rise),
 * then one pinned frame morphs. People join; copy crossfades. No sideways slide.
 * Cream stays calm. Multiverse uses glitch plates on chrome + type.
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

  var BEATS = [
    {
      id: 'freelancer',
      label: 'Freelancer',
      stamp: [
        'Finding: Paid late, chased invoices.',
        'Choice: Pay & get paid on phone.',
        'UI: Home = receive + pay.'
      ],
      need: '“When does my money actually land?”',
      fact: 'Mobile pay-in and pay-out as one job.'
    },
    {
      id: 'sole',
      label: 'Sole proprietor',
      stamp: [
        'Finding: One balance number lies.',
        'Choice: Lead with available.',
        'UI: Available hero; holds sit back.'
      ],
      need: '“What can I spend today?”',
      fact: 'Available leads; pending never wears the crown.'
    },
    {
      id: 'mid',
      label: 'Mid-size',
      stamp: [
        'Finding: Approvals become a pile.',
        'Choice: Prepare ∥ approve, split.',
        'UI: Waiting-on-me door.'
      ],
      need: '“What needs me before payroll?”',
      fact: 'One queue for her decisions — not everyone’s noise.'
    }
  ];

  var SPINE = 'Same bank. Grows with her.';

  var GHOSTS = [
    { id: 'freelancer', job: 'pay' },
    { id: 'sole', job: 'balance' },
    { id: 'mid', job: 'approvals' }
  ];

  var PEOPLE = [
    {
      id: 'aisha',
      src: 'assets/img/aisha-growth/people/aisha.png',
      alt: 'Clay cutout of Aisha.',
      from: 0
    },
    {
      id: 'mate-1',
      src: 'assets/img/aisha-growth/people/teammate-01.png',
      alt: 'Clay cutout of Aisha first teammate.',
      from: 1
    },
    {
      id: 'mate-2',
      src: 'assets/img/aisha-growth/people/teammate-02.png',
      alt: 'Clay cutout of a teammate with a laptop.',
      from: 2
    },
    {
      id: 'mate-3',
      src: 'assets/img/aisha-growth/people/teammate-03.png',
      alt: 'Clay cutout of a teammate with coffee.',
      from: 2
    }
  ];


  var STUBS = [
    { id: 'roles', num: '03', title: 'I designed for roles, not one user.' },
    { id: 'approvals', num: '04', title: 'My team can prepare. I need to approve.' },
    { id: 'money', num: '05', title: 'Can I afford to pay this supplier today?' },
    { id: 'permissions', num: '06', title: 'My team needs access, but not all access.' },
    { id: 'grammar', num: '07', title: 'Same goal. Different moment.' },
    { id: 'scale', num: '08', title: 'Volume finding. Results stay blank until real numbers exist.' }
  ];

  var motion = {
    triggers: [],
    tween: null,
    riseState: { p: 0 },
    refreshTimers: [],
    normalized: false,
    pin: null,
    stage: null
  };

  var RISE_DUR = 1;
  var MORPH_VH = 2.35;

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

  function applyCbxRise(p) {
    var html = document.documentElement;
    var rise = 1 - Math.max(0, Math.min(1, p));
    html.style.setProperty('--cbx-rise', rise.toFixed(4));
    html.classList.toggle('is-cbx-growth-in', p > 0.08);
  }

  function restRise() {
    var html = document.documentElement;
    html.classList.remove('is-cbx-growth-in');
    html.style.removeProperty('--cbx-rise');
    motion.riseState.p = 0;
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

    inner.appendChild(type);
    inner.appendChild(media);
    section.appendChild(inner);
    return section;
  }

  function personFig(person) {
    var figure = el('figure', 'cbx-growth__person');
    figure.setAttribute('data-cbx-person', person.id);
    figure.setAttribute('data-from', String(person.from));
    var img = document.createElement('img');
    img.className = 'cbx-growth__person-img';
    img.alt = person.alt || '';
    img.src = person.src;
    img.decoding = 'async';
    img.addEventListener('error', function () {
      figure.classList.add('is-empty');
      img.remove();
    });
    figure.appendChild(img);
    return figure;
  }

  function stampList(parts) {
    var list = el('ul', 'cbx-growth__stamp');
    list.setAttribute('aria-label', 'Finding, choice, UI proof');
    (parts || []).forEach(function (text) {
      var item = el('li', 'cbx-growth__chip');
      var colon = text.indexOf(': ');
      if (colon !== -1) {
        item.appendChild(el('span', 'cbx-growth__chip-k', text.slice(0, colon)));
        item.appendChild(el('span', 'cbx-growth__chip-v', text.slice(colon + 2)));
      } else {
        item.textContent = text;
      }
      list.appendChild(item);
    });
    return list;
  }

  function beatCopy(beat, index, glitch) {
    var beatEl = el('div', 'cbx-growth__beat' + (index === 0 ? ' is-on' : ''));
    beatEl.setAttribute('data-cbx-beat', beat.id);
    beatEl.setAttribute('data-beat-index', String(index));
    beatEl.appendChild(stampList(beat.stamp));
    beatEl.appendChild(el('p', 'cbx-growth__index', pad(index + 1)));
    beatEl.appendChild(shout('h2', 'cbx-growth__stage', beat.label, glitch));
    beatEl.appendChild(el('p', 'cbx-growth__need', beat.need));
    beatEl.appendChild(el('p', 'cbx-growth__fact', beat.fact));
    return beatEl;
  }

  function ghostScreen(job) {
    var screen = el('div', 'cbx-ghost__screen cbx-ghost__screen--' + job);
    if (job === 'pay') {
      screen.appendChild(el('p', 'cbx-ghost__eyebrow', 'Home'));
      var actions = el('div', 'cbx-ghost__actions');
      actions.appendChild(el('span', 'cbx-ghost__btn', 'Receive'));
      actions.appendChild(el('span', 'cbx-ghost__btn', 'Pay'));
      screen.appendChild(actions);
      return screen;
    }
    if (job === 'balance') {
      screen.appendChild(el('p', 'cbx-ghost__eyebrow', 'Available'));
      screen.appendChild(el('p', 'cbx-ghost__hero', '12,480.00'));
      var subs = el('div', 'cbx-ghost__subs');
      subs.appendChild(el('p', 'cbx-ghost__sub', 'Hold  320.00'));
      subs.appendChild(el('p', 'cbx-ghost__sub', 'Pending  1,050.00'));
      screen.appendChild(subs);
      return screen;
    }
    if (job === 'approvals') {
      screen.appendChild(el('p', 'cbx-ghost__eyebrow', 'Waiting on me'));
      var queue = el('div', 'cbx-ghost__queue');
      ['Payroll', 'Supplier', 'Card limit'].forEach(function (row) {
        queue.appendChild(el('p', 'cbx-ghost__row', row));
      });
      screen.appendChild(queue);
      return screen;
    }
    return screen;
  }

  function ghostDevice(job) {
    var device = el('div', 'cbx-ghost cbx-ghost--phone cbx-ghost--' + job);
    device.appendChild(ghostScreen(job));
    return device;
  }

  function buildGhosts() {
    var wrap = el('div', 'cbx-growth__ghosts');
    wrap.setAttribute('data-cbx-ghosts', '');
    wrap.setAttribute('aria-hidden', 'true');
    GHOSTS.forEach(function (spec, i) {
      var ghost = el('div', 'cbx-growth__ghost' + (i === 0 ? ' is-on' : ''));
      ghost.setAttribute('data-cbx-ghost', spec.id);
      ghost.setAttribute('data-cbx-job', spec.job);
      var row = el('div', 'cbx-ghost-row');
      row.appendChild(ghostDevice(spec.job));
      ghost.appendChild(row);
      wrap.appendChild(ghost);
    });
    return wrap;
  }

  function buildGrowth() {
    var glitch = isMultiverse();
    var section = el('section', 'cbx-growth');
    section.setAttribute('data-cbx-section', '02');
    section.setAttribute('data-cbx-live', '');
    section.setAttribute('data-cbx-growth', '');
    section.setAttribute('aria-label', 'Aisha grows. The app follows.');

    var stage = el('div', 'cbx-growth__frame');
    stage.setAttribute('data-cbx-growth-frame', '');

    var copy = el('div', 'cbx-growth__copy');
    copy.appendChild(el('p', 'cbx-growth__spine', SPINE));
    var beats = el('div', 'cbx-growth__beats');
    beats.setAttribute('data-cbx-beats', '');
    BEATS.forEach(function (beat, i) {
      beats.appendChild(beatCopy(beat, i, glitch));
    });
    copy.appendChild(beats);
    stage.appendChild(copy);

    var well = el('div', 'cbx-growth__well');
    well.appendChild(buildGhosts());
    var cast = el('div', 'cbx-growth__cast');
    cast.setAttribute('data-cbx-cast', '');
    PEOPLE.forEach(function (person) {
      cast.appendChild(personFig(person));
    });
    well.appendChild(cast);
    stage.appendChild(well);

    section.appendChild(stage);
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

  function kill() {
    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;
    clearTimers();
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
      motion.pin.classList.remove('is-static');
      motion.pin.style.height = '';
      if (gsap) {
        Array.prototype.forEach.call(
          motion.pin.querySelectorAll('[data-cbx-person], [data-cbx-beat], [data-cbx-ghost]'),
          function (node) { gsap.set(node, { clearProps: 'opacity,transform,y,filter' }); }
        );
      }
      Array.prototype.forEach.call(
        motion.pin.querySelectorAll('[data-cbx-beat]'),
        function (beat, i) { beat.classList.toggle('is-on', i === 0); }
      );
      Array.prototype.forEach.call(
        motion.pin.querySelectorAll('[data-cbx-ghost]'),
        function (ghost, i) { ghost.classList.toggle('is-on', i === 0); }
      );
    }
    motion.pin = null;
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
    return Math.min(n - 1, Math.max(0, Math.round(progress * (n - 1))));
  }

  function markBeat(beats, index) {
    beats.forEach(function (beat, i) {
      beat.classList.toggle('is-on', i === index);
    });
  }

  function setupStatic(pin) {
    if (!pin) return;
    pin.classList.add('is-static');
    pin.style.height = '';
    var gsap = window.gsap;
    var beats = pin.querySelectorAll('[data-cbx-beat]');
    var people = pin.querySelectorAll('[data-cbx-person]');
    var ghosts = pin.querySelectorAll('[data-cbx-ghost]');
    Array.prototype.forEach.call(beats, function (beat, i) {
      var last = i === beats.length - 1;
      beat.classList.toggle('is-on', last);
      if (gsap) gsap.set(beat, { opacity: last ? 1 : 0 });
    });
    Array.prototype.forEach.call(people, function (person) {
      if (gsap) gsap.set(person, { opacity: 1, y: 0 });
    });
    Array.prototype.forEach.call(ghosts, function (ghost, i) {
      var last = i === ghosts.length - 1;
      ghost.classList.toggle('is-on', last);
      if (gsap) gsap.set(ghost, { opacity: last ? 1 : 0 });
    });
  }

  function bindCinematic(world, opts) {
    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;
    var stage = world.querySelector('[data-cbx-stage]');
    var pin = world.querySelector('[data-cbx-growth]');
    var cover = world.querySelector('[data-cbx-section="01"]');
    var beats = pin ? Array.prototype.slice.call(pin.querySelectorAll('[data-cbx-beat]')) : [];
    var people = pin ? Array.prototype.slice.call(pin.querySelectorAll('[data-cbx-person]')) : [];
    var ghosts = pin ? Array.prototype.slice.call(pin.querySelectorAll('[data-cbx-ghost]')) : [];
    var onStep = opts.onStep;

    motion.pin = pin;
    motion.stage = stage;
    if (!pin || !stage) {
      watchSteps(cover, pin, onStep);
      applyCbxRise(0);
      return;
    }

    pin.classList.remove('is-static');
    sizePane(stage);
    applyCbxRise(0);

    beats.forEach(function (beat, i) {
      gsap.set(beat, { opacity: i === 0 ? 1 : 0 });
      beat.classList.toggle('is-on', i === 0);
    });
    people.forEach(function (person) {
      var from = parseInt(person.getAttribute('data-from'), 10) || 0;
      gsap.set(person, {
        opacity: from === 0 ? 1 : 0,
        y: from === 0 ? 0 : 28
      });
    });
    ghosts.forEach(function (ghost, i) {
      gsap.set(ghost, { opacity: i === 0 ? 1 : 0 });
      ghost.classList.toggle('is-on', i === 0);
    });

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
        scrub: 0.65,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        fastScrollEnd: true,
        refreshPriority: 1,
        onRefresh: function () { sizePane(stage); },
        onToggle: function (self) {
          if (self.isActive && onStep) {
            onStep(motion.riseState.p > 0.08 ? 1 : 0);
          }
        },
        onUpdate: function (self) {
          var dur = tl.duration() || 1;
          var morphStart = RISE_DUR / dur;
          var morphP = 0;
          if (self.progress > morphStart) {
            morphP = (self.progress - morphStart) / Math.max(0.0001, 1 - morphStart);
          }
          var index = beatIndexFromProgress(morphP);
          markBeat(beats, index);
          markBeat(ghosts, index);
          if (onStep) onStep(motion.riseState.p > 0.92 ? 1 : 0);
        }
      }
    });

    tl.to(motion.riseState, {
      p: 1,
      duration: RISE_DUR,
      ease: 'none',
      onUpdate: function () { applyCbxRise(motion.riseState.p); }
    }, 0);

    if (beats[0] && beats[1]) {
      tl.to(beats[0], { opacity: 0, duration: 0.22 }, RISE_DUR + 0.28);
      tl.to(beats[1], { opacity: 1, duration: 0.22 }, RISE_DUR + 0.28);
    }
    if (ghosts[0] && ghosts[1]) {
      tl.to(ghosts[0], { opacity: 0, duration: 0.22 }, RISE_DUR + 0.28);
      tl.to(ghosts[1], { opacity: 1, duration: 0.22 }, RISE_DUR + 0.28);
    }
    people.forEach(function (person) {
      var from = parseInt(person.getAttribute('data-from'), 10) || 0;
      if (from === 1) {
        tl.to(person, { opacity: 1, y: 0, duration: 0.28 }, RISE_DUR + 0.26);
      }
    });

    if (beats[1] && beats[2]) {
      tl.to(beats[1], { opacity: 0, duration: 0.22 }, RISE_DUR + 0.62);
      tl.to(beats[2], { opacity: 1, duration: 0.22 }, RISE_DUR + 0.62);
    }
    if (ghosts[1] && ghosts[2]) {
      tl.to(ghosts[1], { opacity: 0, duration: 0.22 }, RISE_DUR + 0.62);
      tl.to(ghosts[2], { opacity: 1, duration: 0.22 }, RISE_DUR + 0.62);
    }
    people.forEach(function (person) {
      var from = parseInt(person.getAttribute('data-from'), 10) || 0;
      if (from === 2) {
        tl.to(person, { opacity: 1, y: 0, duration: 0.3 }, RISE_DUR + 0.6);
      }
    });

    tl.to({}, { duration: 0.12 });
    motion.tween = tl;
    if (tl.scrollTrigger) motion.triggers.push(tl.scrollTrigger);
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

    if (!gsap || !ScrollTrigger || reduce.matches) {
      setupStatic(pin);
      restRise();
      if (ScrollTrigger) {
        watchSteps(cover, pin, opts.onStep);
      }
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
    whenImages(pin, refreshSoon);
  }

  function liveCount(world) {
    if (!world) return 2;
    var n = world.querySelectorAll('[data-cbx-live]').length;
    return n || 2;
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
    world.appendChild(buildStubs());
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
    META: META,
    BEATS: BEATS,
    SPINE: SPINE,
    GHOSTS: GHOSTS,
    PEOPLE: PEOPLE,
    STUBS: STUBS
  };
})();
