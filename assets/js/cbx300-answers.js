/**
 * CBX300 Section 03 — How our bank answers her.
 * Camera-into-the-screen, scrubbed to scroll. Timing, copy and
 * camera grammar come from the approved d1-scroll prototype.
 *
 * Device emphasis (Tanishk, 2026-09-30):
 *   Ch1 / Ch2 — phone is the hero. Desktop sits behind, dimmed, and
 *               still grows (sidebar 3 → 6). Pointers land on the phone.
 *   Ch3       — phone and desktop share the frame. Pointers 1, 3, 4
 *               light the desktop; pointer 2 lights the phone.
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

  var PX_PER_SEC = 170;
  var ZOOM = 2.1;
  var GAP = 1.0;
  var OUT = 1.2;
  var BACK = 2.1;
  var HOLD = 5.3;
  var START = 0.7;
  var CURTAIN = 0.55;

  var motion = {
    mm: null,
    triggers: [],
    tween: null,
    pin: null,
    reduce: false
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
      region: { phone: '[data-ans-device="phone"] [data-ans-screen]', desk: null },
      pointers: [
        {
          worry: 'Did Mehta pay?',
          does: 'Shows <b>Paid</b> the moment money lands.',
          gain: 'No awkward call to the client.',
          t: '[data-ans-t="paid"]',
          device: 'phone',
          a: 'l'
        },
        {
          worry: 'Which invoice was that for?',
          does: 'Matches every payment to the invoice it settles.',
          gain: 'Books that balance without a spreadsheet.',
          t: '[data-ans-t="match"]',
          device: 'phone',
          a: 'l'
        },
        {
          worry: 'Who still owes me?',
          does: 'Lists unpaid invoices, oldest first.',
          gain: 'She knows who to chase, and who to leave alone.',
          t: '[data-ans-t="owe"]',
          device: 'phone',
          a: 'l'
        },
        {
          worry: 'Chasing feels rude.',
          does: 'Drafts a polite reminder, sent in one tap.',
          gain: 'The money comes in. The relationship stays warm.',
          t: '[data-ans-t="nudge"]',
          device: 'phone',
          a: 'l'
        }
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
      region: { phone: '[data-ans-device="phone"] [data-ans-screen]', desk: null },
      pointers: [
        {
          worry: 'Is this money really mine?',
          does: 'Splits the balance into safe to spend, set aside and coming in.',
          gain: 'One honest number to decide with.',
          t: '[data-ans-t="safe"]',
          device: 'phone',
          a: 'c'
        },
        {
          worry: 'Will GST and rent eat into it?',
          does: 'Puts salary, tax and rent aside before the month begins.',
          gain: 'No bill ambushes payday.',
          t: '[data-ans-t="aside"]',
          device: 'phone',
          a: 'l'
        },
        {
          worry: 'What if a client pays late?',
          does: 'Keeps expected money out of what’s safe to spend.',
          gain: 'She never spends money that hasn’t arrived.',
          t: '[data-ans-t="coming"]',
          device: 'phone',
          a: 'l'
        },
        {
          worry: 'Can I pay Lina on Friday?',
          does: 'Marks payday and checks the money is already there.',
          gain: 'She says yes to her first hire, calmly.',
          t: '[data-ans-t="payday"]',
          device: 'phone',
          a: 'l'
        }
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
        desk: '[data-ans-device="desk"] [data-ans-screen]'
      },
      pointers: [
        {
          worry: 'What needs me right now?',
          does: 'Gathers approvals, payments and requests in one list.',
          gain: 'Nothing gets lost in a chat thread.',
          t: '[data-ans-t="waiting"]',
          device: 'desk',
          a: 'r'
        },
        {
          worry: 'I’m out meeting a client.',
          does: 'Approves in one tap, from her desk or her phone.',
          gain: 'Her team isn’t stuck waiting for her.',
          t: '[data-ans-t="approve"]',
          device: 'phone',
          a: 'tr'
        },
        {
          worry: 'Who approved that?',
          does: 'Logs every action with a name.',
          gain: 'Clear answers when the accountant asks.',
          t: '[data-ans-t="log"]',
          device: 'desk',
          a: 'tr'
        },
        {
          worry: 'Should everyone see everything?',
          does: 'Gives each person a role with the right access.',
          gain: 'Lina runs payments. The big calls stay with Aisha.',
          t: '[data-ans-t="role"]',
          device: 'desk',
          a: 'tr'
        }
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
    return '<svg class="cbx-ui__ic" viewBox="0 0 18 18" aria-hidden="true">' + (d[name] || d.home) + '</svg>';
  }

  function portrait(name) {
    var faces = {
      aisha: '<path d="M8 14 C7 3 27 3 26 14 L26.5 21 C24 22 23 19 23 19 L11 19 C11 19 10 22 7.5 21 Z" fill="#1B120D"/><path d="M5 40 C5 29 10 25 17 25 C24 25 29 29 29 40 Z" fill="#E9C85A"/><rect x="14" y="20" width="6" height="7" rx="2.5" fill="#C98E6B"/><ellipse cx="17" cy="15" rx="7.5" ry="8.5" fill="#C98E6B"/><path d="M9 13 C10 5 24 4 25.5 12 C21 8.5 14 8.5 9 13 Z" fill="#1B120D"/><circle cx="13.6" cy="15" r="2.7" fill="none" stroke="#1E1510" stroke-width="1.1"/><circle cx="20.4" cy="15" r="2.7" fill="none" stroke="#1E1510" stroke-width="1.1"/><path d="M16.3 15 H17.7" stroke="#1E1510" stroke-width="1.1"/>',
      lina: '<circle cx="17" cy="4.5" r="4" fill="#6E4630"/><path d="M5 40 C5 29 10 25 17 25 C24 25 29 29 29 40 Z" fill="#8FA58A"/><rect x="14" y="20" width="6" height="7" rx="2.5" fill="#E0B08A"/><ellipse cx="17" cy="15" rx="7.5" ry="8.5" fill="#E0B08A"/><path d="M9 13 C9 4.5 25 4.5 25 13 C21 9 13 9 9 13 Z" fill="#6E4630"/>',
      dev: '<path d="M5 40 C5 29 10 25 17 25 C24 25 29 29 29 40 Z" fill="#C8664A"/><rect x="14" y="20" width="6" height="7" rx="2.5" fill="#8A5A3C"/><ellipse cx="17" cy="15" rx="7.5" ry="8.5" fill="#8A5A3C"/><path d="M9.5 11 C9.5 4.5 24.5 4.5 24.5 11 C21 8.5 13 8.5 9.5 11 Z" fill="#1B120D"/>',
      mira: '<path d="M8.5 13 C8 4 26 4 25.5 13 L26 26 L8 26 Z" fill="#3A2A20"/><path d="M5 40 C5 29 10 25 17 25 C24 25 29 29 29 40 Z" fill="#7F95B0"/><rect x="14" y="20" width="6" height="7" rx="2.5" fill="#D9A57E"/><ellipse cx="17" cy="15" rx="7.5" ry="8.5" fill="#D9A57E"/><path d="M9 13 C10 5 24 5 25 13 C20 9 14 9 9 13 Z" fill="#3A2A20"/>',
      arjun: '<path d="M5 40 C5 29 10 25 17 25 C24 25 29 29 29 40 Z" fill="#E8A96B"/><rect x="14" y="20" width="6" height="7" rx="2.5" fill="#B97A55"/><ellipse cx="17" cy="15" rx="7.5" ry="8.5" fill="#B97A55"/><circle cx="11" cy="9" r="3.4" fill="#2A1E17"/><circle cx="15" cy="6.5" r="3.4" fill="#2A1E17"/><circle cx="19.5" cy="6.5" r="3.4" fill="#2A1E17"/><circle cx="23" cy="9" r="3.4" fill="#2A1E17"/><circle cx="10" cy="12.5" r="3.4" fill="#2A1E17"/><circle cx="24" cy="12.5" r="3.4" fill="#2A1E17"/>'
    };
    return '<svg class="cbx-pp" viewBox="0 0 34 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + (faces[name] || faces.aisha) + '</svg>';
  }

  function av(name, size) {
    return '<span class="cbx-av' + (size ? ' ' + size : '') + '">' + portrait(name) + '</span>';
  }

  function ini(letter, color) {
    return '<span class="cbx-ini" style="background:' + color + '">' + letter + '</span>';
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
      var cls = 'cbx-si' + (item.on ? ' is-on' : '') + (item.neu ? ' is-new' : '');
      return '<div class="' + cls + '">' + ic(item.id) + '<span>' + item.label + '</span>' +
        (item.neu ? '<em>New</em>' : '') + '</div>';
    }).join('');
  }

  function deskChrome(ch, main) {
    return '<div class="cbx-desk__bar"><i></i><i></i><i></i><span>CBX300 · Business banking</span></div>' +
      '<div class="cbx-desk__body">' +
        '<aside class="cbx-desk__sb">' +
          '<div class="cbx-desk__logo"><b></b><span>CBX300</span></div>' +
          '<nav>' + navItems(ch.nav) + '</nav>' +
          '<div class="cbx-desk__me">' + av('aisha', 'is-s') + '<span>Aisha</span></div>' +
        '</aside>' +
        '<div class="cbx-desk__main" data-ans-screen>' +
          '<div class="cbx-ui__mh"><div><span class="cbx-ui__crumb">' + ch.deskCrumb + '</span><h3>' + ch.deskTitle + '</h3></div>' +
          '<div class="cbx-ui__mhr"><span class="cbx-ui__search">' + ic('search') + 'Search</span>' + av('aisha', 'is-s') + '</div></div>' +
          main +
        '</div>' +
      '</div>';
  }

  function deskMain(ch) {
    if (ch.id === 'solo') {
      return '<section class="cbx-card">' +
        '<header><h4>Invoices</h4><div class="cbx-seg"><span class="is-on">All</span><span>Unpaid</span><span>Paid</span></div></header>' +
        '<div class="cbx-inv">' +
          '<div class="cbx-inv__row is-hi">' + ini('M', '#E8A96B') + '<div class="cbx-who"><b>Mehta Studio</b><span>INV-015</span></div><span class="cbx-amt">₹ ——</span><span class="cbx-st is-paid">Paid</span></div>' +
          '<div class="cbx-inv__row">' + ini('K', '#C8664A') + '<div class="cbx-who"><b>Kapoor &amp; Co</b><span>INV-011</span></div><span class="cbx-amt">₹ ——</span><span class="cbx-st is-late">Overdue</span><span class="cbx-btn">Nudge</span></div>' +
          '<div class="cbx-inv__row">' + ini('R', '#7F95B0') + '<div class="cbx-who"><b>Rao Interiors</b><span>INV-013</span></div><span class="cbx-amt">₹ ——</span><span class="cbx-st is-late">Overdue</span><span class="cbx-btn">Nudge</span></div>' +
          '<div class="cbx-inv__row">' + ini('S', '#8FA58A') + '<div class="cbx-who"><b>Sen Foods</b><span>INV-016</span></div><span class="cbx-amt">₹ ——</span><span class="cbx-st is-due">Due Fri</span></div>' +
        '</div></section>';
    }
    if (ch.id === 'hire') {
      return '<section class="cbx-card">' +
        '<header><h4>Balance</h4><span class="cbx-pill">This month</span></header>' +
        '<div class="cbx-bigamt">₹ ——</div>' +
        '<div class="cbx-sbar"><i class="is-safe"></i><i class="is-aside"></i><i class="is-in"></i></div>' +
        '<div class="cbx-legend"><div><i class="is-safe"></i><b>Safe to spend</b><span>₹ ——</span></div><div><i class="is-aside"></i><b>Set aside</b><span>₹ ——</span></div><div><i class="is-in"></i><b>Coming in</b><span>₹ ——</span></div></div>' +
        '</section>' +
        '<section class="cbx-card cbx-card--week"><header><h4>This week</h4></header>' +
        '<div class="cbx-days7"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span class="is-pay">Fri</span><span>Sat</span><span>Sun</span></div>' +
        '<div class="cbx-paychip">' + av('lina') + '<div><b>Lina’s salary</b><span>Payday · Friday</span></div><span class="cbx-ok">Covered</span></div>' +
        '</section>';
    }
    return '<section class="cbx-card">' +
      '<header data-ans-t="waiting"><h4>Waiting on you</h4><span class="cbx-cnt">4</span><span class="cbx-pill">Today</span></header>' +
      '<div class="cbx-appr">' +
        '<div class="cbx-appr__row">' + av('lina') + '<div class="cbx-who"><b>Lina · Vendor payment</b><span>Print shop</span></div><span class="cbx-role is-pay" data-ans-t="role">Payments</span><span class="cbx-amt">₹ ——</span><span class="cbx-btn is-ghost">Decline</span><span class="cbx-btn is-ok">Approve</span></div>' +
        '<div class="cbx-appr__row">' + av('dev') + '<div class="cbx-who"><b>Dev · Reimbursement</b><span>Client travel</span></div><span class="cbx-role is-ok">Approver</span><span class="cbx-amt">₹ ——</span><span class="cbx-btn is-ghost">Decline</span><span class="cbx-btn is-ok">Approve</span></div>' +
        '<div class="cbx-appr__row">' + av('mira') + '<div class="cbx-who"><b>Mira · New vendor</b><span>Packaging supplier</span></div><span class="cbx-role is-ops">Ops</span><span class="cbx-amt">₹ ——</span><span class="cbx-btn is-ghost">Decline</span><span class="cbx-btn is-ok">Approve</span></div>' +
        '<div class="cbx-appr__row">' + av('arjun') + '<div class="cbx-who"><b>Arjun · Subscription</b><span>Design software</span></div><span class="cbx-role is-des">Design</span><span class="cbx-amt">₹ ——</span><span class="cbx-btn is-ghost">Decline</span><span class="cbx-btn is-ok">Approve</span></div>' +
      '</div>' +
      '<div class="cbx-alog" data-ans-t="log"><span>Earlier today</span>' + av('lina', 'is-s') + '<b>Lina approved</b><span>Courier invoice</span><i></i>' + av('dev', 'is-s') + '<b>Dev paid</b><span>Office rent</span></div>' +
      '</section>';
  }

  function phoneScreen(ch) {
    if (ch.id === 'solo') {
      return '<div class="cbx-ph__head"><div><span class="cbx-ui__crumb">Home</span><h3>Invoices</h3></div>' + av('aisha', 'is-s') + '</div>' +
        '<div class="cbx-ph__bal"><span>Balance</span><b>₹ ——</b></div>' +
        '<div class="cbx-alert" data-ans-t="match"><strong>Payment received</strong><span>Mehta Studio · matched to INV-015</span></div>' +
        '<div class="cbx-ph__list">' +
          '<div class="cbx-ph__row is-hi">' + ini('M', '#E8A96B') + '<div class="cbx-who"><b>Mehta Studio</b><span>INV-015 · ₹ ——</span></div><span class="cbx-st is-paid" data-ans-t="paid">Paid</span></div>' +
          '<div class="cbx-ph__row">' + ini('K', '#C8664A') + '<div class="cbx-who"><b>Kapoor &amp; Co</b><span>INV-011 · ₹ ——</span></div><span class="cbx-st is-late" data-ans-t="owe">Overdue · oldest</span><span class="cbx-btn" data-ans-t="nudge">Nudge</span></div>' +
          '<div class="cbx-ph__row">' + ini('R', '#7F95B0') + '<div class="cbx-who"><b>Rao Interiors</b><span>INV-013 · ₹ ——</span></div><span class="cbx-st is-late">Overdue</span><span class="cbx-btn">Nudge</span></div>' +
          '<div class="cbx-ph__row">' + ini('S', '#8FA58A') + '<div class="cbx-who"><b>Sen Foods</b><span>INV-016 · ₹ ——</span></div><span class="cbx-st is-due">Due Fri</span></div>' +
        '</div>';
    }
    if (ch.id === 'hire') {
      return '<div class="cbx-ph__head"><div><span class="cbx-ui__crumb">Planning</span><h3>Cash plan</h3></div>' + av('aisha', 'is-s') + '</div>' +
        '<div class="cbx-ph__bal"><span>Balance</span><b>₹ ——</b></div>' +
        '<div class="cbx-sbar" data-ans-t="safe"><i class="is-safe"></i><i class="is-aside"></i><i class="is-in"></i></div>' +
        '<div class="cbx-legend">' +
          '<div data-ans-t="aside"><i class="is-aside"></i><b>Set aside</b><span>₹ ——</span></div>' +
          '<div data-ans-t="coming"><i class="is-in"></i><b>Coming in</b><span>₹ ——</span></div>' +
          '<div><i class="is-safe"></i><b>Safe to spend</b><span>₹ ——</span></div>' +
        '</div>' +
        '<div class="cbx-days7"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span class="is-pay">Fri</span><span>Sat</span><span>Sun</span></div>' +
        '<div class="cbx-paychip" data-ans-t="payday">' + av('lina') + '<div><b>Lina’s salary</b><span>Payday · Friday</span></div><span class="cbx-ok">Covered</span></div>';
    }
    return '<div class="cbx-ph__head"><div><span class="cbx-ui__crumb">Team</span><h3>Waiting on you</h3></div><span class="cbx-cnt">1</span></div>' +
      '<div class="cbx-ph__approve">' + av('lina') + '<div class="cbx-who"><b>Lina · Vendor payment</b><span>Print shop · ₹ ——</span></div></div>' +
      '<button class="cbx-btn is-ok is-lg" type="button" data-ans-t="approve" tabindex="-1">Approve</button>' +
      '<span class="cbx-btn is-ghost is-lg">Decline</span>';
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
        '<div class="cbx-phone__screen" data-ans-screen>' + phoneScreen(ch) + '</div>' +
        '<div class="cbx-phone__tabs">' +
          '<span class="cbx-tb">Home</span><span class="cbx-tb is-on">' + ch.focus + '</span><span class="cbx-tb">Pay</span>' +
        '</div>' +
        '<i class="cbx-phone__home"></i>' +
      '</div>';
    return wrap;
  }

  function peopleRow(names) {
    return '<span class="cbx-mk">' + names.map(function (n) {
      return '<span class="cbx-mkp">' + portrait(n) + '</span>';
    }).join('') + '</span>';
  }

  function buildWorld(ch) {
    var world = el('div', 'cbx-ans__world');
    world.appendChild(buildDesk(ch));
    world.appendChild(buildPhone(ch));
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
    blurIn.appendChild(buildWorld(ch));
    blur.appendChild(blurIn);

    var dim = el('div', 'cbx-ans__dim');
    var nbg = el('div', 'cbx-ans__nbg');

    var sharp = el('div', 'cbx-ans__cam is-sharp');
    var sharpIn = el('div', 'cbx-ans__camin');
    sharpIn.appendChild(buildWorld(ch));
    sharp.appendChild(sharpIn);

    var spot = el('div', 'cbx-ans__spot');
    spot.innerHTML = '<i class="cbx-vf is-tl"></i><i class="cbx-vf is-tr"></i><i class="cbx-vf is-bl"></i><i class="cbx-vf is-br"></i>' +
      '<span class="cbx-vfl"><b></b>In focus · ' + ch.focus + '</span>';

    var note = el('div', 'cbx-ans__note');
    var col = el('div', 'cbx-ans__ncol');
    var sline = html('div', 'cbx-ans__sline', '<span class="cbx-sline">' + peopleRow(ch.people) + '<span>' + ch.kicker + '</span></span>');
    var ask = el('h2', 'cbx-ans__ask', '“' + ch.ask + '”');
    if (isMultiverse()) {
      ask.classList.add('glitch');
      ask.setAttribute('data-text', ask.textContent);
    }
    var wrap = el('div', 'cbx-ans__ptrs');
    ch.pointers.forEach(function (p, i) {
      var ptr = el('div', 'cbx-ans__ptr');
      ptr.setAttribute('data-n', String(i));
      ptr.setAttribute('data-device', p.device);
      ptr.innerHTML = '<span class="cbx-ans__pn" data-n="' + (i + 1) + '"></span>' +
        '<p class="cbx-ans__pw">“' + p.worry + '”</p>' +
        '<p class="cbx-ans__pd">' + p.does + '</p>' +
        '<p class="cbx-ans__pg"><i>↳</i><span>' + p.gain + '</span></p>';
      wrap.appendChild(ptr);
    });
    var ctag = html('div', 'cbx-ans__ctag', '<span>Example copy</span>');
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
    var hud = el('div', 'cbx-ans__hud');
    hud.innerHTML = '<div class="cbx-ans__lab"><span class="cbx-ans__num">03</span><span class="cbx-ans__title">How our bank answers her</span></div>' +
      '<div class="cbx-ans__prog" aria-hidden="true"><i><b></b></i><i><b></b></i><i><b></b></i></div>' +
      '<span class="cbx-ans__xtag">Example UI · real screens to come</span>';
    return hud;
  }

  function build() {
    var section = el('section', 'cbx-ans');
    section.setAttribute('data-cbx-section', '03');
    section.setAttribute('data-cbx-live', '');
    section.setAttribute('data-cbx-answers', '');
    section.setAttribute('aria-label', 'How our bank answers her');
    section.appendChild(buildHud());
    var stage = el('div', 'cbx-ans__stage');
    CHAPTERS.forEach(function (ch, i) {
      stage.appendChild(buildScene(ch, i));
    });
    section.appendChild(stage);
    return section;
  }

  function buildNext() {
    var section = el('section', 'cbx-next');
    section.setAttribute('data-cbx-section', '04');
    section.setAttribute('data-cbx-next', '');
    section.innerHTML = '<p class="cbx-next__kicker">Next</p><h2 class="cbx-next__title">04</h2><p class="cbx-next__body">Next chapter in this case.</p>';
    return section;
  }

  function relRect(el, root) {
    var a = el.getBoundingClientRect();
    var b = root.getBoundingClientRect();
    return { x: a.left - b.left, y: a.top - b.top, w: a.width, h: a.height, r: a.right - b.left, btm: a.bottom - b.top };
  }

  function insetPath(x, y, w, h, r, sw, sh) {
    return 'inset(' + y + 'px ' + (sw - x - w) + 'px ' + (sh - y - h) + 'px ' + x + 'px round ' + r + 'px)';
  }

  function textWidth(node) {
    var range = document.createRange();
    range.selectNodeContents(node);
    var rs = Array.prototype.slice.call(range.getClientRects());
    if (!rs.length) {
      var box = node.getBoundingClientRect();
      return { l: box.left, r: box.right };
    }
    return {
      l: Math.min.apply(null, rs.map(function (q) { return q.left; })),
      r: Math.max.apply(null, rs.map(function (q) { return q.right; }))
    };
  }

  function placeNote(scene) {
    var col = scene.querySelector('.cbx-ans__ncol');
    var wrap = col.querySelector('.cbx-ans__ptrs');
    var g = 28;
    wrap.style.gap = g + 'px';
    var limit = Math.max(420, scene.offsetHeight - 132);
    while (col.offsetHeight > limit && g > 10) {
      g -= 2;
      wrap.style.gap = g + 'px';
    }
    col.style.top = Math.max(12, Math.round((limit - col.offsetHeight) / 2)) + 'px';
  }

  function layoutMarkers(scene, ch, root) {
    Array.prototype.forEach.call(scene.querySelectorAll('.cbx-ans__mkr, .cbx-ans__ring, .cbx-ans__mpulse, .cbx-ans__rpulse'), function (n) {
      if (n.parentNode) n.parentNode.removeChild(n);
    });
    var sr = scene.getBoundingClientRect();
    var items = ch.pointers.map(function (p, i) {
      var scope = scene.querySelector('.cbx-ans__cam.is-sharp [data-ans-device="' + p.device + '"]') ||
        scene.querySelector('.cbx-ans__cam.is-sharp');
      var t = p.t ? scope.querySelector(p.t) : null;
      if (!t && p.rect) return { n: i + 1, fake: p.rect, p: p };
      return { n: i + 1, t: t, p: p };
    });
    items.forEach(function (it) {
      var tr;
      if (it.t) {
        var r = it.t.getBoundingClientRect();
        tr = { x: r.left - sr.left, y: r.top - sr.top, w: r.width, h: r.height };
      } else if (it.fake) {
        var slot = scene.querySelector('.cbx-ans__cam.is-sharp [data-ans-device="' + it.p.device + '"] [data-ans-screen]') ||
          scene.querySelector('.cbx-ans__cam.is-sharp [data-ans-device="' + it.p.device + '"]');
        var sr2 = slot ? slot.getBoundingClientRect() : sr;
        tr = {
          x: sr2.left - sr.left + sr2.width * it.fake.x / 100,
          y: sr2.top - sr.top + sr2.height * it.fake.y / 100,
          w: sr2.width * it.fake.w / 100,
          h: sr2.height * it.fake.h / 100
        };
      } else {
        return;
      }
      var pad = 6;
      var ring = el('div', 'cbx-ans__ring');
      ring.style.left = (tr.x - pad) + 'px';
      ring.style.top = (tr.y - pad) + 'px';
      ring.style.width = (tr.w + pad * 2) + 'px';
      ring.style.height = (tr.h + pad * 2) + 'px';
      scene.appendChild(ring);
      var mx = tr.x + (it.p.a === 'c' ? tr.w / 2 : it.p.a === 'r' || it.p.a === 'tr' ? tr.w + 16 : -16);
      var my = tr.y + (it.p.a === 'tr' ? 4 : tr.h / 2);
      var mkr = el('div', 'cbx-ans__mkr');
      mkr.textContent = String(it.n);
      mkr.style.left = mx + 'px';
      mkr.style.top = my + 'px';
      if (isMultiverse()) mkr.classList.add('glitch');
      scene.appendChild(mkr);
    });
  }

  function zoomBox(scene, ch, stage) {
    var inner = scene.querySelector('.cbx-ans__cam.is-sharp .cbx-ans__camin');
    var gsap = window.gsap;
    if (gsap) gsap.set(inner, { x: 0, y: 0, scale: 1, transformOrigin: '0 0' });
    var sels = [];
    if (ch.hero === 'both') {
      sels = [ch.region.desk, ch.region.phone].filter(Boolean);
    } else {
      sels = [ch.region.phone || ch.region.desk];
    }
    var rs = sels.map(function (sel) {
      var node = inner.querySelector(sel);
      return node ? relRect(node, inner) : null;
    }).filter(Boolean);
    if (!rs.length) {
      rs = [{ x: 0, y: 0, w: inner.offsetWidth, h: inner.offsetHeight, r: inner.offsetWidth, btm: inner.offsetHeight }];
    }
    var R = {
      x: Math.min.apply(null, rs.map(function (r) { return r.x; })),
      y: Math.min.apply(null, rs.map(function (r) { return r.y; })),
      r: Math.max.apply(null, rs.map(function (r) { return r.r; })),
      b: Math.max.apply(null, rs.map(function (r) { return r.btm; }))
    };
    var sw = stage.offsetWidth;
    var sh = stage.offsetHeight;
    var dW = Math.min(sw * 0.62, 880);
    var dX = Math.max(24, sw * 0.035);
    var dCy = sh * 0.52;
    var s = dW / Math.max(40, R.r - R.x);
    var hh = (R.b - R.y) * s;
    var tx = dX - R.x * s;
    var y0 = dCy - hh / 2;
    var ty = y0 - R.y * s;
    var pad = 16;
    return { s: s, tx: tx, ty: ty, X: dX - pad, Y: y0 - pad, W: dW + pad * 2, H: hh + pad * 2 };
  }

  function prepareChapter(scene, ch, k, P, stage) {
    var gsap = window.gsap;
    placeNote(scene);
    var sl = scene.querySelector('.cbx-ans__sline');
    var q = scene.querySelector('.cbx-ans__ask');
    var sli = sl.querySelector('.cbx-sline');
    var a = sl.getBoundingClientRect();
    var b = q.getBoundingClientRect();
    var at = textWidth(sli);
    var bt = textWidth(q);
    var cx = stage.getBoundingClientRect().left + stage.offsetWidth / 2;
    var WTOP = Math.max(56, stage.offsetHeight * 0.075);
    var sdx = cx - (at.l + at.r) / 2;
    var sdy = WTOP - a.top;
    var qdx = cx - (bt.l + bt.r) / 2;
    var qdy = WTOP + a.height + 12 - b.top;
    var cams = scene.querySelectorAll('.cbx-ans__camin');
    var Z = zoomBox(scene, ch, stage);
    gsap.set(cams, { x: Z.tx, y: Z.ty, scale: Z.s, transformOrigin: '0 0' });
    layoutMarkers(scene, ch, scene);
    gsap.set(cams, { x: P.tx, y: P.ty, scale: P.s });
    var sharp = scene.querySelector('.cbx-ans__cam.is-sharp');
    var spot = scene.querySelector('.cbx-ans__spot');
    var SW = stage.offsetWidth;
    var SH = stage.offsetHeight;
    gsap.set(sharp, { clipPath: insetPath(P.tx, P.ty, P.w, P.h, 14 * P.s, SW, SH) });
    gsap.set(spot, { left: P.tx, top: P.ty, width: P.w, height: P.h, opacity: 0 });
    gsap.set(scene.querySelectorAll('.cbx-ans__dim, .cbx-ans__nbg, .cbx-vf, .cbx-vfl'), { opacity: 0 });
    var mk = Array.prototype.slice.call(scene.querySelectorAll('.cbx-ans__mkr'));
    var rg = Array.prototype.slice.call(scene.querySelectorAll('.cbx-ans__ring'));
    var paired = mk.map(function (m, i) { return { m: m, g: rg[i], n: +m.textContent }; }).sort(function (x, y) { return x.n - y.n; });
    mk = paired.map(function (p) { return p.m; });
    rg = paired.map(function (p) { return p.g; });
    var mp = mk.map(function (m) {
      var e = el('div', 'cbx-ans__mpulse');
      e.style.left = m.style.left;
      e.style.top = m.style.top;
      m.parentNode.insertBefore(e, m);
      return e;
    });
    var rp = rg.map(function (g) {
      var e = el('div', 'cbx-ans__rpulse');
      e.style.left = g.style.left;
      e.style.top = g.style.top;
      e.style.width = g.style.width;
      e.style.height = g.style.height;
      g.parentNode.insertBefore(e, g);
      return e;
    });
    gsap.set(mk.concat(rg), { opacity: 0 });
    var ptrs = Array.prototype.slice.call(scene.querySelectorAll('.cbx-ans__ptr')).sort(function (x, y) {
      return +x.getAttribute('data-n') - +y.getAttribute('data-n');
    });
    var ctag = scene.querySelector('.cbx-ans__ctag');
    gsap.set(ptrs.concat([ctag]), { opacity: 0 });
    var mkav = sl.querySelectorAll('.cbx-mk');
    var slt = sl.querySelectorAll('.cbx-sline > span');
    gsap.set(sl, { x: sdx, y: sdy, opacity: k ? 0 : 1 });
    gsap.set(q, { x: qdx, y: qdy, opacity: k ? 0 : 1 });
    if (k) gsap.set(scene, { opacity: 0 });
    else scene.removeAttribute('hidden');
    return {
      scene: scene,
      cams: cams,
      sharp: sharp,
      spot: spot,
      Z: Z,
      box: { l: P.tx, t: P.ty, r: P.tx + P.w, b: P.ty + P.h, rad: 14 * P.s },
      mk: mk,
      rg: rg,
      mp: mp,
      rp: rp,
      ptrs: ptrs,
      ctag: ctag,
      sl: sl,
      q: q,
      slt: slt,
      mkav: mkav,
      sdx: sdx,
      sdy: sdy,
      qdx: qdx,
      qdy: qdy,
      vf: scene.querySelectorAll('.cbx-vf, .cbx-vfl'),
      dim: scene.querySelector('.cbx-ans__dim'),
      nbg: scene.querySelector('.cbx-ans__nbg'),
      layers: scene.querySelectorAll('.cbx-ans__cam, .cbx-ans__spot, .cbx-ans__dim, .cbx-ans__nbg')
    };
  }

  function widePose(stage, scenes) {
    var maxB = 120;
    scenes.forEach(function (scene) {
      placeNote(scene);
      var sl = scene.querySelector('.cbx-ans__sline');
      var q = scene.querySelector('.cbx-ans__ask');
      var WTOP = Math.max(56, stage.offsetHeight * 0.075);
      maxB = Math.max(maxB, WTOP + sl.offsetHeight + 12 + q.offsetHeight);
    });
    var ty0 = Math.ceil(maxB + 20);
    var sh = stage.offsetHeight;
    var sw = stage.offsetWidth;
    var s0 = Math.min(0.78, Math.max(0.42, (sh - 32 - ty0) / sh));
    return { s: s0, tx: (sw - sw * s0) / 2, ty: ty0, w: sw * s0, h: sh * s0 };
  }

  function buildTimeline(section, wide) {
    var gsap = window.gsap;
    var stage = section.querySelector('.cbx-ans__stage');
    var scenes = Array.prototype.slice.call(section.querySelectorAll('.cbx-ans__scene'));
    var P = widePose(stage, scenes);
    var layers = scenes.map(function (scene, k) {
      return prepareChapter(scene, CHAPTERS[k], k, P, stage);
    });
    var hud = section.querySelector('.cbx-ans__hud');
    var hudLab = section.querySelector('.cbx-ans__lab');
    var bars = section.querySelectorAll('.cbx-ans__prog b');
    var SW = stage.offsetWidth;
    var SH = stage.offsetHeight;
    var cream = isMultiverse();
    var INK = cream ? '#f3eee4' : '#1E1510';
    var INK2 = cream ? 'rgba(243,238,228,.82)' : '#54463c';
    var COF = cream ? '#12141c' : '#2A1E17';
    var CREAM = cream ? '#f3eee4' : '#f4efe6';
    var CREAM8 = cream ? 'rgba(243,238,228,.82)' : 'rgba(244,239,230,.8)';
    var MKD = cream ? '#1a1d29' : '#3a2a20';
    var hudWide = cream
      ? { hc: 'rgba(243,238,228,.62)', hb: 'rgba(61,232,245,.35)' }
      : { hc: 'rgba(30,21,16,.55)', hb: 'rgba(30,21,16,.35)' };
    var hudZoom = cream
      ? { hc: 'rgba(243,238,228,.72)', hb: 'rgba(61,232,245,.5)' }
      : { hc: 'rgba(244,239,230,.62)', hb: 'rgba(244,239,230,.4)' };

    var tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
    var T = START;

    function applyBox(l) {
      var b = l.box;
      l.sharp.style.clipPath = insetPath(b.l, b.t, b.r - b.l, b.b - b.t, b.rad, SW, SH);
      l.spot.style.left = b.l + 'px';
      l.spot.style.top = b.t + 'px';
      l.spot.style.width = (b.r - b.l) + 'px';
      l.spot.style.height = (b.b - b.t) + 'px';
    }

    var RD = 0.5;
    var TA = 0.4;
    var XF = 0.45;
    var YA = 0.45;

    function edges(l, to, t, dur, zin) {
      var u = function () { applyBox(l); };
      tl.to(l.box, { l: to.l, b: to.b, rad: to.rad, duration: dur, ease: 'power2.inOut', onUpdate: u }, t);
      tl.to(l.box, { r: to.r, duration: dur * RD, ease: 'power2.inOut', onUpdate: u }, zin ? t : t + dur * (1 - RD));
      tl.to(l.box, { t: to.t, duration: dur * (1 - TA), ease: 'power3.inOut', onUpdate: u }, zin ? t + dur * TA : t);
    }

    function colr(l, t, dur, wide) {
      if (isMultiverse()) {
        tl.to(l.q, { color: wide ? INK : CREAM, duration: dur, ease: 'sine.inOut' }, t);
        tl.to(l.slt, { color: wide ? INK2 : CREAM8, duration: dur, ease: 'sine.inOut' }, t);
      }
      tl.to(l.mkav, { backgroundColor: wide ? COF : MKD, duration: dur, ease: 'sine.inOut' }, t);
    }

    function toCol(l, t, dur) {
      tl.to([l.sl, l.q], { x: 0, duration: dur * XF, ease: 'sine.inOut' }, t);
      tl.to([l.sl, l.q], { y: 0, duration: dur * (1 - YA), ease: 'sine.inOut' }, t + dur * YA);
      colr(l, t + 0.83, 0.24, false);
    }

    function toWide(l, t, dur) {
      tl.to(l.sl, { x: l.sdx, duration: dur * XF, ease: 'sine.inOut' }, t + dur * (1 - XF));
      tl.to(l.q, { x: l.qdx, duration: dur * XF, ease: 'sine.inOut' }, t + dur * (1 - XF));
      tl.to(l.sl, { y: l.sdy, duration: dur * (1 - YA), ease: 'sine.inOut' }, t);
      tl.to(l.q, { y: l.qdy, duration: dur * (1 - YA), ease: 'sine.inOut' }, t);
      colr(l, t + 0.83, 0.24, true);
    }

    var k;
    for (k = 0; k < layers.length; k += 1) {
      (function (k) {
        var l = layers[k];
        var Z = l.Z;
        var S0 = T;
        tl.to(l.cams, { x: Z.tx, y: Z.ty, scale: Z.s, duration: ZOOM, ease: 'power2.inOut' }, S0);
        edges(l, { l: Z.X, t: Z.Y, r: Z.X + Z.W, b: Z.Y + Z.H, rad: 20 }, S0, ZOOM, true);
        tl.to(l.spot, { opacity: 1, duration: 1.2, ease: 'sine.inOut' }, S0 + 0.6);
        tl.to(l.dim, { opacity: 1, duration: 1.6, ease: 'sine.inOut' }, S0 + 0.2);
        tl.to(l.nbg, { opacity: 1, duration: 1.3, ease: 'sine.inOut' }, S0 + 0.35);
        toCol(l, S0, ZOOM);
        tl.to(hud, { '--hc': hudZoom.hc, '--hb': hudZoom.hb, duration: 1, ease: 'sine.inOut' }, S0 + 0.5);
        if (hudLab) tl.to(hudLab, { opacity: 0, duration: 0.8, ease: 'sine.inOut' }, S0 + 0.4);
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
        if (k < 2) {
          var each = 0.5;
          var st = (OUT - each) / 3;
          [3, 2, 1, 0].forEach(function (i, j) {
            var t = E + j * st;
            tl.to(l.ptrs[i], { opacity: 0, y: -6, duration: each, ease: 'sine.inOut' }, t);
            if (l.mk[i] && l.rg[i]) tl.to([l.mk[i], l.rg[i]], { opacity: 0, duration: each, ease: 'sine.inOut' }, t);
          });
          tl.to(l.ctag, { opacity: 0, duration: 0.5, ease: 'sine.inOut' }, E + 0.5);
          tl.to(l.vf, { opacity: 0, duration: 0.5, ease: 'sine.inOut' }, E + 0.7);
          var B = E + OUT + 0.05;
          tl.to(l.cams, { x: P.tx, y: P.ty, scale: P.s, duration: BACK, ease: 'power2.inOut' }, B);
          edges(l, { l: P.tx, t: P.ty, r: P.tx + P.w, b: P.ty + P.h, rad: 14 * P.s }, B, BACK, false);
          tl.to(l.spot, { opacity: 0, duration: 1, ease: 'sine.inOut' }, B + 0.6);
          tl.to(l.dim, { opacity: 0, duration: 1.6, ease: 'sine.inOut' }, B + 0.2);
          tl.to(l.nbg, { opacity: 0, duration: 1.2, ease: 'sine.inOut' }, B + 0.25);
          toWide(l, B, BACK);
          tl.to(hud, { '--hc': hudWide.hc, '--hb': hudWide.hb, duration: 1, ease: 'sine.inOut' }, B + 1);
          if (hudLab) tl.to(hudLab, { opacity: 1, duration: 0.8, ease: 'sine.inOut' }, B + 0.8);
          var W = B + BACK + 0.1;
          var n = layers[k + 1];
          tl.to(l.scene.querySelectorAll('.cbx-desk__main, .cbx-phone__screen'), { opacity: 0, duration: 0.4, ease: 'sine.in' }, W);
          tl.to([l.sl, l.q], { opacity: 0, y: '-=14', duration: 0.4, ease: 'sine.in' }, W - 0.2);
          tl.set(n.layers, { opacity: 0 }, W - 0.2);
          tl.set(n.scene, { opacity: 1 }, W - 0.2);
          tl.call(function () { n.scene.removeAttribute('hidden'); }, null, W - 0.2);
          tl.fromTo([n.sl, n.q], { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'sine.out', immediateRender: false }, W + 0.18);
          tl.set(l.scene, { opacity: 0 }, W + 0.4);
          tl.set(n.scene.querySelectorAll('.cbx-ans__cam'), { opacity: 1 }, W + 0.4);
          tl.set(n.spot, { opacity: 0 }, W + 0.4);
          tl.fromTo(n.scene.querySelectorAll('.cbx-desk__main, .cbx-phone__screen'), { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'sine.out' }, W + 0.4);
          tl.fromTo(n.scene.querySelectorAll('.cbx-si.is-new'), { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: 0.45, stagger: 0.1, ease: 'power2.out' }, W + 0.45);
          tl.set(n.scene.querySelectorAll('.cbx-ans__dim, .cbx-ans__nbg'), { opacity: 0 }, W + 0.4);
          tl.call(function () { l.scene.setAttribute('hidden', ''); }, null, W + 0.45);
          T = W + 1.2;
        } else {
          T = E;
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
    Array.prototype.forEach.call(section.querySelectorAll('.cbx-phone, .cbx-desk, .cbx-ans__camin'), function (n) {
      void n.offsetHeight;
    });
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

  function bindCamera(section) {
    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;
    var tl = withSectionInView(section, function () {
      return buildTimeline(section, false);
    });
    tl.to({}, { duration: CURTAIN }, 0);
    var st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: function () { return '+=' + Math.round(tl.duration() * PX_PER_SEC); },
      pin: true,
      pinSpacing: true,
      pinType: 'fixed',
      scrub: 0.5,
      animation: tl,
      invalidateOnRefresh: true,
      anticipatePin: 1,
      refreshPriority: -1,
      onUpdate: function (self) {
        if (motion.onStep) motion.onStep(self.progress > 0.02 ? 2 : 1);
      },
      onToggle: function (self) {
        if (self.isActive && motion.onStep) motion.onStep(2);
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
        scrub: 0.4,
        refreshPriority: -1,
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
    bindReduced(section);
    section.classList.add('is-narrow');
  }

  function pageFromUrl() {
    var q = /[?&]page=([^&]+)/.exec(location.search);
    if (q) return decodeURIComponent(q[1]).toLowerCase();
    var h = /^#(?:page=)?([a-z0-9-]+)$/i.exec(location.hash);
    if (h) return h[1].toLowerCase();
    return '';
  }

  function seekIfNeeded(section) {
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
    function go() {
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
        seekIfNeeded(section);
        if (window.ScrollTrigger && window.ScrollTrigger.refresh) {
          window.requestAnimationFrame(function () {
            window.ScrollTrigger.refresh();
            seekIfNeeded(section);
          });
        }
        return function () {
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
