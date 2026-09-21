/* ==========================================================================
   FRONT ROW BEAUTY SALON — Contact page, closing scene
   Two small, purely decorative additions around the real contact details,
   form and footer — none of which change: a bold, bloom-lit drift of gold
   dust and a medallion behind the details/form section (desktop, motion-
   allowed only), and a one-time brass shimmer across the footer the
   moment it's reached, using the same shimmer technique already used on
   the site's primary buttons. Contact stays a usable form and a set of
   real, clickable details first; this is atmosphere, not a redesign.
   ========================================================================== */
(function () {
  'use strict';

  /* -- the footer "arrival" shimmer: reduced-motion gated only, cheap CSS -- */
  (function initFooterArrival() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var footer = document.getElementById('site-footer');
    if (!footer || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          footer.classList.add('arrival');
          io.disconnect();
        }
      });
    }, { threshold: 0.2 });
    io.observe(footer);
  })();

  /* -- ambient dust + medallion behind the details + form -- */
  import('./ambient-scene.js').then(function (mod) {
    import('./medallion.js').then(function (m) {
      mod.startAmbientScene('contact-cinema', '.grid.grid-2', function (THREE) {
        var group = new THREE.Group();
        var medallion = m.buildMedallion(THREE, 2.2);
        medallion.position.set(-2.4, -0.4, -3.2);
        group.add(medallion);

        var count = 120;
        var positions = new Float32Array(count * 3);
        for (var i = 0; i < count; i++) {
          positions[i * 3] = (Math.random() - 0.5) * 12;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 9;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 6 - 2;
        }
        var geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        var dust = new THREE.Points(geo, new THREE.PointsMaterial({
          color: 0xd4af6a, size: 0.05, transparent: true, opacity: 0.6, sizeAttenuation: true
        }));
        group.add(dust);
        return group;
      }, { camZ: 8.5, bloomStrength: 0.5, spinSpeed: 0.05 });
    });
  });
})();
