/**
 * Layout viewport = the browser page pane, never device screen.
 *
 * iPad/phone Safari chrome (status bar, toolbar) sits outside this pane.
 * Do not read screen.width / screen.height / availWidth / availHeight
 * for layout, breakpoints, or full-height math.
 *
 * CSS tokens --vvh / --vvw start as svh/dvh and are overwritten here in px
 * from visualViewport (pinch-zoom excluded).
 *
 * Pattern from the viewport lock (PR #24). Film scroller stays the window.
 */
(function (global) {
  'use strict';

  var root = document.documentElement;
  var lastH = -1;
  var lastW = -1;
  var raf = 0;

  function fallbackHeight() {
    return root.clientHeight || global.innerHeight || 0;
  }

  function fallbackWidth() {
    return root.clientWidth || global.innerWidth || 0;
  }

  function layoutSize() {
    var vv = global.visualViewport;
    var fallbackH = fallbackHeight();
    var fallbackW = fallbackWidth();
    if (!vv) {
      return { height: fallbackH, width: fallbackW, offsetTop: 0 };
    }
    /* Pinch-zoom shrinks visualViewport; cards/stage stay on the unzoomed pane. */
    var scale = vv.scale || 1;
    if (scale > 1.01) {
      return { height: fallbackH, width: fallbackW, offsetTop: 0 };
    }
    return {
      height: vv.height || fallbackH,
      width: vv.width || fallbackW,
      offsetTop: vv.offsetTop || 0
    };
  }

  function apply() {
    var size = layoutSize();
    root.style.setProperty('--vvh', size.height + 'px');
    root.style.setProperty('--vvw', size.width + 'px');
    root.style.setProperty('--vv-offset-top', size.offsetTop + 'px');
    var resized = Math.abs(size.height - lastH) >= 1 || Math.abs(size.width - lastW) >= 1;
    if (!resized) return;
    lastH = size.height;
    lastW = size.width;
    try {
      root.dispatchEvent(new CustomEvent('layoutviewport', { detail: size }));
    } catch (err) { /* IE / ancient WebView */ }
  }

  function schedule() {
    if (raf) return;
    var tick = function () {
      raf = 0;
      apply();
    };
    if (global.requestAnimationFrame) {
      raf = global.requestAnimationFrame(tick);
    } else {
      raf = global.setTimeout(tick, 16);
    }
  }

  global.layoutViewport = {
    size: layoutSize,
    height: function () { return layoutSize().height; },
    width: function () { return layoutSize().width; },
    offsetTop: function () { return layoutSize().offsetTop; },
    sync: apply
  };

  apply();
  if (global.visualViewport) {
    global.visualViewport.addEventListener('resize', schedule);
    global.visualViewport.addEventListener('scroll', schedule);
  }
  global.addEventListener('resize', schedule);
}(window));
