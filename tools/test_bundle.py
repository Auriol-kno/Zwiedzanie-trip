#!/usr/bin/env python3
"""Kontrola struktury przewodnika, bez internetu i kluczy API."""
from pathlib import Path
import json
import re
ROOT = Path(__file__).resolve().parents[1]
html = (ROOT / "index.html").read_text(encoding="utf-8")
a = json.loads((ROOT / "data/atrakcje.json").read_text(encoding="utf-8"))
f = json.loads((ROOT / "data/restauracje.json").read_text(encoding="utf-8"))
assert len(a["attractions"]) >= 184
assert len(f["restaurants"]) >= 36
assert len(a["districts"]) == 18
assert set(p["district"] for p in a["attractions"]) == set(a["districts"])
ids = set(re.findall(r'\bid="([^"]+)"', html))
required = [
    "waw3Explorer", "waw3Min", "waw3Pace", "waw3Age", "waw3Family",
    "waw3Photo", "waw3Break", "waw3FindMe", "waw3SavePlan",
    "waw3FoodSearch", "waw3FoodDistrict", "waw3FoodCuisine", "waw3FoodType",
    "waw3FoodPrice", "waw3FoodSort", "waw3FoodSaved", "waw3FoodList",
    "waw3FoodCount", "waw3NavFood", "waw3Connection", "waw3Sun",
    "waw3GPSStatus", "waw3ValueLabel", "waw3Count", "foodSection",
    "waw3TransitNote", "waw3TransitMap",
]
assert not (set(required) - ids), f"Brak pól: {set(required)-ids}"
assert len(re.findall(r'\bid="([^"]+)"', html)) == len(ids), "Duplikat HTML id"
for path in ("data/atrakcje.js", "data/restauracje.js", "assets/features3.js", "assets/upgrade3.css", "service-worker.js"):
    assert (ROOT / path).exists(), path
    assert path in html or path == "service-worker.js", path
assert all(r["googleRating"] is None for r in f["restaurants"])
print(f"OK: HTML, dane i spójność: {len(a['attractions'])} atrakcji, {len(f['restaurants'])} lokali.")
