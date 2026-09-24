import { chromium } from 'playwright';

const url = process.argv[2] || 'http://localhost:4173/';
const times = (process.argv[3] || '3,10,20,25,35').split(',').map(Number);

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blacklist'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on('pageerror', (err) => console.log('[pageerror]', err.message));

await page.goto(url, { waitUntil: 'load' });
await page.waitForTimeout(1200);
await page.evaluate(() => {
  window.__dairyFan.setSize(1280, 720);
  window.__dairyFan.freeze();
});

for (const t of times) {
  await page.evaluate((t) => window.__dairyFan.renderAt(t), t);
  await page.screenshot({ path: `/tmp/timeline-${t}.png` });
  console.log('saved t=', t);
}

await browser.close();
