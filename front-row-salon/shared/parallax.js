/* ==========================================================================
   FRONT ROW BEAUTY SALON — subtle scroll parallax for real interior photos.
   Pure CSS-transform drift, driven by rAF-throttled scroll reads — no
   canvas, no WebGL, nothing that can silently fail to boot. Opts out
   under prefers-reduced-motion and leaves photos fully static otherwise.
   Usage: add data-parallax to the .media-placeholder wrapping the <img>.
   ========================================================================== */
(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var wrappers = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  if (!wrappers.length) return;

  var items = wrappers.map(function (wrap) {
    return { wrap: wrap, img: wrap.querySelector('img') };
  }).filter(function (item) { return item.img; });
  if (!items.length) return;

  var ticking = false;

  function update() {
    var vh = window.innerHeight;
    items.forEach(function (item) {
      var rect = item.wrap.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > vh) return;
      var center = rect.top + rect.height / 2 - vh / 2;
      var offset = Math.max(-18, Math.min(18, center / vh * 36));
      item.img.style.transform = 'scale(1.12) translateY(' + offset.toFixed(1) + 'px)';
    });
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();
