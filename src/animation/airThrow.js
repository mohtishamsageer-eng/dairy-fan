import * as THREE from 'three';
import { DIMS, FT } from '../constants.js';
import { mulberry32, makeLabelSprite, fadeWindow, clamp01 } from './utils.js';

const N = 260;
const FRONT_Z = DIMS.drumDepth / 2 + 0.3;
const PULSE_PERIOD = 2.6;
const TRAVEL_DURATION = 1.9;
const TRAVEL_DISTANCE = 52 * FT; // slightly past the 50ft marker line
const ACTIVE_START = 23.4; // gusts begin once the blades are near full speed
const ACTIVE_END = 39.6;

function buildParticles() {
  const rng = mulberry32(20240914);
  const positions = new Float32Array(N * 3);
  const seeds = [];
  for (let i = 0; i < N; i++) {
    const angle0 = rng() * Math.PI * 2;
    const radiusStart = Math.sqrt(rng()) * (DIMS.bladeTipRadius - 2);
    const phase = (i / N) * PULSE_PERIOD;
    const swirl = (rng() - 0.5) * 1.4;
    const speedJitter = 0.85 + rng() * 0.3;
    seeds.push({ angle0, radiusStart, phase, swirl, speedJitter });
    positions[i * 3 + 2] = -9999; // parked off-screen until first update
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, 'rgba(255,255,255,0.95)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 32, 32);
  const sprite = new THREE.CanvasTexture(canvas);

  const mat = new THREE.PointsMaterial({
    size: 2.6,
    map: sprite,
    transparent: true,
    depthWrite: false,
    color: 0xdfeff5,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  return { points, seeds, positions };
}

// Note: this whole rig is parented under a rig translated up by DIMS.outerRadius
// so the fan's bottom rim rests on the floor — so here, local y = -DIMS.outerRadius
// is the floor plane, and local y = 0 is the fan's axial centreline.
const FLOOR_Y = -DIMS.outerRadius;

function buildFloorMarkers() {
  const group = new THREE.Group();
  const mat = new THREE.LineBasicMaterial({ color: 0xffb020, transparent: true, opacity: 0 });
  const distancesFt = [10, 20, 30, 40, 50];
  const bars = [];
  for (const ft of distancesFt) {
    const z = FRONT_Z + ft * FT;
    const barGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-10, FLOOR_Y + 0.05, z),
      new THREE.Vector3(10, FLOOR_Y + 0.05, z),
    ]);
    const bar = new THREE.Line(barGeo, mat.clone());
    group.add(bar);
    bars.push(bar);

    const label = makeLabelSprite(`${ft} FT`, { color: '#ffcf7d', fontSize: 34, worldScale: 0.09 });
    label.position.set(12, FLOOR_Y + 4, z);
    label.material.opacity = 0;
    group.add(label);
    bars.push(label);
  }

  const bigLabel = makeLabelSprite('50 FT AIR THROW', { color: '#fff3d6', fontSize: 70, worldScale: 0.16 });
  bigLabel.position.set(0, 10, FRONT_Z + 50 * FT);
  bigLabel.material.opacity = 0;
  group.add(bigLabel);

  return { group, bars, bigLabel };
}

export function createAirThrowRig() {
  const root = new THREE.Group();
  root.name = 'air-throw';

  const { points, seeds, positions } = buildParticles();
  root.add(points);

  const { group: markerGroup, bars, bigLabel } = buildFloorMarkers();
  root.add(markerGroup);

  function update(t) {
    const markerOpacity = fadeWindow(t, 21.6, 41, 1.0, 1.0);
    for (const b of bars) b.material.opacity = markerOpacity * 0.9;

    const active = t >= ACTIVE_START && t <= ACTIVE_END;
    points.visible = active;

    if (active) {
      for (let i = 0; i < N; i++) {
        const s = seeds[i];
        const localT = ((t - ACTIVE_START + s.phase) % PULSE_PERIOD + PULSE_PERIOD) % PULSE_PERIOD;
        const progress = localT / TRAVEL_DURATION;
        if (progress > 1) {
          positions[i * 3 + 2] = -9999;
          continue;
        }
        const eased = progress;
        const z = FRONT_Z + eased * TRAVEL_DISTANCE * s.speedJitter;
        const radius = s.radiusStart + eased * 7;
        const angle = s.angle0 + eased * s.swirl;
        positions[i * 3 + 0] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = Math.sin(angle) * radius;
        positions[i * 3 + 2] = z;
      }
      points.geometry.attributes.position.needsUpdate = true;
    }

    const bigLabelOpacity = fadeWindow(t, 35.5, 41, 0.8, 1.0);
    bigLabel.material.opacity = bigLabelOpacity;

    root.visible = markerOpacity > 0.003 || active;
  }

  return { root, update };
}
