(function (global) {
  "use strict";

  var glitchTimers = [];

  function burstGlitch(el, reduceMotion) {
    if (!el || (reduceMotion && reduceMotion.matches)) return;
    el.classList.remove("is-glitching");
    void el.offsetWidth;
    el.classList.add("is-glitching");
    window.setTimeout(function () {
      el.classList.remove("is-glitching");
    }, 450);
  }

  function burstHero(reduceMotion) {
    var shouts = document.querySelectorAll(".hero__kicker, .hero__accent, .hero__word");
    shouts.forEach(function (el, i) {
      window.setTimeout(function () {
        burstGlitch(el, reduceMotion);
      }, 140 * i);
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
        window.setTimeout(function () { burstGlitch(logo, reduceMotion); }, 400);
      }
      var wait = 6000 + Math.random() * 2000;
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
   * Comic ink threads — sparse graphic strokes with occasional CMYK
   * plate offsets. Not a recolor of the cream-home constellation mesh.
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
    var LINK = 220;
    var LINK_BREAK = 280;
    var REACH = 170;
    var MAX_DEG = 2;
    var MIN_ANGLE = 0.78;
    var liveLinks = {};

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
      var cols = Math.max(finePointer ? 4 : 3, Math.round(w / (finePointer ? 172 : 210)));
      var rows = Math.max(finePointer ? 4 : 3, Math.round(h / (finePointer ? 158 : 196)));
      var cellW = w / cols;
      var cellH = h / rows;
      var i;
      var j;
      function addNode(x, y, col, row) {
        var px = Math.max(16, Math.min(w - 16, x));
        var py = Math.max(16, Math.min(h - 16, y));
        nodes.push({
          x: px,
          y: py,
          ox: px,
          oy: py,
          r: 1.8 + Math.random() * 1.4,
          weight: 3.2 + Math.random() * 3.1,
          tick: true,
          fringe: Math.random() < 0.38,
          phase: Math.random() * Math.PI * 2,
          ampX: 5 + Math.random() * 6,
          ampY: 4 + Math.random() * 5,
          spX: 0.14 + Math.random() * 0.08,
          spY: 0.12 + Math.random() * 0.08,
          col: col,
          row: row
        });
      }
      for (j = 0; j < rows; j++) {
        for (i = 0; i < cols; i++) {
          if (Math.random() < 0.48) continue;
          addNode(
            (i + 0.18 + Math.random() * 0.64) * cellW,
            (j + 0.18 + Math.random() * 0.64) * cellH,
            i,
            j
          );
        }
      }
      cellW = Math.max(cellW, cellH);
      LINK = cellW * 1.55;
      LINK_BREAK = cellW * 2.05;
    }

    function dist2cursor(x, y) {
      if (mx < -1000) return 9999;
      var dx = mx - x;
      var dy = my - y;
      return Math.sqrt(dx * dx + dy * dy);
    }

    function strokeThread(ax, ay, cx, cy, bx, by, width, color) {
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.quadraticCurveTo(cx, cy, bx, by);
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = "butt";
      ctx.lineJoin = "miter";
      ctx.miterLimit = 2;
      ctx.stroke();
    }

    function tick(now) {
      var tNow = (now || 0) * 0.001;
      var print = document.documentElement.classList.contains("is-print");
      var ink = print ? "30, 21, 16" : "232, 220, 200";
      ctx.clearRect(0, 0, w, h);
      ctx.shadowBlur = 0;

      var i;
      var j;
      var a;
      var b;
      var dx;
      var dy;
      var dist;
      var t;
      var k;

      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        var wx = Math.sin(tNow * a.spX + a.phase) * a.ampX;
        var wy = Math.cos(tNow * a.spY + a.phase * 1.13) * a.ampY;
        var tx = a.ox + wx;
        var ty = a.oy + wy;
        var pdx = mx - tx;
        var pdy = my - ty;
        var pd = Math.sqrt(pdx * pdx + pdy * pdy) || 1;
        if (pd < REACH) {
          var pull = (1 - pd / REACH) * 7;
          tx += (pdx / pd) * pull;
          ty += (pdy / pd) * pull;
        }
        a.x += (tx - a.x) * 0.04;
        a.y += (ty - a.y) * 0.04;
        if (a.x < 10) a.x = 10;
        if (a.x > w - 10) a.x = w - 10;
        if (a.y < 10) a.y = 10;
        if (a.y > h - 10) a.y = h - 10;
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
          if (dist <= LINK && dist > 18) {
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
          liveLinks[lk] = Math.min(1, liveLinks[lk] + 0.028);
        } else {
          var parts0 = lk.split(":");
          a = nodes[+parts0[0]];
          b = nodes[+parts0[1]];
          if (!a || !b) { delete liveLinks[lk]; continue; }
          dx = a.x - b.x;
          dy = a.y - b.y;
          dist = Math.sqrt(dx * dx + dy * dy);
          var fade = dist > LINK_BREAK ? 0.04 : 0.016;
          liveLinks[lk] -= fade;
          if (liveLinks[lk] <= 0) delete liveLinks[lk];
        }
      }
      var propKeys = Object.keys(proposed);
      for (k = 0; k < propKeys.length; k++) {
        if (liveLinks[propKeys[k]] == null) liveLinks[propKeys[k]] = 0.08;
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
        dx = a.x - b.x;
        dy = a.y - b.y;
        dist = Math.sqrt(dx * dx + dy * dy) || 1;
        var strength = liveLinks[linkKeys[k]];
        t = Math.max(0, 1 - dist / Math.max(LINK_BREAK, dist)) * strength;
        var nx = -dy / dist;
        var ny = dx / dist;
        var bow = Math.sin(tNow * 0.18 + i * 0.41 + j * 0.23) * 9.5 * strength;
        var cx = (a.x + b.x) * 0.5 + nx * bow;
        var cy = (a.y + b.y) * 0.5 + ny * bow;
        var near = Math.max(0, 1 - dist2cursor(cx, cy) / REACH);
        var width = (a.weight + b.weight) * 0.5 + t * 0.8 + near * 0.6;
        var alpha = (0.16 + t * 0.14 + near * 0.08) * strength;
        var fringe = a.fringe || b.fringe || ((i * 11 + j * 5) % 7 === 0);
        if (fringe && strength > 0.35) {
          strokeThread(a.x - 1.6, a.y, cx - 1.4, cy, b.x - 1.6, b.y, Math.max(1.2, width * 0.72), "rgba(61, 232, 245, " + (0.14 * strength) + ")");
          strokeThread(a.x + 1.6, a.y, cx + 1.4, cy, b.x + 1.6, b.y, Math.max(1.1, width * 0.68), "rgba(255, 78, 184, " + (0.11 * strength) + ")");
        }
        strokeThread(a.x, a.y, cx, cy, b.x, b.y, width, "rgba(" + ink + ", " + alpha + ")");
      }

      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        var nAlpha = 0.28 + Math.max(0, 1 - dist2cursor(a.x, a.y) / REACH) * 0.18;
        ctx.fillStyle = "rgba(" + ink + ", " + nAlpha + ")";
        if (a.tick) {
          ctx.save();
          ctx.translate(a.x, a.y);
          ctx.rotate(a.phase * 0.35);
          ctx.fillRect(-a.r * 0.45, -a.r * 1.6, a.r * 0.9, a.r * 3.2);
          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.arc(a.x, a.y, a.r * 0.85, 0, Math.PI * 2);
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
