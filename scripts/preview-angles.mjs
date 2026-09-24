import { chromium } from 'playwright';

const url = process.argv[2] || 'http://localhost:4173/';

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blacklist'],
});
const page = await browser.newPage({ viewport: { width: 1000, height: 800 } });
page.on('pageerror', (err) => console.log('[pageerror]', err.message));

await page.goto(url, { waitUntil: 'load' });
await page.waitForTimeout(1200);
await page.evaluate(() => {
  window.__dairyFan.setSize(1000, 800);
  window.__dairyFan.freeze();
});

const R = 22; // outerRadius, fan-rig is at world y=22
const shots = [
  { name: 'front', pos: [0, R, 150], look: [0, R, 0] },
  { name: 'back', pos: [0, R, -150], look: [0, R, 0] },
  { name: 'left', pos: [-150, R, 0], look: [0, R, 0] },
  { name: 'right', pos: [150, R, 0], look: [0, R, 0] },
  { name: 'three-quarter-front', pos: [110, R + 20, 110], look: [0, R, 0] },
  { name: 'three-quarter-rear-motor', pos: [-90, R + 15, -90], look: [0, R, -20] },
  { name: 'motor-close', pos: [-25, R, -60], look: [0, R, -25] },
];

for (const s of shots) {
  await page.evaluate((s) => {
    window.__dairyFan.setCameraLookAt(...s.pos, ...s.look);
  }, s);
  await page.screenshot({ path: `/tmp/angle-${s.name}.png` });
  console.log('saved', s.name);
}

await browser.close();
