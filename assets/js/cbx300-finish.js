/**
 * CBX300 Sections 04–06 and the coffee-curtain ending.
 * Same stage, type and ScrollTrigger grammar as Sections 01–03.
 * Lisa Charlie is a demo brand. Aisha is a representative story.
 */
window.Cbx300Finish = (function () {
  'use strict';

  var IMG = 'assets/img/cbx300/';
  var STAGE_W = 1440;
  var STAGE_H = 900;
  var PX = 170;
  var SCRUB = 1.0;

  var motion = { triggers: [], tweens: [], reduce: false };

  var STRIP = [
    { src: 's04-grow-1-home-min.png', alt: 'CBX300 phone · Day one', cap: 'On her own: one card, nothing to set up', num: '01', name: 'Freelancer' },
    { src: 's04-grow-2-home.png', alt: 'CBX300 phone · Home', cap: 'First hire: pay people, bills on autopay', num: '02', name: 'Shop of two' },
    { src: 's04-grow-3-multi-entity.png', alt: 'CBX300 phone · Every entity', cap: 'A team and more than one business: one switch, every entity', num: '03', name: 'Mid-size' }
  ];

  var PAIRS = [
    {
      chosen: 's04-pair1-chosen-min-dashboard.png',
      dropped: 's04-pair1-dropped-empty-widgets.png',
      chose: 'Show only what exists. A new account opens on one card.',
      drop: 'The full dashboard with every widget empty.',
      why: 'A screen of empty boxes tells a new business it is behind.'
    },
    {
      chosen: 's04-pair2-chosen-status-first.png',
      dropped: 's04-pair2-dropped-status-hidden.png',
      chose: 'Paid / Overdue on every row, in the same place.',
      drop: 'A plain list, with status inside each invoice.',
      why: 'She shouldn’t have to open five invoices to answer one question.'
    },
    {
      chosen: 's04-pair3-chosen-slide-to-approve.png',
      dropped: 's04-pair3-dropped-shrunk-table.png',
      chose: 'One payment, one slide.',
      drop: 'The desktop approvals table squeezed onto a phone.',
      why: 'Approvals happen between meetings, with one thumb.'
    }
  ];

  var TRUST = [
    {
      id: 'trust',
      hero: 'phone',
      noDesk: true,
      kicker: 'Trust and team',
      people: ['aisha', 'lina'],
      ask: 'Eight people. Most of them need her yes.',
      focus: 'Team',
      openShot: 'users',
      phoneShots: [
        { id: 'users', src: IMG + 's05-user-management.png', alt: 'CBX300 phone · User management' },
        { id: 'roles', src: IMG + 's05-access-roles.png', alt: 'CBX300 phone · Access and roles' },
        { id: 'limits', src: IMG + 's05-limits.png', alt: 'CBX300 phone · Limits' },
        { id: 'over', src: IMG + 's03-ch3-phone-approve-list.png', alt: 'CBX300 phone · Over the limit' }
      ],
      region: { phone: '[data-ans-device="phone"]', desk: null },
      pointers: [
        {
          worry: 'Who is on my team?',
          does: 'Everyone is in one list, split into active and waiting for approval, each with their role.',
          why: ['A new person is visible before they can move money.', 'Waiting for approval means they cannot act yet.'],
          not: 'We didn’t let new users act before someone approves them.',
          gain: 'No stranger can move money.',
          shot: 'users',
          rect: { x: 4, y: 22, w: 92, h: 56 },
          device: 'phone'
        },
        {
          worry: 'What can Lina do?',
          does: 'Adding a user is a short form: role, group and how they sign in, before any limits.',
          why: ['Roles come before limits, so access follows the job, not the person.', 'Sign-in strength is chosen per user.'],
          not: 'We didn’t start from a blank permissions matrix.',
          gain: 'Setting up a new hire takes minutes.',
          shot: 'roles',
          rect: { x: 4, y: 33, w: 92, h: 36 },
          device: 'phone'
        },
        {
          worry: 'What if someone pays too much?',
          does: 'Each user has limits per day and per payment. A payment above the limit is flagged before approval and left out of the batch.',
          why: ['The rule is set once and applied every time.', 'The warning appears where she approves, not in a report.'],
          not: 'We didn’t rely on someone noticing a big number.',
          gain: 'Big calls stay with Aisha.',
          shot: 'limits',
          rect: { x: 4, y: 34, w: 92, h: 32 },
          device: 'phone',
          after: { shot: 'over', rect: { x: 4, y: 37, w: 92, h: 12 }, device: 'phone' }
        }
      ]
    }
  ];

  var ROLES = [
    { lab: 'Role', text: 'Lead product designer, design system and end-to-end screens' },
    { lab: 'When', text: 'Jan 2026 – present' },
    { lab: 'Scope', text: 'Mobile and web, design system to delivery' }
  ];

  var Qs = [
    { illo: 'assets/img/aisha-growth/illo-d2-1.svg', q: 'Did the client pay yet?', a: 'Paid shows on every row.' },
    { illo: 'assets/img/aisha-growth/illo-d2-2.svg', q: 'Can I afford her salary?', a: 'Safe to spend, and payday covered.' },
    { illo: 'assets/img/aisha-growth/illo-d2-3.svg', q: 'Who’s waiting on me?', a: 'One list, one slide.' }
  ];

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function picture(src, alt, w, h) {
    var pic = document.createElement('picture');
    pic.className = 'cbx-fin__pic';
    var source = document.createElement('source');
    source.type = 'image/webp';
    source.srcset = src.replace(/\.png$/, '.webp');
    var img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    img.width = w;
    img.height = h;
    img.decoding = 'async';
    pic.appendChild(source);
    pic.appendChild(img);
    return pic;
  }

  function phone(src, alt) {
    var slot = el('div', 'cbx-fin__phone');
    slot.appendChild(picture(IMG + src, alt, 440, 956));
    return slot;
  }

  function fit(section) {
    var s = Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H);
    if (!isFinite(s) || s <= 0) s = 1;
    section.style.setProperty('--ans-scale', String(s));
    return s;
  }

  function pinOn(on) {
    document.documentElement.classList.toggle('is-cbx-finish-pin', !!on);
  }

  function snap() {
    return {
      delay: 0.3,
      duration: { min: 0.45, max: 1.0 },
      ease: 'power2.inOut',
      inertia: false
    };
  }

  function buildStrip() {
    var strip = el('div', 'cbx-s04__strip');
    var hand = phone('s03-ch3-phone-approved.png', 'CBX300 phone · Approved');
    hand.classList.add('cbx-s04__hand');
    strip.appendChild(hand);
    STRIP.forEach(function (item, i) {
      var col = el('div', 'cbx-s04__col');
      col.setAttribute('data-slot', String(i));
      col.appendChild(phone(item.src, item.alt));
      var rule = el('span', 'cbx-s04__rule');
      var rail = el('p', 'cbx-growth__step is-on');
      rail.appendChild(el('span', 'cbx-growth__step-num', item.num));
      rail.appendChild(el('span', 'cbx-growth__step-name', item.name));
      var cap = el('p', 'cbx-s04__cap', item.cap);
      col.appendChild(rule);
      col.appendChild(rail);
      col.appendChild(cap);
      strip.appendChild(col);
    });
    var sweep = el('span', 'cbx-s04__sweep');
    strip.appendChild(sweep);
    return strip;
  }

  function buildPairs() {
    var wrap = el('div', 'cbx-s04__pairs');
    var phones = el('div', 'cbx-s04__duo');
    var chosen = el('div', 'cbx-s04__chosen');
    var dropped = el('div', 'cbx-s04__dropped');
    PAIRS.forEach(function (pair, i) {
      var c = phone(pair.chosen, 'CBX300 phone · Chosen');
      var d = phone(pair.dropped, 'CBX300 phone · Dropped');
      c.setAttribute('data-pair', String(i));
      d.setAttribute('data-pair', String(i));
      if (i) { c.style.opacity = '0'; d.style.opacity = '0'; }
      chosen.appendChild(c);
      dropped.appendChild(d);
    });
    var tag = el('p', 'cbx-s04__drop-lab', 'Dropped');
    dropped.appendChild(tag);
    var col = el('div', 'cbx-s04__ncol');
    PAIRS.forEach(function (pair, i) {
      var block = el('div', 'cbx-s04__lines');
      block.setAttribute('data-pair', String(i));
      block.appendChild(el('p', 'cbx-s04__line', pair.chose));
      block.appendChild(el('p', 'cbx-s04__line is-drop', pair.drop));
      block.appendChild(el('p', 'cbx-s04__why', pair.why));
      if (i) block.style.opacity = '0';
      col.appendChild(block);
    });
    var ticks = el('div', 'cbx-ans__ticks');
    ticks.setAttribute('aria-hidden', 'true');
    PAIRS.forEach(function () { ticks.appendChild(el('i', 'cbx-ans__tick')); });
    phones.appendChild(chosen);
    phones.appendChild(dropped);
    wrap.appendChild(phones);
    wrap.appendChild(col);
    wrap.appendChild(ticks);
    return wrap;
  }

  function buildGrow() {
    var section = el('section', 'cbx-s04');
    section.setAttribute('data-cbx-section', '04');
    section.setAttribute('data-cbx-live', '');
    section.setAttribute('data-cbx-grow', '');
    section.setAttribute('aria-label', 'She grows, the app grows');
    var stage = el('div', 'cbx-s04__fit');
    stage.appendChild(el('p', 'cbx-s04__kicker', '04 · The app grows with her'));
    var h2 = el('h2', 'cbx-s04__title', 'Her business got bigger. The app kept up.');
    if (document.documentElement.classList.contains('is-multiverse')) {
      h2.classList.add('glitch');
      h2.setAttribute('data-text', h2.textContent);
    }
    stage.appendChild(h2);
    stage.appendChild(buildStrip());
    stage.appendChild(buildPairs());
    section.appendChild(stage);
    return section;
  }

  function buildRole() {
    var section = el('section', 'cbx-s06');
    section.setAttribute('data-cbx-section', '06');
    section.setAttribute('data-cbx-live', '');
    section.setAttribute('data-cbx-role', '');
    section.setAttribute('aria-label', 'Outcome and my role');
    var stage = el('div', 'cbx-s06__fit');
    var beat = el('div', 'cbx-s06__beat is-worry');
    var h2 = el('h2', 'cbx-s06__title', 'Her business got bigger. Her worries got smaller.');
    if (document.documentElement.classList.contains('is-multiverse')) {
      h2.classList.add('glitch');
      h2.setAttribute('data-text', h2.textContent);
    }
    beat.appendChild(h2);
    var row = el('div', 'cbx-s06__illos cbx-ink');
    Qs.forEach(function (item) {
      var col = el('div', 'cbx-s06__illo');
      var slot = el('div', 'cbx-s06__svg');
      slot.setAttribute('data-illo', item.illo);
      col.appendChild(slot);
      var q = el('p', 'cbx-s06__q');
      q.appendChild(el('span', 'cbx-s06__q-text', item.q));
      q.appendChild(el('span', 'cbx-s06__strike'));
      col.appendChild(q);
      col.appendChild(el('p', 'cbx-s06__a', item.a));
      row.appendChild(col);
    });
    beat.appendChild(row);
    var role = el('div', 'cbx-s06__beat is-role');
    var phoneSlot = phone('s06-welcome.png', 'CBX300 phone · Welcome');
    phoneSlot.classList.add('cbx-s06__phone');
    var rows = el('div', 'cbx-s06__rows');
    ROLES.forEach(function (item) {
      var line = el('div', 'cbx-s06__row');
      line.appendChild(el('p', 'cbx-s06__lab', item.lab));
      line.appendChild(el('p', 'cbx-s06__text', item.text));
      rows.appendChild(line);
    });
    rows.appendChild(el('p', 'cbx-s06__note', 'Lisa Charlie is a demo brand. Aisha is a representative story. All names and amounts are hidden.'));
    role.appendChild(phoneSlot);
    role.appendChild(rows);
    stage.appendChild(beat);
    stage.appendChild(role);
    section.appendChild(stage);
    return section;
  }

  function buildEnd() {
    var section = el('section', 'cbx-end');
    section.setAttribute('data-cbx-end', '');
    section.setAttribute('aria-label', 'Next project');
    var sheet = el('div', 'cbx-end__sheet');
    var inner = el('div', 'cbx-end__inner');
    var title = el('p', 'cbx-end__kicker', 'Next project');
    if (document.documentElement.classList.contains('is-multiverse')) {
      title.classList.add('glitch');
      title.setAttribute('data-text', 'Next project');
    }
    var card = el('button', 'cbx-end__card work-card');
    card.type = 'button';
    var cap = el('span', 'cbx-end__cap');
    cap.appendChild(el('span', 'work-card__title', 'Plootus.ai'));
    cap.appendChild(el('span', 'work-card__caption', 'AI · Sales · Agents that call, dashboards that read'));
    card.appendChild(cap);
    card.addEventListener('click', function () {
      window.dispatchEvent(new CustomEvent('cbx-open-next'));
    });
    var back = el('button', 'cbx-end__back', 'Back to all work');
    back.type = 'button';
    back.addEventListener('click', function () {
      window.dispatchEvent(new CustomEvent('cbx-close-study'));
    });
    inner.appendChild(title);
    inner.appendChild(card);
    inner.appendChild(back);
    sheet.appendChild(inner);
    section.appendChild(sheet);
    return section;
  }

  function fillIllos(section) {
    Array.prototype.forEach.call(section.querySelectorAll('[data-illo]'), function (slot) {
      var src = slot.getAttribute('data-illo');
      window.fetch(src).then(function (res) { return res.text(); }).then(function (markup) {
        slot.innerHTML = markup;
        var svg = slot.querySelector('svg');
        if (svg) {
          svg.classList.add('cbx-s06__art');
          svg.setAttribute('aria-hidden', 'true');
        }
      }).catch(function () {
        var img = document.createElement('img');
        img.src = src;
        img.alt = '';
        slot.appendChild(img);
      });
    });
  }

  function bindGrow(section) {
    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;
    section.dataset.bound = motion.reduce ? 'reduce' : (gsap ? 'motion' : 'nogsap');
    fit(section);
    if (motion.reduce || !gsap) {
      section.classList.add('is-static');
      return;
    }
    var narrow = window.matchMedia('(max-width: 859px)').matches;
    if (narrow) {
      bindGrowNarrow(section);
      return;
    }
    var cols = section.querySelectorAll('.cbx-s04__col');
    var caps = section.querySelectorAll('.cbx-s04__cap');
    var hand = section.querySelector('.cbx-s04__hand');
    var sweep = section.querySelector('.cbx-s04__sweep');
    var pairs = section.querySelector('.cbx-s04__pairs');
    var chosen = section.querySelectorAll('.cbx-s04__chosen .cbx-fin__phone');
    var dropped = section.querySelectorAll('.cbx-s04__dropped .cbx-fin__phone');
    var lines = section.querySelectorAll('.cbx-s04__lines');
    var ticks = section.querySelectorAll('.cbx-s04__pairs .cbx-ans__tick');
    gsap.set(cols[0], { y: 40, opacity: 0 });
    gsap.set(cols[1], { y: 40, opacity: 0 });
    gsap.set(hand, { opacity: 1, scale: 1.08, y: 0 });
    gsap.set(cols[2], { opacity: 0 });
    gsap.set(caps, { opacity: 0 });
    gsap.set(sweep, { scaleX: 0, transformOrigin: '0 50%' });
    gsap.set(pairs, { opacity: 0 });
    gsap.set(dropped, { x: 120, opacity: 0 });
    var tl = gsap.timeline({ paused: true });
    tl.to(hand, { scale: 1, y: 0, duration: 1.2, ease: 'power2.inOut' }, 0);
    tl.to(cols[0], { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, 0.15);
    tl.to(cols[1], { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, 0.3);
    tl.to(hand, { opacity: 0, duration: 0.45, ease: 'sine.inOut' }, 0.9);
    tl.to(cols[2], { opacity: 1, duration: 0.45, ease: 'sine.inOut' }, 0.9);
    tl.to({}, { duration: 2.0 }, 1.4);
    tl.to(sweep, { scaleX: 1, duration: 1.6, ease: 'sine.inOut' }, 3.4);
    tl.to(cols, { y: -12, duration: 0.5, ease: 'power3.out', stagger: 0.15 }, 3.5);
    tl.to(caps, { opacity: 1, duration: 0.5, ease: 'power3.out', stagger: 0.15 }, 3.6);
    tl.to({}, { duration: 3.0 }, 5.2);
    tl.to([cols[0], cols[1]], { x: -120, opacity: 0, duration: 0.45, ease: 'power2.inOut' }, 8.2);
    tl.to(cols[2], { opacity: 0, duration: 0.45, ease: 'sine.inOut' }, 8.7);
    tl.to(pairs, { opacity: 1, duration: 0.45 }, 9.2);
    tl.fromTo(dropped[0], { x: 120, opacity: 0 }, { x: 0, opacity: 0.55, duration: 0.85, ease: 'power3.out' }, 9.2);
    tl.fromTo(lines[0], { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1.15, ease: 'power3.out' }, 9.35);
    var t = 9.2 + 5.3;
    var i;
    for (i = 1; i < PAIRS.length; i += 1) {
      tl.to(chosen[i - 1], { opacity: 0, duration: 0.45, ease: 'sine.inOut' }, t);
      tl.to(dropped[i - 1], { opacity: 0, duration: 0.45, ease: 'sine.inOut' }, t);
      tl.to(lines[i - 1], { y: -26, opacity: 0, duration: 0.6, ease: 'power2.inOut' }, t);
      tl.to(chosen[i], { opacity: 1, duration: 0.45, ease: 'sine.inOut' }, t + 0.2);
      tl.fromTo(dropped[i], { x: 120, opacity: 0 }, { x: 0, opacity: 0.55, duration: 0.85, ease: 'power3.out' }, t + 0.2);
      tl.fromTo(lines[i], { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1.15, ease: 'power3.out' }, t + 0.35);
      t += 5.0;
    }
    tl.to({}, { duration: 5.3 }, t - 5.0);
    tl.to([dropped[2], lines[2], section.querySelector('.cbx-s04__kicker')], { opacity: 0, duration: 0.6 }, t);
    var st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: function () { return '+=' + Math.round(tl.duration() * PX); },
      pin: true,
      pinSpacing: true,
      pinType: 'fixed',
      scrub: SCRUB,
      animation: tl,
      anticipatePin: 1,
      refreshPriority: -2,
      snap: snap(),
      onToggle: function (self) { pinOn(self.isActive); }
    });
    motion.tweens.push(tl);
    motion.triggers.push(st);
    ticks.forEach(function (tick, n) { tick.style.opacity = n === 0 ? '1' : '0.35'; });
  }

  function bindGrowNarrow(section) {
    var steps = section.querySelectorAll('.cbx-s04__col, .cbx-s04__lines');
    var shown = -1;
    function show(i) {
      if (i === shown) return;
      shown = i;
      Array.prototype.forEach.call(steps, function (node, n) {
        node.classList.toggle('is-on', n === i);
      });
    }
    show(0);
    var st = window.ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: function () { return '+=' + Math.round(window.innerHeight * 6); },
      pin: true,
      pinSpacing: true,
      pinType: 'fixed',
      refreshPriority: -2,
      onToggle: function (self) { pinOn(self.isActive); },
      onUpdate: function (self) {
        show(Math.max(0, Math.min(steps.length - 1, Math.floor(self.progress * steps.length))));
      }
    });
    motion.triggers.push(st);
  }

  function bindRole(section) {
    var gsap = window.gsap;
    fillIllos(section);
    fit(section);
    if (motion.reduce || !gsap) {
      section.classList.add('is-static');
      return;
    }
    var illos = section.querySelectorAll('.cbx-s06__illo');
    var strikes = section.querySelectorAll('.cbx-s06__strike');
    var answers = section.querySelectorAll('.cbx-s06__a');
    var worry = section.querySelector('.is-worry');
    var role = section.querySelector('.is-role');
    var rows = section.querySelectorAll('.cbx-s06__row');
    gsap.set(illos, { y: 40, opacity: 0 });
    gsap.set(strikes, { scaleX: 0, transformOrigin: '0 50%' });
    gsap.set(answers, { opacity: 0, y: 16 });
    gsap.set(role, { opacity: 0, y: 40 });
    var tl = gsap.timeline({ paused: true });
    tl.to(illos, { y: 0, opacity: 1, duration: 1, ease: 'power3.out', stagger: 0.15 }, 0.2);
    tl.to(strikes, { scaleX: 1, duration: 0.6, ease: 'sine.inOut', stagger: 0.1 }, 1.1);
    tl.to(answers, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.1 }, 1.5);
    tl.to({}, { duration: 2.2 }, 2.2);
    tl.to(worry, { x: -80, opacity: 0, duration: 0.85, ease: 'power2.inOut' }, 4.4);
    tl.to(role, { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out' }, 4.7);
    tl.fromTo(rows, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.08, ease: 'power3.out' }, 5.1);
    tl.to({}, { duration: 2.4 }, 6.0);
    var st = window.ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: function () { return '+=' + Math.round(tl.duration() * PX); },
      pin: true,
      pinSpacing: true,
      pinType: 'fixed',
      scrub: SCRUB,
      animation: tl,
      anticipatePin: 1,
      refreshPriority: -4,
      snap: snap(),
      onToggle: function (self) { pinOn(self.isActive); }
    });
    motion.tweens.push(tl);
    motion.triggers.push(st);
  }

  function curtainColor() {
    var html = document.documentElement;
    if (html.classList.contains('is-multiverse') && html.classList.contains('is-print')) return '#f3eee4';
    if (html.classList.contains('is-multiverse') && html.classList.contains('is-dark')) return '#0e1018';
    return '#1E1510';
  }

  function bindEnd(section) {
    var gsap = window.gsap;
    var sheet = section.querySelector('.cbx-end__sheet');
    sheet.style.background = curtainColor();
    if (motion.reduce || !gsap) {
      section.classList.add('is-static');
      gsap && gsap.set(sheet, { y: '0%' });
      return;
    }
    gsap.set(sheet, { y: '100%' });
    var tl = gsap.timeline({ paused: true });
    tl.to(sheet, { y: '0%', duration: 0.9, ease: 'power3.inOut' }, 0);
    tl.to({}, { duration: 0.45 }, 0.9);
    var jumped = false;
    var st = window.ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: function () { return '+=' + Math.round(tl.duration() * PX); },
      pin: true,
      pinSpacing: true,
      pinType: 'fixed',
      scrub: SCRUB,
      animation: tl,
      anticipatePin: 1,
      refreshPriority: -5,
      snap: snap(),
      onToggle: function (self) { pinOn(self.isActive); },
      onLeave: function (self) {
        if (jumped || self.direction < 0) return;
        var max = document.documentElement.scrollHeight - window.innerHeight;
        if (window.scrollY < max - 120) return;
        jumped = true;
        window.dispatchEvent(new CustomEvent('cbx-open-next'));
      }
    });
    motion.tweens.push(tl);
    motion.triggers.push(st);
  }

  function build(world) {
    if (!world) return;
    world.appendChild(buildGrow());
    if (window.Cbx300Answers && window.Cbx300Answers.build) {
      world.appendChild(window.Cbx300Answers.build({
        chapters: TRUST,
        num: '05',
        title: 'Trust and team',
        attr: 'data-cbx-trust',
        aria: 'Trust and team',
        refreshPriority: -3
      }));
    }
    world.appendChild(buildRole());
    world.appendChild(buildEnd());
  }

  function kill() {
    pinOn(false);
    motion.tweens.forEach(function (tl) { if (tl && tl.kill) tl.kill(); });
    motion.triggers.forEach(function (st) { if (st && st.kill) st.kill(); });
    motion.tweens = [];
    motion.triggers = [];
  }

  function bind(world, opts) {
    kill();
    opts = opts || {};
    motion.reduce = !!(opts.reduce || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches));
    var grow = world && world.querySelector('[data-cbx-grow]');
    var role = world && world.querySelector('[data-cbx-role]');
    var end = world && world.querySelector('[data-cbx-end]');
    if (grow) bindGrow(grow);
    if (role) bindRole(role);
    if (end) bindEnd(end);
  }

  return { build: build, bind: bind, kill: kill };
})();
