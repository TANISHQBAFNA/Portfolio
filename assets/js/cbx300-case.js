/**
 * CBX300 cream scroll film — Echo 8-beat Aisha story.
 * Beats 1–4 proof: static Iris stills (PNG/WebP) at
 * assets/img/cbx300/aisha-stage-0{1-4}-*.webp. Image slots, not a WebGL runtime.
 * Cover / devices / corporate / close stay designed placeholders.
 * Lisa Charlie is a demo brand. Aisha is a representative story, not a real interview.
 * No invented quotes or outcomes.
 */
window.Cbx300Case = (function () {
  'use strict';

  var META = {
    hook: 'Banking that grows with the business.',
    promise: 'CBX300 helps business owners understand money, make payments safely, approve work, and manage team access as the business grows.',
    product: 'CBX300 · web + phone · 259 web · 377 mobile · ~147 flows · demo brand: Lisa Charlie',
    role: 'Lead product designer. Design system, end-to-end screens (web + phone), through developer handoff',
    duration: 'Jan 2026 - present',
    status: 'Design system complete. Majority of functional screens and full user flows designed through handoff.',
    demo: 'Lisa Charlie bank is a demo brand. Aisha is a representative example, not a real customer interview.',
    finding: 'A bank she does not outgrow.',
    volume: '259 web screens. 377 mobile screens. ~147 flows. One shared system.',
    figma: 'Beats 1–4 stills are an Iris art-pass (static 3D renders). Product frames stay designed placeholders until Figma exports land.'
  };

  var IRIS_STILL = {
    freelancer: {
      src: 'assets/img/cbx300/aisha-stage-01-freelancer.webp',
      alt: 'Clay cutout of Aisha standing alone. Stage 01 freelancer. Aisha works alone.'
    },
    sole: {
      src: 'assets/img/cbx300/aisha-stage-02-soleprop.webp',
      alt: 'Clay cutout of Aisha standing alone. Stage 02 sole proprietor. One-person business.'
    },
    ten: {
      src: 'assets/img/cbx300/aisha-stage-03-team10.webp',
      alt: 'Clay cutouts of Aisha and three teammates. Stage 03 small office, about ten people.'
    },
    mid: {
      src: 'assets/img/cbx300/aisha-stage-04-midsize.webp',
      alt: 'Clay cutouts of Aisha and three teammates. Stage 04 mid-size. Growing company.'
    }
  };

  var STAGES = [
    { id: 'freelancer', num: '01', name: 'Freelancer', need: 'Did I get paid. Can I pay.' },
    { id: 'sole', num: '02', name: 'Sole prop', need: 'How much can I safely spend.' },
    { id: 'ten', num: '03', name: '~10 people', need: 'Prepare is not approve.' },
    { id: 'mid', num: '04', name: 'Mid-size', need: 'Control room. Safe handoffs.' }
  ];

  var BEATS = [
    {
      id: 'cover',
      num: '',
      title: META.hook,
      body: 'SME is a ladder. One product. Complexity shows up only when the business needs it.',
      recipe: 'kenburns',
      pin: true,
      layout: 'cover',
      decision: {
        kind: 'Finding',
        finding: 'Banks sell SME as one audience. Day to day it is a ladder of stages.',
        choice: 'One product, not five separate banks. Complexity shows up only when the business needs it.',
        ui: 'Title holds. A short ladder strip ken-burns across the stages.'
      },
      captions: [
        'Four stages of the same customer sit on one strip. The product does not split with them.'
      ]
    },
    {
      id: 'freelancer',
      num: '01',
      title: 'Did I get paid. Can I pay.',
      body: 'One person wears every hat. The basics have to finish on a phone.',
      recipe: 'phone',
      pin: true,
      decision: {
        kind: 'Finding',
        finding: 'One person does every financial job. The questions are did I get paid, and can I pay.',
        choice: 'Mobile-complete basics. Pay and get paid finish without a desk.',
        ui: 'Phone frame. Two faces: get paid, then pay.'
      },
      captions: [
        'Incoming sits large on the phone. The amount is the job.',
        'Pay uses the same frame. Thumb reach, not a shrunk desktop.'
      ],
      ask: 'When the books get messier, what number is safe to spend?'
    },
    {
      id: 'sole',
      num: '02',
      title: 'How much can I safely spend.',
      body: 'A business account has more than one balance. Available leads because it answers what can be paid today.',
      recipe: 'moneyCrop',
      pin: true,
      decision: {
        kind: 'Finding',
        finding: 'One balance can hide held, booked, or uncleared money.',
        choice: 'Available leads because it answers what can be spent today. The beneficiary handoff stays visible.',
        ui: 'Four balances, available largest. Then the confirm-beneficiary card.',
        ruledOut: 'Ruled out: one big number, or a pre-fill that sends in the background.'
      },
      captions: [
        'Four balances on the card. Available is largest because it is spendable now.',
        'The beneficiary stays on screen. Suggested from the last payment to this supplier.'
      ],
      ask: 'When a teammate prepares the payment, where does approve live?'
    },
    {
      id: 'ten',
      num: '03',
      title: 'Prepare is not approve.',
      body: 'Approving is its own job. It needs its own door, a named count, and honest rows before anyone signs.',
      recipe: 'splitDoor',
      pin: true,
      decision: {
        kind: 'Finding',
        finding: 'Prepare is not approve. Submitted can look like completed.',
        choice: 'Approvals get their own door. Approve (6) names the count. Bad rows go red before sign.',
        ui: 'Door crop, then prepare and approve split. No fade between them.',
        ruledOut: 'Ruled out: bury under Payments, or select-all with no line of sight.'
      },
      captions: [
        'Approvals has its own door in the menu, with a waiting count.',
        'Prepare stays on the left. Approve (6) keeps every row visible on the right.',
        'Three bad rows in a file of 128 turn red before anyone signs.'
      ],
      ask: 'When the team is bigger, who is waiting on me, and who can do what?'
    },
    {
      id: 'mid',
      num: '04',
      title: 'Control room. Safe handoffs.',
      body: 'A finance lead needs a waiting-on-me queue, and a grid of verbs for who can start, check, view, send, or approve.',
      recipe: 'control',
      pin: true,
      decision: {
        kind: 'Finding',
        finding: 'A growing finance team needs a control room and safe handoffs, not a new product.',
        choice: 'A waiting-on-me queue for the person who signs, and a verb grid for access.',
        ui: 'Control room pin, then the permissions matrix draws cell by cell.',
        ruledOut: 'Ruled out: one question per screen.'
      },
      captions: [
        'Waiting on me is the queue. Salary file, vendor payout, supplier transfer.',
        'Permissions are verbs on one screen: start, check, view, send, approve.'
      ],
      ask: 'Same task tomorrow, on a phone. Does the meaning hold?'
    },
    {
      id: 'devices',
      num: '05',
      title: 'Same task. Device-fit.',
      body: 'Web is the workspace. Phone is the urgent check. The task stays the same. The layout changes.',
      recipe: 'morph',
      pin: true,
      decision: {
        kind: 'Finding',
        finding: 'The same task happens at a desk and on a phone. Shrinking the desktop loses the moment.',
        choice: 'Keep the meaning. Change the layout to fit the device.',
        ui: 'Web and phone of the same approval, morphing as you scroll.'
      },
      captions: [
        'On web, every row stays in view and Approve (6) names the count.',
        'On the phone, the same approval fills the screen. Actions sit in thumb reach.'
      ],
      ask: 'Does this stay a small-business bank, or does it put on corporate weight too soon?'
    },
    {
      id: 'corporate',
      num: '06',
      title: 'Control without day-one corporate weight.',
      body: 'Prepare and approve are the control. Extra chrome can wait until the business needs it.',
      recipe: 'splitWeight',
      pin: true,
      decision: {
        kind: 'Finding',
        finding: 'Control can look like a heavy corporate stack on day one.',
        choice: 'Keep prepare and approve. Leave the extra chrome until the business needs it.',
        ui: 'Light product beside a heavy stack. Scrub compares them.'
      },
      captions: [
        'Light: four doors, available first, approvals in the menu.',
        'Heavy: extra desks, policy panels, and chrome the business does not need yet.'
      ],
      ask: 'What does she keep as the ladder fills in?'
    },
    {
      id: 'close',
      num: '',
      title: META.finding,
      body: META.volume + ' Results stay blank until real numbers exist.',
      recipe: 'finding',
      pin: true,
      hold: 'short',
      finding: true,
      captions: [
        'Freelancer through mid-size, same product. A bank she does not outgrow.',
        'Aisha is a representative story. Lisa Charlie is the demo brand, not a live client.',
        'Iris 3D stills mark the ladder. Product frames stay placeholders until Figma exports land.'
      ],
      next: [
        'Test payment, approval, and access journeys with real business users.',
        'Measure time to complete key tasks and understand status.',
        'Track errors, abandoned steps, and support requests.',
        'Test whether web and phone tell the same clear story.'
      ]
    }
  ];

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null && text !== '') node.textContent = text;
    return node;
  }

  function paperNote(text) {
    return el('p', 'film-slot-note', text);
  }

  function captionStack(list) {
    var wrap = el('div', 'film-caption-stack');
    list.forEach(function (text, i) {
      var p = el('p', 'film-caption', text);
      p.setAttribute('data-caption', String(i));
      wrap.appendChild(p);
    });
    return wrap;
  }

  function decisionChip(d) {
    if (!d) return null;
    var aside = el('aside', 'film-decision');
    aside.setAttribute('data-film-decision', '');
    aside.appendChild(el('p', 'film-decision__label', d.kind || 'Finding'));
    aside.appendChild(el('p', 'film-decision__finding', d.finding));
    aside.appendChild(el('p', 'film-decision__choice-label', 'Choice'));
    aside.appendChild(el('p', 'film-decision__choice', d.choice));
    if (d.ui) {
      aside.appendChild(el('p', 'film-decision__ui-label', 'UI'));
      aside.appendChild(el('p', 'film-decision__ui', d.ui));
    }
    if (d.ruledOut) {
      var ruled = el('p', 'film-decision__ruled', d.ruledOut);
      ruled.setAttribute('data-film-ruled', '');
      aside.appendChild(ruled);
    }
    return aside;
  }

  function uiBand(mods) {
    return el('span', 'film-ui-band' + (mods ? ' ' + mods : ''));
  }

  function shot(name, node) {
    var wrap = el('div', 'film-shot');
    wrap.setAttribute('data-shot', name);
    wrap.appendChild(node);
    return wrap;
  }

  function irisSlot(label) {
    return paperNote(label + ' · export pending');
  }

  function irisStill(key) {
    var spec = IRIS_STILL[key];
    var fig = el('figure', 'film-iris');
    fig.setAttribute('data-iris-still', '');
    var img = el('img', 'film-iris__img');
    img.src = spec.src;
    img.alt = spec.alt;
    img.decoding = 'async';
    img.setAttribute('width', '1600');
    img.setAttribute('height', '900');
    var note = paperNote(spec.src.replace(/^.*\//, '') + ' · Iris drop-in');
    note.setAttribute('data-iris-drop', '');
    fig.appendChild(img);
    fig.appendChild(note);
    img.addEventListener('load', function () {
      note.hidden = true;
    });
    return fig;
  }

  function withIris(key, board) {
    var stage = el('div', 'film-iris-stage');
    var fig = irisStill(key);
    var img = fig.querySelector('img');
    stage.appendChild(fig);
    if (board) {
      board.className += (board.className ? ' ' : '') + 'film-iris-ghost';
      board.setAttribute('aria-hidden', 'true');
      stage.appendChild(board);
      if (img) {
        img.addEventListener('error', function () {
          fig.hidden = true;
          board.classList.remove('film-iris-ghost');
          board.removeAttribute('aria-hidden');
        });
      }
    }
    return stage;
  }

  function ladderStrip(complete) {
    var board = el('div', 'film-ladder-strip' + (complete ? ' is-complete' : ''));
    board.setAttribute('data-ladder-strip', '');
    var row = el('div', 'film-ladder-strip__row');
    STAGES.forEach(function (stage) {
      var card = el('article', 'film-rung film-paper');
      card.setAttribute('data-focus', stage.id);
      card.appendChild(el('span', 'film-rung__num', stage.num));
      card.appendChild(el('strong', '', stage.name));
      card.appendChild(el('p', '', stage.need));
      row.appendChild(card);
    });
    board.appendChild(row);
    var bar = el('div', 'film-ladder__bar');
    var fill = el('span', 'film-ladder__fill');
    fill.setAttribute('data-ladder-fill', '');
    if (complete) fill.classList.add('is-full');
    bar.appendChild(fill);
    var words = el('div', 'film-ladder__words');
    words.appendChild(el('span', '', 'One person'));
    words.appendChild(el('em', '', 'One platform'));
    words.appendChild(el('span', '', 'Finance team'));
    board.appendChild(bar);
    board.appendChild(words);
    board.appendChild(irisSlot('title+ladder'));
    return board;
  }

  function phonePayBoard() {
    var phone = el('div', 'film-phone-stage film-device film-device--phone film-paper film-bank');
    phone.setAttribute('data-phone-stage', '');
    var chrome = el('div', 'film-device__phone-bar');
    chrome.appendChild(el('span', 'film-device__pill'));
    phone.appendChild(chrome);
    var stage = el('div', 'film-phone-faces');
    var paid = el('div', 'film-pay-face film-pay-face--in');
    paid.setAttribute('data-pay-face', 'in');
    paid.setAttribute('data-focus', 'paid');
    paid.appendChild(el('p', 'film-ui-kicker', 'Get paid'));
    paid.appendChild(el('p', 'film-ui-figure', 'AED 8,640'));
    paid.appendChild(el('p', '', 'Invoice 1842 · Al Noor Distribution'));
    paid.appendChild(uiBand('film-ui-band--bank'));
    var pay = el('div', 'film-pay-face film-pay-face--out');
    pay.setAttribute('data-pay-face', 'out');
    pay.setAttribute('data-focus', 'pay');
    pay.appendChild(el('p', 'film-ui-kicker', 'Pay'));
    pay.appendChild(el('p', 'film-ui-figure film-ui-figure--sm', 'AED 2,150'));
    pay.appendChild(el('p', '', 'Supplier transfer · operating account'));
    var send = el('button', 'film-action', 'Send');
    send.type = 'button';
    send.tabIndex = -1;
    pay.appendChild(send);
    stage.appendChild(paid);
    stage.appendChild(pay);
    phone.appendChild(stage);
    phone.appendChild(irisSlot('phone pay'));
    return phone;
  }

  function balanceBoard() {
    var grid = el('div', 'film-balances film-bank');
    [
      { name: 'Available', note: 'What you can pay today', lead: true, fig: 'AED 184,220' },
      { name: 'Current', note: 'What the ledger says', lead: false, fig: 'AED 201,400' },
      { name: 'Held', note: 'Booked, not spendable', lead: false, fig: 'AED 12,480' },
      { name: 'Uncleared', note: 'Still on the way', lead: false, fig: 'AED 4,700' }
    ].forEach(function (item) {
      var card = el('article', 'film-balance film-paper' + (item.lead ? ' is-lead' : ''));
      card.setAttribute('data-focus', item.lead ? 'available' : item.name.toLowerCase());
      card.appendChild(el('strong', '', item.name));
      card.appendChild(el('p', 'film-ui-figure film-ui-figure--sm', item.fig));
      card.appendChild(el('span', '', item.note));
      if (item.lead) card.appendChild(uiBand('film-ui-band--bank'));
      grid.appendChild(card);
    });
    grid.appendChild(irisSlot('four-balance+beneficiary'));
    return grid;
  }

  function handoffBoard() {
    var board = el('div', 'film-board film-handoff film-bank');
    var card = el('article', 'film-confirm film-paper');
    card.setAttribute('data-focus', 'confirm');
    card.appendChild(el('p', 'film-ui-kicker', 'Confirm beneficiary'));
    card.appendChild(el('strong', '', 'Al Noor Distribution LLC'));
    card.appendChild(el('p', '', 'Account ··· 4419'));
    var msg = el('p', 'film-handoff__msg', 'Suggested from the last payment to this supplier. Check the name before you send.');
    msg.setAttribute('data-focus', 'prefill');
    card.appendChild(msg);
    board.appendChild(card);
    board.appendChild(irisSlot('four-balance+beneficiary'));
    return board;
  }

  function doorBoard() {
    var board = el('div', 'film-board film-nav');
    [
      { label: 'Home', door: false, count: '' },
      { label: 'Accounts', door: false, count: '' },
      { label: 'Approvals', door: true, count: '15' },
      { label: 'Payments', door: false, count: '' }
    ].forEach(function (item) {
      var row = el('div', 'film-nav__item film-paper' + (item.door ? ' is-door' : ''));
      row.setAttribute('data-focus', item.door ? 'door' : 'nav');
      row.appendChild(el('span', '', item.label));
      if (item.count) row.appendChild(el('span', 'film-nav__dot', item.count));
      board.appendChild(row);
    });
    return board;
  }

  function preparePane() {
    var wrap = el('div', 'film-split-pane film-split-pane--prepare film-bank');
    wrap.setAttribute('data-pane', 'prepare');
    wrap.appendChild(el('p', 'film-ui-kicker', 'Prepare'));
    var rows = el('div', 'film-rows');
    ['Vendor payout', 'Salary file', 'Supplier transfer', 'Tax payment'].forEach(function (label) {
      var row = el('div', 'film-row film-paper');
      row.appendChild(el('span', '', label));
      row.appendChild(el('span', '', 'Prepared'));
      rows.appendChild(row);
    });
    wrap.appendChild(rows);
    return wrap;
  }

  function approvePane() {
    var wrap = el('div', 'film-split-pane film-split-pane--approve film-bank');
    wrap.setAttribute('data-pane', 'approve');
    wrap.appendChild(el('p', 'film-ui-kicker', '128 transactions · 3 failed system validation'));
    var rows = el('div', 'film-rows');
    [
      { label: 'Row 12 · account missing', bad: true },
      { label: 'Row 44 · amount unreadable', bad: true },
      { label: 'Row 91 · duplicate line', bad: true },
      { label: 'Vendor payout', bad: false },
      { label: 'Supplier transfer', bad: false },
      { label: 'Tax payment', bad: false }
    ].forEach(function (item) {
      var row = el('div', 'film-row film-paper' + (item.bad ? ' is-bad' : ''));
      row.appendChild(el('span', '', item.label));
      row.appendChild(el('span', '', item.bad ? 'Failed' : 'Waiting'));
      rows.appendChild(row);
    });
    var action = el('button', 'film-action', 'Approve (6)');
    action.type = 'button';
    action.tabIndex = -1;
    wrap.appendChild(rows);
    wrap.appendChild(action);
    return wrap;
  }

  function splitDoorBoard() {
    var board = el('div', 'film-split-door');
    board.appendChild(doorBoard());
    var panes = el('div', 'film-split-panes');
    panes.setAttribute('data-split-panes', '');
    panes.appendChild(preparePane());
    panes.appendChild(approvePane());
    board.appendChild(panes);
    board.appendChild(irisSlot('approvals door+list'));
    return board;
  }

  function waitingBoard() {
    var board = el('div', 'film-waiting film-paper film-bank');
    board.setAttribute('data-waiting', '');
    board.appendChild(el('p', 'film-ui-kicker', 'Waiting on me'));
    board.appendChild(el('p', 'film-ui-figure film-ui-figure--sm', '3'));
    var rows = el('div', 'film-rows');
    [
      ['Salary file', '128 rows · 3 failed'],
      ['Vendor payout', 'AED 12,400'],
      ['Supplier transfer', 'Al Noor · operating']
    ].forEach(function (item) {
      var row = el('div', 'film-row film-paper');
      row.setAttribute('data-focus', 'wait');
      row.appendChild(el('span', '', item[0]));
      row.appendChild(el('span', '', item[1]));
      rows.appendChild(row);
    });
    board.appendChild(rows);
    return board;
  }

  function verbGrid() {
    var grid = el('div', 'film-grid film-paper');
    grid.setAttribute('data-shot', 'grid');
    ['', 'Start', 'Check', 'View', 'Send', 'Approve'].forEach(function (h) {
      var cell = el('span', 'film-grid__head', h);
      grid.appendChild(cell);
    });
    [
      { name: 'Payments', on: [1, 1, 1, 1, 1] },
      { name: 'Accounts', on: [0, 1, 1, 0, 0] },
      { name: 'Cards', on: [0, 0, 1, 0, 0] },
      { name: 'Approvals', on: [0, 1, 1, 0, 1] }
    ].forEach(function (row) {
      grid.appendChild(el('span', 'film-grid__fn', row.name));
      row.on.forEach(function (bit) {
        var cell = el('span', 'film-cell' + (bit ? '' : ' is-off'));
        grid.appendChild(cell);
      });
    });
    return grid;
  }

  function controlBoard() {
    var board = el('div', 'film-control');
    board.appendChild(waitingBoard());
    board.appendChild(verbGrid());
    board.appendChild(irisSlot('waiting-on-me+permissions'));
    return board;
  }

  function approveWeb() {
    var web = el('div', 'film-device film-device--web film-paper film-bank');
    web.setAttribute('data-morph', 'web');
    var bar = el('div', 'film-device__bar');
    bar.setAttribute('aria-hidden', 'true');
    bar.appendChild(el('span', 'film-device__dot'));
    bar.appendChild(el('span', 'film-device__dot'));
    bar.appendChild(el('span', 'film-device__dot'));
    bar.appendChild(el('span', 'film-device__url', 'lisa-charlie.bank / approvals'));
    var body = el('div', 'film-device__body');
    body.appendChild(el('p', 'film-ui-kicker', 'Approvals'));
    ['Vendor payout', 'Salary file', 'Supplier transfer'].forEach(function (label) {
      var row = el('div', 'film-ui-line');
      row.appendChild(el('strong', '', label));
      row.appendChild(uiBand('film-ui-band--sm'));
      body.appendChild(row);
    });
    var action = el('button', 'film-action', 'Approve (6)');
    action.type = 'button';
    action.tabIndex = -1;
    body.appendChild(action);
    web.appendChild(bar);
    web.appendChild(body);
    return web;
  }

  function approvePhone() {
    var phone = el('div', 'film-device film-device--phone film-paper film-bank');
    phone.setAttribute('data-morph', 'phone');
    var chrome = el('div', 'film-device__phone-bar');
    chrome.appendChild(el('span', 'film-device__pill'));
    var body = el('div', 'film-device__body');
    body.appendChild(el('p', 'film-ui-kicker', '2 selected'));
    body.appendChild(el('p', '', 'Salary file · Vendor payout'));
    var action = el('button', 'film-action', 'Approve (2)');
    action.type = 'button';
    action.tabIndex = -1;
    body.appendChild(action);
    phone.appendChild(chrome);
    phone.appendChild(body);
    return phone;
  }

  function morphBoard() {
    var board = el('div', 'film-morph');
    board.setAttribute('data-morph-stage', '');
    board.appendChild(approveWeb());
    board.appendChild(approvePhone());
    board.appendChild(irisSlot('web∥phone'));
    return board;
  }

  function weightColumn(kind, title, items) {
    var col = el('article', 'film-weight film-paper' + (kind === 'heavy' ? ' film-weight--heavy' : ' film-weight--light'));
    col.setAttribute('data-weight', kind);
    col.appendChild(el('p', 'film-ui-kicker', title));
    items.forEach(function (label) {
      var row = el('div', 'film-nav__item film-paper' + (label === 'Approvals' ? ' is-door' : ''));
      row.appendChild(el('span', '', label));
      col.appendChild(row);
    });
    return col;
  }

  function splitWeightBoard() {
    var board = el('div', 'film-weight-split');
    board.setAttribute('data-weight-split', '');
    board.appendChild(weightColumn('light', 'Light', ['Home', 'Accounts', 'Approvals', 'Payments']));
    board.appendChild(weightColumn('heavy', 'Heavy', [
      'Command desk', 'Policy suite', 'Exception queue', 'Treasury', 'Audit trail', 'Workflow studio'
    ]));
    board.appendChild(irisSlot('light vs heavy'));
    return board;
  }

  function findingBoard() {
    var board = el('div', 'film-finding-stage');
    board.appendChild(ladderStrip(true));
    board.appendChild(irisSlot('finding pin'));
    return board;
  }

  function buildCover(beat) {
    var claim = el('div', 'film-claim');
    claim.setAttribute('data-film-claim', '');
    claim.appendChild(el('h2', 'film-title film-title--hook', beat.title));
    claim.appendChild(el('p', 'film-line', META.product));
    claim.appendChild(el('p', 'film-demo', META.demo));
    var chip = decisionChip(beat.decision);
    if (chip) claim.appendChild(chip);
    return claim;
  }

  function buildClaim(beat) {
    var claim = el('div', 'film-claim');
    claim.setAttribute('data-film-claim', '');
    if (beat.num) claim.appendChild(el('p', 'film-num', beat.num));
    claim.appendChild(el('h2', 'film-title', beat.title));
    if (beat.body) claim.appendChild(el('p', 'film-body', beat.body));
    var chip = decisionChip(beat.decision);
    if (chip) claim.appendChild(chip);
    if (beat.ask) {
      var ask = el('p', 'film-ask', beat.ask);
      ask.setAttribute('data-film-ask', '');
      claim.appendChild(ask);
    }
    if (beat.next && beat.next.length) {
      var list = el('ul', 'film-next');
      beat.next.forEach(function (line) {
        list.appendChild(el('li', '', line));
      });
      claim.appendChild(list);
    }
    if (beat.finding) {
      var end = el('div', 'film-end');
      var back = el('button', 'study__end-btn', 'Back to work');
      back.type = 'button';
      back.setAttribute('data-study-close', '');
      end.appendChild(el('p', 'film-demo', META.figma));
      end.appendChild(back);
      claim.appendChild(end);
    }
    return claim;
  }

  function buildViz(beat) {
    var viz = el('div', 'film-viz');
    var stack = el('div', 'film-shot-stack');
    stack.setAttribute('data-shot-stack', '');

    switch (beat.id) {
      case 'cover':
        stack.appendChild(shot('ladder', ladderStrip(false)));
        break;
      case 'freelancer':
        stack.appendChild(shot('phone', withIris('freelancer', phonePayBoard())));
        break;
      case 'sole':
        stack.appendChild(shot('balances', withIris('sole', balanceBoard())));
        stack.appendChild(shot('handoff', handoffBoard()));
        break;
      case 'ten':
        stack.appendChild(shot('split', withIris('ten', splitDoorBoard())));
        break;
      case 'mid':
        stack.appendChild(shot('control', withIris('mid', controlBoard())));
        break;
      case 'devices':
        stack.appendChild(shot('morph', morphBoard()));
        break;
      case 'corporate':
        stack.appendChild(shot('weight', splitWeightBoard()));
        break;
      case 'close':
        stack.appendChild(shot('finding', findingBoard()));
        break;
      default: {
        var unknown = beat.id;
        stack.appendChild(shot('board', el('div', 'film-paper film-screen', unknown)));
        break;
      }
    }

    viz.appendChild(stack);
    return viz;
  }

  function buildBeat(beat) {
    var section = el('section', 'film-beat' + (beat.layout === 'cover' ? ' film-beat--cover' : ' film-beat--chapter'));
    section.setAttribute('data-film-beat', beat.id);
    section.setAttribute('data-recipe', beat.recipe);
    section.setAttribute('data-pin', beat.pin ? 'true' : 'false');
    if (beat.hold) section.setAttribute('data-hold', beat.hold);
    if (beat.finding) section.setAttribute('data-finding', 'true');

    var hold = el('div', 'film-hold');
    hold.setAttribute('data-film-hold', '');
    var stage = el('div', 'film-stage');
    stage.setAttribute('data-film-stage', '');

    if (beat.layout === 'cover') stage.appendChild(buildCover(beat));
    else stage.appendChild(buildClaim(beat));

    stage.appendChild(buildViz(beat));
    stage.appendChild(captionStack(beat.captions || []));

    hold.appendChild(stage);
    section.appendChild(hold);
    return section;
  }

  function mount(world, project) {
    if (!world) return null;
    world.innerHTML = '';
    world.classList.add('film-world');
    BEATS.forEach(function (beat) {
      world.appendChild(buildBeat(beat));
    });
    return {
      beats: BEATS,
      project: project || null,
      pageCount: function () { return BEATS.length; }
    };
  }

  return {
    mount: mount,
    BEATS: BEATS,
    META: META
  };
})();
