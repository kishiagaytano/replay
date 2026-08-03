# rePlay — Pixel Art Fix & Production Guide

This document is a practical, checklist-driven guide for producing (and fixing) the pixel
art used in the VN layer described in `VISUAL_NOVEL_CONVERSION.md`. It exists because
AI-assisted pixel art generation (via opencode or any other tool) reliably breaks in the same
handful of ways — this doc tells you exactly what's broken and exactly how to fix it, and
locks in the look established by the two reference portraits (school-uniform boy, girl —
`085ac1aa...jpg`, `6acf008c...jpg`).

Read this before touching any sprite/background asset. It's the concrete rulebook behind
§2 of `VISUAL_NOVEL_CONVERSION.md`.

---

## 1. What "good" looks like (the reference standard)

The two approved reference portraits share these traits — every asset in the game must match
all of them, not just some:

1. **Fixed pixel grid.** Every "pixel" in the art is a clean square block, aligned to a grid
   (not smeared, not sub-pixel, not rotated).
2. **Flat color fills.** No gradients. Shading is done in 2–4 **discrete flat bands** per
   color area (e.g. skin = base tone + 1 shadow tone + 1 highlight tone, nothing in between).
3. **Consistent outline weight.** A single, consistent dark outline (1px at native
   resolution) around the silhouette and major interior shapes (hairline, collar, jaw).
4. **Locked, limited palette.** ~16–32 colors total for a character. Same skin tones, same
   uniform colors, same hair-shadow tone reused across every character and pose.
5. **Consistent framing/proportions.** Same crop (shoulders-up), same head-to-shoulder ratio,
   same canvas size, same eye-line height, across every character. This is what makes a cast
   look like it belongs to one game.
6. **Simple, readable shapes.** Hair is a few large clean shapes, not thousands of tiny
   independent strands. Same for clothing folds, background foliage, etc.

If a generated/edited asset fails **any** of these six, it is not ready to ship — send it
back through the pipeline in §3.

---

## 2. Common ways AI-generated / opencode-generated pixel art breaks

Diagnose your broken assets against this table first — it tells you which fix in §3 to apply.

