#!/usr/bin/env python3
"""Generate the TaillogToss raster icon set."""

from __future__ import annotations

import argparse
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT_DIR = ROOT / "src/assets/icons"

NAVY = (10, 30, 76, 255)
NAVY_MID = (28, 57, 118, 255)
NAVY_SOFT = (54, 82, 144, 255)
GOLD = (250, 194, 40, 255)
GOLD_DEEP = (229, 162, 15, 255)
GOLD_LIGHT = (255, 227, 132, 255)
CREAM = (255, 245, 214, 255)
WHITE = (255, 255, 255, 255)
CORAL = (242, 122, 88, 255)
SKY = (122, 193, 231, 255)
SAGE = (132, 171, 138, 255)
INK = (7, 16, 38, 255)
SHADOW = (6, 12, 28, 46)
SOFT_SHADOW = (6, 12, 28, 28)
TRANSPARENT = (0, 0, 0, 0)

TAB_ICON_SPECS = {
    "ic-home": (48, 72),
    "ic-training": (48, 72),
    "ic-coaching": (48, 72),
    "ic-settings": (48, 72),
    "ic-paw": (48, 72),
    "ic-add-log": (48, 72),
    "ic-analysis": (48, 72),
    "ic-back": (48, 72),
}

CATEGORY_ICON_SPECS = {
    "ic-cat-barking": (80, 120),
    "ic-cat-mounting": (80, 120),
    "ic-cat-excitement": (80, 120),
    "ic-cat-toilet": (80, 120),
    "ic-cat-destructive": (80, 120),
    "ic-cat-anxiety": (80, 120),
    "ic-cat-aggression": (80, 120),
    "ic-cat-fear": (80, 120),
    "ic-cat-walk": (80, 120),
    "ic-cat-meal": (80, 120),
    "ic-cat-train": (80, 120),
    "ic-cat-play": (80, 120),
    "ic-cat-rest": (80, 120),
    "ic-cat-grooming": (80, 120),
}

BADGE_ICON_SPECS = {
    "badge-streak-3": (128, 192),
    "badge-streak-7": (128, 192),
    "badge-streak-30": (128, 192),
    "badge-pro": (128, 192),
}

ILLUST_SPECS = {
    "illust-empty-log": (400, 600),
    "illust-empty-coaching": (400, 600),
    "illust-empty-training": (400, 600),
}

CATEGORY_ACCENTS = {
    "ic-cat-barking": CORAL,
    "ic-cat-mounting": CORAL,
    "ic-cat-excitement": GOLD,
    "ic-cat-toilet": SKY,
    "ic-cat-destructive": CORAL,
    "ic-cat-anxiety": SAGE,
    "ic-cat-aggression": CORAL,
    "ic-cat-fear": SKY,
    "ic-cat-walk": SAGE,
    "ic-cat-meal": GOLD,
    "ic-cat-train": GOLD,
    "ic-cat-play": SKY,
    "ic-cat-rest": NAVY_SOFT,
    "ic-cat-grooming": SKY,
}

BADGE_RIBBONS = {
    "badge-streak-3": CORAL,
    "badge-streak-7": SKY,
    "badge-streak-30": SAGE,
    "badge-pro": GOLD,
}


def load_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "/System/Library/Fonts/Supplemental/Avenir Next Bold.ttf",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
    ]
    for candidate in candidates:
        path = Path(candidate)
        if path.exists():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


def i(value: float) -> int:
    return int(round(value))


def mix(color_a: tuple[int, int, int, int], color_b: tuple[int, int, int, int], ratio: float) -> tuple[int, int, int, int]:
    return tuple(
        i(color_a[idx] + (color_b[idx] - color_a[idx]) * ratio)
        for idx in range(4)
    )


def with_alpha(color: tuple[int, int, int, int], alpha: int) -> tuple[int, int, int, int]:
    return (color[0], color[1], color[2], alpha)


def new_canvas(size: int) -> Image.Image:
    return Image.new("RGBA", (size, size), TRANSPARENT)


def add_shadow(
    layer: Image.Image,
    blur: int,
    offset: tuple[int, int],
    color: tuple[int, int, int, int],
) -> Image.Image:
    shadow = Image.new("RGBA", layer.size, TRANSPARENT)
    color_layer = Image.new("RGBA", layer.size, color)
    alpha = layer.getchannel("A")
    shadow.paste(color_layer, mask=alpha)
    shadow = shadow.filter(ImageFilter.GaussianBlur(blur))

    result = Image.new("RGBA", layer.size, TRANSPARENT)
    result.alpha_composite(shadow, offset)
    return result


def downsample(image: Image.Image, output_size: int) -> Image.Image:
    return image.resize((output_size, output_size), Image.Resampling.LANCZOS)


def arc_points(
    cx: float,
    cy: float,
    radius: float,
    start_deg: float,
    end_deg: float,
    steps: int = 20,
) -> list[tuple[int, int]]:
    points: list[tuple[int, int]] = []
    for step in range(steps + 1):
        ratio = step / steps
        angle = math.radians(start_deg + (end_deg - start_deg) * ratio)
        points.append((i(cx + radius * math.cos(angle)), i(cy + radius * math.sin(angle))))
    return points


