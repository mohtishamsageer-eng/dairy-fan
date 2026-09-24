import * as THREE from 'three';
import { easeInOutCubic } from './utils.js';
import { createDimensionRig } from './dimensionLines.js';
import { createAirThrowRig } from './airThrow.js';
import { createMotorCallout } from './motorCallout.js';
import { stepIndexForTime } from './captions.js';

export const TOTAL_DURATION = 40;

// Camera keyframes: azimuth/elevation orbit around the fan-rig origin, at a
// constant safe radius from the fan so the orbit path never crosses through
// the model. Step 3 (14->21.5s) sweeps a clean 0deg -> 180deg to the rear 3/4
// motor view; step 4 then swings back to a front 3/4 view before sliding out
// to a side profile for the air-throw wide shot.
const BASE_FOV = 38;
const KEYFRAMES = [
  { t: 0.0, az: 0, el: 6, r: 150, fov: BASE_FOV, targetZ: 0 },
  { t: 5.3, az: 0, el: 6, r: 150, fov: BASE_FOV, targetZ: 0 },
  { t: 6.1, az: 30, el: 11, r: 138, fov: BASE_FOV, targetZ: 0 },
  { t: 6.65, az: 30, el: 11, r: 138, fov: BASE_FOV, targetZ: 0 },
  { t: 7.0, az: 0, el: 9, r: 150, fov: BASE_FOV, targetZ: 0 }, // hand off into the fixed-camera turntable
  { t: 14.0, az: 0, el: 9, r: 150, fov: BASE_FOV, targetZ: 0 },
  { t: 21.5, az: 180, el: 20, r: 100, fov: BASE_FOV, targetZ: 0 }, // rear 3/4 motor view
  { t: 25.0, az: 40, el: 12, r: 115, fov: BASE_FOV, targetZ: 0 }, // swing to a front 3/4 view as blades spin up
  // Side-elevated shot: az~90 puts the Z (throw) axis running horizontally
  // across the frame. The look-at target then slides down-range and the lens
  // widens so the fan (near end) and the full 50ft marker line (far end)
  // both stay in frame for the payoff.
  { t: 30.0, az: 88, el: 12, r: 180, fov: 55, targetZ: 0 },
  { t: 40.0, az: 88, el: 11, r: 300, fov: 72, targetZ: 280 },
];

function sampleField(t, key) {
  if (t <= KEYFRAMES[0].t) return KEYFRAMES[0][key];
  for (let i = 0; i < KEYFRAMES.length - 1; i++) {
    const a = KEYFRAMES[i];
    const b = KEYFRAMES[i + 1];
    if (t >= a.t && t <= b.t) {
      const u = b.t === a.t ? 1 : (t - a.t) / (b.t - a.t);
      return THREE.MathUtils.lerp(a[key], b[key], easeInOutCubic(u));
    }
  }
  return KEYFRAMES[KEYFRAMES.length - 1][key];
}

function cameraSpherical(target, azimuthDeg, elevationDeg, radius, out) {
  const az = THREE.MathUtils.degToRad(azimuthDeg);
  const el = THREE.MathUtils.degToRad(elevationDeg);
  const horizontal = radius * Math.cos(el);
  out.set(
    target.x + horizontal * Math.sin(az),
    target.y + radius * Math.sin(el),
    target.z + horizontal * Math.cos(az)
  );
  return out;
}

// Turntable rotation (step 2 only): a full 360° with ease-in-out.
function turntableAngle(t) {
  const start = 7.0;
  const end = 14.0;
  if (t <= start) return 0;
  if (t >= end) return Math.PI * 2;
  return easeInOutCubic((t - start) / (end - start)) * Math.PI * 2;
}

// Blade spin: stationary through steps 1-3, spins up over 3s starting at
// 21.5s using a smoothstep speed ramp, then holds a stylised full speed.
const SPIN_START = 21.5;
const SPIN_RAMP = 3.0;
const FULL_SPEED = 6 * Math.PI * 2; // rad/s — stylised for a renderable, readable blur

export function bladeAngle(t) {
  if (t <= SPIN_START) return 0;
  const u = THREE.MathUtils.clamp((t - SPIN_START) / SPIN_RAMP, 0, 1);
  const rampAngle = FULL_SPEED * SPIN_RAMP * (u ** 3 - (u ** 4) / 2);
  if (t <= SPIN_START + SPIN_RAMP) return rampAngle;
  const rampTotal = FULL_SPEED * SPIN_RAMP * 0.5;
  return rampTotal + FULL_SPEED * (t - (SPIN_START + SPIN_RAMP));
}

export function isBladeBlurring(t) {
  // True once the blades are spinning fast enough that temporal
  // supersampling (real motion blur) should be used by the render script.
  return t > SPIN_START + SPIN_RAMP * 0.5;
}

export function createTimeline({ fanRig, spinGroup }) {
  const dimensionRig = createDimensionRig();
  const airThrowRig = createAirThrowRig();
  const motorCallout = createMotorCallout();

  fanRig.add(dimensionRig.root, airThrowRig.root, motorCallout.root);

  const target = new THREE.Vector3(0, 0, 0); // fan-rig-local look-at point (world: + fanRig.position)
  const cameraPos = new THREE.Vector3();

  function update(t, camera) {
    const az = sampleField(t, 'az');
    const el = sampleField(t, 'el');
    const r = sampleField(t, 'r');
    const fov = sampleField(t, 'fov');
    target.set(0, 0, sampleField(t, 'targetZ'));
    cameraSpherical(target, az, el, r, cameraPos);
    camera.position.copy(cameraPos).add(fanRig.position);
    camera.lookAt(target.clone().add(fanRig.position));
    if (camera.fov !== fov) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }

    fanRig.rotation.y = turntableAngle(t);
    spinGroup.rotation.z = bladeAngle(t);

    dimensionRig.update(t);
    airThrowRig.update(t);
    motorCallout.update(t);

    return { stepIndex: stepIndexForTime(t) };
  }

  return { update };
}
