(function (global) {
  "use strict";

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
  var BURST_MS = 450;

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

  function pickSwapCount(available) {
    var roll;
    if (available <= 1) return available;
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

  function burstGlitch(el, reduceMotion) {
    if (!el || (reduceMotion && reduceMotion.matches)) return;
    var latin = visibleLatin(el);
    var slots = shuffle(mappableIndexes(latin));
    var count = pickSwapCount(slots.length);
    var chosen = slots.slice(0, count);
    var lastEnd = BURST_MS;
    var live;
    var starts = [];

    el.setAttribute("data-latin", latin);
    if (!el.getAttribute("aria-label")) el.setAttribute("aria-label", latin);
    clearScriptFlash(el, latin);
    live = latin.split("");

    el.classList.remove("is-glitching");
    void el.offsetWidth;
    el.classList.add("is-glitching");

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
      var startAt = Math.round(rand(0, 180));
      var tries = 0;
      while (tries < 6 && starts.some(function (stamp) { return Math.abs(stamp - startAt) < 14; })) {
        startAt = Math.round(rand(0, 210));
        tries += 1;
      }
      starts.push(startAt);
      var hold = Math.round(rand(55, 230));
      scheduleSwap(index, startAt, hold);
      if (Math.random() < 0.28) {
        var gap = Math.round(rand(18, 70));
        var again = Math.round(rand(45, 140));
        scheduleSwap(index, startAt + hold + gap, again);
      }
    });

    trackTimer(el, window.setTimeout(function () {
      el.classList.remove("is-glitching");
      clearScriptFlash(el, latin);
    }, lastEnd + 40));
  }

  function burstHero(reduceMotion) {
    var shouts = document.querySelectorAll(".hero__kicker, .hero__accent, .hero__word");
    shouts.forEach(function (el) {
      window.setTimeout(function () {
        burstGlitch(el, reduceMotion);
      }, Math.round(rand(0, 240)));
    });
  }

  function startGlitchLoop(reduceMotion) {
    glitchTimers.forEach(function (id) { window.clearTimeout(id); });
    glitchTimers = [];
    if (reduceMotion && reduceMotion.matches) return;

    function cycle() {
      var logo = document.querySelector(".masthead__name.glitch");
      burstHero(reduceMotion);
      if (logo) {
        window.setTimeout(function () { burstGlitch(logo, reduceMotion); }, Math.round(rand(120, 520)));
      }
      var wait = Math.round(rand(7000, 14000));
      glitchTimers.push(window.setTimeout(cycle, wait));
    }

    glitchTimers.push(window.setTimeout(cycle, 3200));
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
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    var finePointer = window.matchMedia("(pointer: fine)").matches;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0;
    var h = 0;
    var mx = -9999;
    var my = -9999;
    var nodes = [];
    var LINK = 150;
    var LINK_BREAK = 190;
    var GLOW = 185;
    var MAX_DEG = 4;
    var MIN_ANGLE = 0.55;
    var liveLinks = {};
    var cellSize = 120;

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawn() {
      nodes = [];
      liveLinks = {};
      var cols = Math.max(finePointer ? 9 : 6, Math.round(w / (finePointer ? 82 : 108)));
      var rows = Math.max(finePointer ? 8 : 6, Math.round(h / (finePointer ? 74 : 96)));
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
          if (Math.random() < 0.14) continue;
          addNode(
            (i + Math.random()) * cellW,
            (j + Math.random()) * cellH,
            i,
            j
          );
        }
      }
      var extra = Math.round((cols * rows) * 0.12);
      for (i = 0; i < extra; i++) {
        addNode(Math.random() * w, Math.random() * h, -1, -1);
      }
      cellSize = Math.max(cellW, cellH);
      LINK = cellSize * 1.35;
      LINK_BREAK = cellSize * 1.75;
      liveLinks = {};
    }

    function dist2cursor(x, y) {
      if (mx < -1000) return 9999;
      var dx = mx - x;
      var dy = my - y;
      return Math.sqrt(dx * dx + dy * dy);
    }

    function tick(now) {
      var tNow = (now || 0) * 0.001;
      var tint = document.documentElement.classList.contains('is-dark')
        ? [244, 239, 230]
        : [120, 88, 62];
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
      }

      var deg = [];
      var angles = [];
      for (i = 0; i < nodes.length; i++) {
        deg[i] = 0;
        angles[i] = [];
      }
      var proposed = {};
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        var candidates = [];
        for (j = 0; j < nodes.length; j++) {
          if (j === i) continue;
          b = nodes[j];
          dx = b.x - a.x;
          dy = b.y - a.y;
          dist = Math.sqrt(dx * dx + dy * dy);
          if (dist <= LINK && dist > 8) {
            candidates.push({ j: j, d: dist, ang: Math.atan2(dy, dx) });
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
          if (proposed[pkey]) continue;
          proposed[pkey] = true;
          deg[i] += 1;
          deg[nb] += 1;
          angles[i].push(cand.ang);
          angles[nb].push(cand.ang + (cand.ang > 0 ? -Math.PI : Math.PI));
        }
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

      linkKeys = Object.keys(liveLinks);
      for (k = 0; k < linkKeys.length; k++) {
        var parts = linkKeys[k].split(":");
        i = +parts[0];
        j = +parts[1];
        a = nodes[i];
        b = nodes[j];
        if (!a || !b) continue;
        dx = a.x - b.x;
        dy = a.y - b.y;
        dist = Math.sqrt(dx * dx + dy * dy) || 1;
        var strength = liveLinks[linkKeys[k]];
        t = Math.max(0, 1 - dist / Math.max(LINK_BREAK, dist)) * strength;

        var nx = -dy / dist;
        var ny = dx / dist;
        var bow = Math.sin(tNow * 0.26 + i * 0.31 + j * 0.19) * 3.2 * strength;
        var cx = (a.x + b.x) * 0.5 + nx * bow;
        var cy = (a.y + b.y) * 0.5 + ny * bow;
        var lg = Math.max(0, 1 - dist2cursor(cx, cy) / GLOW);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.quadraticCurveTo(cx, cy, b.x, b.y);
        ctx.shadowBlur = 0;
        if (lg > 0.06) {
          ctx.shadowColor = "rgba(0, 160, 160, " + (0.10 + lg * 0.22) + ")";
          ctx.shadowBlur = 3 + lg * 8;
          ctx.strokeStyle = "rgba(0, 160, 160, " + ((0.04 + t * 0.04 + lg * 0.22) * strength) + ")";
          ctx.lineWidth = 0.6 + t * 0.18 + lg * 0.7;
        } else {
          ctx.strokeStyle = "rgba(" + tint[0] + ", " + tint[1] + ", " + tint[2] + ", " + ((0.028 + t * 0.03) * strength) + ")";
          ctx.lineWidth = 0.55 + t * 0.16;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      ctx.shadowBlur = 0;
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        md = dist2cursor(a.x, a.y);
        glow = md < GLOW ? 1 - md / GLOW : 0;
        ctx.beginPath();
        if (glow > 0.05) {
          ctx.shadowColor = "rgba(0, 160, 160, " + (0.16 + glow * 0.26) + ")";
          ctx.shadowBlur = 4 + glow * 7;
          ctx.fillStyle = "rgba(0, 160, 160, " + (0.58 + glow * 0.28) + ")";
          ctx.arc(a.x, a.y, a.r * 1.06 + glow * 1.35, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        } else {
          ctx.shadowBlur = 0;
          ctx.fillStyle = "rgba(" + tint[0] + ", " + tint[1] + ", " + tint[2] + ", 0.10)";
          ctx.arc(a.x, a.y, a.r * 1.08, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      requestAnimationFrame(tick);
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
    resize();
    spawn();
    requestAnimationFrame(tick);
  }

  global.IrisMotion = {
    revealLanding: revealLanding,
    wireParticles: wireParticles,
    burstGlitch: burstGlitch,
    hitchCurtain: hitchCurtain,
    startGlitchLoop: startGlitchLoop
  };
})(window);
