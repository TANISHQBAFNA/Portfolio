/**
 * WorkCard — one selected-work tile from projectData + the #folder-template.
 */
window.FolderCard = (function () {
  'use strict';

  var template = null;

  function fill(root, selector, value) {
    var node = root.querySelector(selector);
    if (node && value != null) node.textContent = value;
    return node;
  }

  function create(project, position, total) {
    template = template || document.getElementById('folder-template');
    var slot = template.content.firstElementChild.cloneNode(true);
    var link = slot.querySelector('[data-folder]');
    var title = project.cardTitle || project.title;
    var caption = project.cardCaption || project.coverTag || project.category || '';

    slot.dataset.position = String(position);
    slot.style.setProperty('--enter-index', String(position));

    link.href = '#project-study';
    var label = title + '. ' + caption + '. ';
    label += 'Open project screen. ';
    label += 'Project ' + (position + 1) + ' of ' + total + '.';
    link.setAttribute('aria-label', label);
    link.setAttribute('aria-expanded', 'false');
    link.setAttribute('aria-controls', 'project-study');

    fill(slot, '.work-card__title', title);
    fill(slot, '.work-card__caption', caption);
    if (project.bentoTone) {
      slot.dataset.tone = project.bentoTone;
      link.dataset.tone = project.bentoTone;
    }

    var image = slot.querySelector('.work-card__img');
    var src = project.cardImage || project.cover;
    if (image && src) {
      image.src = src;
      image.alt = '';
    }

    return slot;
  }

  function createDocked(project) {
    var slot = create(project, 0, 1);
    var link = slot.querySelector('[data-folder]');
    var docked = document.createElement('div');
    docked.className = link.className + ' folder--docked';
    docked.innerHTML = link.innerHTML;
    Object.keys(link.dataset).forEach(function (key) {
      docked.dataset[key] = link.dataset[key];
    });
    return docked;
  }

  return { create: create, createDocked: createDocked };
})();
