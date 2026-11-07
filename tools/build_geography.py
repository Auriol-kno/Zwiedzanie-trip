#!/usr/bin/env python3
"""Zbuduj dane geograficzne Atlasu Polski (I Was Here 7.0) z prawdziwych źródeł.

Wyniki (commitowane do repozytorium, aplikacja nie pobiera ich z sieci):
  assets/poland-geography.js  — granica Polski, 16 województw, rzeki, jeziora, kraje sąsiednie, projekcja
  assets/poland-relief.webp   — cieniowany relief terenu (hipsometria + hillshade) w tej samej projekcji

Źródła:
  * Natural Earth 1:10m (admin-1, admin-0, rivers, lakes; wersja z pliku VERSION repozytorium
    nvkelso/natural-earth-vector) — domena publiczna, https://www.naturalearthdata.com/about/terms-of-use/
  * Terrain Tiles (Mapzen / AWS Open Data, format terrarium, zoom 8) — https://registry.opendata.aws/terrain-tiles/
    Dane: SRTM, GMTED2010, ETOPO1 (domena publiczna) oraz EU-DEM (Copernicus, wymagana atrybucja).

Użycie:  python tools/build_geography.py --cache /ścieżka/do/cache
Wymaga: shapely>=2, numpy, Pillow (z WebP). Pobrane pliki trafiają tylko do katalogu cache.
"""
from __future__ import annotations
import argparse, io, json, math, urllib.request
from pathlib import Path

import numpy as np
from PIL import Image
from shapely.geometry import Polygon, MultiPolygon, LineString, MultiLineString, box, shape
from shapely.ops import unary_union, polylabel
import shapely

ROOT = Path(__file__).resolve().parents[1]
NE = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/"
TERRAIN = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"

# Projekcja równoodległościowa z równoleżnikiem standardowym 52°N — nie rozciąga kraju (skala W–E = N–S).
KY = 104.0                       # jednostek viewBox na 1° szerokości (≈1,07 km na jednostkę)
KX = KY * math.cos(math.radians(52.0))
LON0, X0, LAT0 = 19.135, 450.0, 55.25
VIEW_W, VIEW_H = 900, 680

ISO_TO_ID = {"PL-DS": "dolnoslaskie", "PL-KP": "kujawsko-pomorskie", "PL-LU": "lubelskie", "PL-LB": "lubuskie",
             "PL-LD": "lodzkie", "PL-MA": "malopolskie", "PL-MZ": "mazowieckie", "PL-OP": "opolskie",
             "PL-PK": "podkarpackie", "PL-PD": "podlaskie", "PL-PM": "pomorskie", "PL-SL": "slaskie",
             "PL-SK": "swietokrzyskie", "PL-WN": "warminsko-mazurskie", "PL-WP": "wielkopolskie", "PL-ZP": "zachodniopomorskie"}
# Nazwy rzek w danych NE → nazwy w aplikacji, ranga (3 = największe).
RIVERS = {"Vistula": ("Vistula", 3), "Wisła": ("Vistula", 3), "Oder": ("Oder", 3), "Odra": ("Oder", 3),
          "Warta": ("Warta", 2), "Bug": ("Bug", 2), "Zakhidnyy Buh": ("Bug", 2), "Narew": ("Narew", 2), "San": ("San", 2),
          "Pilica": ("Pilica", 1), "Noteć": ("Noteć", 1), "Bzura": ("Bzura", 1), "Drwęca": ("Drwęca", 1),
          "Dunajec": ("Dunajec", 1), "Nysa Kłodzka": ("Nysa Kłodzka", 1), "Łyna": ("Łyna", 1), "Wieprz": ("Wieprz", 1),
          "Prosna": ("Prosna", 1), "Bóbr": ("Bóbr", 1), "Luzicka Nisa": ("Nysa Łużycka", 1), "Gwda": ("Gwda", 1),
          "Wkra": ("Wkra", 1), "Pissa": ("Pisa", 1), "Biebrza": ("Biebrza", 1)}
NEIGHBOURS = {"DEU": "Germany", "CZE": "Czechia", "SVK": "Slovakia", "UKR": "Ukraine", "BLR": "Belarus",
              "LTU": "Lithuania", "RUS": "Russia", "LVA": "Latvia", "SWE": "Sweden", "DNK": "Denmark", "HUN": "Hungary", "AUT": "Austria"}


def fetch(url: str, cache: Path) -> bytes:
    cache.mkdir(parents=True, exist_ok=True)
    target = cache / url.replace("https://", "").replace("/", "_")
    if not target.exists():
        with urllib.request.urlopen(url, timeout=300) as r:
            target.write_bytes(r.read())
    return target.read_bytes()


def ne(name: str, cache: Path) -> dict:
    local = cache / (name + ".geojson")
    if local.exists():
        return json.loads(local.read_text(encoding="utf-8"))
    return json.loads(fetch(NE + name + ".geojson", cache))


