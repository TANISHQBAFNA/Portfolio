(function (global) {
  "use strict";

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
        overwrite: true
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
  }

  /**
   * Full-viewport constellation web.
   * Light coffee mesh, slow continuous drift, teal glow near the cursor.
   */
  function wireParticles(reduceMotion) {
    var canvas = document.querySelector("[data-particles]");
    if (!canvas || reduceMotion.matches || !window.matchMedia("(pointer: fine)").matches) return;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0;
    var h = 0;
    var mx = -9999;
    var my = -9999;
    var nodes = [];
    var LINK = 150;
    var LINK_BREAK = 190;
    var GLOW = 210;
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
      var cols = Math.max(9, Math.round(w / 82));
      var rows = Math.max(8, Math.round(h / 74));
      var cellW = w / cols;
      var cellH = h / rows;
      var i;
      var j;
      for (j = 0; j < rows; j++) {
        for (i = 0; i < cols; i++) {
          var jx = (Math.random() - 0.5) * cellW * 0.55;
          var jy = (Math.random() - 0.5) * cellH * 0.55;
          nodes.push({
            x: (i + 0.5) * cellW + jx,
            y: (j + 0.5) * cellH + jy,
            ox: (i + 0.5) * cellW + jx,
            oy: (j + 0.5) * cellH + jy,
            vx: (Math.random() - 0.5) * 0.012,
            vy: (Math.random() - 0.5) * 0.012,
            r: 1.15 + Math.random() * 1.1,
            phase: Math.random() * Math.PI * 2,
            col: i,
            row: j
          });
        }
      }
      cellSize = Math.max(cellW, cellH);
      LINK = cellSize * 1.35;
      LINK_BREAK = cellSize * 1.75;
      liveLinks = {};
    }

    function tick(now) {
      var tNow = (now || 0) * 0.001;
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
        a.vx += (a.ox - a.x) * 0.00018;
        a.vy += (a.oy - a.y) * 0.00018;
        a.vx += Math.sin(tNow * 0.06 + a.phase) * 0.0014;
        a.vy += Math.cos(tNow * 0.05 + a.phase * 1.3) * 0.0014;
        a.vx += Math.sin(tNow * 0.028 + a.phase * 2.1) * 0.0008;
        a.vy += Math.cos(tNow * 0.032 + a.phase * 0.7) * 0.0008;
        a.vx += Math.sin(tNow * 0.012 + a.phase * 0.4) * 0.00045;
        a.vy += Math.cos(tNow * 0.014 + a.phase * 1.7) * 0.00045;
        var pdx = mx - a.x;
        var pdy = my - a.y;
        var pd = Math.sqrt(pdx * pdx + pdy * pdy) || 1;
        if (pd < 220) {
          var pull = (1 - pd / 220) * 0.00055;
          a.vx += (pdx / pd) * pull;
          a.vy += (pdy / pd) * pull;
        }
        a.vx *= 0.996;
        a.vy *= 0.996;
        a.x += a.vx;
        a.y += a.vy;
        if (a.x < 8) { a.x = 8; a.vx *= -0.5; }
        if (a.x > w - 8) { a.x = w - 8; a.vx *= -0.5; }
        if (a.y < 8) { a.y = 8; a.vy *= -0.5; }
        if (a.y > h - 8) { a.y = h - 8; a.vy *= -0.5; }
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

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "rgba(120, 88, 62, " + ((0.028 + t * 0.03) * strength) + ")";
        ctx.lineWidth = 0.55 + t * 0.16;
        ctx.stroke();
      }

      ctx.shadowBlur = 0;
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        dx = mx - a.x;
        dy = my - a.y;
        md = Math.sqrt(dx * dx + dy * dy);
        glow = (mx > -1000 && md < GLOW) ? 1 - md / GLOW : 0;
        var radius = a.r * 1.08 + glow * 1.15;
        ctx.beginPath();
        if (glow > 0.06) {
          ctx.shadowColor = "rgba(0, 160, 160, " + (0.18 + glow * 0.36) + ")";
          ctx.shadowBlur = 5 + glow * 12;
          ctx.fillStyle = "rgba(0, 160, 160, " + (0.3 + glow * 0.42) + ")";
        } else {
          ctx.shadowBlur = 0;
          ctx.fillStyle = "rgba(120, 88, 62, 0.08)";
        }
        ctx.arc(a.x, a.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(tick);
    }

    window.addEventListener("pointermove", function (e) {
      mx = e.clientX;
      my = e.clientY;
    }, { passive: true });
    window.addEventListener("pointerleave", function () {
      mx = -9999;
      my = -9999;
    });
    window.addEventListener("resize", function () {
      resize();
      spawn();
    });
    resize();
    spawn();
    requestAnimationFrame(tick);
  }

  global.IrisMotion = { revealLanding: revealLanding, wireParticles: wireParticles };
})(window);
