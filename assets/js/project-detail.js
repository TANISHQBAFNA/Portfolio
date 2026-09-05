/**
 * ProjectDetail — live folder opens as a centered manila flip book.
 * ---------------------------------------------------------------------------
 * One leaf. Hinged at the spine. CSS rotateY does the turn.
 * Front = current media. Back = next text. Under = next media.
 * Counter updates only when the turn settles.
 * Softboard stays dead. Non-live folders never open.
 */
window.ProjectDetail = (function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var OPEN_MS = 980;
  var COVER_AT = 0.55;
  var CLOSE_MS = 820;
  var FLIP_MS = 900;

  function create(options) {
    var panel = options.panel;
    var stage = options.stage;
    var projects = options.projects;

    var nodes = {
      card: panel.querySelector('[data-detail-card]'),
      title: panel.querySelector('[data-detail-title]'),
      shell: panel.querySelector('[data-case-shell]'),
      book: panel.querySelector('[data-book]'),
      leaf: panel.querySelector('[data-leaf]'),
      leftPage: panel.querySelector('[data-left-page]'),
      frontPage: panel.querySelector('[data-front-page]'),
      backPage: panel.querySelector('[data-back-page]'),
      underPage: panel.querySelector('[data-under-page]'),
      faceYear: panel.querySelector('[data-case-face-year]'),
      coverTitle: panel.querySelector('[data-case-cover-title]'),
      coverCat: panel.querySelector('[data-case-cover-cat]'),
      coverHook: panel.querySelector('[data-case-cover-hook]'),
      coverStamp: panel.querySelector('[data-case-cover-stamp]')
    };

    var openIndex = -1;
    var mode = 'off';
    var slideIndex = 0;
    var slides = [];
    var lastTrigger = null;
    var closeTimer = null;
    var openTimer = null;
    var flipping = false;
    var flipTimer = null;
    var pendingTo = -1;

    function pad(n) {
      return String(n).length < 2 ? '0' + n : String(n);
    }

    function isLive(project) {
      return !!(project && project.status === 'live');
    }

    function slidesFor(project) {
      if (project.slides && project.slides.length) return project.slides;
      return [{ title: 'Overview', headline: project.title, body: project.detail || project.blurb || '' }];
    }

    function writeText(node, text) {
      node.textContent = '';
      String(text == null ? '' : text).split(/\*([^*]+)\*/).forEach(function (part, i) {
        if (!part) return;
        if (i % 2) {
          var em = document.createElement('em');
          em.textContent = part;
          node.appendChild(em);
        } else {
          node.appendChild(document.createTextNode(part));
        }
      });
    }

    function makeSticky(tools) {
      var note = document.createElement('aside');
      note.className = 'case-page__sticky';
      note.setAttribute('aria-label', 'Tools');
      var label = document.createElement('span');
      label.className = 'case-page__sticky-label';
      label.textContent = 'Tools';
      note.appendChild(label);
      var list = document.createElement('ul');
      list.className = 'case-page__sticky-list';
      tools.forEach(function (tool) {
        var li = document.createElement('li');
        li.textContent = tool;
        list.appendChild(li);
      });
      note.appendChild(list);
      return note;
    }

    function makeImage(entry) {
      var item = typeof entry === 'string' ? { src: entry } : (entry || {});
      var figure = document.createElement('figure');
      figure.className = 'case-page__photo';
      if (item.frame === 'device') figure.classList.add('is-device');
      if (!item.src) {
        figure.classList.add('is-empty');
        return figure;
      }
      var img = document.createElement('img');
      img.src = item.src;
      img.alt = item.alt || '';
      img.loading = 'lazy';
      img.decoding = 'async';
      figure.appendChild(img);
      if (item.caption) {
        var cap = document.createElement('figcaption');
        cap.textContent = item.caption;
        figure.appendChild(cap);
      }
      return figure;
    }

    function beatOf(slide) {
      return (slide && slide.type) || 'read';
    }

    function makeDocket(project) {
      var dl = document.createElement('dl');
      dl.className = 'case-page__docket';
      [
        ['Role', project.role],
        ['Scope', project.scope],
        ['When', project.year]
      ].forEach(function (row) {
        if (!row[1]) return;
        var wrap = document.createElement('div');
        var dt = document.createElement('dt');
        dt.textContent = row[0];
        var dd = document.createElement('dd');
        dd.textContent = row[1];
        wrap.appendChild(dt);
        wrap.appendChild(dd);
        dl.appendChild(wrap);
      });
      return dl;
    }

    function makeMarks(marks, variant) {
      var list = document.createElement('ol');
      list.className = 'case-page__marks' + (variant ? ' case-page__marks--' + variant : '');
      marks.forEach(function (item) {
        var li = document.createElement('li');
        if (typeof item === 'string') {
          li.textContent = item;
        } else {
          li.textContent = item.label || '';
          if (item.strike) li.classList.add('is-struck');
          if (item.keep) li.classList.add('is-keep');
        }
        list.appendChild(li);
      });
      return list;
    }

    function makeLedger(slide) {
      var board = document.createElement('div');
      board.className = 'case-page__ledger';
      [
        ['Owned', slide.owned, 'yes'],
        ['Not mine', slide.not, 'no']
      ].forEach(function (col) {
        if (!(col[1] && col[1].length)) return;
        var section = document.createElement('section');
        section.className = 'case-page__ledger-col case-page__ledger-col--' + col[2];
        var heading = document.createElement('h4');
        heading.textContent = col[0];
        var list = document.createElement('ul');
        col[1].forEach(function (line) {
          var li = document.createElement('li');
          li.textContent = line;
          list.appendChild(li);
        });
        section.appendChild(heading);
        section.appendChild(list);
        board.appendChild(section);
      });
      return board;
    }

    function appendText(parent, slide, index, project) {
      var beat = beatOf(slide);
      parent.dataset.beat = beat;

      if (slide.title && beat !== 'open') {
        var chapter = document.createElement('p');
        chapter.className = 'case-page__beat';
        chapter.textContent = slide.title;
        parent.appendChild(chapter);
      }

      var headline = document.createElement('h3');
      headline.className = 'case-page__headline';
      writeText(headline, slide.headline || slide.title || project.title);
      parent.appendChild(headline);

      if (beat === 'scope') {
        parent.appendChild(makeDocket(project));
      }

      if (beat === 'problem') {
        if (slide.body) {
          var problemBody = document.createElement('p');
          problemBody.className = 'case-page__body';
          writeText(problemBody, slide.body);
          parent.appendChild(problemBody);
        }
      } else if (slide.marks && slide.marks.length) {
        parent.appendChild(makeMarks(slide.marks));
      } else if (slide.body) {
        var body = document.createElement('p');
        body.className = 'case-page__body';
        writeText(body, slide.body);
        parent.appendChild(body);
      }

      var folio = document.createElement('p');
      folio.className = 'case-page__folio';
      folio.textContent = pad(index + 1);
      parent.appendChild(folio);

      if (index === 0 && (project.tools || []).length) {
        parent.appendChild(makeSticky(project.tools));
      }
    }

    function makeMediaFace(slide) {
      var front = document.createElement('div');
      var beat = beatOf(slide);
      front.className = 'case-page case-page--media';
      front.dataset.beat = beat;
      var images = (slide && slide.images) || [];

      if (slide && slide.aside) {
        var aside = document.createElement('p');
        aside.className = 'case-page__aside';
        writeText(aside, slide.aside);
        front.appendChild(aside);
      }

      if (beat === 'scope' && slide && (slide.owned || slide.not)) {
        front.appendChild(makeLedger(slide));
        return front;
      }

      if (beat === 'problem' && slide && slide.marks && slide.marks.length) {
        front.appendChild(makeMarks(slide.marks, 'board'));
        if (images[0]) {
          var evidence = makeImage(images[0]);
          evidence.classList.add('is-print', 'is-evidence');
          evidence.style.setProperty('--tilt', '3.2deg');
          front.appendChild(evidence);
        }
        return front;
      }

      if (!images.length) {
        if (!(slide && slide.aside)) front.classList.add('is-empty');
        else front.classList.add('is-aside');
        return front;
      }

      var gallery = document.createElement('div');
      gallery.className = 'case-page__gallery';
      gallery.classList.toggle('is-single', images.length === 1);
      images.forEach(function (img, i) {
        var figure = makeImage(img);
        figure.classList.add('is-print');
        if (img.stamp) {
          figure.dataset.stamp = img.stamp;
          figure.classList.add('has-stamp');
        }
        if (beat === 'proof' && i === 0) figure.classList.add('is-hero');
        figure.style.setProperty('--tilt', (i % 2 ? 2.4 : -3.1) + 'deg');
        gallery.appendChild(figure);
      });
      front.appendChild(gallery);
      return front;
    }

    function currentProject() {
      return projects[openIndex] || {};
    }

    function clearSlot(el) {
      if (!el) return;
      el.textContent = '';
    }

    function fillText(el, slide, index) {
      if (!el) return;
      el.textContent = '';
      if (!slide) return;
      var page = el.classList.contains('case-page') ? el : document.createElement('div');
      if (page !== el) {
        page.className = 'case-page case-page--text';
        el.appendChild(page);
      } else {
        page.className = 'case-page case-page--text';
      }
      appendText(page, slide, index, currentProject());
    }

    function fillMedia(el, slide) {
      if (!el) return;
      el.textContent = '';
      el.appendChild(makeMediaFace(slide || {}));
    }

    function restLeaf() {
      if (!nodes.leaf || !nodes.book) return;
      nodes.leaf.style.transform = '';
      nodes.leaf.style.transition = '';
      nodes.book.classList.remove('is-flipped', 'is-turning', 'is-hold');
    }

    function paintSpread(now, peek) {
      var here = slides[now];
      var next = peek != null && peek !== now ? slides[peek] : null;
      fillText(nodes.leftPage, here, now);
      fillMedia(nodes.frontPage, here);
      if (next) {
        fillText(nodes.backPage, next, peek);
        fillMedia(nodes.underPage, next);
      } else {
        fillText(nodes.backPage, null, now);
        fillMedia(nodes.underPage, null);
      }
      if (nodes.book) nodes.book.dataset.beat = here ? beatOf(here) : 'read';
    }

    function paintSlideState(index) {
      slideIndex = index;
      restLeaf();
      paintSpread(index, index + 1);
      if (options.onSlideChange) options.onSlideChange(index, slides.length, slides);
    }

    function settleFlip(to) {
      clearTimeout(flipTimer);
      flipTimer = null;
      flipping = false;
      pendingTo = -1;
      if (mode !== 'case' || !nodes.book || !nodes.leaf) return;
      nodes.book.classList.add('is-instant');
      nodes.leaf.style.transform = '';
      nodes.leaf.style.transition = '';
      nodes.book.classList.remove('is-flipped', 'is-turning', 'is-hold');
      paintSpread(to, to + 1);
      void nodes.leaf.offsetWidth;
      nodes.book.classList.remove('is-instant');
      slideIndex = to;
      if (options.onSlideChange) options.onSlideChange(to, slides.length, slides);
    }

    function armFlipSettle(to) {
      clearTimeout(flipTimer);
      flipTimer = setTimeout(function () {
        flipTimer = null;
        if (mode === 'case' && flipping) settleFlip(to);
      }, FLIP_MS + 80);
    }

    function flipToSlide(from, to) {
      if (!nodes.book || !nodes.leaf) {
        paintSlideState(to);
        return;
      }

      flipping = true;
      pendingTo = to;
      var forward = to > from;

      if (forward) {
        paintSpread(from, to);
        restLeaf();
        if (nodes.book) {
          nodes.book.classList.add('is-turning');
          nodes.book.style.setProperty('--flip-ms', FLIP_MS + 'ms');
        }
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            if (!flipping || mode !== 'case') return;
            nodes.book.classList.add('is-flipped');
          });
        });
      } else {
        paintSpread(to, from);
        nodes.book.classList.add('is-instant', 'is-flipped');
        nodes.leaf.style.transform = '';
        void nodes.leaf.offsetWidth;
        nodes.book.classList.remove('is-instant');
        nodes.book.classList.add('is-turning');
        nodes.book.style.setProperty('--flip-ms', FLIP_MS + 'ms');
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            if (!flipping || mode !== 'case') return;
            nodes.book.classList.remove('is-flipped');
          });
        });
      }

      armFlipSettle(to);
    }

    function onLeafEnd(event) {
      if (event.target !== nodes.leaf) return;
      if (event.propertyName && event.propertyName !== 'transform') return;
      if (!flipping || pendingTo < 0) return;
      if (nodes.book && !nodes.book.classList.contains('is-turning')) return;
      settleFlip(pendingTo);
    }

    function goToSlide(index, animate) {
      if (mode !== 'case') return;
      if (flipping) return;
      var bounded = Math.max(0, Math.min(slides.length - 1, index));
      var from = slideIndex;
      if (bounded === from) {
        paintSlideState(bounded);
        return;
      }
      var shouldAnimate = animate !== false && !reduceMotion.matches;
      if (shouldAnimate && Math.abs(bounded - from) === 1) {
        flipToSlide(from, bounded);
        return;
      }
      paintSlideState(bounded);
    }

    function stepSlide(direction) {
      goToSlide(slideIndex + direction, true);
    }

    function holdMidFlip() {
      if (mode !== 'case' || slides.length < 2 || !nodes.leaf) return;
      flipping = false;
      pendingTo = -1;
      paintSpread(0, 1);
      if (nodes.book) {
        nodes.book.classList.remove('is-flipped');
        nodes.book.classList.add('is-hold', 'is-turning');
      }
      nodes.leaf.style.transition = 'none';
      nodes.leaf.style.transform = 'rotateY(-70deg)';
      flipping = true;
    }

    function paintFace(project) {
      if (nodes.coverTitle) nodes.coverTitle.textContent = project.title || '';
      if (nodes.faceYear) nodes.faceYear.textContent = project.year || '';
      if (nodes.coverCat) nodes.coverCat.textContent = project.category || '';
      if (nodes.coverHook) {
        nodes.coverHook.textContent = project.hook || '';
        nodes.coverHook.hidden = !project.hook;
      }
      if (nodes.coverStamp) {
        nodes.coverStamp.textContent = project.stamp || 'Case file';
      }
      if (nodes.shell) {
        if (project.tone) nodes.shell.dataset.tone = project.tone;
        else delete nodes.shell.dataset.tone;
      }
    }

    function rectOf(el) {
      if (!el || typeof el.getBoundingClientRect !== 'function') return null;
      var r = el.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) return null;
      return r;
    }

    function clearFlyStyles(el) {
      if (!el) return;
      el.style.position = '';
      el.style.left = '';
      el.style.top = '';
      el.style.width = '';
      el.style.height = '';
      el.style.margin = '';
      el.style.transform = '';
      el.style.transformOrigin = '';
      el.style.transition = '';
      el.style.zIndex = '';
      el.style.visibility = '';
      el.style.opacity = '';
    }

    function centerDelta(src, dest) {
      var sx = src.left + src.width / 2;
      var sy = src.top + src.height / 2;
      var dx = dest.left + dest.width / 2;
      var dy = dest.top + dest.height / 2;
      return {
        x: sx - dx,
        y: sy - dy,
        scaleX: src.width / Math.max(dest.width, 1),
        scaleY: src.height / Math.max(dest.height, 1)
      };
    }

    function flyFromRail(trigger) {
      var shell = nodes.shell;
      if (!shell) return;
      var folder = trigger && trigger.closest
        ? (trigger.matches && trigger.matches('[data-folder]') ? trigger : trigger.closest('[data-folder]'))
        : null;
      var src = rectOf(folder) || rectOf(trigger);
      if (!src || reduceMotion.matches) {
        panel.classList.add('is-open', 'is-flipped');
        return;
      }

      panel.classList.add('is-flying', 'is-open');
      panel.classList.remove('is-flipped');
      shell.style.transition = 'none';
      void shell.offsetWidth;
      var dest = rectOf(shell);
      if (!dest) {
        panel.classList.add('is-open', 'is-flipped');
        panel.classList.remove('is-flying');
        return;
      }

      var map = centerDelta(src, dest);
      shell.style.transformOrigin = '50% 50%';
      shell.style.zIndex = '90';
      shell.style.transform =
        'translate(' + map.x.toFixed(1) + 'px,' + map.y.toFixed(1) + 'px) scale(' +
        map.scaleX.toFixed(4) + ',' + map.scaleY.toFixed(4) + ')';
      void shell.offsetWidth;

      requestAnimationFrame(function () {
        shell.style.transition =
          'transform ' + (OPEN_MS / 1000) + 's cubic-bezier(.22,.72,.16,1)';
        shell.style.transform = 'translate(0px, 0px) scale(1, 1)';
      });

      clearTimeout(openTimer);
      openTimer = setTimeout(function () {
        panel.classList.add('is-flipped');
      }, Math.round(OPEN_MS * COVER_AT));

      setTimeout(function () {
        clearFlyStyles(shell);
        panel.classList.remove('is-flying');
        if (!panel.classList.contains('is-flipped')) panel.classList.add('is-flipped');
      }, OPEN_MS + 80);
    }

    function flyToRail(trigger) {
      var shell = nodes.shell;
      var folder = trigger && trigger.closest
        ? (trigger.matches && trigger.matches('[data-folder]') ? trigger : trigger.closest('[data-folder]'))
        : null;
      if (!folder) folder = trigger;

      stage.classList.add('is-returning');
      panel.classList.remove('is-flipped');
      panel.classList.add('hide-folder');

      if (!shell || !folder || reduceMotion.matches) return;

      var src = rectOf(shell);
      shell.style.visibility = 'hidden';
      shell.style.opacity = '0';

      folder.style.visibility = 'visible';
      folder.style.transition = 'none';
      folder.style.transform = 'none';

      requestAnimationFrame(function () {
        var dest = rectOf(folder);
        if (!src || !dest) return;
        var map = centerDelta(src, dest);
        folder.style.transformOrigin = '50% 50%';
        folder.style.zIndex = '95';
        folder.style.transform =
          'translate(' + map.x.toFixed(1) + 'px,' + map.y.toFixed(1) + 'px) scale(' +
          map.scaleX.toFixed(4) + ',' + map.scaleY.toFixed(4) + ')';
        void folder.offsetWidth;
        requestAnimationFrame(function () {
          folder.style.transition =
            'transform ' + (CLOSE_MS / 1000) + 's cubic-bezier(.22,.8,.18,1)';
          folder.style.transform = 'translate(0px, 0px) scale(1, 1)';
        });
      });

      setTimeout(function () {
        folder.style.transition = '';
        folder.style.transform = '';
        folder.style.transformOrigin = '';
        folder.style.zIndex = '';
        folder.style.visibility = '';
        clearFlyStyles(shell);
      }, CLOSE_MS + 40);
    }

    function finishHome(fromCase) {
      clearTimeout(closeTimer);
      clearTimeout(openTimer);
      clearTimeout(flipTimer);
      flipTimer = null;
      flipping = false;
      pendingTo = -1;
      mode = 'off';
      openIndex = -1;
      slides = [];
      slideIndex = 0;
      panel.classList.remove('is-home', 'is-flying', 'hide-folder', 'is-open', 'is-flipped');
      panel.removeAttribute('data-case');
      stage.classList.add('is-home');
      stage.classList.remove('is-detail', 'is-returning', 'rail-away', 'hero-away');
      if (nodes.card) nodes.card.hidden = true;
      clearFlyStyles(nodes.shell);
      restLeaf();
      [nodes.leftPage, nodes.frontPage, nodes.backPage, nodes.underPage].forEach(clearSlot);
      if (nodes.title) nodes.title.textContent = '';
      panel.hidden = true;
      var slots = options.slots || [];
      slots.forEach(function (slot) { slot.classList.remove('is-current'); });
      if (fromCase && options.onClose) options.onClose();
    }

    function close() {
      if (mode !== 'case') return;
      clearTimeout(closeTimer);
      if (!reduceMotion.matches) {
        flyToRail(lastTrigger);
        panel.classList.remove('is-open');
        closeTimer = setTimeout(function () { finishHome(true); }, CLOSE_MS + 40);
        return;
      }
      panel.classList.remove('is-open', 'is-flipped');
      finishHome(true);
    }

    function caseKey(project) {
      var title = (project && project.title) || '';
      if (/daughters/i.test(title)) return 'daughters';
      return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }

    function open(index, trigger) {
      var project = projects[index];
      if (!isLive(project)) return;

      clearTimeout(closeTimer);
      clearTimeout(openTimer);
      clearTimeout(flipTimer);
      flipping = false;
      pendingTo = -1;
      panel.classList.remove('is-flying', 'is-home', 'hide-folder');
      stage.classList.remove('is-home', 'is-returning');

      var slots = options.slots || [];
      var reopening = openIndex === index && mode === 'case';
      slots.forEach(function (slot) { slot.classList.remove('is-current'); });

      mode = 'case';
      openIndex = index;
      slides = slidesFor(project);
      slideIndex = 0;
      lastTrigger = trigger || lastTrigger;

      if (nodes.title) nodes.title.textContent = project.title;
      panel.setAttribute('data-case', caseKey(project));

      paintFace(project);

      if (slots[index]) slots[index].classList.add('is-current');
      panel.hidden = false;
      stage.classList.add('is-detail');
      void panel.offsetHeight;

      paintSlideState(0);

      if (reduceMotion.matches) {
        panel.classList.add('is-open', 'is-flipped');
      } else if (!reopening) {
        flyFromRail(trigger);
      } else {
        panel.classList.add('is-open', 'is-flipped');
      }

      if (!reopening && nodes.title) nodes.title.focus({ preventScroll: true });
      if (options.onOpen) options.onOpen(index, slides.length, slides);

      if (/[?&]hold=flip/i.test(location.search)) {
        var wait = reduceMotion.matches ? 80 : OPEN_MS + 420;
        setTimeout(function () {
          if (mode === 'case') holdMidFlip();
        }, wait);
      }
    }

    function showHome(fromCase) {
      if (mode === 'case') {
        if (fromCase === false) {
          finishHome(false);
          return;
        }
        close();
        return;
      }
      finishHome(!!fromCase);
    }

    if (nodes.leaf) {
      nodes.leaf.addEventListener('transitionend', onLeafEnd);
      nodes.leaf.addEventListener('click', function () {
        if (mode !== 'case' || flipping) return;
        stepSlide(1);
      });
    }

    document.addEventListener('keydown', function (event) {
      if (mode !== 'case') return;
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
      } else if (event.key === 'ArrowRight' || event.key === 'PageDown') {
        event.preventDefault();
        stepSlide(1);
      } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        event.preventDefault();
        stepSlide(-1);
      }
    });

    return {
      open: open,
      close: close,
      showHome: showHome,
      stepSlide: stepSlide,
      goToSlide: goToSlide,
      holdMidFlip: holdMidFlip,
      isOpen: function () { return mode === 'case'; },
      isHome: function () { return mode === 'off'; },
      openIndex: function () { return openIndex; },
      slideIndex: function () { return slideIndex; },
      slideCount: function () { return slides.length; },
      atFirstSlide: function () { return slideIndex <= 0; },
      atLastSlide: function () { return slideIndex >= slides.length - 1; }
    };
  }

  return { create: create };
})();
