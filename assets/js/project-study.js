/**
 * ProjectStudy — five cinematic 3D stories, one camera grammar each.
 * Window is the scroller. Pins stay sparse.
 *
 * Cut / Tunnel / Helix / Deck / Type — motion skins.
 * cbx300 — cream opened-case pages (Infoviz chapter grammar, bank-calm).
 */
window.ProjectStudy = (function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var OPEN_MS = 900;
  var CLOSE_MS = 900;
  var HOLD_MS = 400;

  function pad(n) {
    return String(n).length < 2 ? '0' + n : String(n);
  }

  function create(options) {
    var root = options.root;
    var projects = options.projects || [];
    var html = document.documentElement;
    var openIndex = -1;
    var mode = 'off';
    var triggers = [];
    var introTween = null;
    var introHold = 0;
    var titleChars = [];
    var currentTitle = '';
    var savedScroll = 0;
    var caseKit = null;
    var caseMount = null;
    var pendingPage = '';

    var nodes = {
      progress: root.querySelector('[data-study-progress]'),
      step: root.querySelector('[data-study-step]'),
      total: root.querySelector('[data-study-total]'),
      close: root.querySelectorAll('[data-study-close]'),
      veil: root.querySelector('[data-study-veil]'),
      fly: root.querySelector('[data-study-fly]'),
      project: root.querySelector('[data-study-project]'),
      temps: root.querySelectorAll('.study__temps [data-template]')
    };
    var template = 'original';

    function isOpen() {
      return mode === 'study';
    }

    function liveKids(parent) {
      if (!parent) return [];
      return Array.prototype.filter.call(parent.children, function (el) {
        return window.getComputedStyle(el).display !== 'none';
      });
    }

    function activeWorld() {
      return root.querySelector('[data-world]:not([hidden])');
    }

    function visibleScenes() {
      var world = activeWorld();
      if (!world) return [];
      return Array.prototype.filter.call(world.querySelectorAll('[data-scene]'), function (el) {
        if (el.classList.contains('study-scene--hero')) return false;
        return getComputedStyle(el).display !== 'none';
      });
    }

    function q(sel) {
      var w = activeWorld();
      return w ? w.querySelector(sel) : null;
    }

    function qq(sel) {
      var w = activeWorld();
      return w ? Array.prototype.slice.call(w.querySelectorAll(sel)) : [];
    }

    function isMobile() {
      return window.matchMedia('(max-width: 767px)').matches;
    }

    function resetMotionEls() {
      if (typeof gsap === 'undefined') return;
      gsap.utils.toArray(root.querySelectorAll(
        '.study-frame, .study-phone, .study-orbit, .study-handset, .study-cover > *, .study-helix, .study-helix-item, .study-card, .study-station, .study-tunnel-world, [data-rise], [data-pair-desk], [data-pair-phone], [data-type-desk], [data-type-phone], [data-split-frame], [data-split-copy]'
      )).forEach(function (el) {
        gsap.set(el, { clearProps: 'transform,opacity,zIndex' });
      });
    }

    function pageFromUrl() {
      var q = /[?&]page=([^&]+)/.exec(location.search);
      if (q) return decodeURIComponent(q[1]).toLowerCase();
      var h = /^#(?:page=)?([a-z0-9-]+)$/i.exec(location.hash);
      if (h) return h[1].toLowerCase();
      return '';
    }

    function killMotion() {
      if (caseKit && caseKit.kill) caseKit.kill();
      caseKit = null;
      triggers.forEach(function (t) {
        if (t && t.kill) t.kill();
      });
      triggers = [];
      if (window.ScrollTrigger && root) {
        ScrollTrigger.getAll().forEach(function (t) {
          if (t && t.trigger && root.contains(t.trigger) && t.kill) t.kill();
        });
      }
      resetMotionEls();
    }

    function afterLayout(fn) {
      requestAnimationFrame(function () {
        requestAnimationFrame(fn);
      });
    }

    function setCap(el, text) {
      if (!el || !text || el.textContent === text) return;
      el.textContent = text;
    }

    function paintTitle(text) {
      currentTitle = String(text || '');
      titleChars = [];
      root.querySelectorAll('[data-study-title]').forEach(function (el) {
        el.textContent = '';
        var world = el.closest('[data-world]');
        if (world && world.hidden) {
          el.textContent = currentTitle;
          return;
        }
        currentTitle.split('').forEach(function (ch) {
          var span = document.createElement('span');
          span.className = 'study-title__ch' + (ch === ' ' ? ' is-space' : '');
          span.textContent = ch === ' ' ? '\u00a0' : ch;
          el.appendChild(span);
          titleChars.push(span);
        });
      });
      var proj = nodes.project || root.querySelector('[data-study-project]');
      if (proj) proj.textContent = currentTitle;
      if (nodes.fly) nodes.fly.textContent = currentTitle;
    }

    var lastStep = -1;
    function setStep(index) {
      if (index === lastStep) return;
      lastStep = index;
      if (nodes.step) nodes.step.textContent = pad(index + 1);
    }

    function setTotal(n) {
      if (nodes.total) nodes.total.textContent = pad(n);
    }

    function onScroll() {
      if (mode !== 'study') return;
      var max = Math.max(0, root.scrollHeight - root.clientHeight);
      var y = root.scrollTop || window.scrollY || 0;
      var p = max > 0 ? y / max : 0;
      if (nodes.progress) {
        nodes.progress.style.transform = 'scaleX(' + Math.max(0.02, Math.min(1, p)).toFixed(4) + ')';
      }
    }

    function headPx() {
      var chrome = root.querySelector('.study__chrome');
      if (!chrome) return 108;
      return Math.round(chrome.getBoundingClientRect().bottom);
    }

    function syncHead() {
      root.style.setProperty('--study-head', headPx() + 'px');
    }

    function applyTemplate(name) {
      template = name || 'original';
      root.setAttribute('data-template', template);
      Array.prototype.forEach.call(root.querySelectorAll('[data-world]'), function (world) {
        world.hidden = world.getAttribute('data-world') !== template;
      });
      Array.prototype.forEach.call(nodes.temps, function (btn) {
        btn.classList.toggle('is-on', btn.getAttribute('data-template') === template);
        btn.setAttribute('aria-pressed', btn.getAttribute('data-template') === template ? 'true' : 'false');
      });
    }

    function pinScrub(trigger, animation) {
      if (!trigger || trigger.closest('[hidden]') || trigger.hidden) return;
      triggers.push(ScrollTrigger.create({
        trigger: trigger,
        start: function () { return 'top ' + headPx() + 'px'; },
        end: 'bottom bottom',
        scrub: 0.35,
        invalidateOnRefresh: true,
        animation: animation
      }));
    }

    function pinProgress(trigger, onUpdate) {
      if (!trigger || trigger.closest('[hidden]') || trigger.hidden) return;
      triggers.push(ScrollTrigger.create({
        trigger: trigger,
        start: function () { return 'top ' + headPx() + 'px'; },
        end: 'bottom bottom',
        scrub: 0.35,
        invalidateOnRefresh: true,
        onUpdate: function (self) { onUpdate(self.progress); }
      }));
      onUpdate(0);
    }

    function bindSceneSteps() {
      var sceneList = visibleScenes();
      setTotal(sceneList.length);
      sceneList.forEach(function (scene, i) {
        triggers.push(ScrollTrigger.create({
          trigger: scene,
          start: 'top 60%',
          end: 'bottom 40%',
          onToggle: function (self) {
            if (self.isActive) setStep(i);
          }
        }));
      });
    }

    function inkColor() {
      return html.classList.contains('is-dark') ? '#f4efe6' : '#1E1510';
    }

    function curtainInk() {
      return html.classList.contains('is-dark') ? '#1E1510' : '#f4efe6';
    }

    function clearIntroHold() {
      if (introHold) {
        window.clearTimeout(introHold);
        introHold = 0;
      }
    }

    function seatFly(hidden) {
      var fly = nodes.fly;
      if (!fly || !nodes.veil) return;
      fly.classList.remove('is-flying');
      if (fly.parentNode !== nodes.veil) nodes.veil.appendChild(fly);
      fly.style.position = '';
      fly.style.left = '';
      fly.style.top = '';
      fly.style.width = '';
      fly.style.zIndex = '';
      fly.style.willChange = '';
      fly.style.pointerEvents = '';
      fly.style.transform = '';
      fly.style.color = curtainInk();
      fly.style.margin = '';
      fly.style.fontSize = '';
      fly.style.fontFamily = '';
      fly.style.fontWeight = '';
      fly.style.letterSpacing = '';
      fly.style.lineHeight = '';
      fly.style.whiteSpace = '';
      fly.style.maxWidth = '';
      if (typeof gsap !== 'undefined') gsap.set(fly, { clearProps: 'transform,x,y,scale,scaleX,scaleY,color,opacity' });
      fly.style.visibility = hidden ? 'hidden' : '';
    }

    function bindOriginal() {
      bindSceneSteps();

      qq('[data-rise]').forEach(function (el) {
        triggers.push(ScrollTrigger.create({
          trigger: el,
          start: 'top 90%',
          end: 'top 55%',
          scrub: true,
          animation: gsap.fromTo(el, { y: 32, opacity: 0 }, { y: 0, opacity: 1, ease: 'none', duration: 1 })
        }));
      });

      var well = q('[data-well]');
      var wellCore = q('[data-well-core]');
      var wellPin = q('[data-well-pin]');
      if (well && wellPin) {
        var wellTween = gsap.timeline()
          .fromTo(well, { scale: 0.84 }, { scale: 1, ease: 'none', duration: 1 }, 0);
        if (wellCore) {
          wellTween.fromTo(wellCore, { scale: 1.12 }, { scale: 1, ease: 'none', duration: 1 }, 0);
        }
        pinScrub(wellPin, wellTween);
      }

      var split = q('[data-split]');
      if (split) {
        var splitLeft = split.querySelector('[data-split-frame]');
        var splitCopy = split.querySelector('[data-split-copy]');
        if (splitLeft) {
          triggers.push(ScrollTrigger.create({
            trigger: split,
            start: 'top 80%',
            end: 'bottom top',
            scrub: true,
            animation: gsap.fromTo(splitLeft, { y: 36 }, { y: -20, ease: 'none', duration: 1 })
          }));
        }
        if (splitCopy) {
          triggers.push(ScrollTrigger.create({
            trigger: split,
            start: 'top 80%',
            end: 'bottom top',
            scrub: true,
            animation: gsap.fromTo(splitCopy, { y: 56 }, { y: -12, ease: 'none', duration: 1 })
          }));
        }
      }

      var handset = q('[data-handset]');
      var handsetPin = q('[data-handset-pin]');
      if (handset && handsetPin) {
        pinScrub(handsetPin, gsap.fromTo(handset, { y: 48, scale: 0.9 }, { y: 0, scale: 1, ease: 'none', duration: 1 }));
      }

      qq('[data-phone]').forEach(function (el, i) {
        triggers.push(ScrollTrigger.create({
          trigger: el,
          start: 'top 88%',
          end: 'top 50%',
          scrub: true,
          animation: gsap.fromTo(el, { y: 40 + i * 12, opacity: 0 }, { y: 0, opacity: 1, ease: 'none', duration: 1 })
        }));
      });

      var strip = q('[data-strip]');
      var stripPin = q('[data-strip-pin]');
      if (strip && stripPin && !isMobile()) {
        var hold = stripPin.querySelector('.study-hold') || stripPin;
        var shift = Math.min(0, hold.clientWidth - strip.scrollWidth - 24);
        pinScrub(stripPin, gsap.fromTo(strip, { x: 0 }, { x: shift, ease: 'none', duration: 1 }));
      }

      var bleed = q('[data-bleed]');
      var bleedPin = q('[data-bleed-pin]');
      if (bleed && bleedPin) {
        pinScrub(bleedPin, gsap.fromTo(bleed, { scale: 0.9, borderRadius: 28 }, { scale: 1, borderRadius: 0, ease: 'none', duration: 1 }));
      }

      qq('[data-grid-item]').forEach(function (el) {
        triggers.push(ScrollTrigger.create({
          trigger: el,
          start: 'top 90%',
          end: 'top 58%',
          scrub: true,
          animation: gsap.fromTo(el, { y: 40, opacity: 0 }, { y: 0, opacity: 1, ease: 'none', duration: 1 })
        }));
      });
    }

    function bindCut() {
      bindSceneSteps();

      var hero = q('[data-scene="hero"]');
      var kicker = q('[data-hero-kicker]');
      if (hero && titleChars.length) {
        var recede = gsap.timeline();
        recede.fromTo(titleChars, {
          z: 0, rotationX: 0, y: 0, opacity: 1
        }, {
          z: -420, rotationX: -38, y: -28, opacity: 0.12,
          stagger: 0.012, ease: 'none', duration: 1
        }, 0);
        if (kicker) {
          recede.fromTo(kicker, { z: 0, opacity: 1 }, { z: -180, opacity: 0, ease: 'none', duration: 0.7 }, 0);
        }
        triggers.push(ScrollTrigger.create({
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5,
          animation: recede
        }));
      }

      var well = q('[data-well]');
      var wellCore = q('[data-well-core]');
      var wellPin = q('[data-well-pin]');
      if (well && wellPin) {
        var wellTween = gsap.timeline()
          .fromTo(well, {
            z: -860, rotationX: 22, rotationY: -12, scale: 0.78
          }, {
            z: 0, rotationX: 0, rotationY: 0, scale: 1, ease: 'none', duration: 1
          }, 0);
        if (wellCore) {
          wellTween.fromTo(wellCore, { z: 70, scale: 1.18 }, { z: 0, scale: 1, ease: 'none', duration: 1 }, 0);
        }
        pinScrub(wellPin, wellTween, '+=110%');
      }

      qq('[data-rise]').forEach(function (el) {
        triggers.push(ScrollTrigger.create({
          trigger: el,
          start: 'top 92%',
          end: 'top 58%',
          scrub: 0.4,
          animation: gsap.fromTo(el, {
            y: 48, z: -120, rotationX: 18, opacity: 0
          }, {
            y: 0, z: 0, rotationX: 0, opacity: 1, ease: 'none', duration: 1
          })
        }));
      });

      var split = q('[data-split]');
      if (split) {
        var splitLeft = split.querySelector('[data-split-frame]');
        var splitCopy = split.querySelector('[data-split-copy]');
        if (splitLeft) {
          triggers.push(ScrollTrigger.create({
            trigger: split,
            start: 'top 85%',
            end: 'bottom top',
            scrub: 0.55,
            animation: gsap.fromTo(splitLeft, {
              y: 80, z: -280, rotationY: 28, rotationX: 8
            }, {
              y: -28, z: 0, rotationY: 0, rotationX: 0, ease: 'none', duration: 1
            })
          }));
        }
        if (splitCopy) {
          triggers.push(ScrollTrigger.create({
            trigger: split,
            start: 'top 85%',
            end: 'bottom top',
            scrub: 0.55,
            animation: gsap.fromTo(splitCopy, {
              y: 96, z: -80, rotationY: -16, opacity: 0.15
            }, {
              y: -16, z: 0, rotationY: 0, opacity: 1, ease: 'none', duration: 1
            })
          }));
        }
      }

      var handset = q('[data-handset]');
      var handsetPin = q('[data-handset-pin]');
      if (handset && handsetPin) {
        pinScrub(handsetPin, gsap.fromTo(handset, {
          z: -520, y: 80, rotationY: -58, rotationX: 12, scale: 0.82
        }, {
          z: 40, y: 0, rotationY: 0, rotationX: 0, scale: 1, ease: 'none', duration: 1
        }), '+=95%');
      }

      var orbit = q('[data-orbit]');
      var devicesPin = q('[data-devices-pin]');
      if (orbit && devicesPin) {
        var phones = liveKids(orbit.querySelector('.study-devices'));
        var spread = isMobile() ? 110 : 210;
        phones.forEach(function (phone, i) {
          var slot = i - (phones.length - 1) / 2;
          gsap.set(phone, {
            xPercent: -50,
            yPercent: -50,
            x: slot * spread,
            z: Math.abs(slot) * -220,
            rotationY: slot * 38,
            rotationX: 6,
            zIndex: Math.round(12 - Math.abs(slot) * 4)
          });
        });
        pinScrub(devicesPin, gsap.fromTo(orbit, { rotationY: -42, z: -80 }, { rotationY: 42, z: 40, ease: 'none', duration: 1 }), '+=130%');
      }

      var pairPin = q('[data-pair-pin]');
      var pairDesk = q('[data-pair-desk]');
      var pairPhone = q('[data-pair-phone]');
      if (pairPin) {
        var pairTween = gsap.timeline();
        if (pairDesk) {
          pairTween.fromTo(pairDesk, { z: -360, rotationY: 42, x: -40 }, { z: 0, rotationY: 0, x: 0, ease: 'none', duration: 1 }, 0);
        }
        if (pairPhone) {
          pairTween.fromTo(pairPhone, { z: -360, rotationY: -48, x: 48 }, { z: 80, rotationY: 0, x: 0, ease: 'none', duration: 1 }, 0);
        }
        pinScrub(pairPin, pairTween, '+=100%');
      }

      var strip = q('[data-strip]');
      var stripPin = q('[data-strip-pin]');
      if (strip && stripPin) {
        var cards = liveKids(strip);
        var pitch = isMobile() ? 168 : 290;
        function placeCover(progress) {
          var n = cards.length;
          if (!n) return;
          var center = n === 1 ? 0 : progress * (n - 1);
          cards.forEach(function (el, i) {
            var d = i - center;
            var abs = Math.abs(d);
            gsap.set(el, {
              xPercent: -50,
              yPercent: -50,
              x: d * pitch,
              z: -abs * 260,
              rotationY: d * -32,
              rotationX: abs * 4,
              scale: 1 - Math.min(0.28, abs * 0.1),
              opacity: 1 - Math.min(0.45, abs * 0.18),
              zIndex: Math.round(24 - abs * 6)
            });
          });
        }
        placeCover(0);
        pinProgress(stripPin, placeCover);
      }

      var bleed = q('[data-bleed]');
      var bleedPin = q('[data-bleed-pin]');
      if (bleed && bleedPin) {
        pinScrub(bleedPin, gsap.fromTo(bleed, {
          z: 420, scale: 1.45, rotationX: 8, borderRadius: 36
        }, {
          z: 0, scale: 1, rotationX: 0, borderRadius: 0, ease: 'none', duration: 1
        }), '+=90%');
      }

      qq('[data-grid-item]').forEach(function (el, i) {
        if (el.closest('[hidden]')) return;
        var side = i % 2 === 0 ? -1 : 1;
        triggers.push(ScrollTrigger.create({
          trigger: el,
          start: 'top 92%',
          end: 'top 55%',
          scrub: 0.45,
          animation: gsap.fromTo(el, {
            y: 70, z: -340, rotationY: side * 36, rotationX: 16, opacity: 0
          }, {
            y: 0, z: 0, rotationY: 0, rotationX: 0, opacity: 1, ease: 'none', duration: 1
          })
        }));
      });
    }

    function bindTunnel() {
      var world = q('[data-tunnel-world]');
      var pin = q('[data-tunnel-pin]');
      var chapter = q('[data-tunnel-chapter]');
      if (!world || !pin) return;
      var stations = liveKids(world);
      var depth = isMobile() ? 540 : 780;
      var sway = isMobile() ? 16 : 48;
      stations.forEach(function (el, i) {
        var side = i % 2 ? 1 : -1;
        gsap.set(el, {
          xPercent: -50,
          yPercent: -50,
          z: -i * depth,
          x: i === 0 ? 0 : side * sway,
          y: (i % 3 - 1) * 14,
          rotationY: i === 0 ? 0 : side * -16,
          rotationX: i % 2 ? 5 : -4
        });
      });
      setTotal(stations.length);
      pinProgress(pin, function (p) {
        gsap.set(world, {
          z: p * (stations.length - 1) * depth,
          rotationY: Math.sin(p * Math.PI * 2) * 7,
          rotationX: 5 - p * 8
        });
        var i = Math.round(p * (stations.length - 1));
        var cap = stations[i] && stations[i].getAttribute('data-cap');
        setCap(chapter, cap === 'Open' ? currentTitle : cap);
        setStep(i);
      });
    }

    function bindHelix() {
      var helix = q('[data-helix]');
      var pin = q('[data-helix-pin]');
      var chapter = q('[data-helix-chapter]');
      if (!helix || !pin) return;
      var items = liveKids(helix);
      var radius = isMobile() ? 148 : 286;
      var yStep = isMobile() ? 26 : 40;
      items.forEach(function (el, i) {
        var t = (i / items.length) * Math.PI * 2 * 1.75;
        gsap.set(el, {
          xPercent: -50,
          yPercent: -50,
          x: Math.cos(t) * radius,
          z: Math.sin(t) * radius,
          y: (i - (items.length - 1) / 2) * yStep,
          rotationY: 90 - (t * 180 / Math.PI)
        });
      });
      var labels = [currentTitle, 'Handset', 'Desktop', 'Hold'];
      setTotal(labels.length);
      pinProgress(pin, function (p) {
        gsap.set(helix, {
          rotationY: p * 430,
          y: 40 - p * 80,
          rotationX: 8 - p * 6
        });
        var i = Math.min(labels.length - 1, Math.floor(p * labels.length));
        setCap(chapter, labels[i]);
        setStep(i);
      });
    }

    function bindDeck() {
      var deck = q('[data-deck]');
      var pin = q('[data-deck-pin]');
      var chapter = q('[data-deck-chapter]');
      if (!deck || !pin) return;
      var cards = liveKids(deck);
      function place(p) {
        var current = p * Math.max(cards.length - 1, 1);
        cards.forEach(function (el, i) {
          var d = i - current;
          var z;
          var scale;
          var opacity;
          var rotX;
          var y;
          var rotY;
          if (d < 0) {
            var t = Math.min(1, -d);
            z = t * 460;
            scale = 1 + t * 0.46;
            opacity = Math.max(0, 1 - t * 1.2);
            rotX = t * -24;
            y = t * -56;
            rotY = t * 10;
          } else {
            z = -d * 72;
            scale = 1 - d * 0.038;
            opacity = 1;
            rotX = d * 6;
            y = d * 14;
            rotY = 0;
          }
          gsap.set(el, {
            xPercent: -50,
            yPercent: -50,
            z: z,
            y: y,
            scale: scale,
            opacity: opacity,
            rotationX: rotX,
            rotationY: rotY,
            zIndex: Math.round(40 - Math.abs(d) * 8)
          });
        });
        var idx = Math.round(current);
        var cap = cards[idx] && cards[idx].getAttribute('data-cap');
        setCap(chapter, cap === 'Open' ? currentTitle : cap);
        setStep(idx);
      }
      place(0);
      setTotal(cards.length);
      pinProgress(pin, place);
    }

    function bindType() {
      var pin = q('[data-type-pin]');
      var desk = q('[data-type-desk]');
      var phone = q('[data-type-phone]');
      var kicker = q('[data-type-kicker]');
      var chars = titleChars;
      if (!pin) return;
      if (desk) gsap.set(desk, { opacity: 0, z: -520, rotationY: 34, scale: 0.72 });
      if (phone) gsap.set(phone, { opacity: 0, z: -380, rotationY: -42, x: 48, scale: 0.8 });
      chars.forEach(function (ch, i) {
        var mid = (chars.length - 1) / 2;
        var slot = i - mid;
        gsap.set(ch, { x: 0, y: 28, z: -480, rotationX: 78, rotationY: slot * 8, opacity: 1 });
      });
      setTotal(4);
      pinProgress(pin, function (p) {
        chars.forEach(function (ch, i) {
          var mid = (chars.length - 1) / 2;
          var slot = i - mid;
          var a = Math.min(1, p / 0.22);
          var b = p < 0.22 ? 0 : Math.min(1, (p - 0.22) / 0.3);
          var c = p < 0.52 ? 0 : Math.min(1, (p - 0.52) / 0.26);
          gsap.set(ch, {
            z: (1 - a) * -480 + b * Math.abs(slot) * -36 + c * -260,
            rotationX: (1 - a) * 78 - b * 12,
            rotationY: slot * (8 + b * 16 + c * 26),
            x: slot * (b * 22 + c * 64),
            y: (1 - a) * 28 + c * -18,
            opacity: (0.55 + a * 0.45) * (1 - c * 0.28)
          });
        });
        var emerge = p < 0.48 ? 0 : Math.min(1, (p - 0.48) / 0.3);
        if (desk) {
          gsap.set(desk, {
            z: (1 - emerge) * -520,
            rotationY: (1 - emerge) * 34,
            scale: 0.72 + emerge * 0.28,
            opacity: emerge
          });
        }
        if (phone) {
          gsap.set(phone, {
            z: (1 - emerge) * -380 + emerge * 40,
            rotationY: (1 - emerge) * -42,
            x: (1 - emerge) * 48,
            scale: 0.8 + emerge * 0.2,
            opacity: emerge
          });
        }
        if (kicker) setCap(kicker, p < 0.48 ? 'Name' : 'Work');
        setStep(p < 0.22 ? 0 : p < 0.48 ? 1 : p < 0.74 ? 2 : 3);
      });
    }

    function bindCbx300() {
      var world = root.querySelector('[data-world="cbx300"]');
      if (!world || !window.CaseScrollKit) return;
      var pages = world.querySelectorAll('[data-case-page]');
      setTotal(pages.length);
      setStep(0);
      caseKit = window.CaseScrollKit.bind({
        scroller: root,
        world: world,
        headerOffset: headPx,
        onStep: setStep,
        onPage: function (id) {
          if (caseMount && caseMount.syncTab) caseMount.syncTab(id);
        },
        startPage: pendingPage || '',
        forceStatic: reduceMotion.matches
      });
      if (caseMount && caseMount.setKit) caseMount.setKit(caseKit);
    }

    function bindMotion() {
      killMotion();
      syncHead();
      if (template === 'cbx300') {
        if (reduceMotion.matches || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
          bindCbx300();
          return;
        }
        gsap.registerPlugin(ScrollTrigger);
        ScrollTrigger.config({ ignoreMobileResize: true });
        bindCbx300();
        ScrollTrigger.refresh();
        return;
      }
      if (reduceMotion.matches || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        var scenes = visibleScenes();
        setTotal(scenes.length);
        return;
      }
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.config({ ignoreMobileResize: true });
      if (template === 'original') bindOriginal();
      else if (template === 'tunnel') bindTunnel();
      else if (template === 'helix') bindHelix();
      else if (template === 'deck') bindDeck();
      else if (template === 'type') bindType();
      else bindCut();
      ScrollTrigger.refresh();
    }

    function flyMaxWidth() {
      var veil = nodes.veil;
      var gutter = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--gutter')) || 24;
      if (!veil) return Math.max(80, window.innerWidth - gutter * 2);
      var cs = getComputedStyle(veil);
      var pl = parseFloat(cs.paddingLeft) || gutter;
      var pr = parseFloat(cs.paddingRight) || gutter;
      return Math.max(80, veil.clientWidth - pl - pr);
    }

    function fitFlySize() {
      var fly = nodes.fly;
      if (!fly) return;
      fly.style.whiteSpace = 'nowrap';
      fly.style.fontSize = '';
      var start = parseFloat(window.getComputedStyle(fly).fontSize) || 96;
      var max = flyMaxWidth();
      fly.style.fontSize = start + 'px';
      function textW() {
        return Math.ceil(Math.max(fly.scrollWidth, fly.getBoundingClientRect().width));
      }
      if (textW() <= max) return;
      var lo = 18;
      var hi = start;
      var best = lo;
      var i;
      for (i = 0; i < 16; i++) {
        var mid = (lo + hi) / 2;
        fly.style.fontSize = mid + 'px';
        if (textW() <= max) {
          best = mid;
          lo = mid;
        } else {
          hi = mid;
        }
      }
      fly.style.fontSize = best + 'px';
      while (textW() > max && best > 16) {
        best -= 0.5;
        fly.style.fontSize = best + 'px';
      }
    }

    function makeFlyChar(ch) {
      var s = document.createElement('span');
      s.className = ch === ' ' ? 'curtain__ch curtain__ch--space' : 'curtain__ch';
      s.textContent = ch === ' ' ? '\u00a0' : ch;
      s.style.fontWeight = '800';
      return s;
    }

    function flattenFly() {
      var fly = nodes.fly;
      if (!fly) return;
      fly.textContent = currentTitle;
      fitFlySize();
      if (typeof gsap !== 'undefined') {
        gsap.set(fly, { x: 0, y: 0, scale: 1, opacity: 1, color: curtainInk(), clearProps: 'filter' });
      } else {
        fly.style.color = curtainInk();
      }
    }

    function paintFlyName(donePaint) {
      var fly = nodes.fly;
      if (!fly) {
        if (donePaint) donePaint();
        return;
      }
      fly.textContent = '';
      var chars = String(currentTitle || '').split('').map(makeFlyChar);
      chars.forEach(function (el) { fly.appendChild(el); });
      fitFlySize();
      if (typeof gsap === 'undefined' || !chars.length) {
        if (donePaint) donePaint();
        return;
      }
      gsap.set(chars, { opacity: 0, y: 8, filter: 'blur(7px)' });
      introTween = gsap.to(chars, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.55,
        stagger: 0.028,
        ease: 'power3.out',
        onComplete: donePaint
      });
    }

    function unpaintFlyName(donePaint) {
      var fly = nodes.fly;
      if (!fly) {
        if (donePaint) donePaint();
        return;
      }
      fly.textContent = '';
      var chars = String(currentTitle || '').split('').map(makeFlyChar);
      chars.forEach(function (el) { fly.appendChild(el); });
      fitFlySize();
      if (typeof gsap === 'undefined' || !chars.length) {
        if (donePaint) donePaint();
        return;
      }
      gsap.set(chars, { opacity: 1, y: 0, filter: 'blur(0px)' });
      introTween = gsap.to(chars, {
        opacity: 0,
        y: 8,
        filter: 'blur(7px)',
        duration: 0.55,
        stagger: { each: 0.028, from: 'end' },
        ease: 'power3.in',
        onComplete: donePaint
      });
    }

    function destBox() {
      var dest = nodes.project;
      if (!dest) return { left: 0, top: 0, width: 1, height: 1, fontSize: 18 };
      var prevVis = dest.style.visibility;
      var prevOp = dest.style.opacity;
      dest.style.visibility = 'hidden';
      dest.style.opacity = '1';
      dest.classList.add('is-in');
      var r = dest.getBoundingClientRect();
      var size = parseFloat(window.getComputedStyle(dest).fontSize) || 18;
      dest.classList.remove('is-in');
      dest.style.visibility = prevVis;
      dest.style.opacity = prevOp;
      return {
        left: r.left,
        top: r.top,
        width: Math.max(r.width, 1),
        height: Math.max(r.height, 1),
        fontSize: size
      };
    }

    function pinFly(left, top) {
      var fly = nodes.fly;
      if (!fly) return;
      fly.classList.add('is-flying');
      fly.style.position = 'fixed';
      fly.style.left = left + 'px';
      fly.style.top = top + 'px';
      fly.style.margin = '0';
      fly.style.width = 'auto';
      fly.style.maxWidth = 'none';
      fly.style.zIndex = '220';
      fly.style.pointerEvents = 'none';
      fly.style.willChange = 'transform';
      fly.style.visibility = 'visible';
      document.body.appendChild(fly);
    }

    function measureLargeRect() {
      var fly = nodes.fly;
      var veil = nodes.veil;
      if (!fly) return { left: 24, top: window.innerHeight - 160, width: 120, height: 48 };
      flattenFly();
      var w = Math.max(fly.offsetWidth, fly.getBoundingClientRect().width, 1);
      var h = Math.max(fly.offsetHeight, fly.getBoundingClientRect().height, 1);
      var pad = { left: 24, bottom: 48 };
      if (veil) {
        var cs = window.getComputedStyle(veil);
        pad.left = parseFloat(cs.paddingLeft) || 24;
        pad.bottom = parseFloat(cs.paddingBottom) || 48;
      }
      return {
        left: pad.left,
        top: window.innerHeight - pad.bottom - h,
        width: w,
        height: h
      };
    }

    function resetVeil(yPercent) {
      var veil = nodes.veil;
      if (!veil) return;
      if (typeof gsap === 'undefined') {
        veil.style.opacity = '1';
        veil.style.visibility = 'visible';
        veil.style.transform = 'translate3d(0, ' + (yPercent || 0) + '%, 0)';
        return;
      }
      gsap.set(veil, {
        yPercent: yPercent || 0,
        x: 0,
        y: 0,
        opacity: 1,
        autoAlpha: 1,
        visibility: 'visible',
        force3D: true
      });
    }

    function coverLive() {
      html.classList.remove('is-study-wipe');
      html.classList.add('is-study');
    }

    function revealHome() {
      html.classList.add('is-study-wipe');
      html.classList.remove('is-study');
      window.scrollTo(0, savedScroll);
    }

    function dropVeil(done) {
      var veil = nodes.veil;
      if (!veil || typeof gsap === 'undefined') {
        if (done) done();
        return;
      }
      resetVeil(-110);
      introTween = gsap.to(veil, {
        yPercent: 0,
        opacity: 1,
        autoAlpha: 1,
        duration: OPEN_MS / 1000,
        ease: 'power3.inOut',
        force3D: true,
        onComplete: done
      });
    }

    function liftVeil(done) {
      var veil = nodes.veil;
      if (!veil || typeof gsap === 'undefined') {
        if (done) done();
        return;
      }
      introTween = gsap.to(veil, {
        yPercent: -110,
        opacity: 1,
        autoAlpha: 1,
        duration: CLOSE_MS / 1000,
        ease: 'power3.inOut',
        force3D: true,
        onComplete: done
      });
    }

    function playIntro(done) {
      if (introTween && introTween.kill) introTween.kill();
      clearIntroHold();
      lastStep = -1;
      setStep(0);
      seatFly();

      var fly = nodes.fly;
      var dest = nodes.project;
      var veil = nodes.veil;

      function finishIntro() {
        coverLive();
        if (dest) dest.classList.add('is-in');
        seatFly(true);
        introTween = null;
        if (done) done();
      }

      if (!veil) {
        finishIntro();
        return;
      }

      if (dest) dest.classList.remove('is-in');
      if (dest) dest.textContent = currentTitle;
      if (fly) fly.style.visibility = 'hidden';

      if (reduceMotion.matches || typeof gsap === 'undefined') {
        flattenFly();
        veil.style.transform = 'translate3d(0, -110%, 0)';
        finishIntro();
        return;
      }

      gsap.set(veil, { yPercent: -110, opacity: 1, autoAlpha: 1, visibility: 'visible', force3D: true });
      if (fly) gsap.set(fly, { opacity: 1, x: 0, y: 0, scale: 1, color: curtainInk(), force3D: true });

      function afterCover() {
        coverLive();
        window.scrollTo(0, 0);
        onScroll();
        if (fly) fly.style.visibility = 'visible';
        if (window.IrisMotion && window.IrisMotion.pulseStudyCurtain) {
          window.IrisMotion.pulseStudyCurtain(veil, fly, reduceMotion, 'plate');
        }

        if (!fly || !dest) {
          liftVeil(finishIntro);
          return;
        }

        paintFlyName(function () {
          if (window.IrisMotion && window.IrisMotion.pulseStudyCurtain) {
            window.IrisMotion.pulseStudyCurtain(veil, fly, reduceMotion, 'name');
          }
          introHold = window.setTimeout(liftOpen, HOLD_MS);
        });
      }

      function liftOpen() {
        introHold = 0;
        flattenFly();
        var from = fly.getBoundingClientRect();
        var to = destBox();
        pinFly(from.left, from.top);
        from = fly.getBoundingClientRect();
        var fromSize = parseFloat(window.getComputedStyle(fly).fontSize) || from.height;
        var dx = to.left - from.left;
        var dy = to.top - from.top;
        var motion = { p: 0 };
        var dur = OPEN_MS / 1000;
        var ease = 'power3.inOut';
        gsap.set(veil, { yPercent: 0, force3D: true });
        gsap.set(fly, { x: 0, y: 0, force3D: true });
        introTween = gsap.to(motion, {
          p: 1,
          duration: dur,
          ease: ease,
          onUpdate: function () {
            var p = motion.p;
            gsap.set(veil, { yPercent: -110 * p, force3D: true });
            fly.style.fontSize = (fromSize + (to.fontSize - fromSize) * p) + 'px';
            gsap.set(fly, { x: dx * p, y: dy * p, force3D: true });
          },
          onComplete: function () {
            gsap.set(veil, { yPercent: -110, force3D: true });
            fly.style.fontSize = to.fontSize + 'px';
            gsap.set(fly, { x: dx, y: dy, force3D: true });
            dest.classList.add('is-in');
            seatFly(true);
            introTween = null;
            if (done) done();
          }
        });
        gsap.to(fly, { color: inkColor(), duration: dur, ease: ease });
      }

      dropVeil(afterCover);
    }

    function playOutro(done) {
      if (introTween && introTween.kill) introTween.kill();
      clearIntroHold();
      var fly = nodes.fly;
      var dest = nodes.project;
      var veil = nodes.veil;

      function finishOut() {
        introTween = null;
        seatFly(true);
        if (done) done();
      }

      if (reduceMotion.matches || typeof gsap === 'undefined' || !veil || !fly || !dest) {
        if (dest) dest.classList.remove('is-in');
        revealHome();
        finishOut();
        return;
      }

      var from = destBox();
      dest.classList.add('is-in');
      var large = measureLargeRect();
      var largeSize = parseFloat(window.getComputedStyle(fly).fontSize) || large.height;
      fly.style.fontSize = from.fontSize + 'px';
      pinFly(from.left, from.top);
      gsap.set(veil, { yPercent: -110, opacity: 1, autoAlpha: 1, visibility: 'visible', force3D: true });
      gsap.set(fly, {
        x: 0,
        y: 0,
        color: inkColor(),
        opacity: 1,
        force3D: true
      });
      dest.classList.remove('is-in');

      var dx = large.left - from.left;
      var dy = large.top - from.top;
      var motion = { p: 0 };
      var dur = CLOSE_MS / 1000;
      var ease = 'power3.inOut';
      introTween = gsap.to(motion, {
        p: 1,
        duration: dur,
        ease: ease,
        onUpdate: function () {
          var p = motion.p;
          gsap.set(veil, { yPercent: -110 * (1 - p), force3D: true });
          fly.style.fontSize = (from.fontSize + (largeSize - from.fontSize) * p) + 'px';
          gsap.set(fly, { x: dx * p, y: dy * p, force3D: true });
        },
        onComplete: function () {
          gsap.set(veil, { yPercent: 0, force3D: true });
          fly.style.fontSize = largeSize + 'px';
          gsap.set(fly, { x: dx, y: dy, force3D: true });
          introHold = window.setTimeout(function () {
            unpaintFlyName(function () {
              seatFly(true);
              revealHome();
              if (options.onClose) options.onClose();
              liftVeil(finishOut);
            });
          }, HOLD_MS);
        }
      });
      gsap.to(fly, { color: curtainInk(), duration: dur, ease: ease });
    }

    function open(index, trigger, pageId) {
      var project = projects[index];
      if (!project || !root || mode !== 'off') return;
      openIndex = index;
      mode = 'study';
      savedScroll = window.scrollY;
      pendingPage = (typeof pageId === 'string' && pageId) ? pageId : pageFromUrl();
      applyTemplate((project && project.studyTemplate) || template || 'original');
      syncHead();
      paintTitle(project.cardTitle || project.title || 'Project');
      caseMount = null;
      if (template === 'cbx300' && window.Cbx300Case) {
        caseMount = window.Cbx300Case.mount(root.querySelector('[data-world="cbx300"]'), project);
        var caseWorld = root.querySelector('[data-world="cbx300"]');
        var casePages = caseWorld ? caseWorld.querySelectorAll('[data-case-page]') : [];
        setTotal(casePages.length);
        setStep(0);
      }
      Array.prototype.forEach.call(root.querySelectorAll('[data-study-kicker]'), function (el) {
        el.textContent = pad(index + 1);
      });
      root.hidden = false;
      root.setAttribute('aria-hidden', 'false');
      html.classList.add('is-study-wipe');
      html.classList.remove('is-study');
      playIntro(function () {
        afterLayout(bindMotion);
      });
      if (options.onOpen) options.onOpen(index);
    }

    function finishClose() {
      killMotion();
      root.hidden = true;
      root.setAttribute('aria-hidden', 'true');
      html.classList.remove('is-study');
      html.classList.remove('is-study-wipe');
      mode = 'off';
      openIndex = -1;
      caseMount = null;
      pendingPage = '';
      if (nodes.project) nodes.project.classList.remove('is-in');
      seatFly();
      if (nodes.veil && typeof gsap !== 'undefined') {
        resetVeil(-110);
      }
      window.scrollTo(0, savedScroll);
    }

    function close() {
      if (mode !== 'study') return;
      mode = 'closing';
      playOutro(finishClose);
    }

    root.addEventListener('click', function (event) {
      var btn = event.target.closest('[data-study-close]');
      if (!btn || !root.contains(btn)) return;
      event.preventDefault();
      close();
    });

    Array.prototype.forEach.call(nodes.temps, function (btn) {
      btn.addEventListener('click', function () {
        var next = btn.getAttribute('data-template');
        if (!next || next === template) return;
        applyTemplate(next);
        paintTitle(currentTitle);
        window.scrollTo(0, 0);
        if (mode === 'study') afterLayout(bindMotion);
      });
    });
    var mark = root.querySelector('[data-study-mark]');
    if (mark) mark.addEventListener('click', function () { close(); });

    window.addEventListener('scroll', onScroll, { passive: true });
    root.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && mode === 'study') close();
    });
    window.addEventListener('resize', function () {
      if (mode !== 'study') return;
      syncHead();
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });

    return {
      open: open,
      close: close,
      isOpen: isOpen,
      goToSlide: function (index) {
        if (caseKit && caseKit.goTo) caseKit.goTo(index);
      },
      stepSlide: function (direction) {
        var i = (lastStep < 0 ? 0 : lastStep) + direction;
        if (caseKit && caseKit.goTo) caseKit.goTo(i);
      },
      slideCount: function () {
        if (caseKit && caseKit.pageCount) return caseKit.pageCount();
        return visibleScenes().length;
      }
    };
  }

  return { create: create };
})();