def compose_symbol(s: int, painter, scale: float = 1.0, center: tuple[float, float] = (0.5, 0.5)) -> Image.Image:
    symbol = new_canvas(s)
    painter(ImageDraw.Draw(symbol), s)
    if scale != 1.0:
        scaled = max(1, i(s * scale))
        symbol = symbol.resize((scaled, scaled), Image.Resampling.LANCZOS)
    layer = new_canvas(s)
    x = i(s * center[0] - symbol.width / 2)
    y = i(s * center[1] - symbol.height / 2)
    layer.alpha_composite(symbol, (x, y))
    return layer


def centered_text(
    draw: ImageDraw.ImageDraw,
    text: str,
    x: float,
    y: float,
    font: ImageFont.FreeTypeFont | ImageFont.ImageFont,
    fill: tuple[int, int, int, int],
) -> None:
    box = draw.textbbox((0, 0), text, font=font)
    draw.text((i(x - (box[2] - box[0]) / 2), i(y - (box[3] - box[1]) / 2)), text, font=font, fill=fill)


def draw_paw(
    draw: ImageDraw.ImageDraw,
    cx: float,
    cy: float,
    size: float,
    fill: tuple[int, int, int, int],
    outline: tuple[int, int, int, int] | None = None,
    outline_width: int = 0,
) -> None:
    toe_r = size * 0.13
    pad_w = size * 0.48
    pad_h = size * 0.34
    offsets = [
        (-size * 0.24, -size * 0.22),
        (-size * 0.08, -size * 0.35),
        (size * 0.08, -size * 0.35),
        (size * 0.24, -size * 0.22),
    ]
    for ox, oy in offsets:
        draw.ellipse(
            [i(cx + ox - toe_r), i(cy + oy - toe_r), i(cx + ox + toe_r), i(cy + oy + toe_r)],
            fill=fill,
            outline=outline,
            width=outline_width,
        )
    draw.rounded_rectangle(
        [i(cx - pad_w / 2), i(cy - pad_h / 2), i(cx + pad_w / 2), i(cy + pad_h / 2)],
        radius=i(size * 0.14),
        fill=fill,
        outline=outline,
        width=outline_width,
    )


