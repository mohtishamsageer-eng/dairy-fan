import * as THREE from 'three';
import { DIMS } from '../constants.js';
import { createBluePaintTexture } from '../textures.js';

const R_OUT = DIMS.outerRadius; // 22" — the true 44" OD envelope, reached at the rolled collar bead
const WALL_R = R_OUT - 0.16; // plain cylindrical mid-section sits just inside the rolled lip
const HALF_D = DIMS.drumDepth / 2; // 2.5"
const COLLAR_W = DIMS.collarWidth; // 1"
const SHELL_T = 0.12; // sheet-metal thickness (visual only)

function drumProfilePoints() {
  // Profile traced in the (r, z) plane, back (-Z) to front (+Z).
  // Produces a spool-like shape: rolled flare at each end, plain wall in the middle.
  const p = [];
  const z0 = -HALF_D;
  const z1 = HALF_D;

  p.push(new THREE.Vector2(WALL_R - SHELL_T, z0 + COLLAR_W)); // inner face, back collar root
  p.push(new THREE.Vector2(WALL_R - SHELL_T, z1 - COLLAR_W)); // inner face, front collar root
  p.push(new THREE.Vector2(WALL_R, z1 - COLLAR_W)); // outer face, plain wall (front)
  p.push(new THREE.Vector2(WALL_R, z0 + COLLAR_W)); // outer face, plain wall (back) -- closes wall loop implicitly via shape below

  return p;
}

// Build the drum as an outer lathe shell + inner lathe shell + two collar caps,
// so it reads correctly as a thin rolled sheet-metal band from every angle.
function buildShell(materials) {
  const segments = 96;
  const outerPts = [
    new THREE.Vector2(WALL_R, -HALF_D + COLLAR_W),
    new THREE.Vector2(WALL_R, HALF_D - COLLAR_W),
  ];
  const outerWall = new THREE.LatheGeometry(outerPts, segments);
  // LatheGeometry revolves around its local Y-axis; the fan's axis is Z, so
  // rotate the baked geometry 90° to swap them (this maps our profile's
  // "z" (Vector2.y) straight onto world Z, unchanged in sign).
  outerWall.rotateX(Math.PI / 2);

  const innerPts = [
    new THREE.Vector2(WALL_R - SHELL_T, -HALF_D + COLLAR_W),
    new THREE.Vector2(WALL_R - SHELL_T, HALF_D - COLLAR_W),
  ];
  const innerWall = new THREE.LatheGeometry(innerPts, segments);
  // flip normals for the inner wall (they face outward by default from Lathe)
  innerWall.scale(-1, 1, 1);
  innerWall.rotateX(Math.PI / 2);

  const texture = createBluePaintTexture();
  const mat = materials.bluePaint.clone();
  mat.map = texture;

  const group = new THREE.Group();
  group.add(new THREE.Mesh(outerWall, mat));
  group.add(new THREE.Mesh(innerWall, mat));

  // Collar: flat-ish ring flaring from WALL_R out to R_OUT at each end, with a
  // small rolled bead at the very tip (per photo 2's curled edge).
  function makeCollar(zRoot, sign) {
    const collarGroup = new THREE.Group();
    const zTip = zRoot + sign * COLLAR_W;
    const bendZ = zRoot + sign * COLLAR_W * 0.75;

    const pts = [
      new THREE.Vector2(WALL_R, zRoot),
      new THREE.Vector2(WALL_R + (R_OUT - WALL_R) * 0.65, bendZ),
      new THREE.Vector2(R_OUT, zTip),
    ];
    const ringGeo = new THREE.LatheGeometry(pts, segments);
    ringGeo.rotateX(Math.PI / 2);
    collarGroup.add(new THREE.Mesh(ringGeo, mat));

    // Rolled bead at the very edge — a thin torus hugging the tip.
    const bead = new THREE.Mesh(
      new THREE.TorusGeometry(R_OUT - 0.05, 0.09, 10, segments),
      mat
    );
    bead.position.z = zTip;
    collarGroup.add(bead);

    return collarGroup;
  }

  group.add(makeCollar(-HALF_D + COLLAR_W, -1)); // back collar, flares toward -Z
  group.add(makeCollar(HALF_D - COLLAR_W, 1)); // front collar, flares toward +Z

  return group;
}

function makeTab(materials) {
  const shape = new THREE.Shape();
  const w = 1.6, h = 1.3;
  shape.moveTo(-w / 2, 0);
  shape.lineTo(w / 2, 0);
  shape.lineTo(w / 2, h);
  shape.lineTo(-w / 2, h);
  shape.closePath();

  const hole = new THREE.Path();
  hole.absarc(0, h * 0.55, 0.28, 0, Math.PI * 2, false);
  shape.holes.push(hole);

  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.12, bevelEnabled: false });
  geo.translate(0, 0, -0.06);
  const mesh = new THREE.Mesh(geo, materials.bluePaint);
  return mesh;
}

function placeTabOnRim(tab, angleDeg, z, outward = true) {
  const angle = THREE.MathUtils.degToRad(angleDeg);
  const r = R_OUT - 0.05;
  const group = new THREE.Group();
  group.add(tab);
  tab.rotation.x = Math.PI / 2 * (outward ? 1 : -1);
  tab.position.set(0, 0, 0);
  group.position.set(Math.cos(angle) * r, Math.sin(angle) * r, z);
  group.rotation.z = angle - Math.PI / 2;
  return group;
}

function makeLoopHandle(materials) {
  // Round-bar "D" handle, welded flat against the drum wall, back face,
  // at 3 and 9 o'clock, per the brief's explicit call-out.
  const geo = new THREE.TorusGeometry(1.4, 0.14, 8, 24, Math.PI);
  const mesh = new THREE.Mesh(geo, materials.bluePaint);
  return mesh;
}

export function createDrum(materials) {
  const drum = new THREE.Group();
  drum.name = 'drum';
  drum.add(buildShell(materials));

  // Mounting tabs with round holes: bottom front, bottom back, top back.
  const backZ = -HALF_D + 0.02;
  const frontZ = HALF_D - 0.02;
  drum.add(placeTabOnRim(makeTab(materials), -90, frontZ, true)); // bottom, front
  drum.add(placeTabOnRim(makeTab(materials), -90, backZ, false)); // bottom, back
  drum.add(placeTabOnRim(makeTab(materials), 90, backZ, false)); // top, back

  // Loop handles at 3 and 9 o'clock, back face.
  const handleR = R_OUT - 0.5;
  for (const angleDeg of [0, 180]) {
    const angle = THREE.MathUtils.degToRad(angleDeg);
    const handle = makeLoopHandle(materials);
    handle.position.set(Math.cos(angle) * handleR, Math.sin(angle) * handleR, -HALF_D - 0.1);
    handle.rotation.y = Math.PI / 2;
    handle.rotation.z = angle;
    drum.add(handle);
  }

  return drum;
}
