/* ==========================================================================
   FRONT ROW BEAUTY SALON — beauty-inspired 3D object builders
   Three small abstract forms, each keyed to one of the salon's real service
   pillars (Hair / Nails / Body &amp; Face), built from the same brass-and-
   blush material language as the rest of the site's 3D layer. Shared so the
   Services scroll-story and (later) other cinematic pages can reuse the
   exact same objects instead of re-describing them.
   ========================================================================== */

function brassMat(THREE, opts) {
  var base = {
    color: 0xd4af6a, metalness: 0.75, roughness: 0.3, clearcoat: 0.5, clearcoatRoughness: 0.25,
    emissive: 0xd4af6a, emissiveIntensity: 0.22
  };
  var merged = Object.assign({}, base, opts || {});
  if (opts && opts.color && !opts.emissive) merged.emissive = opts.color;
  return new THREE.MeshPhysicalMaterial(merged);
}

/* HAIR — a handful of flowing ribbon-strands, each its own gentle curve */
export function buildHairStrands(THREE) {
  var group = new THREE.Group();
  var palette = [0xd4af6a, 0xe0a3b4, 0xf6efe3, 0xc79a52];
  var strandCount = 6;
  for (var i = 0; i < strandCount; i++) {
    var t = i / (strandCount - 1);
    var spread = (t - 0.5) * 3.2;
    var pts = [];
    for (var j = 0; j < 6; j++) {
      var jt = j / 5;
      pts.push(new THREE.Vector3(
        spread + Math.sin(jt * Math.PI * 1.4 + i) * 0.5,
        (jt - 0.5) * 4.2,
        Math.cos(jt * Math.PI * 1.1 + i * 0.7) * 0.9 - 0.4
      ));
    }
    var curve = new THREE.CatmullRomCurve3(pts);
    var tube = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 64, 0.05 + (1 - t) * 0.03, 10, false),
      brassMat(THREE, { color: palette[i % palette.length], roughness: 0.28 })
    );
    group.add(tube);
  }
  return group;
}

/* NAILS — a fan of glossy, elongated capsules, like polished tips laid out */
export function buildNailFan(THREE) {
  var group = new THREE.Group();
  var count = 5;
  var mat = brassMat(THREE, { color: 0xe0a3b4, metalness: 0.55, roughness: 0.12, clearcoat: 1 });
  var goldMat = brassMat(THREE, { color: 0xd4af6a, metalness: 0.9, roughness: 0.15, clearcoat: 1 });
  for (var i = 0; i < count; i++) {
    var angle = (i / (count - 1) - 0.5) * 1.1;
    var nail = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.34, 2.1, 6, 16),
      i % 2 === 0 ? mat : goldMat
    );
    nail.position.set(Math.sin(angle) * 2.2, Math.cos(angle) * 0.6 - 0.3, -Math.abs(i - (count - 1) / 2) * 0.35);
    nail.rotation.z = -angle * 0.9;
    group.add(nail);
  }
  return group;
}

/* RIBBON — a single flowing brass ribbon, calmer than the hair strands,
   standing in for "raw, authentic brilliance" behind the About page's
   opening quote */
export function buildRibbonFlow(THREE) {
  var group = new THREE.Group();
  var curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2.8, 1.3, -0.6),
    new THREE.Vector3(-1.0, -1.1, 0.8),
    new THREE.Vector3(0.6, 1.3, -0.4),
    new THREE.Vector3(2.2, -0.8, 0.6),
    new THREE.Vector3(3.2, 1.0, -0.2)
  ]);
  var ribbon = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 160, 0.16, 24, false),
    brassMat(THREE, { metalness: 0.85, roughness: 0.22 })
  );
  group.add(ribbon);
  return group;
}

/* BODY & FACE — one soft, organic blob (hand-displaced sphere, no noise
   library needed) standing in for skin, touch, unhurried care */
export function buildFacialBlob(THREE) {
  var group = new THREE.Group();
  var geo = new THREE.IcosahedronGeometry(2.15, 5);
  var pos = geo.attributes.position;
  var v = new THREE.Vector3();
  for (var i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    var n = v.clone().normalize();
    var wobble =
      Math.sin(n.x * 2.4 + n.y * 1.7) * 0.14 +
      Math.sin(n.y * 3.1 - n.z * 2.0) * 0.1 +
      Math.sin(n.z * 2.6 + n.x * 1.3) * 0.08;
    v.addScaledVector(n, wobble);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  var blob = new THREE.Mesh(geo, brassMat(THREE, {
    color: 0xf6efe3, metalness: 0.15, roughness: 0.42, clearcoat: 0.5, clearcoatRoughness: 0.4
  }));
  group.add(blob);
  return group;
}
