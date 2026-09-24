import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

import { DIMS, COLORS } from './constants.js';
import { createMaterials } from './materials.js';
import { createFan } from './parts/fan.js';
import { createTimeline, TOTAL_DURATION } from './animation/timeline.js';
import { CAPTIONS } from './animation/captions.js';

const container = document.getElementById('app');

const captureCanvas = document.getElementById('capture-canvas');
const captureCtx = captureCanvas.getContext('2d');

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0e10);
scene.fog = new THREE.Fog(0x0b0e10, 260, 900);

const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 1, 3000);
camera.position.set(0, DIMS.outerRadius + 8, 150);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

// --- Lighting -------------------------------------------------------------
const hemi = new THREE.HemisphereLight(0xbfd9e8, 0x1a1d1f, 0.55);
scene.add(hemi);

const key = new THREE.DirectionalLight(0xfff2df, 1.6);
key.position.set(120, 200, 160);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.near = 10;
key.shadow.camera.far = 700;
key.shadow.camera.left = -140;
key.shadow.camera.right = 140;
key.shadow.camera.top = 140;
key.shadow.camera.bottom = -140;
key.shadow.bias = -0.0015;
scene.add(key);

const fill = new THREE.DirectionalLight(0xcfe8f5, 0.6);
fill.position.set(-150, 90, -80);
scene.add(fill);

const rim = new THREE.DirectionalLight(0xffffff, 0.8);
rim.position.set(-40, 140, -220);
scene.add(rim);

// --- Floor ------------------------------------------------------------------
const materials = createMaterials();
const floorGeo = new THREE.PlaneGeometry(2000, 2000);
const floor = new THREE.Mesh(floorGeo, materials.floor);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const grid = new THREE.GridHelper(2000, 200, 0x2a3236, 0x1c2225);
grid.position.y = 0.02;
scene.add(grid);

// --- Fan ---------------------------------------------------------------------
const { group: fanGroup, spinGroup } = createFan(materials);
fanGroup.traverse((obj) => {
  if (obj.isMesh) {
    obj.castShadow = true;
    obj.receiveShadow = true;
  }
});

const fanRig = new THREE.Group();
fanRig.name = 'fan-rig';
fanRig.position.set(0, DIMS.outerRadius, 0); // rest the bottom rim on the floor
fanRig.add(fanGroup);
scene.add(fanRig);

const timeline = createTimeline({ fanRig, spinGroup });

// --- Orbit controls (manual override) ---------------------------------------
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, DIMS.outerRadius, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 40;
controls.maxDistance = 500;
let userOverride = false;
controls.addEventListener('start', () => {
  userOverride = true;
});

// --- Playback state -----------------------------------------------------------
const state = {
  t: 0,
  playing: true,
  lastWall: performance.now(),
  frozen: false,
};

function setStepUI(stepIndex) {
  document.querySelectorAll('#hud .btn[data-step]').forEach((btn) => {
    btn.classList.toggle('active', Number(btn.dataset.step) === stepIndex);
  });
}

function updateCaptions(t) {
  const entry = CAPTIONS.find((c) => t >= c.start && t < c.end) || CAPTIONS[CAPTIONS.length - 1];
  document.getElementById('cap-en').textContent = entry.en;
  document.getElementById('cap-hi').textContent = entry.hi;
}

function frame(t) {
  if (!userOverride) {
    const { stepIndex } = timeline.update(t, camera);
    setStepUI(stepIndex);
  } else {
    timeline.update(t, { position: new THREE.Vector3(), lookAt: () => {} }); // still advance rig/blade state
    controls.update();
  }
  updateCaptions(t);
  renderer.render(scene, camera);
}

function loop(now) {
  if (state.frozen) {
    requestAnimationFrame(loop);
    return;
  }
  const dt = Math.min((now - state.lastWall) / 1000, 0.05);
  state.lastWall = now;
  if (state.playing) {
    state.t += dt;
    if (state.t > TOTAL_DURATION) {
      state.t = 0;
      userOverride = false;
      controls.target.set(0, DIMS.outerRadius, 0);
    }
  }
  frame(state.t);
  requestAnimationFrame(loop);
}

// --- UI wiring ----------------------------------------------------------------
document.getElementById('btn-play').addEventListener('click', (e) => {
  state.playing = !state.playing;
  e.target.textContent = state.playing ? 'Pause' : 'Play';
});

document.getElementById('btn-replay').addEventListener('click', () => {
  state.t = 0;
  state.playing = true;
  userOverride = false;
  controls.target.set(0, DIMS.outerRadius, 0);
  document.getElementById('btn-play').textContent = 'Pause';
});

document.querySelectorAll('#hud .btn[data-step]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const STEP_STARTS = [0, 7, 14, 21.5];
    state.t = STEP_STARTS[Number(btn.dataset.step)];
    userOverride = false;
    controls.target.set(0, DIMS.outerRadius, 0);
  });
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

document.getElementById('loading').style.display = 'none';
requestAnimationFrame(loop);

// --- Deterministic API for offline rendering (Playwright + ffmpeg) ------------
window.__dairyFan = {
  scene,
  camera,
  renderer,
  fanRig,
  spinGroup,
  freeze() {
    state.frozen = true;
  },
  unfreeze() {
    state.frozen = false;
    state.lastWall = performance.now();
  },
  setSize(w, h) {
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(1);
    renderer.setSize(w, h, true);
    captureCanvas.width = w;
    captureCanvas.height = h;
  },
  // Renders a single deterministic frame at time t (seconds) with no live
  // clock / RAF involvement, for frame-by-frame video capture.
  renderAt(t) {
    timeline.update(t, camera);
    renderer.render(scene, camera);
  },
  // Shows/hides the play/pause/replay/step-tab chrome (kept out of the
  // rendered deliverable video, captions stay visible).
  setChromeVisible(visible) {
    document.body.classList.toggle('hud-hidden', !visible);
  },
  // Sharp (single-sample) frame: used for all non-fast-spin frames.
  renderSharp(t) {
    timeline.update(t, camera);
    renderer.render(scene, camera);
    updateCaptions(t);
    renderer.domElement.style.display = '';
    captureCanvas.style.display = 'none';
  },
  // Motion-blurred frame via temporal supersampling: renders `samples`
  // sub-frames centred on t across a window of `windowSeconds`, and
  // composites them into capture-canvas with an incremental running-average
  // alpha (1/(i+1)), which is mathematically exact for opaque frames.
  renderBlurred(t, samples, windowSeconds) {
    const half = windowSeconds / 2;
    for (let i = 0; i < samples; i++) {
      const st = t - half + (windowSeconds * i) / Math.max(samples - 1, 1);
      timeline.update(st, camera);
      renderer.render(scene, camera);
      captureCtx.globalAlpha = 1 / (i + 1);
      captureCtx.drawImage(renderer.domElement, 0, 0, captureCanvas.width, captureCanvas.height);
    }
    updateCaptions(t);
    renderer.domElement.style.display = 'none';
    captureCanvas.style.display = 'block';
  },
  // Places the camera directly (bypassing the guided timeline) for still
  // reference-matching shots (front/back/side/motor).
  setCameraLookAt(px, py, pz, tx, ty, tz) {
    camera.position.set(px, py, pz);
    camera.lookAt(tx, ty, tz);
    renderer.render(scene, camera);
  },
};
