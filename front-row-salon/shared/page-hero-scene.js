/* ==========================================================================
   FRONT ROW BEAUTY SALON — interior-page hero, bloom-lit 3D accent
   The same self-hosted gold medallion as the homepage, with the same
   restrained bloom pass as Services/About, set off to the side of the
   page title so every interior page gets a touch of the bold, tactile
   feel that runs through the rest of the site. Purely decorative
   (aria-hidden, pointer-events: none) and gated exactly like every other
   3D layer on the site:
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

  import('./cinematic-loader.js').then(function (loader) {
    if (!loader.guardsPass()) return;

    function boot() {
      Promise.all([loader.loadCinematic(), loader.loadBloom(), import('./medallion.js')])
        .then(function (mods) { startScene(mods[0].THREE, mods[1], mods[2].buildMedallion); })
        .catch(function () { /* library didn't load — page hero just stays plain */ });
    }
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(boot, { timeout: 800 });
    } else {
      window.setTimeout(boot, 150);
    }
  });

  function startScene(THREE, bloomMods, buildMedallion) {
    if (!canvas.parentElement) return;

    var renderer = new THREE.WebGLRenderer({
      canvas: canvas, alpha: true, antialias: true, powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(0, 0, 9);

    scene.add(new THREE.AmbientLight(0x392d22, 1.2));
    var key = new THREE.DirectionalLight(0xd4af6a, 2.6);
    key.position.set(4, 5, 6);
    scene.add(key);
    var rim = new THREE.DirectionalLight(0xe0a3b4, 1.5);
    rim.position.set(-5, -2, -4);
    scene.add(rim);
    var fill = new THREE.DirectionalLight(0xf6efe3, 0.5);
    fill.position.set(0, -3, 5);
    scene.add(fill);

    var group = buildMedallion(THREE, 1.6);
    group.traverse(function (o) { if (o.material) o.material.emissiveIntensity = (o.material.emissiveIntensity || 0.22) + 0.25; });
    group.position.set(2.5, -0.1, -1.4);
    scene.add(group);

    var composer = new bloomMods.EffectComposer(renderer);
    composer.addPass(new bloomMods.RenderPass(scene, camera));
    var bloomPass = new bloomMods.UnrealBloomPass(new THREE.Vector2(300, 300), 0.45, 0.5, 0.45);
    composer.addPass(bloomPass);
    composer.addPass(new bloomMods.OutputPass());

    function resize() {
      var r = canvas.parentElement.getBoundingClientRect();
      var w = Math.max(1, r.width), h = Math.max(1, r.height);
      renderer.setSize(w, h, false);
      composer.setSize(w, h);
      bloomPass.setSize(w, h);
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
      composer.render();
    }
    tick();

    canvas.classList.add('is-ready');
  }
})();
