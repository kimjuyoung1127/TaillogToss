#!/usr/bin/env python3
"""Build cute IAP promo cards from image_gen master illustrations."""

from __future__ import annotations

import argparse
from collections import deque
from dataclasses import dataclass
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_MASTER_DIR = Path("/tmp/taillogtoss-promo-masters")
DEFAULT_OUTPUT_DIR = ROOT / "src/assets/promos"

FONT_MEDIUM = [
    Path("/Users/family/Library/Fonts/Pretendard-Medium.otf"),
    Path("/System/Library/Fonts/AppleSDGothicNeo.ttc"),
]
FONT_SEMIBOLD = [
    Path("/Users/family/Library/Fonts/Pretendard-SemiBold.otf"),
    Path("/System/Library/Fonts/AppleSDGothicNeo.ttc"),
]

CANVAS_SIZE = 1024
NAVY_TOP = np.array([20, 31, 62], dtype=np.float32)
NAVY_BOTTOM = np.array([7, 12, 26], dtype=np.float32)
NAVY_SURFACE = (15, 22, 43, 208)
NAVY_LINE = (255, 214, 120, 64)
CREAM = (255, 247, 227, 255)
CREAM_SOFT = (239, 228, 199, 255)
GOLD = (255, 201, 78, 255)
GOLD_BRIGHT = (255, 223, 123, 255)
GOLD_SOFT = (255, 216, 124, 72)
CORAL = (255, 133, 107, 255)
SHADOW = (5, 8, 20, 120)


@dataclass(frozen=True)
class PromoCard:
    filename: str
    master_name: str
    title_lines: tuple[str, ...]
    description: str
    price: str
    kind_label: str
    chips: tuple[str, ...]
    mascot_fill_ratio: float
    mascot_x: int
    mascot_y: int


PROMO_CARDS: tuple[PromoCard, ...] = (
    PromoCard(
        filename="promo-taillog-pro-1024.png",
        master_name="promo-pro-master.png",
        title_lines=("테일로그", "PRO"),
        description="AI 코칭 무제한 + 멀티독 5마리 + 전체 커리큘럼",
        price="4,900원",
        kind_label="비소모성",
        chips=("AI 코칭 무제한", "멀티독 5마리", "전체 커리큘럼"),
        mascot_fill_ratio=0.66,
        mascot_x=474,
        mascot_y=292,
    ),
    PromoCard(
        filename="promo-ai-coaching-token-10-1024.png",
        master_name="promo-token-10-master.png",
        title_lines=("AI 코칭 토큰", "10회"),
        description="AI 행동 분석 코칭 10회 이용권",
        price="1,900원",
        kind_label="소모성",
        chips=("AI 행동 분석", "10회 이용권"),
        mascot_fill_ratio=0.64,
        mascot_x=486,
        mascot_y=314,
    ),
    PromoCard(
        filename="promo-ai-coaching-token-30-1024.png",
        master_name="promo-token-30-master.png",
        title_lines=("AI 코칭 토큰", "30회"),
        description="AI 행동 분석 코칭 30회 이용권 (회당 117원)",
        price="3,500원",
        kind_label="소모성",
        chips=("AI 행동 분석", "코칭 30회", "회당 117원"),
        mascot_fill_ratio=0.64,
        mascot_x=486,
        mascot_y=314,
    ),
)


