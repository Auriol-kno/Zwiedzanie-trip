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
