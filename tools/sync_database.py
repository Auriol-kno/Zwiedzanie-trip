#!/usr/bin/env python3
"""Sprawdź redakcyjne katalogi i zsynchronizuj pliki JavaScript dla PWA."""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"


def load(name):
    return json.loads((DATA / name).read_text(encoding="utf-8"))


def compact(value):
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"))


def write(name, text):
    (DATA / name).write_text(text, encoding="utf-8")


places = load("atrakcje.json")
districts = places["districts"]
attractions = places["attractions"]
assert len(districts) == 18 and len(set(districts)) == 18, "Dzielnice"
assert len(attractions) >= 180, "Baza atrakcji"
assert len({p["id"] for p in attractions}) == len(attractions), "Powtórzone ID atrakcji"
assert set(p["district"] for p in attractions) == set(districts), "Niespójne dzielnice"
for p in attractions:
    assert all(k in p for k in ("id", "district", "name", "lat", "lon", "cats", "time", "desc", "story", "url", "score", "visitValue")), p.get("id")
    assert 52.09 < p["lat"] < 52.40 and 20.80 < p["lon"] < 21.30, p["id"]
    assert p["time"] > 0 and 0 <= p["score"] <= 100 and 1 <= p["visitValue"] <= 5, p["id"]
js_obj = {k: places[k] for k in ("version", "updated", "districts", "attractions")}
write("atrakcje.js", "// Wygenerowano z data/atrakcje.json przez tools/sync_database.py.\nwindow.WARSAW_DB=" + compact(js_obj) + ";\n")

food = load("restauracje.json")
restaurants = food["restaurants"]
assert len(restaurants) >= 30, "Baza gastronomii"
assert len({r["id"] for r in restaurants}) == len(restaurants), "Powtórzone ID restauracji"
for r in restaurants:
    assert all(k in r for k in ("id", "name", "district", "address", "cuisine", "type", "priceBand", "googleRating", "editorialPick")), r.get("id")
    assert r["district"] in districts and 1 <= r["priceBand"] <= 4 and 1 <= r["editorialPick"] <= 5, r["id"]
    assert r["googleRating"] is None, "Nie wpisuj nieaktualnych ocen Google do katalogu"
write("restauracje.js", "window.WARSAW_FOOD=" + compact(food) + ";\n")
print(f"OK: {len(attractions)} atrakcji, {len(districts)} dzielnic, {len(restaurants)} lokali; pliki JS zsynchronizowane.")

# I Was Here 6.0 — województwa i atrakcje regionalne (Atlas → region → miejscowość)
regions_db = load("regiony.json")
regions = regions_db["regions"]
region_ids = {r["id"] for r in regions}
assert len(regions) == 16 and len(region_ids) == 16, "Atlas ma 16 województw"
assert all(r["status"] in ("guide", "partial", "planned") for r in regions)
categories = regions_db["categories"]
region_places = regions_db["places"]
assert len({p["id"] for p in region_places}) == len(region_places), "Powtórzone ID miejsc regionalnych"
for p in region_places:
    assert all(k in p for k in ("id", "region", "town", "name", "cats", "time", "visitValue", "lat", "lon", "icon", "url", "desc", "coordinateStatus")), p.get("id")
    assert p["region"] in region_ids, p["id"]
    assert p["name"]["pl"] and p["name"]["en"] and p["desc"]["pl"] and p["desc"]["en"], "Brak PL/EN: " + p["id"]
    assert set(p["cats"]) <= set(categories), p["id"]
    assert 49.0 < p["lat"] < 54.9 and 14.1 < p["lon"] < 24.2, p["id"]
    assert p["time"] > 0 and 1 <= p["visitValue"] <= 5, p["id"]
    assert p["coordinateStatus"] in ("orientacyjne", "redakcyjne", "zweryfikowane", "osm"), p["id"]
    assert p["coordinateStatus"] != "osm" or (p.get("osm", {}).get("type") and p["osm"].get("id")), "Brak identyfikatora OSM: " + p["id"]
    assert p["url"] is None or p["url"].startswith("https://"), p["id"]
write("regiony.js", "// Wygenerowano z data/regiony.json przez tools/sync_database.py.\nwindow.IWH_REGIONS=" + compact(regions_db) + ";\n")
guided = sum(r["status"] != "planned" for r in regions)
print(f"OK: 16 województw ({guided} z atrakcjami), {len(region_places)} miejsc regionalnych; data/regiony.js zsynchronizowane.")
