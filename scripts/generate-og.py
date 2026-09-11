#!/usr/bin/env python3
# Purpose: Generate Open Graph cards (1200x630) for the Hebrew/English site.
# Input: assets/logo-black.jpg + fonts/VarelaRound-Regular.ttf.
# Output: assets/og-he.png (and optionally assets/og-en.png).
# Run with: python3 scripts/generate-og.py

from __future__ import annotations

import os
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
OUT_HE = ASSETS / "og-he.png"
OUT_EN = ASSETS / "og-en.png"
LOGO = ASSETS / "logo-black.jpg"

W, H = 1200, 630
BG = (28, 32, 42)  # matches --bg-main-ish #1c202a
ACCENT = (232, 196, 104)
TEXT = (245, 242, 232)
MUTED = (200, 206, 218)

FONT_LOCAL = ROOT / "fonts" / "VarelaRound-Regular.ttf"


def load_font(size: int) -> ImageFont.FreeTypeFont:
    if FONT_LOCAL.exists():
        return ImageFont.truetype(str(FONT_LOCAL), size=size)
    return ImageFont.load_default()


def fit_logo(path: Path, max_w: int, max_h: int) -> Image.Image:
    img = Image.open(path).convert("RGBA")
    # Drop near-black background so the mark sits on the card
    px = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if r < 40 and g < 40 and b < 40:
                px[x, y] = (r, g, b, 0)
    img.thumbnail((max_w, max_h), Image.Resampling.LANCZOS)
    return img


def reflection(logo: Image.Image, fade: float = 0.22) -> Image.Image:
    flipped = logo.transpose(Image.Transpose.FLIP_TOP_BOTTOM)
    # Horizontal wash so it reads as a faint floor reflection
    mask = Image.new("L", flipped.size, 0)
    draw = ImageDraw.Draw(mask)
    h = flipped.size[1]
    for y in range(h):
        t = 1.0 - (y / max(h - 1, 1))
        draw.line([(0, y), (flipped.size[0], y)], fill=int(255 * fade * t))
    out = flipped.copy()
    out.putalpha(ImageEnhance.Brightness(out.split()[-1]).enhance(1.0))
    alpha = out.split()[-1]
    alpha = Image.composite(mask, Image.new("L", flipped.size, 0), alpha)
    r, g, b, _ = out.split()
    return Image.merge("RGBA", (r, g, b, alpha)).filter(ImageFilter.GaussianBlur(1.2))


def card(title: str, subtitle: str, out: Path) -> None:
    canvas = Image.new("RGB", (W, H), BG)
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    # Soft accent wash, left-to-right
    for x in range(W):
        a = int(28 * (1 - abs((x / W) - 0.35)))
        d.line([(x, 0), (x, H)], fill=(ACCENT[0], ACCENT[1], ACCENT[2], max(a, 0)))
    canvas = Image.alpha_composite(canvas.convert("RGBA"), overlay)

    logo = fit_logo(LOGO, 420, 280)
    refl = reflection(logo)
    lx, ly = 80, 110
    canvas.paste(logo, (lx, ly), logo)
    canvas.paste(refl, (lx, ly + logo.size[1] + 8), refl)

    draw = ImageDraw.Draw(canvas)
    title_font = load_font(54)
    sub_font = load_font(28)
    small = load_font(22)
    tx = 560
    draw.text((tx, 200), title, font=title_font, fill=TEXT, anchor="lt")
    draw.multiline_text((tx, 280), subtitle, font=sub_font, fill=MUTED, spacing=8)
    draw.rectangle([tx, 500, tx + 72, 504], fill=ACCENT)
    draw.text((tx, 524), "yaeldruckman.com", font=small, fill=ACCENT)

    canvas.convert("RGB").save(out, "PNG", optimize=True)
    print(f"wrote {out} ({out.stat().st_size} bytes)")


def main() -> None:
    os.chdir(ROOT)
    if not LOGO.exists():
        raise SystemExit(f"missing logo: {LOGO}")
    card(
        "יעל דרוקמן",
        "עריכת דין · גישור\nביטוח ופיננסים",
        OUT_HE,
    )
    card(
        "Yael Druckman",
        "Advocate · Mediator\nInsurance & Finance",
        OUT_EN,
    )


if __name__ == "__main__":
    main()
