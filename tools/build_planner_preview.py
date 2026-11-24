#!/usr/bin/env python3
"""I Was Here 8.16 — jednoplikowy podgląd planera (do pokazania poza GitHub Pages, np. jako artefakt claude.ai).

Wstawia do jednego HTML: planer.css, app-nav.css, theme-marbles.css, planer.js, app-nav.js, dane data/planer.json
(jako window.IWH_PLANNER_DATA) i grafiki SVG jako data: URI. Bez Leaflet i kafelków OSM — planer rysuje wtedy
własną mapę schematyczną SVG. Plik wynikowy nie jest częścią aplikacji.

    python tools/build_planner_preview.py /ścieżka/planer-demo.html
"""
import base64, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
rd = lambda p: (ROOT / p).read_text(encoding='utf-8')
uri = lambda p: 'data:image/svg+xml;base64,' + base64.b64encode((ROOT / p).read_bytes()).decode()

html = rd('planer.html')
css = '\n'.join(rd(p) for p in ('assets/app-nav.css', 'assets/planer.css', 'assets/theme-marbles.css'))
html = re.sub(r'<link rel="(icon|apple-touch-icon|manifest)"[^>]*>\n', '', html)
html = re.sub(r'<link rel="stylesheet"[^>]*>\n', '', html)
html = html.replace('</title>', '</title>\n<style>\n' + css + '\n</style>', 1)
html = html.replace('<script src="./assets/vendor/leaflet/leaflet.js"></script>\n', '')
data = rd('data/planer.json').replace('</', '<\\/')
js = '<script>window.IWH_PLANNER_DATA=' + data + ';</script>\n<script>\n' + rd('assets/app-nav.js') + '\n</script>\n<script>\n' + rd('assets/planer.js') + '\n</script>'
html = re.sub(r'<script src="./assets/app-nav.js"></script>\n<script src="./assets/planer.js"></script>', lambda m: js, html)
for svg in ('assets/brand-pin-landscape.svg', 'assets/brand-mark-nav.svg'):
    html = html.replace('./' + svg, uri(svg))
html = html.replace('<!doctype html>', '<!DOCTYPE html>', 1)
out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'planer-demo.html')
out.write_text(html, encoding='utf-8')
print(out, len(html) // 1024, 'KB')
