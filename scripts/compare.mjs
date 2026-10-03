// Dev helper: renders the fan from fixed angles (?view=...) for side-by-side checks against reference photos.
// usage: node scripts/compare.mjs <baseUrl> <outDir>
import { chromium } from "playwright-core";
const [base = "http://localhost:4173", out = "."] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
for (const view of ["hub", "rear", "side", "top"]) {
  const p = await b.newPage({ viewport: { width: 450, height: 800 } });
  p.on("pageerror", (e) => console.log("pageerror", e.message));
  await p.goto(`${base}/poster-render/?view=${view}`, { waitUntil: "networkidle" });
  await p.addStyleTag({ content: "header,footer,.kcursor,a[aria-label]{display:none!important}" });
  await p.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
  await p.waitForTimeout(2500);
  await p.screenshot({ path: `${out}/cmp-${view}.png` }); await p.close();
}
await b.close();
