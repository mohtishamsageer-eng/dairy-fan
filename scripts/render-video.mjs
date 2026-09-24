import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdir, rm, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v === undefined ? true : v];
  })
);

const WIDTH = Number(args.width || 1920);
const HEIGHT = Number(args.height || 1080);
const FPS = Number(args.fps || 60);
const DURATION = Number(args.duration || 40);
const BLUR_SAMPLES = Number(args.blurSamples || 6);
const BLUR_START = Number(args.blurStart || 23.0); // matches timeline.isBladeBlurring threshold
const OUT = args.out || 'output/dairy-fan-44.mp4';
const FRAME_DIR = args.frameDir || path.join(ROOT, '.render-frames');
const PORT = Number(args.port || 4321);
const START_FRAME = Number(args.startFrame || 0);
const END_FRAME = args.endFrame !== undefined ? Number(args.endFrame) : Math.round(DURATION * FPS) - 1;

function run(cmd, cmdArgs, opts = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, cmdArgs, { stdio: 'inherit', ...opts });
    p.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))));
    p.on('error', reject);
  });
}

async function waitForServer(url, timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // not ready yet
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`Server at ${url} did not become ready in time`);
}

async function main() {
  console.log(`Rendering ${WIDTH}x${HEIGHT} @ ${FPS}fps, ${DURATION}s, frames ${START_FRAME}-${END_FRAME}`);
  await mkdir(FRAME_DIR, { recursive: true });

  console.log('Building project...');
  await run('npx', ['vite', 'build'], { cwd: ROOT });

  console.log('Starting preview server...');
  const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
    cwd: ROOT,
    stdio: 'ignore',
  });
  const killServer = () => {
    try {
      server.kill();
    } catch {
      /* noop */
    }
  };
  process.on('exit', killServer);

  try {
    await waitForServer(`http://localhost:${PORT}/`);

    const browser = await chromium.launch({
      executablePath: '/opt/pw-browsers/chromium',
      args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blacklist', '--force-color-profile=srgb'],
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

    const total = END_FRAME - START_FRAME + 1;
    const t0 = Date.now();
    for (let i = START_FRAME; i <= END_FRAME; i++) {
      const t = i / FPS;
      const blurring = t >= BLUR_START;
      await page.evaluate(
        ({ t, blurring, samples, windowSeconds }) => {
          if (blurring) {
            window.__dairyFan.renderBlurred(t, samples, windowSeconds);
          } else {
            window.__dairyFan.renderSharp(t);
          }
        },
        { t, blurring, samples: BLUR_SAMPLES, windowSeconds: 1 / FPS }
      );
      const frameName = path.join(FRAME_DIR, `frame_${String(i).padStart(6, '0')}.png`);
      await page.screenshot({ path: frameName });

      if ((i - START_FRAME) % 30 === 0 || i === END_FRAME) {
        const done = i - START_FRAME + 1;
        const elapsed = (Date.now() - t0) / 1000;
        const rate = done / elapsed;
        const eta = (total - done) / rate;
        console.log(
          `frame ${i}/${END_FRAME} (${done}/${total}) t=${t.toFixed(2)}s blur=${blurring} — ` +
            `${rate.toFixed(2)} fps, ETA ${eta.toFixed(0)}s`
        );
      }
    }

    await browser.close();
  } finally {
    killServer();
  }

  if (args.skipEncode) {
    console.log('Skipping encode (--skipEncode).');
    return;
  }

  console.log('Encoding MP4 with ffmpeg...');
  const outPath = path.isAbsolute(OUT) ? OUT : path.join(ROOT, OUT);
  await mkdir(path.dirname(outPath), { recursive: true });
  await run('ffmpeg', [
    '-y',
    '-framerate',
    String(FPS),
    '-start_number',
    String(START_FRAME),
    '-i',
    path.join(FRAME_DIR, 'frame_%06d.png'),
    '-c:v',
    'libx264',
    '-pix_fmt',
    'yuv420p',
    '-crf',
    '18',
    '-movflags',
    '+faststart',
    outPath,
  ]);

  console.log(`Done: ${outPath}`);

  if (!args.keepFrames) {
    const files = await readdir(FRAME_DIR);
    console.log(`Cleaning up ${files.length} frame files...`);
    await rm(FRAME_DIR, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
