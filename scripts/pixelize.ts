/**
 * pixelize.ts — rePlay Pixel Art Pipeline (v3)
 *
 * Corrected pipeline, matching PIXEL_ART_GUIDE.md §3:
 *
 *   Step 1 — Load + gentle denoise
 *   Step 2 — Palette-quantize at FULL RESOLUTION
 *            (creates clean flat color regions before any resize)
 *   Step 3 — Lanczos down to 2× native grid
 *            (smooth resize preserves shape boundaries)
 *   Step 4 — Re-quantize to palette
 *            (snaps any interpolation drift back to palette colors)
 *   Step 5 — NN downscale to native grid
 *   Step 6 — Re-quantize to palette
 *   Step 7 — 1px outline at native resolution
 *   Step 8 — NN upscale for display
 *
 * Key insight: quantize FIRST at full resolution creates clean color
 * regions. Then even NN downscale preserves recognizable shapes
 * because adjacent pixels already share palette colors.
 *
 * Usage:
 *   npx tsx scripts/pixelize.ts <input> <output> --palette <path> [options]
 *
 * Options:
 *   --grid <w>x<h>    Native pixel grid (default: 96x96 for portraits)
 *   --scale <n>       Display upscale factor (default: 3)
 *   --palette <path>  Locked palette JSON file
 *   --denoise <n>     Denoise sigma (default: 0.3, 0 to skip)
 *   --no-outline      Skip 1px outline pass
 */

import sharp from 'sharp';
import fs from 'fs';

// ── CLI ──

const args = process.argv.slice(2);
const inputPath = args[0];
const outputPath = args[1];

function getFlag(name: string, defaultVal: string): string {
  const idx = args.indexOf(name);
  return idx >= 0 && idx < args.length - 1 ? args[idx + 1] : defaultVal;
}

function hasFlag(name: string): boolean {
  return args.includes(name);
}

if (!inputPath || !outputPath) {
  console.error(`
  pixelize.ts — rePlay Pixel Art Pipeline (§3)

  Usage:
    npx tsx scripts/pixelize.ts <input> <output> --palette <path> [options]

  Required:
    --palette <path>  Locked palette JSON file

  Options:
    --grid <w>x<h>    Native pixel grid (default: 96x96)
    --scale <n>       Display upscale factor (default: 3)
    --denoise <n>     Denoise sigma (default: 0.3, 0 to skip)
    --no-outline      Skip 1px outline pass
  `);
  process.exit(1);
}

const GRID = getFlag('--grid', '96x96');
const [GRID_W, GRID_H] = GRID.split('x').map(Number);
const UPSCALE = parseInt(getFlag('--scale', '3'), 10);
const PALETTE_PATH = getFlag('--palette', '');
const DENOISE_SIGMA = parseFloat(getFlag('--denoise', '0.3'));
const DO_OUTLINE = !hasFlag('--no-outline');

// ── Helpers ──

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function clamp(v: number): number {
  return Math.max(0, Math.min(255, Math.round(v)));
}

function colorDist(a: [number, number, number], b: [number, number, number]): number {
  const dr = a[0] - b[0], dg = a[1] - b[1], db = a[2] - b[2];
  return dr * dr + dg * dg + db * db;
}

function loadPalette(palettePath: string): { colors: [number, number, number][]; outline: [number, number, number] | null } {
  const raw = JSON.parse(fs.readFileSync(palettePath, 'utf-8'));
  let colorList: string[];
  if (Array.isArray(raw)) {
    colorList = raw;
  } else if (raw.colors && Array.isArray(raw.colors)) {
    colorList = raw.colors;
  } else {
    throw new Error(`Bad palette format in ${palettePath}`);
  }
  const colors = colorList.map((c: string) => hexToRgb(c));
  let outline: [number, number, number] | null = null;
  if (raw.outline) outline = hexToRgb(raw.outline);
  else if (colors.length > 0) outline = colors[0];
  return { colors, outline };
}

// ── NN Downscale (pixel-perfect) ──

function nnDownscale(
  pixels: Uint8Array, srcW: number, srcH: number, dstW: number, dstH: number,
): Uint8Array {
  const out = new Uint8Array(dstW * dstH * 4);
  const xRatio = srcW / dstW;
  const yRatio = srcH / dstH;
  for (let dy = 0; dy < dstH; dy++) {
    for (let dx = 0; dx < dstW; dx++) {
      const sx = Math.floor(dx * xRatio);
      const sy = Math.floor(dy * yRatio);
      const si = (sy * srcW + sx) * 4;
      const di = (dy * dstW + dx) * 4;
      out[di] = pixels[si];
      out[di + 1] = pixels[si + 1];
      out[di + 2] = pixels[si + 2];
      out[di + 3] = pixels[si + 3];
    }
  }
  return out;
}

// ── Palette Quantize ──

function quantize(pixels: Uint8Array, palette: [number, number, number][]): Uint8Array {
  const out = new Uint8Array(pixels);
  for (let i = 0; i < out.length; i += 4) {
    if (out[i + 3] < 128) continue;
    const px: [number, number, number] = [out[i], out[i + 1], out[i + 2]];
    let best = 0;
    let bestD = Infinity;
    for (let k = 0; k < palette.length; k++) {
      const d = colorDist(px, palette[k]);
      if (d < bestD) { bestD = d; best = k; }
    }
    out[i] = palette[best][0];
    out[i + 1] = palette[best][1];
    out[i + 2] = palette[best][2];
  }
  return out;
}

// ── 1px Outline (two-pass) ──

