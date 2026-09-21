/* ==========================================================================
   FRONT ROW BEAUTY SALON — About page, cinematic brand-story layer
   Two purely decorative additions, both layered behind or around content
   that is otherwise untouched:

   1. A crossfading 3D companion (flowing ribbon → soft blob) behind the
      opening quote and the "what we believe" cards, scroll-driven via
      GSAP ScrollTrigger — the desktop-only, WebGL-gated part.

   2. A lightweight scroll parallax on the real "inside the salon" photo —
      pure CSS transform, no WebGL, works on mobile too — so the photo
      drifts gently at its own depth as the page scrolls past it, echoing
      the "images float in 3D space" idea with the salon's own photo
      rather than an invented one.
   ========================================================================== */
(function () {
  'use strict';

  /* -- part 2 first: cheap, works everywhere, only reduced-motion gated -- */
  function initPhotoParallax() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var fig = document.querySelector('.about-photo-depth img');
    if (!fig) return;
    var ticking = false;
    function update() {
      ticking = false;
      var r = fig.getBoundingClientRect();
      var center = r.top + r.height / 2 - window.innerHeight / 2;
      var shift = Math.max(-24, Math.min(24, center * -0.06));
      fig.style.transform = 'scale(1.08) translateY(' + shift + 'px)';
    }
    document.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }
  initPhotoParallax();

  /* -- part 1: the WebGL companion -- */
  var canvas = document.getElementById('about-3d');
  var stage = document.querySelector('.story-stage');
  if (!canvas || !stage) return;

  import('./cinematic-loader.js').then(function (loader) {
    if (!loader.guardsPass()) return;

    function boot() {
      Promise.all([loader.loadCinematic(), import('./beauty-scenes.js')])
        .then(function (mods) {
          startScene(mods[0].THREE, mods[0].ScrollTrigger, mods[1]);
        })
        .catch(function () { /* scene didn't load — the real content still works fine */ });
    }
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(boot, { timeout: 2500 });
    } else {
      window.setTimeout(boot, 400);
    }
  });

  function startScene(THREE, ScrollTrigger, beautyScenes) {
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

    var scenes = [beautyScenes.buildRibbonFlow(THREE), beautyScenes.buildFacialBlob(THREE)];
    scenes.forEach(function (g) { g.traverse(function (o) { if (o.material) o.material.transparent = true; }); scene.add(g); });

    var pointer = { x: 0, y: 0 };
    var pointerTarget = { x: 0, y: 0 };
    window.addEventListener('mousemove', function (e) {
      pointerTarget.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointerTarget.y = (e.clientY / window.innerHeight - 0.5) * 2;
    });

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
      return Math.max(0, 1 - d * 1.5);
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
        g.rotation.y += dt * (0.12 + i * 0.05);
        g.rotation.x = pointer.y * 0.12;
        g.scale.setScalar(0.75 + op * 0.25);
        g.traverse(function (o) { if (o.material) o.material.opacity = op; });
      });

      camera.position.x = pointer.x * 0.4;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    }
    tick();

    canvas.classList.add('is-ready');
  }
})();
