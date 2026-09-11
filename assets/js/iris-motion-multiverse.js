(function (global) {
  "use strict";

  if (!global.document || !global.document.documentElement.classList.contains("is-multiverse")) {
    return;
  }

  var glitchTimers = [];
  var scriptTimers = new WeakMap();
  var SCRIPT_MAPS = {
    devanagari: { T: "ट", t: "ट", A: "अ", a: "अ", N: "न", n: "न", B: "ब", b: "ब", Q: "क", q: "क" },
    cyrillic: { A: "А", a: "а", B: "В", b: "в", E: "Е", e: "е", H: "Н", h: "н", P: "Р", p: "р", C: "С", c: "с", T: "Т", t: "т", X: "Х", x: "х" },
    greek: { A: "Α", a: "α", B: "Β", b: "β", E: "Ε", e: "ε", H: "Η", h: "η", I: "Ι", i: "ι", K: "Κ", k: "κ", M: "Μ", m: "μ", N: "Ν", n: "ν", O: "Ο", o: "ο", P: "Ρ", p: "ρ", T: "Τ", t: "τ", X: "Χ", x: "χ", Y: "Υ", y: "υ" },
    arabic: { T: "ت", t: "ت", B: "ب", b: "ب", N: "ن", n: "ن", A: "ا", a: "ا" },
    cjk: { T: "丁", t: "丁", I: "工", i: "工", O: "口", o: "口", X: "乂", x: "乂" }
  };
  var SCRIPT_ORDER = ["devanagari", "cyrillic", "greek", "arabic", "cjk"];
  var BURST_MS = 380;

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function shuffle(list) {
    var i;
    var j;
    var tmp;
    for (i = list.length - 1; i > 0; i -= 1) {
      j = Math.floor(Math.random() * (i + 1));
      tmp = list[i];
      list[i] = list[j];
      list[j] = tmp;
    }
    return list;
  }

  function visibleLatin(el) {
    var stored = el.getAttribute("data-latin");
    if (stored) return stored;
    var chars = el.querySelectorAll(".curtain__ch");
    if (chars.length) {
      return Array.prototype.map.call(chars, function (node) {
        return node.classList.contains("curtain__ch--space") ? " " : (node.textContent || "");
      }).join("");
    }
    return (el.getAttribute("data-text") || el.textContent || "").replace(/\s+/g, " ").trim() || el.textContent || "";
  }

  function paintGlitchText(el, text) {
    var chars = el.querySelectorAll(".curtain__ch");
    if (chars.length && chars.length === text.length) {
      for (var i = 0; i < chars.length; i += 1) {
        if (chars[i].classList.contains("curtain__ch--space")) continue;
        chars[i].textContent = text.charAt(i);
      }
      return;
    }
    if (!chars.length) el.textContent = text;
  }

  function glyphsFor(ch) {
    var options = [];
    var s;
    var glyph;
    var weight;
    var w;
    for (s = 0; s < SCRIPT_ORDER.length; s += 1) {
      glyph = SCRIPT_MAPS[SCRIPT_ORDER[s]][ch];
      if (!glyph) continue;
      weight = SCRIPT_ORDER[s] === "arabic" || SCRIPT_ORDER[s] === "cjk" ? 1 : 2;
      for (w = 0; w < weight; w += 1) options.push(glyph);
    }
    return options;
  }

  function pickGlyph(ch) {
    var options = glyphsFor(ch);
    if (!options.length) return null;
    return options[Math.floor(Math.random() * options.length)];
  }

  function mappableIndexes(src) {
    var out = [];
    var i;
    for (i = 0; i < src.length; i += 1) {
      if (src.charAt(i) === " ") continue;
      if (glyphsFor(src.charAt(i)).length) out.push(i);
    }
    return out;
  }

  function pickSwapCount(available, heavy) {
    var roll;
    if (available <= 1) return available;
    if (heavy) {
      return Math.min(available, Math.max(Math.ceil(available * 0.82), Math.min(available, 6)));
    }
    roll = Math.random();
    if (roll < 0.42) return 1;
    if (roll < 0.72) return Math.min(2, available);
    if (roll < 0.9) return Math.min(3, available);
    return Math.min(available, 5);
  }

  function trackTimer(el, id) {
    var pack = scriptTimers.get(el);
    if (!pack) {
      pack = { ids: [] };
      scriptTimers.set(el, pack);
    }
    pack.ids.push(id);
    return id;
  }

  function clearScriptFlash(el, latin) {
    var pack = scriptTimers.get(el);
    if (pack && pack.ids) {
      pack.ids.forEach(function (id) { window.clearTimeout(id); });
    }
    scriptTimers.delete(el);
    if (latin) {
      el.setAttribute("data-text", latin);
      paintGlitchText(el, latin);
    }
  }

  function commitLive(el, live) {
    var text = live.join("");
    el.setAttribute("data-text", text);
    paintGlitchText(el, text);
  }

  var slamming = false;

  function burstGlitch(el, reduceMotion, heavy) {
    if (!el || (reduceMotion && reduceMotion.matches)) return;
    var latin = visibleLatin(el);
    var slots = shuffle(mappableIndexes(latin));
    var count = pickSwapCount(slots.length, !!heavy);
    var chosen = slots.slice(0, count);
    var lastEnd = heavy ? 720 : BURST_MS;
    var live;
    var starts = [];
    var startSpan = heavy ? 80 : 160;
    var holdMin = heavy ? 120 : 50;
    var holdMax = heavy ? 280 : 190;
    var doubleChance = heavy ? 0.62 : 0.24;

    el.setAttribute("data-latin", latin);
    if (!el.getAttribute("aria-label")) el.setAttribute("aria-label", latin);
    clearScriptFlash(el, latin);
    live = latin.split("");

    el.classList.remove("is-glitching", "is-slam");
    void el.offsetWidth;
    el.classList.add("is-glitching");
    if (heavy) el.classList.add("is-slam");

    function scheduleSwap(index, startAt, hold) {
      var glyph = pickGlyph(latin.charAt(index));
      if (!glyph) return;
      trackTimer(el, window.setTimeout(function () {
        live[index] = glyph;
        commitLive(el, live);
      }, startAt));
      trackTimer(el, window.setTimeout(function () {
        live[index] = latin.charAt(index);
        commitLive(el, live);
      }, startAt + hold));
      lastEnd = Math.max(lastEnd, startAt + hold);
    }

    chosen.forEach(function (index) {
      var startAt = Math.round(rand(0, startSpan));
      var tries = 0;
      while (tries < 6 && starts.some(function (stamp) { return Math.abs(stamp - startAt) < 14; })) {
        startAt = Math.round(rand(0, startSpan + 30));
        tries += 1;
      }
      starts.push(startAt);
      var hold = Math.round(rand(holdMin, holdMax));
      scheduleSwap(index, startAt, hold);
      if (Math.random() < doubleChance) {
        var gap = Math.round(rand(18, 70));
        var again = Math.round(rand(heavy ? 80 : 45, heavy ? 180 : 140));
        scheduleSwap(index, startAt + hold + gap, again);
      }
    });

    if (heavy) {
      chosen.forEach(function (index) {
        var wave2 = Math.round(rand(220, 380));
        var hold2 = Math.round(rand(80, 190));
        scheduleSwap(index, wave2, hold2);
      });
    }

    trackTimer(el, window.setTimeout(function () {
      el.classList.remove("is-glitching", "is-slam");
      clearScriptFlash(el, latin);
    }, lastEnd + 40));
  }

  function burstHero(reduceMotion, heavy) {
    var shouts = document.querySelectorAll(".hero__kicker, .hero__accent, .hero__word");
    shouts.forEach(function (el) {
      window.setTimeout(function () {
        burstGlitch(el, reduceMotion, heavy);
      }, Math.round(rand(0, heavy ? 90 : 240)));
    });
  }

  function burstNav(reduceMotion, heavy) {
    var links = document.querySelectorAll(".masthead__nav-label.glitch");
    links.forEach(function (el) {
      window.setTimeout(function () {
        burstGlitch(el, reduceMotion, heavy);
      }, Math.round(rand(heavy ? 40 : 90, heavy ? 220 : 480)));
    });
  }

  function workCtaHandle() {
    return document.querySelector("[data-work-cta]");
  }

  function workCtaLabel() {
    var handle = workCtaHandle();
    return handle ? handle.querySelector(".work-cta__label") : null;
  }

  function burstWorkCta(reduceMotion, heavy) {
    var htmlEl = document.documentElement;
    var handle = workCtaHandle();
    var label = workCtaLabel();
    if (!handle || !label) return;
    if (
      htmlEl.classList.contains("is-curtain") ||
      htmlEl.classList.contains("is-projects-in") ||
      htmlEl.classList.contains("is-study")
    ) {
      return;
    }
    armGlitchTarget(label, visibleLatin(label) || "My Work");
    handle.classList.add("is-glitching");
    window.setTimeout(function () {
      burstGlitch(label, reduceMotion, heavy);
    }, Math.round(rand(heavy ? 40 : 80, heavy ? 180 : 360)));
    window.setTimeout(function () {
      handle.classList.remove("is-glitching");
    }, heavy ? 780 : 420);
  }

  function hitchSlam(reduceMotion) {
    if (reduceMotion && reduceMotion.matches) return;
    var htmlEl = document.documentElement;
    var curtain = document.getElementById("curtain");
    htmlEl.classList.add("is-slam-hitch");
    window.setTimeout(function () {
      htmlEl.classList.remove("is-slam-hitch");
    }, 720);
    if (curtain && htmlEl.classList.contains("is-curtain") && !curtain.classList.contains("is-done")) {
      hitchCurtain(curtain, reduceMotion);
    }
  }

  function burstBig(reduceMotion) {
    if (reduceMotion && reduceMotion.matches) return;
    var htmlEl = document.documentElement;
    var curtain = document.getElementById("curtain");
    var curtainUp = htmlEl.classList.contains("is-curtain") && curtain && !curtain.classList.contains("is-done");
    var mark;
    var logo;
    slamming = true;
    hitchSlam(reduceMotion);
    if (curtainUp) {
      mark = document.querySelector(".curtain__mark.glitch");
      if (mark) burstGlitch(mark, reduceMotion, true);
    } else {
      burstHero(reduceMotion, true);
      burstNav(reduceMotion, true);
      burstWorkCta(reduceMotion, true);
      logo = document.querySelector(".masthead__name.glitch");
      if (logo) {
        window.setTimeout(function () { burstGlitch(logo, reduceMotion, true); }, Math.round(rand(30, 140)));
      }
    }
    window.setTimeout(function () { slamming = false; }, 1100);
  }

  function startGlitchLoop(reduceMotion) {
    glitchTimers.forEach(function (id) { window.clearTimeout(id); });
    glitchTimers = [];
    if (reduceMotion && reduceMotion.matches) return;

    function cycle() {
      if (!slamming) {
        var logo = document.querySelector(".masthead__name.glitch");
        burstHero(reduceMotion);
        burstNav(reduceMotion);
        window.setTimeout(function () { burstWorkCta(reduceMotion); }, Math.round(rand(180, 640)));
        if (logo) {
          window.setTimeout(function () { burstGlitch(logo, reduceMotion); }, Math.round(rand(120, 520)));
        }
      }
      /* Landing header / masthead idle glitch cadence ~15s */
      var wait = Math.round(rand(13000, 17000));
      glitchTimers.push(window.setTimeout(cycle, wait));
    }

    function slamCycle() {
      burstBig(reduceMotion);
      glitchTimers.push(window.setTimeout(slamCycle, Math.round(rand(28000, 34000))));
    }

    glitchTimers.push(window.setTimeout(cycle, 3200));
    glitchTimers.push(window.setTimeout(slamCycle, Math.round(rand(28000, 34000))));
  }

  function hitchCurtain(curtain, reduceMotion) {
    if (!curtain || (reduceMotion && reduceMotion.matches)) return;
    curtain.classList.add("is-hitching");
    window.setTimeout(function () {
      curtain.classList.remove("is-hitching");
    }, 900);
  }

  function revealLanding(html, reduceMotion) {
    var navBits = document.querySelectorAll(".masthead__nav li");
    var heroBits = document.querySelectorAll(".hero__role, .hero__kicker, .hero__accent, .hero__word, .hero__support");
    var extra = document.querySelectorAll(".reveal");
    document.body.classList.add("is-ready");
    html.classList.add("is-gsap");

    var all = [];
    navBits.forEach(function (el) { all.push(el); });
    heroBits.forEach(function (el) { all.push(el); });
    extra.forEach(function (el) {
      el.classList.add("is-revealed");
      if (all.indexOf(el) === -1) all.push(el);
    });

    function afterReveal() {
      burstHero(reduceMotion);
      startGlitchLoop(reduceMotion);
    }

    if (reduceMotion.matches) {
      all.forEach(function (el) {
        el.style.opacity = "1";
        el.style.visibility = "visible";
        el.style.transform = "none";
      });
      return;
    }

    if (typeof gsap !== "undefined") {
      gsap.set(all, {
        opacity: 0,
        y: function (i) { return i < navBits.length ? -18 : 40; },
        force3D: true
      });
      gsap.to(all, {
        opacity: 1,
        y: 0,
        duration: 1.15,
        stagger: 0.08,
        ease: "power3.out",
        overwrite: true,
        onComplete: afterReveal
      });
      return;
    }

    all.forEach(function (el, i) {
      el.style.opacity = "0";
      el.style.visibility = "visible";
      el.style.transform = "translateY(" + (i < navBits.length ? -18 : 40) + "px)";
      if (el.animate) {
        el.animate(
          [{ opacity: 0, transform: el.style.transform }, { opacity: 1, transform: "translateY(0px)" }],
          { duration: 1100, delay: 40 + i * 80, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" }
        );
      } else {
        el.style.transition = "opacity 1.1s ease, transform 1.1s ease";
        setTimeout(function () {
          el.style.opacity = "1";
          el.style.transform = "none";
        }, 40 + i * 80);
      }
    });
    window.setTimeout(afterReveal, 900);
  }

  /**
   * Constellation web — same structure/behavior as production iris-motion.js.
   * Night tints cream on ink; print/light uses production coffee mesh + teal glow.
   */
  function wireParticles(reduceMotion) {
    var canvas = document.querySelector("[data-particles]");
    if (!canvas || reduceMotion.matches) return;
    var ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
    if (!ctx) return;
    var finePointer = window.matchMedia("(pointer: fine)").matches;

    var dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    var w = 0;
    var h = 0;
    var mx = -9999;
    var my = -9999;
    var smx = -9999;
    var smy = -9999;
    var nodes = [];
    var LINK = 150;
    var LINK_BREAK = 190;
    var HOVER_GLOW = 185;
    var CLUSTER_GLOW = 86;
    var MAX_DEG = 4;
    var MIN_ANGLE = 0.55;
    var liveLinks = {};
    var cellSize = 120;
    var raf = 0;
    var running = false;
    var hitchBorn = 0;
    var hitchUntil = 0;
    var hitchTimers = [];
    var clusterWant = 2;
    var clusters = [];
    var proposed = {};
    var graphClock = 0;
    var tintDark = false;
    var RED = [255, 24, 72];
    var BLUE = [48, 140, 255];
    var PINK = [255, 78, 168];
    var TEAL = [0, 160, 160];

    function rgba(c, a) {
      return "rgba(" + Math.round(c[0]) + ", " + Math.round(c[1]) + ", " + Math.round(c[2]) + ", " + a + ")";
    }

    function smooth(v) {
      if (v <= 0) return 0;
      if (v >= 1) return 1;
      return v * v * (3 - 2 * v);
    }

    function fract(v) {
      return v - Math.floor(v);
    }

    function hash(n) {
      return fract(Math.sin(n * 127.1) * 43758.5453);
    }

    function hitchLevel() {
      var now = performance.now();
      if (now >= hitchUntil || now < hitchBorn) return 0;
      var local = (now - hitchBorn) / Math.max(1, hitchUntil - hitchBorn);
      if (local < 0.16) return 0.95;
      if (local < 0.4) return 0.22;
      if (local < 0.68) return 1;
      return 0.38;
    }

    function nodePos(node) {
      if (!node) return { x: 0, y: 0 };
      return {
        x: node.gx != null ? node.gx : node.x,
        y: node.gy != null ? node.gy : node.y
      };
    }

    function distNodes(i, j) {
      var a = nodePos(nodes[i]);
      var b = nodePos(nodes[j]);
      var dx = a.x - b.x;
      var dy = a.y - b.y;
      return Math.sqrt(dx * dx + dy * dy);
    }

    function pickHub(avoidHubs) {
      if (!nodes.length) return 0;
      var minSep = Math.min(w, h) * 0.38;
      var best = Math.floor(Math.random() * nodes.length);
      var bestScore = -1;
      var tries = Math.min(28, nodes.length);
      var t;
      var idx;
      var n;
      var d;
      var score;
      var ok;
      for (t = 0; t < tries; t++) {
        idx = Math.floor(Math.random() * nodes.length);
        score = 1;
        ok = true;
        for (n = 0; n < avoidHubs.length; n++) {
          if (avoidHubs[n] === idx) {
            ok = false;
            break;
          }
          d = distNodes(idx, avoidHubs[n]);
          if (d < minSep * 0.55) {
            ok = false;
            break;
          }
          score = Math.min(score, d / minSep);
        }
        if (!ok) continue;
        if (score > bestScore) {
          bestScore = score;
          best = idx;
        }
      }
      return best;
    }

    function clusterNodes(hub, avoidHubs) {
      var near = [];
      var i;
      var d;
      var used = {};
      var n;
      for (n = 0; n < avoidHubs.length; n++) used[avoidHubs[n]] = true;
      for (i = 0; i < nodes.length; i++) {
        if (i === hub || used[i]) continue;
        d = distNodes(hub, i);
        if (d > 8 && d < LINK * 2.1) near.push({ i: i, d: d });
      }
      near.sort(function (a, b) { return a.d - b.d; });
      var take = 4 + Math.floor(Math.random() * 3);
      var ids = [hub];
      for (i = 0; i < near.length && ids.length < take + 1; i++) {
        ids.push(near[i].i);
      }
      return ids;
    }

    function makeCluster(tNow, avoidHubs, staggered) {
      var hub = pickHub(avoidHubs);
      var ids = clusterNodes(hub, avoidHubs);
      var n;
      for (n = 0; n < ids.length; n++) avoidHubs.push(ids[n]);
      return {
        ids: ids,
        born: staggered ? tNow - rand(0, 1.8) : tNow,
        life: rand(4.6, 7.4)
      };
    }

    function seedEmbers(tNow) {
      clusters = [];
      clusterWant = Math.random() < 0.55 ? 2 : 3;
      var avoid = [];
      var n;
      for (n = 0; n < clusterWant; n++) {
        clusters.push(makeCluster(tNow, avoid, true));
      }
    }

    function stepEmbers(tNow) {
      if (!nodes.length) {
        clusters = [];
        return;
      }
      var n;
      var c;
      var live;
      var avoid;
      var m;
      for (n = 0; n < clusters.length; n++) {
        c = clusters[n];
        if (!c || !c.ids || !nodes[c.ids[0]] || tNow - c.born >= c.life) {
          avoid = [];
          for (live = 0; live < clusters.length; live++) {
            if (live === n || !clusters[live] || !clusters[live].ids) continue;
            for (m = 0; m < clusters[live].ids.length; m++) {
              if (nodes[clusters[live].ids[m]]) avoid.push(clusters[live].ids[m]);
            }
          }
          clusters[n] = makeCluster(tNow, avoid, false);
        }
      }
      while (clusters.length < clusterWant) {
        avoid = [];
        for (n = 0; n < clusters.length; n++) {
          for (m = 0; m < clusters[n].ids.length; m++) avoid.push(clusters[n].ids[m]);
        }
        clusters.push(makeCluster(tNow, avoid, false));
      }
      if (clusters.length > clusterWant) clusters.length = clusterWant;
    }

    function clusterField(x, y, tNow) {
      var g = 0;
      var n;
      var m;
      var c;
      var node;
      var pos;
      var amp;
      var local;
      var dxp;
      var dyp;
      var inf;
      for (n = 0; n < clusters.length; n++) {
        c = clusters[n];
        local = (tNow - c.born) / c.life;
        amp = Math.sin(Math.max(0, Math.min(1, local)) * Math.PI);
        if (amp < 0.04) continue;
        for (m = 0; m < c.ids.length; m++) {
          node = nodes[c.ids[m]];
          if (!node) continue;
          pos = nodePos(node);
          dxp = x - pos.x;
          dyp = y - pos.y;
          inf = amp * Math.max(0, 1 - Math.sqrt(dxp * dxp + dyp * dyp) / CLUSTER_GLOW);
          if (inf > g) g = inf;
        }
      }
      return g;
    }

    function hoverField(x, y) {
      return Math.max(0, 1 - dist2cursor(x, y) / HOVER_GLOW);
    }

    function collectProposed() {
      var next = {};
      var deg = [];
      var angles = [];
      var grid = {};
      var s = Math.max(48, LINK);
      var i;
      var j;
      var a;
      var b;
      var k;
      var ox;
      var oy;
      var cx;
      var cy;
      var key;
      var cell;
      var dx;
      var dy;
      var dist;
      for (i = 0; i < nodes.length; i++) {
        deg[i] = 0;
        angles[i] = [];
        cx = Math.floor(nodes[i].x / s);
        cy = Math.floor(nodes[i].y / s);
        key = cx + ":" + cy;
        if (!grid[key]) grid[key] = [];
        grid[key].push(i);
      }
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        cx = Math.floor(a.x / s);
        cy = Math.floor(a.y / s);
        var candidates = [];
        for (ox = -1; ox <= 1; ox++) {
          for (oy = -1; oy <= 1; oy++) {
            cell = grid[(cx + ox) + ":" + (cy + oy)];
            if (!cell) continue;
            for (k = 0; k < cell.length; k++) {
              j = cell[k];
              if (j === i) continue;
              b = nodes[j];
              dx = b.x - a.x;
              dy = b.y - a.y;
              dist = Math.sqrt(dx * dx + dy * dy);
              if (dist <= LINK && dist > 8) {
                candidates.push({ j: j, d: dist, ang: Math.atan2(dy, dx) });
              }
            }
          }
        }
        candidates.sort(function (u, v) { return u.d - v.d; });
        for (k = 0; k < candidates.length; k++) {
          if (deg[i] >= MAX_DEG) break;
          var cand = candidates[k];
          var nb = cand.j;
          if (deg[nb] >= MAX_DEG) continue;
          var ok = true;
          for (var ai = 0; ai < angles[i].length; ai++) {
            var dAng = Math.abs(cand.ang - angles[i][ai]);
            if (dAng > Math.PI) dAng = Math.PI * 2 - dAng;
            if (dAng < MIN_ANGLE) { ok = false; break; }
          }
          if (!ok) continue;
          var lo = i < nb ? i : nb;
          var hi = i < nb ? nb : i;
          var pkey = lo + ":" + hi;
          if (next[pkey]) continue;
          next[pkey] = true;
          deg[i] += 1;
          deg[nb] += 1;
          angles[i].push(cand.ang);
          angles[nb].push(cand.ang + (cand.ang > 0 ? -Math.PI : Math.PI));
        }
      }
      return next;
    }

    function strokeLink(ax, ay, cx, cy, bx, by) {
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.quadraticCurveTo(cx, cy, bx, by);
      ctx.stroke();
    }

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.shadowBlur = 0;
    }

    function spawn() {
      nodes = [];
      liveLinks = {};
      var cols = Math.max(finePointer ? 8 : 5, Math.round(w / (finePointer ? 96 : 124)));
      var rows = Math.max(finePointer ? 7 : 5, Math.round(h / (finePointer ? 88 : 112)));
      var cellW = w / cols;
      var cellH = h / rows;
      var i;
      var j;
      function addNode(x, y, col, row) {
        var px = Math.max(12, Math.min(w - 12, x));
        var py = Math.max(12, Math.min(h - 12, y));
        nodes.push({
          x: px,
          y: py,
          ox: px,
          oy: py,
          r: 1.15 + Math.random() * 1.1,
          phase: Math.random() * Math.PI * 2,
          ampX: 7 + Math.random() * 8,
          ampY: 6 + Math.random() * 7,
          spX: 0.22 + Math.random() * 0.12,
          spY: 0.18 + Math.random() * 0.12,
          col: col,
          row: row
        });
      }
      for (j = 0; j < rows; j++) {
        for (i = 0; i < cols; i++) {
          if (Math.random() < 0.2) continue;
          addNode(
            (i + Math.random()) * cellW,
            (j + Math.random()) * cellH,
            i,
            j
          );
        }
      }
      var extra = Math.round((cols * rows) * 0.08);
      for (i = 0; i < extra; i++) {
        addNode(Math.random() * w, Math.random() * h, -1, -1);
      }
      cellSize = Math.max(cellW, cellH);
      LINK = cellSize * 1.35;
      LINK_BREAK = cellSize * 1.75;
      liveLinks = {};
      seedEmbers((performance.now() || 0) * 0.001);
    }

    function dist2cursor(x, y) {
      if (smx < -1000) return 9999;
      var dx = smx - x;
      var dy = smy - y;
      return Math.sqrt(dx * dx + dy * dy);
    }

    function tick(now) {
      var tNow = (now || 0) * 0.001;
      if ((graphClock & 15) === 0) {
        tintDark = document.documentElement.classList.contains("is-dark");
      }
      var tint = tintDark ? [244, 239, 230] : [120, 88, 62];
      if (mx > -1000) {
        if (smx < -1000) { smx = mx; smy = my; }
        else {
          smx += (mx - smx) * 0.12;
          smy += (my - smy) * 0.12;
        }
      } else if (smx > -1000) {
        smx += (-9999 - smx) * 0.06;
        smy += (-9999 - smy) * 0.06;
      }
      var hitch = hitchLevel();
      var snap = hitch > 0 ? Math.floor(tNow * 22) : 0;
      if (hitch > 0.55) {
        ctx.setTransform(dpr, 0, 0, dpr, (hash(snap * 0.71) > 0.5 ? 3.6 : -3.6) * dpr, 0);
      } else {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      ctx.clearRect(0, 0, w, h);

      var i;
      var j;
      var a;
      var b;
      var dx;
      var dy;
      var dist;
      var t;
      var glow;
      var md;
      var k;

      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        var wx = Math.sin(tNow * a.spX + a.phase) * a.ampX
          + Math.sin(tNow * 0.09 + a.row * 0.21) * 4.2;
        var wy = Math.cos(tNow * a.spY + a.phase * 1.17) * a.ampY
          + Math.cos(tNow * 0.075 + a.col * 0.17) * 3.8;
        var tx = a.ox + wx;
        var ty = a.oy + wy;
        var pdx = mx - tx;
        var pdy = my - ty;
        var pd = Math.sqrt(pdx * pdx + pdy * pdy) || 1;
        if (pd < 220) {
          var pull = (1 - pd / 220) * 10;
          tx += (pdx / pd) * pull;
          ty += (pdy / pd) * pull;
        }
        a.x += (tx - a.x) * 0.045;
        a.y += (ty - a.y) * 0.045;
        if (a.x < 8) a.x = 8;
        if (a.x > w - 8) a.x = w - 8;
        if (a.y < 8) a.y = 8;
        if (a.y > h - 8) a.y = h - 8;
        if (hitch > 0) {
          var jitter = hitch * 13;
          a.gx = a.x + (hash(i * 3.17 + snap) - 0.5) * jitter * 1.5;
          a.gy = a.y + (hash(i * 8.91 + snap * 1.7) - 0.5) * jitter;
          if (hitch > 0.72 && hash(i * 0.9 + snap) > 0.8) {
            a.gx += hash(snap + i) > 0.5 ? 9 : -9;
          }
        } else {
          a.gx = a.x;
          a.gy = a.y;
        }
      }

      stepEmbers(tNow);

      if (hitch > 0.18) {
        var bandY = h * hash(Math.floor(tNow * 2.5) + 4.2);
        var bandH = 14 + hitch * 56;
        for (i = 0; i < nodes.length; i++) {
          a = nodes[i];
          if (a.gy > bandY && a.gy < bandY + bandH) {
            a.gx += (hash(snap + 11) > 0.5 ? 1 : -1) * (7 + hitch * 11);
          }
        }
      }

      if ((graphClock++ & 1) === 0) proposed = collectProposed();

      var glowN = [];
      var hoverN = [];
      for (i = 0; i < nodes.length; i++) {
        glowN[i] = clusterField(nodes[i].gx, nodes[i].gy, tNow);
        hoverN[i] = hoverField(nodes[i].gx, nodes[i].gy);
      }

      var linkKeys = Object.keys(liveLinks);
      for (k = 0; k < linkKeys.length; k++) {
        var lk = linkKeys[k];
        if (proposed[lk]) {
          liveLinks[lk] = Math.min(1, liveLinks[lk] + 0.02);
        } else {
          var parts0 = lk.split(":");
          a = nodes[+parts0[0]];
          b = nodes[+parts0[1]];
          if (!a || !b) { delete liveLinks[lk]; continue; }
          dx = a.x - b.x;
          dy = a.y - b.y;
          dist = Math.sqrt(dx * dx + dy * dy);
          var fade = dist > LINK_BREAK ? 0.03 : 0.012;
          liveLinks[lk] -= fade;
          if (liveLinks[lk] <= 0) delete liveLinks[lk];
        }
      }
      var propKeys = Object.keys(proposed);
      for (k = 0; k < propKeys.length; k++) {
        if (liveLinks[propKeys[k]] == null) liveLinks[propKeys[k]] = 0.06;
      }

      ctx.globalCompositeOperation = "source-over";
      linkKeys = Object.keys(liveLinks);
      for (k = 0; k < linkKeys.length; k++) {
        var parts = linkKeys[k].split(":");
        i = +parts[0];
        j = +parts[1];
        a = nodes[i];
        b = nodes[j];
        if (!a || !b) continue;
        if (hitch > 0.2 && hash(i * 13.1 + j * 7.7 + snap) < hitch * 0.34) continue;
        var ax = a.gx;
        var ay = a.gy;
        var bx = b.gx;
        var by = b.gy;
        dx = ax - bx;
        dy = ay - by;
        dist = Math.sqrt(dx * dx + dy * dy) || 1;
        var strength = liveLinks[linkKeys[k]];
        t = Math.max(0, 1 - dist / Math.max(LINK_BREAK, dist)) * strength;

        var nx = -dy / dist;
        var ny = dx / dist;
        var bow = Math.sin(tNow * 0.26 + i * 0.31 + j * 0.19) * 3.2 * strength;
        var hitchJ = 0;
        var hitchK = 0;
        if (hitch > 0.12) {
          hitchJ = (hash(i * 2.17 + j * 5.31 + snap) - 0.5) * hitch * 18;
          hitchK = (hash(i * 7.91 + j * 1.43 + snap * 1.3) - 0.5) * hitch * 12;
          if (hitch > 0.55 && hash(i * 0.41 + j * 3.2 + snap) > 0.58) {
            hitchJ += hash(snap + i) > 0.5 ? 9 : -9;
          }
        }
        var cx = (ax + bx) * 0.5 + nx * bow + hitchJ;
        var cy = (ay + by) * 0.5 + ny * bow + hitchK;
        var ga = glowN[i] || 0;
        var gb = glowN[j] || 0;
        var lg = ga > 0.04 && gb > 0.04 ? Math.max(ga, gb) : Math.max(ga, gb) * 0.3;
        var hg = Math.max(hoverN[i] || 0, hoverN[j] || 0);

        if (lg > 0.05) {
          var rgb = 4.4 + lg * 5.2;
          ctx.globalCompositeOperation = "lighter";
          ctx.strokeStyle = rgba(RED, (0.18 + t * 0.05 + lg * 0.5) * strength);
          ctx.lineWidth = 1.15 + t * 0.22 + lg * 1.4;
          strokeLink(ax - rgb, ay, cx - rgb, cy, bx - rgb, by);
          ctx.strokeStyle = rgba(BLUE, (0.18 + t * 0.05 + lg * 0.5) * strength);
          strokeLink(ax + rgb, ay, cx + rgb, cy, bx + rgb, by);
          ctx.strokeStyle = rgba(PINK, (0.14 + t * 0.04 + lg * 0.38) * strength);
          ctx.lineWidth = 0.75 + t * 0.18 + lg * 1;
          strokeLink(ax, ay + 1.2, cx, cy + 1.2, bx, by + 1.2);
          ctx.globalCompositeOperation = "source-over";
        } else if (hg > 0.06) {
          ctx.strokeStyle = rgba(TEAL, (0.06 + t * 0.04 + hg * 0.28) * strength);
          ctx.lineWidth = 0.7 + t * 0.18 + hg * 0.85;
          strokeLink(ax, ay, cx, cy, bx, by);
        } else {
          ctx.strokeStyle = rgba(tint, (0.028 + t * 0.03) * strength);
          ctx.lineWidth = 0.55 + t * 0.16;
          strokeLink(ax, ay, cx, cy, bx, by);
        }

        if (hitch > 0.12 && lg > 0.05) {
          var split = 1.8 + hitch * 7.4;
          ctx.globalCompositeOperation = "lighter";
          ctx.strokeStyle = rgba(RED, (0.07 + hitch * 0.24) * strength);
          ctx.lineWidth = 1.4 + hitch * 2.2;
          strokeLink(ax - split, ay, cx - split, cy, bx - split, by);
          ctx.strokeStyle = rgba(BLUE, (0.07 + hitch * 0.24) * strength);
          strokeLink(ax + split, ay, cx + split, cy, bx + split, by);
          ctx.globalCompositeOperation = "source-over";
        }
      }

      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        glow = glowN[i] || 0;
        md = hoverN[i] || 0;
        if (glow > 0.05) {
          var nSplit = 3.6 + glow * 4.8;
          ctx.globalCompositeOperation = "lighter";
          ctx.fillStyle = rgba(RED, 0.55 + glow * 0.4);
          ctx.beginPath();
          ctx.arc(a.gx - nSplit, a.gy, a.r * 1.12 + glow * 1.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = rgba(BLUE, 0.55 + glow * 0.4);
          ctx.beginPath();
          ctx.arc(a.gx + nSplit, a.gy, a.r * 1.12 + glow * 1.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = rgba(PINK, 0.62 + glow * 0.3);
          ctx.beginPath();
          ctx.arc(a.gx, a.gy + 1.4, a.r * 1.02 + glow * 1.35, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalCompositeOperation = "source-over";
        } else if (md > 0.05) {
          ctx.fillStyle = rgba(TEAL, 0.58 + md * 0.28);
          ctx.beginPath();
          ctx.arc(a.gx, a.gy, a.r * 1.06 + md * 1.35, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = rgba(tint, 0.10);
          ctx.beginPath();
          ctx.arc(a.gx, a.gy, a.r * 1.08, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (running) raf = requestAnimationFrame(tick);
    }

    function play() {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    }

    function pause() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    function fireHitch(heavy) {
      hitchBorn = performance.now();
      hitchUntil = hitchBorn + (heavy ? 720 : BURST_MS);
    }

    function armHitchCycle(first) {
      var wait = first
        ? 3200 + Math.round(rand(1400, 3600))
        : Math.round(rand(13000, 17000));
      hitchTimers.push(window.setTimeout(function () {
        if (!document.hidden) fireHitch(false);
        armHitchCycle(false);
      }, wait));
    }

    function armHitchSlam(first) {
      var wait = first
        ? Math.round(rand(28000, 34000)) + Math.round(rand(4000, 10000))
        : Math.round(rand(28000, 34000));
      hitchTimers.push(window.setTimeout(function () {
        if (!document.hidden) fireHitch(true);
        armHitchSlam(false);
      }, wait));
    }

    if (finePointer) {
      window.addEventListener("pointermove", function (e) {
        mx = e.clientX;
        my = e.clientY;
      }, { passive: true });
      window.addEventListener("pointerleave", function () {
        mx = -9999;
        my = -9999;
      });
    }
    window.addEventListener("resize", function () {
      resize();
      spawn();
    });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) pause();
      else play();
    });
    resize();
    spawn();
    armHitchCycle(true);
    armHitchSlam(true);
    play();
  }

  var NAME_SEQUENCE = ["Tanishk Bafnaa", "Tanish Bafna", "Tanishq Bafna"];
  var FINAL_NAME = "Tanishq Bafna";
  var NAME_BEAT_MS = 2000;

  function armGlitchTarget(el, latin) {
    if (!el) return;
    var text = latin || visibleLatin(el) || FINAL_NAME;
    el.classList.add("glitch");
    el.setAttribute("data-text", text);
    el.setAttribute("data-latin", text);
    if (!el.getAttribute("aria-label")) el.setAttribute("aria-label", text);
  }

  function ensureStudyHitch(veil) {
    if (!veil) return null;
    var hitch = veil.querySelector(".study__veil-hitch");
    if (hitch) return hitch;
    hitch = document.createElement("div");
    hitch.className = "study__veil-hitch";
    hitch.setAttribute("aria-hidden", "true");
    veil.insertBefore(hitch, veil.firstChild);
    return hitch;
  }

  var studyPulseAt = 0;
  function pulseStudyCurtain(veil, fly, reduceMotion, phase) {
    var kind = phase || "both";
    studyPulseAt = Date.now();
    if (reduceMotion && reduceMotion.matches) return;
    if (veil && (kind === "plate" || kind === "both")) {
      ensureStudyHitch(veil);
      hitchCurtain(veil, reduceMotion);
    }
    if (fly && (kind === "name" || kind === "both")) {
      var latin = visibleLatin(fly) || (fly.textContent || "").replace(/\s+/g, " ").trim();
      if (latin) armGlitchTarget(fly, latin);
      burstGlitch(fly, reduceMotion, true);
    }
  }

  global.IrisMotion = {
    revealLanding: revealLanding,
    wireParticles: wireParticles,
    burstGlitch: burstGlitch,
    burstWorkCta: burstWorkCta,
    burstBig: burstBig,
    hitchCurtain: hitchCurtain,
    startGlitchLoop: startGlitchLoop,
    armGlitchTarget: armGlitchTarget,
    ensureStudyHitch: ensureStudyHitch,
    pulseStudyCurtain: pulseStudyCurtain,
    studyPulseAt: function () { return studyPulseAt; },
    NAME_SEQUENCE: NAME_SEQUENCE,
    FINAL_NAME: FINAL_NAME,
    NAME_BEAT_MS: NAME_BEAT_MS
  };
})(window);
