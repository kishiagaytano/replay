#!/usr/bin/env python3
"""
Gemini 2.5 Flash Image Generator — rePlay VN Asset Generator
Uses Gemini's image generation with style reference images (Jeff/Maria pixel art)
to create cartoony pixel art for Lola and backgrounds, matching the existing style.

Usage:
  export GEMINI_API_KEY="your-key"
  python3 scripts/gemini-generate.py
"""

import os
import sys
from google import genai
from google.genai.types import GenerateContentConfig, ImageConfig, Part

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
VN_ASSETS = os.path.join(PROJECT_ROOT, "public", "vn-assets")
MODEL_ID = "gemini-2.5-flash-image"

STYLE_REFERENCES = [
    os.path.join(VN_ASSETS, "characters", "jeff", "pixel", "jeff_pixel.png"),
    os.path.join(VN_ASSETS, "characters", "maria", "pixel", "maria_pixel.png"),
]


def read_image_bytes(path):
    with open(path, "rb") as f:
        return f.read()


def get_mime(path):
    ext = os.path.splitext(path)[1].lower()
    return {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png"}.get(ext, "image/png")


def generate_character(client, char_name):
    char_dir = os.path.join(VN_ASSETS, "characters", char_name)
    ref_path = os.path.join(char_dir, f"{char_name}_reference.jpg")
    matched_path = os.path.join(char_dir, "lola_reference_matched.jpg")
    pixel_dir = os.path.join(char_dir, "pixel")
    output_path = os.path.join(pixel_dir, f"{char_name}_pixel.png")

    os.makedirs(pixel_dir, exist_ok=True)

    # Use matched reference if available
    if char_name == "lola" and os.path.exists(matched_path):
        ref_path = matched_path
        print(f"  Using histogram-matched reference: lola_reference_matched.jpg")

    print(f"\n🎨 Generating pixel art for: {char_name}")
    print(f"  Reference: {ref_path}")

    ref_bytes = read_image_bytes(ref_path)

    # Common prompt prefix describing the style
    style_prompt = (
        "I am providing reference pixel art sprites (Jeff, Maria) showing the target style: "
        "flat colors, bold dark outline (#1A1815), clean cartoon look, visual novel character portrait, "
        "shoulders-up, no background (transparent)."
    )

    char_prompt = (
        f"Generate a 96x96 pixel art portrait of Lola (an older Filipino woman with salt-and-pepper hair, "
        f"warm skin tones in the #F5E6D0-#B48C64 range, wearing a blouse). "
        f"The style MUST match the attached Jeff and Maria pixel art references exactly — same outline style, "
        f"same flat-shaded cartoon look, same level of detail. "
        f"Output ONLY the 96x96 pixel art image, no text."
    )

    contents = [style_prompt]
    for sp in STYLE_REFERENCES:
        if os.path.exists(sp):
            contents.append(Part.from_bytes(data=read_image_bytes(sp), mime_type="image/png"))
    contents.append(Part.from_bytes(data=ref_bytes, mime_type=get_mime(ref_path)))
    contents.append(char_prompt)

    response = client.models.generate_content(
        model=MODEL_ID,
        contents=contents,
        config=GenerateContentConfig(
            response_modalities=["IMAGE"],
            image_config=ImageConfig(aspect_ratio="1:1"),
            candidate_count=1,
        ),
    )

    for part in response.candidates[0].content.parts:
        if part.inline_data:
            with open(output_path, "wb") as f:
                f.write(part.inline_data.data)
            print(f"  ✅ Saved: {output_path} ({len(part.inline_data.data)} bytes)")
            return True
        if part.text:
            print(f"  Text response: {part.text[:200]}")

    print(f"  ❌ No image generated")
    return False


def generate_background(client, bg_name):
    bg_dir = os.path.join(VN_ASSETS, "backgrounds")
    ref_path = os.path.join(bg_dir, f"{bg_name}_ref.jpg")
    pixel_dir = os.path.join(bg_dir, "pixel")
    output_path = os.path.join(pixel_dir, f"{bg_name}_pixel.png")

    os.makedirs(pixel_dir, exist_ok=True)

    print(f"\n🏞️  Generating pixel art for background: {bg_name}")

    if not os.path.exists(ref_path):
        print(f"  ⚠ No reference photo at {ref_path}")
        return False

    ref_bytes = read_image_bytes(ref_path)

    style_prompt = (
        "I am providing reference pixel art character sprites (Jeff, Maria) showing the target art style: "
        "flat colors, bold dark outline (#1A1815), clean cartoon look, pixel art."
    )

    bg_prompt = (
        f"Generate a 320x180 pixel art background scene matching the reference photo in content, "
        f"in the same flat-color cartoon pixel art style as the attached character references. "
        f"Use bold dark outlines (#1A1815) on major objects and edges. "
        f"Output ONLY the 320x180 pixel art image, no text."
    )

    contents = [style_prompt]
    for sp in STYLE_REFERENCES:
        if os.path.exists(sp):
            contents.append(Part.from_bytes(data=read_image_bytes(sp), mime_type="image/png"))
    contents.append(Part.from_bytes(data=ref_bytes, mime_type=get_mime(ref_path)))
    contents.append(bg_prompt)

    response = client.models.generate_content(
        model=MODEL_ID,
        contents=contents,
        config=GenerateContentConfig(
            response_modalities=["IMAGE"],
            image_config=ImageConfig(aspect_ratio="16:9"),
            candidate_count=1,
        ),
    )

    for part in response.candidates[0].content.parts:
        if part.inline_data:
            with open(output_path, "wb") as f:
                f.write(part.inline_data.data)
            print(f"  ✅ Saved: {output_path} ({len(part.inline_data.data)} bytes)")
            return True
        if part.text:
            print(f"  Text response: {part.text[:200]}")

    print(f"  ❌ No image generated")
    return False


def main():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("❌ GEMINI_API_KEY not set. Run: export GEMINI_API_KEY='your-key'")
        sys.exit(1)

    client = genai.Client(api_key=api_key)

    print("=" * 60)
    print("  Gemini 2.5 Flash Image Generator")
    print("  Generates cartoony pixel art matching Jeff/Maria style")
    print("=" * 60)

    # Characters
    generate_character(client, "lola")

    # Backgrounds
    print("\n" + "=" * 60)
    print("  Backgrounds")
    print("=" * 60)
    for bg_name in ["bedroom", "classroom", "evac", "flood"]:
        generate_background(client, bg_name)

    print("\n" + "=" * 60)
    print("  ✅ All Gemini generations complete!")
    print("  Run pixelize.py next to quantize to locked palettes:")
    print("    python3 scripts/pixelize.py")
    print("=" * 60)


if __name__ == "__main__":
    main()
