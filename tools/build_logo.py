#!/usr/bin/env python3
"""Zbuduj wektorowe znaki I Was Here na podstawie projektów właściciela.

8.4: assets/brand-mark.svg — kafelek-ikona (zielone tło, złota ramka, Polska z pejzażem, trasa i pinezka),
     assets/brand-pin-landscape.svg — pinezka z pejzażem (godło paszportu odkrywcy), icon.svg — ikona PWA.
8.3.1: assets/brand-mark-flag.svg — biało-czerwona Polska z pinezką (poprzednie logo, zachowane).

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
(ROOT / "assets/brand-mark-flag.svg").write_text(svg, encoding="utf-8")
print(f"OK: assets/brand-mark-flag.svg — kontur {len(simple)} punktów (z {len(pts)}), viewBox {vb}, {len(svg)} B")


# ---------- 8.4: kafelek (logo i ikona aplikacji) ----------
PIN = "M0 0C-4 -7 -12 -14 -12 -22A12 12 0 1 1 12 -22C12 -14 4 -7 0 0Z"


def tile_inner():
    """Zawartość kafelka 200×200: złota ramka, zielone tło, Polska z pejzażem, trasa i pinezka."""
    f = 0.74
    ox, oy = (200 - W * f) / 2, (200 - H * f) / 2 + 2
    h = H
    tree = lambda x, y, z=1.0: f'<path d="M{x:.1f} {y - 11 * z:.1f} {x - 4.2 * z:.1f} {y:.1f}H{x + 4.2 * z:.1f}Z" fill="#2F6E4A"/><path d="M{x:.1f} {y - 11 * z:.1f} {x + 4.2 * z:.1f} {y:.1f}H{x:.1f}Z" fill="#245B3C"/>'
    trees = "".join(tree(x, y * h, z) for x, y, z in [(20, .63, 1), (28, .655, 1.2), (13, .7, .9), (36, .69, .8), (58, .9, 1.1), (67, .92, .9),
                                                        (150, .74, 1), (158, .76, 1.2), (166, .755, .8), (112, .86, .9)])
    return f'''<defs>
<linearGradient id="tGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F1D88E"/><stop offset=".45" stop-color="#C09640"/><stop offset=".7" stop-color="#E8CB79"/><stop offset="1" stop-color="#9E7A2E"/></linearGradient>
<linearGradient id="tGreen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3F8E73"/><stop offset="1" stop-color="#1B5243"/></linearGradient>
<linearGradient id="tLand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D6EEC8"/><stop offset=".5" stop-color="#A9D88E"/><stop offset="1" stop-color="#7DBE62"/></linearGradient>
<clipPath id="tPl"><path d="{d}"/></clipPath>
</defs>
<rect x="2" y="2" width="196" height="196" rx="44" fill="url(#tGold)"/>
<rect x="8" y="8" width="184" height="184" rx="39" fill="url(#tGreen)"/>
<g transform="translate({ox:.1f} {oy:.1f}) scale({f})">
<path d="{d}" fill="#0F3A30" opacity=".45" transform="translate(3 5)"/>
<g clip-path="url(#tPl)">
<rect x="-2" y="-2" width="{W + 4:.0f}" height="{h + 4:.0f}" fill="url(#tLand)"/>
<path d="M0 {.44 * h:.1f}L28 {.31 * h:.1f}L52 {.39 * h:.1f}L84 {.25 * h:.1f}L114 {.37 * h:.1f}L150 {.28 * h:.1f}L200 {.42 * h:.1f}V{h + 2:.1f}H0Z" fill="#A3D1B2" opacity=".75"/>
<path d="M0 {.56 * h:.1f}Q60 {.42 * h:.1f} 120 {.54 * h:.1f}T200 {.5 * h:.1f}V{h + 2:.1f}H0Z" fill="#9CCF7F"/>
<path d="M0 {.71 * h:.1f}Q70 {.56 * h:.1f} 140 {.69 * h:.1f}T200 {.63 * h:.1f}V{h + 2:.1f}H0Z" fill="#77B95D"/>
<path d="M0 {.86 * h:.1f}Q90 {.73 * h:.1f} 200 {.87 * h:.1f}V{h + 2:.1f}H0Z" fill="#5CA24B"/>
{trees}
<path d="M44 {.87 * h:.1f}C60 {.8 * h:.1f} 78 {.7 * h:.1f} 96 {.63 * h:.1f}S122 {.5 * h:.1f} 130 {.43 * h:.1f}" fill="none" stroke="#FFFFFF" stroke-width="3.6" stroke-linecap="round" stroke-dasharray="0.1 8"/>
<circle cx="44" cy="{.87 * h:.1f}" r="4.6" fill="#FFFFFF"/><circle cx="96" cy="{.63 * h:.1f}" r="4.6" fill="#FFFFFF"/>
</g>
<path d="{d}" fill="none" stroke="#FFFFFF" stroke-width="5.2" stroke-linejoin="round"/>
<g transform="translate(130 {.43 * h:.1f}) scale(1.25)"><path d="{PIN}" fill="#F07F2E" stroke="#FFFFFF" stroke-width="2.2"/><circle cx="0" cy="-22" r="5" fill="#FFFFFF"/></g>
</g>'''


head = '<!-- Wygenerowano przez tools/build_logo.py — nie edytuj ręcznie. Kontur: Natural Earth 1:10m (public domain). -->'
tile = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" role="img" aria-label="I Was Here — Places &amp; Memories">\n{head}\n{tile_inner()}\n</svg>\n'
(ROOT / "assets/brand-mark.svg").write_text(tile, encoding="utf-8")
# Ikona PWA: pełne tło (iOS sam zaokrągla rogi), w środku kafelek.
icon = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="I Was Here app icon">\n{head}\n'
        f'<rect width="512" height="512" fill="#1F5A49"/><g transform="translate(6 6) scale(2.5)">{tile_inner()}</g>\n</svg>\n')
(ROOT / "icon.svg").write_text(icon, encoding="utf-8")

# ---------- 8.4: pinezka z pejzażem (godło paszportu odkrywcy) ----------
pin_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 136" role="img" aria-label="I Was Here — Explorer passport">
<!-- Wygenerowano przez tools/build_logo.py — nie edytuj ręcznie. -->
<defs>
<linearGradient id="lpSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6FB8E2"/><stop offset=".55" stop-color="#BFE0EE"/><stop offset="1" stop-color="#FBE3A6"/></linearGradient>
<radialGradient id="lpSun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFE59A"/><stop offset=".55" stop-color="#FBC04A"/><stop offset="1" stop-color="#FBC04A" stop-opacity="0"/></radialGradient>
<linearGradient id="lpPin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E7E9EC"/></linearGradient>
<clipPath id="lpIn"><path d="M50 119C40 102 8 81 8 50A42 42 0 1 1 92 50C92 81 60 102 50 119Z"/></clipPath>
</defs>
<ellipse cx="50" cy="131" rx="13" ry="3.2" fill="#1C2940" opacity=".18"/>
<path d="M50 128C38 108 4 84 4 50A46 46 0 1 1 96 50C96 84 62 108 50 128Z" fill="url(#lpPin)" stroke="#1C2940" stroke-opacity=".18" stroke-width=".8"/>
<g clip-path="url(#lpIn)">
<rect x="0" y="0" width="100" height="130" fill="url(#lpSky)"/>
<circle cx="56" cy="38" r="24" fill="url(#lpSun)"/><circle cx="56" cy="38" r="12" fill="#F9AE2E"/>
<path d="M18 34q6-6 13-1 5-5 11 0 6 1 5 6H16q-2-4 2-5Z M66 26q5-5 11-1 4-3 8 1 4 1 3 5H64q-1-4 2-5Z" fill="#FFFFFF" opacity=".92"/>
<path d="M2 66 20 46 30 54 52 28 70 50 80 42 98 62V80H2Z" fill="#6D98C6"/>
<path d="M52 28 45 37 49 36 52 40 56 36 60 38Z M20 46 16 51 20 50 23 52Z M80 42 76 47 80 46 84 48Z" fill="#FFFFFF"/>
<path d="M2 72 24 58 40 68 58 56 78 68 98 60V86H2Z" fill="#4E7FAE"/>
<path d="M2 76Q30 64 56 74T98 72V130H2Z" fill="#8CC765"/>
<path d="M2 92Q36 80 64 90T98 86V130H2Z" fill="#5FA548"/>
<path d="M14 80 9 92H19Z M22 77 17 90H27Z M80 76 75 88H85Z M88 79 84 89H92Z M30 98 25 110H35Z" fill="#2E6B45"/>
<path d="M62 74C52 80 70 86 56 94S46 104 50 118" fill="none" stroke="#9FD6EE" stroke-width="5" stroke-linecap="round"/>
<path d="M62 74C52 80 70 86 56 94S46 104 50 118" fill="none" stroke="#E6F6FC" stroke-width="1.6" stroke-linecap="round"/>
<g fill="#FFFFFF"><circle cx="20" cy="104" r="2.2"/><circle cx="26" cy="108" r="2"/><circle cx="16" cy="111" r="1.8"/><circle cx="34" cy="113" r="1.8"/></g>
<g fill="#F9C23C"><circle cx="20" cy="104" r=".8"/><circle cx="26" cy="108" r=".7"/><circle cx="16" cy="111" r=".6"/><circle cx="34" cy="113" r=".6"/></g>
</g>
</svg>
'''
(ROOT / "assets/brand-pin-landscape.svg").write_text(pin_svg, encoding="utf-8")
print("OK: assets/brand-mark.svg (kafelek), icon.svg (ikona PWA), assets/brand-pin-landscape.svg (godło paszportu)")
