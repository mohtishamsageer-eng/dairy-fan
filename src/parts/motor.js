import * as THREE from 'three';
import { DIMS, MOUNT } from '../constants.js';
import { createNameplateTexture } from '../textures.js';

export function createMotor(materials) {
  const motor = new THREE.Group();
  motor.name = 'motor';

  const r = DIMS.motorRadius;
  const len = DIMS.motorLength;

  const body = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 24), materials.motor);
  body.rotation.x = Math.PI / 2;
  motor.add(body);

  // Front / rear end bells, slightly larger than the body.
  for (const sign of [1, -1]) {
    const bell = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.05, r * 0.95, 0.9, 24), materials.motor);
    bell.rotation.x = Math.PI / 2;
    bell.position.z = (sign * len) / 2;
    motor.add(bell);
  }

  // Tie-rods along the body, 4 around the circumference.
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2 + Math.PI / 4;
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, len + 1.6, 8), materials.bolt);
    rod.rotation.x = Math.PI / 2;
    rod.position.set(Math.cos(angle) * r * 1.02, Math.sin(angle) * r * 1.02, 0);
    motor.add(rod);
  }

  // Output shaft, protruding forward toward the hub.
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 3.2, 12), materials.bolt);
  shaft.rotation.x = Math.PI / 2;
  shaft.position.z = len / 2 + 1.6;
  motor.add(shaft);

  // Foot, bolted down to the bracket plate.
  const foot = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.5, 5), materials.motor);
  foot.position.y = -r - 0.25;
  motor.add(foot);

  // Nameplate on the side facing the camera during the step-3 motor callout
  // (camera approaches from the +X / -Z quadrant during that orbit).
  const nameplate = new THREE.Mesh(
    new THREE.PlaneGeometry(2.6, 1.3),
    new THREE.MeshStandardMaterial({ map: createNameplateTexture(), roughness: 0.5, metalness: 0.3 })
  );
  nameplate.position.set(r * 0.98, 0, 0.5);
  nameplate.rotation.y = Math.PI / 2;
  motor.add(nameplate);

  // 3 white lead wires exiting near the base, hanging loose.
  const wireMat = materials.wireLead;
  for (let i = 0; i < 3; i++) {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.3 * (i - 1), -r - 0.4, len / 2 - 1.5),
      new THREE.Vector3(0.5 * (i - 1), -r - 1.6, len / 2 - 1.0),
      new THREE.Vector3(0.7 * (i - 1), -r - 2.6 - i * 0.3, len / 2 - 0.2),
      new THREE.Vector3(0.9 * (i - 1), -r - 3.6 - i * 0.4, len / 2 + 0.6),
    ]);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 16, 0.055, 6, false), wireMat);
    motor.add(tube);
  }

  motor.position.z = MOUNT.motorCenterZ;
  return motor;
}
