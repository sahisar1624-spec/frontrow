/* ==========================================================================
   FRONT ROW SALON — shared ambient background
   A lightweight, sparse particle field used on every interior page (all
   pages except Home and Daily Affirmation, which run their own richer
   scenes). Deep-tone atmosphere only — no scroll wiring, no heavy geometry.
   Expects a <canvas id="ambient-scene" class="ambient-canvas"> in the page
   and an importmap resolving "three" before this module loads.
   ========================================================================== */

import * as THREE from 'three';

var canvas = document.getElementById('ambient-scene');
if (canvas) {
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 60);
  camera.position.set(0, 0, 14);

  // deep-tone lighting — one cool (lilac) and one warm (champagne) glow, no flat fill
  scene.add(new THREE.AmbientLight(0x2a2233, 1.1));
  var coolLight = new THREE.PointLight(0xcdb0ff, 14, 40, 2);
  coolLight.position.set(-6, 3, 6);
  scene.add(coolLight);
  var warmLight = new THREE.PointLight(0xeecaa0, 10, 40, 2);
  warmLight.position.set(7, -4, 4);
  scene.add(warmLight);

  // sparse atmospheric particles — dust, not confetti
  var COUNT = 340;
  var positions = new Float32Array(COUNT * 3);
  var colors = new Float32Array(COUNT * 3);
  var palette = [
    new THREE.Color(0xcdb0ff),
    new THREE.Color(0xeecaa0),
    new THREE.Color(0xf4ede4)
  ];
  for (var i = 0; i < COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 26;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 16;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 18;
    var c = palette[Math.floor(Math.random() * palette.length)];
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  var particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  var particleMat = new THREE.PointsMaterial({
    size: 0.045,
    vertexColors: true,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  var particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // one soft glass fragment drifting far back — a quiet echo of the hero
  // material language, kept small and out of the way of page text
  var shardGeo = new THREE.IcosahedronGeometry(2.6, 1);
  var shardMat = new THREE.MeshPhysicalMaterial({
    color: 0xcdb0ff,
    metalness: 0.05,
    roughness: 0.12,
    transmission: 0.92,
    thickness: 1.2,
    iridescence: 0.5,
    iridescenceIOR: 1.3,
    clearcoat: 1,
    envMapIntensity: 0.6
  });
  var shard = new THREE.Mesh(shardGeo, shardMat);
  shard.position.set(6.5, 2, -10);
  shard.rotation.set(0.6, 0.4, 0);
  scene.add(shard);

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onResize);

  var mouseX = 0, mouseY = 0;
  if (!prefersReducedMotion) {
    window.addEventListener('pointermove', function (e) {
      mouseX = (e.clientX / window.innerWidth - 0.5);
      mouseY = (e.clientY / window.innerHeight - 0.5);
    });
  }

  var clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    if (!prefersReducedMotion) {
      var t = clock.getElapsedTime();
      particles.rotation.y = t * 0.012;
      particles.rotation.x = Math.sin(t * 0.05) * 0.05;
      shard.rotation.y += 0.0012;
      shard.rotation.x += 0.0006;
      shard.position.y = 2 + Math.sin(t * 0.3) * 0.4;
      camera.position.x += (mouseX * 1.2 - camera.position.x) * 0.02;
      camera.position.y += (-mouseY * 0.8 - camera.position.y) * 0.02;
      camera.lookAt(0, 0, 0);
    }
    renderer.render(scene, camera);
  }
  animate();
}
