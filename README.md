# Khaleeq Fans: Khaleeq Engineering website

A 3D website for **Khaleeq Engineering (Khaleeq Fans)**. The flagship Dairy Fan is a real-time, procedurally built Three.js model. As you scroll it spins up, orbits, explodes into labelled parts, reassembles, and then flies into a low-poly cattle shed with other fans, cows and shower mist.

**Stack:** Next.js 15 (App Router, static export) · TypeScript · React Three Fiber + drei · GSAP ScrollTrigger · Lenis · Tailwind CSS · Framer Motion.

---

## a) Run it

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # static site → ./out
npm start            # serve ./out locally
```

Node 18.18+ is required (built and tested on Node 22).

## b) Add a new product

1. Drop the photos into `public/assets/products/` (for example `dairy-fan-50-1.jpg` and `dairy-fan-50-2.jpg`).
2. Add one entry to `src/data/products.json`:

```json
{
  "id": "dairy-fan-50",
  "name": "Khaleeq Dairy Fan 50\"",
  "nameUr": "خلیق ڈیری فین 50 انچ",
  "category": "dairy-fans",
  "images": ["/assets/products/dairy-fan-50-1.jpg", "/assets/products/dairy-fan-50-2.jpg"],
  "shortDesc": "…",
  "specs": { "Size": "50\"", "Motor": "…", "Blades": "3 × ABS", "RPM": "…", "Air Delivery": "…", "Power": "…" },
  "featured": true,
  "whatsappText": "Assalam o Alaikum, I want a quote for Khaleeq Dairy Fan 50\""
}
```

3. (Recommended) run `npm run images`. It writes WebP files at 400/800/1600 px plus a blur-up placeholder into `public/optimized/` and records them in `src/data/image-manifest.json`. Without this step the original photo is used as is.
4. `npm run build` and deploy.

Notes:
- Categories: `dairy-fans`, `wiring`, `panel-boards`, `milking-parlour`, `auto-manual-systems`, `showering-systems`, `milking-spare-parts`, `vacuum-pumps` (labels live in `src/data/categories.json`). Filter chips only appear for categories that have products.
- The second image is shown when you hover a product card.
- Each product gets its own page at `/products/<id>/` with Product schema.
- When there are two or more `dairy-fans` products, the Dairy Fan section on the home page shows a size/variant selector.
- **Delete the four `"sample": true` entries** once real products are in.
- Installations work the same way: add photos to `public/assets/installations/` and entries to `src/data/installations.json`: `{ "id": "farm-1", "title": "…", "location": "Okara", "image": "/assets/installations/farm-1.jpg", "before": "/assets/installations/farm-1-before.jpg" }`. `before` is optional; when set, the lightbox shows a before/after slider.
- Services: `src/data/services.json`. Testimonials: `src/data/testimonials.json` (`[{ "name": "…", "place": "…", "text": "…" }]`). **Add real reviews only.**

## c) Change the phone / WhatsApp number and company details

Everything is in **`src/lib/site.ts`**:

- `whatsapp`: digits only with country code, e.g. `"923001234567"`. This drives every WhatsApp button, the floating button, the quote form and `tel:` links. You can also set the `NEXT_PUBLIC_WHATSAPP` environment variable at build time.
- `phoneDisplay`, `email`, `address`, `city`, `timings`, `facebook`
- `mapEmbed`: Google Maps → Share → Embed a map → copy the `src` URL
- `stats`: real numbers only (`{ value: 250, suffix: "+", label: "Fans installed" }`). While the array is empty, the counters stay hidden.
- `url` (or `NEXT_PUBLIC_SITE_URL`): your domain. It is used in the sitemap, canonical URLs and JSON-LD.

All UI text, English and Urdu, lives in **`src/lib/dictionary.ts`**. Any key missing from `ur` falls back to English. Data files take an optional `nameUr` / `titleUr` / `shortUr` field.

## d) Deploy

The build is a plain static site in `./out`, so it runs on any host.

- **Vercel:** import the repo; the framework is detected automatically. Set `NEXT_PUBLIC_SITE_URL` / `NEXT_PUBLIC_WHATSAPP` if you use them.
- **Netlify:** build command `npm run build`, publish directory `out`.
- **cPanel / any shared hosting:** run `npm run build`, then upload the **contents** of `out/` into `public_html/`. URLs end in `/` (`trailingSlash`), so each page is a folder with an `index.html` and no server rewrites are needed.

---

## How the 3D works

| File | What it does |
|---|---|
| `src/scene/DairyFan.tsx` | Procedural fan matched to the owner's walkaround video: matte grey-teal drum (#7E9CA0) with rolled lip, wire handles, mounting tabs, seam + screws; pale-aqua (#A8D8D4) welded wire guards front and back, with two flat bars over the front grid; 3 black paddle blades with leading-edge rib and an embossed "KHALEEQ FAN" decal, each on a dark cone root; silver three-lobed cast hub; two box-section rear bars carrying a plate with a dark ribbed direct-drive motor and white cables. Inertial spin-up, motion-blur disc at high RPM, exploded offsets, leader-line labels. |
| `src/scene/Airflow.tsx` | GPU particle stream out of the fan front (all motion in the vertex shader). |
| `src/scene/Shed.tsx` | Free-stall shed modelled on the reference photos: maroon steel portal frames, grey corrugated roof with skylight ridge, central feed alley with hay windrows, blue head-lock rails, ~40 instanced Holsteins eating on both sides, 8 fans hung from the rafters tilted down along the shed, shower lines with mist. The background shifts from studio night to daylight as the shed builds. |
| `src/scene/StoryScene.tsx` | Canvas, studio lighting (Lightformer environment, no HDRI download), camera rig, `PerformanceMonitor` (drops DPR and particle counts on slow devices). |
| `src/components/ScrollStory.tsx` | **One GSAP timeline bound to ScrollTrigger (`scrub: 1`)** drives camera, target, screen offset, RPM, explode, labels, shed, install and mist, plus the text panels. Scrolls smoothly forwards and backwards. |

Story map: 0–10% hero spin-up → 10–25% orbit to ¾ → 25–40% top-down → 40–60% exploded view with labels + blueprint grid → 60–70% reassemble with settle shake → 70–85% the fan flies to its rafter and the camera looks down the feed alley → 85–100% pull back to an aerial view of the shed roof, wipe to brand blue → Services.

### Performance and fallbacks
- The page paints a **poster image** first (`public/assets/fan/poster.webp`, plus a portrait version for mobile, ~40 KB each). The 3D bundle is code-split and fades in once its first frames render, behind a spinning-fan % loader. Home page first-load JS is ~219 KB; three.js loads afterwards.
- DPR is clamped to [1, 1.5] on mobile and [1, 2] on desktop, with reduced particle counts on mobile. Rendering pauses when the story is off-screen.
- **No WebGL, `prefers-reduced-motion`, or a weak device** (≤2 GB RAM or ≤2 cores): no 3D. The poster is shown and the story is rendered as plain readable sections. With JavaScript off, all content is still visible.
- Regenerate posters and the OG image after changing the model: `npm run build && npx serve out -l 4173`, then in another terminal run `CHROME_PATH=/path/to/chrome npm run poster -- http://localhost:4173`.

