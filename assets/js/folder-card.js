/**
 * ProjectFolderCard — turns one projectData entry into a DOM node.
 * Markup lives in the #folder-template <template> in index.html so the
 * structure stays reviewable as HTML rather than string concatenation.
 */
window.FolderCard = (function () {
  'use strict';

  var template = null;

  function fill(root, selector, value) {
    var node = root.querySelector(selector);
    if (node && value != null) node.textContent = value;
    return node;
  }

  /**
   * @param {Object} project one entry from window.PORTFOLIO_PROJECTS
   * @param {number} position zero-based position in the rail
   * @param {number} total    total number of projects
   * @returns {HTMLLIElement}
   */
  function create(project, position, total) {
    template = template || document.getElementById('folder-template');
    var slot = template.content.firstElementChild.cloneNode(true);
    var link = slot.querySelector('[data-folder]');

    slot.dataset.position = String(position);
    slot.style.setProperty('--enter-index', String(position));   // first-load stagger

    // In-page board is the case. href "#" only means no separate HTML page yet —
    // never aria-disable the card, or tab/title/body become dead clicks.
    link.href = '#project-detail';
    // `aria-label` replaces the link's contents for naming, so role and scope —
    // which are now only drawn on the sheets that pull out on hover — would
    // otherwise never be announced at all. They go in the label instead.
    var label = 'Open ' + project.title + ' — ' + project.category + '.';
    if (project.role) label += ' Role: ' + project.role + '.';
    if (project.scope) label += ' Scope: ' + project.scope + '.';
    if ((project.tools || []).length) label += ' Tools: ' + project.tools.join(', ') + '.';
    label += ' Project ' + (position + 1) + ' of ' + total + '.';
    link.setAttribute('aria-label', label);
    link.setAttribute('aria-expanded', 'false');
    link.setAttribute('aria-controls', 'project-detail');
    link.removeAttribute('aria-disabled');
    delete link.dataset.placeholder;

    // the tab carries the YEAR — it is what you look for when scanning a shelf of
    // folders, and the running number is already in the header counter
    // card stock and how the tools are attached — both cosmetic, both per project
    if (project.tone) link.dataset.tone = project.tone;
    if (project.attach) link.dataset.attach = project.attach;

    fill(slot, '.folder__tab-index', project.year);
    fill(slot, '.folder__category', project.category);
    fill(slot, '.folder__title', project.title);
    fill(slot, '.folder__blurb', project.blurb);
    fill(slot, '[data-role]', project.role);
    fill(slot, '[data-scope]', project.scope);
    fill(slot, '.folder__cover-tag', project.coverTag);

    // Tools, clipped on like a slip of paper. Absent or empty means no slip at
    // all rather than an empty one, so a project without the field looks
    // deliberate instead of broken.
    // `[data-tools-slip]`, not `[data-attach]`: the folder itself carries
    // `data-attach="note"` for its variant, and being an ancestor it would match
    // an `[data-attach]` query first — which left the slip hidden on exactly the
    // folder that had the attribute set.
    var attach = slot.querySelector('[data-tools-slip]');
    var tools = (project.tools || []).filter(Boolean);
    if (attach) {
      attach.hidden = tools.length === 0;
      if (tools.length) {
        var list = attach.querySelector('[data-tools]');
        list.textContent = '';
        tools.forEach(function (tool) {
          var item = document.createElement('span');
          item.className = 'folder__attach-tool';
          item.textContent = tool;
          list.appendChild(item);
        });
      }
    }

    var cover = slot.querySelector('.folder__cover-img');
    if (project.cover) {
      cover.src = project.cover;
      cover.alt = '';
      cover.addEventListener('error', function () {
        cover.remove();
        slot.querySelector('.folder__cover').dataset.missing = 'true';
      });
    } else {
      cover.remove();
      slot.querySelector('.folder__cover').dataset.missing = 'true';
    }

    return slot;
  }

  /**
   * The same card, rendered for the detail view's dock: identical markup and
   * classes so it is visually the folder you just opened, but inert — a div,
   * not a link, with nothing focusable inside. It stays readable to assistive
   * tech, because the category, year, role and scope now live only here.
   *
   * @param {Object} project
   * @returns {HTMLDivElement}
   */
  function createDocked(project) {
    var slot = create(project, 0, 1);
    var link = slot.querySelector('[data-folder]');

    var docked = document.createElement('div');
    docked.className = link.className + ' folder--docked';
    docked.innerHTML = link.innerHTML;

    // `className` carries the classes but not the data attributes, and the card
    // stock and the attachment variant both live on those. Without this the
    // folder would change colour part-way through its flight into the dock.
    Object.keys(link.dataset).forEach(function (key) {
      docked.dataset[key] = link.dataset[key];
    });

    // innerHTML drops the cover's error handler; re-arm it.
    var cover = docked.querySelector('.folder__cover-img');
    if (cover) {
      cover.addEventListener('error', function () {
        cover.remove();
        docked.querySelector('.folder__cover').dataset.missing = 'true';
      });
    }
    return docked;
  }

  return { create: create, createDocked: createDocked };
})();
