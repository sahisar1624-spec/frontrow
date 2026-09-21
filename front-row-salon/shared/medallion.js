/* ==========================================================================
   FRONT ROW BEAUTY SALON — shared gold medallion builder
   Used by both the homepage hero and the page-hero accent on every interior
   page, so the crest's geometry, materials and orientation stay identical
   everywhere instead of drifting apart across two copies of the same code.

   The face is built from two flat circles (not a cylinder's end caps) so the
   crest texture keeps the exact up/down and left/right of the source image
   — a cylinder's cap UVs are mirrored on one side, which is what made the
   very first version of this render upside down.
   ========================================================================== */
export function buildMedallion(THREE, radius) {
  var group = new THREE.Group();

  var rimMat = new THREE.MeshPhysicalMaterial({
    color: 0xd4af6a, metalness: 0.9, roughness: 0.2, clearcoat: 0.6, clearcoatRoughness: 0.2
  });

  var thickness = radius * 0.147;
  var sideGeo = new THREE.CylinderGeometry(radius, radius, thickness, 72, 1, true);
  sideGeo.rotateX(Math.PI / 2);
  group.add(new THREE.Mesh(sideGeo, rimMat));

  var bezel = new THREE.Mesh(new THREE.TorusGeometry(radius, radius * 0.024, 16, 96), rimMat);
  group.add(bezel);

  /* a plain placeholder for each face until the crest texture is in —
     replaced below the instant it loads, so there's never a gap in the coin */
  var frontPlaceholder = new THREE.Mesh(new THREE.CircleGeometry(radius, 72), rimMat);
  frontPlaceholder.position.z = thickness / 2;
  group.add(frontPlaceholder);
  var backPlaceholder = new THREE.Mesh(new THREE.CircleGeometry(radius, 72), rimMat);
  backPlaceholder.position.z = -thickness / 2;
  backPlaceholder.rotation.y = Math.PI;
  group.add(backPlaceholder);

  var loader = new THREE.TextureLoader();
  loader.load('images/logo-mark.jpg', function (tex) {
    tex.colorSpace = THREE.SRGBColorSpace;

    /* front: the crest reads normally facing the camera */
    var faceMat = new THREE.MeshStandardMaterial({ map: tex, metalness: 0.15, roughness: 0.55 });
    var face = new THREE.Mesh(new THREE.CircleGeometry(radius, 72), faceMat);
    face.position.z = thickness / 2;
    group.add(face);
    group.remove(frontPlaceholder);

    /* back: the same crest, same texture — rotating the mesh 180° about Y
       to face outward already lands the logo right-side up and readable
       (verified against a render from a camera on that side); flipping
       the texture on top of that rotation is what made it read backwards */
    var backMat = new THREE.MeshStandardMaterial({ map: tex, metalness: 0.15, roughness: 0.55 });
    var back = new THREE.Mesh(new THREE.CircleGeometry(radius, 72), backMat);
    back.position.z = -thickness / 2;
    back.rotation.y = Math.PI;
    group.add(back);
    group.remove(backPlaceholder);
  });

  return group;
}
