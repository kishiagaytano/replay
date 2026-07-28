#!/usr/bin/env python3
"""
Pixel Art Converter v5 — rePlay VN Asset Generator
Improvements:
  - Median filter pre-processing (flattens noise, preserves edges)
  - Weighted perceptual color quantization
  - Controlled posterization (flat-shaded look)
  - Dual-threshold edge detection (luminance + color distance)
  - Landscape/portrait-aware cropping

Usage:
  python3 scripts/pixelize.py
"""

import json
import os
from collections import Counter

from PIL import Image, ImageFilter, ImageOps
import PIL.ImageEnhance as IE

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
VN_ASSETS = os.path.join(PROJECT_ROOT, "public", "vn-assets")

PORTRAIT_SIZE = 192
BG_WIDTH = 320
BG_HEIGHT = 180

OUTLINE_COLOR = (0x1A, 0x18, 0x15)


def load_palette(palette_path, include_outline=False):
    with open(palette_path) as f:
        data = json.load(f)
    colors = set()
    for col_hex in data.get("colors", []):
        colors.add((int(col_hex[1:3], 16), int(col_hex[3:5], 16), int(col_hex[5:7], 16)))
    oc = data.get("outline", "#1A1815")
    outline = (int(oc[1:3], 16), int(oc[3:5], 16), int(oc[5:7], 16))
    if include_outline:
        colors.add(outline)
    else:
        colors.discard(outline)
    return colors, outline


def color_distance(c1, c2):
    """Weighted RGB distance — approximates perceptual difference."""
    dr = c1[0] - c2[0]
    dg = c1[1] - c2[1]
    db = c1[2] - c2[2]
    return 2*dr*dr + 4*dg*dg + 3*db*db


def quantize_to_palette(img, palette_colors):
    img = img.convert("RGB")
    pixels = img.load()
    pal_list = list(palette_colors)
    for y in range(img.height):
        for x in range(img.width):
            px = pixels[x, y]
            if px not in palette_colors:
                best = min(pal_list, key=lambda c: color_distance(c, px))
                pixels[x, y] = best
    return img


def apply_median_filter(img, radius=1):
    """Median filter flattens noise while preserving hard edges."""
    return img.filter(ImageFilter.MedianFilter(size=radius*2+1))


def force_posterize(img, n_colors=14):
    """PIL median-cut quantization for flat cell-shaded look."""
    img = img.convert("RGB")
    q = img.quantize(colors=n_colors, method=Image.Quantize.MEDIANCUT)
    return q.convert("RGB")


def smart_downscale(img, target_w, target_h, palette_colors=None, n_post=None):
    big = img.resize((target_w * 3, target_h * 3), Image.LANCZOS)
    if n_post:
        big = force_posterize(big, n_colors=n_post)
    if palette_colors:
        big = quantize_to_palette(big, palette_colors)
    result = big.resize((target_w, target_h), Image.NEAREST)
    return result


def detect_bg_color(img):
    w, h = img.size
    samples = []
    for x in range(w):
        samples.append(img.getpixel((x, 0)))
        samples.append(img.getpixel((x, h - 1)))
    for y in range(h):
        samples.append(img.getpixel((0, y)))
        samples.append(img.getpixel((w - 1, y)))
    return Counter(samples).most_common(1)[0][0]


def extract_silhouette(img, bg_color, tolerance=75):
    img = img.convert("RGBA")
    pixels = img.load()
    removed = 0
    for y in range(img.height):
        for x in range(img.width):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue
            dr = r - bg_color[0]
            dg = g - bg_color[1]
            db = b - bg_color[2]
            if (dr*dr + dg*dg + db*db) ** 0.5 < tolerance:
                pixels[x, y] = (r, g, b, 0)
                removed += 1
    if removed > 0:
        print(f"  Removed {removed} bg pixels (tolerance={tolerance})")
    return img


def remove_orphan_pixels(img):
    if img.mode != "RGBA":
        img = img.convert("RGBA")
    pixels = img.load()
    result = img.copy()
    rp = result.load()
    for y in range(1, img.height - 1):
        for x in range(1, img.width - 1):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue
            alive = sum(1 for dx, dy in [(0,1), (0,-1), (1,0), (-1,0)]
                        if pixels[x+dx, y+dy][3] > 0)
            if alive <= 1:
                rp[x, y] = (r, g, b, 0)
    return result


