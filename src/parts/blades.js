import * as THREE from 'three';
import { DIMS } from '../constants.js';

// Corrected against close-up photos of a blade removed from the hub
// (reference/6.jpg, 8.jpg): the blade is NOT a narrow-root paddle that
// widens — it is a near-constant-width rectangular strip almost its whole
// length, only pinching in for the last ~1.5" where it meets the black
// rubber root grommet, with the tip cut at a shallow angle (not tapered
// to a point). A raised triangular stiffening rib sits on the face just
// above the grommet, with a rivet through it.
const ROOT_R = 2.0; // where the paddle shape begins (rubber grommet covers 0..ROOT_R)
const TIP_R = DIMS.bladeTipRadius; // 21" — CONFIRMED
const WIDEN_END = 3.6; // quick transition to full width, close to the root
const TIP_TRIM = 0.9; // trailing edge stops this far short of the tip (angled cut)

const ROOT_HALF_CHORD = 1.0;
const FULL_HALF_CHORD = 2.9; // ~5.8" chord, held constant almost to the tip

const THICKNESS = 0.2;
const TWIST_ROOT_DEG = 28; // pitch at the root
const TWIST_TIP_DEG = 15; // pitch at the tip

function smoothstep(edge0, edge1, x) {
  const t = THREE.MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function halfChordAt(y) {
  if (y <= WIDEN_END) {
    const t = smoothstep(ROOT_R, WIDEN_END, y);
    return THREE.MathUtils.lerp(ROOT_HALF_CHORD, FULL_HALF_CHORD, t);
  }
  return FULL_HALF_CHORD;
}

function twistAt(y) {
  const t = smoothstep(ROOT_R, TIP_R, y);
  return THREE.MathUtils.degToRad(THREE.MathUtils.lerp(TWIST_ROOT_DEG, TWIST_TIP_DEG, t));
}

function buildPaddleShape() {
  const shape = new THREE.Shape();
  const N = 24;

  // Leading edge, root -> tip (full span).
  const leSpan = TIP_R - ROOT_R;
  const lePoints = [];
  for (let i = 0; i <= N; i++) {
    const y = ROOT_R + (leSpan * i) / N;
    lePoints.push(new THREE.Vector2(halfChordAt(y), y));
  }

  // Trailing edge, tip -> root (span trimmed short of the true tip for the angled cut).
  const teTipY = TIP_R - TIP_TRIM;
  const teSpan = teTipY - ROOT_R;
  const tePoints = [];
  for (let i = 0; i <= N; i++) {
    const y = teTipY - (teSpan * i) / N;
    tePoints.push(new THREE.Vector2(-halfChordAt(y), y));
  }

  shape.moveTo(lePoints[0].x, lePoints[0].y);
  for (const p of lePoints.slice(1)) shape.lineTo(p.x, p.y);
  for (const p of tePoints) shape.lineTo(p.x, p.y);
  shape.closePath();

  return shape;
}

function applyTwist(geometry) {
  const pos = geometry.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const theta = twistAt(v.y);
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);
    const x = v.x * cos - v.z * sin;
    const z = v.x * sin + v.z * cos;
    pos.setXYZ(i, x, v.y, z);
  }
  pos.needsUpdate = true;
  geometry.computeVertexNormals();
}

function buildRootStub(materials) {
  // Black rubber grommet where the blade root meets the hub.
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.95, ROOT_R, 12), materials.blade);
  mesh.position.y = ROOT_R / 2;
  return mesh;
}

function buildRootRib(materials) {
  // Raised triangular stiffening rib pressed into the blade face just above
  // the root grommet, with a small rivet through it (reference/8.jpg). This
  // small feature is approximated with a single fixed twist (rather than the
  // paddle's smooth per-vertex twist) since it spans a short, near-root run
  // where the pitch angle barely changes.
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(-0.85, 2.1);
  shape.lineTo(0.85, 2.1);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.06, bevelEnabled: false });
  geo.translate(0, 0, -0.03);
  const rib = new THREE.Mesh(geo, materials.blade);
  rib.position.set(0, ROOT_R + 0.15, THICKNESS / 2);

  const rivet = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.1, 8), materials.bolt);
  rivet.rotation.x = Math.PI / 2;
  rivet.position.set(0, ROOT_R + 0.9, THICKNESS / 2 + 0.06);

  const group = new THREE.Group();
  group.add(rib, rivet);
  group.rotation.y = twistAt(ROOT_R + 1);
  return group;
}

export function createBlade(materials) {
  const group = new THREE.Group();

  const shape = buildPaddleShape();
  const geo = new THREE.ExtrudeGeometry(shape, { depth: THICKNESS, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 2, curveSegments: 1 });
  geo.translate(0, 0, -THICKNESS / 2);
  applyTwist(geo);

  const paddle = new THREE.Mesh(geo, materials.blade);
  group.add(paddle);
  group.add(buildRootStub(materials));
  group.add(buildRootRib(materials));

  return group;
}

export function createBladeSet(materials) {
  const set = new THREE.Group();
  set.name = 'blades';
  for (let i = 0; i < 3; i++) {
    const blade = createBlade(materials);
    blade.rotation.z = THREE.MathUtils.degToRad(i * 120); // 0° = straight up, matches photo 5
    set.add(blade);
  }
  return set;
}
