/* ==========================================================================
   FRONT ROW BEAUTY SALON — Services page, full-bleed real-photo scenes
   Each service (Hair, Nails, Body & Face) is its own full-screen section:
   a real salon photo is the backdrop (scrolling from one to the next past
   the photo IS the transition, no crossfade needed), with a small subtle
   bloom-lit accent canvas layered over it — a drifting brass dust field on
   the photo sections, and the nail-fan object standing in for the visual
   on the Nails section, which has no photo of its own.

   Two independent pieces here: the expand/collapse toggle for the teaser/
   full-text split (works everywhere, no 3D dependency), and the accent
   canvases (lazy-loaded past first paint, off entirely under reduced
   motion / narrow viewport / data-saver / no WebGL, each paused via
   IntersectionObserver once its own section scrolls out of view).
   ========================================================================== */
(function () {
  'use strict';

  document.querySelectorAll('.cine-expand').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var content = btn.closest('.cine-content');
      if (!content) return;
      var full = content.querySelector('.cine-full');
      var expanded = content.classList.toggle('is-expanded');
      btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      if (full) full.hidden = !expanded;
    });
  });

  var accentCanvases = document.querySelectorAll('.cine-accent[data-accent]');
  if (!accentCanvases.length) return;

  import('./cinematic-loader.js').then(function (loader) {
    if (!loader.guardsPass()) return;

    function boot() {
      Promise.all([loader.loadCinematic(), loader.loadBloom(), import('./beauty-scenes.js')])
        .then(function (mods) {
          accentCanvases.forEach(function (canvas) {
            startAccent(canvas, mods[0].THREE, mods[1], mods[2]);
          });
        })
        .catch(function () { /* accent didn't load — the real photo and copy still work fine */ });
    }
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(boot, { timeout: 800 });
    } else {
      window.setTimeout(boot, 150);
    }
  });

  /* a sparse field of drifting brass motes — a subtle accent over a real
     photo, never the dominant visual */
  function buildDust(THREE) {
    var count = 70;
    var positions = new Float32Array(count * 3);
    for (var i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 9;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 9;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    var mat = new THREE.PointsMaterial({
      color: 0xd4af6a, size: 0.06, transparent: true, opacity: 0.8,
      sizeAttenuation: true, depthWrite: false
    });
    var group = new THREE.Group();
    group.add(new THREE.Points(geo, mat));
    return group;
  }

  function startAccent(canvas, THREE, bloomMods, beautyScenes) {
    var host = canvas.closest('.cine-photo');
    if (!host) return;
    var kind = canvas.getAttribute('data-accent');

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 9);

    scene.add(new THREE.AmbientLight(0x392d22, 1.1));
    var key = new THREE.DirectionalLight(0xd4af6a, 2.6);
    key.position.set(4, 5, 6);
    scene.add(key);
    var rim = new THREE.DirectionalLight(0xe0a3b4, 1.5);
    rim.position.set(-5, -2, -4);
    scene.add(rim);

    var group = kind === 'nails' ? beautyScenes.buildNailFan(THREE) : buildDust(THREE);
    if (kind === 'nails') {
      group.traverse(function (o) { if (o.material) { o.material.transparent = true; o.material.emissiveIntensity = 0.4; } });
    }
    scene.add(group);

    var composer = new bloomMods.EffectComposer(renderer);
    composer.addPass(new bloomMods.RenderPass(scene, camera));
    var bloomPass = new bloomMods.UnrealBloomPass(
      new THREE.Vector2(300, 300),
      kind === 'nails' ? 0.5 : 0.65,
      0.6,
      kind === 'nails' ? 0.42 : 0.5
    );
    composer.addPass(bloomPass);
    composer.addPass(new bloomMods.OutputPass());

    function resize() {
      var rect = host.getBoundingClientRect();
      var w = Math.max(1, Math.round(rect.width));
      var h = Math.max(1, Math.round(rect.height));
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
    document.addEventListener('visibilitychange', function () { running = !document.hidden; });

    var visible = false;
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          visible = entry.isIntersecting;
          canvas.classList.toggle('is-ready', visible);
        });
      }, { threshold: 0.15 });
      io.observe(host);
    } else {
      visible = true;
      canvas.classList.add('is-ready');
    }

    var clock = new THREE.Clock();
    function tick() {
      requestAnimationFrame(tick);
      if (!running || !visible) return;
      var dt = Math.min(clock.getDelta(), 0.1);
      group.rotation.y += dt * (kind === 'nails' ? 0.18 : 0.05);
      composer.render();
    }
    tick();
  }
})();
