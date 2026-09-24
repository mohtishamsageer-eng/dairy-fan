import * as THREE from 'three';
import { DIMS, Z } from '../constants.js';

export function createHub(materials) {
  const hub = new THREE.Group();
  hub.name = 'hub';

  const r = DIMS.hubRadius;

  // Main cast body: a short drum with a domed/flat front cover plate.
  const body = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 1.6, 24), materials.hub);
  body.rotation.x = Math.PI / 2;
  hub.add(body);

  const coverPlate = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.92, r * 0.92, 0.2, 24), materials.hub);
  coverPlate.rotation.x = Math.PI / 2;
  coverPlate.position.z = 0.9;
  hub.add(coverPlate);

  // Cast ribs (radial lines) for surface detail, as seen in the close-up photos.
  const ribMat = materials.hub;
  for (let i = 0; i < 6; i++) {
    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.12, r * 1.3, 0.06), ribMat);
    rib.position.z = 1.0;
    rib.rotation.z = (i * Math.PI) / 3;
    hub.add(rib);
  }

  // Centre boss + through-bolt.
  const boss = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.8, 0.5, 16), materials.hub);
  boss.rotation.x = Math.PI / 2;
  boss.position.z = 1.15;
  hub.add(boss);

  const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.3, 12), materials.bolt);
  bolt.rotation.x = Math.PI / 2;
  bolt.position.z = 1.35;
  hub.add(bolt);

  hub.position.z = Z.hubCenter;
  return hub;
}
