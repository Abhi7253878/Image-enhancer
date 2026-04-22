#!/usr/bin/env python3
"""
Local Image Enhancement Model
Handles: upscaling, sharpening, colour analysis, contrast enhancement, noise reduction
No external API needed - runs fully offline using Pillow + NumPy + OpenCV
"""

import sys
import json
import base64
import io
import os
import argparse
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter, ImageStat
import cv2

# ─── Colour Analysis ───────────────────────────────────────────────────────────

def analyse_image(img_pil):
    """Return detailed colour/quality stats about the image."""
    img_np = np.array(img_pil.convert("RGB"))
    stat = ImageStat.Stat(img_pil.convert("RGB"))

    r, g, b = img_np[:,:,0], img_np[:,:,1], img_np[:,:,2]

    # Luminance
    lum = 0.299 * r + 0.587 * g + 0.114 * b

    # Contrast ratio (simple: max/min luminance)
    lum_min = float(lum.min())
    lum_max = float(lum.max())
    contrast_ratio = round((lum_max + 0.05) / (lum_min + 0.05), 2)

    # Sharpness (Laplacian variance)
    gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
    laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    sharpness_score = round(min(laplacian_var / 500 * 100, 100), 1)

    # Noise estimate (high-frequency std)
    blur = cv2.GaussianBlur(gray, (5,5), 0)
    noise_map = np.abs(gray.astype(float) - blur.astype(float))
    noise_level = round(float(noise_map.std()), 2)

    # Dominant colours (k-means on downsampled pixels)
    small = cv2.resize(img_np, (100, 100))
    pixels = small.reshape(-1, 3).astype(np.float32)
    k = 5
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 10, 1.0)
    _, labels, centers = cv2.kmeans(pixels, k, None, criteria, 3, cv2.KMEANS_RANDOM_CENTERS)
    counts = np.bincount(labels.flatten())
    sorted_idx = np.argsort(-counts)
    dominant_colours = []
    for i in sorted_idx:
        c = centers[i].astype(int)
        hex_col = "#{:02x}{:02x}{:02x}".format(int(c[0]), int(c[1]), int(c[2]))
        pct = round(counts[i] / len(labels) * 100, 1)
        dominant_colours.append({"hex": hex_col, "percent": pct})

    # Brightness & saturation
    hsv = cv2.cvtColor(img_np, cv2.COLOR_RGB2HSV)
    brightness = round(float(hsv[:,:,2].mean()) / 255 * 100, 1)
    saturation = round(float(hsv[:,:,1].mean()) / 255 * 100, 1)

    return {
        "width": img_pil.width,
        "height": img_pil.height,
        "mode": img_pil.mode,
        "contrast_ratio": contrast_ratio,
        "sharpness_score": sharpness_score,
        "noise_level": noise_level,
        "brightness_pct": brightness,
        "saturation_pct": saturation,
        "mean_rgb": [round(v, 1) for v in stat.mean[:3]],
        "dominant_colours": dominant_colours,
        "megapixels": round(img_pil.width * img_pil.height / 1_000_000, 2),
    }

# ─── Enhancement Pipeline ──────────────────────────────────────────────────────

def upscale_lanczos(img, scale=2):
    """High-quality Lanczos upscaling."""
    new_w = img.width * scale
    new_h = img.height * scale
    return img.resize((new_w, new_h), Image.LANCZOS)


def enhance_image(img_pil, options):
    """
    Apply selected enhancements.
    options keys: scale(int), sharpen(bool), denoise(bool),
                  contrast(float), brightness(float), saturation(float)
    """
    scale      = int(options.get("scale", 2))
    do_sharpen = bool(options.get("sharpen", True))
    do_denoise = bool(options.get("denoise", True))
    contrast   = float(options.get("contrast", 1.3))
    brightness = float(options.get("brightness", 1.0))
    saturation = float(options.get("saturation", 1.2))

    img = img_pil.convert("RGB")

    # 1. Upscale
    if scale > 1:
        img = upscale_lanczos(img, scale)

    # 2. Denoise (bilateral filter keeps edges sharp)
    if do_denoise:
        arr = np.array(img)
        arr = cv2.bilateralFilter(arr, d=9, sigmaColor=75, sigmaSpace=75)
        img = Image.fromarray(arr)

    # 3. Sharpen (unsharp mask)
    if do_sharpen:
        arr = np.array(img)
        blurred = cv2.GaussianBlur(arr, (0, 0), sigmaX=3)
        sharpened = cv2.addWeighted(arr, 1.5, blurred, -0.5, 0)
        img = Image.fromarray(np.clip(sharpened, 0, 255).astype(np.uint8))

    # 4. Contrast
    if contrast != 1.0:
        img = ImageEnhance.Contrast(img).enhance(contrast)

    # 5. Brightness
    if brightness != 1.0:
        img = ImageEnhance.Brightness(img).enhance(brightness)

    # 6. Colour saturation
    if saturation != 1.0:
        img = ImageEnhance.Color(img).enhance(saturation)

    return img


# ─── CLI Entry Point ───────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", choices=["analyse", "enhance"], required=True)
    parser.add_argument("--input",   required=True, help="Path to raw image file")
    parser.add_argument("--options", default=None,  help="Path to JSON options file")
    args = parser.parse_args()

    # Read image from temp file path
    with open(args.input, "rb") as f:
        img_bytes = f.read()
    img = Image.open(io.BytesIO(img_bytes))

    # Read options from temp file (if provided)
    opts = {}
    if args.options and os.path.exists(args.options):
        with open(args.options, "r") as f:
            opts = json.load(f)

    if args.mode == "analyse":
        result = analyse_image(img)
        print(json.dumps({"status": "ok", "analysis": result}))

    elif args.mode == "enhance":
        before_analysis = analyse_image(img)
        enhanced = enhance_image(img, opts)
        after_analysis  = analyse_image(enhanced)

        buf = io.BytesIO()
        enhanced.save(buf, format="PNG", optimize=True)
        out_b64 = base64.b64encode(buf.getvalue()).decode()

        print(json.dumps({
            "status": "ok",
            "image": out_b64,
            "before": before_analysis,
            "after":  after_analysis,
        }))


if __name__ == "__main__":
    main()