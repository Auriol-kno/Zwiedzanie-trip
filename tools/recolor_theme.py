#!/usr/bin/env python3
"""I Was Here — przeliczenie palety „kulki na torze” (granat/błękit) na inny motyw.
Motywy: `safari` (8.17: krem, piasek, oliwka) i `sage` (8.18 „Szałwia”: szałwiowa zieleń, krem,
brzoskwinia, terakota, łupek — makieta właściciela 2026-11-24). Źródłem są zawsze pliki w palecie 8.16.

Zmienia tylko barwy niebieskie (odcień 198–250°, bez turkusu morza mapy, nasycenie ≥ 0,12); zielenie, czerwienie, złoto i szarości zostają.
- CSS: pomija reguły stylów mapy Noc/Jasny/Teren (selektory z `data-style=`), żeby te style zachowały własne kolory.
- HTML: tylko bloki <style> i <meta name="theme-color">.
- Pliki .py/.svg: wszystkie kolory (generatory logo i ikon).

    python tools/recolor_theme.py [--theme sage|safari] plik [plik …]
Narzędzie jednorazowe; zachowane, żeby dało się powtórzyć przeliczenie albo dodać nowy plik.
"""
import colorsys, re, sys, pathlib

HEX = re.compile(r'#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b')
RGB = re.compile(r'rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(,\s*[\d.]+\s*)?\)')


THEMES = {
    # (odcień, nasycenie, funkcja jasności) dla: jasnych teł, pasteli, akcentu, granatu
    'safari': {'light': (40, None), 'pastel': (42, .34), 'accent': (72, .36, lambda l: .26 + (l - .34) * .62),
               'dark': (66, None, lambda l, s: (.26 + s * .06, .1 + l * .75))},
    'sage': {'light': (150, .1), 'pastel': (160, .12), 'accent': (24, .58, lambda l: .5 + (l - .34) * .4),
             'dark': (175, None, lambda l, s: (.12 + s * .04, .2 + l * .6))},
}
THEME = 'sage'


def remap(r, g, b):
    """Kolor 0–255 → nowy kolor albo None, jeśli nie jest niebieski."""
    h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
    deg = h * 360
    if not (198 <= deg <= 250) or s < 0.12:
        return None
    T = THEMES[THEME]
    if l >= 0.86:                      # jasne tła
        nh, ns, nl = T['light'][0], (T['light'][1] if T['light'][1] is not None else min(.55, s * .6 + .15)), max(l - .015, .86)
    elif l >= 0.66 and s < 0.75:       # pastele
        nh, ns, nl = T['pastel'][0], T['pastel'][1], l - .02
    elif l >= 0.34:                    # akcent
        nh, ns, nl = T['accent'][0], T['accent'][1], T['accent'][2](l)
    else:                              # granat
        nh = T['dark'][0]; ns, nl = T['dark'][2](l, s)
    nr, ng, nb = colorsys.hls_to_rgb(nh / 360, nl, ns)
    return round(nr * 255), round(ng * 255), round(nb * 255)


def sub_hex(m):
    h = m.group(1)
    if len(h) == 3:
        h = ''.join(c * 2 for c in h)
    r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    n = remap(r, g, b)
    if not n:
        return m.group(0)
    out = '#%02X%02X%02X' % n
    return out if m.group(1).isupper() or m.group(1).isdigit() else out.lower()


def sub_rgb(m):
    n = remap(*(int(m.group(i)) for i in (1, 2, 3)))
    if not n:
        return m.group(0)
    a = m.group(4) or ''
    return ('rgba(%d,%d,%d%s)' if a else 'rgb(%d,%d,%d%s)') % (*n, a.replace(' ', ''))


def recolor(text):
    return RGB.sub(sub_rgb, HEX.sub(sub_hex, text))


def css(text):
    # dzieli na reguły po „}”; reguły dotyczące stylów mapy Noc/Jasny/Teren zostają bez zmian
    out, buf = [], ''
    for part in re.split(r'(\})', text):
        buf += part
        if part == '}':
            sel = buf.split('{')[0]
            own = re.sub(r':not\(\[data-style=[^\]]*\]\)', '', sel)  # „:not(…)” dotyczy stylu domyślnego
            out.append(buf if re.search(r'data-style=["\']?(night|light|terrain)', own) else recolor(buf))
            buf = ''
    out.append(recolor(buf))
    return ''.join(out)


def html(text):
    text = re.sub(r'(<style[^>]*>)(.*?)(</style>)', lambda m: m.group(1) + css(m.group(2)) + m.group(3), text, flags=re.S)
    return re.sub(r'(<meta name="theme-color" content=")([^"]+)', lambda m: m.group(1) + recolor(m.group(2)), text)


if __name__ == '__main__':
    args = sys.argv[1:]
    if args[:1] == ['--theme']:
        THEME = args[1]; args = args[2:]
    for f in args:
        p = pathlib.Path(f)
        t = p.read_text(encoding='utf-8')
        n = {'.css': css, '.html': html}.get(p.suffix, recolor)(t)
        if n != t:
            p.write_text(n, encoding='utf-8')
            print('przeliczono', f)
