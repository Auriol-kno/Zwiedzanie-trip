#!/usr/bin/env python3
"""I Was Here 8.17 — przeliczenie palety „kulki na torze” (granat/błękit) na motyw „Safari”
(krem, piasek, oliwka, ciepły pomarańcz) według makiety właściciela z 2026-11-24.

Zmienia tylko barwy niebieskie (odcień 198–250°, bez turkusu morza mapy, nasycenie ≥ 0,12); zielenie, czerwienie, złoto i szarości zostają.
- CSS: pomija reguły stylów mapy Noc/Jasny/Teren (selektory z `data-style=`), żeby te style zachowały własne kolory.
- HTML: tylko bloki <style> i <meta name="theme-color">.
- Pliki .py/.svg: wszystkie kolory (generatory logo i ikon).

    python tools/recolor_safari.py plik [plik …]
Narzędzie jednorazowe; zachowane, żeby dało się powtórzyć przeliczenie albo dodać nowy plik.
"""
import colorsys, re, sys, pathlib

HEX = re.compile(r'#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b')
RGB = re.compile(r'rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(,\s*[\d.]+\s*)?\)')


def remap(r, g, b):
    """Kolor 0–255 → nowy kolor albo None, jeśli nie jest niebieski."""
    h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
    deg = h * 360
    if not (198 <= deg <= 250) or s < 0.12:
        return None
    if l >= 0.86:                      # jasne tła → krem
        nh, ns, nl = 40, min(.55, s * .6 + .15), max(l - .015, .86)
    elif l >= 0.66 and s < 0.75:       # pastelowe → piasek / szałwia
        nh, ns, nl = 42, .34, l - .02
    elif l >= 0.34:                    # akcent błękitny → oliwka (jaśniejsze tony → oliwkowa zieleń z połyskiem)
        nh, ns, nl = 72, .36, .26 + (l - .34) * .62
    else:                              # granat → głęboka oliwka / brąz
        nh, ns, nl = 66, .26 + s * .06, .1 + l * .75
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
    for f in sys.argv[1:]:
        p = pathlib.Path(f)
        t = p.read_text(encoding='utf-8')
        n = {'.css': css, '.html': html}.get(p.suffix, recolor)(t)
        if n != t:
            p.write_text(n, encoding='utf-8')
            print('przeliczono', f)
