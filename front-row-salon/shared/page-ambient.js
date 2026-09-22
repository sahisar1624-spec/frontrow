/* ==========================================================================
   FRONT ROW BEAUTY SALON — generic full-length ambient backdrop
   For any page whose real content doesn't already have its own bespoke
   cinematic story: a single subtle bloom-lit dust field, pinned behind the
   page and active for as long as any part of .page-tail is in view — so
   the scroll animation keeps running the whole way down the page instead
   of stopping after the hero.

   Same discipline as the rest of the site's 3D layer: lazy-loaded past
   first paint, off entirely under reduced motion / narrow viewport /
   data-saver / no WebGL (all handled inside ambient-scene.js's loader).
   ========================================================================== */
(function () {
  'use strict';

  import('./ambient-scene.js').then(function (mod) {
    mod.startAmbientScene('page-ambient', '.page-tail', function (THREE) {
      var count = 90;
      var positions = new Float32Array(count * 3);
      for (var i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 10;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 5;
      }
      var geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      var mat = new THREE.PointsMaterial({
        color: 0xd4af6a, size: 0.055, transparent: true, opacity: 0.7,
        sizeAttenuation: true, depthWrite: false
      });
      var group = new THREE.Group();
      group.add(new THREE.Points(geo, mat));
      return group;
    }, { spinSpeed: 0.035, bloomStrength: 0.4 });
  });
})();
