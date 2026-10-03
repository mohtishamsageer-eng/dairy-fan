// Optimises every photo in public/assets/{fan,products,installations}:
//   → public/optimized/<folder>/<name>-{400,800,1600}.webp  + a tiny blur placeholder
//   → src/data/image-manifest.json  (used by <SmartImage> for srcset + blur-up)
// Run: npm run images
import sharp from "sharp";
import { readdir, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const roots = ["fan", "products", "installations"];
const widths = [400, 800, 1600];
const manifest = {};
const skip = new Set(["poster.webp", "og.jpg"]);

for (const folder of roots) {
  const dir = path.join("public/assets", folder);
  let files = [];
  try { files = await readdir(dir); } catch { continue; }
  for (const f of files) {
    if (!/\.(jpe?g|png|webp|avif)$/i.test(f) || skip.has(f)) continue;
    const base = f.replace(/\.[^.]+$/, "");
    const src = path.join(dir, f);
    const meta = await sharp(src).rotate().metadata();
    const outDir = path.join("public/optimized", folder);
    await mkdir(outDir, { recursive: true });
    const made = [];
    for (const w of widths) {
      const ww = Math.min(w, meta.width ?? w);
      if (made.some((m) => m.w === ww)) continue;
      await sharp(src).rotate().resize({ width: ww }).webp({ quality: 78 }).toFile(path.join(outDir, `${base}-${ww}.webp`));
      made.push({ w: ww });
    }
    const blur = await sharp(src).rotate().resize(16).webp({ quality: 40 }).toBuffer();
    const url = (w) => `/optimized/${folder}/${base}-${w}.webp`;
    manifest[`/assets/${folder}/${f}`] = {
      blur: `data:image/webp;base64,${blur.toString("base64")}`,
      w: meta.width, h: meta.height,
      src: url(made[Math.min(1, made.length - 1)].w),
      srcset: made.map((m) => `${url(m.w)} ${m.w}w`).join(", "),
    };
    console.log("✓", src);
  }
}
await writeFile("src/data/image-manifest.json", JSON.stringify(manifest, null, 1));
console.log(`manifest: ${Object.keys(manifest).length} images`);
