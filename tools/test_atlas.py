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
assert 'id="atlasFloat"' in home and 'class="brand atlas-home"' in home, "Brak powrotu do mapy Polski przy logo."
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
assert ".top{position:sticky;top:0" in nav and "atlas-chip" in nav, "Logo z mapą Polski musi być zawsze widoczne u góry."
for f in ("atlas.html","assets/atlas.css","assets/atlas.js","assets/i18n4.js","assets/nav4.css","assets/poland-mark.svg"):
    assert f in sw, "PWA nie buforuje: " + f
for path in [atlas,home]:
    ids=re.findall(r'\bid="([^"]+)"',path)
    assert len(ids)==len(set(ids)), "Powtórzone identyfikatory HTML."
for text in ["Royal Castle","Places & Memories","Family mode","Photo mode","Worth visiting","Google reviews"]:
    assert text in i18n, "Niekompletna wersja EN: " + text

# I Was Here 5.0 — English brand and accurate illustrated geographic atlas
geo_path = ROOT / "assets/poland-geography.js"
assert geo_path.exists(), "Missing accurate Poland geometry"
geo_text = geo_path.read_text(encoding="utf-8")
geo = json.loads(geo_text.split("window.POLAND_GEO=", 1)[1].rstrip().rstrip(";"))
assert len(geo["border"]) >= 300, "Country border too coarse"
assert len(geo["regions"]) == 16, "All 16 provinces must be included"
assert {"Vistula", "Oder"} <= set(geo["rivers"]), "Geographic rivers missing"
assert len(set(r["name"] for r in geo["regions"])) == 16
art = (ROOT / "assets/atlas-illustrated.js").read_text(encoding="utf-8")
assert "landmark:iconGroup" in art and "atlas-forest" in art
assert (ROOT / "assets/atlas-light-v5.css").exists()
assert (ROOT / "assets/brand-pin.svg").exists()
assert (ROOT / "assets/logo-en.svg").exists()
assert "I Was Here" in atlas and "Places &amp; Memories" in atlas
assert "I WAS HERE" in home and "PLACES &amp; MEMORIES" in home
assert "assets/poland-geography.js" in atlas
assert "assets/atlas-illustrated.js" in atlas
assert "assets/brand-v5.js" in atlas and "assets/brand-v5.js" in home
assert manifest["name"] == "I Was Here — Places & Memories"
assert manifest["short_name"] == "I Was Here"
assert "icon.svg" in [i["src"] for i in manifest["icons"]]
assert "const GEO=window.POLAND_GEO;" in atlas_js
assert "IWH_ATLAS_ART.decorate" in atlas_js
city_rows=re.findall(r"\{id:'([^']+)',pl:'([^']+)',en:'([^']+)',lat:([\d.]+),lon:([\d.]+),ready:(true|false)\}",atlas_js)
assert len(city_rows)==13,"City count unexpectedly changed"
def contains(lon,lat,poly):
    inside=False
    for k in range(len(poly)):
        j=(k-1)%len(poly)
        a,b=poly[k],poly[j]
        if (a[1]>lat)!=(b[1]>lat) and lon < (b[0]-a[0])*(lat-a[1])/(b[1]-a[1])+a[0]:
            inside=not inside
    return inside
for cid,pl,en,lat,lon,active in city_rows:
    assert contains(float(lon),float(lat),geo["border"]),f"City outside country: {cid}"
assert sum(x[-1]=="true" for x in city_rows)==1, "Only Warsaw is currently published"
assert "tubylem_map_style','atlas'" in (ROOT/"assets/brand-v5.js").read_text(encoding="utf-8")
for extra in ["assets/atlas-light-v5.css","assets/atlas-illustrated.js","assets/poland-geography.js","assets/brand-pin.svg","assets/logo-en.svg","assets/brand-v5.js","assets/brand-v5.css"]:
    assert extra in sw, "New asset absent from offline cache: "+extra
# 5.1: jeden przełącznik języka i brak zdublowanej mapy Polski w Warszawie
explorer = (ROOT / "assets/poland-explorer.js").read_text(encoding="utf-8")
assert "tbLanguage" not in explorer and "tb_lang" not in explorer, "Drugi przełącznik języka w Warszawie"
explorer_code = re.sub(r"/\*.*?\*/", "", explorer, flags=re.S)
assert "polandHome" not in explorer_code, "Zdublowana mapa Polski w przewodniku Warszawy"
assert "smartOptions" not in explorer_code, "Zdublowany wybór priorytetu"
# 5.1: przełącznik PL | EN, podpisane ikony, spójna marka
assert 'class="lang-switch"' in home and 'data-lang="en"' in home and 'data-lang="en"' in atlas
assert 'id="themeBtn"' in home and "<small>Wygląd</small>" in home and "<small>Paszport</small>" in home
assert 'content="I Was Here"' in atlas and "Tu Byłem" not in atlas_js
assert "przewodnik 4.0" not in home and "Wersja demonstracyjna" not in home
assert "tubylem_lang" in explorer, "Moduł wycieczek musi używać wspólnego języka"
assert home.count('id="langWarsaw"') == 1
assert home.index('id="atlasFloat"') < home.index('assets/i18n4.js'), "#atlasFloat musi istnieć przed i18n4.js"
assert "./assets/poland-explorer.js" in sw, "PWA nie buforuje modułu wycieczek"
print("OK: I Was Here 5.0 branding, illustrated atlas, 16 provinces, 13 accurately placed cities.")

print("OK: Atlas 13 miast, trzy style, PL/EN, mini-mapa, przejście Polska/Warszawa, PWA.")
