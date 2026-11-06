#!/usr/bin/env python3
"""Smoke-test wersji 4.0: Atlas, pływający powrót do Polski i wspólny PL/EN."""
from pathlib import Path
import json
import re
ROOT = Path(__file__).resolve().parents[1]
atlas = (ROOT / "atlas.html").read_text(encoding="utf-8")
home = (ROOT / "index.html").read_text(encoding="utf-8")
atlas_js = (ROOT / "assets/atlas.js").read_text(encoding="utf-8")
i18n = (ROOT / "assets/i18n4.js").read_text(encoding="utf-8")
nav = (ROOT / "assets/nav4.css").read_text(encoding="utf-8")
manifest = json.loads((ROOT / "manifest.webmanifest").read_text(encoding="utf-8"))
sw = (ROOT / "service-worker.js").read_text(encoding="utf-8")
assert manifest["start_url"] == "./atlas.html", "Ikona PWA nie otwiera Atlasu."
assert "./index.html" in atlas_js, "Brak wejścia do Warszawy."
assert 'id="atlasFloat"' in home and 'id="atlasTop"' in home, "Brak powrotu do mapy Polski."
assert 'id="langWarsaw"' in home and 'id="langButton"' in atlas, "Brak przełącznika języka."
assert home.index('assets/features3.js') < home.index('assets/i18n4.js'), "Niewłaściwa kolejność modułów."
assert "tubylem_lang" in atlas_js and "tubylem_lang" in i18n, "Brak współdzielonego języka."
assert 'data-style="atlas"' in atlas, "Brak stylu Atlas."
for token in ['styleAtlas','styleNight','styleTerrain','cityStrip','polandSvg','cityAction','zoomIn','zoomOut']:
    assert ('id="' + token + '"') in atlas, token
city_block = atlas_js.split('const CITIES=[',1)[1].split('];',1)[0]
cities = re.findall(r"\bid:'([^']+)'",city_block)
assert len(cities) == 13 and len(set(cities)) == 13, "Atlas ma mieć 13 unikalnych miast."
assert "id:'warsaw'" in city_block and 'ready:true' in city_block, "Warszawa musi być aktywna."
assert "right:13px" in nav and "position:fixed" in nav, "Przycisk nie jest pływający."
for f in ("atlas.html","assets/atlas.css","assets/atlas.js","assets/i18n4.js","assets/nav4.css","assets/poland-mark.svg"):
    assert f in sw, "PWA nie buforuje: " + f
for path in [atlas,home]:
    ids=re.findall(r'\bid="([^"]+)"',path)
    assert len(ids)==len(set(ids)), "Powtórzone identyfikatory HTML."
for text in ["Royal Castle","Places & Memories","Family mode","Photo mode","Worth visiting","Google reviews"]:
    assert text in i18n, "Niekompletna wersja EN: " + text
print("OK: Atlas 13 miast, trzy style, PL/EN, mini-mapa, przejście Polska/Warszawa, PWA.")
