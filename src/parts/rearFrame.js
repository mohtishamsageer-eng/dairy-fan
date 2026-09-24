import * as THREE from 'three';
import { DIMS, MOUNT } from '../constants.js';

function hollowTube(length, size, mat) {
  // Square tube, "open ends" per the brief: a box shell with a slightly
  // recessed/darker end face to read as hollow when seen end-on.
  const group = new THREE.Group();
  const outer = new THREE.Mesh(new THREE.BoxGeometry(size, size, length), mat);
  group.add(outer);
  const capGeo = new THREE.PlaneGeometry(size * 0.7, size * 0.7);
  const capMat = new THREE.MeshStandardMaterial({ color: 0x1c1f21, roughness: 0.9 });
  for (const sign of [1, -1]) {
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.z = (sign * length) / 2 - sign * 0.01;
    if (sign === 1) cap.rotation.y = Math.PI;
    group.add(cap);
  }
  return group;
}

export function createRearFrame(materials) {
  const frame = new THREE.Group();
  frame.name = 'rear-frame';

  const tubeHeight = DIMS.outerDiameter; // spans the full height of the back face
  const halfSpacing = DIMS.tubeSpacing / 2;

  for (const x of [-halfSpacing, halfSpacing]) {
    const tube = hollowTube(tubeHeight, DIMS.tubeSize, materials.bluePaint);
    tube.rotation.x = Math.PI / 2; // orient the tube's long axis vertically (Y)
    tube.position.set(x, 0, MOUNT.tubeCenterZ);
    frame.add(tube);
  }

  // Horizontal bracket arms running back from the tubes to the motor plate.
  for (const x of [-halfSpacing, halfSpacing]) {
    const arm = hollowTube(MOUNT.armLength, MOUNT.armThickness, materials.bluePaint);
    arm.position.set(x, MOUNT.armCenterY, (MOUNT.zStart + MOUNT.zEnd) / 2);
    frame.add(arm);
  }

  // Flat top plate the motor is bolted to.
  const plateWidth = DIMS.tubeSpacing - DIMS.tubeSize;
  const plate = new THREE.Mesh(
    new THREE.BoxGeometry(plateWidth, MOUNT.plateThickness, MOUNT.armLength),
    materials.bluePaint
  );
  plate.position.set(0, MOUNT.plateCenterY, (MOUNT.zStart + MOUNT.zEnd) / 2);
  frame.add(plate);

  // 4 bolt+nut pairs fixing the motor foot to the plate.
  const boltPositions = [
    [-1.6, MOUNT.zStart - 1.8],
    [1.6, MOUNT.zStart - 1.8],
    [-1.6, MOUNT.zStart - MOUNT.armLength + 1.8],
    [1.6, MOUNT.zStart - MOUNT.armLength + 1.8],
  ];
  for (const [x, z] of boltPositions) {
    const bolt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.16, 0.5, 6),
      materials.bolt
    );
    bolt.position.set(x, MOUNT.plateTopY + 0.25, z);
    frame.add(bolt);
  }

  return frame;
}
