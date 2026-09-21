/* ==========================================================================
   FRONT ROW BEAUTY SALON — Services page, full-bleed cinematic scroll story
   A single canvas is pinned to the viewport (position: fixed) behind three
   full-height "acts" — Hair, Nails, Body & Face — each holding its real
   copy and photo in a glass panel. As the visitor scrolls, the dominant
   3D object crossfades and the camera dollies between acts, with a
   restrained bloom pass for the glow on the brass/rosewood highlights.
   Nothing about the real content changes: same headings, same paragraphs,
   same photos (now a supporting thumbnail rather than the hero visual,
   since the 3D object takes that role here) — this only pins a scene
   behind them.

   Same discipline as the rest of the site's 3D layer: lazy-loaded past
   first paint, off entirely under reduced motion / narrow viewport /
   data-saver / no WebGL, paused once scrolled past.
   ========================================================================== */
(function () {
  'use strict';

  var canvas = document.getElementById('services-cinema');
  var run = document.querySelector('.cinema-run');
  if (!canvas || !run) return;

  import('./cinematic-loader.js').then(function (loader) {
    if (!loader.guardsPass()) return;

    function boot() {
      Promise.all([loader.loadCinematic(), loader.loadBloom(), import('./beauty-scenes.js')])
        .then(function (mods) {
          startScene(mods[0].THREE, mods[0].gsap, mods[0].ScrollTrigger, mods[1], mods[2]);
        })
        .catch(function () { /* scene didn't load — the real content still works fine */ });
    }
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(boot, { timeout: 800 });
    } else {
      window.setTimeout(boot, 150);
    }
  });

  function startScene(THREE, gsap, ScrollTrigger, bloomMods, beautyScenes) {
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 9);

    scene.add(new THREE.AmbientLight(0x392d22, 1.1));
    var key = new THREE.DirectionalLight(0xd4af6a, 2.8);
    key.position.set(4, 5, 6);
    scene.add(key);
    var rim = new THREE.DirectionalLight(0xe0a3b4, 1.8);
    rim.position.set(-5, -2, -4);
    scene.add(rim);
    var fill = new THREE.DirectionalLight(0xf6efe3, 0.6);
    fill.position.set(0, -3, 5);
    scene.add(fill);

    var world = new THREE.Group();
    scene.add(world);
    var scenes = [
      beautyScenes.buildHairStrands(THREE),
      beautyScenes.buildNailFan(THREE),
      beautyScenes.buildFacialBlob(THREE)
    ];
    scenes.forEach(function (g) {
      g.traverse(function (o) { if (o.material) { o.material.transparent = true; o.material.emissiveIntensity = 0.5; } });
      world.add(g);
    });

    /* -- bloom composer: subtle, catches only the brightest highlights -- */
    var composer = new bloomMods.EffectComposer(renderer);
    composer.addPass(new bloomMods.RenderPass(scene, camera));
    var bloomPass = new bloomMods.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.55, 0.5, 0.42);
    composer.addPass(bloomPass);
    composer.addPass(new bloomMods.OutputPass());

    /* -- pointer parallax -- */
    var pointer = { x: 0, y: 0 }, pointerTarget = { x: 0, y: 0 };
    window.addEventListener('mousemove', function (e) {
      pointerTarget.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointerTarget.y = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    /* -- master scroll progress across all three acts -- */
    var progress = 0;
    ScrollTrigger.create({
      trigger: run, start: 'top top', end: 'bottom bottom', scrub: 0.7,
      onUpdate: function (self) { progress = self.progress; }
    });
    var visibilityTrigger = ScrollTrigger.create({
      trigger: run, start: 'top top', end: 'bottom bottom',
      onEnter: function () { canvas.classList.add('is-ready'); },
      onLeave: function () { canvas.classList.remove('is-ready'); },
      onEnterBack: function () { canvas.classList.add('is-ready'); },
      onLeaveBack: function () { canvas.classList.remove('is-ready'); }
    });
    /* a ScrollTrigger created while the page happens to already be sitting
       exactly at (or past) its start point doesn't retroactively fire
       onEnter until the next scroll/refresh — on a fast first load that
       can leave the canvas invisible until the visitor scrolls again, so
       check the already-current position directly here too. */
    if (window.scrollY >= visibilityTrigger.start && window.scrollY <= visibilityTrigger.end) {
      canvas.classList.add('is-ready');
    }

    function opacityFor(index, p) {
      var slot = p * (scenes.length - 1);
      var d = Math.abs(slot - index);
      return Math.max(0, 1 - d * 1.35);
    }

    function resize() {
      var w = window.innerWidth, h = window.innerHeight;
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

    /* the canvas is CSS-hidden (opacity 0) until is-ready lands, so there's
       no visual cost to starting the render loop right away — this avoids
       a race where the very first frames would otherwise wait on a
       ScrollTrigger callback that hasn't fired yet on a fast first scroll */
    var running = true;
    document.addEventListener('visibilitychange', function () { running = !document.hidden; });

    var clock = new THREE.Clock();
    function tick() {
      requestAnimationFrame(tick);
      if (!running) return;
      var dt = Math.min(clock.getDelta(), 0.1);
      pointer.x += (pointerTarget.x - pointer.x) * 0.045;
      pointer.y += (pointerTarget.y - pointer.y) * 0.045;

      var peakOpacity = 0;
      scenes.forEach(function (g, i) {
        var op = opacityFor(i, progress);
        if (op > peakOpacity) peakOpacity = op;
        g.visible = op > 0.01;
        g.rotation.y += dt * (0.14 + i * 0.05);
        g.rotation.x = pointer.y * 0.14;
        g.scale.setScalar(0.55 + op * 0.85);
        g.traverse(function (o) { if (o.material) o.material.opacity = op; });
      });

      /* camera dollies IN as an act reaches full dominance and eases back
         OUT during the crossfade to the next one — tied to actual opacity
         rather than raw scroll progress, so the "punch in" always lands
         exactly when an object is fully on screen. */
      var dolly = 9 - peakOpacity * 1.6;
      camera.position.z += (dolly - camera.position.z) * 0.06;
      camera.position.x = pointer.x * 0.6;
      camera.position.y = -pointer.y * 0.35;
      camera.lookAt(0, 0, 0);
      world.rotation.y += dt * 0.015;

      composer.render();
    }
    tick();
  }
})();