def ring(coords, nd=4):
    pts = [[round(x, nd), round(y, nd)] for x, y in coords]
    if pts[0] == pts[-1]:
        pts.pop()
    return pts


def polys(geom):
    return list(geom.geoms) if isinstance(geom, MultiPolygon) else [geom] if isinstance(geom, Polygon) else []


def lines(geom):
    if isinstance(geom, LineString):
        return [geom]
    if isinstance(geom, MultiLineString):
        return list(geom.geoms)
    if hasattr(geom, "geoms"):
        return [g for x in geom.geoms for g in lines(x)]
    return []


def build_vectors(cache: Path):
    admin1 = [f for f in ne("ne_10m_admin_1_states_provinces", cache)["features"] if f["properties"].get("adm0_a3") == "POL"]
    assert len(admin1) == 16, "Natural Earth: oczekiwano 16 województw"
    raw = {f["properties"]["iso_3166_2"]: shape(f["geometry"]).buffer(0) for f in admin1}
    country = unary_union(list(raw.values())).buffer(0)
    main = max(polys(country), key=lambda p: p.area)
    border = ring(main.simplify(0.0025, preserve_topology=True).exterior.coords)
    regions = []
    for f in admin1:
        p = f["properties"]; g = raw[p["iso_3166_2"]]
        biggest = max(polys(g), key=lambda q: q.area)
        simple = biggest.simplify(0.0025, preserve_topology=True)
        lab = polylabel(biggest, tolerance=0.01)
        regions.append({"name": p["name"], "id": ISO_TO_ID[p["iso_3166_2"]], "iso": p["iso_3166_2"],
                        "label": [round(lab.x, 3), round(lab.y, 3)], "coords": ring(simple.exterior.coords)})
    regions.sort(key=lambda r: r["id"])
    near = country.buffer(0.12)
    rivers: dict[str, list] = {}
    rank: dict[str, int] = {}
    for src in ("ne_10m_rivers_lake_centerlines", "ne_10m_rivers_europe"):
        for f in ne(src, cache)["features"]:
            nm = f["properties"].get("name") or f["properties"].get("name_en")
            if nm not in RIVERS:
                continue
            key, rk = RIVERS[nm]
            clipped = shape(f["geometry"]).intersection(near)
            for ln in lines(clipped):
                ln = ln.simplify(0.003)
                if ln.length < 0.05:
                    continue
                rivers.setdefault(key, []).append([[round(x, 4), round(y, 4)] for x, y in ln.coords])
                rank[key] = rk
    lakes = []
    seen = []
    for src in ("ne_10m_lakes", "ne_10m_lakes_europe"):
        for f in ne(src, cache)["features"]:
            g = shape(f["geometry"]).buffer(0)
            if not g.intersects(country):
                continue
            for q in polys(g.intersection(country)):
                if q.area < 0.0004 or any(q.intersects(s) and q.intersection(s).area > .5 * q.area for s in seen):
                    continue
                seen.append(q)
                lakes.append({"name": f["properties"].get("name") or "", "coords": ring(q.simplify(0.002).exterior.coords)})
    # Szeroki kadr: na pionowym ekranie telefonu mapa sięga daleko poza viewBox.
    frame = box(LON0 - X0 / KX - 6, LAT0 - VIEW_H / KY - 4, LON0 + (VIEW_W - X0) / KX + 6, LAT0 + 4)
    neighbours = []
    for f in ne("ne_10m_admin_0_countries", cache)["features"]:
        a3 = f["properties"].get("ADM0_A3")
        if a3 not in NEIGHBOURS:
            continue
        g = shape(f["geometry"]).buffer(0).intersection(frame).difference(country.buffer(0.002))
        rings = [ring(q.simplify(0.01, preserve_topology=True).exterior.coords, 3) for q in polys(g) if q.area > 0.01]
        if rings:
            neighbours.append({"name": NEIGHBOURS[a3], "polys": rings})
    return country, {"border": border, "regions": regions, "rivers": rivers, "riverRank": rank, "lakes": lakes, "neighbours": neighbours}


def terrarium(z: int, x: int, y: int, cache: Path) -> np.ndarray:
    img = Image.open(io.BytesIO(fetch(TERRAIN.format(z=z, x=x, y=y), cache))).convert("RGB")
    a = np.asarray(img, dtype=np.float64)
    return a[..., 0] * 256 + a[..., 1] + a[..., 2] / 256 - 32768


