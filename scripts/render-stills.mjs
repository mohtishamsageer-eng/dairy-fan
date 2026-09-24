import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'output', 'stills');
const PORT = Number(process.argv[2] || 4323);
const WIDTH = 1600;
const HEIGHT = 1200;

// Matches the fan-rig's world placement in main.js (bottom rim on the floor).
const R = 22; // DIMS.outerRadius

// Camera placements chosen to match each reference photo's framing:
// 1.jpg/5.jpg: straight-on front; 2.jpg: clean side profile; 3.jpg/4.jpg: 3/4 close-ups.
const SHOTS = [
  { name: 'front', pos: [0, R, 150], look: [0, R, 0] },
  { name: 'back', pos: [0, R, -150], look: [0, R, 0] },
  { name: 'left', pos: [-150, R, 0], look: [0, R, 0] },
  { name: 'right', pos: [150, R, 0], look: [0, R, 0] },
  { name: 'motor-close', pos: [-34, R + 6, -58], look: [0, R - 2, -26] },
];

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: 'inherit', ...opts });
    p.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))));
  });
}

async function waitForServer(url, timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`Server at ${url} not ready`);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  await run('npx', ['vite', 'build'], { cwd: ROOT });

  const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
    cwd: ROOT,
    stdio: 'ignore',
  });

  try {
    await waitForServer(`http://localhost:${PORT}/`);

    const browser = await chromium.launch({
      executablePath: '/opt/pw-browsers/chromium',
      args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blacklist'],
    });
    const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });
    page.on('pageerror', (err) => console.error('[pageerror]', err.message));

    await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'load' });
    await page.waitForTimeout(1200);
    await page.evaluate(
      ({ w, h }) => {
        window.__dairyFan.setSize(w, h);
        window.__dairyFan.freeze();
        window.__dairyFan.setChromeVisible(false);
      },
      { w: WIDTH, h: HEIGHT }
    );
    await page.evaluate(() => {
      document.getElementById('captions').style.display = 'none';
      document.getElementById('brand').style.display = 'none';
    });

    for (const shot of SHOTS) {
      await page.evaluate((s) => {
        window.__dairyFan.setCameraLookAt(...s.pos, ...s.look);
      }, shot);
      const outPath = path.join(OUT_DIR, `${shot.name}.png`);
      await page.screenshot({ path: outPath });
      console.log('saved', outPath);
    }

    await browser.close();
  } finally {
    server.kill();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
