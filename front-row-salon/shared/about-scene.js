/* ==========================================================================
   FRONT ROW BEAUTY SALON — About page, full-bleed cinematic scroll story
   Same architecture as Services: one canvas pinned to the viewport behind
   three full-height acts — the opening quote, the two "what we believe"
   cards, and "inside the salon" — each holding its real copy (and, for
   the third act, the real salon photo as a supporting thumbnail) in a
   glass panel. The dominant 3D object crossfades between a flowing
   ribbon, a soft blob and the salon's own gold medallion as the visitor
   scrolls, with the same restrained bloom pass as Services.
   ========================================================================== */
(function () {
  'use strict';

  var canvas = document.getElementById('about-cinema');
  var run = document.querySelector('.cinema-run');
  if (!canvas || !run) return;

  import('./cinematic-loader.js').then(function (loader) {
    if (!loader.guardsPass()) return;

    function boot() {
      Promise.all([loader.loadCinematic(), loader.loadBloom(), import('./beauty-scenes.js'), import('./medallion.js')])
        .then(function (mods) {
          startScene(mods[0].THREE, mods[0].gsap, mods[0].ScrollTrigger, mods[1], mods[2], mods[3].buildMedallion);
        })
        .catch(function () { /* scene didn't load — the real content still works fine */ });
    }
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(boot, { timeout: 800 });
    } else {
      window.setTimeout(boot, 150);
    }
  });

  function startScene(THREE, gsap, ScrollTrigger, bloomMods, beautyScenes, buildMedallion) {
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
    var medallion = buildMedallion(THREE, 2.0);
    var scenes = [beautyScenes.buildRibbonFlow(THREE), beautyScenes.buildFacialBlob(THREE), medallion];
    scenes.forEach(function (g) {
      g.traverse(function (o) { if (o.material) { o.material.transparent = true; o.material.emissiveIntensity = (o.material.emissiveIntensity || 0.22) + 0.28; } });
      world.add(g);
    });

    var composer = new bloomMods.EffectComposer(renderer);
    composer.addPass(new bloomMods.RenderPass(scene, camera));
    var bloomPass = new bloomMods.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.55, 0.5, 0.42);
    composer.addPass(bloomPass);
    composer.addPass(new bloomMods.OutputPass());

    var pointer = { x: 0, y: 0 }, pointerTarget = { x: 0, y: 0 };
    window.addEventListener('mousemove', function (e) {
      pointerTarget.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointerTarget.y = (e.clientY / window.innerHeight - 0.5) * 2;
    });

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
        g.rotation.y += dt * (0.13 + i * 0.045);
        g.rotation.x = pointer.y * 0.14;
        g.scale.setScalar(0.55 + op * 0.85);
        g.traverse(function (o) { if (o.material) o.material.opacity = op; });
      });

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
