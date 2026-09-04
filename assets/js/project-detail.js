/**
 * ProjectDetail — live folder opens as a centered manila flip book.
 * ---------------------------------------------------------------------------
 * Softboard is gone. Click a live rail folder → it flies to center, expands,
 * and unfolds into a two-page spread. Each slide is a dual-face sheet bound
 * at the spine. Next / Prev (and edge drag) turns the top sheet. Mid-turn
 * shows the page edge, the verso, and the stack underneath. Escape / Home
 * closes: one folder returns to the rail. Non-live folders never open.
 */
window.ProjectDetail = (function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var OPEN_MS = 720;
  var CLOSE_MS = 760;
  var FLIP_MS = 980;
  var UNFOLD_MS = 560;

  function create(options) {
    var panel = options.panel;
    var stage = options.stage;
    var projects = options.projects;

    var nodes = {
      card: panel.querySelector('[data-detail-card]'),
      title: panel.querySelector('[data-detail-title]'),
      shell: panel.querySelector('[data-case-shell]'),
      pages: panel.querySelector('[data-case-pages]'),
      cover: panel.querySelector('[data-case-cover]'),
      book: panel.querySelector('[data-case-book]'),
      faceTitle: panel.querySelector('[data-case-face-title]'),
      faceYear: panel.querySelector('[data-case-face-year]'),
      faceCat: panel.querySelector('[data-case-face-cat]'),
      coverTitle: panel.querySelector('[data-case-cover-title]'),
      coverCat: panel.querySelector('[data-case-cover-cat]')
    };

    var openIndex = -1;
    var mode = 'off';
    var slideIndex = 0;
    var slides = [];
    var lastTrigger = null;
    var closeTimer = null;
    var openTimer = null;
    var flipping = false;
    var flipAnim = null;
    var drag = {
      tracking: false,
      pointerId: null,
      startX: 0,
      armed: null,
      leaf: null,
      sheet: null,
      other: null
    };

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

    function leafOf(page) {
      return page ? page.querySelector('.sheet__leaf') : null;
    }

    function clearInlineTurn(leaf) {
      if (!leaf) return;
      leaf.style.transform = '';
      leaf.style.transition = '';
    }

    function cancelFlipAnim() {
      if (flipAnim) {
        try { flipAnim.cancel(); } catch (err) {}
        flipAnim = null;
      }
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

    function makePage(slide, index, project) {
      var sheet = document.createElement('article');
      sheet.className = 'sheet';
      sheet.setAttribute('data-page', '');
      sheet.setAttribute('data-index', String(index));

      var leaf = document.createElement('div');
      leaf.className = 'sheet__leaf';

      var front = document.createElement('div');
      front.className = 'sheet__face sheet__face--front case-page';

      var kicker = document.createElement('p');
      kicker.className = 'case-page__kicker';
      kicker.textContent = slide.title || ('Page ' + pad(index + 1));
      front.appendChild(kicker);

      var headline = document.createElement('h3');
      headline.className = 'case-page__headline';
      headline.setAttribute('data-page-title', '');
      writeText(headline, slide.headline || slide.title || project.title);
      front.appendChild(headline);

      if (slide.body) {
        var body = document.createElement('p');
        body.className = 'case-page__body';
        writeText(body, slide.body);
        front.appendChild(body);
      }

      if (index === 0 && (project.tools || []).length) {
        front.appendChild(makeSticky(project.tools));
      }

      var images = slide.images || [];
      if (images.length) {
        var gallery = document.createElement('div');
        gallery.className = 'case-page__gallery';
        gallery.classList.toggle('is-single', images.length === 1);
        images.forEach(function (img) {
          gallery.appendChild(makeImage(img));
        });
        front.appendChild(gallery);
      }

      var back = document.createElement('div');
      back.className = 'sheet__face sheet__face--back';
      back.setAttribute('aria-hidden', 'true');
      var verso = document.createElement('div');
      verso.className = 'sheet__verso';
      var folio = document.createElement('span');
      folio.className = 'sheet__folio';
      folio.textContent = pad(index + 1);
      verso.appendChild(folio);
      back.appendChild(verso);

      leaf.appendChild(front);
      leaf.appendChild(back);
      sheet.appendChild(leaf);
      return sheet;
    }

    function paintFace(project) {
      if (nodes.faceTitle) nodes.faceTitle.textContent = project.title || '';
      if (nodes.coverTitle) nodes.coverTitle.textContent = project.title || '';
      if (nodes.faceYear) nodes.faceYear.textContent = project.year || '';
      if (nodes.faceCat) nodes.faceCat.textContent = project.category || '';
      if (nodes.coverCat) nodes.coverCat.textContent = project.category || '';
      if (nodes.shell) {
        if (project.tone) nodes.shell.dataset.tone = project.tone;
        else delete nodes.shell.dataset.tone;
      }
    }

    function paintPages(project) {
      if (!nodes.pages) return;
      nodes.pages.innerHTML = '';
      slides.forEach(function (slide, index) {
        nodes.pages.appendChild(makePage(slide, index, project));
      });
    }

    function pageNodes() {
      if (!nodes.pages) return [];
      return Array.prototype.slice.call(nodes.pages.querySelectorAll('[data-page]'));
    }

    function clearSheetClasses(page) {
      page.classList.remove(
        'is-active', 'is-below', 'is-turned',
        'is-flipping', 'is-receiving', 'is-hold'
      );
    }

    function paintSlideState(index) {
      slideIndex = index;
      var pages = pageNodes();
      var remaining = pages.length - 1 - index;
      pages.forEach(function (page, i) {
        page.hidden = false;
        clearSheetClasses(page);
        clearInlineTurn(leafOf(page));
        if (i < index) {
          page.classList.add('is-turned');
        } else if (i === index) {
          page.classList.add('is-active');
        } else {
          page.classList.add('is-below');
          page.style.setProperty('--depth', String(i - index));
        }
        page.style.zIndex = i < index ? String(4 + i) : String(8 + remaining - (i - index));
      });
      if (options.onSlideChange) options.onSlideChange(index, slides.length);
    }

    function settleFlip(index) {
      flipping = false;
      flipAnim = null;
      if (mode !== 'case') return;
      paintSlideState(index);
    }

    function turnKeyframes(fromDeg, toDeg) {
      var delta = toDeg - fromDeg;
      function at(p, z) {
        return 'rotateY(' + (fromDeg + delta * p) + 'deg) translateZ(' + z + 'px)';
      }
      return [
        { transform: at(0, 0) },
        { transform: at(0.32, 36), offset: 0.28 },
        { transform: at(0.5, 48), offset: 0.48 },
        { transform: at(0.68, 36), offset: 0.70 },
        { transform: at(1, 0) }
      ];
    }

    function flipToSlide(from, to) {
      var pages = pageNodes();
      var current = pages[from];
      var target = pages[to];
      if (!current || !target) {
        paintSlideState(to);
        return;
      }

      flipping = true;
      cancelFlipAnim();
      slideIndex = to;
      if (options.onSlideChange) options.onSlideChange(to, slides.length);

      var forward = to > from;
      var moving = forward ? current : target;
      var revealing = forward ? target : current;
      var leaf = leafOf(moving);
      if (!leaf) {
        paintSlideState(to);
        return;
      }

      pages.forEach(function (page, i) {
        page.hidden = false;
        clearSheetClasses(page);
        clearInlineTurn(leafOf(page));
        if (forward) {
          if (i < from) page.classList.add('is-turned');
          else if (i === from) page.classList.add('is-active');
          else page.classList.add('is-below');
        } else {
          if (i < to) page.classList.add('is-turned');
          else if (i === to) page.classList.add('is-turned');
          else if (i === from) page.classList.add('is-active');
          else page.classList.add('is-below');
        }
      });

      revealing.classList.add('is-receiving');
      moving.classList.add('is-flipping');
      moving.style.zIndex = '30';

      var fromDeg = forward ? 0 : -180;
      var toDeg = forward ? -180 : 0;
      leaf.style.transform = 'rotateY(' + fromDeg + 'deg)';
      void leaf.offsetWidth;

      flipAnim = leaf.animate(turnKeyframes(fromDeg, toDeg), {
        duration: FLIP_MS,
        easing: 'cubic-bezier(0.45, 0.05, 0.22, 1)',
        fill: 'forwards'
      });

      flipAnim.onfinish = function () {
        clearInlineTurn(leaf);
        settleFlip(to);
      };
      flipAnim.oncancel = function () {
        if (mode === 'case' && flipping) settleFlip(to);
      };
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
      if (mode !== 'case' || slides.length < 2) return;
      cancelFlipAnim();
      paintSlideState(0);
      var pages = pageNodes();
      var current = pages[0];
      var next = pages[1];
      if (!current || !next) return;
      next.classList.add('is-receiving');
      current.classList.add('is-flipping', 'is-hold');
      current.style.zIndex = '30';
      var leaf = leafOf(current);
      if (!leaf) return;
      leaf.style.transition = 'none';
      leaf.style.transform = 'rotateY(-68deg) translateZ(48px)';
      flipping = true;
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

    function flyFromRail(trigger) {
      var shell = nodes.shell;
      if (!shell) return;
      var folder = trigger && trigger.classList && trigger.classList.contains('folder')
        ? trigger
        : (trigger && trigger.closest ? trigger.closest('.folder') : null);
      var src = rectOf(folder) || rectOf(trigger);
      var dest = rectOf(shell);
      if (!src || !dest || reduceMotion.matches) {
        panel.classList.add('is-open', 'is-flipped');
        return;
      }

      panel.classList.add('is-flying');
      panel.classList.remove('is-flipped');

      var sx = src.left;
      var sy = src.top;
      var sw = src.width;
      var sh = src.height;
      var dx = dest.left;
      var dy = dest.top;
      var dw = dest.width;
      var dh = dest.height;

      shell.style.transition = 'none';
      shell.style.transformOrigin = 'top left';
      shell.style.zIndex = '90';
      var scaleX = sw / Math.max(dw, 1);
      var scaleY = sh / Math.max(dh, 1);
      shell.style.transform =
        'translate(' + (sx - dx).toFixed(1) + 'px,' + (sy - dy).toFixed(1) + 'px) scale(' +
        scaleX.toFixed(4) + ',' + scaleY.toFixed(4) + ')';
      void shell.offsetWidth;

      requestAnimationFrame(function () {
        shell.style.transition =
          'transform ' + (OPEN_MS / 1000) + 's cubic-bezier(.22,.8,.18,1)';
        shell.style.transform = 'none';
        panel.classList.add('is-open');
      });

      clearTimeout(openTimer);
      openTimer = setTimeout(function () {
        clearFlyStyles(shell);
        panel.classList.remove('is-flying');
        panel.classList.add('is-flipped');
      }, OPEN_MS + 40);
    }

    function flyToRail(trigger) {
      var shell = nodes.shell;
      var folder = trigger && trigger.classList && trigger.classList.contains('folder')
        ? trigger
        : (trigger && trigger.closest ? trigger.closest('.folder') : null);
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
        var dx = src.left - dest.left;
        var dy = src.top - dest.top;
        var scaleX = src.width / Math.max(dest.width, 1);
        var scaleY = src.height / Math.max(dest.height, 1);
        folder.style.transformOrigin = 'top left';
        folder.style.zIndex = '95';
        folder.style.transform =
          'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px) scale(' +
          scaleX.toFixed(4) + ',' + scaleY.toFixed(4) + ')';
        void folder.offsetWidth;
        requestAnimationFrame(function () {
          folder.style.transition =
            'transform ' + (CLOSE_MS / 1000) + 's cubic-bezier(.22,.8,.18,1)';
          folder.style.transform = 'none';
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
      cancelFlipAnim();
      flipping = false;
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
      if (nodes.pages) nodes.pages.innerHTML = '';
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
      cancelFlipAnim();
      flipping = false;
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
      paintPages(project);

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
      if (options.onOpen) options.onOpen(index, slides.length);

      if (/[?&]hold=flip/i.test(location.search)) {
        var wait = reduceMotion.matches ? 80 : OPEN_MS + UNFOLD_MS + 80;
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

    function clamp(n, min, max) {
      return n < min ? min : n > max ? max : n;
    }

    function endDrag(commit) {
      if (!drag.tracking) return;
      var sheet = drag.sheet;
      var leaf = drag.leaf;
      var armed = drag.armed;
      drag.tracking = false;
      drag.leaf = null;
      drag.sheet = null;
      drag.other = null;
      drag.armed = null;
      if (!sheet || !leaf || !armed) {
        flipping = false;
        return;
      }
      try {
        if (sheet.releasePointerCapture && drag.pointerId != null) {
          sheet.releasePointerCapture(drag.pointerId);
        }
      } catch (err) {}

      var current = parseFloat((leaf.style.transform.match(/rotateY\((-?[\d.]+)deg\)/) || [])[1]);
      if (isNaN(current)) current = armed === 'forward' ? 0 : -180;

      if (commit) {
        var to = armed === 'forward' ? slideIndex + 1 : slideIndex - 1;
        var toDeg = armed === 'forward' ? -180 : 0;
        flipAnim = leaf.animate(turnKeyframes(current, toDeg), {
          duration: Math.max(280, FLIP_MS * (Math.abs(toDeg - current) / 180)),
          easing: 'cubic-bezier(0.45, 0.05, 0.22, 1)',
          fill: 'forwards'
        });
        flipAnim.onfinish = function () {
          clearInlineTurn(leaf);
          settleFlip(to);
        };
      } else {
        var backDeg = armed === 'forward' ? 0 : -180;
        flipAnim = leaf.animate(turnKeyframes(current, backDeg), {
          duration: 320,
          easing: 'cubic-bezier(0.22, 0.8, 0.18, 1)',
          fill: 'forwards'
        });
        flipAnim.onfinish = function () {
          clearInlineTurn(leaf);
          flipping = false;
          paintSlideState(slideIndex);
        };
      }
    }

    function onPointerDown(event) {
      if (mode !== 'case' || flipping || reduceMotion.matches) return;
      if (event.button) return;
      var sheet = event.target.closest('.sheet.is-active');
      if (!sheet || !nodes.pages) return;
      var rect = sheet.getBoundingClientRect();
      var rel = (event.clientX - rect.left) / Math.max(rect.width, 1);
      drag.tracking = true;
      drag.pointerId = event.pointerId;
      drag.startX = event.clientX;
      drag.armed = rel > 0.55 ? 'forward' : (rel < 0.2 && slideIndex > 0 ? 'back' : 'maybe');
      drag.sheet = sheet;
      try { sheet.setPointerCapture(event.pointerId); } catch (err) {}
    }

    function onPointerMove(event) {
      if (!drag.tracking) return;
      var dx = event.clientX - drag.startX;
      if (drag.armed === 'maybe') {
        if (Math.abs(dx) < 16) return;
        drag.armed = dx < 0 ? 'forward' : 'back';
      }
      if (drag.armed === 'forward' && slideIndex >= slides.length - 1) return;
      if (drag.armed === 'back' && slideIndex <= 0) return;

      var pages = pageNodes();
      if (!drag.leaf) {
        flipping = true;
        var moving = drag.armed === 'forward' ? pages[slideIndex] : pages[slideIndex - 1];
        var revealing = drag.armed === 'forward' ? pages[slideIndex + 1] : pages[slideIndex];
        if (!moving) return;
        drag.sheet = moving;
        drag.leaf = leafOf(moving);
        drag.other = revealing;
        moving.classList.add('is-flipping');
        moving.style.zIndex = '30';
        if (revealing) revealing.classList.add('is-receiving', 'is-below');
        if (drag.leaf) drag.leaf.style.transition = 'none';
      }
      if (!drag.leaf) return;
      var width = nodes.pages.getBoundingClientRect().width || 400;
      var progress = drag.armed === 'forward'
        ? clamp(-dx / width, 0, 1)
        : clamp(dx / width, 0, 1);
      var deg = drag.armed === 'forward' ? progress * -180 : -180 + progress * 180;
      var z = Math.sin(Math.abs(deg) * Math.PI / 180) * 42;
      drag.leaf.style.transform = 'rotateY(' + deg.toFixed(2) + 'deg) translateZ(' + z.toFixed(1) + 'px)';
    }

    function onPointerUp(event) {
      if (!drag.tracking) return;
      var dx = event.clientX - drag.startX;
      var width = (nodes.pages && nodes.pages.getBoundingClientRect().width) || 400;
      var progress = drag.armed === 'forward'
        ? clamp(-dx / width, 0, 1)
        : clamp(dx / width, 0, 1);
      var commit = progress > 0.28 || Math.abs(dx) > 72;
      if (drag.armed === 'maybe' || !drag.leaf) {
        drag.tracking = false;
        flipping = false;
        return;
      }
      if (drag.armed === 'forward' && slideIndex >= slides.length - 1) commit = false;
      if (drag.armed === 'back' && slideIndex <= 0) commit = false;
      endDrag(commit);
    }

    if (nodes.pages) {
      nodes.pages.addEventListener('pointerdown', onPointerDown);
      nodes.pages.addEventListener('pointermove', onPointerMove);
      nodes.pages.addEventListener('pointerup', onPointerUp);
      nodes.pages.addEventListener('pointercancel', onPointerUp);
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