def load_font(candidates: list[Path], size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for path in candidates:
        if path.exists():
            return ImageFont.truetype(str(path), size=size)
    return ImageFont.load_default()


def extract_foreground(master: Image.Image, bg_tol: int = 52) -> Image.Image:
    rgba = master.convert("RGBA")
    arr = np.asarray(rgba).astype(np.int16)

    border = np.concatenate(
        [
            arr[0, :, :3],
            arr[-1, :, :3],
            arr[:, 0, :3],
            arr[:, -1, :3],
        ],
        axis=0,
    )
    bg = np.median(border, axis=0)

    diff = np.max(np.abs(arr[:, :, :3] - bg), axis=2)
    bg_candidate = diff <= bg_tol

    h, w = diff.shape
    bg_mask = np.zeros((h, w), dtype=bool)
    queue: deque[tuple[int, int]] = deque()

    for x in range(w):
        queue.append((0, x))
        queue.append((h - 1, x))
    for y in range(1, h - 1):
        queue.append((y, 0))
        queue.append((y, w - 1))

    while queue:
        y, x = queue.popleft()
        if y < 0 or y >= h or x < 0 or x >= w:
            continue
        if bg_mask[y, x] or not bg_candidate[y, x]:
            continue
        bg_mask[y, x] = True
        queue.append((y - 1, x))
        queue.append((y + 1, x))
        queue.append((y, x - 1))
        queue.append((y, x + 1))

    fg_mask = ~bg_mask
    out = np.asarray(rgba).copy()
    out[:, :, 3] = np.where(fg_mask, out[:, :, 3], 0)

    ys, xs = np.where(fg_mask)
    if len(xs) == 0 or len(ys) == 0:
        return Image.fromarray(out, "RGBA")

    x1, x2 = xs.min(), xs.max() + 1
    y1, y2 = ys.min(), ys.max() + 1
    return Image.fromarray(out, "RGBA").crop((int(x1), int(y1), int(x2), int(y2)))


def fit_within(source: Image.Image, max_size: int, fill_ratio: float) -> Image.Image:
    canvas = Image.new("RGBA", (max_size, max_size), (0, 0, 0, 0))
    inner = max(1, int(round(max_size * fill_ratio)))
    w, h = source.size
    scale = min(inner / w, inner / h)
    target_w = max(1, int(round(w * scale)))
    target_h = max(1, int(round(h * scale)))
    resized = source.resize((target_w, target_h), Image.Resampling.LANCZOS)
    x = (max_size - target_w) // 2
    y = (max_size - target_h) // 2
    canvas.alpha_composite(resized, (x, y))
    return canvas


def make_background(size: int) -> Image.Image:
    yy = np.linspace(0.0, 1.0, size, dtype=np.float32)[:, None]
    xx = np.linspace(0.0, 1.0, size, dtype=np.float32)[None, :]
    blend = np.clip((yy * 0.74) + (xx * 0.26), 0.0, 1.0)
    arr = (NAVY_TOP * (1.0 - blend[..., None])) + (NAVY_BOTTOM * blend[..., None])
    base = Image.fromarray(np.uint8(np.clip(arr, 0, 255)), "RGB").convert("RGBA")

    glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse((610, -90, 1120, 420), fill=(255, 188, 88, 88))
    glow_draw.ellipse((-160, 670, 360, 1160), fill=(52, 88, 180, 94))
    glow_draw.ellipse((60, 120, 420, 480), fill=(255, 228, 150, 18))
    glow = glow.filter(ImageFilter.GaussianBlur(54))
    base.alpha_composite(glow)

    return base


def add_glass_panel(base: Image.Image) -> None:
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    draw.rounded_rectangle((50, 50, 974, 974), radius=58, outline=NAVY_LINE, width=2)
    draw.rounded_rectangle((58, 74, 558, 948), radius=44, fill=NAVY_SURFACE, outline=(255, 214, 120, 34), width=2)
    draw.rounded_rectangle((76, 750, 432, 932), radius=40, fill=(255, 211, 103, 255))
    base.alpha_composite(overlay)


def draw_paw_icon(draw: ImageDraw.ImageDraw, center: tuple[int, int], fill: tuple[int, int, int, int]) -> None:
    cx, cy = center
    draw.ellipse((cx - 14, cy - 8, cx + 14, cy + 18), fill=fill)
    toe_offsets = [(-18, -16), (-6, -26), (6, -26), (18, -16)]
    for ox, oy in toe_offsets:
        draw.ellipse((cx + ox - 7, cy + oy - 7, cx + ox + 7, cy + oy + 7), fill=fill)


def draw_sparkle(draw: ImageDraw.ImageDraw, center: tuple[int, int], radius: int, fill: tuple[int, int, int, int]) -> None:
    cx, cy = center
    draw.polygon([(cx, cy - radius), (cx + radius // 2, cy), (cx, cy + radius), (cx - radius // 2, cy)], fill=fill)
    draw.polygon([(cx - radius, cy), (cx, cy - radius // 2), (cx + radius, cy), (cx, cy + radius // 2)], fill=fill)


def wrap_text(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.ImageFont, max_width: int) -> list[str]:
    words = text.split(" ")
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = word if not current else f"{current} {word}"
        width = draw.textbbox((0, 0), candidate, font=font)[2]
        if width <= max_width or not current:
            current = candidate
        else:
            lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def paste_mascot(base: Image.Image, mascot: Image.Image, x: int, y: int) -> None:
    shadow = Image.new("RGBA", mascot.size, (0, 0, 0, 0))
    shadow_alpha = mascot.getchannel("A").point(lambda value: min(255, int(value * 0.62)))
    shadow.paste(SHADOW, (0, 0), shadow_alpha)
    shadow = shadow.filter(ImageFilter.GaussianBlur(20))
    base.alpha_composite(shadow, (x + 10, y + 18))
    base.alpha_composite(mascot, (x, y))


def draw_copy(base: Image.Image, promo: PromoCard) -> None:
    draw = ImageDraw.Draw(base)

    brand_font = load_font(FONT_SEMIBOLD, 34)
    pill_font = load_font(FONT_SEMIBOLD, 28)
    title_font = load_font(FONT_SEMIBOLD, 78)
    desc_font = load_font(FONT_MEDIUM, 38)
    chip_font = load_font(FONT_SEMIBOLD, 27)
    price_label_font = load_font(FONT_SEMIBOLD, 28)
    price_font = load_font(FONT_SEMIBOLD, 70)

    draw.rounded_rectangle((78, 88, 288, 148), radius=28, fill=(255, 248, 232, 244), outline=(255, 255, 255, 40), width=2)
    draw_paw_icon(draw, (114, 118), GOLD)
    draw.text((142, 93), "테일로그", font=brand_font, fill=(18, 28, 56, 255))

    kind_box = draw.textbbox((0, 0), promo.kind_label, font=pill_font)
    kind_width = kind_box[2] - kind_box[0] + 44
    draw.rounded_rectangle((356, 88, 356 + kind_width, 148), radius=28, fill=(255, 205, 95, 255))
    draw.text((378, 95), promo.kind_label, font=pill_font, fill=(18, 28, 56, 255))

    y = 188
    for line in promo.title_lines:
        draw.text((82, y), line, font=title_font, fill=CREAM)
        y += 88

    desc_lines = wrap_text(draw, promo.description, desc_font, 420)
    desc_y = y + 12
    for line in desc_lines:
        draw.text((86, desc_y), line, font=desc_font, fill=CREAM_SOFT)
        desc_y += 54

    chip_x = 84
    chip_y = desc_y + 34
    for chip in promo.chips:
        bbox = draw.textbbox((0, 0), chip, font=chip_font)
        chip_w = bbox[2] - bbox[0] + 34
        if chip_x + chip_w > 520:
            chip_x = 84
            chip_y += 64
        draw.rounded_rectangle((chip_x, chip_y, chip_x + chip_w, chip_y + 42), radius=21, fill=(14, 22, 43, 196), outline=(255, 214, 120, 116), width=2)
        draw.text((chip_x + 17, chip_y + 5), chip, font=chip_font, fill=GOLD_BRIGHT)
        chip_x += chip_w + 14

    draw.text((108, 784), "공급가", font=price_label_font, fill=(18, 28, 56, 235))
    draw.text((104, 824), promo.price, font=price_font, fill=(18, 28, 56, 255))

    draw_sparkle(draw, (612, 104), 18, GOLD_BRIGHT)
    draw_sparkle(draw, (936, 168), 14, GOLD_BRIGHT)
    draw_sparkle(draw, (682, 840), 20, GOLD_BRIGHT)
    draw.arc((858, 144, 930, 220), start=200, end=300, fill=CORAL, width=8)
    draw.arc((880, 126, 964, 214), start=205, end=290, fill=CORAL, width=8)


def build_card(promo: PromoCard, master_dir: Path, output_dir: Path) -> Path:
    master_path = master_dir / promo.master_name
    if not master_path.exists():
        raise FileNotFoundError(f"Missing master: {master_path}")

    with Image.open(master_path) as master:
        mascot = extract_foreground(master)

    mascot = fit_within(mascot, 520, fill_ratio=promo.mascot_fill_ratio)

    base = make_background(CANVAS_SIZE)
    add_glass_panel(base)
    paste_mascot(base, mascot, promo.mascot_x, promo.mascot_y)
    draw_copy(base, promo)

    output_dir.mkdir(parents=True, exist_ok=True)
    out_path = output_dir / promo.filename
    base.save(out_path)
    return out_path


def main() -> None:
    parser = argparse.ArgumentParser(description="Build final promo cards from image_gen masters.")
    parser.add_argument("--master-dir", type=Path, default=DEFAULT_MASTER_DIR)
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR)
    args = parser.parse_args()

    master_dir = args.master_dir.resolve()
    output_dir = args.output_dir.resolve()

    for promo in PROMO_CARDS:
        out_path = build_card(promo, master_dir=master_dir, output_dir=output_dir)
        print(out_path)


if __name__ == "__main__":
    main()
