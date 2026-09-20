/* ==========================================================================
   FRONT ROW BEAUTY SALON — homepage hero, ambient 3D layer
   A soft, slowly-twisting ribbon of gold drifting behind the hero photo,
   with a light dust of particles and gentle mouse-parallax. Purely
   decorative (aria-hidden, pointer-events: none) — the hero is fully
   readable and usable with this switched off entirely.

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

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.matchMedia('(min-width: 720px)').matches) return;
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
    import('./vendor/three.module.min.js')
      .then(function (THREE) { startScene(THREE); })
      .catch(function () { /* library didn't load — hero just stays the plain photo */ });
  }

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(boot, { timeout: 2500 });
  } else {
    window.setTimeout(boot, 350);
  }

  function startScene(THREE) {
    var wrap = canvas.closest('.home-hero');
    if (!wrap || !canvas.parentElement) return;

    var renderer = new THREE.WebGLRenderer({
      canvas: canvas, alpha: true, antialias: true, powerPreference: 'low-power'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 9);

    /* warm, brand-matched lighting — brass key + rosewood rim, so the
       ribbon catches the same gold/blush the rest of the site uses */
    scene.add(new THREE.AmbientLight(0x392d22, 1.2));
    var key = new THREE.DirectionalLight(0xd4af6a, 2.4);
    key.position.set(4, 5, 6);
    scene.add(key);
    var rim = new THREE.DirectionalLight(0xe0a3b4, 1.5);
    rim.position.set(-5, -2, -4);
    scene.add(rim);

    /* a single, softly twisting ribbon — abstract rather than a literal
       object, reads as light/hair/elegance rather than a random shape */
    var curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2.6, 1.2, -0.6),
      new THREE.Vector3(-0.9, -1.0, 0.9),
      new THREE.Vector3(0.7, 1.4, -0.5),
      new THREE.Vector3(2.3, -0.7, 0.7),
      new THREE.Vector3(3.3, 1.1, -0.2)
    ]);
    var ribbon = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 160, 0.17, 24, false),
      new THREE.MeshPhysicalMaterial({
        color: 0xd4af6a, metalness: 0.85, roughness: 0.22,
        clearcoat: 0.6, clearcoatRoughness: 0.25
      })
    );
    scene.add(ribbon);

    /* a light drift of gold dust behind it */
    var dustCount = 80;
    var positions = new Float32Array(dustCount * 3);
    for (var i = 0; i < dustCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 9;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6 - 2;
    }
    var dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    var dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
      color: 0xf6efe3, size: 0.035, transparent: true, opacity: 0.55, sizeAttenuation: true
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
      ribbon.rotation.y += dt * 0.18;
      ribbon.rotation.x = pointer.y * 0.15;
      ribbon.rotation.z = -pointer.x * 0.1;
      dust.rotation.y += dt * 0.04;
      camera.position.x = pointer.x * 0.4;
      camera.position.y = -pointer.y * 0.3;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    }
    tick();

    canvas.classList.add('is-ready');
  }
})();
