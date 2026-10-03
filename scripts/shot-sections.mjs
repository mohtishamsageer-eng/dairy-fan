// Dev helper: screenshot named page sections. usage: node scripts/shot-sections.mjs <url> <outPrefix> <w> <h> <id,id,...>
import { chromium } from "playwright-core";
const [url, out, w = 1280, h = 800, ids = "services"] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
p.on("pageerror", (e) => console.log("pageerror", e.message.slice(0, 300)));
await p.goto(url, { waitUntil: "networkidle" });
await p.waitForTimeout(2500);
for (const id of ids.split(",")) {
  await p.evaluate((id) => { const e = document.getElementById(id); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 70); }, id);
  await p.waitForTimeout(2500);
  await p.screenshot({ path: `${out}-${id}.png` });
}
await b.close();
