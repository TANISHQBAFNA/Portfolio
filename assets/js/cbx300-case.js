/**
 * CBX300 case study — Section 01 cover + Section 02 Aisha desk montage.
 * Cover: kicker → accent → word. Image overlaps type from the right.
 * Growth: coffee panel curtains over the parked cover + chrome
 * (--cbx-rise / --panel-flush, same family as landing --rise /
 * --panel-flush / is-projects-in), then one pinned desk densifies.
 * App sits on the desk as a physical object (phone → propped tablet → laptop).
 * Captions are sticky notes + a desk-apron lower third — not a left essay column.
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

  /* Echo desk-life caption pack — verbatim. Meet-a-friend, not FINDING/CHOICE. */
  var INTRO = 'Hi — meet Aisha. Same person. Desk just gets busier.';
  var CLOSE = 'Pressure changes. The bank grows with her desk.';
  var HARD_K = 'What’s hard';
  var CHANGE_K = 'What we did';

  var BEATS = [
    {
      id: 'freelancer',
      label: 'Freelancer',
      meet: 'Just her. One client at a time.',
      hard: '“Did I get paid — can I pay someone?”',
      change: 'Phone shows pay and cash in.'
    },
    {
      id: 'sole',
      label: 'Sole proprietor',
      meet: 'Business is real now. Desk’s fuller.',
      hard: '“How much can I safely spend today?”',
      change: 'Available sits largest on the propped screen.'
    },
    {
      id: 'mid',
      label: 'Mid-size',
      meet: 'Team energy. Approving is the day job.',
      hard: '“Who’s waiting — can I clear this safely?”',
      change: 'Approvals live on the laptop, with who can act.'
    }
  ];

  var DEVICES = [
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

  var PROPS = [
    { id: 'mug', from: 0 },
    { id: 'sticky', from: 0 },
    { id: 'invoice', from: 0 },
    { id: 'receipts', from: 1 },
    { id: 'mug2', from: 1 },
    { id: 'papers', from: 1 },
    { id: 'mug3', from: 2 },
    { id: 'chair', from: 2 }
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

  /* Rise is a slight wheel/trackpad nudge, not a full-viewport scrub.
     Morph still owns the long pin after the sheet is flush-top. */
  var RISE_DUR = 0.16;
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
  }

  function restRise() {
    var html = document.documentElement;
    var pane = growthPane();
    html.classList.remove('is-cbx-growth-in');
    html.style.removeProperty('--cbx-rise');
    if (pane) pane.style.removeProperty('--panel-flush');
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
    if ((person.from || 0) === 0) figure.classList.add('is-in');
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

  function propNode(spec) {
    var node = el('div', 'cbx-growth__prop cbx-growth__prop--' + spec.id);
    node.setAttribute('data-cbx-prop', spec.id);
    node.setAttribute('data-from', String(spec.from));
    if ((spec.from || 0) === 0) node.classList.add('is-in');
    node.setAttribute('aria-hidden', 'true');
    return node;
  }

  function talkNote(kind, label, text, valueClass) {
    var note = el('div', 'cbx-growth__note cbx-growth__note--' + kind);
    note.appendChild(el('p', 'cbx-growth__k', label));
    note.appendChild(el('p', valueClass, text));
    return note;
  }

  function beatCopy(beat, index, glitch) {
    var beatEl = el('div', 'cbx-growth__beat' + (index === 0 ? ' is-on' : ''));
    beatEl.setAttribute('data-cbx-beat', beat.id);
    beatEl.setAttribute('data-beat-index', String(index));
    beatEl.appendChild(shout('p', 'cbx-growth__stage', pad(index + 1) + ' · ' + beat.label, glitch));
    var meet = el('div', 'cbx-growth__note cbx-growth__note--meet');
    meet.appendChild(el('p', 'cbx-growth__meet', beat.meet));
    beatEl.appendChild(meet);
    beatEl.appendChild(talkNote('hard', HARD_K, beat.hard, 'cbx-growth__hard'));
    beatEl.appendChild(talkNote('did', CHANGE_K, beat.change, 'cbx-growth__change'));
    return beatEl;
  }

  function productScreen(job) {
    var screen = el('div', 'cbx-device__screen cbx-device__screen--' + job);
    if (job === 'pay') {
      var cash = el('div', 'cbx-device__cash');
      cash.appendChild(el('p', 'cbx-device__eyebrow', 'In today'));
      cash.appendChild(el('p', 'cbx-device__money', '4,200.00'));
      screen.appendChild(cash);
      var actions = el('div', 'cbx-device__actions');
      actions.appendChild(el('span', 'cbx-device__btn cbx-device__btn--payin', 'Get paid'));
      actions.appendChild(el('span', 'cbx-device__btn cbx-device__btn--payout', 'Pay'));
      screen.appendChild(actions);
      return screen;
    }
    if (job === 'balance') {
      var lead = el('div', 'cbx-device__lead');
      lead.appendChild(el('p', 'cbx-device__eyebrow', 'Available'));
      var hero = el('p', 'cbx-device__hero', '12,480.00');
      hero.setAttribute('data-cbx-money', '');
      lead.appendChild(hero);
      screen.appendChild(lead);
      var subs = el('div', 'cbx-device__subs');
      subs.appendChild(el('p', 'cbx-device__sub', 'Ledger  13,850.00'));
      subs.appendChild(el('p', 'cbx-device__sub', 'Hold  320.00'));
      subs.appendChild(el('p', 'cbx-device__sub', 'Pending  1,050.00'));
      screen.appendChild(subs);
      return screen;
    }
    if (job === 'approvals') {
      screen.appendChild(el('p', 'cbx-device__kicker', 'Waiting on me'));
      var head = el('div', 'cbx-device__doorhead');
      head.appendChild(el('p', 'cbx-device__eyebrow', 'Approvals'));
      head.appendChild(el('span', 'cbx-device__approve', 'Approve (3)'));
      screen.appendChild(head);
      var queue = el('div', 'cbx-device__queue');
      [
        { name: 'Payroll', amt: '42,000.00' },
        { name: 'Supplier', amt: '8,400.00' },
        { name: 'Card limit', amt: '2,000.00' }
      ].forEach(function (row) {
        var line = el('p', 'cbx-device__row');
        line.appendChild(el('span', 'cbx-device__row-name', row.name));
        line.appendChild(el('span', 'cbx-device__row-amt', row.amt));
        queue.appendChild(line);
      });
      screen.appendChild(queue);
      return screen;
    }
    return screen;
  }

  function deviceShape(job) {
    if (job === 'pay') return 'phone';
    if (job === 'balance') return 'tablet';
    if (job === 'approvals') return 'laptop';
    return 'phone';
  }

  function deviceShell(job) {
    var shape = deviceShape(job);
    var shell = el('div', 'cbx-device cbx-device--' + shape + ' cbx-device--' + job);
    if (shape === 'laptop') {
      var lid = el('div', 'cbx-device__lid');
      lid.appendChild(productScreen(job));
      shell.appendChild(lid);
      shell.appendChild(el('div', 'cbx-device__base'));
      return shell;
    }
    shell.appendChild(productScreen(job));
    return shell;
  }

  function buildDevices() {
    var wrap = el('div', 'cbx-growth__devices');
    wrap.setAttribute('data-cbx-devices', '');
    wrap.setAttribute('aria-hidden', 'true');
    DEVICES.forEach(function (spec, i) {
      var slot = el('div', 'cbx-growth__device' + (i === 0 ? ' is-on' : ''));
      slot.setAttribute('data-cbx-device', spec.id);
      slot.setAttribute('data-cbx-job', spec.job);
      slot.appendChild(deviceShell(spec.job));
      wrap.appendChild(slot);
    });
    return wrap;
  }

  function buildGrowth() {
    var glitch = isMultiverse();
    var section = el('section', 'cbx-growth');
    section.setAttribute('data-cbx-section', '02');
    section.setAttribute('data-cbx-live', '');
    section.setAttribute('data-cbx-growth', '');
    section.setAttribute('data-cbx-live-beat', '0');
    section.setAttribute('aria-label', 'Hi — meet Aisha. Same person. Desk just gets busier.');

    var scene = el('div', 'cbx-growth__scene');
    scene.setAttribute('data-cbx-desk', '');
    scene.setAttribute('data-cbx-montage', '');

    var cast = el('div', 'cbx-growth__cast');
    cast.setAttribute('data-cbx-cast', '');
    PEOPLE.forEach(function (person) {
      cast.appendChild(personFig(person));
    });
    scene.appendChild(cast);

    var desk = el('div', 'cbx-growth__desk');
    var top = el('div', 'cbx-growth__top');
    var props = el('div', 'cbx-growth__props');
    PROPS.forEach(function (spec) {
      props.appendChild(propNode(spec));
    });
    top.appendChild(props);
    top.appendChild(buildDevices());

    var notes = el('div', 'cbx-growth__notes');
    notes.setAttribute('data-cbx-beats', '');
    BEATS.forEach(function (beat, i) {
      notes.appendChild(beatCopy(beat, i, glitch));
    });
    top.appendChild(notes);
    desk.appendChild(top);

    var apron = el('div', 'cbx-growth__apron');
    apron.appendChild(shout('p', 'cbx-growth__intro', INTRO, glitch));
    apron.appendChild(el('p', 'cbx-growth__close', CLOSE));
    desk.appendChild(apron);

    scene.appendChild(desk);
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
      root.querySelectorAll('[data-cbx-person], [data-cbx-beat], [data-cbx-device], [data-cbx-prop]')
    );
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
        morphNodes(motion.pin).forEach(function (node) {
          gsap.set(node, { clearProps: 'opacity,visibility,transform,y,filter' });
        });
      }
      applyBeat(motion.pin, 0);
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
    var pin = motion.pin || document.querySelector('[data-cbx-growth]');
    fitMoney(pin);
    return h;
  }

  function beatIndexFromProgress(progress) {
    var n = BEATS.length;
    if (n <= 1) return 0;
    if (progress >= 1) return n - 1;
    return Math.min(n - 1, Math.max(0, Math.floor(progress * n)));
  }

  function fitMoney(root) {
    if (!root) return;
    Array.prototype.forEach.call(
      root.querySelectorAll('.cbx-device__hero, .cbx-device__money'),
      function (node) {
        var wrap = node.closest('.cbx-device');
        if (!wrap) return;
        node.style.fontSize = '';
        var cs = window.getComputedStyle(wrap);
        var padX = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
        var max = wrap.clientWidth - padX;
        if (max <= 0) {
          max = wrap.getBoundingClientRect().width - padX;
        }
        if (max <= 8) return;
        var size = parseFloat(window.getComputedStyle(node).fontSize) || 20;
        var guard = 0;
        while (node.scrollWidth > max + 0.5 && size > 13 && guard < 32) {
          size -= 0.5;
          node.style.fontSize = size + 'px';
          guard += 1;
        }
      }
    );
  }

  function applyBeat(root, index) {
    var pane = root;
    if (root && root.closest && !root.hasAttribute('data-cbx-growth')) {
      pane = root.closest('[data-cbx-growth]');
    }
    if (!pane) return;
    pane.setAttribute('data-cbx-live-beat', String(index));
    Array.prototype.forEach.call(pane.querySelectorAll('[data-cbx-beat]'), function (beat, i) {
      beat.classList.toggle('is-on', i === index);
    });
    Array.prototype.forEach.call(pane.querySelectorAll('[data-cbx-device]'), function (device, i) {
      device.classList.toggle('is-on', i === index);
    });
    Array.prototype.forEach.call(pane.querySelectorAll('[data-cbx-person]'), function (person) {
      var from = parseInt(person.getAttribute('data-from'), 10) || 0;
      person.classList.toggle('is-in', from <= index);
    });
    Array.prototype.forEach.call(pane.querySelectorAll('[data-cbx-prop]'), function (prop) {
      var from = parseInt(prop.getAttribute('data-from'), 10) || 0;
      prop.classList.toggle('is-in', from <= index);
    });
    fitMoney(pane);
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
    sizePane(stage);
    applyCbxRise(0);

    morphNodes(pin).forEach(function (node) {
      gsap.set(node, { clearProps: 'opacity,visibility,transform,y,filter' });
    });
    applyBeat(pin, 0);

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
        scrub: 0.28,
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
          applyBeat(pin, beatIndexFromProgress(morphP));
          if (onStep) onStep(motion.riseState.p > 0.92 ? 1 : 0);
        }
      }
    });

    tl.to(motion.riseState, {
      p: 1,
      duration: RISE_DUR,
      ease: 'power2.out',
      onUpdate: function () { applyCbxRise(motion.riseState.p); }
    }, 0);

    tl.to({}, { duration: MORPH_VH });
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
    fitMoney(world);
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
    META: META,
    BEATS: BEATS,
    INTRO: INTRO,
    CLOSE: CLOSE,
    DEVICES: DEVICES,
    PEOPLE: PEOPLE,
    PROPS: PROPS,
    STUBS: STUBS
  };
})();
