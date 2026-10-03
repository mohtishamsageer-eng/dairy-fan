// Dev helper: screenshots the built site. usage: node scripts/shot.mjs <url> <outPrefix> <w> <h> <frac,frac,...>
import { chromium } from "playwright-core";
const [url, out, w = 1280, h = 800, fr = "0"] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
p.on("console", (m) => ["error"].includes(m.type()) && !/ERR_CERT|404/.test(m.text()) && console.log("console", m.type(), m.text().slice(0, 300)));
p.on("pageerror", (e) => console.log("pageerror", e.message.slice(0, 300)));
await p.goto(url, { waitUntil: "networkidle" });
await p.waitForTimeout(4000);
for (const f of fr.split(",").map(Number)) {
  if (Number.isNaN(f)) continue;
  if (f > 0) { await p.evaluate((f) => { const s = document.querySelector("#home"); window.scrollTo(0, (s.offsetHeight - innerHeight) * f); }, f); await p.waitForTimeout(4500); }
  await p.screenshot({ path: `${out}-${Math.round(f * 100)}.png` });
}
await b.close();
