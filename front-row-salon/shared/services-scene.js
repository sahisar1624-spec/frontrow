/* ==========================================================================
   FRONT ROW BEAUTY SALON — Services page, scroll-driven 3D story
   A single canvas sits behind the three existing Hair / Nails / Body & Face
   rows (their real photos and copy are untouched) and, as the visitor
   scrolls through that block, crossfades between three abstract objects —
   flowing strands, a fan of glossy tips, a soft organic blob — tied to
   scroll position via GSAP ScrollTrigger. Nothing is pinned: the canvas is
   a decorative companion, never something the page's real content depends
   on to be readable.

   Same lazy/guarded loading discipline as the rest of the site's 3D layer:
   deferred past first paint, skipped entirely for reduced motion, narrow
   viewports, data-saver connections or no WebGL, and paused off-screen or
   when the tab is hidden.
   ========================================================================== */
(function () {
  'use strict';

  var canvas = document.getElementById('services-3d');
  var stage = document.querySelector('.pillar-stage');
  if (!canvas || !stage) return;

  import('./cinematic-loader.js').then(function (loader) {
    if (!loader.guardsPass()) return;

    function boot() {
      Promise.all([loader.loadCinematic(), import('./beauty-scenes.js')])
        .then(function (mods) {
          startScene(mods[0].THREE, mods[0].gsap, mods[0].ScrollTrigger, mods[1]);
        })
        .catch(function () { /* scene didn't load — the real rows still work fine */ });
    }

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(boot, { timeout: 2500 });
    } else {
      window.setTimeout(boot, 400);
    }
  });

  function startScene(THREE, gsap, ScrollTrigger, beautyScenes) {
    if (!canvas.parentElement) return;

    var renderer = new THREE.WebGLRenderer({
      canvas: canvas, alpha: true, antialias: true, powerPreference: 'low-power'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(0, 0, 8.5);

    scene.add(new THREE.AmbientLight(0x392d22, 1.3));
    var key = new THREE.DirectionalLight(0xd4af6a, 2.3);
    key.position.set(4, 5, 6);
    scene.add(key);
    var rim = new THREE.DirectionalLight(0xe0a3b4, 1.4);
    rim.position.set(-5, -2, -4);
    scene.add(rim);
    var fill = new THREE.DirectionalLight(0xf6efe3, 0.5);
    fill.position.set(0, -3, 5);
    scene.add(fill);

    var scenes = [
      beautyScenes.buildHairStrands(THREE),
      beautyScenes.buildNailFan(THREE),
      beautyScenes.buildFacialBlob(THREE)
    ];
    scenes.forEach(function (g) { g.traverse(function (o) { if (o.material) o.material.transparent = true; }); scene.add(g); });

    /* -- pointer parallax, smoothed -- */
    var pointer = { x: 0, y: 0 };
    var pointerTarget = { x: 0, y: 0 };
    window.addEventListener('mousemove', function (e) {
      pointerTarget.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointerTarget.y = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    /* -- scroll progress across the whole stage drives which object is
       "active" (0 = hair, 1 = nails, 2 = body & face), with a soft
       crossfade at each handoff -- */
    var progress = 0;
    ScrollTrigger.create({
      trigger: stage,
      start: 'top bottom',
      end: 'bottom top',
      scrub: 0.6,
      onUpdate: function (self) { progress = self.progress; }
    });

    function opacityFor(index, p) {
      var slot = p * (scenes.length - 1);
      var d = Math.abs(slot - index);
      return Math.max(0, 1 - d * 1.6);
    }

    function resize() {
      var r = canvas.parentElement.getBoundingClientRect();
      var w = Math.max(1, r.width), h = Math.max(1, r.height);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    });

    var running = true;
    new IntersectionObserver(function (entries) {
      running = entries[0].isIntersecting;
    }, { threshold: 0.02 }).observe(canvas);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) running = false;
    });

    var clock = new THREE.Clock();
    function tick() {
      requestAnimationFrame(tick);
      if (!running) return;
      var dt = Math.min(clock.getDelta(), 0.1);
      pointer.x += (pointerTarget.x - pointer.x) * 0.04;
      pointer.y += (pointerTarget.y - pointer.y) * 0.04;

      scenes.forEach(function (g, i) {
        var op = opacityFor(i, progress);
        g.visible = op > 0.01;
        g.rotation.y += dt * (0.12 + i * 0.04);
        g.rotation.x = pointer.y * 0.12;
        g.scale.setScalar(0.7 + op * 0.3);
        g.traverse(function (o) { if (o.material) o.material.opacity = op; });
      });

      camera.position.x = pointer.x * 0.5;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    }
    tick();

    canvas.classList.add('is-ready');
  }
})();
