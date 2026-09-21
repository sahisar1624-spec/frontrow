/* ==========================================================================
   FRONT ROW BEAUTY SALON — Contact page, closing scene
   Two small, purely decorative additions around the real contact details,
   form and footer — none of which change: a drifting field of gold dust
   behind the details/form section (desktop, motion-allowed only), and a
   one-time brass shimmer across the footer the moment it's reached, using
   the same shimmer technique already used on the site's primary buttons.
   Contact stays a usable form and a set of real, clickable details first;
   this is atmosphere, not a redesign of either.
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

  /* -- ambient dust behind the details + form -- */
  var canvas = document.getElementById('contact-3d');
  if (!canvas) return;

  import('./cinematic-loader.js').then(function (loader) {
    if (!loader.guardsPass()) return;

    function boot() {
      loader.loadCinematic()
        .then(function (mods) { startScene(mods.THREE); })
        .catch(function () { /* scene didn't load — the page still works fine */ });
    }
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(boot, { timeout: 2500 });
    } else {
      window.setTimeout(boot, 400);
    }
  });

  function startScene(THREE) {
    if (!canvas.parentElement) return;

    var renderer = new THREE.WebGLRenderer({
      canvas: canvas, alpha: true, antialias: true, powerPreference: 'low-power'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0, 8);

    var count = 110;
    var positions = new Float32Array(count * 3);
    for (var i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 11;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 9;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6 - 2;
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    var dust = new THREE.Points(geo, new THREE.PointsMaterial({
      color: 0xd4af6a, size: 0.045, transparent: true, opacity: 0.55, sizeAttenuation: true
    }));
    scene.add(dust);

    var pointer = { x: 0, y: 0 };
    var pointerTarget = { x: 0, y: 0 };
    window.addEventListener('mousemove', function (e) {
      pointerTarget.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointerTarget.y = (e.clientY / window.innerHeight - 0.5) * 2;
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
      dust.rotation.y += dt * 0.03;
      dust.rotation.x = pointer.y * 0.05;
      camera.position.x = pointer.x * 0.3;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    }
    tick();

    canvas.classList.add('is-ready');
  }
})();