def draw_whistle_mark(draw: ImageDraw.ImageDraw, s: int, accent: tuple[int, int, int, int] = CREAM, sound: bool = True) -> None:
    stroke = i(s * 0.038)
    chamber = [i(s * 0.16), i(s * 0.34), i(s * 0.42), i(s * 0.66)]
    draw.ellipse(chamber, fill=GOLD, outline=NAVY, width=stroke)
    draw.ellipse([i(s * 0.22), i(s * 0.4), i(s * 0.34), i(s * 0.6)], fill=TRANSPARENT, outline=NAVY, width=stroke)
    body = [
        (i(s * 0.32), i(s * 0.37)),
        (i(s * 0.74), i(s * 0.37)),
        (i(s * 0.78), i(s * 0.44)),
        (i(s * 0.78), i(s * 0.58)),
        (i(s * 0.64), i(s * 0.63)),
        (i(s * 0.36), i(s * 0.63)),
        (i(s * 0.3), i(s * 0.57)),
    ]
    draw.polygon(body, fill=GOLD, outline=NAVY)
    draw.rounded_rectangle([i(s * 0.48), i(s * 0.31), i(s * 0.58), i(s * 0.39)], radius=i(s * 0.02), fill=GOLD, outline=NAVY, width=stroke // 2)
    draw.ellipse([i(s * 0.32), i(s * 0.42), i(s * 0.43), i(s * 0.53)], fill=NAVY)
    draw.line(arc_points(s * 0.44, s * 0.53, s * 0.18, 15, 130, 14), fill=NAVY, width=stroke)
    draw.line(arc_points(s * 0.46, s * 0.66, s * 0.26, 196, 330, 16), fill=accent, width=i(s * 0.026))
    if sound:
        for idx, x in enumerate((0.76, 0.85, 0.9)):
            draw.line(
                [(i(s * x), i(s * (0.28 + idx * 0.03))), (i(s * (x + 0.05)), i(s * (0.18 + idx * 0.05)))],
                fill=accent if idx else GOLD_LIGHT,
                width=i(s * 0.03),
            )


def draw_house(draw: ImageDraw.ImageDraw, s: int) -> None:
    stroke = i(s * 0.052)
    roof = [(i(s * 0.24), i(s * 0.46)), (i(s * 0.5), i(s * 0.24)), (i(s * 0.76), i(s * 0.46))]
    draw.line(roof, fill=NAVY, width=stroke, joint="curve")
    draw.rounded_rectangle([i(s * 0.32), i(s * 0.44), i(s * 0.68), i(s * 0.76)], radius=i(s * 0.08), outline=NAVY, width=stroke)
    draw.rounded_rectangle([i(s * 0.45), i(s * 0.58), i(s * 0.55), i(s * 0.76)], radius=i(s * 0.03), fill=GOLD)
    draw_paw(draw, s * 0.5, s * 0.58, s * 0.17, CREAM)


def draw_chat_bubble(draw: ImageDraw.ImageDraw, s: int) -> None:
    stroke = i(s * 0.05)
    draw.rounded_rectangle([i(s * 0.22), i(s * 0.26), i(s * 0.78), i(s * 0.62)], radius=i(s * 0.12), outline=NAVY, width=stroke)
    draw.polygon([(i(s * 0.42), i(s * 0.62)), (i(s * 0.54), i(s * 0.62)), (i(s * 0.46), i(s * 0.77))], fill=WHITE, outline=NAVY)
    for x in (0.38, 0.5, 0.62):
        draw.ellipse([i(s * x - s * 0.045), i(s * 0.42 - s * 0.045), i(s * x + s * 0.045), i(s * 0.42 + s * 0.045)], fill=GOLD)
    draw.line([(i(s * 0.72), i(s * 0.2)), (i(s * 0.79), i(s * 0.13))], fill=CORAL, width=i(s * 0.035))
    draw.line([(i(s * 0.77), i(s * 0.26)), (i(s * 0.84), i(s * 0.22))], fill=CORAL, width=i(s * 0.035))


def draw_gear(draw: ImageDraw.ImageDraw, s: int) -> None:
    cx = s * 0.5
    cy = s * 0.52
    outer = s * 0.22
    tooth_w = s * 0.08
    tooth_h = s * 0.14
    for deg in range(0, 360, 45):
        angle = math.radians(deg)
        tx = cx + math.cos(angle) * outer
        ty = cy + math.sin(angle) * outer
        dx = math.cos(angle + math.pi / 2) * tooth_w / 2
        dy = math.sin(angle + math.pi / 2) * tooth_w / 2
        ex = math.cos(angle) * tooth_h / 2
        ey = math.sin(angle) * tooth_h / 2
        draw.polygon(
            [
                (i(tx - dx - ex), i(ty - dy - ey)),
                (i(tx + dx - ex), i(ty + dy - ey)),
                (i(tx + dx + ex), i(ty + dy + ey)),
                (i(tx - dx + ex), i(ty - dy + ey)),
            ],
            fill=NAVY,
        )
    draw.ellipse([i(cx - s * 0.2), i(cy - s * 0.2), i(cx + s * 0.2), i(cy + s * 0.2)], fill=NAVY)
    draw.ellipse([i(cx - s * 0.11), i(cy - s * 0.11), i(cx + s * 0.11), i(cy + s * 0.11)], fill=GOLD)
    draw_paw(draw, cx, cy, s * 0.15, CREAM)


def draw_note_plus(draw: ImageDraw.ImageDraw, s: int) -> None:
    stroke = i(s * 0.05)
    draw.rounded_rectangle([i(s * 0.26), i(s * 0.22), i(s * 0.74), i(s * 0.78)], radius=i(s * 0.08), outline=NAVY, width=stroke)
    draw.line([(i(s * 0.38), i(s * 0.36)), (i(s * 0.62), i(s * 0.36))], fill=GOLD, width=i(s * 0.05))
    draw.line([(i(s * 0.5), i(s * 0.24)), (i(s * 0.5), i(s * 0.48))], fill=GOLD, width=i(s * 0.05))
    draw.line([(i(s * 0.36), i(s * 0.58)), (i(s * 0.64), i(s * 0.58))], fill=NAVY_SOFT, width=i(s * 0.04))
    draw.line([(i(s * 0.36), i(s * 0.68)), (i(s * 0.56), i(s * 0.68))], fill=NAVY_SOFT, width=i(s * 0.04))


def draw_chart(draw: ImageDraw.ImageDraw, s: int) -> None:
    for idx, box in enumerate(((0.24, 0.56, 0.34, 0.76), (0.42, 0.44, 0.52, 0.76), (0.6, 0.32, 0.7, 0.76))):
        fill = NAVY if idx < 2 else NAVY_MID
        draw.rounded_rectangle([i(s * box[0]), i(s * box[1]), i(s * box[2]), i(s * box[3])], radius=i(s * 0.03), fill=fill)
    points = [(i(s * 0.24), i(s * 0.62)), (i(s * 0.44), i(s * 0.5)), (i(s * 0.58), i(s * 0.55)), (i(s * 0.74), i(s * 0.34))]
    draw.line(points, fill=GOLD, width=i(s * 0.055), joint="curve")
    for x, y in points[1:]:
        draw.ellipse([x - i(s * 0.04), y - i(s * 0.04), x + i(s * 0.04), y + i(s * 0.04)], fill=CREAM)


def draw_back(draw: ImageDraw.ImageDraw, s: int) -> None:
    stroke = i(s * 0.07)
    draw.line([(i(s * 0.68), i(s * 0.26)), (i(s * 0.38), i(s * 0.5)), (i(s * 0.68), i(s * 0.74))], fill=NAVY, width=stroke, joint="curve")
    draw.line([(i(s * 0.6), i(s * 0.22)), (i(s * 0.74), i(s * 0.22))], fill=GOLD, width=i(s * 0.04))


def draw_megaphone(draw: ImageDraw.ImageDraw, s: int) -> None:
    draw.polygon([(i(s * 0.34), i(s * 0.4)), (i(s * 0.58), i(s * 0.32)), (i(s * 0.58), i(s * 0.68)), (i(s * 0.34), i(s * 0.6))], fill=GOLD, outline=NAVY)
    draw.rounded_rectangle([i(s * 0.24), i(s * 0.46), i(s * 0.34), i(s * 0.56)], radius=i(s * 0.03), fill=GOLD_LIGHT)
    for radius in (0.12, 0.2):
        draw.line(arc_points(s * 0.58, s * 0.5, s * radius, -45, 45, 12), fill=CORAL, width=i(s * 0.045))


def draw_mounting(draw: ImageDraw.ImageDraw, s: int) -> None:
    draw_paw(draw, s * 0.4, s * 0.62, s * 0.24, GOLD, outline=NAVY, outline_width=i(s * 0.02))
    draw_paw(draw, s * 0.62, s * 0.42, s * 0.2, GOLD_LIGHT, outline=NAVY, outline_width=i(s * 0.02))
    draw.line([(i(s * 0.5), i(s * 0.7)), (i(s * 0.64), i(s * 0.53))], fill=CORAL, width=i(s * 0.055))
    draw.polygon([(i(s * 0.64), i(s * 0.53)), (i(s * 0.62), i(s * 0.63)), (i(s * 0.72), i(s * 0.59))], fill=CORAL)


def draw_excitement(draw: ImageDraw.ImageDraw, s: int) -> None:
    center = (s * 0.5, s * 0.48)
    outer = s * 0.22
    inner = s * 0.1
    points = []
    for idx in range(16):
        angle = math.radians(idx * 22.5 - 90)
        radius = outer if idx % 2 == 0 else inner
        points.append((i(center[0] + math.cos(angle) * radius), i(center[1] + math.sin(angle) * radius)))
    draw.polygon(points, fill=GOLD, outline=NAVY)
    draw.ellipse([i(s * 0.42), i(s * 0.4), i(s * 0.58), i(s * 0.56)], fill=CORAL)
    draw.line(arc_points(s * 0.28, s * 0.74, s * 0.16, 205, 338, 12), fill=GOLD_DEEP, width=i(s * 0.035))


def draw_toilet(draw: ImageDraw.ImageDraw, s: int) -> None:
    draw.rounded_rectangle([i(s * 0.24), i(s * 0.52), i(s * 0.76), i(s * 0.68)], radius=i(s * 0.06), fill=WHITE, outline=NAVY, width=i(s * 0.03))
    draw.rounded_rectangle([i(s * 0.3), i(s * 0.36), i(s * 0.7), i(s * 0.54)], radius=i(s * 0.07), fill=CREAM, outline=NAVY, width=i(s * 0.03))
    draw.polygon([(i(s * 0.5), i(s * 0.24)), (i(s * 0.58), i(s * 0.4)), (i(s * 0.5), i(s * 0.54)), (i(s * 0.42), i(s * 0.4))], fill=SKY)


def draw_destructive(draw: ImageDraw.ImageDraw, s: int) -> None:
    draw.rounded_rectangle([i(s * 0.28), i(s * 0.42), i(s * 0.72), i(s * 0.58)], radius=i(s * 0.06), fill=GOLD, outline=NAVY, width=i(s * 0.02))
    for box in ((0.22, 0.36, 0.36, 0.5), (0.22, 0.5, 0.36, 0.64), (0.64, 0.36, 0.78, 0.5), (0.64, 0.5, 0.78, 0.64)):
        draw.ellipse([i(s * box[0]), i(s * box[1]), i(s * box[2]), i(s * box[3])], fill=GOLD)
    draw.line([(i(s * 0.46), i(s * 0.34)), (i(s * 0.54), i(s * 0.46)), (i(s * 0.49), i(s * 0.52)), (i(s * 0.57), i(s * 0.68))], fill=CORAL, width=i(s * 0.065))


def draw_anxiety(draw: ImageDraw.ImageDraw, s: int) -> None:
    stroke = i(s * 0.04)
    draw.line([(i(s * 0.28), i(s * 0.48)), (i(s * 0.5), i(s * 0.3)), (i(s * 0.72), i(s * 0.48))], fill=NAVY, width=stroke)
    draw.rounded_rectangle([i(s * 0.34), i(s * 0.46), i(s * 0.66), i(s * 0.74)], radius=i(s * 0.05), outline=NAVY, width=stroke)
    draw.line([(i(s * 0.4), i(s * 0.6)), (i(s * 0.46), i(s * 0.55)), (i(s * 0.52), i(s * 0.63)), (i(s * 0.58), i(s * 0.53)), (i(s * 0.64), i(s * 0.58))], fill=CORAL, width=i(s * 0.04))


def draw_aggression(draw: ImageDraw.ImageDraw, s: int) -> None:
    shield = [(i(s * 0.5), i(s * 0.22)), (i(s * 0.72), i(s * 0.32)), (i(s * 0.68), i(s * 0.66)), (i(s * 0.5), i(s * 0.8)), (i(s * 0.32), i(s * 0.66)), (i(s * 0.28), i(s * 0.32))]
    draw.polygon(shield, fill=GOLD, outline=NAVY)
    draw.polygon([(i(s * 0.4), i(s * 0.4)), (i(s * 0.52), i(s * 0.56)), (i(s * 0.44), i(s * 0.66))], fill=NAVY)
    draw.polygon([(i(s * 0.6), i(s * 0.4)), (i(s * 0.48), i(s * 0.56)), (i(s * 0.56), i(s * 0.66))], fill=NAVY)
    draw.line([(i(s * 0.5), i(s * 0.3)), (i(s * 0.5), i(s * 0.42))], fill=CORAL, width=i(s * 0.05))


def draw_fear(draw: ImageDraw.ImageDraw, s: int) -> None:
    draw.polygon([(i(s * 0.2), i(s * 0.5)), (i(s * 0.36), i(s * 0.34)), (i(s * 0.64), i(s * 0.34)), (i(s * 0.8), i(s * 0.5)), (i(s * 0.64), i(s * 0.66)), (i(s * 0.36), i(s * 0.66))], fill=GOLD_LIGHT, outline=NAVY)
    draw.ellipse([i(s * 0.42), i(s * 0.42), i(s * 0.58), i(s * 0.58)], fill=NAVY)
    draw.line(arc_points(s * 0.72, s * 0.54, s * 0.18, 80, 260, 14), fill=SKY, width=i(s * 0.05))
    draw.polygon([(i(s * 0.54), i(s * 0.67)), (i(s * 0.46), i(s * 0.65)), (i(s * 0.5), i(s * 0.76))], fill=SKY)


def draw_walk(draw: ImageDraw.ImageDraw, s: int) -> None:
    draw.ellipse([i(s * 0.24), i(s * 0.16), i(s * 0.44), i(s * 0.36)], outline=NAVY, width=i(s * 0.05))
    draw.line([(i(s * 0.34), i(s * 0.26)), (i(s * 0.34), i(s * 0.42)), (i(s * 0.54), i(s * 0.58))], fill=NAVY, width=i(s * 0.055), joint="curve")
    draw_paw(draw, s * 0.62, s * 0.66, s * 0.22, GOLD, outline=NAVY, outline_width=i(s * 0.02))
    draw.line(arc_points(s * 0.5, s * 0.74, s * 0.18, 208, 340, 14), fill=SAGE, width=i(s * 0.04))


def draw_meal(draw: ImageDraw.ImageDraw, s: int) -> None:
    draw.pieslice([i(s * 0.24), i(s * 0.34), i(s * 0.76), i(s * 0.76)], start=0, end=180, fill=GOLD, outline=NAVY)
    draw.rounded_rectangle([i(s * 0.24), i(s * 0.54), i(s * 0.76), i(s * 0.64)], radius=i(s * 0.04), fill=GOLD_LIGHT)
    for cx, cy in ((0.4, 0.46), (0.5, 0.42), (0.6, 0.46)):
        draw.ellipse([i(s * cx - s * 0.04), i(s * cy - s * 0.04), i(s * cx + s * 0.04), i(s * cy + s * 0.04)], fill=CORAL)


def draw_train(draw: ImageDraw.ImageDraw, s: int) -> None:
    draw_whistle_mark(draw, s, accent=SKY, sound=True)
    draw.line([(i(s * 0.68), i(s * 0.78)), (i(s * 0.78), i(s * 0.68))], fill=SKY, width=i(s * 0.04))
    draw.line([(i(s * 0.7), i(s * 0.68)), (i(s * 0.76), i(s * 0.76))], fill=SKY, width=i(s * 0.04))


def draw_play(draw: ImageDraw.ImageDraw, s: int) -> None:
    stroke = i(s * 0.055)
    draw.ellipse([i(s * 0.24), i(s * 0.24), i(s * 0.76), i(s * 0.76)], fill=GOLD_LIGHT, outline=NAVY, width=i(s * 0.025))
    draw.arc([i(s * 0.3), i(s * 0.3), i(s * 0.7), i(s * 0.7)], start=35, end=145, fill=NAVY, width=stroke)
    draw.arc([i(s * 0.3), i(s * 0.3), i(s * 0.7), i(s * 0.7)], start=215, end=325, fill=NAVY, width=stroke)
    draw.arc([i(s * 0.18), i(s * 0.18), i(s * 0.82), i(s * 0.82)], start=125, end=235, fill=SKY, width=i(s * 0.04))


def draw_rest(draw: ImageDraw.ImageDraw, s: int) -> None:
    draw.ellipse([i(s * 0.26), i(s * 0.2), i(s * 0.66), i(s * 0.62)], fill=GOLD_LIGHT)
    draw.ellipse([i(s * 0.38), i(s * 0.18), i(s * 0.76), i(s * 0.6)], fill=NAVY_MID)
    draw_paw(draw, s * 0.58, s * 0.66, s * 0.18, CREAM)


def draw_grooming(draw: ImageDraw.ImageDraw, s: int) -> None:
    draw.rounded_rectangle([i(s * 0.28), i(s * 0.3), i(s * 0.72), i(s * 0.48)], radius=i(s * 0.06), fill=GOLD, outline=NAVY, width=i(s * 0.025))
    for idx in range(6):
        x = s * (0.34 + idx * 0.06)
        draw.line([(i(x), i(s * 0.48)), (i(x), i(s * 0.72))], fill=GOLD_LIGHT, width=i(s * 0.03))
    draw.line([(i(s * 0.72), i(s * 0.26)), (i(s * 0.82), i(s * 0.18))], fill=SKY, width=i(s * 0.04))
    draw.line([(i(s * 0.78), i(s * 0.26)), (i(s * 0.84), i(s * 0.32))], fill=CREAM, width=i(s * 0.04))


def draw_soft_tile(draw: ImageDraw.ImageDraw, s: int, accent: tuple[int, int, int, int]) -> None:
    outer = [i(s * 0.16), i(s * 0.16), i(s * 0.84), i(s * 0.84)]
    inner = [i(s * 0.2), i(s * 0.2), i(s * 0.8), i(s * 0.8)]
    draw.rounded_rectangle(outer, radius=i(s * 0.18), fill=mix(WHITE, CREAM, 0.7))
    draw.rounded_rectangle(inner, radius=i(s * 0.15), fill=mix(CREAM, accent, 0.22))
    draw.ellipse([i(s * 0.64), i(s * 0.22), i(s * 0.76), i(s * 0.34)], fill=with_alpha(accent, 72))


TAB_RENDERERS = {
    "ic-home": draw_house,
    "ic-training": lambda draw, s: draw_whistle_mark(draw, s, accent=CREAM, sound=True),
    "ic-coaching": draw_chat_bubble,
    "ic-settings": draw_gear,
    "ic-paw": lambda draw, s: draw_paw(draw, s * 0.5, s * 0.55, s * 0.42, GOLD, outline=NAVY, outline_width=i(s * 0.03)),
    "ic-add-log": draw_note_plus,
    "ic-analysis": draw_chart,
    "ic-back": draw_back,
}

CATEGORY_RENDERERS = {
    "ic-cat-barking": draw_megaphone,
    "ic-cat-mounting": draw_mounting,
    "ic-cat-excitement": draw_excitement,
    "ic-cat-toilet": draw_toilet,
    "ic-cat-destructive": draw_destructive,
    "ic-cat-anxiety": draw_anxiety,
    "ic-cat-aggression": draw_aggression,
    "ic-cat-fear": draw_fear,
    "ic-cat-walk": draw_walk,
    "ic-cat-meal": draw_meal,
    "ic-cat-train": draw_train,
    "ic-cat-play": draw_play,
    "ic-cat-rest": draw_rest,
    "ic-cat-grooming": draw_grooming,
}


def render_tab_icon(kind: str, target_px: int) -> Image.Image:
    s = 512
    symbol = new_canvas(s)
    TAB_RENDERERS[kind](ImageDraw.Draw(symbol), s)
    base = add_shadow(symbol, blur=i(s * 0.03), offset=(0, i(s * 0.025)), color=SHADOW)
    base.alpha_composite(symbol)
    return downsample(base, target_px)


def render_category_icon(kind: str, target_px: int) -> Image.Image:
    s = 512
    accent = CATEGORY_ACCENTS[kind]
    tile = new_canvas(s)
    draw_soft_tile(ImageDraw.Draw(tile), s, accent)
    symbol = compose_symbol(s, CATEGORY_RENDERERS[kind], scale=0.68, center=(0.5, 0.54))
    shadow = add_shadow(tile, blur=i(s * 0.03), offset=(0, i(s * 0.02)), color=SOFT_SHADOW)
    base = new_canvas(s)
    base.alpha_composite(shadow)
    base.alpha_composite(tile)
    base.alpha_composite(symbol)
    return downsample(base, target_px)


def draw_medal_base(draw: ImageDraw.ImageDraw, s: int, ribbon: tuple[int, int, int, int]) -> None:
    left_tail = [(i(s * 0.3), i(s * 0.74)), (i(s * 0.22), i(s * 0.98)), (i(s * 0.42), i(s * 0.84))]
    right_tail = [(i(s * 0.7), i(s * 0.74)), (i(s * 0.58), i(s * 0.84)), (i(s * 0.78), i(s * 0.98))]
    draw.polygon(left_tail, fill=ribbon)
    draw.polygon(right_tail, fill=ribbon)
    draw.ellipse([i(s * 0.1), i(s * 0.08), i(s * 0.9), i(s * 0.88)], fill=GOLD)
    draw.ellipse([i(s * 0.16), i(s * 0.14), i(s * 0.84), i(s * 0.82)], fill=NAVY)
    draw.arc([i(s * 0.18), i(s * 0.16), i(s * 0.82), i(s * 0.8)], start=215, end=332, fill=GOLD_LIGHT, width=i(s * 0.045))


def render_badge(kind: str, target_px: int) -> Image.Image:
    s = 768
    ribbon = BADGE_RIBBONS[kind]
    layer = new_canvas(s)
    draw = ImageDraw.Draw(layer)
    draw_medal_base(draw, s, ribbon)
    small_font = load_font(i(s * 0.07))
    if kind == "badge-pro":
        mark = compose_symbol(s, lambda draw_ctx, size: draw_whistle_mark(draw_ctx, size, accent=GOLD_LIGHT, sound=False), scale=0.44, center=(0.5, 0.42))
        layer.alpha_composite(mark)
        centered_text(draw, "PRO", s * 0.5, s * 0.66, load_font(i(s * 0.16)), GOLD_LIGHT)
        centered_text(draw, "TAILLOG", s * 0.5, s * 0.78, small_font, CREAM)
    else:
        streak = kind.split("-")[-1]
        centered_text(draw, streak, s * 0.5, s * 0.4, load_font(i(s * 0.26)), GOLD_LIGHT)
        centered_text(draw, "DAY", s * 0.5, s * 0.6, load_font(i(s * 0.08)), CREAM)
        centered_text(draw, "STREAK", s * 0.5, s * 0.69, load_font(i(s * 0.08)), CREAM)
        draw_paw(draw, s * 0.5, s * 0.24, s * 0.12, mix(CREAM, ribbon, 0.12))
    base = add_shadow(layer, blur=i(s * 0.022), offset=(0, i(s * 0.03)), color=SHADOW)
    base.alpha_composite(layer)
    return downsample(base, target_px)


def draw_blob(draw: ImageDraw.ImageDraw, s: int, box: tuple[float, float, float, float], accent: tuple[int, int, int, int]) -> None:
    draw.rounded_rectangle([i(s * box[0]), i(s * box[1]), i(s * box[2]), i(s * box[3])], radius=i(s * 0.14), fill=mix(CREAM, accent, 0.12))


def draw_clipboard(draw: ImageDraw.ImageDraw, s: int) -> None:
    draw.rounded_rectangle([i(s * 0.2), i(s * 0.22), i(s * 0.5), i(s * 0.68)], radius=i(s * 0.05), fill=WHITE, outline=NAVY, width=i(s * 0.02))
    draw.rounded_rectangle([i(s * 0.28), i(s * 0.17), i(s * 0.42), i(s * 0.26)], radius=i(s * 0.03), fill=GOLD)
    for idx in range(3):
        y = s * (0.34 + idx * 0.1)
        draw.ellipse([i(s * 0.26), i(y - s * 0.02), i(s * 0.3), i(y + s * 0.02)], fill=CORAL)
        draw.line([(i(s * 0.34), i(y)), (i(s * 0.46), i(y))], fill=NAVY_SOFT, width=i(s * 0.02))


def draw_chat_stack(draw: ImageDraw.ImageDraw, s: int) -> None:
    draw.rounded_rectangle([i(s * 0.17), i(s * 0.26), i(s * 0.48), i(s * 0.5)], radius=i(s * 0.05), fill=WHITE, outline=NAVY, width=i(s * 0.02))
    draw.polygon([(i(s * 0.28), i(s * 0.5)), (i(s * 0.34), i(s * 0.5)), (i(s * 0.3), i(s * 0.58))], fill=WHITE, outline=NAVY)
    draw.rounded_rectangle([i(s * 0.42), i(s * 0.34), i(s * 0.78), i(s * 0.58)], radius=i(s * 0.05), fill=mix(WHITE, SKY, 0.25), outline=NAVY, width=i(s * 0.02))
    draw.polygon([(i(s * 0.62), i(s * 0.58)), (i(s * 0.68), i(s * 0.58)), (i(s * 0.64), i(s * 0.66))], fill=mix(WHITE, SKY, 0.25), outline=NAVY)


def draw_training_scene(draw: ImageDraw.ImageDraw, s: int) -> None:
    draw.line([(i(s * 0.14), i(s * 0.74)), (i(s * 0.86), i(s * 0.74))], fill=SAGE, width=i(s * 0.022))
    draw.line([(i(s * 0.68), i(s * 0.26)), (i(s * 0.68), i(s * 0.7))], fill=CORAL, width=i(s * 0.02))
    draw.polygon([(i(s * 0.68), i(s * 0.26)), (i(s * 0.82), i(s * 0.32)), (i(s * 0.68), i(s * 0.38))], fill=GOLD)
    draw.arc([i(s * 0.2), i(s * 0.48), i(s * 0.46), i(s * 0.74)], start=0, end=180, fill=SKY, width=i(s * 0.026))


def draw_mascot(draw: ImageDraw.ImageDraw, s: int, cx: float, cy: float, scale: float) -> None:
    head_r = s * scale * 0.2
    draw.ellipse([i(cx - head_r), i(cy - head_r), i(cx + head_r), i(cy + head_r)], fill=GOLD)
    draw.ellipse([i(cx - head_r * 0.45), i(cy + head_r * 0.02), i(cx + head_r * 0.62), i(cy + head_r * 0.54)], fill=GOLD_LIGHT)
    draw.polygon([(i(cx - head_r * 0.88), i(cy - head_r * 0.12)), (i(cx - head_r * 0.18), i(cy - head_r * 0.52)), (i(cx - head_r * 0.16), i(cy + head_r * 0.3))], fill=NAVY)
    draw.ellipse([i(cx + head_r * 0.12), i(cy - head_r * 0.16), i(cx + head_r * 0.34), i(cy + head_r * 0.02)], fill=NAVY)
    draw.line(arc_points(cx + head_r * 0.14, cy + head_r * 0.18, head_r * 0.42, 12, 120, 10), fill=NAVY, width=i(s * scale * 0.032))
    draw.line([(i(cx + head_r * 0.92), i(cy - head_r * 0.08)), (i(cx + head_r * 1.2), i(cy - head_r * 0.16))], fill=CORAL, width=i(s * scale * 0.032))


def render_illustration(kind: str, target_px: int) -> Image.Image:
    s = 1024
    layer = new_canvas(s)
    draw = ImageDraw.Draw(layer)
    if kind == "illust-empty-log":
        draw_blob(draw, s, (0.12, 0.16, 0.88, 0.86), GOLD)
        draw_clipboard(draw, s)
        draw_mascot(draw, s, s * 0.66, s * 0.56, 0.8)
        draw.line([(i(s * 0.7), i(s * 0.22)), (i(s * 0.8), i(s * 0.22))], fill=CORAL, width=i(s * 0.028))
        draw.line([(i(s * 0.75), i(s * 0.17)), (i(s * 0.75), i(s * 0.27))], fill=CORAL, width=i(s * 0.028))
    elif kind == "illust-empty-coaching":
        draw_blob(draw, s, (0.1, 0.16, 0.9, 0.86), SKY)
        draw_chat_stack(draw, s)
        draw_mascot(draw, s, s * 0.58, s * 0.66, 0.84)
        mark = compose_symbol(s, lambda draw_ctx, size: draw_whistle_mark(draw_ctx, size, accent=GOLD_LIGHT, sound=False), scale=0.18, center=(0.77, 0.26))
        layer.alpha_composite(mark)
    elif kind == "illust-empty-training":
        draw_blob(draw, s, (0.1, 0.16, 0.9, 0.86), SAGE)
        draw_training_scene(draw, s)
        draw_mascot(draw, s, s * 0.48, s * 0.56, 0.82)
        for left_x in (0.3, 0.38):
            draw.line([(i(s * left_x), i(s * 0.24)), (i(s * (left_x + 0.07)), i(s * 0.18))], fill=SKY, width=i(s * 0.026))
    base = add_shadow(layer, blur=i(s * 0.02), offset=(0, i(s * 0.03)), color=SOFT_SHADOW)
    base.alpha_composite(layer)
    return downsample(base, target_px)


def write_image(image: Image.Image, path: Path, dry_run: bool) -> None:
    if dry_run:
        print(f"[dry-run] {path}")
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path)
    print(path)


