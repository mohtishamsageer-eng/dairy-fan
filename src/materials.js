import * as THREE from 'three';
import { COLORS } from './constants.js';

export function createMaterials() {
  const bluePaint = new THREE.MeshPhysicalMaterial({
    color: COLORS.blue,
    metalness: 0.25,
    roughness: 0.62,
    clearcoat: 0.12,
    clearcoatRoughness: 0.55,
  });

  const blueWire = new THREE.MeshPhysicalMaterial({
    color: COLORS.blue,
    metalness: 0.3,
    roughness: 0.55,
    clearcoat: 0.1,
  });

  const motor = new THREE.MeshPhysicalMaterial({
    color: COLORS.motor,
    metalness: 0.6,
    roughness: 0.55,
  });

  const hub = new THREE.MeshPhysicalMaterial({
    color: COLORS.hub,
    metalness: 0.85,
    roughness: 0.35,
  });

  const blade = new THREE.MeshStandardMaterial({
    color: COLORS.blade,
    metalness: 0.25,
    roughness: 0.75,
  });

  const bolt = new THREE.MeshStandardMaterial({
    color: COLORS.bolt,
    metalness: 0.9,
    roughness: 0.3,
  });

  const wireLead = new THREE.MeshStandardMaterial({
    color: COLORS.wireLead,
    roughness: 0.6,
  });

  const nameplate = new THREE.MeshStandardMaterial({
    color: 0xd9d9d4,
    metalness: 0.4,
    roughness: 0.5,
  });

  const floor = new THREE.MeshStandardMaterial({
    color: COLORS.floor,
    roughness: 0.9,
    metalness: 0.05,
  });

  return { bluePaint, blueWire, motor, hub, blade, bolt, wireLead, nameplate, floor };
}
