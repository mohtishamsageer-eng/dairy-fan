import * as THREE from 'three';

// Subtle worn/scuffed blue paint texture for the drum + guards.
// Wear is concentrated near v=0 and v=1 (the collar bands in the Lathe UVs),
// matching the light edge wear visible in the reference photos.
export function createBluePaintTexture() {
  const w = 512;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#7fafc4';
  ctx.fillRect(0, 0, w, h);

  // Soft vertical shading so the cylinder doesn't look flat/plastic.
  const grad = ctx.createLinearGradient(0, 0, w, 0);
  grad.addColorStop(0, 'rgba(20,40,48,0.18)');
  grad.addColorStop(0.5, 'rgba(255,255,255,0.10)');
  grad.addColorStop(1, 'rgba(10,25,32,0.22)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  function scuffBand(yCenter, bandHeight, count) {
    for (let i = 0; i < count; i++) {
      const x = Math.random() * w;
      const y = yCenter + (Math.random() - 0.5) * bandHeight;
      const len = 4 + Math.random() * 14;
      const rot = Math.random() * Math.PI;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      const isChip = Math.random() < 0.3;
      ctx.fillStyle = isChip
        ? `rgba(150,155,152,${0.25 + Math.random() * 0.35})`
        : `rgba(230,240,244,${0.08 + Math.random() * 0.15})`;
      ctx.fillRect(-len / 2, -0.6, len, 1.2 + (isChip ? 1 : 0));
      ctx.restore();
    }
  }

  // Collar bands sit near the top and bottom of the texture (v≈0 and v≈1).
  scuffBand(h * 0.06, h * 0.05, 70);
  scuffBand(h * 0.94, h * 0.05, 70);
  scuffBand(h * 0.5, h * 0.9, 25); // faint general wear on the body

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createNameplateTexture() {
  const w = 512;
  const h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#d9d9d4';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#8a8a84';
  ctx.lineWidth = 6;
  ctx.strokeRect(4, 4, w - 8, h - 8);

  ctx.fillStyle = '#1c1c1a';
  ctx.textAlign = 'center';
  ctx.font = 'bold 34px Arial';
  ctx.fillText('CLICK ENGINEER', w / 2, 52);
  ctx.font = 'bold 30px Arial';
  ctx.fillText('0.55 kW  |  900 RPM', w / 2, 108);
  ctx.font = '24px Arial';
  ctx.fillText('SINGLE PHASE / THREE PHASE', w / 2, 150);
  ctx.font = '20px Arial';
  ctx.fillText('44" DAIRY FAN', w / 2, 196);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
