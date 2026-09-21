/* ==========================================================================
   FRONT ROW BEAUTY SALON — Gallery page, 3D depth for the real photos
   Deliberately not a WebGL photo wall: these are the salon's real photos
   and video clips, and re-drawing them as textures on a canvas would mean
   loading every one twice, at lower quality, with none of the SEO/
   accessibility a real <img>/<video> gets for free. Instead the actual
   grid elements get the 3D treatment directly:

     - each tile arrives with a one-time "toward camera" 3D entrance as it
       scrolls into view (GSAP ScrollTrigger, played once, then handed
       back to CSS so nothing keeps fighting the hover/focus states below)
     - hovering a tile lifts it slightly forward
     - clicking a tile brings it to the foreground and gently recedes the
       rest of the room behind it — click again, press Escape, or click
       the empty grid background to return to normal

   Existing behavior (the hover-to-play video tiles, wired separately at
   the bottom of gallery.html) is untouched — this only adds classes and
   transforms around it.
   ========================================================================== */
(function () {
  'use strict';

  var grid = document.getElementById('gallery-grid');
  if (!grid) return;
  var figures = Array.prototype.slice.call(grid.querySelectorAll(':scope > figure'));
  if (!figures.length) return;

  /* -- click / keyboard: bring one photo forward -- */
  function clearFocus() {
    figures.forEach(function (f) { f.classList.remove('is-focused'); f.setAttribute('aria-pressed', 'false'); });
    grid.classList.remove('has-focus');
  }
  figures.forEach(function (fig) {
    fig.setAttribute('tabindex', '0');
    fig.setAttribute('role', 'button');
    fig.setAttribute('aria-pressed', 'false');
    var label = fig.querySelector('.gallery-caption');
    if (label) fig.setAttribute('aria-label', 'Bring "' + label.textContent.trim() + '" to the foreground');

    function toggle() {
      var already = fig.classList.contains('is-focused');
      clearFocus();
      if (!already) {
        fig.classList.add('is-focused');
        fig.setAttribute('aria-pressed', 'true');
        grid.classList.add('has-focus');
      }
    }
    fig.addEventListener('click', toggle);
    fig.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') clearFocus();
  });
  grid.addEventListener('click', function (e) {
    if (e.target === grid) clearFocus();
  });

  /* -- one-time 3D entrance per tile, reduced-motion and phone-width gated -- */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.matchMedia('(min-width: 720px)').matches) return;

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function boot() {
    loadScript('shared/vendor/gsap.min.js')
      .then(function () { return loadScript('shared/vendor/ScrollTrigger.min.js'); })
      .then(function () { initScroll(window.gsap, window.ScrollTrigger); })
      .catch(function () { /* GSAP didn't load — the grid still works fine, plain */ });
  }
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(boot, { timeout: 2500 });
  } else {
    window.setTimeout(boot, 400);
  }

  function initScroll(gsap, ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    figures.forEach(function (fig, i) {
      var media = fig.querySelector('.media-placeholder');
      if (!media) return;
      var depth = (i % 3) - 1; // -1, 0, 1 — a little rotation variety across the grid
      gsap.fromTo(media,
        { z: -90, rotateY: depth * 9, autoAlpha: 0.001, transformPerspective: 1200 },
        {
          z: 0, rotateY: 0, autoAlpha: 1, ease: 'power2.out', duration: 0.9,
          scrollTrigger: { trigger: fig, start: 'top 88%' },
          onComplete: function () { gsap.set(media, { clearProps: 'transform,opacity,visibility' }); }
        }
      );
    });
  }
})();
