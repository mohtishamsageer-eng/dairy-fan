import * as THREE from 'three';
import { DIMS } from '../constants.js';

const ROOT_R = 2.0; // where the paddle shape begins (hub stub covers 0..ROOT_R)
const TIP_R = DIMS.bladeTipRadius; // 21" — CONFIRMED
const WIDEN_END = 5.5; // span position where chord reaches full width
const TIP_TAPER_START = TIP_R - 2.2;
const TIP_TRIM = 0.8; // trailing edge stops this far short of the tip (creates the angled tip cut)

const ROOT_HALF_CHORD = 0.8;
const FULL_HALF_CHORD = 3.25; // 6.5" chord
const TIP_HALF_CHORD = 2.4;

const THICKNESS = 0.22;
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
  if (y <= TIP_TAPER_START) {
    return FULL_HALF_CHORD;
  }
  const t = smoothstep(TIP_TAPER_START, TIP_R, y);
  return THREE.MathUtils.lerp(FULL_HALF_CHORD, TIP_HALF_CHORD, t);
}

function twistAt(y) {
  const t = smoothstep(ROOT_R, TIP_R, y);
  return THREE.MathUtils.degToRad(THREE.MathUtils.lerp(TWIST_ROOT_DEG, TWIST_TIP_DEG, t));
}

function buildPaddleShape() {
  const shape = new THREE.Shape();
  const N = 28;

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
  // Narrow conical stub where the blade root meets the hub (CylinderGeometry's
  // axis is already Y, which is our spanwise direction, so no rotation needed).
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.95, ROOT_R, 12), materials.blade);
  mesh.position.y = ROOT_R / 2;
  return mesh;
}

export function createBlade(materials) {
  const group = new THREE.Group();

  const shape = buildPaddleShape();
  const geo = new THREE.ExtrudeGeometry(shape, { depth: THICKNESS, bevelEnabled: false, curveSegments: 1 });
  geo.translate(0, 0, -THICKNESS / 2);
  applyTwist(geo);

  const paddle = new THREE.Mesh(geo, materials.blade);
  group.add(paddle);
  group.add(buildRootStub(materials));

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
