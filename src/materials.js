import * as THREE from 'three';
import { COLORS } from './constants.js';

export function createMaterials() {
  // envMapIntensity is kept low across the board: the synthetic RoomEnvironment
  // used for reflections has very bright "window" light sources, which on a
  // metallic material can blow straight past white after tonemapping even at
  // modest metalness — most visible on the small, camera-facing hub cover.
  const bluePaint = new THREE.MeshPhysicalMaterial({
    color: COLORS.blue,
    metalness: 0.25,
    roughness: 0.62,
    clearcoat: 0.12,
    clearcoatRoughness: 0.55,
    envMapIntensity: 0.22,
  });

  const blueWire = new THREE.MeshPhysicalMaterial({
    color: COLORS.blue,
    metalness: 0.3,
    roughness: 0.55,
    clearcoat: 0.1,
    envMapIntensity: 0.22,
  });

  const motor = new THREE.MeshPhysicalMaterial({
    color: COLORS.motor,
    metalness: 0.5,
    roughness: 0.6,
    envMapIntensity: 0.2,
  });

  const hub = new THREE.MeshPhysicalMaterial({
    color: 0x878b8d,
    metalness: 0.4,
    roughness: 0.5,
    envMapIntensity: 0.25,
  });

  const blade = new THREE.MeshStandardMaterial({
    color: COLORS.blade,
    metalness: 0.2,
    roughness: 0.8,
    envMapIntensity: 0.2,
  });

  const bolt = new THREE.MeshStandardMaterial({
    color: COLORS.bolt,
    metalness: 0.7,
    roughness: 0.4,
    envMapIntensity: 0.15,
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
