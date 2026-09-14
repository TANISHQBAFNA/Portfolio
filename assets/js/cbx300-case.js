/**
 * CBX300 case study — Section 01 cover.
 * Cream home hero language, stacked: media frame above larger type.
 * Later chapters stay hidden stubs until the next design pass.
 * Lisa Charlie is a demo brand. Aisha is a representative example.
 */
window.Cbx300Case = (function () {
  'use strict';

  var META = {
    kicker: 'SME',
    accent: 'BANKING',
    word: 'GROWTH',
    hook: 'Banking that grows with the business.'
  };

  var STUBS = [
    { id: 'ladder', num: '02', title: 'Meet Aisha.' },
    { id: 'roles', num: '03', title: 'I designed for roles, not one user.' },
    { id: 'approvals', num: '04', title: 'My team can prepare. I need to approve.' },
    { id: 'money', num: '05', title: 'Can I afford to pay this supplier today?' },
    { id: 'permissions', num: '06', title: 'My team needs access, but not all access.' },
    { id: 'grammar', num: '07', title: 'Same goal. Different moment.' },
    { id: 'scale', num: '08', title: 'Volume finding. Results stay blank until real numbers exist.' }
  ];

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null && text !== '') node.textContent = text;
    return node;
  }

  function supportLine(project) {
    if (project && project.hook) return project.hook;
    return META.hook;
  }

  function buildCover(project) {
    var section = el('section', 'cbx-cover');
    section.setAttribute('data-cbx-section', '01');
    section.setAttribute('data-cbx-live', '');
    section.setAttribute('aria-labelledby', 'cbx-cover-heading');

    var inner = el('div', 'cbx-cover__inner');

    var media = el('figure', 'cbx-cover__media');
    media.setAttribute('aria-label', 'Image placeholder');
    var label = el('span', 'cbx-cover__media-label', 'Image');
    label.setAttribute('aria-hidden', 'true');
    media.appendChild(label);

    var type = el('div', 'hero__type cbx-cover__type');
    type.appendChild(el('p', 'hero__support', supportLine(project)));

    var heading = el('h1', 'hero__heading');
    heading.id = 'cbx-cover-heading';
    var kicker = el('span', 'hero__kicker', META.kicker);
    kicker.setAttribute('data-latin', META.kicker);
    heading.appendChild(kicker);

    var display = el('span', 'hero__display');
    var accent = el('span', 'hero__accent', META.accent);
    accent.setAttribute('data-latin', META.accent);
    var word = el('span', 'hero__word', META.word);
    word.setAttribute('data-latin', META.word);
    display.appendChild(accent);
    display.appendChild(word);
    heading.appendChild(display);
    type.appendChild(heading);

    inner.appendChild(media);
    inner.appendChild(type);
    section.appendChild(inner);
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

  function mount(world, project) {
    if (!world) return null;
    world.innerHTML = '';
    world.classList.remove('film-world');
    world.classList.add('cbx-world');
    world.appendChild(buildCover(project));
    world.appendChild(buildStubs());
    return {
      project: project || null,
      pageCount: function () { return 1; }
    };
  }

  return {
    mount: mount,
    META: META,
    STUBS: STUBS
  };
})();
