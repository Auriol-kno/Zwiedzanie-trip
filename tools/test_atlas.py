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
assert len(cities) == 14 and len(set(cities)) == 14 and "kielce" in cities, "Atlas ma mieć 14 unikalnych miast (z Kielcami)."
assert "id:'warsaw'" in city_block and 'ready:true' in city_block, "Warszawa musi być aktywna."
assert ".top{position:sticky;top:0" in nav and "brand-atlas.svg" in home, "Logo z mapą Polski musi być zawsze widoczne u góry."
assert "atlas-chip" not in home, "Mapa jest częścią logo (jeden znak), bez osobnej ikonki."
for f in ("atlas.html","assets/atlas.css","assets/atlas.js","assets/i18n4.js","assets/nav4.css","assets/poland-mark.svg","assets/brand-atlas.svg"):
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
assert len(city_rows)==14,"City count unexpectedly changed"
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
# 5.3: każdy lokalny plik ładowany przez strony musi być w cache offline; Atlas rejestruje SW
core = set(re.findall(r"'\./([^']+)'", sw.split("CORE=", 1)[1].split("];", 1)[0]))
region_page = (ROOT / "region.html").read_text(encoding="utf-8")
for page in (atlas, home, region_page):
    for ref in re.findall(r'(?:src|href)="(?:\./)?((?:assets|data)/[^"?#]+)"', page):
        assert ref in core, "PWA nie buforuje: " + ref
assert "assets/poland-explorer.js" in core
assert "serviceWorker.register" in atlas_js, "Atlas (start_url) musi rejestrować Service Workera"
assert "ignoreSearch" in sw and "navigate" in sw, "Offline: nawigacja z ?lang musi trafiać w cache"
assert all(i["purpose"] == "any" for i in manifest["icons"]), "Ikona any nie może być jednocześnie maskable"
assert "offers a worthwhile stop" not in i18n, "Szablonowe opisy EN"
# 6.0: województwa w Atlasie i przewodnik regionu
import math
regdb = json.loads((ROOT / "data/regiony.json").read_text(encoding="utf-8"))
geo_regions = {r["name"]: r["coords"] for r in geo["regions"]}
assert len(regdb["regions"]) == 16 and {r["geo"] for r in regdb["regions"]} == set(geo_regions), "Województwa muszą odpowiadać granicom Natural Earth"
city_ids = {c[0] for c in city_rows}
assert all(set(r["cities"]) <= city_ids for r in regdb["regions"]), "Nieznane miasto w województwie"
assert sorted(c for r in regdb["regions"] for c in r["cities"]) == sorted(city_ids), "Każde z 14 miast należy do jednego województwa"
def edge_km(lon, lat, poly):
    k = math.cos(math.radians(lat)) * 111.3
    best = 1e9
    for i in range(len(poly)):
        (x1, y1), (x2, y2) = poly[i - 1], poly[i]
        ax, ay, bx, by = (x1 - lon) * k, (y1 - lat) * 111.3, (x2 - lon) * k, (y2 - lat) * 111.3
        dx, dy = bx - ax, by - ay
        t = max(0, min(1, -(ax * dx + ay * dy) / ((dx * dx + dy * dy) or 1)))
        best = min(best, math.hypot(ax + t * dx, ay + t * dy))
    return best
by_id = {r["id"]: r for r in regdb["regions"]}
for p in regdb["places"]:
    poly = geo_regions[by_id[p["region"]]["geo"]]
    # Granice Natural Earth są uproszczone (np. Wisła przy Sandomierzu) — dopuszczamy 3 km od krawędzi.
    assert contains(p["lon"], p["lat"], poly) or edge_km(p["lon"], p["lat"], poly) < 3, "Miejsce poza województwem: " + p["id"]
    # Zweryfikowane tylko z identyfikatorem obiektu OpenStreetMap; pozostałe uczciwie „orientacyjne”.
    assert p["coordinateStatus"] == "orientacyjne" or (p["coordinateStatus"] == "osm" and p["osm"]["id"]), "Nie oznaczaj szacunkowych współrzędnych jako zweryfikowanych: " + p["id"]
for r in regdb["regions"]:
    has = any(p["region"] == r["id"] for p in regdb["places"])
    assert has == (r["status"] != "planned"), "Status województwa niezgodny z danymi: " + r["id"]
swk = [p for p in regdb["places"] if p["region"] == "swietokrzyskie"]
assert len(swk) >= 25 and {"Kielce", "Sandomierz", "Chęciny"} <= {p["town"] for p in swk}, "Baza świętokrzyska"
assert any(p["town"] == "Sierpc" for p in regdb["places"] if p["region"] == "mazowieckie"), "Mazowieckie: Sierpc"
assert "data/regiony.js" in atlas and 'id="regionStrip"' in atlas and 'id="cardTowns"' in atlas
for token in ["langRegion", "townChips", "catChips", "planList", "placeList", "atlasFloat", "rMap"]:
    assert 'id="' + token + '"' in region_page, "region.html: " + token
assert "IWH_REGIONS" in (ROOT / "assets/region.js").read_text(encoding="utf-8")
for f in ("./region.html", "./assets/region.js", "./assets/region.css", "./data/regiony.js"):
    assert f in sw, "PWA nie buforuje: " + f
