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
import re
def check_wiki(p):
    """Pole wiki (tools/wiki_links.py): QID Wikidata i co najmniej jeden tytuł artykułu PL/EN — bez zgadywania."""
    w = p.get("wiki")
    if w is None:
        return
    assert re.fullmatch(r"Q\d+", w.get("qid") or ""), "wiki.qid: " + p["id"]
    assert (w.get("pl") or w.get("en")) and all(isinstance(w.get(k), (str, type(None))) for k in ("pl", "en")), "wiki: " + p["id"]
for p in attractions:
    check_wiki(p)
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
    check_wiki(p)
    assert 49.0 < p["lat"] < 54.9 and 14.1 < p["lon"] < 24.2, p["id"]
    assert p["time"] > 0 and 1 <= p["visitValue"] <= 5, p["id"]
    assert p["coordinateStatus"] in ("orientacyjne", "redakcyjne", "zweryfikowane", "osm"), p["id"]
    assert p["coordinateStatus"] != "osm" or (p.get("osm", {}).get("type") and p["osm"].get("id")), "Brak identyfikatora OSM: " + p["id"]
    assert p["url"] is None or p["url"].startswith("https://"), p["id"]
write("regiony.js", "// Wygenerowano z data/regiony.json przez tools/sync_database.py.\nwindow.IWH_REGIONS=" + compact(regions_db) + ";\n")
guided = sum(r["status"] != "planned" for r in regions)
print(f"OK: 16 województw ({guided} z atrakcjami), {len(region_places)} miejsc regionalnych; data/regiony.js zsynchronizowane.")

# I Was Here 8.6 — rozszerzone historie miejsc (data/historia/<region>.json) i szlaki tematyczne (data/szlaki.json).
# Pliki są wczytywane przez aplikację dynamicznie (fetch), dlatego nie generujemy dla nich kopii .js.
place_ids = {p["id"]: p for p in region_places}
ABBR = re.compile(r"\b(?:w|ok|r|św|m\.in|tzw|np|n\.p\.m|ul|pl|im|gen|ks|abp|bp|dr|prof|ss|St|Dr|Mt|ca|approx)\.$")
def sentences(paras):
    """Liczba zdań (z pominięciem skrótów typu „w.”, „ok.”, „św.”)."""
    n = 0
    for para in paras:
        for m in re.finditer(r"[.!?…](?=[”\"»]?(\s|$))", para):
            if not ABBR.search(para[: m.end()]):
                n += 1
    return n
hist_dir = DATA / "historia"
hist_total = 0
for path in sorted(hist_dir.glob("*.json")):
    h = json.loads(path.read_text(encoding="utf-8"))
    assert h["region"] == path.stem and h["region"] in region_ids, path.name
    assert h["note"]["pl"] and h["note"]["en"], "Brak noty o źródłach: " + path.name
    for pid, e in h["places"].items():
        assert pid in place_ids and place_ids[pid]["region"] == h["region"], "Nieznane miejsce w historii: " + pid
        for lang in ("pl", "en"):
            assert isinstance(e[lang], list) and all(isinstance(x, str) and x.strip() for x in e[lang]), pid
            assert sentences(e[lang]) >= 10, f"Historia {pid} [{lang}] ma mniej niż 10 zdań ({sentences(e[lang])})"
        hist_total += 1
routes_db = load("szlaki.json")
theme_ids = {t["id"] for t in routes_db["themes"]}
assert len(theme_ids) == len(routes_db["themes"]) >= 10, "Motywy szlaków"
assert all(t["pl"]["name"] and t["en"]["name"] and t["pl"]["desc"] and t["en"]["desc"] for t in routes_db["themes"])
route_ids = [r["id"] for r in routes_db["routes"]]
assert len(route_ids) == len(set(route_ids)), "Powtórzone ID szlaku"
city_ids = {"warsaw", "krakow", "gdansk", "wroclaw", "poznan", "lodz", "szczecin", "lublin", "bialystok", "rzeszow", "olsztyn", "torun", "katowice", "kielce"}
for r in routes_db["routes"]:
    assert r["theme"] in theme_ids, r["id"]
    assert r["pl"]["name"] and r["en"]["name"] and r["pl"]["intro"] and r["en"]["intro"], "Brak PL/EN szlaku: " + r["id"]
    assert len(r["stops"]) >= 3, "Za mało przystanków: " + r["id"]
    assert r.get("region") is None or r["region"] in region_ids, "Nieznane województwo szlaku: " + r["id"]
    for st in r["stops"]:
        kind, ref = st["ref"].split(":", 1)
        assert (kind == "place" and ref in place_ids) or (kind == "city" and ref in city_ids), "Nieznany przystanek " + st["ref"] + " w " + r["id"]
        assert ("pl" in st) == ("en" in st), "Notatka przystanku tylko w jednym języku: " + r["id"]
assert hist_total == len(region_places), f"Każde miejsce regionalne musi mieć historię ≥10 zdań: {hist_total}/{len(region_places)}"
print(f"OK: {hist_total} rozszerzonych historii (≥10 zdań PL i EN), {len(theme_ids)} motywów, {len(route_ids)} szlaków tematycznych.")

# 8.6.1 — BAZA_DANYCH.md, etap 1: lekki indeks wszystkich obiektów (regiony + Warszawa), pobierany na żądanie (fetch).
# Pola skrócone, żeby plik był mały: k = rodzaj (place = miejsce w regionie, waw = atrakcja Warszawy), r = województwo,
# t = miejscowość lub dzielnica, n = nazwa {pl,en}, i = ikona, la/lo = współrzędne, c = kategorie, h = jest długa historia.
hist_ids = set()
for path in sorted(hist_dir.glob("*.json")):
    hist_ids |= set(json.loads(path.read_text(encoding="utf-8"))["places"])
index_items = [{"id": p["id"], "k": "place", "r": p["region"], "t": p["town"], "n": p["name"], "i": p["icon"],
                "la": p["lat"], "lo": p["lon"], "c": p["cats"], **({"h": 1} if p["id"] in hist_ids else {})} for p in region_places]
index_items += [{"id": a["id"], "k": "waw", "r": "mazowieckie", "t": a["district"], "n": {"pl": a["name"], "en": None}, "i": a.get("icon") or "📍",
                 "la": a["lat"], "lo": a["lon"], "c": a["cats"]} for a in attractions]
assert len({(i["k"], i["id"]) for i in index_items}) == len(index_items), "Powtórzone ID w indeksie"
(DATA / "index").mkdir(exist_ok=True)
write("index/places.json", json.dumps({"version": "8.6.1", "note": "Wygenerowano przez tools/sync_database.py — nie edytuj ręcznie.", "items": index_items}, ensure_ascii=False, separators=(",", ":")) + "\n")
print(f"OK: indeks data/index/places.json — {len(index_items)} obiektów ({len(region_places)} w regionach, {len(attractions)} w Warszawie).")
