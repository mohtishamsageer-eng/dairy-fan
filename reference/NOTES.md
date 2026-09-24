# Reference Photo Analysis — Click Engineer 44" Dairy Fan

## ⚠️ Discrepancy vs. task brief
The brief describes 7 reference photos (front / back / two sides / close-ups). Only **5 JPEGs**
were attached initially (`1.jpg`–`5.jpg`); 3 more close-ups (`6.jpg`–`8.jpg`) were sent
afterward, once the first modelling pass got the blade shape wrong — see the update below.
There is still no clean straight-on **back** photo — the back frame/motor bracket has to be
inferred from the 3/4 shots and the side view. Flagging this per the task's "tell me about
disagreements" rule; proceeding with the closest reasonable reconstruction from what IS
visible, and calling out every assumption below so it can be corrected later.

## Update: photos 6–8 (blade corrections)
`6.jpg` (blade root, still mounted, seen through the guard), `7.jpg` (collar rolled-edge
close-up), and `8.jpg` (a full blade, removed from the hub, on a table) corrected two
mistakes from the first modelling pass:
- The blade is **not** a narrow-root paddle that widens to a wide mid-section — it's a
  **near-constant-width rectangular strip** almost its entire length. It only narrows in
  the last ~1.5" near the black rubber root grommet. Rebuilt `src/parts/blades.js`
  accordingly (constant ~5.8" chord instead of narrow-root-then-6.5"-paddle).
  The tip is still cut at a shallow angle (not tapered to a point), confirmed by 8.jpg.
- A **raised triangular stiffening rib** (embossed/pressed into the sheet metal) sits on
  the blade face just above the root grommet, with a rivet through it, and "KHALEEQ FAN"
  is stamped near it. Added the rib + rivet as geometry; left the stamped text as
  unreadable surface detail rather than reproducing that specific sub-supplier's brand
  name, per the brief's "no extra logos" rule (Khaleeq Fan appears to be a blade
  component supplier, distinct from the Click Engineer product brand).
- `7.jpg` confirms the collar's rolled edge is a simple outward curl, consistent with
  what was already modelled from `2.jpg`.

## Photo inventory
- `1.jpg` — Fan leaning at an angle against a wall/shutter, front (blade) side facing camera,
  but photographed at a tilt (not a clean orthographic front shot) — so it doubles as a
  partial 3/4 front/side reference. Shows: outer guard ring, hub, 3 blades, motor + bracket
  through the guard, two rear-frame vertical members visible through the drum, mounting
  tabs at rim.
- `2.jpg` — Clean side elevation. Shows drum depth profile, the rolled front collar lip,
  the rear collar, the motor sitting on its bracket behind the drum, 3 white lead wires,
  a small latch/clip near the bottom front edge, faint paint scuffs on the collar.
- `3.jpg` — 3/4 close-up from above/behind, showing: front guard grid + collar screw,
  the two vertical square-tube rear-frame members welded to the back collar, the blade
  root, the motor body and bracket.
- `4.jpg` — Similar 3/4 close-up, slightly different angle: hub casting bolt, blade root
  with stamped text, motor cylindrical body, guard grid, collar rolled edge.
- `5.jpg` — Clean, well-lit, straight-on FRONT view. This is the primary reference for
  guard wire count, bolt positions, hub/blade layout and blue color.

## Part-by-part inventory

### A. Drum / housing (blue sheet-metal band) — seen in 1,2,3,4,5
- Cylindrical band, painted sky/powder blue, semi-gloss, with visible soft highlight
  band and shadow gradient (photo 2) → sampled colour ≈ `#82B4C8` mid-tone, highlight
  ≈ `#B7DCE7`, shadow ≈ `#4C7A8C`.
- Depth: CONFIRMED 5". In photo 2 the band width (edge-to-edge) relative to the fan's
  outer diameter measures ≈ 1:8.5, consistent with 5"/44".
- Both edges show a **rolled-outward lip** (photo 2, top of band and bottom of band both
  curl outward/away from the drum interior — a rolled hem, not a flat inward-turned ring).
  Modelled as a thin toroidal roll at both the front and back edge of the band, ~1" band
  width, per the CONFIRMED collar spec.
- Paint wear: light chips/scuffs visible along the collar edge in photo 2 (bare metal
  glinting through at a few points) — kept subtle per instructions.