function addOutlines(
  pixels: Uint8Array, width: number, height: number, col: [number, number, number],
): Uint8Array {
  const idx = (x: number, y: number) => (y * width + x) * 4;
  const flags = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = idx(x, y);
      if (pixels[i + 3] < 128) continue;
      const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
      for (const [nx, ny] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) {
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) { flags[y * width + x] = 1; break; }
        const ni = idx(nx, ny);
        if (pixels[ni + 3] < 128) { flags[y * width + x] = 1; break; }
        if (pixels[ni] !== r || pixels[ni + 1] !== g || pixels[ni + 2] !== b) { flags[y * width + x] = 1; break; }
      }
    }
  }
  const out = new Uint8Array(pixels);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (flags[y * width + x]) { const i = idx(x, y); out[i] = col[0]; out[i + 1] = col[1]; out[i + 2] = col[2]; }
    }
  }
  return out;
}

// ── Main ──

async function main() {
  console.log(`\n  pixelize.ts — rePlay Pixel Art Pipeline (v3)\n`);
  console.log(`  Input:    ${inputPath}`);
  console.log(`  Output:   ${outputPath}`);
  console.log(`  Grid:     ${GRID_W}×${GRID_H} native (×${UPSCALE} → ${GRID_W * UPSCALE}×${GRID_H * UPSCALE})`);
  console.log(`  Palette:  ${PALETTE_PATH || '(none)'}\n`);

  // Load palette
  let pal: { colors: [number, number, number][]; outline: [number, number, number] | null };
  if (PALETTE_PATH) {
    pal = loadPalette(PALETTE_PATH);
    console.log(`  [Palette: ${pal.colors.length} colors from ${PALETTE_PATH}]`);
    if (pal.outline) console.log(`  [Outline: #${pal.outline.map(c => c.toString(16).padStart(2, '0')).join('')}]`);
    console.log();
  } else {
    throw new Error('--palette is required');
  }

  // Load image
  const meta = await sharp(inputPath).metadata();
  const srcW = meta.width!;
  const srcH = meta.height!;
  console.log(`  Source: ${srcW}×${srcH}`);

  // Determine native grid dimensions (maintain aspect ratio)
  const aspect = srcW / srcH;
  let nativeW: number, nativeH: number;
  if (aspect > 1) {
    nativeW = GRID_W;
    nativeH = Math.max(1, Math.round(GRID_W / aspect));
  } else {
    nativeH = GRID_H;
    nativeW = Math.max(1, Math.round(GRID_H * aspect));
  }

  // ── Step 1: Load + gentle denoise ──
  let pipeline = sharp(inputPath).ensureAlpha();
  if (DENOISE_SIGMA > 0) pipeline = pipeline.blur(DENOISE_SIGMA);
  let { data } = await pipeline.raw().toBuffer({ resolveWithObject: true });
  let pixels = new Uint8Array(data.buffer, data.byteOffset, data.byteLength) as unknown as Uint8Array;
  console.log(`  [1/8] Loaded${DENOISE_SIGMA > 0 ? ` + denoised σ=${DENOISE_SIGMA}` : ''}`);

  // ── Step 2: Quantize at full resolution ──
  // This creates clean flat color regions BEFORE any resize.
  pixels = quantize(pixels, pal.colors);
  console.log(`  [2/8] Palette-quantized at full resolution (${pal.colors.length} colors)`);

  // ── Step 3: Lanczos down to 2× native grid ──
  // Smooth resize preserves shape boundaries much better than NN.
  const midW = nativeW * 2;
  const midH = nativeH * 2;
  // Write full-res quantized → read back at mid res via sharp (Lanczos)
  const midBuf = await sharp(Buffer.from(pixels), { raw: { width: srcW, height: srcH, channels: 4 } })
    .resize(midW, midH, { kernel: 'lanczos3', fit: 'fill' })
    .raw()
    .toBuffer();
  pixels = new Uint8Array(midBuf.buffer, midBuf.byteOffset, midBuf.byteLength) as unknown as Uint8Array;
  console.log(`  [3/8] Lanczos downscaled to 2× grid: ${midW}×${midH}`);

  // ── Step 4: Re-quantize (fix Lanczos interpolation drift) ──
  pixels = quantize(pixels, pal.colors);
  console.log(`  [4/8] Re-quantized (fixed Lanczos drift)`);

  // ── Step 5: NN downscale to native grid ──
  pixels = nnDownscale(pixels, midW, midH, nativeW, nativeH);
  console.log(`  [5/8] NN downscaled to native grid: ${nativeW}×${nativeH}`);

  // ── Step 6: Re-quantize (fix NN artifacts) ──
  pixels = quantize(pixels, pal.colors);
  console.log(`  [6/8] Re-quantized (fixed NN artifacts)`);

  // ── Step 7: 1px outline ──
  if (DO_OUTLINE && pal.outline) {
    pixels = addOutlines(pixels, nativeW, nativeH, pal.outline);
    console.log(`  [7/8] 1px outline applied`);
  } else {
    console.log(`  [7/8] Outline skipped`);
  }

  // ── Step 8: NN upscale for display ──
  const dispW = nativeW * UPSCALE;
  const dispH = nativeH * UPSCALE;
  const display = nnDownscale(pixels, nativeW, nativeH, dispW, dispH);
  console.log(`  [8/8] NN upscaled ×${UPSCALE}: ${dispW}×${dispH}`);

  // Save
  await sharp(Buffer.from(display), { raw: { width: dispW, height: dispH, channels: 4 } })
    .png()
    .toFile(outputPath);

  const kb = (fs.statSync(outputPath).size / 1024).toFixed(1);
  console.log(`\n  → Saved: ${outputPath} (${kb} KB)\n`);
}

main().catch(err => { console.error('pixelize error:', err); process.exit(1); });