def build_relief(country, cache: Path, scale=2, zoom=8):
    W, H = VIEW_W * scale, VIEW_H * scale
    xs = (np.arange(W) + .5) / scale
    ys = (np.arange(H) + .5) / scale
    lon = LON0 + (xs - X0) / KX
    lat = LAT0 - ys / KY
    LON, LAT = np.meshgrid(lon, lat)
    n = 2 ** zoom
    px = (LON + 180) / 360 * n * 256
    py = (1 - np.log(np.tan(np.radians(LAT)) + 1 / np.cos(np.radians(LAT))) / math.pi) / 2 * n * 256
    tx0, tx1 = int(px.min() // 256), int(px.max() // 256)
    ty0, ty1 = int(py.min() // 256), int(py.max() // 256)
    mosaic = np.zeros(((ty1 - ty0 + 1) * 256, (tx1 - tx0 + 1) * 256))
    for ty in range(ty0, ty1 + 1):
        for tx in range(tx0, tx1 + 1):
            mosaic[(ty - ty0) * 256:(ty - ty0 + 1) * 256, (tx - tx0) * 256:(tx - tx0 + 1) * 256] = terrarium(zoom, tx, ty, cache)
    fx, fy = px - tx0 * 256 - .5, py - ty0 * 256 - .5
    x0 = np.clip(np.floor(fx).astype(int), 0, mosaic.shape[1] - 2); y0 = np.clip(np.floor(fy).astype(int), 0, mosaic.shape[0] - 2)
    wx, wy = fx - x0, fy - y0
    dem = (mosaic[y0, x0] * (1 - wx) * (1 - wy) + mosaic[y0, x0 + 1] * wx * (1 - wy) + mosaic[y0 + 1, x0] * (1 - wx) * wy + mosaic[y0 + 1, x0 + 1] * wx * wy)
    dem = np.maximum(dem, 0)
    cell = 1000 * 1.0696 / scale                 # metry na piksel (1 jednostka viewBox ≈ 1,07 km)
    gy, gx = np.gradient(dem, cell)
    zf = 7.0                                     # przewyższenie: czytelna rzeźba nizin, mocne góry
    slope = np.arctan(zf * np.hypot(gx, gy)); aspect = np.arctan2(-gx, gy)
    az, alt = math.radians(315), math.radians(40)
    shade = np.sin(alt) * np.cos(slope) + np.cos(alt) * np.sin(slope) * np.cos(az - aspect)
    shade = np.clip(shade, 0, 1)
    flat = math.sin(alt)                          # jasność płaskiego terenu
    # Hipsometria wg palety projektu: #68824B → #9EAF65 → ochra → rdzawe góry → jasne szczyty.
    stops = [(0, (104, 130, 75)), (120, (122, 145, 82)), (220, (148, 166, 96)), (320, (158, 175, 101)),
             (450, (190, 178, 108)), (620, (206, 150, 82)), (900, (198, 112, 58)), (1250, (164, 88, 56)),
             (1600, (176, 150, 138)), (2000, (246, 243, 236))]
    e = np.array([s[0] for s in stops], float)
    rgb = np.stack([np.interp(dem, e, [s[1][i] for s in stops]) for i in range(3)], -1)
    rel = (shade - flat)[..., None]               # >0 stoki oświetlone, <0 w cieniu
    rgb = np.clip(rgb * (1 + 1.05 * rel) + np.clip(rel, 0, None) * 70, 0, 255)
    inside = shapely.contains_xy(country.buffer(0.01), LON, LAT)
    alpha = np.where(inside, 255, 0).astype(np.uint8)
    img = Image.fromarray(np.dstack([rgb.astype(np.uint8), alpha]), "RGBA")
    out = ROOT / "assets/poland-relief.webp"
    img.save(out, "WEBP", quality=74, method=6)
    return out, int(dem.max())


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cache", default=str(ROOT / ".geo-cache"))
    ap.add_argument("--no-relief", action="store_true")
    args = ap.parse_args()
    cache = Path(args.cache)
    try:
        version = fetch(NE.rsplit("/geojson/", 1)[0] + "/VERSION", cache).decode().strip()
    except Exception:
        version = "unknown"
    country, data = build_vectors(cache)
    data = {"source": {"vectors": "Natural Earth 1:10m (admin-1, admin-0, rivers, lakes) " + version + ", public domain",
                       "relief": "Terrain Tiles (Mapzen/AWS Open Data, terrarium z8): SRTM, GMTED2010, ETOPO1; EU-DEM © Copernicus",
                       "simplification": "Douglas–Peucker 0.0025° (≈200–280 m)"},
            "projection": {"type": "equirectangular", "standardParallel": 52, "lon0": LON0, "x0": X0, "lat0": LAT0, "kx": round(KX, 4), "ky": KY,
                           "kmPerUnit": 1.0696, "width": VIEW_W, "height": VIEW_H},
            **data}
    (ROOT / "assets/poland-geography.js").write_text(
        "/* Wygenerowano przez tools/build_geography.py — nie edytuj ręcznie. Źródła i licencje: patrz pole source. */\n"
        "window.POLAND_GEO=" + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")
    print("granica:", len(data["border"]), "pkt; województwa:", sum(len(r["coords"]) for r in data["regions"]), "pkt;",
          "rzeki:", {k: len(v) for k, v in data["rivers"].items()}, "jeziora:", len(data["lakes"]), "sąsiedzi:", len(data["neighbours"]))
    if not args.no_relief:
        out, top = build_relief(country, cache)
        print("relief:", out.name, out.stat().st_size // 1024, "KB; najwyższy punkt w kadrze:", top, "m")


if __name__ == "__main__":
    main()
