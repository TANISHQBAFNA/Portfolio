/**
 * CBX300 cream scroll film.
 * Echo copy from docs/case-study-cbx300-redesign-bar.md.
 * Designed placeholders stand in for Figma frames (CEO lock 2026-09-12).
 * Lisa Charlie is a demo brand. No invented outcomes.
 */
window.Cbx300Case = (function () {
  'use strict';

  var META = {
    hook: 'Banking for a company, not for one person.',
    promise: 'A small-business bank app that grows with the company — from one person who does everything, to a team with different jobs — without learning a new product.',
    product: 'CBX300 · web + phone · 636 screens · demo brand: Lisa Charlie',
    role: 'Lead product designer — design system, end-to-end screens (web + phone), through developer handoff',
    duration: 'Jan 2026 – present',
    status: 'Design system complete. Majority of functional screens and full user flows designed through handoff.',
    demo: 'Lisa Charlie bank is a demo brand, not a live client.',
    finding: '259 web screens. 377 mobile screens. One grammar.'
  };

  var BEATS = [
    {
      id: 'cover',
      num: '',
      title: META.hook,
      recipe: 'cover',
      pin: false,
      layout: 'cover',
      captions: ['CBX300 across web and phone. 636 screens, one system.']
    },
    {
      id: 'ladder',
      num: '01',
      title: 'One product for every size of small business',
      body: 'A freelancer and a 50-person company are not the same day-to-day — but they should not need two banks. Complexity shows up only when the business needs it.',
      recipe: 'ends',
      pin: true,
      hold: 'tall',
      captions: [
        'A freelancer runs the whole day from one login.',
        'A fifty-person company has many hands on the same bank.',
        'Same product. Complexity shows up only when the business needs it.',
        'The same layout has to work for a business with no accounts and a business with four.'
      ],
      ask: 'What happens when three people share that bank, not one?'
    },
    {
      id: 'roles',
      num: '02',
      title: 'Three jobs: owner, maker, approver',
      body: 'Early on, one person wears all three hats. Later, three people. Design for the jobs, not the job titles.',
      recipe: 'jobs',
      pin: true,
      hold: 'mid',
      captions: [
        'Owner needs one honest cash answer.',
        'Maker needs speed and no re-typing.',
        'Approver needs the queue clear on a phone.'
      ],
      ask: 'If approving is the work, where does that work live?'
    },
    {
      id: 'approvals',
      num: '03',
      title: 'Approvals get their own door',
      body: 'For some people, approving is the work. So it sits in the main menu (and on the phone bar) — not buried in a bell.',
      recipe: 'door',
      pin: true,
      hold: 'mid',
      captions: [
        'Approving is the job, so it has its own button, not a notification.',
        'The action is labelled with the number it will perform. No one approves a mystery quantity.'
      ],
      ask: 'What should you see before anyone signs?'
    },
    {
      id: 'money',
      num: '04',
      title: 'Show the real money, catch mistakes early',
      body: 'A business account has more than one “balance.” And if a salary file has bad rows, show that before someone signs — not after.',
      recipe: 'money',
      pin: true,
      hold: 'mid',
      captions: [
        'Bad rows turn red before you sign.',
        'Four balances on the card. One number would lie.'
      ],
      ask: 'Who is allowed to start, check, view, send, or approve?'
    },
    {
      id: 'permissions',
      num: '05',
      title: 'Who can do what — in a clear grid',
      body: 'Permissions are verbs (start, check, view, send, approve), not a pile of switches. One screen that still makes sense with one user or many.',
      recipe: 'verbs',
      pin: true,
      hold: 'mid',
      captions: [
        'Start, check, view, send, approve. The verbs sit in a grid you can read.',
        'The same screen serves one freelancer and a fourteen-person finance team.'
      ],
      ask: 'After the verbs, does every money path still end the same way?'
    },
    {
      id: 'grammar',
      num: '06',
      title: 'Every money path ends the same way',
      body: 'Review → one-time code → done. Same three steps on payments, deposits, cards, loans — so people don’t relearn the ending.',
      recipe: 'ending',
      pin: true,
      hold: 'tall',
      captions: [
        'Review, then a one-time code, then done.',
        'Same three steps on payments, deposits, cards, loans.',
        'People do not relearn the ending.',
        'Week one for every new customer. Each empty screen offers the next action.'
      ],
      ask: 'What did this produce, on web and on the phone?'
    },
    {
      id: 'scale',
      num: '',
      title: META.finding,
      body: 'That volume is the finding. Results stay blank until real numbers exist.',
      recipe: 'finding',
      pin: true,
      hold: 'short',
      finding: true,
      captions: [
        '259 web · 377 mobile · one grammar.',
        'Lisa Charlie is the demo brand used to design the system, not a live client.'
      ],
      next: [
        'Check the verb grid with real admins.',
        'Instrument the approval queue.',
        'Push empty-states further.',
        'Close the tokens-to-code loop.'
      ]
    }
  ];

  var STAGES = [
    { id: 'freelancer', name: 'Freelancer', people: '1 person' },
    { id: 'sole', name: 'Sole prop', people: '1 to 2' },
    { id: 'micro', name: 'Micro', people: 'A few' },
    { id: 'small', name: 'Small', people: 'A team' },
    { id: 'medium', name: 'Medium', people: 'Many hands' }
  ];

  var JOBS = [
    { id: 'owner', title: 'Owner', body: 'Needs one honest cash answer.', device: 'Web desk' },
    { id: 'maker', title: 'Maker', body: 'Needs speed and no re-typing.', device: 'Web desk' },
    { id: 'approver', title: 'Approver', body: 'Needs the queue clear on a phone.', device: 'On a phone.' }
  ];

  var VERBS = ['Start', 'Check', 'View', 'Send', 'Approve'];
  var FUNCTIONS = ['Payments', 'Payroll', 'Cards', 'Deposits'];

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

  function coverCompose() {
    var board = el('div', 'film-board film-compose');
    var web = el('div', 'film-device film-device--web film-paper');
    var bar = el('div', 'film-device__bar');
    bar.setAttribute('aria-hidden', 'true');
    bar.appendChild(el('span', 'film-device__dot'));
    bar.appendChild(el('span', 'film-device__dot'));
    bar.appendChild(el('span', 'film-device__dot'));
    bar.appendChild(el('span', 'film-device__url', 'lisa-charlie.bank'));
    var body = el('div', 'film-device__body');
    var hero = el('div', 'film-ui-hero');
    hero.appendChild(el('p', 'film-ui-kicker', 'Company cash'));
    hero.appendChild(uiBand('film-ui-band--teal'));
    hero.appendChild(uiBand('film-ui-band--lg'));
    body.appendChild(hero);
    var row = el('div', 'film-ui-row');
    row.appendChild(uiCard('Spendable', 'What you can use'));
    row.appendChild(uiCard('Approvals', 'Waiting on you'));
    body.appendChild(row);
    web.appendChild(bar);
    web.appendChild(body);
    web.appendChild(paperNote('Web dashboard frame later'));
    var phone = el('div', 'film-device film-device--phone film-paper');
    var pchrome = el('div', 'film-device__phone-bar');
    pchrome.appendChild(el('span', 'film-device__pill'));
    var pbody = el('div', 'film-device__body');
    pbody.appendChild(el('p', 'film-ui-kicker', 'Today'));
    pbody.appendChild(uiBand('film-ui-band--teal'));
    pbody.appendChild(uiCard('Queue', 'On a phone'));
    pbody.appendChild(uiBand());
    phone.appendChild(pchrome);
    phone.appendChild(pbody);
    phone.appendChild(paperNote('Phone frame later'));
    board.appendChild(web);
    board.appendChild(phone);
    return board;
  }

  function ladderBoard() {
    var board = el('div', 'film-board film-ladder');
    var row = el('div', 'film-ladder__row');
    STAGES.forEach(function (stage) {
      var card = el('article', 'film-stage-card film-paper');
      card.setAttribute('data-focus', stage.id);
      card.appendChild(el('strong', '', stage.name));
      card.appendChild(el('span', '', stage.people));
      row.appendChild(card);
    });
    var bar = el('div', 'film-ladder__bar');
    bar.appendChild(el('em', '', 'one product'));
    board.appendChild(row);
    board.appendChild(bar);
    return board;
  }

  function pairBoard() {
    var pair = el('div', 'film-pair');
    var empty = el('figure');
    var a = el('div', 'film-screen film-paper');
    a.appendChild(el('p', 'film-ui-kicker', 'Accounts'));
    a.appendChild(el('p', 'film-ui-empty', 'None yet'));
    a.appendChild(paperNote('Accounts, none yet'));
    empty.appendChild(a);
    empty.appendChild(el('figcaption', '', 'No accounts'));
    var full = el('figure');
    var b = el('div', 'film-screen film-paper');
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
      var screen = el('div', 'film-job__screen');
      screen.appendChild(uiBand('film-ui-band--teal'));
      screen.appendChild(uiBand());
      card.appendChild(screen);
      card.appendChild(el('small', '', job.device));
      card.appendChild(el('strong', '', job.title));
      card.appendChild(el('p', '', job.body));
      row.appendChild(card);
    });
    return row;
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
    var wrap = el('div', 'film-batch');
    var rows = el('div', 'film-rows');
    ['Vendor payout', 'Salary file', 'Supplier transfer', 'Card spend', 'Tax payment', 'FX send'].forEach(function (label) {
      var row = el('div', 'film-row film-paper');
      row.appendChild(el('span', '', label));
      row.appendChild(el('span', '', 'Ready'));
      rows.appendChild(row);
    });
    var action = el('button', 'film-action', 'Approve (6)');
    action.type = 'button';
    action.tabIndex = -1;
    wrap.appendChild(rows);
    wrap.appendChild(action);
    return wrap;
  }

  function failBoard() {
    var board = el('div', 'film-board film-fail');
    var head = el('p', 'film-line', '128 rows in the file. 3 failed a check.');
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
    return board;
  }

  function balanceBoard() {
    var grid = el('div', 'film-balances');
    [
      { name: 'Spendable', note: 'What you can use today' },
      { name: 'Booked', note: 'What the ledger says' },
      { name: 'Blocked', note: 'Held, not gone' },
      { name: 'Pending', note: 'Still on the way' }
    ].forEach(function (item) {
      var card = el('article', 'film-balance film-paper');
      card.appendChild(el('strong', '', item.name));
      card.appendChild(el('span', '', item.note));
      card.appendChild(uiBand('film-ui-band--teal'));
      grid.appendChild(card);
    });
    return grid;
  }

  function verbBoard(solo) {
    var grid = el('div', 'film-board film-grid film-paper');
    grid.appendChild(el('span', 'film-grid__fn', solo ? 'One user' : 'Function'));
    VERBS.forEach(function (verb) {
      var head = el('span', 'film-grid__head', verb);
      grid.appendChild(head);
    });
    FUNCTIONS.forEach(function (fn, fi) {
      grid.appendChild(el('span', 'film-grid__fn', fn));
      VERBS.forEach(function (verb, vi) {
        var on = solo ? (vi <= 1 || (fi === 0 && vi === 4)) : true;
        var cell = el('span', 'film-cell' + (on ? '' : ' is-off'));
        cell.setAttribute('aria-hidden', 'true');
        grid.appendChild(cell);
      });
    });
    return grid;
  }

  function endingTrack() {
    var wrap = el('div', 'film-track-wrap');
    var track = el('div', 'film-track');
    track.setAttribute('data-film-track', '');
    [
      { title: 'Review', note: 'See the money. See who it is for.' },
      { title: 'One-time code', note: 'Prove it is you.' },
      { title: 'Done', note: 'The path ends. Same every time.' }
    ].forEach(function (step) {
      var card = el('article', 'film-step film-paper');
      card.appendChild(el('strong', '', step.title));
      card.appendChild(el('span', '', step.note));
      track.appendChild(card);
    });
    wrap.appendChild(track);
    return wrap;
  }

  function emptyGrid() {
    var grid = el('div', 'film-empty');
    [
      { title: 'No payments yet', next: 'Send the first one' },
      { title: 'No cards yet', next: 'Order a card' },
      { title: 'No people yet', next: 'Add a teammate' },
      { title: 'No files yet', next: 'Upload payroll' }
    ].forEach(function (item) {
      var card = el('article', 'film-paper');
      card.appendChild(el('strong', '', item.title));
      card.appendChild(el('span', '', item.next));
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
    var title = el('h2', 'film-title film-title--hook', beat.title);
    claim.appendChild(title);
    claim.appendChild(el('p', 'film-promise', META.promise));
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
      case 'ladder':
        stack.appendChild(shot('ladder', ladderBoard()));
        stack.appendChild(shot('pair', pairBoard()));
        break;
      case 'roles':
        stack.appendChild(shot('jobs', jobsBoard()));
        break;
      case 'approvals':
        stack.appendChild(shot('door', doorBoard()));
        stack.appendChild(shot('batch', batchBoard()));
        break;
      case 'money':
        stack.appendChild(shot('fail', failBoard()));
        stack.appendChild(shot('balances', balanceBoard()));
        break;
      case 'permissions':
        stack.appendChild(shot('grid', verbBoard(false)));
        stack.appendChild(shot('solo', verbBoard(true)));
        break;
      case 'grammar':
        stack.appendChild(shot('ending', endingTrack()));
        stack.appendChild(shot('empty', emptyGrid()));
        break;
      case 'scale':
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
