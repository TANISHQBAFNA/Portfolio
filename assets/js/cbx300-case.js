/**
 * CBX300 case study — Section 01 cover + Section 02 Aisha growth track.
 * Cover: kicker → accent → word. Image overlaps type from the right.
 * Growth: vertical scroll into a pinned horizontal scrub. Aisha only.
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

  var GROWTH = [
    {
      id: 'freelancer',
      label: 'Freelancer',
      caption: 'Aisha works alone. Money in, money out.',
      src: 'assets/img/aisha-growth/01-freelancer.png',
      alt: 'Clay cutout of Aisha as a freelancer.'
    },
    {
      id: 'sole',
      label: 'Sole prop',
      caption: 'First formal steps. Still mostly her.',
      src: 'assets/img/aisha-growth/02-sole-prop.png',
      alt: 'Clay cutout of Aisha as a sole proprietor.'
    },
    {
      id: 'ten',
      label: '~10 people',
      caption: 'A team shows up. Roles and approvals appear.',
      src: 'assets/img/aisha-growth/03-small-company.png',
      alt: 'Clay cutout of Aisha with a team of about ten.'
    },
    {
      id: 'mid',
      label: 'Mid-size',
      caption: 'Scale. More people, more control.',
      src: 'assets/img/aisha-growth/04-midsize.png',
      alt: 'Clay cutout of Aisha with a mid-size company.'
    },
    {
      id: 'same',
      label: 'Same app, every level',
      caption: 'The product adapts. She doesn\u2019t outgrow it.',
      land: true
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
    refreshTimers: [],
    normalized: false,
    pin: null
  };

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

  function headPx(headerFn) {
    if (typeof headerFn === 'function') return headerFn();
    var chrome = document.querySelector('.study[data-template="cbx300"] .study__chrome');
    if (!chrome) return 72;
    return Math.round(chrome.getBoundingClientRect().bottom);
  }

  function paneH(headerFn) {
    return Math.max(280, Math.round(viewH() - headPx(headerFn)));
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

  function cutout(src, alt, className) {
    var figure = el('figure', className || 'cbx-growth__cutout');
    if (!src) {
      figure.classList.add('is-empty');
      figure.appendChild(el('span', 'cbx-growth__ph', 'Image'));
      return figure;
    }
    var img = document.createElement('img');
    img.className = 'cbx-growth__img';
    img.alt = alt || '';
    img.src = src;
    img.addEventListener('error', function () {
      figure.classList.add('is-empty');
      img.remove();
      if (!figure.querySelector('.cbx-growth__ph')) {
        figure.appendChild(el('span', 'cbx-growth__ph', 'Image'));
      }
    });
    figure.appendChild(img);
    return figure;
  }

  function buildPanel(stage, index, glitch) {
    var article = el('article', 'cbx-growth__panel' + (stage.land ? ' cbx-growth__panel--land' : ''));
    article.setAttribute('data-cbx-panel', stage.id);

    var copy = el('div', 'cbx-growth__copy');
    copy.appendChild(el('p', 'cbx-growth__index', pad(index + 1)));
    copy.appendChild(shout('h2', 'cbx-growth__stage', stage.label, glitch));
    copy.appendChild(el('p', 'cbx-growth__caption', stage.caption));
    article.appendChild(copy);

    if (stage.land) {
      var trail = el('p', 'cbx-growth__trail');
      ['Freelancer', 'Sole prop', '~10 people', 'Mid-size'].forEach(function (name, i) {
        if (i) trail.appendChild(el('span', 'cbx-growth__trail-sep', '→'));
        trail.appendChild(el('span', 'cbx-growth__trail-item', name));
      });
      copy.appendChild(trail);
      article.appendChild(cutout('', '', 'cbx-growth__cutout is-empty'));
    } else {
      article.appendChild(cutout(stage.src, stage.alt));
    }
    return article;
  }

  function buildGrowth() {
    var glitch = isMultiverse();
    var section = el('section', 'cbx-growth');
    section.setAttribute('data-cbx-section', '02');
    section.setAttribute('data-cbx-live', '');
    section.setAttribute('data-cbx-growth', '');
    section.setAttribute('aria-label', 'Aisha grows. The app follows.');

    var track = el('div', 'cbx-growth__track');
    track.setAttribute('data-cbx-growth-track', '');
    GROWTH.forEach(function (stage, i) {
      track.appendChild(buildPanel(stage, i, glitch));
    });
    section.appendChild(track);
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
    if (motion.pin) {
      motion.pin.classList.remove('is-static');
      motion.pin.style.height = '';
      var track = motion.pin.querySelector('[data-cbx-growth-track]');
      if (track && gsap) gsap.set(track, { clearProps: 'transform,x' });
      Array.prototype.forEach.call(
        motion.pin.querySelectorAll('[data-cbx-panel]'),
        function (panel) { panel.classList.remove('is-on'); }
      );
    }
    motion.pin = null;
    if (motion.normalized && ScrollTrigger && ScrollTrigger.normalizeScroll) {
      ScrollTrigger.normalizeScroll(false);
      motion.normalized = false;
    }
  }

  function sizePane(pin, headerFn) {
    if (!pin) return paneH(headerFn);
    var h = paneH(headerFn);
    pin.style.height = h + 'px';
    return h;
  }

  function markPanel(panels, index) {
    panels.forEach(function (panel, i) {
      panel.classList.toggle('is-on', i === index);
    });
  }

  function setupStatic(pin) {
    if (!pin) return;
    pin.classList.add('is-static');
    pin.style.height = '';
    var track = pin.querySelector('[data-cbx-growth-track]');
    if (track && window.gsap) window.gsap.set(track, { x: 0, clearProps: 'transform' });
    var panels = pin.querySelectorAll('[data-cbx-panel]');
    Array.prototype.forEach.call(panels, function (panel) {
      panel.classList.add('is-on');
    });
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

  function travelX(pin, track) {
    if (!pin || !track) return 0;
    return Math.max(0, track.scrollWidth - pin.clientWidth);
  }

  function bindCinematic(world, opts) {
    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;
    var pin = world.querySelector('[data-cbx-growth]');
    var track = pin && pin.querySelector('[data-cbx-growth-track]');
    var cover = world.querySelector('[data-cbx-section="01"]');
    var panels = pin ? Array.prototype.slice.call(pin.querySelectorAll('[data-cbx-panel]')) : [];
    var onStep = opts.onStep;
    var headerFn = opts.headerOffset;

    motion.pin = pin;
    if (!pin || !track) {
      watchSteps(cover, pin, onStep);
      return;
    }

    pin.classList.remove('is-static');
    sizePane(pin, headerFn);
    gsap.set(track, { x: 0 });
    markPanel(panels, 0);

    var tween = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: pin,
        start: function () { return 'top ' + headPx(headerFn) + 'px'; },
        end: function () {
          sizePane(pin, headerFn);
          var run = travelX(pin, track);
          var hold = Math.round(paneH(headerFn) * 0.22);
          return '+=' + Math.round(run + hold);
        },
        pin: true,
        pinSpacing: true,
        scrub: 0.6,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        fastScrollEnd: true,
        refreshPriority: 1,
        onRefresh: function () { sizePane(pin, headerFn); },
        onToggle: function (self) {
          if (self.isActive && onStep) onStep(1);
        },
        onUpdate: function (self) {
          if (!panels.length) return;
          var n = panels.length;
          var i = Math.min(n - 1, Math.max(0, Math.round(self.progress * (n - 1))));
          markPanel(panels, i);
        }
      }
    });
    tween.to(track, {
      x: function () { return -travelX(pin, track); },
      duration: 1
    });
    tween.to({}, { duration: 0.18 });
    motion.tween = tween;
    if (tween.scrollTrigger) motion.triggers.push(tween.scrollTrigger);

    if (cover) {
      motion.triggers.push(ScrollTrigger.create({
        trigger: cover,
        start: 'top 80%',
        end: function () { return 'bottom ' + headPx(headerFn) + 'px'; },
        onToggle: function (self) {
          if (self.isActive && onStep) onStep(0);
        }
      }));
    }
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
      if (ScrollTrigger) watchSteps(cover, pin, opts.onStep);
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
    world.appendChild(buildCover(project));
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
    META: META,
    GROWTH: GROWTH,
    STUBS: STUBS
  };
})();
