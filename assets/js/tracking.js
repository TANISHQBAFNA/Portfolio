/**
 * Optional GTM loader. Stays inert while the ID is still the GTM-XXXXXXX
 * placeholder — analytics is not AEO and must not fire a dummy container.
 */
(function () {
  var id = window.__GTM_ID__;
  if (!id || String(id).indexOf('XXXXXXX') !== -1) return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });

  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(id);
  var first = document.getElementsByTagName('script')[0];
  if (first && first.parentNode) first.parentNode.insertBefore(script, first);
  else document.head.appendChild(script);
})();
