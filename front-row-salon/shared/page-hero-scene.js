/* ==========================================================================
   FRONT ROW BEAUTY SALON — interior-page hero, ambient 3D accent
   The same self-hosted gold medallion as the homepage, scaled down and set
   off to the side of the page title so interior pages (Services, Products,
   Gallery, Team, Contact...) get a touch of the same premium, tactile feel
   instead of it living only on the homepage. Purely decorative (aria-hidden,
   pointer-events: none) and gated exactly like the homepage version:
     - visitor hasn't asked for reduced motion
     - viewport has room beside the page title for this not to compete with it
     - the browser doesn't report a data-saver / slow connection
     - WebGL is actually available
   Deferred past first paint (requestIdleCallback), paused off-screen or when
   the tab is hidden, and it never renders at all if any guard above fails.
   ========================================================================== */
(function () {
  'use strict';

  var canvas = document.getElementById('page-hero-3d');
  if (!canvas) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.matchMedia('(min-width: 900px)').matches) return;
  if (navigator.connection && (navigator.connection.saveData ||
      /2g/.test(navigator.connection.effectiveType || ''))) return;

  function hasWebGL() {
    try {
      var c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext &&
        (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (e) {
      return false;
    }
  }
  if (!hasWebGL()) return;

  function boot() {
    Promise.all([
      import('./vendor/three.module.min.js'),
      import('./medallion.js')
    ]).then(function (mods) { startScene(mods[0], mods[1].buildMedallion); })
      .catch(function () { /* library didn't load — page hero just stays plain */ });
  }

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(boot, { timeout: 2500 });
  } else {
    window.setTimeout(boot, 400);
  }

  function startScene(THREE, buildMedallion) {
    if (!canvas.parentElement) return;

    var renderer = new THREE.WebGLRenderer({
      canvas: canvas, alpha: true, antialias: true, powerPreference: 'low-power'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(0, 0, 9);

    scene.add(new THREE.AmbientLight(0x392d22, 1.3));
    var key = new THREE.DirectionalLight(0xd4af6a, 2.4);
    key.position.set(4, 5, 6);
    scene.add(key);
    var rim = new THREE.DirectionalLight(0xe0a3b4, 1.4);
    rim.position.set(-5, -2, -4);
    scene.add(rim);
    var fill = new THREE.DirectionalLight(0xf6efe3, 0.5);
    fill.position.set(0, -3, 5);
    scene.add(fill);

    /* smaller than the homepage medallion, tucked to the right of the
       title where the page-hero layout leaves room */
    var group = buildMedallion(THREE, 1.3);
    group.position.set(2.5, -0.1, -1.4);
    scene.add(group);

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
    }, { threshold: 0.05 }).observe(canvas);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) running = false;
    });

    var clock = new THREE.Clock();
    function tick() {
      requestAnimationFrame(tick);
      if (!running) return;
      var dt = Math.min(clock.getDelta(), 0.1);
      group.rotation.y += dt * 0.16;
      group.rotation.x = Math.sin(clock.elapsedTime * 0.3) * 0.06;
      renderer.render(scene, camera);
    }
    tick();

    canvas.classList.add('is-ready');
  }
})();
