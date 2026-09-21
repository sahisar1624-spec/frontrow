/* ==========================================================================
   FRONT ROW BEAUTY SALON — homepage hero, ambient 3D layer
   A slowly turning gold medallion of the salon's own crest, drifting
   behind the hero photo, with a light dust of particles and gentle
   mouse-parallax. Purely decorative (aria-hidden, pointer-events: none)
   — the hero is fully readable and usable with this switched off entirely.

   Loads three.js itself (self-hosted in shared/vendor/, no CDN) only when
   all of these hold, so it never costs anyone who wouldn't see it well:
     - visitor hasn't asked for reduced motion
     - viewport is wide enough that this isn't competing with the real
       salon photo for a small phone screen
     - the browser doesn't report a data-saver / slow connection
     - WebGL is actually available
   Even then, it's deferred past first paint (requestIdleCallback) so it
   never competes with the hero text/photo for bandwidth or main-thread
   time, and it pauses itself whenever the hero scrolls out of view or the
   tab is hidden.
   ========================================================================== */
(function () {
  'use strict';

  var canvas = document.getElementById('hero-3d');
  if (!canvas) return;

  import('./cinematic-loader.js').then(function (loader) {
    if (!loader.guardsPass()) return;

    function boot() {
      Promise.all([loader.loadCinematic(), loader.loadBloom(), import('./medallion.js')])
        .then(function (mods) { startScene(mods[0].THREE, mods[1], mods[2].buildMedallion); })
        .catch(function () { /* library didn't load — hero just stays the plain photo */ });
    }
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(boot, { timeout: 800 });
    } else {
      window.setTimeout(boot, 150);
    }
  });

  function startScene(THREE, bloomMods, buildMedallion) {
    var wrap = canvas.closest('.home-hero');
    if (!wrap || !canvas.parentElement) return;

    var renderer = new THREE.WebGLRenderer({
      canvas: canvas, alpha: true, antialias: true, powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 9);

    /* warm, brand-matched lighting — brass key + rosewood rim, so the
       medallion catches the same gold/blush the rest of the site uses */
    scene.add(new THREE.AmbientLight(0x392d22, 1.3));
    var key = new THREE.DirectionalLight(0xd4af6a, 2.6);
    key.position.set(4, 5, 6);
    scene.add(key);
    var rim = new THREE.DirectionalLight(0xe0a3b4, 1.6);
    rim.position.set(-5, -2, -4);
    scene.add(rim);
    var fill = new THREE.DirectionalLight(0xf6efe3, 0.6);
    fill.position.set(0, -3, 5);
    scene.add(fill);

    /* the salon's own crest, as a slowly turning gold medallion — a coin
       catching light rather than a flat logo pasted on the page */
    var group = buildMedallion(THREE, 1.9);
    group.traverse(function (o) { if (o.material) o.material.emissiveIntensity = (o.material.emissiveIntensity || 0.22) + 0.25; });
    scene.add(group);

    var composer = new bloomMods.EffectComposer(renderer);
    composer.addPass(new bloomMods.RenderPass(scene, camera));
    var bloomPass = new bloomMods.UnrealBloomPass(new THREE.Vector2(800, 800), 0.5, 0.5, 0.42);
    composer.addPass(bloomPass);
    composer.addPass(new bloomMods.OutputPass());

    /* a light drift of gold dust around it */
    var dustCount = 70;
    var positions = new Float32Array(dustCount * 3);
    for (var i = 0; i < dustCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 9;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6 - 2;
    }
    var dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    var dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
      color: 0xf6efe3, size: 0.035, transparent: true, opacity: 0.5, sizeAttenuation: true
    }));
    scene.add(dust);

    /* gentle mouse-parallax — smoothed, never snappy */
    var pointer = { x: 0, y: 0 };
    var pointerTarget = { x: 0, y: 0 };
    wrap.addEventListener('mousemove', function (e) {
      var r = wrap.getBoundingClientRect();
      pointerTarget.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      pointerTarget.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    });

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

    /* pause entirely when off-screen or the tab isn't visible */
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
      pointer.x += (pointerTarget.x - pointer.x) * 0.04;
      pointer.y += (pointerTarget.y - pointer.y) * 0.04;
      group.rotation.y += dt * 0.22;
      group.rotation.x = pointer.y * 0.18;
      group.rotation.z = -pointer.x * 0.06;
      dust.rotation.y += dt * 0.04;
      camera.position.x = pointer.x * 0.4;
      camera.position.y = -pointer.y * 0.3;
      camera.lookAt(0, 0, 0);
      composer.render();
    }
    tick();

    canvas.classList.add('is-ready');
  }
})();
