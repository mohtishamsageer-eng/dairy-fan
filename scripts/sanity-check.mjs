import { chromium } from 'playwright';

const url = process.argv[2] || 'http://localhost:4173/';
const out = process.argv[3] || '/tmp/sanity.png';

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blacklist'],
});
const page = await browser.newPage({ viewport: { width: 960, height: 540 } });

const logs = [];
page.on('console', (msg) => logs.push(`[console:${msg.type()}] ${msg.text()}`));
page.on('pageerror', (err) => logs.push(`[pageerror] ${err.message}\n${err.stack || ''}`));

await page.goto(url, { waitUntil: 'load' });
await page.waitForTimeout(1500);

const hasApi = await page.evaluate(() => typeof window.__dairyFan !== 'undefined');
logs.push(`window.__dairyFan present: ${hasApi}`);

if (hasApi) {
  await page.evaluate(() => {
    window.__dairyFan.setSize(960, 540);
    window.__dairyFan.freeze();
  });
  await page.evaluate((t) => window.__dairyFan.renderAt(t), 3.0);
}

await page.screenshot({ path: out });
console.log(logs.join('\n'));
console.log(`Screenshot saved to ${out}`);

await browser.close();
