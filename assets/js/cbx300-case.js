/**
 * CBX300 case study — Section 01 cover.
 * Home hero language: kicker → accent → word. Image overlaps type from the right.
 * Cream stays calm. Multiverse uses glitch plates on chrome + cover type.
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

  var STUBS = [
    { id: 'ladder', num: '02', title: 'Meet Aisha.' },
    { id: 'roles', num: '03', title: 'I designed for roles, not one user.' },
    { id: 'approvals', num: '04', title: 'My team can prepare. I need to approve.' },
    { id: 'money', num: '05', title: 'Can I afford to pay this supplier today?' },
    { id: 'permissions', num: '06', title: 'My team needs access, but not all access.' },
    { id: 'grammar', num: '07', title: 'Same goal. Different moment.' },
    { id: 'scale', num: '08', title: 'Volume finding. Results stay blank until real numbers exist.' }
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

  function shout(tag, className, text, glitch) {
    var node = el(tag, glitch ? className + ' glitch' : className, text);
    node.setAttribute('data-latin', text);
    if (glitch) node.setAttribute('data-text', text);
    return node;
  }

  function buildCover() {
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

    var media = el('figure', 'cbx-cover__media');
    media.setAttribute('aria-label', 'Image placeholder');
    var label = el('span', 'cbx-cover__media-label', 'Image');
    label.setAttribute('aria-hidden', 'true');
    media.appendChild(label);

    inner.appendChild(type);
    inner.appendChild(media);
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

  function armGlitch(world) {
    if (!isMultiverse()) return;
    var iris = window.IrisMotion;
    if (!iris || !iris.armGlitchTarget) return;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    var nodes = [];
    if (world) {
      Array.prototype.forEach.call(world.querySelectorAll('.glitch'), function (node) {
        nodes.push(node);
      });
    }
    var studyRoot = document.querySelector('.study[data-template="cbx300"]');
    if (studyRoot) {
      Array.prototype.forEach.call(
        studyRoot.querySelectorAll('.study__word, .study__close, .study__count'),
        function (node) { nodes.push(node); }
      );
    }
    nodes.forEach(function (node) {
      var text = (node.getAttribute('data-latin') || node.textContent || '').replace(/\s+/g, ' ').trim();
      if (!text) return;
      iris.armGlitchTarget(node, text);
      if (iris.burstGlitch) iris.burstGlitch(node, reduce);
      if (node.getAttribute('data-cbx-glitch-hover')) return;
      node.setAttribute('data-cbx-glitch-hover', '1');
      node.addEventListener('mouseenter', function () {
        iris.burstGlitch(node, reduce);
      });
    });
  }

  function mount(world, project) {
    if (!world) return null;
    world.innerHTML = '';
    world.classList.remove('film-world');
    world.classList.add('cbx-world');
    world.appendChild(buildCover());
    world.appendChild(buildStubs());
    armGlitch(world);
    return {
      project: project || null,
      pageCount: function () { return 1; }
    };
  }

  return {
    mount: mount,
    armGlitch: armGlitch,
    META: META,
    STUBS: STUBS
  };
})();