# 7.0: prawdziwa geometria (Natural Earth 1:10m), projekcja bez rozciągania, relief, plany
assert "Natural Earth 1:10m" in geo["source"]["vectors"] and "Terrain Tiles" in geo["source"]["relief"], "Brak źródeł danych"
proj = geo["projection"]
assert proj["standardParallel"] == 52 and abs(proj["kx"] / proj["ky"] - math.cos(math.radians(52))) < 1e-3, "Projekcja rozciąga kraj"
assert len(geo["border"]) >= 600 and sum(len(r["coords"]) for r in geo["regions"]) >= 2000, "Granice zbyt uproszczone"
assert {r["id"] for r in geo["regions"]} == {r["id"] for r in regdb["regions"]}, "Identyfikatory województw"
assert all(len(r["label"]) == 2 for r in geo["regions"]), "Brak punktów nazw województw"
cities_xy = {c[0]: (float(c[4]), float(c[3])) for c in city_rows}
for r in regdb["regions"]:
    for cid in r["cities"]:
        lon, lat = cities_xy[cid]
        assert contains(lon, lat, geo_regions[r["geo"]]), f"Miasto {cid} poza województwem {r['id']}"
relief = ROOT / "assets/poland-relief.webp"
assert relief.exists() and relief.read_bytes()[8:12] == b"WEBP" and relief.stat().st_size < 400_000, "Relief WebP"
assert "./assets/poland-relief.webp" in sw and "./assets/atlas-plans.js" in sw and "./assets/atlas-premium.css" in sw
for token in ["layersButton", "layersPanel", "resetView", "placeSheet", "addTrip", "addDay", "toggleVisited", "tabPanel", "planPicker", "scaleBar", "styleLight"]:
    assert 'id="' + token + '"' in atlas, "atlas.html: " + token
plans = (ROOT / "assets/atlas-plans.js").read_text(encoding="utf-8")
assert all(k in plans for k in ("iwh_trips", "iwh_days", "iwh_visited", "tb_saved_trips")), "Plany: klucze zapisu"
assert 'data-tab="trips"' in atlas and 'data-tab="day"' in atlas and 'data-tab="memories"' in atlas and 'data-tab="profile"' in atlas
# 8.0: przewodniki wszystkich województw; każde z 14 miast ma atrakcje w przewodniku swojego regionu
for r in regdb["regions"]:
    n = sum(p["region"] == r["id"] for p in regdb["places"])
    assert n >= 8 and r["status"] in ("guide", "partial"), f"Za mało miejsc: {r['id']} ({n})"
city_pl = {c[0]: c[1] for c in city_rows}
for r in regdb["regions"]:
    for cid in r["cities"]:
        assert cid == "warsaw" or any(p["region"] == r["id"] and p["town"] == city_pl[cid] for p in regdb["places"]), "Brak atrakcji miasta: " + cid
assert all(p["coordinateStatus"] in ("orientacyjne", "osm") for p in regdb["places"]), "Status współrzędnych"
assert sum(p["coordinateStatus"] == "osm" for p in regdb["places"]) >= 150 and "OpenStreetMap" in regdb.get("coordinateSource", ""), "Weryfikacja OSM"
print("OK: I Was Here 7.0 — granice Natural Earth 1:10m, 14 miast w swoich województwach, relief, plany.")
print("OK: I Was Here 6.0 — 16 województw, " + str(len(regdb["places"])) + " miejsc regionalnych w granicach województw.")
print("OK: I Was Here 5.0 branding, illustrated atlas, 16 provinces, 14 accurately placed cities.")

# 8.3 — Wikipedia, dziennik podróży, filtry przed mapą, wycieczka piesza, jedno logo z mapą
extras = (ROOT / "assets/place-extras.js").read_text(encoding="utf-8")
for page in ("atlas.html", "index.html", "region.html"):
    src = (ROOT / page).read_text(encoding="utf-8")
    assert "place-extras.js" in src and "place-extras.css" in src and "brand-atlas.svg" in src, page
for f in ("./assets/place-extras.js", "./assets/place-extras.css", "./assets/brand-atlas.svg"):
    assert f in sw, "Brak w cache offline: " + f
assert "MAX_PHOTOS=5" in extras and "indexedDB" in extras and 'accept="image/*" multiple' in extras, "Dziennik: do 5 zdjęć z biblioteki"
assert "wikipedia.org/wiki/" in extras and "index.php?search=" in extras, "Wikipedia: artykuł lub uczciwe wyszukiwanie"
for k in ("wiki", "wikiSearch", "journal", "notes", "add", "privacy", "limit"):
    assert extras.count(k + ":") >= 2, "PL/EN: " + k
regp = (ROOT / "region.html").read_text(encoding="utf-8")
assert regp.index('class="filters"') < regp.index('id="mapSection"'), "Filtry przed mapą (region)"
assert 'data-mode="walking"' in regp and "walkMode:" in (ROOT / "assets/region.js").read_text(encoding="utf-8"), "Wycieczka piesza (region)"
assert home.index('id="interestSection"') < home.index('id="mapSection"'), "Wybór atrakcji przed mapą (Warszawa)"
assert 'data-mode="walking"' in home, "Wycieczka piesza (Warszawa)"

print("OK: Atlas 14 miast, trzy style, PL/EN, mini-mapa, przejście Polska/Warszawa, PWA.")
