import * as THREE from 'three';
import { DIMS, GUARD } from '../constants.js';

const RING_R = DIMS.outerRadius - 0.35; // guard ring sits just inside the collar's outer edge
const WIRE_R = GUARD.wireRadius;

// CylinderGeometry's axis is Y by default, which is exactly "vertical" in the
// guard's local XY plane, so vertical wires need no extra rotation.
function makeVerticalWire(x, r, mat) {
  const halfChord = Math.sqrt(Math.max(r * r - x * x, 0));
  const len = halfChord * 2 * 0.985;
  if (len <= 0.05) return null;
  const geo = new THREE.CylinderGeometry(WIRE_R, WIRE_R, len, 6);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, 0, 0);
  return mesh;
}

function makeHorizontalWire(y, r, mat) {
  const halfChord = Math.sqrt(Math.max(r * r - y * y, 0));
  const len = halfChord * 2 * 0.985;
  if (len <= 0.05) return null;
  const geo = new THREE.CylinderGeometry(WIRE_R, WIRE_R, len, 6);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.z = Math.PI / 2; // lay the cylinder along X
  mesh.position.set(0, y, 0);
  return mesh;
}

function makeBolt(mat) {
  const group = new THREE.Group();
  const head = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.14, 6), mat);
  head.rotation.x = Math.PI / 2;
  group.add(head);
  return group;
}

export function createGuard(materials, { facingSign = 1 } = {}) {
  const guard = new THREE.Group();
  guard.name = facingSign > 0 ? 'guard-front' : 'guard-back';

  const mat = materials.blueWire;
  const r = RING_R;

  // Outer ring wire, seated on the collar face.
  const ring = new THREE.Mesh(new THREE.TorusGeometry(r, WIRE_R * 1.15, 8, 96), mat);
  guard.add(ring);

  // Rectangular grid, counts matched to reference photo 5.
  const vCount = GUARD.vertCount;
  const hCount = GUARD.horizCount;

  for (let i = 0; i < vCount; i++) {
    const t = (i + 1) / (vCount + 1); // keep outermost wires inset from tangent points
    const x = THREE.MathUtils.lerp(-r, r, t);
    const wire = makeVerticalWire(x, r, mat);
    if (wire) guard.add(wire);
  }

  for (let i = 0; i < hCount; i++) {
    const t = (i + 1) / (hCount + 1);
    const y = THREE.MathUtils.lerp(-r, r, t);
    const wire = makeHorizontalWire(y, r, mat);
    if (wire) guard.add(wire);
  }

  // Mounting bolts around the ring, matched count from photo 5.
  const boltMat = materials.bolt;
  for (let i = 0; i < GUARD.boltCount; i++) {
    const angle = Math.PI / 2 + (i * Math.PI * 2) / GUARD.boltCount;
    const bolt = makeBolt(boltMat);
    bolt.position.set(Math.cos(angle) * r, Math.sin(angle) * r, facingSign * 0.05);
    guard.add(bolt);
  }

  guard.position.z = 0; // caller positions the whole guard group at the collar plane
  return guard;
}
