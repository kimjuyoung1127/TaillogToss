#!/usr/bin/env python3
"""Build final app icon assets from image_gen master images."""

from __future__ import annotations

import argparse
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_MASTER_DIR = Path("/tmp/taillogtoss-ai-icons")
DEFAULT_OUTPUT_DIR = ROOT / "src/assets/icons"

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

UTILITY_ICON_SPECS = {
    "ic-ops": (48, 72),
    "ic-trainer": (48, 72),
    "ic-stage-puppy": (48, 72),
    "ic-stage-adult": (48, 72),
    "ic-stage-senior": (48, 72),
    "ic-search": (48, 72),
    "ic-target": (48, 72),
    "ic-idea": (48, 72),
    "ic-bolt": (48, 72),
    "ic-puzzle": (48, 72),
    "ic-dog": (48, 72),
    "ic-report": (48, 72),
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


def extract_foreground(master: Image.Image, bg_tol: int) -> Image.Image:
    """Remove edge-connected gray background from generated masters."""
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


def fit_to_square(source: Image.Image, size: int, fill_ratio: float) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    inner = max(1, int(round(size * fill_ratio)))

    w, h = source.size
    scale = min(inner / w, inner / h)
    target_w = max(1, int(round(w * scale)))
    target_h = max(1, int(round(h * scale)))

    resized = source.resize((target_w, target_h), Image.Resampling.LANCZOS)
    x = (size - target_w) // 2
    y = (size - target_h) // 2
    canvas.alpha_composite(resized, (x, y))
    return canvas


def build_one(
    name: str,
    sizes: tuple[int, int],
    master_dir: Path,
    output_dir: Path,
    fill_ratio: float,
    bg_tol: int,
    dry_run: bool,
) -> None:
    master_path = master_dir / f"{name}-master.png"
    if not master_path.exists():
        raise FileNotFoundError(f"Missing master: {master_path}")

    with Image.open(master_path) as master:
        fg = extract_foreground(master, bg_tol=bg_tol)
        for suffix, px in zip(("@2x", "@3x"), sizes):
            out_path = output_dir / f"{name}{suffix}.png"
            if dry_run:
                print(f"[dry-run] {out_path} <= {master_path.name}")
                continue
            out_path.parent.mkdir(parents=True, exist_ok=True)
            fit_to_square(fg, px, fill_ratio=fill_ratio).save(out_path)
            print(out_path)


def main() -> None:
    parser = argparse.ArgumentParser(description="Build icon assets from image_gen masters.")
    parser.add_argument("--master-dir", type=Path, default=DEFAULT_MASTER_DIR)
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    master_dir = args.master_dir.resolve()
    output_dir = args.output_dir.resolve()

    for name, sizes in TAB_ICON_SPECS.items():
        build_one(name, sizes, master_dir, output_dir, fill_ratio=0.78, bg_tol=52, dry_run=args.dry_run)
    for name, sizes in UTILITY_ICON_SPECS.items():
        build_one(name, sizes, master_dir, output_dir, fill_ratio=0.8, bg_tol=52, dry_run=args.dry_run)
    for name, sizes in CATEGORY_ICON_SPECS.items():
        build_one(name, sizes, master_dir, output_dir, fill_ratio=0.8, bg_tol=52, dry_run=args.dry_run)
    for name, sizes in BADGE_ICON_SPECS.items():
        build_one(name, sizes, master_dir, output_dir, fill_ratio=0.9, bg_tol=48, dry_run=args.dry_run)
    for name, sizes in ILLUST_SPECS.items():
        build_one(name, sizes, master_dir, output_dir, fill_ratio=0.94, bg_tol=42, dry_run=args.dry_run)


if __name__ == "__main__":
    main()
