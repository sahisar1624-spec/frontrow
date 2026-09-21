/* ==========================================================================
   FRONT ROW BEAUTY SALON — reusable full-bleed ambient 3D backdrop
   For pages whose real content (photos, a stylist carousel, a form) needs
   to stay exactly as it is — no glass-card restructuring, no crossfading
   acts — but still wants the same bold, bloom-lit presence as Services
   and About behind it. One persistent scene, built by a caller-supplied
   function, that fades in while its host section is in view and fades
   out once scrolled past.

   startAmbientScene(canvasId, hostSelector, buildFn) — buildFn(THREE)
   returns a THREE.Group added to the scene once.
   ========================================================================== */
export function startAmbientScene(canvasId, hostSelector, buildFn, opts) {
  var canvas = document.getElementById(canvasId);
  var host = document.querySelector(hostSelector);
  if (!canvas || !host) return;
  opts = opts || {};

  import('./cinematic-loader.js').then(function (loader) {
    if (!loader.guardsPass()) return;

    function boot() {
      Promise.all([loader.loadCinematic(), loader.loadBloom()])
        .then(function (mods) { run(mods[0].THREE, mods[1]); })
        .catch(function () { /* scene didn't load — the real content still works fine */ });
    }
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(boot, { timeout: 800 });
    } else {
      window.setTimeout(boot, 150);
    }
  });

  function run(THREE, bloomMods) {
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, opts.camZ || 9);

    scene.add(new THREE.AmbientLight(0x392d22, 1.1));
    var key = new THREE.DirectionalLight(0xd4af6a, 2.6);
    key.position.set(4, 5, 6);
    scene.add(key);
    var rim = new THREE.DirectionalLight(0xe0a3b4, 1.6);
    rim.position.set(-5, -2, -4);
    scene.add(rim);
    var fill = new THREE.DirectionalLight(0xf6efe3, 0.55);
    fill.position.set(0, -3, 5);
    scene.add(fill);

    var group = buildFn(THREE);
    group.traverse(function (o) { if (o.material) o.material.emissiveIntensity = (o.material.emissiveIntensity || 0.22) + 0.25; });
    scene.add(group);

    var composer = new bloomMods.EffectComposer(renderer);
    composer.addPass(new bloomMods.RenderPass(scene, camera));
    var bloomPass = new bloomMods.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), opts.bloomStrength || 0.5, 0.5, 0.4);
    composer.addPass(bloomPass);
    composer.addPass(new bloomMods.OutputPass());

    var pointer = { x: 0, y: 0 }, pointerTarget = { x: 0, y: 0 };
    window.addEventListener('mousemove', function (e) {
      pointerTarget.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointerTarget.y = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    import('./cinematic-loader.js').then(function () {
      var gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
      if (!gsap || !ScrollTrigger) return;
      var vt = ScrollTrigger.create({
        trigger: host, start: 'top bottom', end: 'bottom top',
        onEnter: function () { canvas.classList.add('is-ready'); },
        onLeave: function () { canvas.classList.remove('is-ready'); },
        onEnterBack: function () { canvas.classList.add('is-ready'); },
        onLeaveBack: function () { canvas.classList.remove('is-ready'); }
      });
      if (window.scrollY >= vt.start && window.scrollY <= vt.end) canvas.classList.add('is-ready');
    });

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
      group.rotation.y += dt * (opts.spinSpeed || 0.1);
      group.rotation.x = pointer.y * 0.12;
      camera.position.x = pointer.x * 0.5;
      camera.lookAt(0, 0, 0);
      composer.render();
    }
    tick();
  }
}
