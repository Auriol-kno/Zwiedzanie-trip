#!/usr/bin/env python3
"""Zbuduj wektorowy znak I Was Here (assets/brand-mark.svg) na podstawie logo właściciela (8.3.1).

Kontur Polski NIE jest rysowany na oko: to granica z assets/poland-geography.js (Natural Earth 1:10m,
public domain), w tym samym rzucie co Atlas, uproszczona algorytmem Douglasa–Peuckera do rozmiaru logo.
Wypełnienie biało-czerwone, ciemna obwódka, pinezka z pejzażem (góry, słońce, las, rzeka) — bez białej
poświaty wokół konturu, więc znak wygląda czysto na granacie i na kremie. Pinezka to element graficzny
logo (nie wskazuje miasta). Użycie: python tools/build_logo.py
"""
import json, math, re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
geo = json.loads(re.search(r"window\.POLAND_GEO=(\{.*\});", (ROOT / "assets/poland-geography.js").read_text(encoding="utf-8"), re.S).group(1))
P = geo["projection"]
pts = [((lon - P["lon0"]) * P["kx"] + P["x0"], (P["lat0"] - lat) * P["ky"]) for lon, lat in geo["border"]]


def rdp(ps, eps):
    if len(ps) < 3:
        return ps
    (x1, y1), (x2, y2) = ps[0], ps[-1]
    dx, dy = x2 - x1, y2 - y1
    n = math.hypot(dx, dy) or 1e-9
    i, dmax = 0, -1.0
    for k in range(1, len(ps) - 1):
        d = abs(dy * ps[k][0] - dx * ps[k][1] + x2 * y1 - y2 * x1) / n
        if d > dmax:
            i, dmax = k, d
    if dmax <= eps:
        return [ps[0], ps[-1]]
    return rdp(ps[: i + 1], eps)[:-1] + rdp(ps[i:], eps)


W = 200.0
xs, ys = [p[0] for p in pts], [p[1] for p in pts]
minx, maxx, miny, maxy = min(xs), max(xs), min(ys), max(ys)
k = W / (maxx - minx)
H = (maxy - miny) * k
norm = [((x - minx) * k, (y - miny) * k) for x, y in pts]
# zamknięty pierścień: dzielimy na dwie połowy, by RDP nie zgubił punktu startowego
half = len(norm) // 2
simple = rdp(norm[: half + 1], 0.45)[:-1] + rdp(norm[half:] + [norm[0]], 0.45)[:-1]
d = "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in simple) + "Z"

PAD = 4.0
vb = f"{-PAD:.0f} {-PAD:.0f} {W + 2 * PAD:.0f} {H + 2 * PAD:.0f}"
split = H * 0.50          # granica bieli i czerwieni (jak flaga, lekko falista — „akwarela”)
cx, tip = W * 0.51, H * 0.80
s = 1.22                  # skala pinezki

svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" role="img" aria-label="I Was Here — Places &amp; Memories">
<!-- Wygenerowano przez tools/build_logo.py — nie edytuj ręcznie. Kontur: Natural Earth 1:10m (public domain). -->
<defs>
<clipPath id="iwhPl"><path d="{d}"/></clipPath>
<linearGradient id="iwhWhite" x1="0" y1="0" x2=".3" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".7" stop-color="#F4F1EC"/><stop offset="1" stop-color="#E9E4DD"/></linearGradient>
<linearGradient id="iwhRed" x1="0" y1="0" x2=".25" y2="1"><stop offset="0" stop-color="#E5484D"/><stop offset=".6" stop-color="#D42F38"/><stop offset="1" stop-color="#B81E2A"/></linearGradient>
<linearGradient id="iwhSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7B733"/><stop offset=".45" stop-color="#FAD978"/><stop offset="1" stop-color="#BFE4DF"/></linearGradient>
<clipPath id="iwhPin"><path d="M0 -6C-5 -17 -30 -37 -30 -58A30 30 0 1 1 30 -58C30 -37 5 -17 0 -6Z"/></clipPath>
</defs>
<g clip-path="url(#iwhPl)">
<rect x="-2" y="-2" width="{W + 4:.0f}" height="{H + 4:.0f}" fill="url(#iwhWhite)"/>
<path d="M-2 {split:.1f} C{W * .22:.1f} {split - 5:.1f} {W * .42:.1f} {split + 6:.1f} {W * .62:.1f} {split + 1:.1f} S{W * .9:.1f} {split - 4:.1f} {W + 2:.1f} {split + 2:.1f} V{H + 2:.1f} H-2Z" fill="url(#iwhRed)"/>
<ellipse cx="{W * .25:.1f}" cy="{H * .72:.1f}" rx="{W * .16:.1f}" ry="{H * .08:.1f}" fill="#F06A6A" opacity=".35"/>
<ellipse cx="{W * .74:.1f}" cy="{H * .83:.1f}" rx="{W * .14:.1f}" ry="{H * .07:.1f}" fill="#A9141F" opacity=".25"/>
<ellipse cx="{W * .3:.1f}" cy="{H * .25:.1f}" rx="{W * .2:.1f}" ry="{H * .09:.1f}" fill="#E6E1DA" opacity=".28"/>
</g>
<path d="{d}" fill="none" stroke="#1C2940" stroke-width="2.6" stroke-linejoin="round"/>
<g transform="translate({cx:.1f} {tip:.1f}) scale({s})">
<path d="M1.6 2.4C-4.4 -11.6 -32.4 -34 -32.4 -56A34 34 0 1 1 35.6 -56C35.6 -34 7.6 -11.6 1.6 2.4Z" fill="#1C2940" opacity=".22"/>
<path d="M0 0C-6 -14 -34 -36 -34 -58A34 34 0 1 1 34 -58C34 -36 6 -14 0 0Z" fill="#FFFFFF" stroke="#1C2940" stroke-opacity=".35" stroke-width=".8"/>
<g clip-path="url(#iwhPin)">
<rect x="-34" y="-92" width="68" height="92" fill="url(#iwhSky)"/>
<circle cx="3" cy="-67" r="17" fill="#FCD46A" opacity=".7"/>
<circle cx="3" cy="-67" r="11.5" fill="#F6A21C"/>
<path d="M-34 -42 -21 -61 -13 -54 0 -75 12 -57 20 -63 34 -45 34 -28 -34 -28Z" fill="#6FA7BE"/>
<path d="M0 -75 -5.5 -67 -2.4 -68.4 0 -65.5 2.6 -68.4 5.6 -67.4Z M-21 -61 -24.5 -56 -21.5 -57 -18 -55.5Z M20 -63 16.8 -58.6 19.6 -59.6 23.2 -58.4Z" fill="#FFFFFF"/>
<path d="M-34 -36 -18 -51 -7 -40 6 -50 21 -35 34 -41 34 -24 -34 -24Z" fill="#2F7D86"/>
<path d="M-34 -33Q-12 -45 6 -36T34 -35V0H-34Z" fill="#82BF57"/>
<path d="M-34 -22Q-4 -33 34 -20V0H-34Z" fill="#4F9C44"/>
<path d="M-24 -26 -20 -42 -16 -26Z M-17 -28 -13.5 -41 -10 -28Z M-29 -23 -25.5 -37 -22 -23Z M18 -27 21 -38 24 -27Z" fill="#1E5A3A"/>
<path d="M3 -36C-7 -30 11 -26 0 -19C-8 -14 5 -10 0 -3" fill="none" stroke="#EAF5F1" stroke-width="3.6" stroke-linecap="round"/>
</g>
<path d="M0 -6C-5 -17 -30 -37 -30 -58A30 30 0 1 1 30 -58C30 -37 5 -17 0 -6Z" fill="none" stroke="#1C2940" stroke-opacity=".18" stroke-width=".8"/>
</g>
</svg>
'''
(ROOT / "assets/brand-mark.svg").write_text(svg, encoding="utf-8")
print(f"OK: assets/brand-mark.svg — kontur {len(simple)} punktów (z {len(pts)}), viewBox {vb}, {len(svg)} B")
