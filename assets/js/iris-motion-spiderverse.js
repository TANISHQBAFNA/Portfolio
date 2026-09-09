(function (global) {
  "use strict";

  function burstGlitch(el, reduceMotion) {
    if (!el || (reduceMotion && reduceMotion.matches)) return;
    el.classList.remove("is-glitching");
    void el.offsetWidth;
    el.classList.add("is-glitching");
    window.setTimeout(function () {
      el.classList.remove("is-glitching");
    }, 560);
  }

  function burstHero(reduceMotion) {
    var shouts = document.querySelectorAll(".hero__kicker, .hero__accent, .hero__word");
    shouts.forEach(function (el, i) {
      window.setTimeout(function () {
        burstGlitch(el, reduceMotion);
      }, 80 * i);
    });
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

  /* Halftone is CSS. Do not run the constellation web on this variant. */
  function wireParticles() { return; }

  global.IrisMotion = {
    revealLanding: revealLanding,
    wireParticles: wireParticles,
    burstGlitch: burstGlitch
  };
})(window);
