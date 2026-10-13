"""
Purpose: Generate the site favicons: plain "YD" set in Playfair Display Bold
         (the English heading font, same glyphs as the navbar badge), gold on
         the site's dark background.
         Each size is rendered directly by FreeType at its final pixel size, so
         the font's hinting snaps stems to whole pixels and 16px stays crisp.
         (No SVG favicon: browsers would scale it down without hinting and blur it.)
Input:   fonts/PlayfairDisplay-YD.ttf
Output:  favicon.ico (16/32/48), favicon.png (32), apple-touch-icon.png (180)
         written to the project root.
Run with: python3 scripts/generate-favicon.py   (needs Pillow)
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
FONT = ROOT / "fonts" / "PlayfairDisplay-YD.ttf"
TEXT = "YD"
BG = "#101217"      # matches --bg-main
GOLD = "#e3b551"    # --accent: oklch(78% 0.13 85)
RADIUS = 7 / 32     # corner radius as a fraction of the icon size

# size -> minimum padding in pixels on the left and right of the letters
PADDING = {16: 1, 32: 2, 48: 4, 180: 28}


def fit_font(size, pad):
    """Largest font size whose 'YD' fits inside the padded width."""
    for px in range(size * 2, 4, -1):
        font = ImageFont.truetype(str(FONT), px)
        left, _, right, _ = font.getbbox(TEXT)
        if right - left <= size - 2 * pad:
            return font
    raise ValueError(f"Cannot fit {TEXT!r} into {size}px")


def background(size, rounded, ss=16):
    """Rounded square, drawn large then downscaled so the corners are anti-aliased."""
    if not rounded:
        return Image.new("RGBA", (size, size), BG)
    big = size * ss
    img = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    ImageDraw.Draw(img).rounded_rectangle((0, 0, big - 1, big - 1), radius=big * RADIUS, fill=BG)
    return img.resize((size, size), Image.LANCZOS)


def render(size, rounded=True):
    img = background(size, rounded)
    draw = ImageDraw.Draw(img)

    font = fit_font(size, PADDING[size])
    left, top, right, bottom = font.getbbox(TEXT)
    x = round((size - (right - left)) / 2) - left
    y = round((size - (bottom - top)) / 2) - top
    draw.text((x, y), TEXT, font=font, fill=GOLD)
    return img


def main():
    icons = {s: render(s) for s in (16, 32, 48)}
    icons[48].save(ROOT / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)],
                   append_images=[icons[16], icons[32]])
    icons[32].save(ROOT / "favicon.png", optimize=True)
    # iOS adds its own rounded mask and ignores transparency: square, opaque.
    render(180, rounded=False).convert("RGB").save(ROOT / "apple-touch-icon.png", optimize=True)
    print("Wrote favicon.ico, favicon.png, apple-touch-icon.png")


if __name__ == "__main__":
    main()
