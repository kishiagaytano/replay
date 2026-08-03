/**
 * extract-palette.ts — Extract a locked color palette from a reference image.
 *
 * Outputs a JSON palette file compatible with pixelize.ts --palette flag.
 *
 * Usage:
 *   npx tsx scripts/extract-palette.ts <input> <output> [colors=20]
 *
 * The palette is sorted by luminance (dark → light) and rounded to
 * clean 17-step multiples for a retro feel.
 */

import sharp from 'sharp';
import fs from 'fs';

const args = process.argv.slice(2);
const inputPath = args[0];
const outputPath = args[1];
const MAX_COLORS = parseInt(args[2] ?? '20', 10);

function clamp(v: number): number {
  return Math.max(0, Math.min(255, Math.round(v)));
}

function colorDistance(a: [number, number, number], b: [number, number, number]): number {
  const dr = a[0] - b[0], dg = a[1] - b[1], db = a[2] - b[2];
  return dr * dr + dg * dg + db * db;
}

function luminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

async function main() {
  if (!inputPath || !outputPath) {
    console.error('Usage: npx tsx scripts/extract-palette.ts <input> <output> [colors=20]');
    process.exit(1);
  }

  console.log(`\n  extract-palette.ts — Palette Extractor\n`);
  console.log(`  Input:    ${inputPath}`);
  console.log(`  Output:   ${outputPath}`);
  console.log(`  Colors:   ${MAX_COLORS}\n`);

  // Load image
  const img = sharp(inputPath);
  const { data, info } = await img
    .resize(128, 128, { fit: 'inside' }) // sample size
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = new Uint8Array(data);

  // Collect all visible colors
  const colorCounts = new Map<string, number>();
  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i + 3] < 128) continue;
    // Round to nearest 8 for cleaner palette (avoids the 17-step
    // rounding that was destroying color info in v1)
    const r = clamp(Math.round(pixels[i] / 8) * 8);
    const g = clamp(Math.round(pixels[i + 1] / 8) * 8);
    const b = clamp(Math.round(pixels[i + 2] / 8) * 8);
    const key = `${r},${g},${b}`;
    colorCounts.set(key, (colorCounts.get(key) ?? 0) + 1);
  }

  // Sort by frequency, keep top MAX_COLORS
  const sorted = [...colorCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_COLORS);

  const palette = sorted.map(([key]) => {
    const [r, g, b] = key.split(',').map(Number);
    return { r, g, b, hex: `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}` };
  });

  // Sort by luminance (dark → light)
  palette.sort((a, b) => luminance(a.r, a.g, a.b) - luminance(b.r, b.g, b.b));

  // Add outline color if not present (near-black but not pure #000)
  const hasDark = palette.some(c => c.r < 34 && c.g < 34 && c.b < 34);
  if (!hasDark) {
    palette.unshift({ r: 17, g: 17, b: 17, hex: '#111111' });
  }

  const result = {
    source: inputPath,
    colors: palette.map(c => c.hex),
    count: palette.length,
  };

  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log(`  Extracted ${palette.length} colors:\n`);
  palette.forEach(c => console.log(`    ${c.hex}  rgb(${c.r},${c.g},${c.b})`));
  console.log(`\n  Saved: ${outputPath}\n`);
}

main().catch(err => { console.error(err); process.exit(1); });
