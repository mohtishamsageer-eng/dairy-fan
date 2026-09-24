import * as THREE from 'three';

export function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function clamp01(x) {
  return Math.min(1, Math.max(0, x));
}

// Returns 0 outside [start,end], eases in over `fadeIn`, holds, eases out over `fadeOut`.
export function fadeWindow(t, start, end, fadeIn, fadeOut) {
  if (t < start || t > end) return 0;
  if (t < start + fadeIn) return easeInOutCubic(clamp01((t - start) / fadeIn));
  if (t > end - fadeOut) return easeInOutCubic(clamp01((end - t) / fadeOut));
  return 1;
}

// Deterministic seeded PRNG (mulberry32) so particle motion is reproducible
// frame-by-frame regardless of render order — required for offline capture.
export function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeLabelSprite(text, { fontSize = 54, color = '#fff3d6', weight = 700, pad = 22, worldScale = 0.028 } = {}) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.font = `${weight} ${fontSize}px -apple-system, Arial, sans-serif`;
  const metrics = ctx.measureText(text);
  canvas.width = Math.ceil(metrics.width) + pad * 2;
  canvas.height = fontSize + pad * 2;

  ctx.font = `${weight} ${fontSize}px -apple-system, Arial, sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur = 10;
  ctx.fillStyle = color;
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(canvas.width * worldScale, canvas.height * worldScale, 1);
  sprite.renderOrder = 999;
  return sprite;
}