def smooth_silhouette(img):
    if img.mode != "RGBA":
        img = img.convert("RGBA")
    alpha = img.split()[3]
    eroded = alpha.filter(ImageFilter.MinFilter(3))
    smoothed = eroded.filter(ImageFilter.MaxFilter(3))
    r, g, b, _ = img.split()
    return Image.merge("RGBA", (r, g, b, smoothed))


def luminance(r, g, b):
    return 0.299*r + 0.587*g + 0.114*b


def add_cartoon_outline(img, outline_color=OUTLINE_COLOR, lum_threshold=25, color_threshold=600):
    """Dual-threshold outline: luminance change OR large color difference."""
    if img.mode != "RGBA":
        img = img.convert("RGBA")
    img = smooth_silhouette(img)
    pixels = img.load()
    result = Image.new("RGBA", img.size, (0, 0, 0, 0))
    rp = result.load()
    for y in range(img.height):
        for x in range(img.width):
            rp[x, y] = pixels[x, y]

    for y in range(img.height):
        for x in range(img.width):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue
            own_lum = luminance(r, g, b)
            draw = False
            for dx, dy in [(0,-1),(1,-1),(1,0),(1,1),(0,1),(-1,1),(-1,0),(-1,-1)]:
                nx, ny = x + dx, y + dy
                if 0 <= nx < img.width and 0 <= ny < img.height:
                    nr, ng, nb, na = pixels[nx, ny]
                    if na == 0:
                        draw = True
                        break
                    if abs(own_lum - luminance(nr, ng, nb)) > lum_threshold:
                        draw = True
                        break
                    if color_distance((r, g, b), (nr, ng, nb)) > color_threshold:
                        draw = True
                        break
            if draw:
                rp[x, y] = (*outline_color, 255)
    return result


def crop_to_square(ref, char_name):
    w, h = ref.size
    if char_name == "lola":
        crop_w = int(w * 0.55)
        crop_h = int(h * 0.75)
        left = (w - crop_w) // 2
        top = int(h * 0.08)
        ref = ref.crop((left, top, left + crop_w, top + crop_h))
        ref = ref.resize((600, 600), Image.LANCZOS)
    elif h > w:
        side = w
        top = int(h * 0.12)
        top = min(top, h - side)
        ref = ref.crop((0, top, w, top + side))
    elif w > h:
        side = h
        left = (w - side) // 2
        ref = ref.crop((left, 0, left + side, h))
    print(f"  Cropped to square: {ref.size}")
    return ref


def generate_character_pixel(char_name):
    char_dir = os.path.join(VN_ASSETS, "characters", char_name)
    ref_path = os.path.join(char_dir, f"{char_name}_reference.jpg")
    palette_path = os.path.join(char_dir, "palette.json")
    pixel_dir = os.path.join(char_dir, "pixel")
    output_path = os.path.join(pixel_dir, f"{char_name}_pixel.png")

    LUM_TH = {"jeff": 20, "maria": 20, "lola": 18}
    COL_TH = {"jeff": 500, "maria": 500, "lola": 500}
    N_POST = {"jeff": 14, "maria": 14, "lola": 0}

    lum_th = LUM_TH.get(char_name, 22)
    col_th = COL_TH.get(char_name, 500)
    n_post = N_POST.get(char_name, 14)

    if not os.path.exists(ref_path):
        print(f"  No reference at {ref_path}")
        return False

    os.makedirs(pixel_dir, exist_ok=True)
    print(f"\n--- {char_name} ---")

    ref = Image.open(ref_path).convert("RGB")
    print(f"  Ref: {ref.size}")

    fill_colors, outline = load_palette(palette_path, include_outline=False)
    all_colors, _ = load_palette(palette_path, include_outline=True)
    print(f"  Palette: {len(fill_colors)} colors")

    # Step 1: crop face-tight
    ref = crop_to_square(ref, char_name)

    bg_color = detect_bg_color(ref)

    # Step 2: median filter (flatten noise, keep edges)
    ref = apply_median_filter(ref, radius=1)

    # Step 3: enhance
    ref = ImageOps.autocontrast(ref, cutoff=1)
    ref = IE.Contrast(ref).enhance(1.3)
    ref = IE.Color(ref).enhance(1.2)
    ref = IE.Sharpness(ref).enhance(1.5)
    if char_name == "lola":
        ref = IE.Brightness(ref).enhance(1.1)

    # Step 4: downscale with posterization
    if n_post > 0:
        pixel = smart_downscale(ref, PORTRAIT_SIZE, PORTRAIT_SIZE,
                                palette_colors=fill_colors, n_post=n_post)
        print(f"  Posterized ({n_post} colors) → {pixel.size}")
    else:
        big = ref.resize((PORTRAIT_SIZE * 3, PORTRAIT_SIZE * 3), Image.LANCZOS)
        big = quantize_to_palette(big, fill_colors)
        pixel = big.resize((PORTRAIT_SIZE, PORTRAIT_SIZE), Image.NEAREST)
        print(f"  Direct quantize → {pixel.size}")

    # Step 5: silhouette (skip for lola — bg removal eats face edges)
    if char_name == "lola":
        pixel = pixel.convert("RGBA")
    else:
        pixel = extract_silhouette(pixel, bg_color, tolerance=75)

    # Step 6: palette quantize
    pixel = pixel.convert("RGBA")
    pixel_rgb = quantize_to_palette(pixel.convert("RGB"), fill_colors)
    pixel = Image.merge("RGBA", (*pixel_rgb.split(), pixel.split()[3]))

    # Step 7: outline
    pixel = add_cartoon_outline(pixel, outline,
                                lum_threshold=lum_th, color_threshold=col_th)
    print(f"  Outline (lum={lum_th}, col={col_th})")

    # Step 8: re-quantize
    pixel_rgb = quantize_to_palette(pixel.convert("RGB"), all_colors)
    pixel = Image.merge("RGBA", (*pixel_rgb.split(), pixel.split()[3]))

    pixel.save(output_path, "PNG")
    print(f"  Saved: {output_path}")
    return True