def clean_output_dir(output_dir: Path, dry_run: bool) -> None:
    for png_path in sorted(output_dir.glob("*.png")):
        if dry_run:
            print(f"[dry-run] delete {png_path}")
            continue
        png_path.unlink(missing_ok=True)
        print(f"deleted {png_path}")


def copy_app_icon(source: Path, output_dir: Path, dry_run: bool) -> None:
    destination = output_dir / "app-icon.png"
    if dry_run:
        print(f"[dry-run] {destination} <= {source}")
        return
    output_dir.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as img:
        rgba = img.convert("RGBA")
        fitted = ImageOps.fit(rgba, (1024, 1024), method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))
        fitted.save(destination)
    print(destination)


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate TaillogToss custom icon assets.")
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR)
    parser.add_argument("--app-icon-source", type=Path, help="Path to the approved 1024x1024 app icon PNG.")
    parser.add_argument("--clean", action="store_true", help="Delete existing PNGs in the output directory before writing.")
    parser.add_argument("--dry-run", action="store_true", help="Print planned outputs without writing files.")
    args = parser.parse_args()

    output_dir = args.output_dir.resolve()
    if args.clean:
        clean_output_dir(output_dir, args.dry_run)

    if args.app_icon_source:
        copy_app_icon(args.app_icon_source.resolve(), output_dir, args.dry_run)

    for name, sizes in TAB_ICON_SPECS.items():
        for suffix, px in zip(("@2x", "@3x"), sizes):
            write_image(render_tab_icon(name, px), output_dir / f"{name}{suffix}.png", args.dry_run)

    for name, sizes in CATEGORY_ICON_SPECS.items():
        for suffix, px in zip(("@2x", "@3x"), sizes):
            write_image(render_category_icon(name, px), output_dir / f"{name}{suffix}.png", args.dry_run)

    for name, sizes in BADGE_ICON_SPECS.items():
        for suffix, px in zip(("@2x", "@3x"), sizes):
            write_image(render_badge(name, px), output_dir / f"{name}{suffix}.png", args.dry_run)

    for name, sizes in ILLUST_SPECS.items():
        for suffix, px in zip(("@2x", "@3x"), sizes):
            write_image(render_illustration(name, px), output_dir / f"{name}{suffix}.png", args.dry_run)


if __name__ == "__main__":
    main()
