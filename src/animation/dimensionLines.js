import * as THREE from 'three';
import { DIMS } from '../constants.js';
import { makeLabelSprite, fadeWindow } from './utils.js';

const AMBER = 0xffb020;

function arrowHead(dir) {
  const geo = new THREE.ConeGeometry(0.55, 1.8, 12);
  const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: AMBER, transparent: true }));
  mesh.rotation.z = dir > 0 ? -Math.PI / 2 : Math.PI / 2;
  return mesh;
}

// A horizontal (X-axis) dimension line at a given Y, from -half to +half,
// with extension lines dropping/rising to y2, arrowheads, and a text label.
function buildHorizontalDim(label, half, y, y2) {
  const group = new THREE.Group();
  const mat = new THREE.LineBasicMaterial({ color: AMBER, transparent: true });

  const lineGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-half, y, 0),
    new THREE.Vector3(half, y, 0),
  ]);
  group.add(new THREE.Line(lineGeo, mat));

  for (const x of [-half, half]) {
    const extGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x, y2, 0),
      new THREE.Vector3(x, y, 0),
    ]);
    group.add(new THREE.Line(extGeo, mat.clone()));
  }

  const leftArrow = arrowHead(1);
  leftArrow.position.set(-half + 0.9, y, 0);
  const rightArrow = arrowHead(-1);
  rightArrow.position.set(half - 0.9, y, 0);
  group.add(leftArrow, rightArrow);

  const label3d = makeLabelSprite(label, { color: '#ffd27a' });
  label3d.position.set(0, y + 3.2, 0);
  group.add(label3d);

  return group;
}

function buildDashedTipCircle(radius) {
  const points = [];
  const N = 128;
  for (let i = 0; i <= N; i++) {
    const a = (i / N) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0));
  }
  const geo = new THREE.BufferGeometry().setFromPoints(points);
  const mat = new THREE.LineDashedMaterial({ color: AMBER, dashSize: 1.4, gapSize: 0.9, transparent: true });
  const line = new THREE.Line(geo, mat);
  line.computeLineDistances();

  const label = makeLabelSprite('42" BLADE DIAMETER', { color: '#ffd27a' });
  label.position.set(0, radius + 3.2, 0);

  const group = new THREE.Group();
  group.add(line, label);
  group.userData.mat = mat;
  group.userData.label = label;
  return group;
}

function buildDepthDim() {
  // Small side-angle depth callout, drawn in the fan's local XZ-ish plane by
  // placing it near the drum edge; shown briefly at the end of step 1.
  const group = new THREE.Group();
  const mat = new THREE.LineBasicMaterial({ color: AMBER, transparent: true });
  const half = DIMS.drumDepth / 2;
  const y = DIMS.outerRadius + 6;

  const lineGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, y, -half),
    new THREE.Vector3(0, y, half),
  ]);
  group.add(new THREE.Line(lineGeo, mat));

  for (const z of [-half, half]) {
    const extGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, DIMS.outerRadius, z),
      new THREE.Vector3(0, y, z),
    ]);
    group.add(new THREE.Line(extGeo, mat.clone()));
  }

  const label = makeLabelSprite('5" DEPTH', { color: '#ffd27a', fontSize: 44 });
  label.position.set(0, y + 2.6, 0);
  group.add(label);
  return group;
}

export function createDimensionRig() {
  const root = new THREE.Group();
  root.name = 'dimension-rig';

  const odDim = buildHorizontalDim('44" OUTER DIAMETER', DIMS.outerRadius, DIMS.outerRadius + 8, DIMS.outerRadius);
  const tipCircle = buildDashedTipCircle(DIMS.bladeTipRadius);
  const depthDim = buildDepthDim();

  root.add(odDim, tipCircle, depthDim);

  function setGroupOpacity(group, opacity) {
    group.traverse((obj) => {
      if (obj.material) {
        obj.material.opacity = opacity;
        obj.visible = opacity > 0.003;
      }
    });
  }

  function update(t) {
    const odOpacity = fadeWindow(t, 0.0, 2.3, 0.5, 0.5);
    const tipOpacity = fadeWindow(t, 2.5, 5.1, 0.5, 0.5);
    const depthOpacity = fadeWindow(t, 5.4, 6.9, 0.4, 0.4);

    setGroupOpacity(odDim, odOpacity);
    setGroupOpacity(tipCircle, tipOpacity);
    setGroupOpacity(depthDim, depthOpacity);

    root.visible = odOpacity + tipOpacity + depthOpacity > 0.003;
  }

  return { root, update };
}
