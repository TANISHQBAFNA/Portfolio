/**
 * CBX300 case pages — copy and slots from docs/case-study-cbx300-build-brief.md.
 *
 * Swap Figma exports later:
 * 1. Drop PNGs/WebPs into assets/img/cbx300/ using the `file` name on each slot.
 * 2. Set that slot's `src` to the same path (leave `src` empty until the file exists).
 * 3. Keep `brief` + `nodes` so the pending label stays accurate if a file 404s.
 * Do not invent metrics. Lisa Charlie is a demo brand only.
 */
window.Cbx300Case = (function () {
  'use strict';

  var FILE_ROOT = 'assets/img/cbx300/';

  var META = {
    hook: 'Banking for a business, not a person.',
    sub: 'Designing CBX300 — SME banking across web and mobile',
    role: 'Lead product designer — design system, end-to-end screens (web + mobile), through developer handoff',
    duration: 'Jan 2026 – present',
    status: 'Design system complete; majority of functional screens and full user flows designed through handoff (ongoing)',
    proof: '259 web · 377 mobile · ~147 flows',
    proofLine: 'CBX300 · web + mobile · 636 screens · Lisa Charlie demo brand',
    demo: 'Lisa Charlie bank is a demo brand, not a live client.',
    footnote: 'Built with a shared token set and a freeze protocol before handoff.'
  };

  var PAGES = [
    {
      id: 'cover',
      tab: 'Cover',
      beat: '',
      pin: false,
      layout: 'cover'
    },
    {
      id: 'ladder',
      tab: 'Ladder',
      beat: '01 · Ladder',
      pin: true,
      claim: 'SME is a ladder, not five products.',
      sentence: 'Banks sell “SME”; freelancers and mid-market finance teams are stages of the same customer.',
      thread: 'If they are one customer, who signs in?',
      frames: [
        { brief: 2, kind: 'ladder', file: FILE_ROOT + '02-ladder.svg', src: '', nodes: 'drawn', caption: 'These are not five audiences. They are five stages of the same customer.' },
        { brief: 3, kind: 'pair', file: FILE_ROOT + '03-same-screen.webp', src: '', nodes: '29599:151564 + 21058:88167', caption: 'The same layout has to work for a business with no accounts and a business with four.', pair: [
          { brief: 3, file: FILE_ROOT + '03a-accounts-detail.webp', src: '', nodes: '29599:151564', shape: 'web' },
          { brief: 3, file: FILE_ROOT + '03b-accounts-form.webp', src: '', nodes: '21058:88167', shape: 'web' }
        ] }
      ]
    },
    {
      id: 'roles',
      tab: 'Roles',
      beat: '02 · Roles',
      pin: true,
      claim: 'Three roles: owner, maker, approver.',
      sentence: 'Roles, not job titles. Same three people can be one login or three.',
      thread: 'If three people touch money, where does approval live?',
      roles: [
        { title: 'Owner', body: 'Needs one honest cash answer.', device: 'Web desk' },
        { title: 'Maker', body: 'Needs speed and no re-typing.', device: 'Web desk' },
        { title: 'Approver', body: 'Needs the queue clear on a phone.', device: 'Mobile gaps' }
      ],
      frames: [
        { brief: 4, kind: 'roles', file: FILE_ROOT + '04-roles.webp', src: '', nodes: 'drawn / annotate', caption: 'One person in a freelance business. Three people with three permission sets in a medium one.' },
        { brief: 4, kind: 'pair', optional: true, file: FILE_ROOT + '04-devices.webp', src: '', nodes: '39409:121739 · 14430:56021', caption: 'Web dashboard beside mobile portfolio — same three roles, two devices.', pair: [
          { brief: 4, file: FILE_ROOT + '04a-web-dashboard.webp', src: '', nodes: '39409:121739', shape: 'web' },
          { brief: 4, file: FILE_ROOT + '04b-mobile-portfolio.webp', src: '', nodes: '14430:56021', shape: 'phone' }
        ] }
      ]
    },
    {
      id: 'approvals',
      tab: 'Approvals',
      beat: '03 · Approvals',
      pin: true,
      claim: 'Approvals are the job, not a notification.',
      sentence: 'Approving is work with an address: a front door, then a batch that still shows every line.',
      thread: 'Once you can approve, which number is true?',
      frames: [
        { brief: 6, kind: 'pair', file: FILE_ROOT + '06-approvals-nav.webp', src: '', nodes: '39409:121739 + 14430:56021', caption: 'On both platforms, approval has a permanent address. It is never something you have to go looking for.', pair: [
          { brief: 6, file: FILE_ROOT + '06a-web-pending.webp', src: '', nodes: '39409:121739 · Pending Approval · 15', shape: 'web' },
          { brief: 6, file: FILE_ROOT + '06b-mobile-task.webp', src: '', nodes: '14430:56021 · Task tab with dot', shape: 'phone' }
        ] },
        { brief: 7, kind: 'export', shape: 'web', file: FILE_ROOT + '07-web-batch.webp', src: '', nodes: '36784:110703', caption: 'The action is labelled with the number it will perform. No one approves a mystery quantity.' },
        { brief: 8, kind: 'export', shape: 'phone', file: FILE_ROOT + '08-mobile-batch.webp', src: '', nodes: '11906:24389', caption: 'On mobile the whole screen changes mode, and the actions sit in thumb reach.' }
      ],
      ruled: 'Ruled out: select-all with no per-row visibility — approval is a legal act.'
    },
    {
      id: 'money',
      tab: 'Money',
      beat: '04 · Money',
      pin: true,
      claim: 'Money needs honest numbers.',
      sentence: 'Trust lands before the signature. Balance is not one number.',
      thread: 'Who is allowed to do which verb on that money?',
      frames: [
        { brief: 9, kind: 'export', shape: 'wide', file: FILE_ROOT + '09-validation.webp', src: '', nodes: 'Approvals crop · Total 128 Transactions · 3 Failed System Validation', caption: 'Three bad rows in a file of 128, surfaced before the approver signs rather than after.' },
        { brief: 10, kind: 'export', shape: 'web', file: FILE_ROOT + '10-balances.webp', src: '', nodes: '21058:88167 · spendable / booked / blocked / pending', caption: '“Balance” is four different numbers to a business. Showing one of them would be a lie.' }
      ],
      note: 'A mode that reframes the product, not a second menu tree. Conventional | Islamic as a top-bar mode — export pair with Islamic Accounts Portfolio 40799:120879 if used.'
    },
    {
      id: 'permissions',
      tab: 'Permissions',
      beat: '05 · Permissions',
      pin: true,
      claim: 'Permissions as a grid of verbs.',
      sentence: 'Initiate, Verify, Inquire, Release, Authorize — visible instead of remembered.',
      thread: 'After they act, how does every flow end?',
      frames: [
        { brief: 11, kind: 'export', shape: 'wide', file: FILE_ROOT + '11-matrix.webp', src: '', nodes: '39899:119009', caption: 'Initiate, Verify, Inquire, Release, Authorize — for every function, scoped to specific accounts. Visible instead of remembered.' },
        { brief: 12, kind: 'export', shape: 'wide', file: FILE_ROOT + '12-matrix-solo.webp', src: '', nodes: 'compose · same matrix for one-person business', caption: 'The same screen serves one freelancer and a fourteen-person finance team.' }
      ],
      ruled: 'Ruled out: wizard, one question per screen — collapses at fifty permissions.'
    },
    {
      id: 'grammar',
      tab: 'Grammar',
      beat: '06 · Grammar',
      pin: true,
      claim: 'Same ending every time.',
      sentence: 'Learn the ending once. Empty is week one, designed — not an apology.',
      thread: 'What did that grammar produce?',
      frames: [
        { brief: 14, kind: 'triple', file: FILE_ROOT + '14-three-beats.webp', src: '', nodes: '22789:130771 → 22789:130642 → 22789:130678', caption: 'Every money flow ends the same three ways. Learn it once, trust it everywhere.', triple: [
          { brief: 14, file: FILE_ROOT + '14a-review.webp', src: '', nodes: '22789:130771', shape: 'web', label: 'Review' },
          { brief: 14, file: FILE_ROOT + '14b-otp.webp', src: '', nodes: '22789:130642', shape: 'web', label: 'OTP' },
          { brief: 14, file: FILE_ROOT + '14c-outcome.webp', src: '', nodes: '22789:130678', shape: 'web', label: 'Outcome' }
        ] },
        { brief: 15, kind: 'grid', file: FILE_ROOT + '15-empty-grid.webp', src: '', nodes: '15050:52766, 15050:53061, 15253:50431, 14295:48651', caption: 'Week one for every new customer. Each one offers the next action instead of apologising.', grid: [
          { brief: 15, file: FILE_ROOT + '15a-empty.webp', src: '', nodes: '15050:52766', shape: 'phone' },
          { brief: 15, file: FILE_ROOT + '15b-empty.webp', src: '', nodes: '15050:53061', shape: 'phone' },
          { brief: 15, file: FILE_ROOT + '15c-empty.webp', src: '', nodes: '15253:50431', shape: 'phone' },
          { brief: 15, file: FILE_ROOT + '15d-empty.webp', src: '', nodes: '14295:48651', shape: 'phone' }
        ] },
        { brief: 16, kind: 'export', optional: true, shape: 'wide', file: FILE_ROOT + '16-grid-overlay.webp', src: '', nodes: '22789:130771 + overlay · 256 sidebar, 3×464 columns', caption: 'Three columns. The right one holds balances and offers, never questions.' }
      ]
    },
    {
      id: 'scale',
      tab: 'Close',
      beat: '07 · Close',
      pin: false,
      claim: '259 web screens. 377 mobile screens. One grammar.',
      sentence: 'That volume is the finding. Results stay blank until real numbers exist.',
      finding: true,
      frames: [
        { brief: 18, kind: 'sheet', file: FILE_ROOT + '18-contact-sheet.webp', src: '', nodes: 'Screens · All Journeys contact sheet', caption: '259 web screens. 377 mobile screens. One grammar.' },
        { brief: 17, kind: 'export', optional: true, shape: 'wide', file: FILE_ROOT + '17-system-poster.webp', src: '', nodes: '8513:18195 + 18799:2', caption: 'One system, two platforms, multiple banks. Consistency generated rather than reviewed.' }
      ],
      next: [
        'Validate entitlements with real admins.',
        'Instrument the approval queue.',
        'Push minimum-data further.',
        'Close the tokens-to-code loop.'
      ],
      footnote: true
    }
  ];

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null && text !== '') node.textContent = text;
    return node;
  }

  function pendingCopy(slot) {
    var wrap = el('div', 'case-pending');
    wrap.appendChild(el('p', 'case-pending__title', 'Exports pending'));
    wrap.appendChild(el('p', 'case-pending__meta', 'Brief image ' + slot.brief + (slot.nodes ? ' · Figma ' + slot.nodes : '')));
    return wrap;
  }

  function errorCopy(slot) {
    var wrap = el('div', 'case-error');
    wrap.hidden = true;
    wrap.appendChild(el('p', 'case-error__title', 'Couldn’t load this frame'));
    wrap.appendChild(el('p', 'case-error__meta', 'Brief image ' + slot.brief + (slot.nodes ? ' · ' + slot.nodes : '')));
    var retry = el('button', 'case-retry', 'Retry');
    retry.type = 'button';
    wrap.appendChild(retry);
    return wrap;
  }

  function silhouettes(shape) {
    var frag = document.createDocumentFragment();
    if (shape === 'compose') {
      frag.appendChild(el('span', 'case-sil case-sil--web'));
      frag.appendChild(el('span', 'case-sil case-sil--phone'));
      return frag;
    }
    frag.appendChild(el('span', 'case-sil'));
    return frag;
  }

  function wireImage(img, pending, error, slot) {
    var retry = error.querySelector('.case-retry');
    function showPending() {
      pending.hidden = false;
      error.hidden = true;
      img.hidden = true;
    }
    function showError() {
      pending.hidden = true;
      error.hidden = false;
      img.hidden = true;
    }
    function showImg() {
      pending.hidden = true;
      error.hidden = true;
      img.hidden = false;
    }
    if (!slot.src) {
      showPending();
      return;
    }
    img.addEventListener('load', showImg);
    img.addEventListener('error', showError);
    if (retry) {
      retry.addEventListener('click', function () {
        showPending();
        img.src = slot.src + (slot.src.indexOf('?') >= 0 ? '&' : '?') + 'retry=' + Date.now();
      });
    }
    img.src = slot.src;
  }

  function makeSlot(slot, nested) {
    slot = slot || {};
    var figure = el('figure', 'case-frame');
    if (!nested) figure.setAttribute('data-case-frame', '');
    figure.setAttribute('data-brief', String(slot.brief || ''));
    if (slot.nodes) figure.setAttribute('data-figma', slot.nodes);
    if (slot.file) figure.setAttribute('data-case-file', slot.file);
    var shape = slot.shape || (slot.kind === 'export' ? 'wide' : slot.kind === 'compose' ? 'compose' : 'wide');
    if (slot.kind === 'export' || slot.kind === 'compose') figure.classList.add('case-frame--' + shape);
    if (slot.shape) figure.classList.add('case-frame--' + slot.shape);

    var box = el('div', 'case-frame__slot');
    box.appendChild(silhouettes(slot.shape === 'phone' ? 'phone' : slot.kind === 'compose' || slot.shape === 'compose' ? 'compose' : 'web'));
    var img = document.createElement('img');
    img.alt = slot.alt || '';
    img.hidden = true;
    img.decoding = 'async';
    if (slot.priority) img.setAttribute('fetchpriority', 'high');
    else img.loading = 'lazy';
    var pending = pendingCopy(slot);
    var error = errorCopy(slot);
    box.appendChild(img);
    box.appendChild(pending);
    box.appendChild(error);
    figure.appendChild(box);
    if (slot.label) {
      figure.appendChild(el('p', 'case-role__device', slot.label));
    }
    if (slot.caption) {
      var cap = el('figcaption', 'case-caption', slot.caption);
      cap.setAttribute('data-case-caption', '');
      figure.appendChild(cap);
    }
    wireImage(img, pending, error, slot);
    return figure;
  }

  function ladderSvg() {
    var stages = [
      { name: 'Freelancer', who: 'One person' },
      { name: 'Sole prop', who: 'One or two' },
      { name: 'Micro', who: 'A few' },
      { name: 'Small', who: 'A team' },
      { name: 'Medium', who: 'A finance team' }
    ];
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 1000 220');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Five stages of the same SME customer on one platform');
    var ns = 'http://www.w3.org/2000/svg';
    function node(name, attrs, text) {
      var n = document.createElementNS(ns, name);
      Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
      if (text) n.textContent = text;
      return n;
    }
    svg.appendChild(node('rect', { x: '24', y: '168', width: '952', height: '28', rx: '4', fill: '#00a0a0' }));
    svg.appendChild(node('text', { x: '500', y: '187', 'text-anchor': 'middle', fill: '#f4efe6', 'font-family': 'Syne, sans-serif', 'font-size': '14', 'font-weight': '700' }, 'One platform'));
    stages.forEach(function (stage, i) {
      var x = 40 + i * 192;
      var g = node('g', { 'data-focus-item': i === 0 || i === stages.length - 1 ? 'end' : 'mid' });
      g.appendChild(node('text', { x: String(x + 80), y: '36', 'text-anchor': 'middle', fill: 'currentColor', 'font-family': 'Outfit, sans-serif', 'font-size': '13' }, stage.who));
      g.appendChild(node('rect', { x: String(x), y: '52', width: '160', height: '88', rx: '6', fill: '#f3f4f6', stroke: 'rgba(30,21,16,0.12)' }));
      g.appendChild(node('text', { x: String(x + 80), y: '104', 'text-anchor': 'middle', fill: '#1E1510', 'font-family': 'Syne, sans-serif', 'font-size': '16', 'font-weight': '800' }, stage.name));
      svg.appendChild(g);
      if (i < stages.length - 1) {
        svg.appendChild(node('path', { d: 'M' + (x + 168) + ' 96 H' + (x + 192), stroke: '#00a0a0', 'stroke-width': '2', fill: 'none' }));
      }
    });
    return svg;
  }

  function makeLadderFrame(slot) {
    var figure = el('figure', 'case-frame');
    figure.setAttribute('data-case-frame', '');
    figure.setAttribute('data-brief', String(slot.brief));
    var board = el('div', 'case-ladder');
    board.appendChild(ladderSvg());
    figure.appendChild(board);
    var cap = el('figcaption', 'case-caption', slot.caption);
    cap.setAttribute('data-case-caption', '');
    figure.appendChild(cap);
    return figure;
  }

  function appendFrames(parent, frames) {
    (frames || []).forEach(function (slot) {
      if (slot.kind === 'ladder') {
        parent.appendChild(makeLadderFrame(slot));
        return;
      }
      if (slot.kind === 'roles') {
        return;
      }
      if (slot.kind === 'pair' && slot.pair) {
        var pair = el('div', 'case-pair');
        pair.setAttribute('data-case-frame', '');
        slot.pair.forEach(function (item, i) {
          var fig = makeSlot(item, true);
          fig.setAttribute('data-focus-item', i === 0 ? 'end' : 'end');
          pair.appendChild(fig);
        });
        if (slot.caption) {
          var cap = el('figcaption', 'case-caption', slot.caption);
          cap.setAttribute('data-case-caption', '');
          pair.appendChild(cap);
        }
        parent.appendChild(pair);
        return;
      }
      if (slot.kind === 'triple' && slot.triple) {
        var triple = el('div', 'case-triple');
        triple.setAttribute('data-case-frame', '');
        slot.triple.forEach(function (item, i) {
          var fig = makeSlot(item, true);
          fig.setAttribute('data-focus-item', String(i));
          triple.appendChild(fig);
        });
        if (slot.caption) {
          var tcap = el('figcaption', 'case-caption', slot.caption);
          tcap.setAttribute('data-case-caption', '');
          triple.appendChild(tcap);
        }
        parent.appendChild(triple);
        return;
      }
      if (slot.kind === 'grid' && slot.grid) {
        var grid = el('div', 'case-empty-grid');
        grid.setAttribute('data-case-frame', '');
        slot.grid.forEach(function (item) { grid.appendChild(makeSlot(item, true)); });
        if (slot.caption) {
          var gcap = el('figcaption', 'case-caption', slot.caption);
          gcap.setAttribute('data-case-caption', '');
          grid.appendChild(gcap);
        }
        parent.appendChild(grid);
        return;
      }
      if (slot.kind === 'sheet') {
        var sheet = el('div', 'case-scale-sheet');
        sheet.setAttribute('data-case-frame', '');
        var i;
        for (i = 0; i < 12; i++) {
          sheet.appendChild(makeSlot({
            brief: 18,
            file: slot.file,
            src: slot.src,
            nodes: slot.nodes,
            shape: i % 5 === 0 ? 'phone' : 'web'
          }, true));
        }
        if (slot.caption) {
          var scap = el('figcaption', 'case-caption', slot.caption);
          scap.setAttribute('data-case-caption', '');
          sheet.appendChild(scap);
        }
        parent.appendChild(sheet);
        return;
      }
      parent.appendChild(makeSlot(slot));
    });
  }

  function makeCover() {
    var page = el('section', 'case-page case-page--cover');
    page.setAttribute('data-case-page', 'cover');
    page.setAttribute('data-scene', 'cover');
    page.setAttribute('data-pin', 'false');
    page.setAttribute('aria-label', 'Cover');

    var hold = el('div', 'case-hold');
    hold.setAttribute('data-case-hold', '');

    var type = el('div', 'case-cover__type');
    var hook = el('h1', 'case-hook', META.hook);
    hook.setAttribute('data-case-claim', '');
    type.appendChild(hook);
    type.appendChild(el('p', 'case-sub', META.sub));
    var meta = el('ul', 'case-meta');
    [
      ['Role', META.role],
      ['Duration', META.duration],
      ['Status', META.status]
    ].forEach(function (row) {
      var li = el('li');
      li.appendChild(el('span', '', row[0]));
      li.appendChild(el('strong', '', row[1]));
      meta.appendChild(li);
    });
    type.appendChild(meta);
    type.appendChild(el('p', 'case-proof', META.proof));
    type.appendChild(el('p', 'case-demo', META.demo + ' ' + META.proofLine));

    var devices = el('div', 'case-cover__devices');
    devices.setAttribute('data-case-frame', '');
    devices.setAttribute('data-brief', '1');
    devices.setAttribute('data-figma', '39409:121739 + 14430:56021');
    devices.setAttribute('data-case-file', FILE_ROOT + '01-cover.webp');
    var web = makeSlot({
      brief: 1,
      file: FILE_ROOT + '01-cover-web.webp',
      src: '',
      nodes: '39409:121739',
      shape: 'web',
      priority: true,
      alt: 'CBX300 web dashboard, export pending'
    }, true);
    web.classList.add('case-cover__web');
    var phone = makeSlot({
      brief: 1,
      file: FILE_ROOT + '01-cover-mobile.webp',
      src: '',
      nodes: '14430:56021',
      shape: 'phone',
      priority: true,
      alt: 'CBX300 mobile dashboard, export pending'
    }, true);
    phone.classList.add('case-cover__phone');
    devices.appendChild(web);
    devices.appendChild(phone);
    var composeCap = el('p', 'case-caption', 'CBX300 — SME banking across web and mobile. 636 screens, one system.');
    composeCap.setAttribute('data-case-caption', '');
    devices.appendChild(composeCap);

    hold.appendChild(type);
    hold.appendChild(devices);
    page.appendChild(hold);
    return page;
  }

  function makeChapter(page) {
    if (page.layout === 'cover') return makeCover();
    var section = el('section', 'case-page' + (page.finding ? ' case-page--end' : ''));
    section.setAttribute('data-case-page', page.id);
    section.setAttribute('data-scene', page.id);
    section.setAttribute('data-pin', page.pin === false ? 'false' : 'true');
    section.setAttribute('aria-label', page.beat || page.claim || page.tab);

    var hold = el('div', 'case-hold');
    hold.setAttribute('data-case-hold', '');

    var copy = el('div', 'case-copy');
    copy.setAttribute('data-case-copy', '');
    if (page.beat) copy.appendChild(el('p', 'case-beat', page.beat));
    var claim = el('h2', 'case-claim', page.claim);
    claim.setAttribute('data-case-claim', '');
    copy.appendChild(claim);
    if (page.sentence) copy.appendChild(el('p', 'case-sentence', page.sentence));
    if (page.thread) copy.appendChild(el('p', 'case-thread', page.thread));

    var viz = el('div', 'case-viz');
    viz.setAttribute('data-case-viz', '');

    if (page.roles) {
      var roles = el('div', 'case-roles');
      roles.setAttribute('data-case-frame', '');
      page.roles.forEach(function (role, i) {
        var card = el('article', 'case-role');
        card.setAttribute('data-focus-item', String(i));
        card.appendChild(el('h3', '', role.title));
        card.appendChild(el('p', '', role.body));
        card.appendChild(el('p', 'case-role__device', role.device));
        roles.appendChild(card);
      });
      var roleCap = el('p', 'case-caption', 'One person in a freelance business. Three people with three permission sets in a medium one.');
      roleCap.setAttribute('data-case-caption', '');
      roles.appendChild(roleCap);
      viz.appendChild(roles);
    }

    appendFrames(viz, page.frames);

    if (page.ruled) copy.appendChild(el('p', 'case-ruled', page.ruled));
    if (page.note) copy.appendChild(el('p', 'case-note', page.note));
    if (page.next) {
      var list = el('ul', 'case-next');
      page.next.forEach(function (item) { list.appendChild(el('li', '', item)); });
      viz.appendChild(list);
    }
    if (page.footnote) viz.appendChild(el('p', 'case-footnote', META.footnote));

    if (page.finding) {
      var row = el('div', 'case-end-row');
      var back = el('button', 'study__end-btn', 'Back to work');
      back.type = 'button';
      back.setAttribute('data-study-close', '');
      row.appendChild(back);
      viz.appendChild(row);
    }

    hold.appendChild(copy);
    hold.appendChild(viz);
    section.appendChild(hold);
    return section;
  }

  function makeTabs(onPick) {
    var nav = el('nav', 'case-tabs');
    nav.setAttribute('aria-label', 'Case pages');
    nav.appendChild(el('p', 'case-tabs__label', 'Pages'));
    PAGES.forEach(function (page, i) {
      var btn = el('button', i === 0 ? 'is-on' : '', page.tab);
      btn.type = 'button';
      btn.setAttribute('data-case-tab', page.id);
      btn.addEventListener('click', function () {
        Array.prototype.forEach.call(nav.querySelectorAll('button'), function (b) {
          b.classList.toggle('is-on', b === btn);
        });
        onPick(page.id);
      });
      nav.appendChild(btn);
    });
    return nav;
  }

  function mount(world, project) {
    if (!world) return null;
    world.innerHTML = '';
    world.removeAttribute('hidden');
    var shell = el('div', 'case-shell');
    var pages = el('div', 'case-pages');
    var kitRef = { goTo: function () {} };
    var tabs = makeTabs(function (id) { kitRef.goTo(id); });
    PAGES.forEach(function (page) { pages.appendChild(makeChapter(page)); });
    shell.appendChild(tabs);
    shell.appendChild(pages);
    world.appendChild(shell);
    world._cbxTabs = tabs;
    world._cbxGo = kitRef;
    if (project) world.setAttribute('data-case-project', project.title || 'CBX300');
    return {
      pages: PAGES,
      setKit: function (kit) {
        kitRef.goTo = function (id) {
          if (kit && kit.goTo) kit.goTo(id);
        };
      },
      syncTab: function (id) {
        Array.prototype.forEach.call(tabs.querySelectorAll('button'), function (b) {
          b.classList.toggle('is-on', b.getAttribute('data-case-tab') === id);
        });
      }
    };
  }

  return {
    META: META,
    PAGES: PAGES,
    FILE_ROOT: FILE_ROOT,
    mount: mount
  };
})();
