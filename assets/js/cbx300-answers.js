/**
 * CBX300 Section 03 — How our bank answers her.
 * Direct port of the approved d1-scroll prototype (1440×900 stage,
 * GSAP/ScrollTrigger camera, copy, timing). Do not redesign.
 *
 * Only intended difference from the prototype:
 *   Ch1 / Ch2 — large PHONE in front, web app dimmed/blurred behind.
 *   Ch3       — phone and web app equally in focus.
 * Camera system (region→dest, spot, dim, viewfinder, title glide,
 * staggered pointers, hold, reverse fade, pull-back, sidebar 3→6→9)
 * stays the prototype's.
 *
 * Swap real screenshots later without touching the timeline:
 *   CHAPTERS[i].phoneShot = 'assets/img/cbx300/ch1-phone.png'
 *   CHAPTERS[i].deskShot  = 'assets/img/cbx300/ch1-desk.png'
 * Then set each pointer's `rect: { x, y, w, h }` as percentages of
 * that slot instead of `t: '[data-ans-t="…"]'`.
 * Lisa Charlie is a demo brand. Aisha is a representative example.
 */
window.Cbx300Answers = (function () {
  'use strict';

  var STAGE_W = 1440;
  var STAGE_H = 900;
  var PX_PER_SEC = 170;
  var ZOOM = 2.1;
  var GAP = 1.0;
  var OUT = 1.2;
  var BACK = 2.5;
  var HOLD = 5.3;
  var STEP = 5.0;
  var IN_DY = 30;
  var OUT_DY = -26;
  var GLIDE = 1.15;
  var START = 0.7;
  var CURTAIN = 0.55;
  var DEST = { x: 48, w: 880, cy: 470 };
  var NCOL = { left: 984, width: 416 };
  var SCRUB = 1.0;
  /* Scrub smoothing is bypassed only for a true jump (deep link, anchor);
     a fast wheel stays smoothed so the glide never turns into a cut. */
  var JUMP = 0.2;
  var SETTLE_IN = 2.2;

  var motion = {
    mm: null,
    triggers: [],
    tween: null,
    pin: null,
    reduce: false,
    fit: null
  };

  var IMG = 'assets/img/cbx300/';

  var CHAPTERS = [
    {
      id: 'solo',
      hero: 'phone',
      kicker: 'On her own · 1 person',
      people: ['aisha'],
      ask: 'Did the client pay yet?',
      focus: 'Invoices',
      phoneShots: [
        { id: 'home', src: IMG + 's03-ch1-phone-home.png', alt: 'CBX300 phone · Home' },
        { id: 'invoices', src: IMG + 's03-ch1-phone-invoices.png', alt: 'CBX300 phone · Invoices' }
      ],
      openShot: 'home',
      deskShot: IMG + 's03-ch1-web-dashboard.png',
      deskAlt: 'CBX300 web · Dashboard',
      deskTitle: 'Dashboard',
      region: { phone: '[data-ans-device="phone"]', desk: null },
      pointers: [
        { worry: 'Did Client A pay?', does: 'Status is the first thing on every row, as a coloured pill that turns to ‘Paid’ the moment money lands.', why: ['Green means done and red means act, so one glance replaces reading.', 'It sits in the same place on every row, so her eye learns where to look.'], not: 'We didn’t bury status inside each invoice. She would have to open every one to find out.', gain: 'No awkward call to the client.', shot: 'invoices', rect: { x: 4, y: 21.5, w: 92, h: 9 }, device: 'phone', a: 'c', off: 0 },
        { worry: 'Which invoice was that for?', does: 'The payment arrives with a ‘Matched to invoice’ badge, tied to its invoice by the bank, not by her.', why: ['The badge names the exact invoice, so there is nothing left to cross-check.', 'It sits on the same row as the client, so the proof is where she already looks.'], not: 'We didn’t list bank credits in a separate feed. She would be matching amounts to bills herself.', gain: 'Books that balance without a spreadsheet.', shot: 'invoices', rect: { x: 4, y: 21.5, w: 92, h: 12 }, device: 'phone', a: 'c', off: 0 },
        { worry: 'Who still owes me?', does: 'The oldest overdue invoice is tagged in red and sits first among the unpaid ones.', why: ['Order and colour say the same thing, so she knows where to start without sorting.', 'The word ‘oldest’ answers ‘who first?’, so she doesn’t compare dates.'], not: 'We didn’t sort by amount or client name. The most overdue one would sink into the list.', gain: 'She knows who to chase, and who to leave alone.', shot: 'invoices', rect: { x: 4, y: 33, w: 92, h: 9 }, device: 'phone', a: 'c', off: 0 },
        { worry: 'Chasing feels rude.', does: 'A ‘Nudge’ button sits on every overdue row, with a polite reminder already written behind it.', why: ['One tap is all it takes, so chasing becomes a small task, not a dreaded one.', 'The wording is already kind, so she never has to find the right tone.'], not: 'We didn’t hand her a blank email. A blank box is what makes people put it off.', gain: 'The money comes in. The relationship stays warm.', shot: 'invoices', rect: { x: 4, y: 33, w: 92, h: 14 }, device: 'phone', a: 'c', off: 0 }
      ]
    },
    {
      id: 'hire',
      hero: 'phone',
      kicker: 'First hire · 2 people',
      people: ['aisha', 'lina'],
      ask: 'Can I afford her salary this month?',
      focus: 'Cash plan',
      phoneShots: [
        { id: 'liq', src: IMG + 's03-ch2-phone-liquidity.png', alt: 'CBX300 phone · Liquidity' },
        { id: 'aside', src: IMG + 's03-ch2-phone-set-aside.png', alt: 'CBX300 phone · Cash plan' },
        { id: 'payday', src: IMG + 's03-ch2-phone-payday.png', alt: 'CBX300 phone · Payday' }
      ],
      openShot: 'liq',
      inset: { src: IMG + 's03-ch2-phone-recurring.png', alt: 'CBX300 phone · Salary repeats' },
      deskShot: IMG + 's03-ch2-web-bulk-upload.png',
      deskAlt: 'CBX300 web · Salary file upload',
      deskTitle: 'Bulk payments',
      region: { phone: '[data-ans-device="phone"]', desk: null },
      pointers: [
        { worry: 'Is this money really mine?', does: 'The total is split by where the money sits: the current account, the overdraft limit she can borrow, and deposits, each with the days until it frees up.', why: ['Borrowed money sits in its own line, so it is never mistaken for hers.', '‘Maturing in 7 days’ tells her when locked money becomes usable.'], not: 'We didn’t show one balance with the overdraft folded in. It looks like savings and hides what is borrowed.', gain: 'One honest picture of what she can use.', shot: 'liq', rect: { x: 5.7, y: 41.8, w: 88, h: 16.8 }, device: 'phone', a: 'c', off: 0 },
        { worry: 'Will GST and rent eat into it?', does: 'Money for bills that are certain, like GST and rent, is set aside as its own labelled block.', why: ['A separate colour and name keep it out of ‘Safe to spend’, so it can’t be spent by accident.', 'It says ‘Set aside’ in plain words, not an accounting term.'], not: 'We didn’t leave upcoming bills in a list further down. They would look like part of the balance.', gain: 'No bill ambushes payday.', shot: 'aside', rect: { x: 4, y: 45, w: 92, h: 21 }, device: 'phone', a: 'l', off: 16 },
        { worry: 'What if a client pays late?', does: 'Money that hasn’t arrived yet is shown as ‘Coming in’ and kept out of the safe number.', why: ['The label says expected, not here, so it reads as a maybe.', 'A late client changes ‘Coming in’ and leaves ‘Safe to spend’ exactly where it was.'], not: 'We didn’t add expected payments to the balance. One late invoice would make the safe number wrong.', gain: 'She never spends money that hasn’t arrived.', shot: 'aside', rect: { x: 4, y: 67, w: 92, h: 16 }, device: 'phone', a: 'l', off: 16 },
        { worry: 'Can I pay Lina on Friday?', does: 'Friday is marked on the week, with Lina’s salary and a single ‘Covered’ badge that says yes or no.', why: ['The answer sits on the day she is asking about, so there is no sum to do.', 'A green tick and one word is quicker to trust than a column of figures.', 'The salary repeats monthly once it is set, so payday is never a new task.'], not: 'We didn’t make her compare the balance to the salary. That is a sum the app can do.', gain: 'She says yes to her first hire, calmly.', shot: 'payday', inset: true, rect: { x: 4, y: 25.5, w: 92, h: 15 }, device: 'phone', a: 'l', off: 18 }
      ]
    },
    {
      id: 'team',
      hero: 'both',
      kicker: 'With a team · 8 people',
      people: ['aisha', 'lina', 'dev', 'mira', 'arjun'],
      ask: 'Who’s waiting on me today?',
      focus: 'Approvals',
      phoneShots: [
        { id: 'task', src: IMG + 's03-ch3-phone-mytask.png', alt: 'CBX300 phone · My Task' },
        { id: 'slide', src: IMG + 's03-ch3-phone-slide-to-approve.png', alt: 'CBX300 phone · Slide to approve' },
        { id: 'maker', src: IMG + 's03-ch3-phone-maker-submitted.png', alt: 'CBX300 phone · Payment sent' },
        { id: 'approved', src: IMG + 's03-ch3-phone-approved.png', alt: 'CBX300 phone · Approved' }
      ],
      openShot: 'task',
      deskShots: [
        { id: 'queue', src: IMG + 's03-ch3-web-pending-approvals.png', alt: 'CBX300 web · Pending approvals' },
        { id: 'detail', src: IMG + 's03-ch3-web-approve-payment.png', alt: 'CBX300 web · Payment detail and approval trail' }
      ],
      openDesk: 'queue',
      deskShot: IMG + 's03-ch3-web-pending-approvals.png',
      deskAlt: 'CBX300 web · Pending approvals',
      deskTitle: 'Pending approvals',
      region: {
        phone: '[data-ans-device="phone"] [data-ans-screen]',
        desk: '[data-ans-device="desk"] [data-ans-screen]'
      },
      pointers: [
        { worry: 'What needs me right now?', does: 'Everything waiting for her is one list in My Task, grouped by day, each with a Pending Approval tag, and filters by kind (Payments, Beneficiary, Payroll).', why: ['One list means one place to look, so nothing hides in a chat thread.', 'Filters by kind keep payments, beneficiaries and payroll from mixing.'], not: 'We didn’t send approvals as messages. Requests scatter across chats and the oldest get lost.', gain: 'Nothing gets lost in a chat thread.', shot: 'task', deskShot: 'queue', rect: { x: 4, y: 28, w: 92, h: 28 }, device: 'phone', a: 'l', off: 18 },
        { worry: 'I’m out meeting a client.', does: 'On the phone, approving is a slide across the bottom of the payment, with Reject as a separate red button.', why: ['A slide can’t happen by accident in a pocket or mid-meeting.', 'Reject sits apart in its own colour, so the two are never confused.'], not: 'We didn’t shrink the desktop table onto the phone. Tiny buttons turn a five-second job into ‘later’.', gain: 'Her team isn’t stuck waiting for her.', shot: 'slide', deskShot: 'queue', rect: { x: 4, y: 87, w: 92, h: 10 }, device: 'phone', a: 'c', off: 0 },
        { worry: 'Who approved that?', does: 'Each payment carries its own trail: who started it, who approves it, and what happens next, with names and dates.', why: ['The trail sits on the payment itself, so she doesn\'t open another page.', 'Names make it personal: Lina approved, Dev paid.'], not: 'We didn’t hide history in a separate report. By the time she needs it, she would be hunting.', gain: 'Clear answers when the accountant asks.', shot: 'slide', deskShot: 'detail', rect: { x: 20, y: 76, w: 50, h: 15 }, device: 'desk', a: 'l', off: 12 },
        { worry: 'Should everyone see everything?', does: 'Requests are split by kind (single payments, bulk, service requests), each with its own count, and each role only sees the kinds it handles.', why: ['The tag shows whose job the request is, so she sees the owner at a glance.', 'Limits follow the role, so people see what they need and no more.'], not: 'We didn’t give everyone the same view. A shared view of everything is where mistakes happen.', gain: 'Lina runs payments. The big calls stay with Aisha.', shot: 'slide', deskShot: 'queue', rect: { x: 23, y: 21, w: 76, h: 13 }, device: 'desk', a: 'l', off: 12 }
      ],
      outro: [
        { shot: 'maker', kicker: 'Lina sends it.' },
        { shot: 'approved', kicker: 'Aisha approves it, between meetings.' }
      ]
    }
  ];

  function isMultiverse() {
    return document.documentElement.classList.contains('is-multiverse');
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null && text !== '') node.textContent = text;
    return node;
  }

  function html(tag, className, markup) {
    var node = el(tag, className);
    if (markup) node.innerHTML = markup;
    return node;
  }

  function ic(name) {
    var d = {
      home: '<path d="M3 9l6-5 6 5v6H3z"/>',
      payments: '<path d="M2 5h14v9H2zM2 8h14"/>',
      invoices: '<path d="M4 2h8l3 3v11H4zM7 8h5M7 11h5"/>',
      cashplan: '<path d="M3 14V8M8 14V4M13 14v-4"/>',
      salary: '<path d="M9 3a3 3 0 110 6 3 3 0 010-6zM3 15c1-3 4-4 6-4s5 1 6 4"/>',
      tax: '<path d="M4 14L14 4M5 5h.01M13 13h.01"/>',
      approvals: '<path d="M3 9l4 4 8-9"/>',
      team: '<path d="M6 4a2.5 2.5 0 110 5 2.5 2.5 0 010-5zM12 5a2 2 0 110 4 2 2 0 010-4zM2 15c.5-3 2.5-4 4-4s3.5 1 4 4M11 11c2 0 4 1 4.5 3.5"/>',
      vendors: '<path d="M2 7l2-4h10l2 4v8H2zM2 7h14M7 15v-4h4v4"/>',
      search: '<circle cx="6" cy="6" r="4"/><path d="M9 9l3 3"/>',
      check: '<path d="M2 6l3 3 5-6"/>'
    };
    return '<svg class="ic cbx-ui__ic" viewBox="0 0 18 18" aria-hidden="true">' + (d[name] || d.home) + '</svg>';
  }

  function portrait(name) {
    var faces = {
      aisha: '<path d="M8 14 C7 3 27 3 26 14 L26.5 21 C24 22 23 19 23 19 L11 19 C11 19 10 22 7.5 21 Z" fill="#1B120D"/><path d="M5 40 C5 29 10 25 17 25 C24 25 29 29 29 40 Z" fill="#E9C85A"/><rect x="14" y="20" width="6" height="7" rx="2.5" fill="#C98E6B"/><ellipse cx="17" cy="15" rx="7.5" ry="8.5" fill="#C98E6B"/><path d="M9 13 C10 5 24 4 25.5 12 C21 8.5 14 8.5 9 13 Z" fill="#1B120D"/><circle cx="13.6" cy="15" r="2.7" fill="none" stroke="#1E1510" stroke-width="1.1"/><circle cx="20.4" cy="15" r="2.7" fill="none" stroke="#1E1510" stroke-width="1.1"/><path d="M16.3 15 H17.7" stroke="#1E1510" stroke-width="1.1"/>',
      lina: '<circle cx="17" cy="4.5" r="4" fill="#6E4630"/><path d="M5 40 C5 29 10 25 17 25 C24 25 29 29 29 40 Z" fill="#8FA58A"/><rect x="14" y="20" width="6" height="7" rx="2.5" fill="#E0B08A"/><ellipse cx="17" cy="15" rx="7.5" ry="8.5" fill="#E0B08A"/><path d="M9 13 C9 4.5 25 4.5 25 13 C21 9 13 9 9 13 Z" fill="#6E4630"/>',
      dev: '<path d="M5 40 C5 29 10 25 17 25 C24 25 29 29 29 40 Z" fill="#C8664A"/><rect x="14" y="20" width="6" height="7" rx="2.5" fill="#8A5A3C"/><ellipse cx="17" cy="15" rx="7.5" ry="8.5" fill="#8A5A3C"/><path d="M9.5 11 C9.5 4.5 24.5 4.5 24.5 11 C21 8.5 13 8.5 9.5 11 Z" fill="#1B120D"/>',
      mira: '<path d="M8.5 13 C8 4 26 4 25.5 13 L26 26 L8 26 Z" fill="#3A2A20"/><path d="M5 40 C5 29 10 25 17 25 C24 25 29 29 29 40 Z" fill="#7F95B0"/><rect x="14" y="20" width="6" height="7" rx="2.5" fill="#D9A57E"/><ellipse cx="17" cy="15" rx="7.5" ry="8.5" fill="#D9A57E"/><path d="M9 13 C10 5 24 5 25 13 C20 9 14 9 9 13 Z" fill="#3A2A20"/>',
      arjun: '<path d="M5 40 C5 29 10 25 17 25 C24 25 29 29 29 40 Z" fill="#E8A96B"/><rect x="14" y="20" width="6" height="7" rx="2.5" fill="#B97A55"/><ellipse cx="17" cy="15" rx="7.5" ry="8.5" fill="#B97A55"/><circle cx="11" cy="9" r="3.4" fill="#2A1E17"/><circle cx="15" cy="6.5" r="3.4" fill="#2A1E17"/><circle cx="19.5" cy="6.5" r="3.4" fill="#2A1E17"/><circle cx="23" cy="9" r="3.4" fill="#2A1E17"/><circle cx="10" cy="12.5" r="3.4" fill="#2A1E17"/><circle cx="24" cy="12.5" r="3.4" fill="#2A1E17"/>'
    };
    return '<svg class="pp cbx-pp" viewBox="0 0 34 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + (faces[name] || faces.aisha) + '</svg>';
  }

  function av(name, size) {
    return '<span class="av cbx-av' + (size ? ' ' + size : '') + '">' + portrait(name) + '</span>';
  }

  function ini(letter, color) {
    return '<span class="ini cbx-ini" style="background:' + color + '">' + letter + '</span>';
  }

  function picture(src, alt, w, h) {
    var pic = document.createElement('picture');
    pic.className = 'cbx-ans__frame';
    var webp = src.replace(/\.png(\?.*)?$/, '.webp');
    var source = document.createElement('source');
    source.type = 'image/webp';
    source.srcset = webp;
    var img = document.createElement('img');
    img.className = 'cbx-ans__shot';
    img.src = src;
    img.alt = alt || '';
    img.width = w;
    img.height = h;
    img.decoding = 'async';
    pic.appendChild(source);
    pic.appendChild(img);
    return pic;
  }

  function shot(src, alt) {
    return picture(src, alt, 440, 956);
  }

  function navItems(items) {
    return items.map(function (item) {
      var cls = 'si cbx-si' + (item.on ? ' act is-on' : '') + (item.neu ? ' new is-new' : '');
      return '<div class="' + cls + '">' + ic(item.id) + '<span>' + item.label + '</span>' +
        (item.neu ? '<em>New</em>' : '') + '</div>';
    }).join('');
  }

  function deskChrome(ch, main) {
    return '<div class="ui desk ch-' + ch.id + '">' +
      '<div class="bar cbx-desk__bar"><i></i><i></i><i></i><span class="ttl">CBX300 · Business banking</span></div>' +
      '<div class="body cbx-desk__body">' +
        '<aside class="sb cbx-desk__sb">' +
          '<div class="logo cbx-desk__logo"><b></b><span>CBX300</span></div>' +
          '<nav>' + navItems(ch.nav) + '</nav>' +
          '<div class="sbme cbx-desk__me">' + av('aisha', 's is-s') + '<span>Aisha</span></div>' +
        '</aside>' +
        '<div class="main cbx-desk__main" data-ans-screen>' +
          '<div class="mh cbx-ui__mh"><div><span class="crumb cbx-ui__crumb">' + ch.deskCrumb + '</span><h3>' + ch.deskTitle + '</h3></div>' +
          '<div class="mhr cbx-ui__mhr"><span class="search cbx-ui__search">' + ic('search') + 'Search</span>' + av('aisha', 's is-s') + '</div></div>' +
          main +
        '</div>' +
      '</div></div>';
  }

  function deskMain(ch) {
    if (ch.id === 'solo') {
      return '<div class="view v1">' +
        '<section class="card c-inv" data-ans-region>' +
          '<header><h4>Invoices</h4><div class="seg"><span class="on is-on">All</span><span>Unpaid</span><span>Paid</span></div></header>' +
          '<div class="thead"><span>Client</span><span>Amount</span><span>Status</span><span></span></div>' +
          '<div class="row hi is-hi">' + ini('M', '#E8A96B') + '<div class="who cbx-who"><b>Client A</b><span>INV ——</span></div><span class="amt cbx-amt">₹ ——</span><span class="st paid cbx-st is-paid">Paid</span><div class="act"><span class="match"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 6l3 3 5-6"/></svg>Matched to INV ——</span></div></div>' +
          '<div class="row">' + ini('K', '#C8664A') + '<div class="who cbx-who"><b>Client B</b><span>INV ——</span></div><span class="amt cbx-amt">₹ ——</span><span class="st late cbx-st is-late">Overdue · oldest</span><div class="act"><span class="btn nudge cbx-btn">Nudge</span></div></div>' +
          '<div class="row">' + ini('R', '#7F95B0') + '<div class="who cbx-who"><b>Client C</b><span>INV ——</span></div><span class="amt cbx-amt">₹ ——</span><span class="st late cbx-st is-late">Overdue</span><div class="act"><span class="btn nudge cbx-btn">Nudge</span></div></div>' +
          '<div class="row">' + ini('S', '#8FA58A') + '<div class="who cbx-who"><b>Client D</b><span>INV ——</span></div><span class="amt cbx-amt">₹ ——</span><span class="st due cbx-st is-due">Due Fri</span><div class="act"><span class="muted">Sent Mon</span></div></div>' +
        '</section>' +
        '<section class="card c-log"><header><h4>Today</h4><span class="pill soft">Money in</span></header>' +
          '<div class="tl"><div class="ev"><i class="e1"></i><b>Payment received</b><span>Client A · matched to INV ——</span></div></div>' +
        '</section></div>';
    }
    if (ch.id === 'hire') {
      return '<div class="view v2">' +
        '<section class="card c-bal" data-ans-region>' +
          '<header><h4>Balance</h4><span class="pill soft">This month</span></header>' +
          '<div class="bigamt cbx-bigamt">₹ ——</div>' +
          '<div class="sbar cbx-sbar"><i class="s1 is-safe"></i><i class="s2 is-aside"></i><i class="s3 is-in"></i></div>' +
          '<div class="legend cbx-legend"><div><i class="s1"></i><b>Safe to spend</b><span>₹ ——</span></div><div><i class="s2"></i><b>Set aside</b><span>₹ ——</span></div><div><i class="s3"></i><b>Coming in</b><span>₹ ——</span></div></div>' +
        '</section>' +
        '<section class="card c-week">' +
          '<header><h4>This week</h4></header>' +
          '<div class="days7 cbx-days7"><div class="day"><span>Mon</span></div><div class="day"><span>Tue</span></div><div class="day"><span>Wed</span></div><div class="day"><span>Thu</span></div><div class="day pay"><span class="is-pay">Fri</span></div><div class="day"><span>Sat</span></div><div class="day"><span>Sun</span></div></div>' +
          '<div class="paychip cbx-paychip">' + av('lina') + '<div><b>Lina’s salary</b><span>Payday · Friday</span></div><span class="ok cbx-ok">Covered <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 6l3 3 5-6"/></svg></span></div>' +
        '</section></div>';
    }
    return '<div class="view v3">' +
      '<section class="card c-appr" data-ans-region>' +
        '<header><h4 data-ans-t="waiting">Waiting on you</h4><span class="cnt">4</span><span class="pill soft">Today</span></header>' +
        '<div class="row">' + av('lina') + '<div class="who cbx-who"><b>Lina · Vendor payment</b><span>Print shop</span></div><span class="role r-payments cbx-role" data-ans-t="role">Payments</span><span class="amt cbx-amt">₹ ——</span><span class="btn x cbx-btn is-ghost">Decline</span><span class="btn ok cbx-btn is-ok">Approve</span></div>' +
        '<div class="row">' + av('dev') + '<div class="who cbx-who"><b>Dev · Reimbursement</b><span>Client travel</span></div><span class="role r-approver cbx-role">Approver</span><span class="amt cbx-amt">₹ ——</span><span class="btn x cbx-btn is-ghost">Decline</span><span class="btn ok cbx-btn is-ok">Approve</span></div>' +
        '<div class="row">' + av('mira') + '<div class="who cbx-who"><b>Mira · New vendor</b><span>Packaging supplier</span></div><span class="role r-ops cbx-role">Ops</span><span class="amt cbx-amt">₹ ——</span><span class="btn x cbx-btn is-ghost">Decline</span><span class="btn ok cbx-btn is-ok">Approve</span></div>' +
        '<div class="row">' + av('arjun') + '<div class="who cbx-who"><b>Arjun · Subscription</b><span>Design software</span></div><span class="role r-design cbx-role">Design</span><span class="amt cbx-amt">₹ ——</span><span class="btn x cbx-btn is-ghost">Decline</span><span class="btn ok cbx-btn is-ok">Approve</span></div>' +
        '<div class="alog cbx-alog" data-ans-t="log"><span class="lbl">Earlier today</span>' + av('lina', 's is-s') + '<b>Lina approved</b><span>Courier invoice</span><i></i>' + av('dev', 's is-s') + '<b>Dev paid</b><span>Office rent</span></div>' +
      '</section></div>';
  }

  function matchMark() {
    return '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 6l3 3 5-6"/></svg>';
  }

  function phoneScreen(ch) {
    if (ch.id === 'solo') {
      return '<div class="phd cbx-ph__head"><div><span class="crumb">Home</span><h3>Invoices</h3></div>' + av('aisha', 's is-s') + '</div>' +
        '<div class="cbx-ph__body" data-ans-screen><div class="card c-inv" data-ans-region>' +
          '<header><h4>Invoices</h4><div class="seg"><span class="on">All</span><span>Unpaid</span><span>Paid</span></div></header>' +
          '<div class="thead"><span>Client</span><span>Amount</span><span>Status</span><span></span></div>' +
          '<div class="row hi">' + ini('M', '#E8A96B') + '<div class="who cbx-who"><b>Client A</b><span>INV ——</span></div><span class="amt">₹ ——</span><span class="st paid" data-ans-t="paid">Paid</span><div class="act"><span class="match" data-ans-t="match">' + matchMark() + 'Matched to INV ——</span></div></div>' +
          '<div class="row">' + ini('K', '#C8664A') + '<div class="who cbx-who"><b>Client B</b><span>INV ——</span></div><span class="amt">₹ ——</span><span class="st late" data-ans-t="owe">Overdue · oldest</span><div class="act"><span class="btn nudge cbx-btn" data-ans-t="nudge">Nudge</span></div></div>' +
          '<div class="row">' + ini('R', '#7F95B0') + '<div class="who cbx-who"><b>Client C</b><span>INV ——</span></div><span class="amt">₹ ——</span><span class="st late">Overdue</span><div class="act"><span class="btn nudge">Nudge</span></div></div>' +
          '<div class="row">' + ini('S', '#8FA58A') + '<div class="who cbx-who"><b>Client D</b><span>INV ——</span></div><span class="amt">₹ ——</span><span class="st due">Due Fri</span><div class="act"><span class="muted">Sent Mon</span></div></div>' +
        '</div></div>';
    }
    if (ch.id === 'hire') {
      return '<div class="phd cbx-ph__head"><div><span class="crumb">Planning</span><h3>Cash plan</h3></div>' + av('aisha', 's is-s') + '</div>' +
        '<div class="cbx-ph__body" data-ans-screen><div class="card c-bal">' +
          '<header><h4>Balance</h4><span class="pill soft">This month</span></header>' +
          '<div class="bigamt">₹ ——</div>' +
          '<div class="sbar"><i class="s1" data-ans-t="safe"></i><i class="s2"></i><i class="s3"></i></div>' +
          '<div class="legend">' +
            '<div><i class="s1"></i><b>Safe to spend</b><span>₹ ——</span></div>' +
            '<div data-ans-t="aside"><i class="s2"></i><b>Set aside</b><span>₹ ——</span></div>' +
            '<div data-ans-t="coming"><i class="s3"></i><b>Coming in</b><span>₹ ——</span></div>' +
          '</div>' +
        '</div>' +
        '<div class="card c-week">' +
          '<header><h4>This week</h4></header>' +
          '<div class="days7"><div class="day"><span>Mon</span></div><div class="day"><span>Tue</span></div><div class="day"><span>Wed</span></div><div class="day"><span>Thu</span></div><div class="day pay"><span>Fri</span></div><div class="day"><span>Sat</span></div><div class="day"><span>Sun</span></div></div>' +
          '<div class="paychip">' + av('lina') + '<div><b>Lina’s salary</b><span>Payday · Friday</span></div><span class="ok" data-ans-t="payday">Covered <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 6l3 3 5-6"/></svg></span></div>' +
        '</div></div>';
    }
    return '<div class="phd cbx-ph__head"><div><span class="crumb">Team</span><h3>Waiting on you</h3></div><span class="cnt">1</span></div>' +
      '<div class="cbx-ph__body" data-ans-screen><div class="card c-appr">' +
        '<div class="row">' + av('lina') + '<div class="who cbx-who"><b>Lina · Vendor payment</b><span>Print shop</span></div></div>' +
        '<div class="ph-cta"><span class="btn ok is-ok cbx-btn is-lg" data-ans-t="approve">Approve</span><span class="btn x cbx-btn is-ghost is-lg">Decline</span></div>' +
      '</div></div>';
  }

  function pfMark(pic, src) {
    if (!src || (src.indexOf('s03-ch1-phone-home') === -1 && src.indexOf('s04-grow-2-home') === -1)) return;
    var mark = el('span', 'device-pf');
    mark.setAttribute('aria-hidden', 'true');
    pic.appendChild(mark);
  }

  function iphoneButtons(dev) {
    dev.appendChild(el('i', 'device-iphone__island'));
    ['action', 'vol-up', 'vol-dn', 'power'].forEach(function (name) {
      dev.appendChild(el('i', 'device-iphone__btn is-' + name));
    });
  }

  function browserBar() {
    var bar = el('div', 'device-browser__bar');
    var i;
    for (i = 0; i < 3; i += 1) bar.appendChild(el('i', 'device-browser__dot'));
    bar.appendChild(el('span', 'device-browser__url'));
    return bar;
  }

  function buildDesk(ch) {
    var wrap = el('div', 'cbx-desk device-browser');
    wrap.setAttribute('data-slot', 'desk');
    wrap.setAttribute('data-ans-device', 'desk');
    var screen = el('div', 'device-browser__screen');
    screen.setAttribute('data-ans-screen', '');
    var shots = ch.deskShots;
    if (shots && shots.length) {
      var openId = ch.openDesk || shots[0].id;
      shots.forEach(function (s) {
        var frame = picture(s.src, s.alt, 1440, 900);
        frame.setAttribute('data-shot', s.id);
        if (s.id !== openId) frame.style.opacity = '0';
        screen.appendChild(frame);
      });
    } else if (ch.deskShot) {
      var frame = picture(ch.deskShot, ch.deskAlt || ('CBX300 web · ' + ch.deskTitle), 1440, 900);
      frame.setAttribute('data-shot', 'desk');
      screen.appendChild(frame);
    } else {
      wrap.innerHTML = deskChrome(ch, deskMain(ch));
      return wrap;
    }
    wrap.appendChild(browserBar());
    wrap.appendChild(screen);
    return wrap;
  }

  function buildPhone(ch) {
    var wrap = el('div', 'cbx-phone device-iphone');
    wrap.setAttribute('data-slot', 'phone');
    wrap.setAttribute('data-ans-device', 'phone');
    if (ch.phoneShots && ch.phoneShots.length) {
      var screen = el('div', 'device-iphone__screen');
      screen.setAttribute('data-ans-screen', '');
      var stack = el('div', 'cbx-ans__stack');
      var openId = ch.openShot || ch.phoneShots[0].id;
      ch.phoneShots.forEach(function (s) {
        var frame = picture(s.src, s.alt, 440, 956);
        frame.setAttribute('data-shot', s.id);
        if (s.id !== openId) frame.style.opacity = '0';
        pfMark(frame, s.src);
        stack.appendChild(frame);
      });
      if (ch.inset) {
        var inset = picture(ch.inset.src, ch.inset.alt, 440, 574);
        inset.classList.add('cbx-ans__inset');
        inset.setAttribute('data-inset', '');
        stack.appendChild(inset);
      }
      screen.appendChild(stack);
      wrap.appendChild(screen);
      iphoneButtons(wrap);
      return wrap;
    }
    if (ch.phoneShot) {
      var screenOne = el('div', 'device-iphone__screen');
      screenOne.setAttribute('data-ans-screen', '');
      var one = picture(ch.phoneShot, 'CBX300 phone · ' + ch.focus, 440, 956);
      pfMark(one, ch.phoneShot);
      screenOne.appendChild(one);
      wrap.appendChild(screenOne);
      iphoneButtons(wrap);
      return wrap;
    }
    wrap.innerHTML =
      '<div class="cbx-phone__bezel">' +
        '<div class="cbx-phone__stat"><span>9:41</span><b></b></div>' +
        '<div class="cbx-phone__screen ui phone">' + phoneScreen(ch) + '</div>' +
        '<div class="cbx-phone__tabs">' +
          '<span class="tb">Home</span><span class="tb act is-on">' + ch.focus + '</span><span class="tb">Pay</span>' +
        '</div>' +
        '<i class="cbx-phone__home"></i>' +
      '</div>';
    return wrap;
  }

  function peopleRow(names) {
    return '<span class="mk cbx-mk">' + names.map(function (n) {
      return '<span class="mkp cbx-mkp">' + portrait(n) + '</span>';
    }).join('') + '</span>';
  }

  function buildWorld(ch, layer) {
    var world = el('div', 'cbx-ans__world cbx-d1');
    if (!ch.noDesk) world.appendChild(buildDesk(ch));
    if (layer !== 'blur' || ch.hero === 'both') {
      world.appendChild(buildPhone(ch));
    }
    return world;
  }

  function buildScene(ch, index) {
    var scene = el('div', 'cbx-ans__scene is-' + ch.hero);
    scene.setAttribute('data-ans-ch', String(index));
    scene.setAttribute('data-ans-hero', ch.hero);
    if (index) scene.setAttribute('hidden', '');
    scene.style.opacity = index ? '0' : '1';

    var blur = el('div', 'cbx-ans__cam is-blur');
    var blurIn = el('div', 'cbx-ans__camin');
    blurIn.appendChild(buildWorld(ch, 'blur'));
    blur.appendChild(blurIn);

    var dim = el('div', 'cbx-ans__dim');
    var nbg = el('div', 'cbx-ans__nbg');

    var sharp = el('div', 'cbx-ans__cam is-sharp');
    var sharpIn = el('div', 'cbx-ans__camin');
    sharpIn.appendChild(buildWorld(ch, 'sharp'));
    sharp.appendChild(sharpIn);

    var spot = el('div', 'cbx-ans__spot');
    spot.innerHTML = '<i class="cbx-vf vf is-tl tl"></i><i class="cbx-vf vf is-tr tr"></i><i class="cbx-vf vf is-bl bl"></i><i class="cbx-vf vf is-br br"></i>' +
      '<span class="cbx-vfl vfl"><b></b>In focus · ' + ch.focus + '</span>';

    var note = el('div', 'cbx-ans__note');
    var col = el('div', 'cbx-ans__ncol ncol');
    col.style.left = NCOL.left + 'px';
    col.style.width = NCOL.width + 'px';
    var sline = html('div', 'cbx-ans__sline nsline', '<span class="sline cbx-sline">' + peopleRow(ch.people) + '<span>' + ch.kicker + '</span></span>');
    var ask = el('h2', 'cbx-ans__ask q serif', '“' + ch.ask + '”');
    var wrap = el('div', 'cbx-ans__panel');
    wrap.setAttribute('aria-live', 'polite');
    var head = el('div', 'cbx-ans__phead');
    var counts = el('div', 'cbx-ans__count');
    var ticks = el('div', 'cbx-ans__ticks');
    ticks.setAttribute('aria-hidden', 'true');
    ch.pointers.forEach(function (p, i) {
      counts.appendChild(html('span', 'cbx-ans__cn', '<b>' + (i + 1) + '</b> of ' + ch.pointers.length));
      ticks.appendChild(html('i', 'cbx-ans__tick', '<b></b>'));
    });
    head.appendChild(counts);
    head.appendChild(ticks);
    wrap.appendChild(head);
    var body = el('div', 'cbx-ans__pbody');
    ch.pointers.forEach(function (p, i) {
      var ptr = el('div', 'cbx-ans__ptr cbx-ans__step ptr');
      ptr.setAttribute('data-n', String(i));
      ptr.setAttribute('data-device', p.device);
      ptr.innerHTML =
        '<p class="cbx-ans__pw pw cbx-ans__ln">“' + p.worry + '”</p>' +
        '<div class="cbx-ans__blk cbx-ans__ln"><h4 class="cbx-ans__lab2">The design decision</h4><p class="cbx-ans__pd pd">' + p.does + '</p></div>' +
        '<div class="cbx-ans__blk cbx-ans__ln"><h4 class="cbx-ans__lab2">Why it works</h4><ul class="cbx-ans__why">' +
          p.why.map(function (w) { return '<li>' + w + '</li>'; }).join('') + '</ul></div>' +
        '<div class="cbx-ans__blk cbx-ans__ln"><h4 class="cbx-ans__lab2">What we didn’t do</h4><p class="cbx-ans__not">' + p.not + '</p></div>' +
        '<p class="cbx-ans__pg pg cbx-ans__ln"><i>↳</i><span>' + p.gain + '</span></p>';
      body.appendChild(ptr);
    });
    wrap.appendChild(body);
    col.appendChild(sline);
    col.appendChild(ask);
    col.appendChild(wrap);
    if (ch.outro) {
      ch.outro.forEach(function (o, i) {
        var kick = el('p', 'cbx-ans__kicker', o.kicker);
        kick.setAttribute('data-kicker', String(i));
        col.appendChild(kick);
      });
    }
    note.appendChild(col);

    scene.appendChild(blur);
    scene.appendChild(dim);
    scene.appendChild(nbg);
    scene.appendChild(sharp);
    scene.appendChild(spot);
    scene.appendChild(note);
    return scene;
  }

  function buildHud(chapters, num, title) {
    var hud = el('div', 'cbx-ans__hud hud');
    var bars = '';
    chapters.forEach(function () { bars += '<i><b></b></i>'; });
    hud.innerHTML = '<div class="cbx-ans__lab lab"><span class="cbx-ans__num n">' + num + '</span><span class="cbx-ans__title t">' + title + '</span></div>' +
      '<div class="cbx-ans__prog prog" aria-hidden="true">' + bars + '</div>';
    return hud;
  }

  function build(config) {
    config = config || {};
    var chapters = config.chapters || CHAPTERS;
    var section = el('section', 'cbx-ans');
    if (!config.num) section.setAttribute('data-cbx-section', '03');
    else section.setAttribute('data-cbx-section', config.num);
    section.setAttribute('data-cbx-live', '');
    section.setAttribute(config.attr || 'data-cbx-answers', '');
    section.setAttribute('aria-label', config.aria || 'How our bank answers her');
    section._cbxChapters = chapters;
    if (config.refreshPriority != null) section._cbxRefresh = config.refreshPriority;
    var fit = el('div', 'cbx-ans__fit');
    fit.appendChild(buildHud(chapters, config.num || '03', config.title || 'How our bank answers her'));
    var stage = el('div', 'cbx-ans__stage');
    var cream = el('div', 'cbx-ans__cream');
    stage.appendChild(cream);
    chapters.forEach(function (ch, i) {
      stage.appendChild(buildScene(ch, i));
    });
    fit.appendChild(stage);
    section.appendChild(fit);
    return section;
  }

  function buildNext() {
    var section = el('section', 'cbx-next');
    section.setAttribute('data-cbx-section', '04');
    section.setAttribute('data-cbx-next', '');
    section.innerHTML = '<p class="cbx-next__kicker">Next</p><h2 class="cbx-next__title">04</h2><p class="cbx-next__body">Next chapter in this case.</p>';
    return section;
  }

  function fitScale(section) {
    var s = Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H);
    if (!isFinite(s) || s <= 0) s = 1;
    section.style.setProperty('--ans-scale', String(s));
    return s;
  }

  function stageRect(el, root, scale) {
    var a = el.getBoundingClientRect();
    var b = root.getBoundingClientRect();
    var s = scale || 1;
    return {
      x: (a.left - b.left) / s,
      y: (a.top - b.top) / s,
      w: a.width / s,
      h: a.height / s,
      r: (a.right - b.left) / s,
      btm: (a.bottom - b.top) / s
    };
  }

  function textBounds(el, root, scale) {
    var range = document.createRange();
    range.selectNodeContents(el);
    var rs = Array.prototype.slice.call(range.getClientRects());
    if (!rs.length) return stageRect(el, root, scale);
    var b = root.getBoundingClientRect();
    var s = scale || 1;
    var left = Math.min.apply(null, rs.map(function (q) { return q.left; }));
    var right = Math.max.apply(null, rs.map(function (q) { return q.right; }));
    return { l: (left - b.left) / s, r: (right - b.left) / s };
  }

  function insetPath(x, y, w, h, r) {
    return 'inset(' + y + 'px ' + (STAGE_W - x - w) + 'px ' + (STAGE_H - y - h) + 'px ' + x + 'px round ' + r + 'px)';
  }

  function placeNote(scene) {
    var col = scene.querySelector('.cbx-ans__ncol');
    var H = col.offsetHeight;
    col.style.top = Math.round(84 + Math.max(0, (768 - H) / 2)) + 'px';
    return { H: H };
  }

  function anchorPt(r, a, off) {
    off = off || 0;
    var m = {
      l: [r.x - off, r.y + r.h / 2],
      r: [r.r + off, r.y + r.h / 2],
      t: [r.x + r.w / 2, r.y - off],
      b: [r.x + r.w / 2, r.btm + off],
      c: [r.x + r.w / 2, r.y + r.h / 2],
      tr: [r.r, r.y],
      tl: [r.x, r.y],
      br: [r.r, r.btm],
      bl: [r.x, r.btm]
    };
    return m[a] || m.c;
  }

  function pointerRect(scene, p, root, scale) {
    var scope = scene.querySelector('.cbx-ans__cam.is-sharp [data-ans-device="' + p.device + '"]') ||
      scene.querySelector('.cbx-ans__cam.is-sharp');
    if (p.rect) {
      var slot = scene.querySelector('.cbx-ans__cam.is-sharp [data-ans-device="' + p.device + '"] [data-ans-screen]') || scope;
      var sr = stageRect(slot, root, scale);
      var q = { x: sr.x + sr.w * p.rect.x / 100, y: sr.y + sr.h * p.rect.y / 100, w: sr.w * p.rect.w / 100, h: sr.h * p.rect.h / 100 };
      q.r = q.x + q.w;
      q.btm = q.y + q.h;
      return q;
    }
    var t = p.t ? scope.querySelector(p.t) : null;
    return t ? stageRect(t, root, scale) : null;
  }

  function fitAxis(desired, vlo, vhi, blo, bhi) {
    /* Keep the element fully inside the safe window first; then keep the
       window inside the world (no empty bezel) when both can hold. */
    var lo = Math.max(vlo, blo);
    var hi = Math.min(vhi, bhi);
    if (blo <= bhi && lo <= hi) return Math.min(hi, Math.max(lo, desired));
    return Math.min(vhi, Math.max(vlo, desired));
  }

  /* One camera pose per pointer. Poses are solved in world space (the
     camera at the chapter pose Z is the reference), so each push-in lands
     on the exact element and keeps it fully inside the lit window. */
  function buildPoses(scene, ch, Z, scale, opts) {
    opts = opts || {};
    if (!opts.keep) {
      Array.prototype.forEach.call(scene.querySelectorAll('.cbx-ans__mkr, .cbx-ans__ring, .cbx-ans__mpulse, .cbx-ans__rpulse'), function (n) {
        n.parentNode.removeChild(n);
      });
    }
    var sharp = scene.querySelector('.cbx-ans__cam.is-sharp');
    var inner = sharp.querySelector('.cbx-ans__camin');
    var isPhone = scene.classList.contains('is-phone');
    var kids = Array.prototype.map.call(inner.querySelectorAll('[data-ans-device]'), function (n) { return stageRect(n, scene, scale); });
    var wb = {
      x: Math.min.apply(null, kids.map(function (r) { return (r.x - Z.tx) / Z.s; })),
      y: Math.min.apply(null, kids.map(function (r) { return (r.y - Z.ty) / Z.s; })),
      r: Math.max.apply(null, kids.map(function (r) { return (r.r - Z.tx) / Z.s; })),
      b: Math.max.apply(null, kids.map(function (r) { return (r.btm - Z.ty) / Z.s; }))
    };
    var side = opts.side != null ? opts.side : 36;
    var topIn = opts.topIn != null ? opts.topIn : (isPhone ? 112 : 44);
    var botIn = opts.botIn != null ? opts.botIn : 36;
    var out = [];
    ch.pointers.forEach(function (p, i) {
      var tr = pointerRect(scene, p, scene, scale);
      if (!tr) { out.push(null); return; }
      var wr = { x: (tr.x - Z.tx) / Z.s, y: (tr.y - Z.ty) / Z.s, w: tr.w / Z.s, h: tr.h / Z.s };
      var capW = Z.W - 2 * side;
      var capH = Z.H - topIn - botIn;
      var s = Math.min(Z.W * (p.fillW || opts.fillW || 0.5) / wr.w, Z.H * (p.fillH || opts.fillH || 0.45) / wr.h);
      s = Math.min(Math.max(s, Z.s * (p.minMul || opts.minMul || 1.45)), Z.s * (p.maxMul || opts.maxMul || 2.6));
      s = Math.min(s, capW / wr.w, capH / wr.h);
      if (opts.identity) s = 1;
      var cx = Z.X + Z.W / 2;
      var cy = Z.Y + topIn + capH / 2;
      var tx0 = cx - (wr.x + wr.w / 2) * s;
      var ty0 = cy - (wr.y + wr.h / 2) * s;
      if (opts.identity) { tx0 = Z.tx; ty0 = Z.ty; }
      var tx = fitAxis(tx0, Z.X + side - wr.x * s, Z.X + Z.W - side - (wr.x + wr.w) * s, Z.X + Z.W - wb.r * s, Z.X - wb.x * s);
      var ty = fitAxis(ty0, Z.Y + topIn - wr.y * s, Z.Y + Z.H - botIn - (wr.y + wr.h) * s, Z.Y + Z.H - wb.b * s, Z.Y - wb.y * s);
      if (opts.identity) { tx = Z.tx; ty = Z.ty; }
      var R = { x: tx + wr.x * s, y: ty + wr.y * s, w: wr.w * s, h: wr.h * s };
      var pad = 6;
      var ring = el('div', 'cbx-ans__ring ring');
      ring.style.left = (R.x - pad) + 'px';
      ring.style.top = (R.y - pad) + 'px';
      ring.style.width = (R.w + 2 * pad) + 'px';
      ring.style.height = (R.h + 2 * pad) + 'px';
      sharp.appendChild(ring);
      var mx = R.x - pad;
      var my = R.y - pad;
      var mkr = el('div', 'cbx-ans__mkr mkr');
      mkr.textContent = String(i + 1);
      mkr.style.left = mx + 'px';
      mkr.style.top = my + 'px';
      scene.appendChild(mkr);
      out.push({
        pose: { x: tx, y: ty, s: s },
        R: R, ring: ring, mkr: mkr
      });
    });
    return out;
  }

  function zoomBox(scene, ch, scale) {
    var inner = scene.querySelector('.cbx-ans__cam.is-sharp .cbx-ans__camin');
    var phoneEl = inner.querySelector('[data-ans-device="phone"]');
    var deskEl = inner.querySelector('[data-ans-device="desk"]');
    var SHADOW = 40;
    var COL_GAP = 30;
    var MAX_RIGHT = NCOL.left - SHADOW - COL_GAP;
    var d = { x: DEST.x, w: Math.min(DEST.w, MAX_RIGHT - DEST.x), cy: DEST.cy };
    var R;
    var s;
    var tx;
    var ty;
    var hh;
    var y0;
    if (ch.hero === 'phone' && phoneEl) {
      R = stageRect(phoneEl, inner, scale);
      hh = Math.max(1, R.btm - R.y);
      /* Header pill bottom is 74 on the 1440 stage. Keep ≥12px of
         viewport gap under it (same as 390) so 9:41 is not covered.
         NCOL pointers stay put; only the zoom dest drops. */
      var minTop = 74 + 12 / Math.max(scale, 0.01) + 2 + 16;
      var maxH = STAGE_H - 12 - minTop;
      s = Math.min(d.w / Math.max(1, R.r - R.x), maxH / hh, (STAGE_H - 56) / hh);
      var deskR = deskEl ? stageRect(deskEl, inner, scale) : null;
      var worldLeft = deskR ? Math.min(R.x, deskR.x) : R.x;
      tx = d.x - worldLeft * s;
      var destRight = d.x + d.w;
      var mappedPhoneRight = tx + R.r * s;
      if (mappedPhoneRight > destRight) tx -= mappedPhoneRight - destRight;
      var mappedPhoneLeft = tx + R.x * s;
      if (mappedPhoneLeft < d.x) tx += d.x - mappedPhoneLeft;
      hh *= s;
      y0 = d.cy - hh / 2;
      if (y0 < minTop) y0 = minTop;
      ty = y0 - R.y * s;
    } else {
      var nodes = [];
      if (ch.region.desk) {
        var desk = inner.querySelector(ch.region.desk) || deskEl;
        if (desk) nodes.push(desk);
      }
      if (ch.region.phone) {
        var phone = inner.querySelector(ch.region.phone) || phoneEl;
        if (phone) nodes.push(phone);
      }
      if (!nodes.length) nodes.push(phoneEl || inner);
      var rs = nodes.map(function (n) { return stageRect(n, inner, scale); });
      R = {
        x: Math.min.apply(null, rs.map(function (r) { return r.x; })),
        y: Math.min.apply(null, rs.map(function (r) { return r.y; })),
        r: Math.max.apply(null, rs.map(function (r) { return r.r; })),
        b: Math.max.apply(null, rs.map(function (r) { return r.btm; }))
      };
      s = d.w / Math.max(1, R.r - R.x);
      tx = d.x - R.x * s;
      if (phoneEl) {
        var phoneR = stageRect(phoneEl, inner, scale);
        var cap = (MAX_RIGHT - d.x) / Math.max(1, phoneR.r - R.x);
        if (cap > 0 && cap < s) {
          s = cap;
          tx = d.x - R.x * s;
        }
      }
      hh = (R.b - R.y) * s;
      y0 = d.cy - hh / 2;
      ty = y0 - R.y * s;
    }
    var pad = 16;
    var X = d.x - pad;
    var Y = y0 - pad;
    var W = d.w + 2 * pad;
    var H = hh + 2 * pad;
    if (X + W > MAX_RIGHT) W = MAX_RIGHT - X;
    if (Y < 12) {
      H += Y - 12;
      Y = 12;
    }
    if (Y + H > STAGE_H - 12) H = STAGE_H - 12 - Y;
    if (H < 220) H = 220;
    return { s: s, tx: tx, ty: ty, X: X, Y: Y, W: W, H: H };
  }

  function titleGlide(scene, k, scale, stage) {
    placeNote(scene);
    var sl = scene.querySelector('.cbx-ans__sline');
    var q = scene.querySelector('.cbx-ans__ask');
    var sli = sl.querySelector('.sline') || sl;
    var WTOP = 70;
    var GAPW = 12;
    var a = stageRect(sl, stage, scale);
    var b = stageRect(q, stage, scale);
    var at = textBounds(sli, stage, scale);
    var bt = textBounds(q, stage, scale);
    var sdx = 720 - (at.l + at.r) / 2;
    var sdy = WTOP - a.y;
    var qdx = 720 - (bt.l + bt.r) / 2;
    var qdy = WTOP + a.h + GAPW - b.y;
    return { sl: sl, q: q, sdx: sdx, sdy: sdy, qdx: qdx, qdy: qdy, bottom: WTOP + a.h + GAPW + b.h };
  }

  function prepareChapter(scene, ch, k, P, stage, scale, colors) {
    var Z = zoomBox(scene, ch, scale);
    var cams = scene.querySelectorAll('.cbx-ans__camin');
    var gsap = window.gsap;
    gsap.set(cams, { x: Z.tx, y: Z.ty, scale: Z.s, transformOrigin: '0 0', force3D: false });
    if (cams[0]) cams[0].offsetWidth;
    var poses = buildPoses(scene, ch, Z, scale);
    if (cams[0]) gsap.set(cams[0], { x: P.tx, y: P.ty, scale: P.s, force3D: false });
    if (cams[1]) gsap.set(cams[1], { x: P.tx, y: P.ty, scale: P.s, force3D: true });
    if (!cams[1] && cams[0]) gsap.set(cams[0], { x: P.tx, y: P.ty, scale: P.s, force3D: true });
    var sharp = scene.querySelector('.cbx-ans__cam.is-sharp');
    var spot = scene.querySelector('.cbx-ans__spot');
    gsap.set(sharp, { clipPath: insetPath(P.tx, P.ty, P.w, P.h, 16 * P.s) });
    gsap.set(spot, { left: P.tx, top: P.ty, width: P.w, height: P.h, opacity: 0 });
    gsap.set(scene.querySelectorAll('.cbx-ans__dim, .cbx-ans__nbg, .cbx-vf, .cbx-vfl'), { opacity: 0 });
    var mk = poses.map(function (q) { return q && q.mkr; });
    var rg = poses.map(function (q) { return q && q.ring; });
    var mp = mk.map(function (m) {
      var e = el('div', 'cbx-ans__mpulse mpulse');
      e.style.left = m.style.left;
      e.style.top = m.style.top;
      m.parentNode.insertBefore(e, m);
      return e;
    });
    gsap.set(mk.concat(rg, mp), { opacity: 0 });
    var panel = scene.querySelector('.cbx-ans__panel');
    var steps = Array.prototype.slice.call(scene.querySelectorAll('.cbx-ans__step'));
    var counts = Array.prototype.slice.call(scene.querySelectorAll('.cbx-ans__cn'));
    var fills = Array.prototype.slice.call(scene.querySelectorAll('.cbx-ans__tick b'));
    var lines = steps.map(function (st, i) {
      var ls = [counts[i]].concat(Array.prototype.slice.call(st.querySelectorAll('.cbx-ans__ln')));
      gsap.set(ls, { opacity: 0, y: IN_DY, scale: 0.985, transformOrigin: '0 50%' });
      return ls;
    });
    gsap.set(fills, { scaleX: 0, transformOrigin: '0 50%' });
    var ctag = scene.querySelector('.cbx-ans__ctag');
    gsap.set(ctag ? [panel, ctag] : panel, { opacity: 0 });
    gsap.set(scene.querySelectorAll('[data-inset]'), { y: 0 });
    gsap.set(panel, { y: 18 });
    var h = titleGlide(scene, k, scale, stage);
    var mkav = h.sl.querySelectorAll('.mk, .cbx-mk');
    var slt = h.sl.querySelectorAll('.sline > span, .cbx-sline > span');
    gsap.set(h.sl, { x: h.sdx, y: h.sdy, opacity: k ? 0 : 1 });
    gsap.set(h.q, { x: h.qdx, y: h.qdy, color: colors.ink, opacity: k ? 0 : 1 });
    gsap.set(slt, { color: colors.ink2 });
    gsap.set(mkav, { backgroundColor: colors.coffee, boxShadow: 'inset 0 0 0 1px rgba(244,239,230,0)' });
    if (k) gsap.set(scene, { opacity: 0 });
    if (isMultiverse() && !h.q.classList.contains('glitch')) {
      h.q.classList.add('glitch');
      h.q.setAttribute('data-text', h.q.textContent);
    }
    var afterPose = ch.pointers.map(function (p) {
      if (!p.after) return null;
      var ghost = { hero: ch.hero, pointers: [p.after] };
      var extra = buildPoses(scene, ghost, Z, scale, { keep: true });
      var q = extra[0];
      if (q && q.ring && q.ring.parentNode) q.ring.parentNode.removeChild(q.ring);
      if (q && q.mkr && q.mkr.parentNode) q.mkr.parentNode.removeChild(q.mkr);
      return q;
    });
    return {
      scene: scene,
      ch: ch,
      colors: colors,
      afterPose: afterPose,
      cams: cams,
      stepCam: cams[cams.length - 1],
      sharp: sharp,
      spot: spot,
      Z: Z,
      box: { l: P.tx, t: P.ty, r: P.tx + P.w, b: P.ty + P.h, rad: 16 * P.s },
      poses: poses,
      mk: mk,
      rg: rg,
      mp: mp,
      panel: panel,
      lines: lines,
      fills: fills,
      ctag: ctag,
      sl: h.sl,
      q: h.q,
      sdx: h.sdx,
      sdy: h.sdy,
      qdx: h.qdx,
      qdy: h.qdy,
      slt: slt,
      mkav: mkav,
      vf: scene.querySelectorAll('.cbx-vf, .cbx-vfl'),
      dim: scene.querySelector('.cbx-ans__dim'),
      nbg: scene.querySelector('.cbx-ans__nbg'),
      layers: scene.querySelectorAll('.cbx-ans__cam, .cbx-ans__spot, .cbx-ans__dim, .cbx-ans__nbg')
    };
  }

  function widePose(stage, scenes, scale) {
    var maxB = 120;
    scenes.forEach(function (scene) {
      var h = titleGlide(scene, 0, scale, stage);
      maxB = Math.max(maxB, h.bottom);
    });
    var ty0 = Math.ceil(maxB + 24);
    var s0 = Math.min(0.74, (STAGE_H - 40 - ty0) / STAGE_H);
    return { s: s0, tx: (STAGE_W - STAGE_W * s0) / 2, ty: ty0, w: STAGE_W * s0, h: STAGE_H * s0 };
  }

  function pullBack(tl, l, P, hud, hudWide, B) {
    tl.to(l.cams, { x: P.tx, y: P.ty, scale: P.s, duration: BACK, ease: 'power2.inOut' }, B);
    edges(tl, l, { l: P.tx, t: P.ty, r: P.tx + P.w, b: P.ty + P.h, rad: 16 * P.s }, B, BACK, false);
    tl.to(l.spot, { opacity: 0, duration: 1, ease: 'sine.inOut' }, B + 0.6);
    tl.to(l.dim, { opacity: 0, duration: 1.6, ease: 'sine.inOut' }, B + 0.2);
    tl.to(l.nbg, { opacity: 0, duration: 1.2, ease: 'sine.inOut' }, B + 0.25);
    toWide(tl, l, B, BACK);
    tl.to(hud, { '--hc': hudWide.hc, '--hb': hudWide.hb, duration: 1, ease: 'sine.inOut' }, B + 1);
  }

  var RD = 0.5;
  var TA = 0.4;
  var XF = 0.45;
  var YA = 0.45;

  function themeColors(section) {
    var cs = window.getComputedStyle(section);
    function pick(name, fb) {
      var v = (cs.getPropertyValue(name) || '').trim();
      return v || fb;
    }
    var html = document.documentElement;
    var mv = html.classList.contains('is-multiverse');
    var print = mv && html.classList.contains('is-print');
    var dark = html.classList.contains('is-dark') && !print;
    var ink = pick('--ans-ink', '#1E1510');
    var cream = pick('--ans-cream', '#f4efe6');
    var zoom = pick('--ans-on-dim', '');
    if (!zoom) {
      if (print) zoom = ink;
      else if (dark || mv) zoom = ink;
      else zoom = cream;
    }
    return {
      ink: ink,
      ink2: pick('--ans-ink-2', dark ? 'rgba(244,239,230,.68)' : '#54463c'),
      coffee: pick('--ans-coffee', '#2A1E17'),
      cream: cream,
      zoom: zoom,
      zoom2: pick('--ans-on-dim-2', 'rgba(244,239,230,.8)'),
      mkd: pick('--ans-mkd', '#3a2a20')
    };
  }

  function chaptersOf(section) {
    return (section && section._cbxChapters) || CHAPTERS;
  }

  function shotNodes(scene, id) {
    return scene.querySelectorAll('[data-shot="' + id + '"]');
  }

  function applyBox(l) {
    if (l._boxRaf) return;
    l._boxRaf = window.requestAnimationFrame(function () {
      l._boxRaf = 0;
      var b = l.box;
      l.sharp.style.clipPath = insetPath(b.l, b.t, b.r - b.l, b.b - b.t, b.rad);
      l.spot.style.left = b.l + 'px';
      l.spot.style.top = b.t + 'px';
      l.spot.style.width = (b.r - b.l) + 'px';
      l.spot.style.height = (b.b - b.t) + 'px';
    });
  }

  function edges(tl, l, to, t, dur, zin) {
    var u = function () { applyBox(l); };
    tl.to(l.box, { l: to.l, b: to.b, rad: to.rad, duration: dur, ease: 'power2.inOut', onUpdate: u }, t);
    tl.to(l.box, { r: to.r, duration: dur * RD, ease: 'power2.inOut', onUpdate: u }, zin ? t : t + dur * (1 - RD));
    tl.to(l.box, { t: to.t, duration: dur * (1 - TA), ease: 'power3.inOut', onUpdate: u }, zin ? t + dur * TA : t);
  }

  function colr(tl, l, t, dur, wide) {
    var c = l.colors;
    tl.to(l.q, { color: wide ? c.ink : c.zoom, duration: dur, ease: 'sine.inOut' }, t);
    tl.to(l.slt, { color: wide ? c.ink2 : c.zoom2, duration: dur, ease: 'sine.inOut' }, t);
    tl.to(l.mkav, { backgroundColor: wide ? c.coffee : c.mkd, duration: dur, ease: 'sine.inOut' }, t);
  }

  function toCol(tl, l, t, dur) {
    tl.to([l.sl, l.q], { x: 0, duration: dur * XF, ease: 'sine.inOut' }, t);
    tl.to([l.sl, l.q], { y: 0, duration: dur * (1 - YA), ease: 'sine.inOut' }, t + dur * YA);
    colr(tl, l, t + 0.83, 0.24, false);
    tl.fromTo([l.q, l.sl], { textShadow: '0 1px 14px rgba(20,14,10,0)' }, {
      textShadow: '0 1px 14px rgba(20,14,10,.55)', duration: 0.25, ease: 'sine.out', immediateRender: false
    }, t + 0.75);
    tl.to([l.q, l.sl], { textShadow: '0 1px 14px rgba(20,14,10,0)', duration: 0.5, ease: 'sine.inOut' }, t + 1.2);
  }

  function toWide(tl, l, t, dur) {
    tl.to(l.sl, { x: l.sdx, duration: dur * XF, ease: 'sine.inOut' }, t + dur * (1 - XF));
    tl.to(l.q, { x: l.qdx, duration: dur * XF, ease: 'sine.inOut' }, t + dur * (1 - XF));
    tl.to(l.sl, { y: l.sdy, duration: dur * (1 - YA), ease: 'sine.inOut' }, t);
    tl.to(l.q, { y: l.qdy, duration: dur * (1 - YA), ease: 'sine.inOut' }, t);
    colr(tl, l, t + 0.83, 0.24, true);
    tl.fromTo([l.q, l.sl], { textShadow: '0 1px 14px rgba(20,14,10,0)' }, {
      textShadow: '0 1px 14px rgba(20,14,10,.55)', duration: 0.3, ease: 'sine.out', immediateRender: false
    }, t + 0.5);
    tl.to([l.q, l.sl], { textShadow: '0 1px 14px rgba(20,14,10,0)', duration: 0.2, ease: 'sine.in' }, t + 0.83);
  }

  /* The twelve-beat core, shared by wide and 390. One call = one chapter's
     four pointers. Every tween is a fromTo with immediateRender:false so a
     scrub, a jump or a reverse always lands on the same pixels. Only
     transform and opacity animate (gsap-performance). Returns the end time. */
  function addSteps(tl, l, bar, R0, start, stepTimes, hook, wins) {
    var cur = start;
    var cursor = R0;
    var count = l.poses.length || 1;
    l.poses.forEach(function (q, i) {
      var p = l.ch.pointers[i];
      var prev = i ? l.ch.pointers[i - 1] : null;
      var swap = !!(prev && p.shot && prev.shot && p.shot !== prev.shot && p.device !== 'desk');
      var t = cursor;
      var push = t;
      if (swap) {
        tl.to(l.stepCam, { x: l.Z.tx, y: l.Z.ty, scale: l.Z.s, duration: BACK, ease: 'power2.inOut' }, t);
        var fadeAt = t + BACK - 0.22;
        tl.to(shotNodes(l.scene, prev.shot), { opacity: 0, duration: 0.45, ease: 'sine.inOut' }, fadeAt);
        tl.to(shotNodes(l.scene, p.shot), { opacity: 1, duration: 0.45, ease: 'sine.inOut' }, fadeAt);
        if (p.inset) {
          tl.to(l.scene.querySelectorAll('[data-inset]'), { y: '-100%', duration: 0.6, ease: 'power3.out' }, fadeAt + 0.15);
        }
        push = t + BACK;
      }
      if (p.deskShot && prev && prev.deskShot && prev.deskShot !== p.deskShot) {
        tl.to(shotNodes(l.scene, prev.deskShot), { opacity: 0, duration: 0.35, ease: 'sine.inOut' }, push);
        tl.to(shotNodes(l.scene, p.deskShot), { opacity: 1, duration: 0.35, ease: 'sine.inOut' }, push);
      }
      if (stepTimes) stepTimes.push(+push.toFixed(3));
      /* text of this point is still arriving until push + SETTLE_IN */
      /* Open the settle window after the shot crossfade and the old
         copy have finished, so a pause never lands on the previous
         sentence over the next screen. */
      if (wins) wins.push([push + 1.15, push + 1.15 + SETTLE_IN]);
      if (hook) hook(i, push);
      /* camera glide: previous pose to this one. Only the sharp camera moves;
         the dimmed duplicate behind it stays at the chapter pose so it is
         not re-rasterised every frame. A shot change pulls back first. */
      tl.fromTo(l.stepCam, { x: swap ? l.Z.tx : cur.x, y: swap ? l.Z.ty : cur.y, scale: swap ? l.Z.s : cur.s },
        { x: q.pose.x, y: q.pose.y, scale: q.pose.s, duration: GLIDE, ease: 'power2.inOut', immediateRender: false }, push);
      var deskEl = l.scene.querySelector('.cbx-ans__cam.is-sharp .cbx-desk');
      if (deskEl) {
        tl.to(deskEl, { opacity: p.device === 'phone' ? 0.15 : 1, duration: 0.45, ease: 'sine.inOut' }, push);
      }
      /* previous marker and shade hand over gently */
      if (i) {
        tl.fromTo([l.mk[i - 1], l.rg[i - 1]], { opacity: 1 }, { opacity: 0, duration: 0.45, ease: 'sine.inOut', immediateRender: false }, push);
        /* old text glides up and out, line by line */
        tl.fromTo(l.lines[i - 1], { opacity: 1, y: 0, scale: 1 },
          { opacity: 0, y: OUT_DY, scale: 0.99, duration: 0.6, ease: 'power2.inOut', stagger: 0.045, immediateRender: false }, push);
      }
      /* new text glides in, staggered, long soft ease */
      tl.fromTo(l.lines[i], { opacity: 0, y: IN_DY, scale: 0.985 },
        { opacity: 1, y: 0, scale: 1, duration: 0.85, ease: 'power3.out', stagger: 0.07, immediateRender: false }, push + (i ? 0.5 : 0.25));
      /* marker softly rings in once the camera has nearly landed */
      tl.fromTo(l.rg[i], { opacity: 0 }, { opacity: 1, duration: 0.95, ease: 'sine.inOut', immediateRender: false }, push + 0.7);
      tl.fromTo(l.mk[i], { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.85, ease: 'power3.out', immediateRender: false }, push + 0.85);
      tl.fromTo(l.mp[i], { opacity: 0.55, scale: 1 }, { opacity: 0, scale: 2.4, duration: 1.2, ease: 'power2.out', immediateRender: false }, push + 0.95);
      /* tick fills, chapter bar advances */
      tl.fromTo(l.fills[i], { scaleX: 0 }, { scaleX: 1, duration: 1.0, ease: 'power2.inOut', immediateRender: false }, push + 0.15);
      if (bar) tl.to(bar, { scaleX: 0.2 + 0.8 * (i + 1) / count, duration: 1.0, ease: 'power2.inOut' }, push + 0.15);
      if (p.after && l.afterPose && l.afterPose[i]) {
        var ap = l.afterPose[i];
        var at = push + 2.2;
        tl.to(l.stepCam, { x: l.Z.tx, y: l.Z.ty, scale: l.Z.s, duration: BACK * 0.72, ease: 'power2.inOut' }, at);
        tl.to(shotNodes(l.scene, p.shot), { opacity: 0, duration: 0.45, ease: 'sine.inOut' }, at + BACK * 0.4);
        tl.to(shotNodes(l.scene, p.after.shot), { opacity: 1, duration: 0.45, ease: 'sine.inOut' }, at + BACK * 0.4);
        tl.to(l.stepCam, { x: ap.pose.x, y: ap.pose.y, scale: ap.pose.s, duration: GLIDE, ease: 'power2.inOut' }, at + BACK * 0.72);
        cur = ap.pose;
        cursor += STEP + BACK;
      } else {
        cur = q.pose;
        cursor += STEP + (swap ? BACK : 0);
      }
    });
    var E = cursor + 0.1;
    var last = l.poses.length - 1;
    if (wins) wins.push([E, E + 1.25]);
    tl.fromTo(l.lines[last], { opacity: 1, y: 0, scale: 1 },
      { opacity: 0, y: OUT_DY, scale: 0.99, duration: 0.6, ease: 'power2.inOut', stagger: 0.045, immediateRender: false }, E);
    tl.fromTo([l.mk[last], l.rg[last]], { opacity: 1 }, { opacity: 0, duration: 0.6, ease: 'sine.inOut', immediateRender: false }, E);
    tl.fromTo(l.panel, { opacity: 1, y: 0 }, { opacity: 0, y: -10, duration: 0.7, ease: 'power2.inOut', immediateRender: false }, E + 0.35);
    return E;
  }

  function buildTimeline(section, scale) {
    var gsap = window.gsap;
    var stage = section.querySelector('.cbx-ans__stage');
    var scenes = Array.prototype.slice.call(section.querySelectorAll('.cbx-ans__scene'));
    var P = widePose(stage, scenes, scale);
    var colors = themeColors(section);
    var chs = chaptersOf(section);
    var layers = scenes.map(function (scene, k) {
      return prepareChapter(scene, chs[k], k, P, stage, scale, colors);
    });
    var hud = section.querySelector('.cbx-ans__hud');
    var bars = section.querySelectorAll('.cbx-ans__prog b');
    var html = document.documentElement;
    var print = html.classList.contains('is-multiverse') && html.classList.contains('is-print');
    var dark = html.classList.contains('is-dark') && !print;
    var hudWide = { hc: 'rgba(30,21,16,.55)', hb: 'rgba(30,21,16,.35)' };
    var hudZoom = { hc: 'rgba(244,239,230,.62)', hb: 'rgba(244,239,230,.4)' };
    if (isMultiverse() && !print) {
      hudWide = { hc: 'rgba(243,238,228,.62)', hb: 'rgba(61,232,245,.35)' };
      hudZoom = { hc: 'rgba(243,238,228,.72)', hb: 'rgba(61,232,245,.5)' };
    } else if (print) {
      hudWide = { hc: 'rgba(14,16,24,.55)', hb: 'rgba(0,160,160,.35)' };
      hudZoom = { hc: 'rgba(14,16,24,.62)', hb: 'rgba(0,160,160,.45)' };
    } else if (dark) {
      hudWide = { hc: 'rgba(244,239,230,.62)', hb: 'rgba(244,239,230,.35)' };
      hudZoom = { hc: 'rgba(244,239,230,.72)', hb: 'rgba(232,169,107,.45)' };
    }

    var tl = gsap.timeline({ paused: true, defaults: { force3D: true } });
    var T = START;
    var k;
    var stepTimes = [];
    var snapWins = [];
    var chWin = scenes.map(function () {
      return { appear: 0, gone: 1e6 };
    });
    for (k = 0; k < layers.length; k += 1) {
      (function (k) {
        var l = layers[k];
        var Z = l.Z;
        var S0 = T;
        tl.to(l.cams, { x: Z.tx, y: Z.ty, scale: Z.s, duration: ZOOM, ease: 'power2.inOut' }, S0);
        edges(tl, l, { l: Z.X, t: Z.Y, r: Z.X + Z.W, b: Z.Y + Z.H, rad: 20 }, S0, ZOOM, true);
        tl.to(l.spot, { opacity: 1, duration: 1.2, ease: 'sine.inOut' }, S0 + 0.6);
        tl.to(l.dim, { opacity: 1, duration: 1.6, ease: 'sine.inOut' }, S0 + 0.2);
        tl.to(l.nbg, { opacity: 1, duration: 1.3, ease: 'sine.inOut' }, S0 + 0.35);
        toCol(tl, l, S0, ZOOM);
        tl.to(hud, { '--hc': hudZoom.hc, '--hb': hudZoom.hb, duration: 1, ease: 'sine.inOut' }, S0 + 0.5);
        if (bars[k]) tl.to(bars[k], { scaleX: 0.2, duration: ZOOM, ease: 'none' }, S0);
        tl.to(l.vf, { opacity: 1, duration: 0.6, stagger: 0.06, ease: 'sine.out' }, S0 + ZOOM - 0.5);
        if (l.ch.openShot && l.ch.pointers[0] && l.ch.pointers[0].shot && l.ch.openShot !== l.ch.pointers[0].shot) {
          tl.to(shotNodes(l.scene, l.ch.openShot), { opacity: 0, duration: 0.45, ease: 'sine.inOut' }, S0 + 0.35);
          tl.to(shotNodes(l.scene, l.ch.pointers[0].shot), { opacity: 1, duration: 0.45, ease: 'sine.inOut' }, S0 + 0.35);
        }
        if (l.ctag) tl.to(l.ctag, { opacity: 1, duration: 0.8, ease: 'sine.out' }, S0 + ZOOM - 0.3);
        var R0 = S0 + ZOOM + 0.1;
        tl.fromTo(l.panel, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', immediateRender: false }, S0 + ZOOM - 0.3);
        snapWins.push([S0 + ZOOM - 0.6, R0]);
        var E = addSteps(tl, l, bars[k], R0, { x: Z.tx, y: Z.ty, s: Z.s }, stepTimes, null, snapWins);
        if (l.ctag) tl.to(l.ctag, { opacity: 0, duration: 0.5, ease: 'sine.inOut' }, E + 0.5);
        tl.to(l.vf, { opacity: 0, duration: 0.5, ease: 'sine.inOut' }, E + 0.7);
        var B = E + OUT + 0.05;
        if (k < layers.length - 1) {
          pullBack(tl, l, P, hud, hudWide, B);
          var W = B + BACK + 0.1;
          var n = layers[k + 1];
          /* Handoff, soft: the old device content and the old question
             glide up and out; the new chapter is already on the same
             pulled-back pose and its content and question glide in. The two
             questions never overlap (old is gone before new has started). */
          var dyOf = function (c) { return function (i) { return i ? c.qdy : c.sdy; }; };
          tl.to(l.scene.querySelectorAll('.main, .cbx-phone__screen, .cbx-ans__stack'), { opacity: 0, duration: 0.7, ease: 'sine.inOut' }, W);
          tl.fromTo([l.sl, l.q], { opacity: 1, y: dyOf(l) },
            { opacity: 0, y: function (i) { return dyOf(l)(i) - 24; }, duration: 0.6, ease: 'power2.inOut', stagger: 0.06, immediateRender: false }, W - 0.15);
          tl.set(n.layers, { opacity: 0 }, W - 0.2);
          tl.set(n.scene, { opacity: 1 }, W - 0.2);
          chWin[k + 1].appear = W - 0.2;
          chWin[k].gone = W + 0.95;
          tl.fromTo([n.sl, n.q], { opacity: 0, y: function (i) { return dyOf(n)(i) + 26; } },
            { opacity: 1, y: dyOf(n), duration: 0.85, ease: 'power3.out', stagger: 0.07, immediateRender: false }, W + 0.3);
          tl.set(l.scene, { opacity: 0 }, W + 0.9);
          tl.fromTo(n.scene.querySelectorAll('.cbx-ans__cam'), { opacity: 0 }, { opacity: 1, duration: 0.7, ease: 'sine.inOut', immediateRender: false }, W + 0.1);
          tl.set(n.spot, { opacity: 0 }, W);
          tl.fromTo(n.scene.querySelectorAll('.main, .cbx-phone__screen, .cbx-ans__stack'), { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'sine.inOut' }, W + 0.2);
          tl.fromTo(n.scene.querySelectorAll('.si.new, .cbx-si.is-new'), { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: 0.55, stagger: 0.1, ease: 'power2.out' }, W + 0.55);
          tl.set(n.scene.querySelectorAll('.cbx-ans__dim, .cbx-ans__nbg'), { opacity: 0 }, W);
          T = W + 1.2;
        } else if (l.ch.outro && l.ch.outro.length) {
          tl.to(l.cams, { x: Z.tx, y: Z.ty, scale: Z.s, duration: BACK, ease: 'power2.inOut' }, B);
          var beat = B + BACK - 0.2;
          l.ch.outro.forEach(function (o, i) {
            var kick = l.scene.querySelector('[data-kicker="' + i + '"]');
            var fromShot = i ? l.ch.outro[i - 1].shot : (l.ch.pointers[l.ch.pointers.length - 1].shot || l.ch.openShot);
            if (fromShot) tl.to(shotNodes(l.scene, fromShot), { opacity: 0, duration: 0.45, ease: 'sine.inOut' }, beat);
            tl.to(shotNodes(l.scene, o.shot), { opacity: 1, duration: 0.45, ease: 'sine.inOut' }, beat);
            if (kick) {
              tl.fromTo(kick, { opacity: 0, y: IN_DY }, { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out', immediateRender: false }, beat + 0.2);
            }
            snapWins.push([beat + 0.9, beat + 1.3]);
            if (i < l.ch.outro.length - 1) {
              if (kick) tl.to(kick, { opacity: 0, y: OUT_DY, duration: 0.6, ease: 'power2.inOut' }, beat + HOLD);
              beat += HOLD;
            } else {
              beat += HOLD;
            }
          });
          T = beat + 0.4;
        } else {
          pullBack(tl, l, P, hud, hudWide, B);
          T = B + BACK + 0.6;
        }
      }(k));
    }
    tl.to({}, { duration: 0.6 }, T);
    section._cbxWins = chWin;
    section._cbxSnapWins = snapWins;
    section._cbxScenes = scenes;
    section.dataset.steps = JSON.stringify(stepTimes);
    return tl;
  }

  /* Scene [hidden] is a pure function of timeline time (or the matching
     scroll progress). GSAP tl.call does not reverse on scrub, so driving
     display from onEnter/onLeave/call blanks a chapter on the way back
     or after a jump. Never hide a scene that is still painting. */
  function applySceneVisibility(section, time) {
    var scenes = section._cbxScenes ||
      (section._cbxScenes = Array.prototype.slice.call(section.querySelectorAll('.cbx-ans__scene')));
    var wins = section._cbxWins;
    var t = time;
    if (t == null && motion.tween && typeof motion.tween.time === 'function') {
      t = motion.tween.time();
    }
    t = +t || 0;
    var i;
    var shown = 0;
    var best = 0;
    for (i = 0; i < scenes.length; i += 1) {
      var scene = scenes[i];
      var win = wins && wins[i];
      var op = parseFloat(scene.style.opacity || '0');
      var inWin = win ? (t + 0.03 >= win.appear && t - 0.03 < win.gone) : op > 0.04;
      var on = inWin || op > 0.04;
      if (on) {
        if (scene.hasAttribute('hidden')) scene.removeAttribute('hidden');
        shown += 1;
      } else if (!scene.hasAttribute('hidden')) {
        scene.setAttribute('hidden', '');
      }
      if (win && t >= win.appear) best = i;
    }
    if (!shown && scenes.length) {
      scenes[best].removeAttribute('hidden');
    }
  }

  function withSectionInView(section, fn) {
    var y = window.scrollY || 0;
    var style = section.style;
    var prev = {
      position: style.position,
      top: style.top,
      left: style.left,
      right: style.right,
      width: style.width,
      height: style.height,
      zIndex: style.zIndex,
      visibility: style.visibility
    };
    var scenes = section.querySelectorAll('.cbx-ans__scene');
    Array.prototype.forEach.call(scenes, function (scene) {
      scene.removeAttribute('hidden');
      scene.style.visibility = 'visible';
      scene.style.opacity = '1';
    });
    style.position = 'fixed';
    style.top = '0';
    style.left = '0';
    style.right = '0';
    style.width = '100%';
    style.height = '100vh';
    style.zIndex = '2';
    style.visibility = 'visible';
    section.getBoundingClientRect();
    var out = fn();
    style.position = prev.position;
    style.top = prev.top;
    style.left = prev.left;
    style.right = prev.right;
    style.width = prev.width;
    style.height = prev.height;
    style.zIndex = prev.zIndex;
    style.visibility = prev.visibility;
    Array.prototype.forEach.call(scenes, function (scene, i) {
      if (i) {
        scene.setAttribute('hidden', '');
        scene.style.opacity = '0';
      } else {
        scene.style.opacity = '1';
      }
    });
    if (y) window.scrollTo(0, y);
    return out;
  }

  function coverCoffee(on) {
    var pin = document.querySelector('[data-cbx-growth]');
    if (pin) pin.classList.toggle('is-covered', !!on);
  }

  function syncCoffee(section, self) {
    if (!section.hasAttribute('data-cbx-answers') || !self) return;
    var passed = self.progress >= 0.98;
    var inside = self.isActive && self.progress > 0.01;
    coverCoffee(passed || inside);
  }

  function pinPriority(section) {
    if (section && section._cbxRefresh != null) return section._cbxRefresh;
    return -1;
  }

  function pinActive(on) {
    document.documentElement.classList.toggle('is-cbx-ans-pin', !!on);
    if (window.Cbx300Case && window.Cbx300Case.syncCloseInk) {
      window.Cbx300Case.syncCloseInk();
    }
  }

  function syncSceneFromTrigger(section, tl, progress) {
    var d = tl && tl.duration ? tl.duration() : 0;
    var target = Math.max(0, (progress || 0) * d);
    var now = tl && typeof tl.time === 'function' ? tl.time() : target;
    var jump = d > 0 && Math.abs(now / d - (progress || 0)) > JUMP;
    if (jump && typeof tl.time === 'function') tl.time(target);
    applySceneVisibility(section, target);
  }

  /* Scroll-end settle. The glide is scrubbed, so a reader who stops while a
     point is still arriving would leave its text half-faded. When scrolling
     ends inside one of those windows, ease on to the nearest settled state
     in the direction they were travelling. Scrubbing and reversal are
     untouched: any new scroll input cancels the settle. */
  function settleSnap(section, tl) {
    var merged = null;
    function build() {
      var w = (section._cbxSnapWins || []).slice().sort(function (a, b) { return a[0] - b[0]; });
      merged = [];
      w.forEach(function (x) {
        var last = merged[merged.length - 1];
        if (last && x[0] <= last[1] + 0.05) last[1] = Math.max(last[1], x[1]);
        else merged.push([x[0], x[1]]);
      });
    }
    return {
      snapTo: function (value, self) {
        if (!merged) build();
        var d = tl.duration();
        var t = value * d;
        for (var i = 0; i < merged.length; i += 1) {
          var a = merged[i][0];
          var b = merged[i][1];
          if (t > a + 0.06 && t < b - 0.06) {
            var dir = self && self.direction ? self.direction : (t - a < b - t ? -1 : 1);
            return (dir > 0 ? b : a) / d;
          }
        }
        return value;
      },
      delay: 0.3,
      duration: { min: 0.45, max: 1.0 },
      ease: 'power2.inOut',
      inertia: false
    };
  }

  function bindCamera(section) {
    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;
    var scale = fitScale(section);
    var tl = withSectionInView(section, function () {
      return buildTimeline(section, scale);
    });
    tl.to({}, { duration: CURTAIN }, 0);
    var st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: function () { return '+=' + Math.round(tl.duration() * PX_PER_SEC); },
      pin: true,
      pinSpacing: true,
      pinType: 'fixed',
      scrub: SCRUB,
      snap: settleSnap(section, tl),
      animation: tl,
      invalidateOnRefresh: false,
      anticipatePin: 1,
      refreshPriority: pinPriority(section),
      onUpdate: function (self) {
        syncSceneFromTrigger(section, tl, self.progress);
        syncCoffee(section, self);
        if (motion.onStep) motion.onStep(self.progress > 0.02 ? 2 : 1);
      },
      onToggle: function (self) {
        pinActive(self.isActive);
        syncSceneFromTrigger(section, tl, self.progress);
        syncCoffee(section, self);
        if (self.isActive && motion.onStep) motion.onStep(2);
      },
      onLeaveBack: function () { if (section.hasAttribute('data-cbx-answers')) coverCoffee(false); },
      onRefresh: function () {
        fitScale(section);
      }
    });
    if (section.hasAttribute('data-cbx-answers')) motion.tween = tl;
    motion.triggers.push(st);
    section.dataset.ready = '1';
    section.dataset.dur = String(tl.duration());
  }

  /* Reduced motion: no pin, no camera. Every pointer is its own block
     in document flow, with the screen that belongs to that pointer. */
  function bindReduced(section) {
    section.classList.add('is-static', 'is-flow');
    var chs = chaptersOf(section);
    var scenes = section.querySelectorAll('.cbx-ans__scene');
    Array.prototype.forEach.call(scenes, function (scene, k) {
      var ch = chs[k];
      if (!ch) return;
      scene.removeAttribute('hidden');
      scene.style.opacity = '1';
      Array.prototype.forEach.call(scene.querySelectorAll('.cbx-ans__cam, .cbx-ans__spot, .cbx-ans__dim, .cbx-ans__nbg'), function (n) {
        n.style.display = 'none';
      });
      var steps = scene.querySelectorAll('.cbx-ans__step');
      Array.prototype.forEach.call(steps, function (step, i) {
        step.classList.add('is-current');
        var p = ch.pointers[i];
        if (!p) return;
        var src = '';
        var alt = 'CBX300 phone · ' + (ch.focus || 'screen');
        if (p.device === 'desk') {
          var deskId = p.deskShot;
          var deskHit = null;
          if (ch.deskShots && deskId) {
            ch.deskShots.forEach(function (s) { if (s.id === deskId) deskHit = s; });
          }
          if (deskHit) {
            src = deskHit.src;
            alt = deskHit.alt;
          } else if (ch.deskShot) {
            src = ch.deskShot;
            alt = ch.deskAlt || 'CBX300 web · ' + ch.focus;
          }
        } else if (ch.phoneShots) {
          var shot = null;
          ch.phoneShots.forEach(function (s) { if (s.id === p.shot) shot = s; });
          if (shot) { src = shot.src; alt = shot.alt; }
        }
        if (!src) return;
        var fig = picture(src, alt, p.device === 'desk' ? 1440 : 440, p.device === 'desk' ? 900 : 956);
        pfMark(fig, src);
        var framed;
        if (p.device === 'desk') {
          framed = el('div', 'device-browser cbx-ans__flowshot');
          var dscreen = el('div', 'device-browser__screen');
          dscreen.appendChild(fig);
          framed.appendChild(browserBar());
          framed.appendChild(dscreen);
        } else {
          framed = el('div', 'device-iphone cbx-ans__flowshot');
          var pscreen = el('div', 'device-iphone__screen');
          pscreen.appendChild(fig);
          framed.appendChild(pscreen);
          iphoneButtons(framed);
        }
        step.insertBefore(framed, step.firstChild);
      });
    });
    if (section.hasAttribute('data-cbx-answers') && window.IntersectionObserver) {
      var watch = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) coverCoffee(true);
          else if (e.boundingClientRect.top > 40) coverCoffee(false);
        });
      }, { threshold: [0, 0.05] });
      watch.observe(section);
    }
    section.dataset.ready = '1';
  }

  /* 390: same twelve beats. The camera pushes into the element inside the
     window above the bottom sheet; the sheet swaps its text per beat. */
  function bindNarrow(section) {
    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;
    section.classList.add('is-narrow');
    var scenes = Array.prototype.slice.call(section.querySelectorAll('.cbx-ans__scene'));
    scenes.forEach(function (scene) {
      scene.removeAttribute('hidden');
      scene.style.visibility = 'visible';
      scene.style.opacity = '1';
    });
    section.getBoundingClientRect();
    var vw = section.clientWidth;
    var vh = section.clientHeight;
    var hud = section.querySelector('.cbx-ans__hud');
    var winTop = Math.ceil(hud.getBoundingClientRect().bottom - section.getBoundingClientRect().top) + 8;
    var bars = section.querySelectorAll('.cbx-ans__prog b');
    var layers = scenes.map(function (scene, k) {
      var note = scene.querySelector('.cbx-ans__note');
      var winBot = Math.floor(note.getBoundingClientRect().top - section.getBoundingClientRect().top) - 6;
      var Z = { tx: 0, ty: 0, s: 1, X: 0, Y: winTop, W: vw, H: Math.max(120, winBot - winTop) };
      var cams = scene.querySelectorAll('.cbx-ans__cam.is-sharp .cbx-ans__camin');
      var sharp = scene.querySelector('.cbx-ans__cam.is-sharp');
      sharp.style.clipPath = 'inset(' + Z.Y + 'px 0 ' + (vh - Z.Y - Z.H) + 'px 0)';
      var swap = null;
      if (scene.classList.contains('is-both')) {
        var sharpRoot = scene.querySelector('.cbx-ans__cam.is-sharp');
        var deskN = sharpRoot.querySelector('.cbx-desk');
        var phoneN = sharpRoot.querySelector('.cbx-phone');
        var dsc = (vw - 24) / 760;
        deskN.style.cssText += ';left:12px;top:' + Math.round(Z.Y + Math.max(8, (Z.H - 560 * dsc) / 2)) + 'px;width:760px;height:560px;transform:scale(' + dsc + ');transform-origin:0 0;z-index:2';
        swap = { desk: deskN, phone: phoneN, dev: chaptersOf(section)[k].pointers.map(function (q) { return q.device; }) };
      }
      var poses = buildPoses(scene, chaptersOf(section)[k], Z, 1, { side: 14, topIn: 12, botIn: 12, fillW: 0.62, fillH: 0.5, minMul: 1.25, maxMul: 2.4 });
      var mk = poses.map(function (q) { return q && q.mkr; });
      var rg = poses.map(function (q) { return q && q.ring; });
      var mp = mk.map(function (m) {
        var e = el('div', 'cbx-ans__mpulse mpulse');
        e.style.left = m.style.left;
        e.style.top = m.style.top;
        m.parentNode.insertBefore(e, m);
        return e;
      });
      gsap.set(mk.concat(rg, mp), { opacity: 0 });
      var panel = scene.querySelector('.cbx-ans__panel');
      var steps = Array.prototype.slice.call(scene.querySelectorAll('.cbx-ans__step'));
      var counts = Array.prototype.slice.call(scene.querySelectorAll('.cbx-ans__cn'));
      var fills = Array.prototype.slice.call(scene.querySelectorAll('.cbx-ans__tick b'));
      var lines = steps.map(function (st, i) {
        var ls = [counts[i]].concat(Array.prototype.slice.call(st.querySelectorAll('.cbx-ans__ln')));
        gsap.set(ls, { opacity: 0, y: IN_DY * 0.7, scale: 0.985, transformOrigin: '0 50%' });
        return ls;
      });
      gsap.set(fills, { scaleX: 0, transformOrigin: '0 50%' });
      gsap.set(cams, { x: 0, y: 0, scale: 1, transformOrigin: '0 0', force3D: true });
      gsap.set(panel, { opacity: 0, y: 14 });
      if (swap) {
        gsap.set(swap.desk, { opacity: swap.dev[0] === 'desk' ? 1 : 0 });
        gsap.set(swap.phone, { opacity: swap.dev[0] === 'phone' ? 1 : 0 });
      }
      gsap.set(scene, { opacity: k ? 0 : 1 });
      if (k) scene.setAttribute('hidden', '');
      return { swap: swap, scene: scene, ch: chaptersOf(section)[k], cams: cams, stepCam: cams[0], poses: poses, mk: mk, rg: rg, mp: mp, panel: panel, lines: lines, fills: fills, Z: Z, afterPose: [] };
    });
    var tl = gsap.timeline({ paused: true, defaults: { force3D: true } });
    var chWin = scenes.map(function () { return { appear: 0, gone: 1e6 }; });
    var stepTimes = [];
    var snapWins = [];
    var T = 0.3;
    layers.forEach(function (l, k) {
      if (k) {
        /* the two chapters cross-fade (no hard swap) while the old panel
           glides out and the new one glides in */
        chWin[k].appear = T - 0.4;
        chWin[k - 1].gone = T + 0.6;
        tl.fromTo(l.scene, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'sine.inOut', immediateRender: false }, T - 0.35);
        tl.fromTo(l.panel, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', immediateRender: false }, T);
      } else {
        tl.fromTo(l.panel, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', immediateRender: false }, T);
      }
      snapWins.push([T - 0.4, T + 0.2]);
      var E = addSteps(tl, l, bars[k], T + 0.2, { x: 0, y: 0, s: 1 }, stepTimes, l.swap ? function (i, t) {
        var sw = l.swap;
        if (!i || sw.dev[i] === sw.dev[i - 1]) return;
        var to = sw.dev[i];
        tl.fromTo(sw[to], { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'sine.inOut', immediateRender: false }, t + 0.35);
        tl.fromTo(sw[sw.dev[i - 1]], { opacity: 1 }, { opacity: 0, duration: 0.6, ease: 'sine.inOut', immediateRender: false }, t);
      } : null, snapWins);
      if (k < layers.length - 1) {
        /* the next chapter fades in over this one; this one is released
           only once the next is fully in (no dip through empty) */
        tl.set(l.scene, { opacity: 0 }, E + 1.55);
        T = E + 1.0;
      } else {
        T = E + 0.8;
      }
    });
    tl.to({}, { duration: 0.5 }, T);
    section._cbxWins = chWin;
    section._cbxSnapWins = snapWins;
    section._cbxScenes = scenes;
    section.dataset.steps = JSON.stringify(stepTimes);
    var st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: function () { return '+=' + Math.round(tl.duration() * 170); },
      pin: true,
      pinSpacing: true,
      pinType: 'fixed',
      scrub: SCRUB,
      snap: settleSnap(section, tl),
      animation: tl,
      refreshPriority: pinPriority(section),
      onToggle: function (self) {
        pinActive(self.isActive);
        syncSceneFromTrigger(section, tl, self.progress);
        syncCoffee(section, self);
      },
      onUpdate: function (self) {
        syncSceneFromTrigger(section, tl, self.progress);
        syncCoffee(section, self);
        if (motion.onStep) motion.onStep(self.progress > 0.02 ? 2 : 1);
      },
      onLeaveBack: function () { if (section.hasAttribute('data-cbx-answers')) coverCoffee(false); }
    });
    if (section.hasAttribute('data-cbx-answers')) motion.tween = tl;
    motion.triggers.push(st);
    section.dataset.ready = '1';
    section.dataset.dur = String(tl.duration());
  }

  function pageFromUrl() {
    var q = /[?&]page=([^&]+)/.exec(location.search);
    if (q) return decodeURIComponent(q[1]).toLowerCase();
    var h = /^#(?:page=)?([a-z0-9-]+)$/i.exec(location.hash);
    if (h) return h[1].toLowerCase();
    return '';
  }

  function seekIfNeeded() {
    var page = (motion.page || pageFromUrl() || '').replace(/^0+/, '');
    if (page !== '3' && page !== '03' && page !== 'answers' && page !== 's03') return;
    var st = motion.triggers[0];
    if (!st) return;
    window.requestAnimationFrame(function () {
      window.scrollTo(0, st.start + 8);
      if (window.ScrollTrigger && window.ScrollTrigger.update) window.ScrollTrigger.update();
      if (motion.pin && motion.tween) {
        var p = (st.start + 8 - st.start) / Math.max(1, st.end - st.start);
        syncSceneFromTrigger(motion.pin, motion.tween, p);
      }
    });
  }

  function kill() {
    pinActive(false);
    if (motion.fit) {
      window.removeEventListener('resize', motion.fit);
      motion.fit = null;
    }
    if (motion.mm && motion.mm.revert) motion.mm.revert();
    motion.mm = null;
    if (motion.tween && motion.tween.kill) motion.tween.kill();
    motion.tween = null;
    motion.triggers.forEach(function (t) {
      if (t && t.kill) t.kill();
    });
    motion.triggers = [];
    motion.pin = null;
    motion.onStep = null;
  }

  function bind(world, opts) {
    kill();
    opts = opts || {};
    var sections = world ? world.querySelectorAll('.cbx-ans') : [];
    var section = world && world.querySelector('[data-cbx-answers]');
    if (!section) return;
    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;
    motion.pin = section;
    motion.onStep = opts.onStep || null;
    motion.page = opts.page || '';
    motion.reduce = !!(opts.reduce || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches));
    if (!gsap || !ScrollTrigger) {
      Array.prototype.forEach.call(sections, function (node) { node.classList.add('is-static'); });
      if (opts.onReady) opts.onReady();
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    motion.fit = function () {
      Array.prototype.forEach.call(sections, function (node) { fitScale(node); });
    };
    window.addEventListener('resize', motion.fit);
    function go() {
      motion.fit();
      var mm = gsap.matchMedia();
      motion.mm = mm;
      mm.add({
        isWide: '(min-width: 860px)',
        isNarrow: '(max-width: 859px)',
        reduce: '(prefers-reduced-motion: reduce)'
      }, function (ctx) {
        var c = ctx.conditions || {};
        Array.prototype.forEach.call(sections, function (node) {
          if (c.reduce || motion.reduce) bindReduced(node);
          else if (c.isNarrow) bindNarrow(node);
          else bindCamera(node);
        });
        seekIfNeeded();
        if (window.ScrollTrigger && window.ScrollTrigger.refresh) {
          window.requestAnimationFrame(function () {
            window.ScrollTrigger.refresh();
            seekIfNeeded();
          });
        }
        if (opts.onReady) opts.onReady();
        return function () {
          pinActive(false);
          if (motion.tween && motion.tween.kill) motion.tween.kill();
          motion.tween = null;
          motion.triggers.forEach(function (t) { if (t && t.kill) t.kill(); });
          motion.triggers = [];
          Array.prototype.forEach.call(sections, function (node) {
            node.classList.remove('is-static', 'is-narrow');
          });
        };
      });
    }
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(go).catch(go);
    } else {
      go();
    }
  }

  return {
    build: build,
    buildNext: buildNext,
    bind: bind,
    kill: kill,
    CHAPTERS: CHAPTERS
  };
})();