| Symptom | Root cause | Fix (see §3 step) |
|---|---|---|
| Edges look soft/fuzzy/blurry when zoomed in, pixels aren't crisp squares | Image was scaled with bilinear/bicubic interpolation instead of nearest-neighbor at some point in the pipeline | Step 2 |
| Character looks "melted" — colors bleed into each other, no clean color boundaries | Too many colors were kept (thousands from the raw generation) instead of quantizing to a small locked palette | Step 3 |
| Shading looks smooth/airbrushed instead of blocky | Gradients weren't posterized into flat bands | Step 4 |
| Same character looks like a different person in different scenes/expressions | No shared reference/template was used — each image was generated independently from scratch | Step 1 + §4 |
| Outline is missing, inconsistent thickness, or only appears on some edges | No dedicated outline pass; relying on the generator to imply outlines (it won't do this consistently) | Step 5 |
| Background and character pixel sizes don't match (background pixels look "finer" than character pixels) | Different assets were downscaled to different grid sizes | Step 2 — enforce one grid size per asset class |
| Image has weird color noise/speckling in flat areas (sky, wall, uniform) | AI generation artifacts in low-detail regions were never cleaned up | Step 3 + manual cleanup (Step 6) |
| **Background reads as scary/horror — huge jagged black silhouettes on stark white, shapes don't clearly read as trees/buildings/sky, character portrait looks fine but the scene behind it doesn't** | Background palette was crushed down to only 2-3 colors (near-pure black + near-pure white + one gray) with a hard threshold, instead of quantizing to a proper 8-16 color **location palette**. Losing all midtones turns everything into high-contrast silhouettes, and silhouette shapes generated/cleaned without reference collapse into abstract blobs instead of recognizable objects (trees, rooftops, clouds) | See §7 "Fixing horror-looking backgrounds" below — this is a background-specific case of Step 2/3, not a character problem |
| Background's pixel blocks are visibly much bigger/coarser than the character sprite's pixels when both are on screen together | Background and character were downscaled to two different, mismatched grid sizes | Step 2 — enforce the fixed grid-size ratio in §7 |
| Character proportions are inconsistent (head too big/small vs. reference, off-center) | No template canvas/bounding box was used | §4 template system |
| Colors shift slightly between two images of the "same" palette (e.g. uniform teal is a slightly different teal in two portraits) | Palette wasn't locked to exact hex values and reused; each generation invented its own similar-but-not-identical colors | Step 3, using one shared `.gpl`/JSON palette file, not eyeballing "close enough" |
| Final PNG looks fine full-size but breaks into mush when scaled up in-game | Export was done at display size instead of native pixel-grid size with nearest-neighbor upscale | Step 2 |

---

## 3. The fix pipeline (run every asset through all six steps, in order)

Do this as a script (Node + `sharp`, or Python + `Pillow`), not by hand in an image editor —
manual work doesn't scale and won't be consistent across dozens of assets.

**Step 1 — Start from a consistent source.**
If regenerating, always include the character's locked reference image (§4) as an
input/reference to the generator, not just a text prompt. If fixing an existing broken asset,
keep it as the source for Steps 2–6 rather than regenerating from scratch — most breakage is
fixable in post-processing.

**Step 2 — Force the pixel grid (nearest-neighbor only).**
```
Downscale to the target native grid using NEAREST NEIGHBOR interpolation ONLY:
  - Portraits: 64x64 (or 96x96 for more detail)
  - Backgrounds: 160x90 or 320x180
Never use bilinear, bicubic, or "smooth" resampling at any step, in either direction.
```

**Step 3 — Quantize to the locked palette.**
```
Map every pixel to the nearest color in the character's/scene's locked palette file
(16-32 colors). Do not let the tool auto-generate a "close" palette per image —
always quantize against the SAME saved palette every character/background reuses.
```

**Step 4 — Posterize remaining shading into flat bands.**
```
Collapse any remaining gradient into 2-4 flat shading steps (base / shadow / optional
highlight / optional deep-shadow). No pixel should be a "one-off" blended color.
```

**Step 5 — Apply one consistent outline pass.**
```
Trace a 1px dark outline (from the locked palette's outline color — usually a near-black,
not pure #000000) around the full silhouette and major interior edges (hairline, collar,
jaw, major clothing seams). Same outline weight and color on every single asset.
```

**Step 6 — Manual cleanup pass (human, ~5–10 min per asset).**
```
- Remove stray/orphan pixels
- Fix asymmetry (eyes, shoulders) by eye
- Confirm against the reference template: same canvas size, same crop, same head position
- Confirm palette compliance: every color used should be in the locked palette file,
  no exceptions
```

**Step 7 — Export at native size, upscale for display with nearest-neighbor.**
```
Save the native-grid PNG (e.g. 64x64) as the master file.
For display, scale up by an integer factor (x4, x6, x8) using nearest-neighbor ONLY —
CSS: image-rendering: pixelated; (or crisp-edges as fallback)
Never ship a pre-smoothed "large" export as the master asset.
```

---

## 4. Character/background reference system (prevents drift)

- Every recurring character gets a **locked reference sheet**: one canonical neutral-pose
  image, plus a written spec (hair shape + 2–3 colors, uniform colors, skin tone, eye color,
  proportions relative to canvas) stored as a short markdown/JSON file next to the assets.
- New expressions/poses for that character must be generated or edited **using the reference
  sheet as the anchor** (img2img/reference-conditioned generation, or manually palette-swapped
  from the base sprite) — never generated fresh from a text prompt alone. Fresh-from-text is
  the #1 cause of "looks like a different character" drift.
- Backgrounds follow the same idea per location: one locked "establishing" background per
  location, and variants (day/night/storm) are palette/lighting swaps of that same base
  layout, not independent generations.

Suggested file layout:
```
/assets-source/
  characters/
    lola/
      reference.png          # canonical neutral pose, locked
      palette.json            # exact hex list, reused everywhere
      spec.md                 # written description for regeneration prompts
    maria/
      reference.png
      palette.json
      spec.md
  backgrounds/
    bedroom/
      reference.png
      palette.json
/scripts/
  pixelize.ts                 # implements §3 steps 2-5 automatically
```

---

## 5. Fixing horror-looking backgrounds specifically

This is the single most common background failure and it's exactly what's happening in
current builds: the character portrait can look correct while the background behind it looks
like a horror-game silhouette — huge jagged black shapes on stark white/gray, nothing reading
as a recognizable tree, roofline, cloud, or wall. It happens because the background got
reduced to almost no colors and no midtones, so every shape becomes a hard-edged black blob
instead of a place you can recognize.

**Backgrounds are not silhouettes. They need a real, warm, readable location palette —
the same "flat color bands" rule from §1, applied to a scene instead of a character.**

### 5.0 — If EVERY scene keeps coming out the same broken way, this is a bug, not an art problem

If multiple different scenes all come out looking identical to each other — same flat black
cutout shapes, same scattered plus/cross-shaped blobs, no color variety, regardless of what
the scene is supposed to depict — stop regenerating and treat this as a pipeline bug, not
something better art direction will fix. Real generated art varies from scene to scene; a bug
produces the *same broken pattern* every single time, which is exactly what's being reported.
Before generating anything else, have opencode check:

1. **Open the actual background PNG file outside the game** (in any image viewer) and check
   its real pixel dimensions and true color count with a color picker. If it only contains
   2–3 exact colors (pure black, pure white/light gray, one mid gray) and nothing else, this
   file was never real generated art — it's either a failed generation that silently fell back
   to a placeholder, or a **procedurally-drawn stub** (shapes drawn directly in code as filler,
   not produced by any art generator). The scattered plus/cross-shaped clusters repeating
   across different "scenes" are a classic sign of a placeholder script scattering `+`-shaped
   blobs as filler trees/foliage — not something an image generator would draw on its own, and
   not something that would vary if it's the same hardcoded shape being reused. **Check
   whichever code path renders this background for a default/fallback case, and confirm the
   pipeline is loading the real generated PNG and not a stub asset.**
2. **Confirm the palette-quantization step actually runs on backgrounds, not just
   characters.** If the character portrait looks correct but every background doesn't, and
   there are separate character vs. background code paths in the asset pipeline, it's likely
   the background path is missing the quantization step (§3, Step 3) or is quantizing against
   an empty/default palette instead of a real 8–16 color location palette (§5.1). A missing or
   empty palette would explain "always exactly the same 2-3 colors, on every scene."
3. **Fix and fully verify ONE background end-to-end before touching the rest.** Get one scene
   showing real color variety and recognizable object shapes, confirm it visually, and only
   then re-run that same fixed pipeline across the remaining scenes. Regenerating scene-by-scene
   while the underlying step is still broken will keep producing this same failure on each one.

Only after confirming the pipeline itself is actually running on real generated images should
you move on to refining the *art* itself using the rules below.

### 5.1 — Background palette and shape rules

Fix checklist, applied on top of the general pipeline in §3:

1. **Never quantize a background down to 2–3 colors.** Use 8–16 colors minimum for a
   background (more than a character portrait needs, because a scene has more distinct
   objects: sky, ground, walls, foliage, one or two accent colors).
2. **Ban near-pure black (`#000000`) and near-pure white (`#FFFFFF`) from the palette.**
   Use a dark-but-warm "shadow" tone (e.g. deep navy/brown, not black) and a soft "light" tone
   (e.g. warm off-white/pale sky blue, not white) instead. Pure black + pure white at high
   contrast is what makes silhouettes read as "horror" rather than "cozy pixel scene" — this
   is true even for genuinely dark/stormy scenes (see step 5).
3. **Build the scene from a small number of large, clearly-object-shaped regions** — a
   rectangle block of wall, a triangle/trapezoid roofline, a rounded canopy of foliage, a flat
   band of sky, a flat band of ground — not scattered jagged cutouts. If a shape doesn't
   obviously read as "this is a tree" or "this is a roof" when squinting, redraw/regenerate
   that shape rather than trying to salvage it.
4. **Match the background's grid size to the character sprite's grid size using a fixed
   ratio** (e.g. if a character portrait is drawn on a 64×64 grid, a full-scene background
   should be drawn on a grid where one "pixel" is the same on-screen size as one character
   pixel — commonly background canvas = character canvas × 2.5–5 in each dimension, never an
   arbitrary/unrelated grid). Mismatched pixel sizes is exactly what's visible in the current
   build (the background's blocks are much chunkier than the portrait's) and it's a second,
   independent reason the scene reads as broken/uncanny rather than just under-detailed.
5. **For intentionally dark/stormy/night scenes (which this case's story genuinely calls
   for), get the mood from color temperature, not from crushing to black/white.** Use a
   locked "night/storm" location palette: deep blue-grays and muted purples for sky and
   silhouette shapes, a warm light source color for any windows/lamps, and keep at least one
   mid-tone so shapes have visible form instead of flattening into pure cutouts. This gives
   you moody and atmospheric without tipping into horror-silhouette.
6. **Regenerate or hand-fix using a real reference image of the target location type**
   (a barangay street, a bedroom window at night, an evacuation center hall) as visual
   guidance/input, the same way §4 requires a character reference sheet — a background
   generated from text alone with no reference is the most common cause of shapes turning
   into unreadable abstract blobs like the cross/plus shapes in the current build.

Add a locked palette file per location (per §4's folder structure) with 8–16 named colors
(e.g. `sky_light`, `sky_shadow`, `foliage_base`, `foliage_shadow`, `wall_base`,
`wall_shadow`, `accent_light`) so every scene in that location reuses the exact same set —
this is what turns "random generated blobs" into "a game world."

---

## 6. Prompting tips (if regenerating instead of only fixing)

When you do need to generate new source art, front-load the pixel-art-correctness into the
prompt so Step 2–5 has less to fix:

- Explicitly ask for: "pixel art, 8-bit style, flat colors, no gradient shading, clean 1px
  outline, limited color palette, retro game sprite"
- Explicitly ask against: smooth shading, soft lighting, painterly, photorealistic, glow,
  blur, anti-aliasing
- Always specify the crop/framing to match the reference ("shoulders-up portrait, front-facing
  or ¾ view, centered")
- Attach the character's `reference.png` as an image input whenever the tool supports
  image-conditioned generation — this matters far more than prompt wording for consistency.

Even with a good prompt, **still run every output through the full §3 pipeline.** Prompting
reduces cleanup work; it doesn't replace the pipeline.

---

## 7. Pre-ship checklist (per asset)

Before an asset goes into `/public/vn-assets/`, confirm:

- [ ] Pixels are clean squares at native resolution, no soft/blurred edges
- [ ] Every color used is in that character/location's locked palette file — zero exceptions
- [ ] Shading is flat bands only, no gradients
- [ ] Outline is present, consistent weight, consistent color, on silhouette + major edges
- [ ] Canvas size, crop, and proportions match the character's reference sheet
- [ ] No stray pixels / noise in flat areas
- [ ] Exported at native grid size (master file), with display-scaling handled by
      nearest-neighbor upscale in code/CSS, not baked into the PNG
- [ ] Side-by-side against the two original reference portraits, it reads as "same artist,
      same game" — if it doesn't pass this gut check, it goes back through §3
- [ ] **Backgrounds only:** uses 8–16 colors minimum, no near-pure black or near-pure white
      in the palette, every large shape reads as a real object (tree/roof/wall/sky) rather
      than an abstract blob, and grid size matches the character sprite's grid ratio (§5)

If an asset fails any box, don't ship it — send it back through §3, it's almost always
fixable in post rather than needing a full regeneration.