### Not yet done / next steps
- **Fan model** was matched to the walkaround video (colours, hub, motor, rear frame). Blades are modelled black (as in the brief and the motor-side shots); the video also shows a fan with galvanised silver blades. Say which you want, or both as variants.
- The video's voice-over could not be transcribed here (speech-to-text model downloads are blocked in this environment).
- Pre-rendered **MP4 / image-sequence** fallback for low-end phones. Currently they get the static poster plus text; a scroll-scrubbed video can be recorded from the 3D scene once the model is approved.
- Lottie icons: the service icons are animated SVG/CSS instead, which is lighter.
- Post-processing (bloom/SMAA) was left out to keep mobile fast; antialiasing is native MSAA.
- Lighthouse has not been run in this environment (no network-throttled Chrome available). Run it on the deployed URL.
- Background removal for product photos is not automated. Shoot on a plain backdrop or remove the background before adding.
- Urdu strings are written but **need review by a native speaker**. Data entries in Urdu (`nameUr`, etc.) are partial.

---

## [PLACEHOLDER] checklist

| Where | What to fill in |
|---|---|
| `src/lib/site.ts` | `whatsapp` number, `phoneDisplay`, `email`, `address`, `city`, `timings`, `facebook` page URL, `mapEmbed`, `stats` (real numbers), `url` (domain) |
| `src/data/products.json` | Real products; replace every `"[PLACEHOLDER]"` spec (Size, Motor, RPM, Air Delivery, Power, Type, Capacity); remove `"sample": true` entries |
| `src/data/installations.json` | Real installation photos (currently empty → "coming soon" message) |
| `src/data/testimonials.json` | Real customer reviews only (currently empty → placeholder box) |
| `src/data/services.json` | Review descriptions; add service photos to `images` |
| `public/assets/fan/` | Fan reference photos (front, ¾, side, top, blade close-up) for model fine-tuning |
| Dairy Fan section | "Download brochure" button is disabled until a PDF is provided |
| `src/lib/dictionary.ts` | Urdu translations: native-speaker review |

## Scripts

| Command | Purpose |
|---|---|
| `npm run images` | Optimise photos → WebP 400/800/1600 + blur placeholders |
| `npm run poster` | Capture poster / mobile poster / OG image from the 3D scene |
| `npm run logo` | Rebuild the transparent logo PNGs + favicon from `public/assets/logo/logo-source.jpg` |
| `npm run lint` | Type-check |
| `scripts/shot.mjs`, `scripts/shot-sections.mjs` | Dev helpers to screenshot the story / sections with Playwright |
