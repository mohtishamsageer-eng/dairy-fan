// Captures the instant-load posters + social image from the live 3D scene.
//   npm run build && npx serve out -l 4173   (in another terminal)
//   CHROME_PATH=/path/to/chrome node scripts/make-poster.mjs http://localhost:4173
import { chromium } from "playwright-core";
import sharp from "sharp";
const base = process.argv[2] ?? "http://localhost:4173";
const exe = process.env.CHROME_PATH ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const b = await chromium.launch({ executablePath: exe, args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const shoot = async (w, h, query, out, fmt) => {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(`${base}/poster-render/${query}`, { waitUntil: "networkidle" });
  await p.addStyleTag({ content: "header,footer,.kcursor,a[aria-label]{display:none!important}" });
  await p.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
  await p.waitForTimeout(5000);
  const png = await p.screenshot();
  await (fmt === "jpg" ? sharp(png).jpeg({ quality: 82 }) : sharp(png).webp({ quality: 80 })).toFile(out);
  await p.close(); console.log("✓", out);
};
await shoot(1600, 900, "", "public/assets/fan/poster.webp");
await shoot(750, 1334, "", "public/assets/fan/poster-mobile.webp");
await shoot(1200, 630, "?og", "public/assets/fan/og.jpg", "jpg");
await b.close();
