#!/usr/bin/env python3
"""Generate the PWA's PNG app icons from the I Was Here SVG master mark."""
from pathlib import Path
import cairosvg

root = Path(__file__).resolve().parents[1]
source = root / "icon.svg"
for size in (180, 512):
    target = root / f"icon-{size}.png"
    cairosvg.svg2png(
        url=str(source),
        write_to=str(target),
        output_width=size,
        output_height=size,
    )
    print(f"Generated {target.name}: {size}x{size}")
