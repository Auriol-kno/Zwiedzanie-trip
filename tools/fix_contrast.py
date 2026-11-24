#!/usr/bin/env python3
"""I Was Here 8.19 — czytelność napisów (prośba właściciela 2026-11-24: „nieczytelne żółte napisy”).

Przyciemnia kolory TEKSTU (deklaracje `color:`) o średniej jasności, aż osiągną kontrast ≥ 4,6 : 1 z jasnym tłem
motywu Szałwia (#E4E9E6, karty #F1F2EE). Żółty tekst (#FFD84A i podobne) na jasnych panelach zamienia na ciemną terakotę.
Tła i jasne napisy przeznaczone na ciemne tło zostają bez zmian; reguły stylów mapy Noc/Jasny/Teren są pomijane.
Wynik sprawdza tools/test_contrast.js (rzeczywisty kontrast z rzeczywistym tłem w przeglądarce).

    python tools/fix_contrast.py plik.css [plik.css …]
"""
import colorsys, re, sys, pathlib

BG = [(0xE4, 0xE9, 0xE6), (0xF1, 0xF2, 0xEE), (0xDC, 0xE3, 0xE0)]  # tło strony, karta, wklęsły przycisk
TARGET = 4.6
DARK_TERRA = '#8E4A1F'


def lum(c):
    f = lambda x: x / 12.92 if x <= .03928 else ((x + .055) / 1.055) ** 2.4
    r, g, b = (v / 255 for v in c)
    return .2126 * f(r) + .7152 * f(g) + .0722 * f(b)


def ratio(a, b):
    x, y = lum(a), lum(b)
    return (max(x, y) + .05) / (min(x, y) + .05)


def fix(rgb):
    h, l, s = colorsys.rgb_to_hls(*(v / 255 for v in rgb))
    deg = h * 360
    if 40 <= deg <= 60 and s > .6 and l > .55:            # żółty → ciemna terakota
        return DARK_TERRA
    if l < .28 or l > .72:                                  # ciemne (już czytelne) i jasne (na ciemne tło) — bez zmian
        return None
    if min(ratio(rgb, b) for b in BG) >= TARGET:
        return None
    while l > .05:
        l -= .01
        c = tuple(round(v * 255) for v in colorsys.hls_to_rgb(h, l, s))
        if min(ratio(c, b) for b in BG) >= TARGET:
            return '#%02X%02X%02X' % c
    return None


DECL = re.compile(r'((?<![-\w])color\s*:\s*|--(?:sub|mut|muted|soft)\s*:\s*)(#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\))')


def parse(v):
    if v.startswith('#'):
        h = v[1:]
        h = ''.join(c * 2 for c in h) if len(h) == 3 else h
        return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
    return tuple(int(x) for x in re.findall(r'\d+', v)[:3])


def process(text):
    out, buf = [], ''
    for part in re.split(r'(\})', text):
        buf += part
        if part == '}':
            sel = re.sub(r':not\(\[data-style=[^\]]*\]\)', '', buf.split('{')[0])
            if re.search(r'data-style=["\']?(night|light|terrain)', sel):
                out.append(buf)
            else:
                out.append(DECL.sub(lambda m: m.group(1) + (fix(parse(m.group(2))) or m.group(2)), buf))
            buf = ''
    out.append(buf)
    return ''.join(out)


if __name__ == '__main__':
    for f in sys.argv[1:]:
        p = pathlib.Path(f)
        t = p.read_text(encoding='utf-8')
        n = re.sub(r'(<style[^>]*>)(.*?)(</style>)', lambda m: m.group(1) + process(m.group(2)) + m.group(3), t, flags=re.S) if p.suffix == '.html' else process(t)
        if n != t:
            p.write_text(n, encoding='utf-8')
            print('poprawiono', f)
