// Turns the supplied JPG logo into transparent PNGs (dark + light) and the app icon.
import sharp from "sharp";
const src = "public/assets/logo/logo-source.jpg";
const { data, info } = await sharp(src).greyscale().raw().toBuffer({ resolveWithObject: true });
const mk = (rgb) => {
  const out = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0; i < data.length; i++) {
    const a = Math.max(0, Math.min(255, Math.round((255 - data[i]) * 1.15)));
    out[i * 4] = rgb[0]; out[i * 4 + 1] = rgb[1]; out[i * 4 + 2] = rgb[2]; out[i * 4 + 3] = a;
  }
  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } });
};
for (const [name, rgb] of [["logo-mark-dark", [32, 35, 34]], ["logo-mark-light", [244, 247, 248]], ["logo-mark-steel", [122, 179, 204]]]) {
  await mk(rgb).trim().resize({ width: 512, height: 512, fit: "inside" }).png().toFile(`public/assets/logo/${name}.png`);
}
// app icon: light mark on navy
const mark = await mk([122, 179, 204]).trim().resize({ width: 400, height: 400, fit: "inside" }).png().toBuffer();
await sharp({ create: { width: 512, height: 512, channels: 4, background: "#0B1620" } })
  .composite([{ input: mark, gravity: "center" }]).png().toFile("src/app/icon.png");
console.log("logo done");
