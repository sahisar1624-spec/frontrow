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

  var back = new THREE.Mesh(new THREE.CircleGeometry(radius, 72), rimMat);
  back.position.z = -thickness / 2;
  back.rotation.y = Math.PI;
  group.add(back);

  var bezel = new THREE.Mesh(new THREE.TorusGeometry(radius, radius * 0.024, 16, 96), rimMat);
  group.add(bezel);

  var loader = new THREE.TextureLoader();
  loader.load('images/logo-mark.jpg', function (tex) {
    tex.colorSpace = THREE.SRGBColorSpace;
    var faceMat = new THREE.MeshStandardMaterial({ map: tex, metalness: 0.15, roughness: 0.55 });
    var face = new THREE.Mesh(new THREE.CircleGeometry(radius, 72), faceMat);
    face.position.z = thickness / 2;
    group.add(face);
  });

  return group;
}