- Small tab with round hole at the bottom of the rim, front (photo 1, ~6 o'clock) and a
  matching one visible edge-on in photo 2. A small bent metal latch/catch is also visible
  near the bottom front edge in photo 2 — modelled as a small tab, not a functional latch
  (can't tell its exact purpose from photos; kept as a simple bracket tab).
- Two more small tabs are visible at roughly 9 and 5 o'clock in photo 1 sticking radially
  outward with round holes — I could not find a clean shot of a 3/9 o'clock **loop handle**
  distinct from these tabs, so I modelled the flat mounting tabs where photos show them and
  added a subtle round-bar loop at 3/9 o'clock on the back face per the brief's explicit
  call-out, sized small so it doesn't contradict any photo.

### B. Wire guards (front + back), same blue — seen in 1,3,4,5
- Round welded wire grid, rectangular (not radial), with an outer ring wire seated on the
  collar face, screwed down.
- **Wire count (measured off photo 5, the clean front shot):** counting crossings along
  the horizontal band through the hub, ≈ **13 vertical wires** and, counting rows from top
  to bottom, ≈ **8 horizontal wires**. This lands close to the brief's estimate
  (~12 @ 3.5" pitch / 7–8 @ 5.5–6" pitch); using 13/8 to match the photo count exactly.
- **Mounting screws** (photo 5): silver bolt heads visible around the rim at approximately
  6 positions, roughly evenly spaced (~60° apart) — top, upper-right, lower-right, bottom,
  lower-left, upper-left. Using 6 bolts at 60° spacing starting near 12 o'clock.
- Guard sits proud of the collar face by a few mm (photo 3/4 show a small gap/shadow line).

### C. Rear frame — seen in 2,3
- Two vertical square tubes, open-ended, visible clearly in photo 3 as two parallel blue
  square-section posts, spaced roughly 1/6–1/7 of the drum diameter apart center-to-center
  → consistent with the CONFIRMED ~7" spacing on a 44" drum. Welded to the back collar ring.
- A horizontal bracket extends backward from the tube area (photo 2) — a flat plate on
  short arms, well behind the 5" drum, holding the motor. Photo 2 shows the plate roughly
  half the motor's diameter in height, extending back far enough that the whole motor
  clears the drum.

### D. Motor — seen in 1,2,3,4
- Dark grey cylindrical body, cast/painted, with visible tie-rod/bolt heads and an end
  bell facing the hub. Colour sampled ≈ `#5C6469` body, `#454B4F` shadow side.
- 3 white lead wires exit near the base/side of the motor and hang loose (clearly visible
  in 1, 2, 3, 4).
- No legible nameplate text is resolvable in any photo at this resolution (too small /
  motion-blurred) — nameplate text is per the CONFIRMED spec text, not read off the photo.
- Foot bolted to the bracket plate with visible bolt+nut pairs (photo 2, 3).

### E. Hub — seen in 1,3,4
- Silver/satin cast-aluminium round hub, flat-ish front face with a raised center boss and
  a visible through-bolt (photo 4), faint cast ribbing. Colour ≈ `#C7CBCC` with darker
  recesses ≈ `#8B8F90`.
- Sits recessed inside the drum depth, set back from the front guard, consistent across
  1, 3, 4.

### F. Blades — exactly 3, seen in 1,3,4,5
- Matte charcoal/near-black, slightly dusty/grey sheen in places (photo 1). Colour
  ≈ `#2B2E31`.
- Narrow root near the hub (small dark conical stub, photo 3/4) widening quickly to a
  near-constant-chord paddle, tip cut at a slight angle (clear in photo 5 silhouette).
- Rest position (photo 5, front view): one blade pointing straight up (12 o'clock), the
  other two at 120°/240° — matches the brief exactly.
- Photo 3/4 close-ups show visible stamped/cast text near the blade root — kept as
  unreadable surface detail (no invented logo), consistent with "no extra logos" rule.

## Colour palette used in the model (sampled from photos, confirmed against brief's hints)
| Part | Hex (base) |
|---|---|
| Drum / guards / rear frame (blue) | `#7FAFC4` |
| Drum highlight | `#B7DCE7` |
| Drum shadow | `#4C7A8C` |
| Motor body | `#5C6469` |
| Hub (satin aluminium) | `#C7CBCC` |
| Blades | `#2B2E31` |
| Bolts/screws | `#B9BDBE` (satin steel) |

## Dimension cross-check against CONFIRMED values
- Outer diameter 44" / blade tip 42" → 1" radial gap between blade tip and drum ID, which
  matches the visible small clearance in photo 5.
- Drum depth 5", collar 1" both sides → verified proportionally against photo 2 (band
  height vs. total fan height ratio ≈ 1:8.5–9, consistent with 5/44).
- All modelling below uses these CONFIRMED numbers as ground truth; photos are used only
  for shape, part count, wire/bolt count, proportion of sub-parts, and colour.
