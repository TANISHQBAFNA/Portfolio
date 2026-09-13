/**
 * CBX300 cream scroll film — Aisha story, full case.
 * Source of truth: docs/source/cbx300-aisha-case.html
 * Cream portfolio chrome. Designed placeholders stand in for Figma frames.
 * Lisa Charlie is a demo brand. Aisha is a representative story, not a real interview.
 * No invented outcomes.
 */
window.Cbx300Case = (function () {
  'use strict';

  var META = {
    hook: 'Banking that grows with the business.',
    promise: 'CBX300 helps business owners understand money, make payments safely, approve work, and manage team access as the business grows.',
    quote: 'A business should not need a new banking product just because it has grown.',
    product: 'CBX300 · web + phone · 259 web · 377 mobile · ~147 flows · demo brand: Lisa Charlie',
    role: 'Lead product designer. Design system, end-to-end screens (web + phone), through developer handoff',
    duration: 'Jan 2026 – present',
    status: 'Design system complete. Majority of functional screens and full user flows designed through handoff.',
    demo: 'Lisa Charlie bank is a demo brand. Aisha is a representative story, not a real customer interview.',
    finding: 'A bank that does not need replacing when Aisha’s business grows.',
    volume: '259 web screens. 377 mobile screens. ~147 flows. One shared system.',
    figma: 'Figma frames are placeholders until exports land. Designed slots stand in for product art.'
  };

  var BEATS = [
    {
      id: 'cover',
      num: '',
      title: META.hook,
      recipe: 'cover',
      pin: true,
      layout: 'cover',
      captions: ['259 web · 377 mobile · ~147 flows. One shared system.']
    },
    {
      id: 'aisha',
      num: '01',
      title: 'Meet Aisha.',
      body: 'Aisha runs a growing distribution business. She began by managing every financial task herself. As the company grew, banking became a shared job.',
      recipe: 'portrait',
      pin: true,
      note: 'Aisha is a representative example, not a real interview.',
      captions: [
        'Do I have enough to pay this supplier today?',
        'Who prepared this? Does it need my approval?',
        'Can my accountant see only the right info?'
      ],
      ask: 'What if the product grew with those questions?'
    },
    {
      id: 'ladder',
      num: '02',
      title: 'Five stages of the same business.',
      body: 'A freelancer and a fifty-person company are not the same day to day. They should not need two banks.',
      recipe: 'ends',
      pin: true,
      decision: {
        kind: 'Finding',
        finding: 'Aisha started doing every financial task herself. As the company grew, banking became a shared job.',
        choice: 'One product that shows more control only when it is needed, not five separate banks.'
      },
      captions: [
        'Independent professional. One person. Quick visibility.',
        'Sole proprietor. Daily cash, bills, and supplier payments.',
        'Micro. A helper begins to work with company money.',
        'Small. Finance prepares. An owner or director approves.',
        'Medium. More accounts, more users, stronger controls.',
        'The same layout has to work for a business with no accounts and a business with four.'
      ],
      ask: 'Who is using the account, if it is not one user?'
    },
    {
      id: 'roles',
      num: '03',
      title: 'I designed for roles, not one user.',
      body: 'The same business account can be used by people with very different jobs. Early on, one person wears all three hats. Later, three people.',
      recipe: 'jobs',
      pin: true,
      decision: {
        kind: 'Finding',
        finding: 'The same business account is used by people with very different jobs.',
        choice: 'Design for the owner, the payment maker, and the approver, not one generic user.'
      },
      captions: [
        'The owner wants a clear view of cash and what is waiting.',
        'The payment maker needs speed, less retyping, and errors early.',
        'The approver needs key facts first, often on a phone.'
      ],
      ask: 'How does the product keep that promise as the work splits?'
    },
    {
      id: 'promise',
      num: '04',
      title: 'How the product keeps its promise.',
      body: 'Five habits. They map to the moments Aisha hits as the business grows.',
      recipe: 'steps',
      pin: true,
      decision: {
        kind: 'Finding',
        finding: 'Growth should not force a new banking product.',
        choice: 'Start simple, give context, share work safely, prevent errors, stay familiar.'
      },
      captions: [
        'Start simple. One person can run the account.',
        'Give context. Available answers what can be paid today.',
        'Share work safely. Prepared is not approved.',
        'Prevent errors. Failures surface before anyone signs.',
        'Stay familiar. Web and phone keep the same meaning.'
      ],
      ask: 'Can I afford to pay this supplier today?'
    },
    {
      id: 'pay-today',
      num: '05',
      title: 'Can I afford to pay this supplier today?',
      body: 'A business balance is not always one number. Some money may be held, some may not be cleared yet, some may already be booked.',
      recipe: 'money',
      pin: true,
      decision: {
        kind: 'Finding',
        finding: 'One balance can be misleading. Some money is held, pending, or uncleared.',
        choice: 'Available balance leads the page because it answers what Aisha can pay today.',
        ruledOut: 'Ruled out: one big number.'
      },
      captions: [
        'One number would lie.',
        'Available, current, held, uncleared. Available leads.'
      ],
      ask: 'If she can pay, is she paying the right supplier?'
    },
    {
      id: 'supplier',
      num: '06',
      title: 'Pay the right supplier.',
      body: 'A long form asks for everything at once. People fill fields that do not apply, or skip the ones that do.',
      recipe: 'form',
      pin: true,
      decision: {
        kind: 'Finding',
        finding: 'A long payment form invites the wrong type and the wrong details.',
        choice: 'Start with payment type. Details arrive only when they are needed.'
      },
      captions: [
        'Type first. Transfer, bill, payroll, or FX.',
        'Then the fields that belong to that type.'
      ],
      ask: 'Did the system use the right beneficiary?'
    },
    {
      id: 'beneficiary',
      num: '07',
      title: 'Did the system use the right beneficiary?',
      body: 'If the product pre-fills a name in the background, Aisha may send money to the last used account without seeing the handoff.',
      recipe: 'handoff',
      pin: true,
      decision: {
        kind: 'Finding',
        finding: 'Invisible automation is risky when money moves.',
        choice: 'Confirm the handoff. Show who was suggested and keep the pre-fill message in the open.'
      },
      captions: [
        'Suggested from the last payment to this supplier.',
        'Confirm the name and the account hint before send.'
      ],
      ask: 'When the team prepares it, where does approval live?'
    },
    {
      id: 'approve',
      num: '08',
      title: 'My team can prepare. I need to approve.',
      body: 'Preparing a payment is not the same as approving it. A payment can be prepared, reviewed, approved, rejected, or completed. Each stage has to stay obvious.',
      recipe: 'door',
      pin: true,
      decision: {
        kind: 'Finding',
        finding: 'Preparing a payment is not the same as approving it. Submitted can look like completed.',
        choice: 'Approvals get their own door, and batch approve names the count while rows stay visible.',
        ruledOut: 'Ruled out: bury under Payments, or select-all with no line of sight.'
      },
      captions: [
        'Approving is the job, so it has its own button, not a notification.',
        'The action is labelled with the number it will perform. No one approves a mystery quantity.'
      ],
      ask: 'Tell me what is wrong before I approve.'
    },
    {
      id: 'validation',
      num: '09',
      title: 'Tell me what is wrong before I approve.',
      body: 'A salary file can hide bad rows until after someone signs. Approval is a legal act. The list has to be honest first.',
      recipe: 'fail',
      pin: true,
      decision: {
        kind: 'Finding',
        finding: 'Errors arrive too late if a file looks clean until after the signature.',
        choice: 'Validation lives in review. 128 transactions, 3 failed a check, named on the page.',
        ruledOut: 'Ruled out: a clean list that fails after submit.'
      },
      captions: [
        '128 transactions. 3 failed system validation.',
        'Bad rows turn red before you sign.'
      ],
      ask: 'Who else can see this money, and how far?'
    },
    {
      id: 'access',
      num: '10',
      title: 'My team needs access, but not all access.',
      body: 'Giving access is also a money decision. A person needs the right actions for the right business accounts, not automatic access to everything.',
      recipe: 'wizard',
      pin: true,
      decision: {
        kind: 'Finding',
        finding: 'A role name does not explain which actions a person can take or which accounts they can use.',
        choice: 'A safe permission connects a person, an action, and the right financial scope.',
        ruledOut: 'Ruled out: one question per screen.'
      },
      captions: [
        'Person first. Sara, bookkeeper. Not a role dump.',
        'Then the actions: view, prepare. Not approve.',
        'Then the accounts: operating, not payroll, not reserve.'
      ],
      ask: 'When she is reading, stay calm. When she is acting, be clear.'
    },
    {
      id: 'ui',
      num: '11',
      title: 'Calm when reading. Clear when acting.',
      body: 'Hierarchy, colour, actions, and layout do different jobs. Reading should not shout. A money move should not hide.',
      recipe: 'cards',
      pin: true,
      decision: {
        kind: 'Finding',
        finding: 'Reading cash and moving cash are different jobs on the same screen.',
        choice: 'Lead with hierarchy. Use colour only for money that can move or fail. Name actions with a count. Change layout by device, not by shrinking the desk.'
      },
      captions: [
        'Hierarchy: available, the next approval, the failed row.',
        'Colour: bank-green inside the product frame. Red only for failed checks.',
        'Actions: Approve (N), not a mystery tick.',
        'Layout: web is the workspace. Phone is the urgent check.'
      ],
      ask: 'Same goal. Different moment.'
    },
    {
      id: 'devices',
      num: '12',
      title: 'Same goal. Different moment.',
      body: 'Aisha uses web for detailed work. She uses mobile for quick checks and urgent approval. The task stays the same. The layout changes.',
      recipe: 'table',
      pin: true,
      decision: {
        kind: 'Finding',
        finding: 'Web is the workspace. Mobile is the urgent check. Shrinking the desktop onto a phone loses the moment.',
        choice: 'Keep the meaning of the task, then change the layout for the device.'
      },
      captions: [
        'Can I pay today? Four balances on web. Available leads on a phone.',
        'Approve work: rows visible on web. Thumb-reach Approve (N) on a phone.'
      ],
      ask: 'What holds those moments together as one system?'
    },
    {
      id: 'system',
      num: '13',
      title: 'One system, four habits.',
      body: 'Navigation, forms, states, and endings. Learn them once. Use them on every money path.',
      recipe: 'system',
      pin: true,
      decision: {
        kind: 'Finding',
        finding: 'Dozens of money forms, same consequence: money moves or a mandate changes.',
        choice: 'Permanent nav for approvals, type-first forms, honest states, and the same ending every time.'
      },
      captions: [
        'Navigation: approvals have an address, not a bell.',
        'Forms: type first. Context on the right, never extra questions.',
        'States: prepared, submitted, waiting, approved, rejected, completed.',
        'Endings: review, one-time code, done. Empty screens offer the next action.'
      ],
      ask: 'What did this produce, on web and on the phone?'
    },
    {
      id: 'outcome',
      num: '',
      title: META.finding,
      body: META.volume + ' Results stay blank until real numbers exist.',
      recipe: 'finding',
      pin: true,
      hold: 'short',
      finding: true,
      captions: [
        '259 web · 377 mobile · ~147 flows · one shared system.',
        'Aisha is a representative story. Lisa Charlie is the demo brand, not a live client.',
        'Figma frames are placeholders until exports land.'
      ],
      next: [
        'Test payment, approval, and access journeys with real business users.',
        'Measure time to complete key tasks and understand status.',
        'Track errors, abandoned steps, and support requests.',
        'Test whether web and mobile tell the same clear story.'
      ]
    }
  ];

  var STAGES = [
    { id: 'indie', num: '01', name: 'Independent professional', people: 'Needs: quick visibility', need: 'One person manages income, expenses, and a few payments.' },
    { id: 'sole', num: '02', name: 'Sole proprietor', people: 'Needs: simple payments', need: 'The owner manages daily cash, bills, and supplier payments.' },
    { id: 'micro', num: '03', name: 'Micro business', people: 'Needs: safe delegation', need: 'A helper or bookkeeper begins to work with company money.' },
    { id: 'small', num: '04', name: 'Small business', people: 'Needs: clear approval', need: 'A finance person prepares. An owner or director approves.' },
    { id: 'medium', num: '05', name: 'Medium business', people: 'Needs: control at scale', need: 'More accounts, more users, payment batches, stronger controls.' }
  ];

  var JOBS = [
    { id: 'owner', title: 'The owner', body: 'A clear view of cash, important activity, and decisions waiting.', device: 'Web desk, quick phone check' },
    { id: 'maker', title: 'The payment maker', body: 'Prepares payments. Needs speed, less retyping, errors early.', device: 'Web desk' },
    { id: 'approver', title: 'The approver', body: 'Reviews work prepared by someone else. Key facts first.', device: 'On a phone' }
  ];

  var PROMISE = [
    { title: 'Start simple', note: 'One person can run the account without a finance team.' },
    { title: 'Give context', note: 'Available leads because it answers what can be paid today.' },
    { title: 'Share work safely', note: 'A teammate can prepare. An owner can approve.' },
    { title: 'Prevent errors', note: 'Failures surface in review, before anyone signs.' },
    { title: 'Stay familiar', note: 'Web and phone keep the same meaning. Money paths end the same way.' }
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

  function uiCard(title, note) {
    var card = el('div', 'film-ui-card');
    if (title) card.appendChild(el('strong', '', title));
    if (note) card.appendChild(el('span', '', note));
    card.appendChild(uiBand('film-ui-band--lg'));
    card.appendChild(uiBand());
    return card;
  }

  function riskCard(title, body) {
    var card = el('article', 'film-risk film-paper');
    card.appendChild(el('p', 'film-risk__k', 'Risk'));
    card.appendChild(el('strong', '', title));
    card.appendChild(el('p', '', body));
    return card;
  }

  function coverCompose() {
    var board = el('div', 'film-board film-compose');
    var web = el('div', 'film-device film-device--web film-paper film-bank');
    var bar = el('div', 'film-device__bar');
    bar.setAttribute('aria-hidden', 'true');
    bar.appendChild(el('span', 'film-device__dot'));
    bar.appendChild(el('span', 'film-device__dot'));
    bar.appendChild(el('span', 'film-device__dot'));
    bar.appendChild(el('span', 'film-device__url', 'lisa-charlie.bank'));
    var body = el('div', 'film-device__body');
    var hero = el('div', 'film-ui-hero');
    hero.appendChild(el('p', 'film-ui-kicker', 'Available to pay'));
    hero.appendChild(el('p', 'film-ui-figure', 'AED 184,220'));
    hero.appendChild(uiBand('film-ui-band--bank'));
    body.appendChild(hero);
    var row = el('div', 'film-ui-row');
    row.appendChild(uiCard('Held', 'Not spendable yet'));
    row.appendChild(uiCard('Approvals', 'Waiting on you'));
    body.appendChild(row);
    web.appendChild(bar);
    web.appendChild(body);
    web.appendChild(paperNote('Web dashboard frame later'));
    var phone = el('div', 'film-device film-device--phone film-paper film-bank');
    var pchrome = el('div', 'film-device__phone-bar');
    pchrome.appendChild(el('span', 'film-device__pill'));
    var pbody = el('div', 'film-device__body');
    pbody.appendChild(el('p', 'film-ui-kicker', 'Today'));
    pbody.appendChild(el('p', 'film-ui-figure film-ui-figure--sm', 'AED 184,220'));
    pbody.appendChild(uiCard('Queue', 'On a phone'));
    phone.appendChild(pchrome);
    phone.appendChild(pbody);
    phone.appendChild(paperNote('Phone frame later'));
    board.appendChild(web);
    board.appendChild(phone);
    return board;
  }

  function aishaBoard() {
    var board = el('div', 'film-board film-portrait');
    var card = el('article', 'film-persona film-paper');
    card.appendChild(el('p', 'film-ui-kicker', 'Representative example'));
    card.appendChild(el('strong', '', 'Aisha'));
    card.appendChild(el('p', '', 'Growing distribution business. Not a real interview.'));
    board.appendChild(card);
    var qs = el('ol', 'film-questions');
    [
      'Do I have enough to pay this supplier today?',
      'Who prepared this? Does it need my approval?',
      'Can my accountant see only the right info?'
    ].forEach(function (q, i) {
      var li = el('li', 'film-question film-paper');
      li.setAttribute('data-focus', 'q' + i);
      li.appendChild(el('span', 'film-question__n', '0' + (i + 1)));
      li.appendChild(el('p', '', q));
      qs.appendChild(li);
    });
    board.appendChild(qs);
    return board;
  }

  function ladderBoard() {
    var board = el('div', 'film-board film-ladder');
    var world = el('div', 'film-ladder__world');
    world.setAttribute('data-ladder-world', '');
    var row = el('div', 'film-ladder__row');
    STAGES.forEach(function (stage) {
      var card = el('article', 'film-stage-card film-paper');
      card.setAttribute('data-focus', stage.id);
      card.appendChild(el('span', 'film-stage-card__num', stage.num));
      card.appendChild(el('strong', '', stage.name));
      card.appendChild(el('p', '', stage.need));
      card.appendChild(el('small', '', stage.people));
      row.appendChild(card);
    });
    world.appendChild(row);
    var bar = el('div', 'film-ladder__bar');
    var fill = el('span', 'film-ladder__fill');
    fill.setAttribute('data-ladder-fill', '');
    bar.appendChild(fill);
    var words = el('div', 'film-ladder__words');
    words.appendChild(el('span', '', 'One person'));
    words.appendChild(el('em', '', 'One platform'));
    words.appendChild(el('span', '', 'Finance team'));
    board.appendChild(world);
    board.appendChild(bar);
    board.appendChild(words);
    return board;
  }

  function pairBoard() {
    var pair = el('div', 'film-pair');
    var empty = el('figure');
    var a = el('div', 'film-screen film-paper film-bank');
    a.appendChild(el('p', 'film-ui-kicker', 'Accounts'));
    a.appendChild(el('p', 'film-ui-empty', 'None yet'));
    a.appendChild(paperNote('Accounts, none yet'));
    empty.appendChild(a);
    empty.appendChild(el('figcaption', '', 'No accounts'));
    var full = el('figure');
    var b = el('div', 'film-screen film-paper film-bank');
    b.appendChild(el('p', 'film-ui-kicker', 'Accounts'));
    var list = el('div', 'film-ui-stack');
    ['Operating', 'Tax', 'Payroll', 'Reserve'].forEach(function (name) {
      var row = el('div', 'film-ui-line');
      row.appendChild(el('strong', '', name));
      row.appendChild(uiBand('film-ui-band--sm'));
      list.appendChild(row);
    });
    b.appendChild(list);
    b.appendChild(paperNote('Accounts, four'));
    full.appendChild(b);
    full.appendChild(el('figcaption', '', 'Four accounts'));
    pair.appendChild(empty);
    pair.appendChild(full);
    return pair;
  }

  function jobsBoard() {
    var row = el('div', 'film-jobs');
    JOBS.forEach(function (job) {
      var card = el('article', 'film-job film-paper');
      card.setAttribute('data-focus', job.id);
      var screen = el('div', 'film-job__screen film-bank');
      screen.appendChild(uiBand('film-ui-band--bank'));
      screen.appendChild(uiBand());
      card.appendChild(screen);
      card.appendChild(el('small', '', job.device));
      card.appendChild(el('strong', '', job.title));
      card.appendChild(el('p', '', job.body));
      row.appendChild(card);
    });
    return row;
  }

  function promiseBoard() {
    var wrap = el('div', 'film-track-wrap');
    var track = el('div', 'film-track');
    track.setAttribute('data-film-track', '');
    PROMISE.forEach(function (step) {
      var card = el('article', 'film-step film-paper');
      card.setAttribute('data-focus', step.title);
      card.appendChild(el('strong', '', step.title));
      card.appendChild(el('span', '', step.note));
      track.appendChild(card);
    });
    wrap.appendChild(track);
    return wrap;
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

  function batchBoard() {
    var wrap = el('div', 'film-batch film-bank');
    var states = el('p', 'film-ui-kicker', 'Prepared · Submitted · Waiting · not completed');
    var rows = el('div', 'film-rows');
    [
      ['Vendor payout', 'Waiting'],
      ['Salary file', 'Waiting'],
      ['Supplier transfer', 'Waiting'],
      ['Card spend', 'Waiting'],
      ['Tax payment', 'Waiting'],
      ['FX send', 'Waiting']
    ].forEach(function (item) {
      var row = el('div', 'film-row film-paper');
      row.appendChild(el('span', '', item[0]));
      row.appendChild(el('span', '', item[1]));
      rows.appendChild(row);
    });
    var action = el('button', 'film-action', 'Approve (6)');
    action.type = 'button';
    action.tabIndex = -1;
    wrap.appendChild(states);
    wrap.appendChild(rows);
    wrap.appendChild(action);
    return wrap;
  }

  function failBoard() {
    var board = el('div', 'film-board film-fail film-bank');
    var head = el('p', 'film-line', '128 transactions · 3 failed system validation');
    var rows = el('div', 'film-rows');
    [
      { label: 'Row 12 · account missing', bad: true },
      { label: 'Row 44 · amount unreadable', bad: true },
      { label: 'Row 91 · duplicate line', bad: true },
      { label: 'Row 02 · salary', bad: false },
      { label: 'Row 03 · salary', bad: false }
    ].forEach(function (item) {
      var row = el('div', 'film-row film-paper' + (item.bad ? ' is-bad' : ''));
      row.appendChild(el('span', '', item.label));
      row.appendChild(el('span', '', item.bad ? 'Failed' : 'OK'));
      rows.appendChild(row);
    });
    board.appendChild(head);
    board.appendChild(rows);
    board.appendChild(paperNote('Approvals review crop later'));
    return board;
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
    return grid;
  }

  function formBoard() {
    var board = el('div', 'film-board film-form film-bank');
    var types = el('div', 'film-types');
    ['Transfer', 'Bill', 'Payroll', 'FX'].forEach(function (label, i) {
      var chip = el('button', 'film-type' + (i === 0 ? ' is-on' : ''), label);
      chip.type = 'button';
      chip.tabIndex = -1;
      chip.setAttribute('data-focus', label.toLowerCase());
      types.appendChild(chip);
    });
    var details = el('div', 'film-form__details film-paper');
    details.setAttribute('data-shot-detail', '');
    details.appendChild(el('p', 'film-ui-kicker', 'Transfer details'));
    details.appendChild(el('p', '', 'Beneficiary, amount, and reference arrive after the type is chosen.'));
    details.appendChild(uiBand('film-ui-band--lg'));
    details.appendChild(uiBand());
    board.appendChild(el('p', 'film-ui-kicker', 'Payment type first'));
    board.appendChild(types);
    board.appendChild(details);
    board.appendChild(paperNote('Send money frame later'));
    return board;
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
    board.appendChild(paperNote('Beneficiary confirm frame later'));
    return board;
  }

  function wizardBoard() {
    var board = el('div', 'film-board film-wizard');
    [
      { id: 'person', k: 'Person', title: 'Sara', body: 'Bookkeeper. Not “accountant” as a pile of switches.' },
      { id: 'action', k: 'Action', title: 'View and prepare', body: 'Start, check, view. Not send. Not approve.' },
      { id: 'scope', k: 'Financial scope', title: 'Operating account', body: 'Not payroll. Not reserve. Not every account.' }
    ].forEach(function (step) {
      var card = el('article', 'film-wizard__card film-paper');
      card.setAttribute('data-focus', step.id);
      card.appendChild(el('p', 'film-ui-kicker', step.k));
      card.appendChild(el('strong', '', step.title));
      card.appendChild(el('p', '', step.body));
      board.appendChild(card);
    });
    return board;
  }

  function uiCardsBoard() {
    var grid = el('div', 'film-ui-strategy');
    [
      { id: 'hierarchy', title: 'Hierarchy', body: 'Available, the next approval, the failed row. One thing leads.' },
      { id: 'colour', title: 'Colour', body: 'Cream for reading. Bank-green inside the frame. Red only for failed checks.' },
      { id: 'actions', title: 'Actions', body: 'Named with the count they will perform. Approve (N).' },
      { id: 'layout', title: 'Layout', body: 'Web is the workspace. Phone is the urgent check.' }
    ].forEach(function (item) {
      var card = el('article', 'film-strategy-card film-paper');
      card.setAttribute('data-focus', item.id);
      card.appendChild(el('strong', '', item.title));
      card.appendChild(el('p', '', item.body));
      grid.appendChild(card);
    });
    return grid;
  }

  function compareBoard() {
    var wrap = el('div', 'film-compare');
    var table = el('table', 'film-table film-paper');
    var head = el('thead', '');
    var hr = el('tr', '');
    ['Goal', 'Web', 'Mobile'].forEach(function (h) {
      hr.appendChild(el('th', '', h));
    });
    head.appendChild(hr);
    table.appendChild(head);
    var body = el('tbody', '');
    [
      ['Can I pay today?', 'Four balances, available first.', 'Available leads. The rest under a tap.'],
      ['Pay a supplier', 'Type, then details, then review.', 'Confirm the beneficiary. Send from thumb reach.'],
      ['Approve work', 'Queue with every row visible. Approve (N).', 'The screen changes mode. Actions in thumb reach.'],
      ['Share access', 'Person, action, scope on one path.', 'Check who has access. Long edits stay on web.']
    ].forEach(function (row, i) {
      var tr = el('tr', '');
      tr.setAttribute('data-focus', 'row' + i);
      row.forEach(function (cell) {
        tr.appendChild(el('td', '', cell));
      });
      body.appendChild(tr);
    });
    table.appendChild(body);
    wrap.appendChild(table);
    return wrap;
  }

  function systemBoard() {
    var grid = el('div', 'film-system');
    [
      { id: 'nav', title: 'Navigation', body: 'Approvals have a permanent address on web and on the phone bar.' },
      { id: 'forms', title: 'Forms', body: 'Type first. Details when needed. Right column holds context, never extra questions.' },
      { id: 'states', title: 'Information and states', body: 'Prepared, submitted, waiting, approved, rejected, completed. Failed rows named before signature.' },
      { id: 'endings', title: 'Familiar endings', body: 'Review, then a one-time code, then done. Empty screens offer the next action.' }
    ].forEach(function (item) {
      var card = el('article', 'film-pillar film-paper');
      card.setAttribute('data-focus', item.id);
      card.appendChild(el('strong', '', item.title));
      card.appendChild(el('p', '', item.body));
      grid.appendChild(card);
    });
    return grid;
  }

  function contactSheet() {
    var sheet = el('div', 'film-sheet');
    var i;
    for (i = 0; i < 32; i += 1) {
      sheet.appendChild(el('i'));
    }
    return sheet;
  }

  function shot(name, node) {
    var wrap = el('div', 'film-shot');
    wrap.setAttribute('data-shot', name);
    wrap.appendChild(node);
    return wrap;
  }

  function buildCover(beat) {
    var claim = el('div', 'film-claim');
    claim.setAttribute('data-film-claim', '');
    claim.appendChild(el('h2', 'film-title film-title--hook', beat.title));
    claim.appendChild(el('p', 'film-promise', META.promise));
    claim.appendChild(el('p', 'film-quote', META.quote));
    claim.appendChild(el('p', 'film-line', META.product));
    claim.appendChild(el('p', 'film-demo', META.demo));
    return claim;
  }

  function buildClaim(beat) {
    var claim = el('div', 'film-claim');
    claim.setAttribute('data-film-claim', '');
    if (beat.num) claim.appendChild(el('p', 'film-num', beat.num));
    claim.appendChild(el('h2', 'film-title', beat.title));
    if (beat.body) claim.appendChild(el('p', 'film-body', beat.body));
    if (beat.note) claim.appendChild(el('p', 'film-demo', beat.note));
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
        stack.appendChild(shot('cover', coverCompose()));
        break;
      case 'aisha':
        stack.appendChild(shot('portrait', aishaBoard()));
        break;
      case 'ladder':
        stack.appendChild(shot('ladder', ladderBoard()));
        stack.appendChild(shot('pair', pairBoard()));
        break;
      case 'roles':
        stack.appendChild(shot('jobs', jobsBoard()));
        break;
      case 'promise':
        stack.appendChild(shot('promise', promiseBoard()));
        break;
      case 'pay-today':
        stack.appendChild(shot('risk', riskCard('One balance', 'Held, uncleared, and booked money hide inside a single number.')));
        stack.appendChild(shot('balances', balanceBoard()));
        break;
      case 'supplier':
        stack.appendChild(shot('risk', riskCard('Long form', 'Every field at once. Wrong type, wrong details.')));
        stack.appendChild(shot('form', formBoard()));
        break;
      case 'beneficiary':
        stack.appendChild(shot('risk', riskCard('Invisible automation', 'A pre-fill in the background can send money to the last used name.')));
        stack.appendChild(shot('handoff', handoffBoard()));
        break;
      case 'approve':
        stack.appendChild(shot('door', doorBoard()));
        stack.appendChild(shot('batch', batchBoard()));
        break;
      case 'validation':
        stack.appendChild(shot('risk', riskCard('Errors too late', 'A salary file can look clean until after someone signs.')));
        stack.appendChild(shot('fail', failBoard()));
        break;
      case 'access':
        stack.appendChild(shot('risk', riskCard('Role name', '“Accountant” does not say which actions or which accounts.')));
        stack.appendChild(shot('wizard', wizardBoard()));
        break;
      case 'ui':
        stack.appendChild(shot('strategy', uiCardsBoard()));
        break;
      case 'devices':
        stack.appendChild(shot('compare', compareBoard()));
        break;
      case 'system':
        stack.appendChild(shot('system', systemBoard()));
        break;
      case 'outcome':
        stack.appendChild(shot('sheet', contactSheet()));
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
