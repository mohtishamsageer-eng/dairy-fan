# Verification: render vs. reference photos

Renders in `output/stills/*.png` (1600×1200) were shot from camera angles matching each
reference photo as closely as possible, using the CONFIRMED dimensions as ground truth.

## front.png vs. 5.jpg (clean front) and 1.jpg (tilted front)
- **Silhouette / proportions**: match — 44" guard ring, 42" blade sweep with visible ~1"
  clearance to the drum wall, hub centred, one blade straight up at 12 o'clock with the
  other two at 120°/240°, as in 5.jpg.
- **Guard grid**: 13 vertical / 8 horizontal wires, matching the count measured off 5.jpg.
  Outer ring wire + 6 mounting bolts at 60° spacing, matching the visible bolt positions.
- **Rear-frame tube visible through the grid**: present and correctly positioned (matches
  the vertical member visible through the guard in 1.jpg).
- **Hub**: after the lighting fix (see below), reads as a satin mid-grey with visible
  shading/ribs, matching the tone in 5.jpg/4.jpg rather than a blown-out white disc.
- **Blades**: 3, paddle-shaped, narrow root/near-constant chord/angled tip, matte
  charcoal — matches. Foreshortening from pitch makes two of the three blades read
  narrower than the third in both the render and 5.jpg, which is the expected look for a
  pitched propeller viewed head-on (not a defect).
- **Remaining difference**: the reference photos show slightly more visible paint wear
  (small bare-metal chips) concentrated right at the collar edge than the render's subtler
  procedural wear texture. Kept intentionally subtle per the brief's "keep it subtle"
  instruction; could be pushed further if wanted.

## left.png vs. 2.jpg (side profile)
- **Drum depth**: matches the CONFIRMED 5" depth proportion (band width : overall height
  ≈ 1:8.5, same ratio visible in 2.jpg).
- **Collar / rolled edge**: the render's outward-flared collar with a rolled bead at the
  tip matches the curved lip clearly visible at the top of the drum in 2.jpg. This
  resolves the brief's "check whether it turns inward or outward" question — the photo
  shows an outward roll, which is what's modelled.
- **Motor position**: sits behind the drum on the bracket, protruding well clear of the
  5"-deep housing, matching 2.jpg's silhouette. Motor diameter/length proportions relative
  to drum depth match.
- **3 lead wires**: present, hanging loose below the motor, matching 2.jpg.
- **Small latch/tab near the bottom front edge**: present in both.
- **Remaining difference**: the reference photo's motor sits marginally closer to the
  drum (shorter shaft-to-bracket gap) than the render. Cosmetic, within the tolerance of
  the brief's "match the side photos for arm length" guidance since exact arm length
  wasn't independently confirmed.

## motor-close.png vs. 3.jpg / 4.jpg (3/4 close-ups)
- **Two vertical square tubes**: present, correctly spaced (7" centre-to-centre per the
  CONFIRMED spec), welded to the back collar — matches the tube pair clearly visible in
  3.jpg.
- **Motor + bracket**: cylindrical body with end bells and tie-rods, sitting on a flat
  plate carried by arms off the tubes, 4 foot bolts — matches the general construction
  shown across 2.jpg/3.jpg. Nameplate is present on the motor's side face (reads
  "0.55 kW / 900 RPM / SINGLE PHASE / THREE PHASE" per the CONFIRMED spec text, since no
  photo resolves the real nameplate text at usable resolution).
- **Guard wires + collar screw**: visible and correctly proportioned against the tube
  spacing, matching 3.jpg.
- **Loop handles at 3/9 o'clock**: added per the brief's explicit call-out; no reference
  photo clearly isolates this feature from the mounting tabs, so this remains the one
  modelled-from-spec-text (not photo-confirmed) element — flagged here per the "tell me
  about disagreements" instruction rather than silently guessed.

## back.png
- No reference photo shows a clean straight-on back view (see the discrepancy noted in
  `NOTES.md`: only 5 of the described 7 photos were provided). This view is the model's
  own reconstruction from the 3/4 close-ups and side profile, not a direct photo match,
  and is offered for completeness rather than as a verified match.

## Fixed during verification
- **Drum orientation bug**: the housing/collar geometry was initially built with
  `LatheGeometry`'s default revolve axis (Y) never re-oriented to the fan's Z axis,
  producing a vertical barrel shape instead of a disc facing the camera. Fixed by rotating
  the baked geometry 90° after generation.
- **Hub overexposure**: the hub's flat, camera-facing cover plate caught all four scene
  lights (key/fill/rim/hemi) at near-maximal angle simultaneously and blew out to flat
  white regardless of material colour/metalness (confirmed by isolating it with an unlit
  test material). Fixed by rebalancing overall light intensity and the hub material,
  restoring visible satin-metal shading consistent with 3.jpg/4.jpg.
- **Camera/lens tuning for the air-throw shot**: the wide-shot camera in step 4 of the
  animation needed a widened FOV and a shifted look-at target (rather than a naive
  pull-back) to keep both the fan and the full 50 ft marker line in frame — documented in
  `src/animation/timeline.js`.

## Side-by-side composites
`output/compare/compare-front.png`, `compare-side.png`, and `compare-motor.png` place each
render directly next to its matching reference photo. Overall silhouette, drum depth,
collar profile, guard grid, tube spacing, and motor/bracket construction all read as a
close match at a glance. The most visible remaining gaps in the side-by-sides:
- The reference hub shows a bit more visible cast detail/contrast (bolt head, stamped
  ring) than the render's smoother satin surface.
- The reference motor sits slightly more tucked against the rear-frame tubes (shorter
  bracket arm) than the render's slightly longer arm.
- The reference blade paddle has a touch more curvature/taper than the render's more
  straight-edged paddle outline.
None of these affect the CONFIRMED dimensions and are minor enough to leave as-is given
the "keep it subtle" / no-invented-detail guidance, but are called out here rather than
left unmentioned.

## Outstanding, acknowledged simplifications
- Blade root offset from the radial centreline (real fan blades are often not perfectly
  radially symmetric) was simplified to a symmetric paddle for tractability; not
  verifiable precisely from the available photo resolution.
- Paint-wear texture is procedural/randomised rather than traced from the exact chip
  positions in the photos, per the brief's "keep it subtle" instruction.
