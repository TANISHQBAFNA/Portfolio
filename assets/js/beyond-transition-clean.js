/**
 * Clean Multiverse portal.
 * Enter: cream veil punched open, rings expand outward.
 * Home: rings + portal collapse inward. Page world is never scaled.
 * After collapse: coffee void hold, then cream index.html curtain.
 */
(function () {
  'use strict';

  var HOME = 'index.html';
  var VOID_HOLD = 0.85;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var params = new URLSearchParams(location.search);
  var busy = false;
  var active;
  var introTimer;

  var root = document.querySelector('[data-portal]');
  var veil = document.querySelector('[data-portal-veil]');
  var voidEl = document.querySelector('[data-portal-void]');
  var stage = document.querySelector('[data-portal-stage]');
  var core = document.querySelector('[data-portal-core]');
  var whisper = document.querySelector('[data-portal-whisper]');
  var ringsRed = document.querySelector('[data-rings-red]');
  var ringsCyan = document.querySelector('[data-rings-cyan]');
  var ringsBlue = document.querySelector('[data-rings-blue]');
  var beyondBtns = document.querySelectorAll('[data-go-beyond]');
  var homeBtns = document.querySelectorAll('[data-go-home]');
  var world = document.querySelector('[data-mv-world]');

  function gsapReady() {
    return typeof window.gsap !== 'undefined';
  }

  function setBusy(on) {
    busy = on;
    document.documentElement.classList.toggle('is-portal-busy', on);
    beyondBtns.forEach(function (btn) { btn.disabled = on; });
    homeBtns.forEach(function (btn) { btn.disabled = on; });
  }

  function setWhisper(text) {
    if (whisper) whisper.textContent = text;
  }

  function hole(px) {
    if (veil) veil.style.setProperty('--portal-hole', px);
  }

  function showPortal() {
    if (!root) return;
    root.classList.add('is-on');
    root.setAttribute('aria-hidden', 'false');
  }

  function hidePortal() {
    if (!root) return;
    root.classList.remove('is-on', 'is-cover', 'is-hold');
    root.setAttribute('aria-hidden', 'true');
  }

  function killActive() {
    if (active) {
      active.kill();
      active = null;
    }
  }

  function reducedEnter() {
    hole('160vmax');
    if (veil) veil.style.opacity = '0';
    if (voidEl) voidEl.style.opacity = '0';
    if (stage) stage.style.opacity = '0';
    if (whisper) whisper.style.opacity = '0';
    hidePortal();
    document.documentElement.classList.add('is-beyond');
    setBusy(false);
  }

  function reducedLeave() {
    if (voidEl) voidEl.style.opacity = '1';
    showPortal();
    window.setTimeout(function () {
      window.location.href = HOME;
    }, 280);
  }

  function lockWorld() {
    if (!world) return;
    world.style.transform = 'none';
    world.style.scale = 'none';
    if (gsapReady()) {
      window.gsap.set(world, {
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        overwrite: true
      });
    }
  }

  function playEnter() {
    if (busy) return;
    lockWorld();
    if (reduce.matches || !gsapReady()) {
      setBusy(true);
      reducedEnter();
      return;
    }

    var gsap = window.gsap;
    killActive();
    setBusy(true);
    setWhisper('GO BEYOND');
    if (whisper) whisper.classList.remove('is-leave');
    showPortal();
    if (root) {
      root.classList.add('is-cover');
      root.classList.remove('is-hold');
    }
    document.documentElement.classList.remove('is-beyond');

    var holeAmt = { r: 0 };
    gsap.set(voidEl, { autoAlpha: 0 });
    gsap.set(veil, { autoAlpha: 1 });
    gsap.set(stage, { autoAlpha: 1, xPercent: -50, yPercent: -50, x: 0, y: 0, scale: 0.07 });
    gsap.set(core, { scale: 0.18, autoAlpha: 1 });
    gsap.set(whisper, { autoAlpha: 0, xPercent: -50, yPercent: -50, scale: 1.06, color: '#1E1510' });
    gsap.set(ringsRed, { x: 0, y: 0, autoAlpha: 0 });
    gsap.set(ringsCyan, { x: 0, y: 0, autoAlpha: 0 });
    gsap.set(ringsBlue, { x: 0, y: 0, autoAlpha: 0 });
    hole('0px');

    active = gsap.timeline({
      defaults: { overwrite: 'auto' },
      onUpdate: lockWorld,
      onComplete: function () {
        gsap.set([veil, stage, whisper, ringsRed, ringsCyan, ringsBlue], { autoAlpha: 0 });
        hidePortal();
        document.documentElement.classList.add('is-beyond');
        setBusy(false);
        active = null;
      }
    });

    active
      .to(whisper, { autoAlpha: 1, scale: 1, duration: 0.24, ease: 'power2.out' }, 0.04)
      .to(stage, { scale: 2.35, duration: 1.12, ease: 'power3.inOut' }, 0.08)
      .to(core, { scale: 1, duration: 0.42, ease: 'power2.out' }, 0.08)
      .to(holeAmt, {
        r: 150,
        duration: 1.12,
        ease: 'power3.inOut',
        onUpdate: function () { hole(holeAmt.r + 'vmax'); }
      }, 0.08)
      .to(ringsRed, { x: 6, y: -2, autoAlpha: 0.42, duration: 0.36, ease: 'power2.out' }, 0.16)
      .to(ringsCyan, { x: -6, y: 2, autoAlpha: 0.38, duration: 0.36, ease: 'power2.out' }, 0.16)
      .to(ringsBlue, { x: 0, y: 4, autoAlpha: 0.22, duration: 0.36, ease: 'power2.out' }, 0.18)
      .to(core, { autoAlpha: 0, scale: 1.35, duration: 0.28, ease: 'power2.in' }, 0.72)
      .to(whisper, { autoAlpha: 0, duration: 0.2, ease: 'power2.in' }, 0.88)
      .to([ringsRed, ringsCyan, ringsBlue], { x: 0, y: 0, autoAlpha: 0, duration: 0.28, ease: 'power2.inOut' }, 0.96)
      .to(veil, { autoAlpha: 0, duration: 0.18, ease: 'none' }, 1.12)
      .to(stage, { autoAlpha: 0, duration: 0.22, ease: 'power2.in' }, 1.14);
  }

  function playLeave() {
    if (busy) return;
    lockWorld();
    if (reduce.matches || !gsapReady()) {
      setBusy(true);
      reducedLeave();
      return;
    }

    var gsap = window.gsap;
    killActive();
    setBusy(true);
    setWhisper('GO HOME');
    if (whisper) whisper.classList.add('is-leave');
    showPortal();
    if (root) root.classList.remove('is-cover');

    gsap.set(voidEl, { autoAlpha: 0 });
    gsap.set(veil, { autoAlpha: 0 });
    hole('160vmax');
    gsap.set(stage, { autoAlpha: 1, xPercent: -50, yPercent: -50, x: 0, y: 0, scale: 1.55 });
    gsap.set(core, { scale: 1.05, autoAlpha: 1 });
    gsap.set(whisper, { autoAlpha: 0, xPercent: -50, yPercent: -50, scale: 1.04, color: '#f4efe6' });
    gsap.set(ringsRed, { x: 5, y: -2, autoAlpha: 0.4 });
    gsap.set(ringsCyan, { x: -5, y: 2, autoAlpha: 0.36 });
    gsap.set(ringsBlue, { x: 0, y: 3, autoAlpha: 0.2 });

    active = gsap.timeline({
      defaults: { overwrite: 'auto' },
      onUpdate: lockWorld,
      onComplete: function () {
        window.location.href = HOME;
      }
    });

    active
      .to(whisper, { autoAlpha: 1, scale: 1, duration: 0.18, ease: 'power2.out' }, 0)
      .to(stage, { scale: 0.001, duration: 0.92, ease: 'power3.in' }, 0.12)
      .to(core, { scale: 0.001, duration: 0.92, ease: 'power3.in' }, 0.12)
      .to([ringsRed, ringsCyan, ringsBlue], { x: 0, y: 0, duration: 0.55, ease: 'power2.in' }, 0.18)
      .to(whisper, { autoAlpha: 0, scale: 0.84, duration: 0.22, ease: 'power2.in' }, 0.58)
      .to(stage, { autoAlpha: 0, duration: 0.01, ease: 'none' }, 1.04)
      .set(voidEl, { autoAlpha: 1 }, 1.05)
      .to(voidEl, { autoAlpha: 1, duration: VOID_HOLD }, 1.05);
  }

  function boot() {
    lockWorld();

    beyondBtns.forEach(function (btn) {
      btn.addEventListener('click', function (event) {
        event.preventDefault();
        window.clearTimeout(introTimer);
        playEnter();
      });
    });

    homeBtns.forEach(function (btn) {
      btn.addEventListener('click', function (event) {
        event.preventDefault();
        window.clearTimeout(introTimer);
        playLeave();
      });
    });

    if (params.get('beyond') === '1') {
      reducedEnter();
      return;
    }

    if (params.get('hold') === '1') {
      if (!gsapReady()) {
        showPortal();
        if (root) root.classList.add('is-hold');
        if (veil) veil.style.opacity = '1';
        return;
      }
      window.gsap.set(voidEl, { autoAlpha: 0 });
      window.gsap.set(veil, { autoAlpha: 1 });
      window.gsap.set(stage, { autoAlpha: 0, xPercent: -50, yPercent: -50, scale: 0.07 });
      hole('0px');
      showPortal();
      if (root) root.classList.add('is-hold');
      setBusy(false);
      return;
    }

    introTimer = window.setTimeout(playEnter, 520);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
