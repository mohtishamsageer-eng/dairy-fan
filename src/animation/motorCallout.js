import * as THREE from 'three';
import { DIMS, MOUNT } from '../constants.js';
import { makeLabelSprite, fadeWindow } from './utils.js';

// Nameplate anchor in the fan-rig's local space (matches motor.js placement).
const anchor = new THREE.Vector3(DIMS.motorRadius * 0.98, 0, MOUNT.motorCenterZ + 0.5);
const cardPos = new THREE.Vector3(anchor.x + 10, anchor.y + 9, anchor.z + 2);

export function createMotorCallout() {
  const root = new THREE.Group();
  root.name = 'motor-callout';

  const lineMat = new THREE.LineBasicMaterial({ color: 0xfff3d6, transparent: true });
  const lineGeo = new THREE.BufferGeometry().setFromPoints([anchor, cardPos]);
  const leader = new THREE.Line(lineGeo, lineMat);
  root.add(leader);

  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 12), new THREE.MeshBasicMaterial({ color: 0xfff3d6, transparent: true }));
  dot.position.copy(anchor);
  root.add(dot);

  const line1 = makeLabelSprite('0.55 kW  ·  900 RPM', { color: '#fff3d6', fontSize: 46 });
  line1.position.copy(cardPos).add(new THREE.Vector3(0, 2.4, 0));
  const line2 = makeLabelSprite('SINGLE PHASE & THREE PHASE', { color: '#ffd27a', fontSize: 34 });
  line2.position.copy(cardPos).add(new THREE.Vector3(0, -1.0, 0));
  root.add(line1, line2);

  function update(t) {
    const opacity = fadeWindow(t, 18.2, 21.7, 0.7, 0.5);
    lineMat.opacity = opacity;
    dot.material.opacity = opacity;
    line1.material.opacity = opacity;
    line2.material.opacity = opacity;
    root.visible = opacity > 0.003;
  }

  return { root, update };
}
