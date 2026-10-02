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
  var BACK = 2.1;
  var HOLD = 5.3;
  var START = 0.7;
  var CURTAIN = 0.55;
  var DEST = { x: 48, w: 880, cy: 470 };
  var NCOL = { left: 984, width: 416 };
  var SCRUB = 0.8;

  var motion = {
    mm: null,
    triggers: [],
    tween: null,
    pin: null,
    reduce: false,
    fit: null
  };

  var CHAPTERS = [
    {
      id: 'solo',
      hero: 'phone',
      kicker: 'On her own · 1 person',
      people: ['aisha'],
      ask: 'Did the client pay yet?',
      focus: 'Invoices',
      nav: [
        { id: 'home', label: 'Home' },
        { id: 'payments', label: 'Payments' },
        { id: 'invoices', label: 'Invoices', on: true }
      ],
      deskCrumb: 'Money in',
      deskTitle: 'Invoices',
      region: { phone: '[data-ans-device="phone"]', desk: null },
      pointers: [
        { worry: 'Did Mehta pay?', does: 'Status is first on every row, in a colour she can read at a glance, and it flips when money lands.', gain: 'No awkward call to the client.', t: '[data-ans-t="paid"]', device: 'phone', a: 'l', off: 18 },
        { worry: 'Which invoice was that for?', does: 'A payment arrives already tied to its invoice, so she never matches a bank line to a bill herself.', gain: 'Books that balance without a spreadsheet.', t: '[data-ans-t="match"]', device: 'phone', a: 'l', off: 18 },
        { worry: 'Who still owes me?', does: 'The list puts the oldest overdue on top, so the order itself tells her where to look first.', gain: 'She knows who to chase, and who to leave alone.', t: '[data-ans-t="owe"]', device: 'phone', a: 'l', off: 18 },
        { worry: 'Chasing feels rude.', does: 'The reminder is already written politely and one tap away, so the awkward part is done for her.', gain: 'The money comes in. The relationship stays warm.', t: '[data-ans-t="nudge"]', device: 'phone', a: 'l', off: 18 }
      ]
    },
    {
      id: 'hire',
      hero: 'phone',
      kicker: 'First hire · 2 people',
      people: ['aisha', 'lina'],
      ask: 'Can I afford her salary this month?',
      focus: 'Cash plan',
      nav: [
        { id: 'home', label: 'Home' },
        { id: 'payments', label: 'Payments' },
        { id: 'invoices', label: 'Invoices' },
        { id: 'cashplan', label: 'Cash plan', on: true, neu: true },
        { id: 'salary', label: 'Salary', neu: true },
        { id: 'tax', label: 'Tax', neu: true }
      ],
      deskCrumb: 'Planning',
      deskTitle: 'Cash plan',
      region: { phone: '[data-ans-device="phone"]', desk: null },
      pointers: [
        { worry: 'Is this money really mine?', does: 'One bar splits the balance into safe, set aside and still coming, so the true answer is visible.', gain: 'One honest number to decide with.', t: '[data-ans-t="safe"]', device: 'phone', a: 'c', off: 0 },
        { worry: 'Will GST and rent eat into it?', does: 'Bills that are certain are set aside as their own block, so they can’t hide inside the balance.', gain: 'No bill ambushes payday.', t: '[data-ans-t="aside"]', device: 'phone', a: 'l', off: 16 },
        { worry: 'What if a client pays late?', does: 'Money still to arrive stays out of the safe number, so a late payment changes nothing.', gain: 'She never spends money that hasn’t arrived.', t: '[data-ans-t="coming"]', device: 'phone', a: 'l', off: 16 },
        { worry: 'Can I pay Lina on Friday?', does: 'The question is answered on the day: Friday is marked and one ‘Covered’ badge says yes or no.', gain: 'She says yes to her first hire, calmly.', t: '[data-ans-t="payday"]', device: 'phone', a: 'l', off: 18 }
      ]
    },
    {
      id: 'team',
      hero: 'both',
      kicker: 'A small team · 5 people',
      people: ['aisha', 'lina', 'dev', 'mira', 'arjun'],
      ask: 'Who’s waiting on me today?',
      focus: 'Approvals',
      nav: [
        { id: 'home', label: 'Home' },
        { id: 'payments', label: 'Payments' },
        { id: 'invoices', label: 'Invoices' },
        { id: 'cashplan', label: 'Cash plan' },
        { id: 'salary', label: 'Salary' },
        { id: 'tax', label: 'Tax' },
        { id: 'approvals', label: 'Approvals', on: true, neu: true },
        { id: 'team', label: 'Team', neu: true },
        { id: 'vendors', label: 'Vendors', neu: true }
      ],
      deskCrumb: 'Team',
      deskTitle: 'Approvals',
      region: {
        phone: '[data-ans-device="phone"] [data-ans-screen]',
        desk: '[data-ans-device="desk"] [data-ans-region]'
      },
      pointers: [
        { worry: 'What needs me right now?', does: 'Everything waiting is in one list with a tab count, so she doesn’t have to remember where to look.', gain: 'Nothing gets lost in a chat thread.', t: '[data-ans-t="waiting"]', device: 'desk', a: 'r', off: 22 },
        { worry: 'I’m out meeting a client.', does: 'Approve is the biggest thing on the phone, so one thumb and a few seconds is enough.', gain: 'Her team isn’t stuck waiting for her.', t: '[data-ans-t="approve"]', device: 'phone', a: 'tr', off: 0, dx: 2, dy: -2 },
        { worry: 'Who approved that?', does: 'Every action is logged with a name and time under the list, so the answer is already in view.', gain: 'Clear answers when the accountant asks.', t: '[data-ans-t="log"]', device: 'desk', a: 'tr', off: 0, dx: -14 },
        { worry: 'Should everyone see everything?', does: 'Each request carries a role tag, so she sees who it belongs to and access is limited by role.', gain: 'Lina runs payments. The big calls stay with Aisha.', t: '[data-ans-t="role"]', device: 'desk', a: 'tr', off: 0, dx: 2, dy: -3 }
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

  function shot(src, alt) {
    var img = document.createElement('img');
    img.className = 'cbx-ans__shot';
    img.src = src;
    img.alt = alt || '';
    img.setAttribute('data-ans-screen', '');
    img.decoding = 'async';
    return img;
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
          '<div class="row hi is-hi">' + ini('M', '#E8A96B') + '<div class="who cbx-who"><b>Mehta Studio</b><span>INV-015</span></div><span class="amt cbx-amt">₹ ——</span><span class="st paid cbx-st is-paid">Paid</span><div class="act"><span class="match"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 6l3 3 5-6"/></svg>Matched to INV-015</span></div></div>' +
          '<div class="row">' + ini('K', '#C8664A') + '<div class="who cbx-who"><b>Kapoor &amp; Co</b><span>INV-011</span></div><span class="amt cbx-amt">₹ ——</span><span class="st late cbx-st is-late">Overdue · oldest</span><div class="act"><span class="btn nudge cbx-btn">Nudge</span></div></div>' +
          '<div class="row">' + ini('R', '#7F95B0') + '<div class="who cbx-who"><b>Rao Interiors</b><span>INV-013</span></div><span class="amt cbx-amt">₹ ——</span><span class="st late cbx-st is-late">Overdue</span><div class="act"><span class="btn nudge cbx-btn">Nudge</span></div></div>' +
          '<div class="row">' + ini('S', '#8FA58A') + '<div class="who cbx-who"><b>Sen Foods</b><span>INV-016</span></div><span class="amt cbx-amt">₹ ——</span><span class="st due cbx-st is-due">Due Fri</span><div class="act"><span class="muted">Sent Mon</span></div></div>' +
        '</section>' +
        '<section class="card c-log"><header><h4>Today</h4><span class="pill soft">Money in</span></header>' +
          '<div class="tl"><div class="ev"><i class="e1"></i><b>Payment received</b><span>Mehta Studio · matched to INV-015</span></div></div>' +
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
          '<div class="row hi">' + ini('M', '#E8A96B') + '<div class="who cbx-who"><b>Mehta Studio</b><span>INV-015</span></div><span class="amt">₹ ——</span><span class="st paid" data-ans-t="paid">Paid</span><div class="act"><span class="match" data-ans-t="match">' + matchMark() + 'Matched to INV-015</span></div></div>' +
          '<div class="row">' + ini('K', '#C8664A') + '<div class="who cbx-who"><b>Kapoor &amp; Co</b><span>INV-011</span></div><span class="amt">₹ ——</span><span class="st late" data-ans-t="owe">Overdue · oldest</span><div class="act"><span class="btn nudge cbx-btn" data-ans-t="nudge">Nudge</span></div></div>' +
          '<div class="row">' + ini('R', '#7F95B0') + '<div class="who cbx-who"><b>Rao Interiors</b><span>INV-013</span></div><span class="amt">₹ ——</span><span class="st late">Overdue</span><div class="act"><span class="btn nudge">Nudge</span></div></div>' +
          '<div class="row">' + ini('S', '#8FA58A') + '<div class="who cbx-who"><b>Sen Foods</b><span>INV-016</span></div><span class="amt">₹ ——</span><span class="st due">Due Fri</span><div class="act"><span class="muted">Sent Mon</span></div></div>' +
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

  function buildDesk(ch) {
    var wrap = el('div', 'cbx-desk');
    wrap.setAttribute('data-slot', 'desk');
    wrap.setAttribute('data-ans-device', 'desk');
    if (ch.deskShot) {
      wrap.appendChild(shot(ch.deskShot, 'Example desktop · ' + ch.deskTitle));
      return wrap;
    }
    wrap.innerHTML = deskChrome(ch, deskMain(ch));
    return wrap;
  }

  function buildPhone(ch) {
    var wrap = el('div', 'cbx-phone');
    wrap.setAttribute('data-slot', 'phone');
    wrap.setAttribute('data-ans-device', 'phone');
    if (ch.phoneShot) {
      wrap.appendChild(shot(ch.phoneShot, 'Example phone · ' + ch.focus));
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
    world.appendChild(buildDesk(ch));
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
    var wrap = el('div', 'cbx-ans__ptrs pw-wrap');
    ch.pointers.forEach(function (p, i) {
      var ptr = el('div', 'cbx-ans__ptr ptr');
      ptr.setAttribute('data-n', String(i));
      ptr.setAttribute('data-device', p.device);
      ptr.innerHTML = '<span class="cbx-ans__pn pn" data-n="' + (i + 1) + '"></span>' +
        '<p class="cbx-ans__pw pw">“' + p.worry + '”</p>' +
        '<p class="cbx-ans__pd pd">' + p.does + '</p>' +
        '<p class="cbx-ans__pg pg"><i>↳</i><span>' + p.gain + '</span></p>';
      wrap.appendChild(ptr);
    });
    var ctag = html('div', 'cbx-ans__ctag ctag', '<span class="tag">Example copy</span>');
    col.appendChild(sline);
    col.appendChild(ask);
    col.appendChild(wrap);
    col.appendChild(ctag);
    note.appendChild(col);

    scene.appendChild(blur);
    scene.appendChild(dim);
    scene.appendChild(nbg);
    scene.appendChild(sharp);
    scene.appendChild(spot);
    scene.appendChild(note);
    return scene;
  }

  function buildHud() {
    var hud = el('div', 'cbx-ans__hud hud');
    hud.innerHTML = '<div class="cbx-ans__lab lab"><span class="cbx-ans__num n">03</span><span class="cbx-ans__title t">How our bank answers her</span></div>' +
      '<div class="cbx-ans__prog prog" aria-hidden="true"><i><b></b></i><i><b></b></i><i><b></b></i></div>' +
      '<span class="cbx-ans__xtag xtag2">Example UI · real screens to come</span>';
    return hud;
  }

  function build() {
    var section = el('section', 'cbx-ans');
    section.setAttribute('data-cbx-section', '03');
    section.setAttribute('data-cbx-live', '');
    section.setAttribute('data-cbx-answers', '');
    section.setAttribute('aria-label', 'How our bank answers her');
    var fit = el('div', 'cbx-ans__fit');
    fit.appendChild(buildHud());
    var stage = el('div', 'cbx-ans__stage');
    var cream = el('div', 'cbx-ans__cream');
    stage.appendChild(cream);
    CHAPTERS.forEach(function (ch, i) {
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
    var wrap = col.querySelector('.cbx-ans__ptrs');
    var g = 28;
    wrap.style.gap = g + 'px';
    var H = col.offsetHeight;
    col.style.top = Math.round(84 + Math.max(0, (768 - H) / 2)) + 'px';
    return { H: H, g: g };
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

  function placeMarks(scene, ch, scale, root) {
    Array.prototype.forEach.call(scene.querySelectorAll('.cbx-ans__mkr, .cbx-ans__ring, .cbx-ans__mpulse, .cbx-ans__rpulse'), function (n) {
      n.parentNode.removeChild(n);
    });
    root = root || scene;
    ch.pointers.forEach(function (p, i) {
      var scope = scene.querySelector('.cbx-ans__cam.is-sharp [data-ans-device="' + p.device + '"]') ||
        scene.querySelector('.cbx-ans__cam.is-sharp');
      var t = p.t ? scope.querySelector(p.t) : null;
      var tr;
      if (p.rect) {
        var slot = scene.querySelector('.cbx-ans__cam.is-sharp [data-ans-device="' + p.device + '"] [data-ans-screen]') ||
          scene.querySelector('.cbx-ans__cam.is-sharp [data-ans-device="' + p.device + '"]');
        var sr = stageRect(slot, root, scale);
        tr = { x: sr.x + sr.w * p.rect.x / 100, y: sr.y + sr.h * p.rect.y / 100, w: sr.w * p.rect.w / 100, h: sr.h * p.rect.h / 100 };
        tr.r = tr.x + tr.w;
        tr.btm = tr.y + tr.h;
      } else if (t) {
        tr = stageRect(t, root, scale);
      } else {
        return;
      }
      var pad = 5;
      var ring = el('div', 'cbx-ans__ring ring');
      ring.style.left = (tr.x - pad) + 'px';
      ring.style.top = (tr.y - pad) + 'px';
      ring.style.width = (tr.w + 2 * pad) + 'px';
      ring.style.height = (tr.h + 2 * pad) + 'px';
      scene.appendChild(ring);
      var pt = anchorPt(tr, p.a || 'l', p.off != null ? p.off : 18);
      var mkr = el('div', 'cbx-ans__mkr mkr');
      mkr.textContent = String(i + 1);
      mkr.style.left = (pt[0] + (p.dx || 0)) + 'px';
      mkr.style.top = (pt[1] + (p.dy || 0)) + 'px';
      scene.appendChild(mkr);
    });
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
      s = Math.min(d.w / Math.max(1, R.r - R.x), (STAGE_H - 56) / hh);
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

  function prepareChapter(scene, ch, k, P, stage, scale) {
    var Z = zoomBox(scene, ch, scale);
    var cams = scene.querySelectorAll('.cbx-ans__camin');
    var gsap = window.gsap;
    gsap.set(cams, { x: Z.tx, y: Z.ty, scale: Z.s, transformOrigin: '0 0', force3D: false });
    if (cams[0]) cams[0].offsetWidth;
    placeMarks(scene, ch, scale, scene);
    if (cams[0]) gsap.set(cams[0], { x: P.tx, y: P.ty, scale: P.s, force3D: false });
    if (cams[1]) gsap.set(cams[1], { x: P.tx, y: P.ty, scale: P.s, force3D: true });
    if (!cams[1] && cams[0]) gsap.set(cams[0], { x: P.tx, y: P.ty, scale: P.s, force3D: true });
    var sharp = scene.querySelector('.cbx-ans__cam.is-sharp');
    var spot = scene.querySelector('.cbx-ans__spot');
    gsap.set(sharp, { clipPath: insetPath(P.tx, P.ty, P.w, P.h, 16 * P.s) });
    gsap.set(spot, { left: P.tx, top: P.ty, width: P.w, height: P.h, opacity: 0 });
    gsap.set(scene.querySelectorAll('.cbx-ans__dim, .cbx-ans__nbg, .cbx-vf, .cbx-vfl'), { opacity: 0 });
    var mk = Array.prototype.slice.call(scene.querySelectorAll('.cbx-ans__mkr'));
    var rg = Array.prototype.slice.call(scene.querySelectorAll('.cbx-ans__ring'));
    var paired = mk.map(function (m, i) {
      return { m: m, g: rg[i], n: +m.textContent };
    }).sort(function (a, b) { return a.n - b.n; });
    mk = paired.map(function (p) { return p.m; });
    rg = paired.map(function (p) { return p.g; });
    var mp = mk.map(function (m) {
      var e = el('div', 'cbx-ans__mpulse mpulse');
      e.style.left = m.style.left;
      e.style.top = m.style.top;
      m.parentNode.insertBefore(e, m);
      return e;
    });
    var rp = rg.map(function (g) {
      var e = el('div', 'cbx-ans__rpulse rpulse');
      ['left', 'top', 'width', 'height', 'borderRadius'].forEach(function (p) {
        e.style[p] = g.style[p];
      });
      g.parentNode.insertBefore(e, g);
      return e;
    });
    gsap.set(mk.concat(rg), { opacity: 0 });
    var ptrs = Array.prototype.slice.call(scene.querySelectorAll('.cbx-ans__ptr')).sort(function (x, y) {
      return +x.getAttribute('data-n') - +y.getAttribute('data-n');
    });
    var ctag = scene.querySelector('.cbx-ans__ctag');
    gsap.set(ptrs.concat([ctag]), { opacity: 0 });
    var h = titleGlide(scene, k, scale, stage);
    var mkav = h.sl.querySelectorAll('.mk, .cbx-mk');
    var slt = h.sl.querySelectorAll('.sline > span, .cbx-sline > span');
    gsap.set(h.sl, { x: h.sdx, y: h.sdy, opacity: k ? 0 : 1 });
    gsap.set(h.q, { x: h.qdx, y: h.qdy, color: '#1E1510', opacity: k ? 0 : 1 });
    gsap.set(slt, { color: '#54463c' });
    gsap.set(mkav, { backgroundColor: '#2A1E17', boxShadow: 'inset 0 0 0 1px rgba(244,239,230,0)' });
    if (k) gsap.set(scene, { opacity: 0 });
    if (isMultiverse() && !h.q.classList.contains('glitch')) {
      h.q.classList.add('glitch');
      h.q.setAttribute('data-text', h.q.textContent);
    }
    return {
      scene: scene,
      cams: cams,
      sharp: sharp,
      spot: spot,
      Z: Z,
      box: { l: P.tx, t: P.ty, r: P.tx + P.w, b: P.ty + P.h, rad: 16 * P.s },
      mk: mk,
      rg: rg,
      mp: mp,
      rp: rp,
      ptrs: ptrs,
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
  var INK = '#1E1510';
  var INK2 = '#54463c';
  var COF = '#2A1E17';
  var CREAM = '#f4efe6';
  var CREAM8 = 'rgba(244,239,230,.8)';
  var MKD = '#3a2a20';

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
    tl.to(l.q, { color: wide ? INK : CREAM, duration: dur, ease: 'sine.inOut' }, t);
    tl.to(l.slt, { color: wide ? INK2 : CREAM8, duration: dur, ease: 'sine.inOut' }, t);
    tl.to(l.mkav, { backgroundColor: wide ? COF : MKD, duration: dur, ease: 'sine.inOut' }, t);
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

  function buildTimeline(section, scale) {
    var gsap = window.gsap;
    var stage = section.querySelector('.cbx-ans__stage');
    var scenes = Array.prototype.slice.call(section.querySelectorAll('.cbx-ans__scene'));
    var P = widePose(stage, scenes, scale);
    var layers = scenes.map(function (scene, k) {
      return prepareChapter(scene, CHAPTERS[k], k, P, stage, scale);
    });
    var hud = section.querySelector('.cbx-ans__hud');
    var bars = section.querySelectorAll('.cbx-ans__prog b');
    var hudWide = { hc: 'rgba(30,21,16,.55)', hb: 'rgba(30,21,16,.35)' };
    var hudZoom = { hc: 'rgba(244,239,230,.62)', hb: 'rgba(244,239,230,.4)' };
    if (isMultiverse()) {
      hudWide = { hc: 'rgba(243,238,228,.62)', hb: 'rgba(61,232,245,.35)' };
      hudZoom = { hc: 'rgba(243,238,228,.72)', hb: 'rgba(61,232,245,.5)' };
    }

    var tl = gsap.timeline({ paused: true, defaults: { force3D: true } });
    var T = START;
    var k;
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
        tl.to(l.ctag, { opacity: 1, duration: 0.8, ease: 'sine.out' }, S0 + ZOOM - 0.3);
        var R0 = S0 + ZOOM + 0.05;
        l.ptrs.forEach(function (p, i) {
          var t = R0 + i * GAP;
          if (l.rg[i]) tl.fromTo(l.rg[i], { opacity: 0 }, { opacity: 1, duration: 0.45, ease: 'sine.out' }, t);
          if (l.rp[i]) {
            tl.fromTo(l.rp[i], { opacity: 1, boxShadow: '0 0 0 2px rgba(232,169,107,.95)' }, {
              opacity: 0, boxShadow: '0 0 0 16px rgba(232,169,107,0)', duration: 0.9, ease: 'power2.out', immediateRender: false
            }, t);
          }
          if (l.mk[i]) tl.fromTo(l.mk[i], { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.55, ease: 'back.out(2.6)' }, t);
          if (l.mp[i]) {
            tl.fromTo(l.mp[i], { opacity: 0.95, scale: 1 }, { opacity: 0, scale: 2.8, duration: 0.8, ease: 'power2.out', immediateRender: false }, t + 0.08);
          }
          tl.fromTo(p, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, t + 0.1);
          if (bars[k]) tl.to(bars[k], { scaleX: 0.2 + 0.8 * (i + 1) / 4, duration: 0.5, ease: 'none' }, t);
        });
        var FULL = R0 + 3 * GAP + 0.8;
        var E = FULL + HOLD;
        var each = 0.5;
        var stg = (OUT - each) / 3;
        [3, 2, 1, 0].forEach(function (i, j) {
          var t = E + j * stg;
          tl.to(l.ptrs[i], { opacity: 0, y: -6, duration: each, ease: 'sine.inOut' }, t);
          if (l.mk[i] && l.rg[i]) tl.to([l.mk[i], l.rg[i]], { opacity: 0, duration: each, ease: 'sine.inOut' }, t);
        });
        tl.to(l.ctag, { opacity: 0, duration: 0.5, ease: 'sine.inOut' }, E + 0.5);
        tl.to(l.vf, { opacity: 0, duration: 0.5, ease: 'sine.inOut' }, E + 0.7);
        var B = E + OUT + 0.05;
        pullBack(tl, l, P, hud, hudWide, B);
        if (k < 2) {
          var W = B + BACK + 0.1;
          var n = layers[k + 1];
          tl.to(l.scene.querySelectorAll('.main, .cbx-phone__screen'), { opacity: 0, duration: 0.4, ease: 'sine.in' }, W);
          tl.to([l.sl, l.q], { opacity: 0.55, duration: 0.28, ease: 'sine.in' }, W);
          tl.set(n.layers, { opacity: 0 }, W - 0.2);
          tl.set(n.scene, { opacity: 1 }, W - 0.2);
          tl.call(function () { n.scene.removeAttribute('hidden'); }, null, W - 0.2);
          tl.fromTo([n.sl, n.q], { opacity: 0.55, y: function (i) { return (i ? n.qdy : n.sdy) + 10; } }, {
            opacity: 1, y: function (i) { return i ? n.qdy : n.sdy; }, duration: 0.55, ease: 'sine.out', immediateRender: false
          }, W);
          tl.to([l.sl, l.q], { opacity: 0, duration: 0.25, ease: 'sine.in' }, W + 0.28);
          tl.set(l.scene, { opacity: 0 }, W + 0.45);
          tl.set(n.scene.querySelectorAll('.cbx-ans__cam'), { opacity: 1 }, W + 0.4);
          tl.set(n.spot, { opacity: 0 }, W + 0.4);
          tl.fromTo(n.scene.querySelectorAll('.main, .cbx-phone__screen'), { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'sine.out' }, W + 0.4);
          tl.fromTo(n.scene.querySelectorAll('.si.new, .cbx-si.is-new'), { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: 0.45, stagger: 0.1, ease: 'power2.out' }, W + 0.45);
          tl.set(n.scene.querySelectorAll('.cbx-ans__dim, .cbx-ans__nbg'), { opacity: 0 }, W + 0.4);
          tl.call(function () { l.scene.setAttribute('hidden', ''); }, null, W + 0.5);
          T = W + 1.2;
        } else {
          T = B + BACK + 0.6;
        }
      }(k));
    }
    tl.to({}, { duration: 0.6 }, T);
    return tl;
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

  function pinActive(on) {
    document.documentElement.classList.toggle('is-cbx-ans-pin', !!on);
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
      animation: tl,
      invalidateOnRefresh: false,
      anticipatePin: 1,
      refreshPriority: -1,
      onUpdate: function (self) {
        if (motion.onStep) motion.onStep(self.progress > 0.02 ? 2 : 1);
      },
      onToggle: function (self) {
        pinActive(self.isActive);
        if (self.isActive && motion.onStep) motion.onStep(2);
      },
      onRefresh: function () {
        fitScale(section);
      }
    });
    motion.tween = tl;
    motion.triggers.push(st);
    section.dataset.ready = '1';
    section.dataset.dur = String(tl.duration());
  }

  function bindReduced(section) {
    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;
    section.classList.add('is-static');
    fitScale(section);
    var scenes = section.querySelectorAll('.cbx-ans__scene');
    Array.prototype.forEach.call(scenes, function (scene, i) {
      scene.hidden = i !== 0;
      scene.style.opacity = i === 0 ? '1' : '0';
      var ptrs = scene.querySelectorAll('.cbx-ans__ptr, .cbx-ans__ctag, .cbx-vf, .cbx-vfl, .cbx-ans__dim, .cbx-ans__nbg, .cbx-ans__spot');
      gsap.set(ptrs, { opacity: 1 });
    });
    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: function () { return '+=' + Math.round(window.innerHeight * 2.4); },
        pin: true,
        pinSpacing: true,
        pinType: 'fixed',
        scrub: 0.6,
        refreshPriority: -1,
        onToggle: function (self) { pinActive(self.isActive); },
        onUpdate: function (self) {
          var i = Math.min(2, Math.floor(self.progress * 3));
          Array.prototype.forEach.call(scenes, function (scene, n) {
            var on = n === i;
            scene.hidden = !on;
            scene.style.opacity = on ? '1' : '0';
          });
          if (motion.onStep) motion.onStep(2);
        }
      }
    });
    motion.tween = tl;
    if (tl.scrollTrigger) motion.triggers.push(tl.scrollTrigger);
    section.dataset.ready = '1';
  }

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
    scenes.forEach(function (scene, k) {
      placeMarks(scene, CHAPTERS[k], 1);
    });
    scenes.forEach(function (scene, k) {
      if (k) {
        scene.setAttribute('hidden', '');
        scene.style.opacity = '0';
      }
    });
    var tl = gsap.timeline({ paused: true });
    var T = 0.2;
    scenes.forEach(function (scene, k) {
      var ptrs = Array.prototype.slice.call(scene.querySelectorAll('.cbx-ans__ptr'));
      var mk = Array.prototype.slice.call(scene.querySelectorAll('.cbx-ans__mkr'));
      gsap.set(ptrs, { opacity: 0, y: 8 });
      gsap.set(mk, { opacity: 0, scale: 0.4 });
      gsap.set(scene, { opacity: k ? 0 : 1 });
      if (k) scene.setAttribute('hidden', '');
      else scene.removeAttribute('hidden');
      if (k) {
        tl.set(scene, { opacity: 1 }, T);
        tl.call(function () { scene.removeAttribute('hidden'); }, null, T);
        if (k) tl.set(scenes[k - 1], { opacity: 0 }, T + 0.15);
        if (k) tl.call(function () { scenes[k - 1].setAttribute('hidden', ''); }, null, T + 0.2);
        T += 0.25;
      }
      ptrs.forEach(function (p, i) {
        var t = T + i * 0.9;
        if (i === 0) p.classList.add('is-current');
        else p.classList.remove('is-current');
        if (mk[i]) tl.fromTo(mk[i], { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' }, t);
        tl.call(function () {
          ptrs.forEach(function (node, n) {
            node.classList.toggle('is-current', n === i);
          });
        }, null, t);
        tl.fromTo(p, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' }, t + 0.08);
      });
      T += 0.9 * 3 + 1.6;
    });
    tl.to({}, { duration: 0.4 }, T);
    var st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: function () { return '+=' + Math.round(tl.duration() * 140); },
      pin: true,
      pinSpacing: true,
      pinType: 'fixed',
      scrub: 0.8,
      animation: tl,
      refreshPriority: -1,
      onToggle: function (self) { pinActive(self.isActive); },
      onUpdate: function (self) {
        if (motion.onStep) motion.onStep(self.progress > 0.02 ? 2 : 1);
      }
    });
    motion.tween = tl;
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
    var section = world && world.querySelector('[data-cbx-answers]');
    if (!section) return;
    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;
    motion.pin = section;
    motion.onStep = opts.onStep || null;
    motion.page = opts.page || '';
    motion.reduce = !!(opts.reduce || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches));
    if (!gsap || !ScrollTrigger) {
      section.classList.add('is-static');
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    motion.fit = function () { fitScale(section); };
    window.addEventListener('resize', motion.fit);
    function go() {
      fitScale(section);
      var mm = gsap.matchMedia();
      motion.mm = mm;
      mm.add({
        isWide: '(min-width: 860px)',
        isNarrow: '(max-width: 859px)',
        reduce: '(prefers-reduced-motion: reduce)'
      }, function (ctx) {
        var c = ctx.conditions || {};
        if (c.reduce || motion.reduce) bindReduced(section);
        else if (c.isNarrow) bindNarrow(section);
        else bindCamera(section);
        seekIfNeeded();
        if (window.ScrollTrigger && window.ScrollTrigger.refresh) {
          window.requestAnimationFrame(function () {
            window.ScrollTrigger.refresh();
            seekIfNeeded();
          });
        }
        return function () {
          pinActive(false);
          if (motion.tween && motion.tween.kill) motion.tween.kill();
          motion.tween = null;
          motion.triggers.forEach(function (t) { if (t && t.kill) t.kill(); });
          motion.triggers = [];
          section.classList.remove('is-static', 'is-narrow');
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
