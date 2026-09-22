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

  /* a bold, bloom-lit ambient backdrop behind the (untouched) real photo
     grid — a slowly turning gold medallion in a drift of dust, the same
     premium atmosphere as Services/About without touching a single photo.
     Host is .page-tail (the whole gallery + before/after + CTA content),
     not just .gallery-grid, so the backdrop keeps running the full length
     of the page instead of fading out once you scroll past the grid. */
  import('./ambient-scene.js').then(function (mod) {
    import('./medallion.js').then(function (m) {
      mod.startAmbientScene('gallery-cinema', '.page-tail', function (THREE) {
        var group = new THREE.Group();
        var medallion = m.buildMedallion(THREE, 2.4);
        medallion.position.set(2.6, 0, -3);
        group.add(medallion);

        var count = 90;
        var positions = new Float32Array(count * 3);
        for (var i = 0; i < count; i++) {
          positions[i * 3] = (Math.random() - 0.5) * 12;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 6 - 2;
        }
        var geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        var dust = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xd4af6a, size: 0.05, transparent: true, opacity: 0.6, sizeAttenuation: true }));
        group.add(dust);
        return group;
      }, { camZ: 9.5, bloomStrength: 0.5, spinSpeed: 0.06 });
    });
  });
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

  /* -- one-time 3D entrance per tile, reduced-motion and phone-width gated --
     uses the same shared, deduped loader as the ambient backdrop above so
     the two never race to load (and re-register) GSAP independently. */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.matchMedia('(min-width: 720px)').matches) return;

  function boot() {
    import('./cinematic-loader.js')
      .then(function (loader) { return loader.loadCinematic(); })
      .then(function (mods) { initScroll(mods.gsap, mods.ScrollTrigger); })
      .catch(function () { /* GSAP didn't load — the grid still works fine, plain */ });
  }
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(boot, { timeout: 2500 });
  } else {
    window.setTimeout(boot, 400);
  }

  function initScroll(gsap, ScrollTrigger) {
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