BG_CONTRAST = {"evac": 1.5, "flood": 1.8, "bedroom": 1.3, "classroom": 1.3}
BG_NPOST = {"evac": 18, "flood": 18, "bedroom": 20, "classroom": 18}

def generate_background_pixel(bg_name):
    bg_dir = os.path.join(VN_ASSETS, "backgrounds")
    ref_path = os.path.join(bg_dir, f"{bg_name}_ref.jpg")
    palette_path = os.path.join(bg_dir, f"palette_{bg_name}.json")
    pixel_dir = os.path.join(bg_dir, "pixel")
    output_path = os.path.join(pixel_dir, f"{bg_name}_pixel.png")

    if not os.path.exists(ref_path):
        print(f"  No ref at {ref_path}")
        return False

    os.makedirs(pixel_dir, exist_ok=True)
    print(f"\n--- {bg_name} ---")

    ref = Image.open(ref_path).convert("RGB")
    print(f"  Ref: {ref.size}")

    fill_colors, outline = load_palette(palette_path, include_outline=False)
    all_colors, _ = load_palette(palette_path, include_outline=True)

    cf = BG_CONTRAST.get(bg_name, 1.0)
    if cf > 1.0:
        ref = ImageOps.autocontrast(ref, cutoff=2)
        ref = IE.Contrast(ref).enhance(cf)
        ref = IE.Sharpness(ref).enhance(1.3)

    n_post = BG_NPOST.get(bg_name, 16)
    pixel = smart_downscale(ref, BG_WIDTH, BG_HEIGHT,
                            palette_colors=fill_colors, n_post=n_post)
    print(f"  Posterized ({n_post} colors) → {pixel.size}")

    pixel = pixel.convert("RGBA")
    pixel_rgb = quantize_to_palette(pixel.convert("RGB"), fill_colors)
    pixel = Image.merge("RGBA", (*pixel_rgb.split(), pixel.split()[3]))

    pixel = add_cartoon_outline(pixel, outline, lum_threshold=22, color_threshold=500)

    pixel_rgb = quantize_to_palette(pixel.convert("RGB"), all_colors)
    pixel = Image.merge("RGBA", (*pixel_rgb.split(), pixel.split()[3]))

    pixel.save(output_path, "PNG")
    print(f"  Saved: {output_path}")
    return True


def main():
    print("=" * 60)
    print("  rePlay Pixel Art v5")
    print("  Median filter + posterization + weighted color quant")
    print("=" * 60)

    for c in ["jeff", "lola", "maria"]:
        generate_character_pixel(c)

    print("\n" + "=" * 60)
    for b in ["bedroom", "classroom", "evac", "flood"]:
        generate_background_pixel(b)

    print("\n" + "=" * 60)
    print("  Done!")
    print("=" * 60)


if __name__ == "__main__":
    main()
