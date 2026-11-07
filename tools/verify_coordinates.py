#!/usr/bin/env python3
"""Zweryfikuj współrzędne miejsc regionalnych (data/regiony.json) w OpenStreetMap przez Nominatim.

Zasady: najwyżej 1 zapytanie/s, własny User-Agent aplikacji, wyniki w pamięci podręcznej (--cache),
https://operations.osmfoundation.org/policies/nominatim/. Dane © OpenStreetMap contributors (ODbL 1.0).

Wynik przyjmujemy tylko, gdy obiekt OSM leży w tym samym województwie i ≤ MAX_KM od dotychczasowego punktu.
Wtedy: lat/lon z OSM, coordinateStatus = "osm", osm = {type, id, name}. W pozostałych przypadkach punkt
zostaje „orientacyjne”, a skrypt wypisuje go do ręcznego sprawdzenia. Uruchom ponownie sync_database.py.
Użycie: python tools/verify_coordinates.py --cache /ścieżka/cache.json [--apply]
"""
import argparse, json, math, re, time, urllib.parse, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
UA = "IWasHere-PlacesAndMemories-data-check/1.0 (+https://github.com/Auriol-kno/Zwiedzanie-trip)"
MAX_KM = 12.0
VOIV = {"dolnoslaskie": "dolnośląskie", "kujawsko-pomorskie": "kujawsko-pomorskie", "lubelskie": "lubelskie", "lubuskie": "lubuskie",
        "lodzkie": "łódzkie", "malopolskie": "małopolskie", "mazowieckie": "mazowieckie", "opolskie": "opolskie", "podkarpackie": "podkarpackie",
        "podlaskie": "podlaskie", "pomorskie": "pomorskie", "slaskie": "śląskie", "swietokrzyskie": "świętokrzyskie",
        "warminsko-mazurskie": "warmińsko-mazurskie", "wielkopolskie": "wielkopolskie", "zachodniopomorskie": "zachodniopomorskie"}


def km(a, b):
    r = math.pi / 180
    dl, dn = (b[0] - a[0]) * r, (b[1] - a[1]) * r
    q = math.sin(dl / 2) ** 2 + math.cos(a[0] * r) * math.cos(b[0] * r) * math.sin(dn / 2) ** 2
    return 2 * 6371 * math.asin(math.sqrt(q))


def queries(p):
    name = re.sub(r"\s*\(.*?\)", "", p["name"]["pl"]).strip()
    town = p["town"]
    out = [f"{name}, {town}", name]
    for sep in (" — ", " – ", " i ", " w ", " we ", " na "):
        if sep in name:
            out.append(f"{name.split(sep)[0]}, {town}")
    return list(dict.fromkeys(q for q in out if q))


def search(q, cache, last):
    if q in cache:
        return cache[q], last
    wait = 1.1 - (time.time() - last)
    if wait > 0:
        time.sleep(wait)
    url = "https://nominatim.openstreetmap.org/search?" + urllib.parse.urlencode(
        {"q": q, "format": "jsonv2", "limit": 3, "countrycodes": "pl", "addressdetails": 1, "accept-language": "pl"})
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        res = json.loads(r.read().decode())
    cache[q] = res
    return res, time.time()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cache", required=True)
    ap.add_argument("--apply", action="store_true")
    a = ap.parse_args()
    cpath = Path(a.cache)
    cache = json.loads(cpath.read_text()) if cpath.exists() else {}
    db = json.loads((ROOT / "data/regiony.json").read_text(encoding="utf-8"))
    last, ok, review = 0.0, [], []
    for i, p in enumerate(db["places"]):
        best = None
        for q in queries(p):
            res, last = search(q, cache, last)
            cpath.write_text(json.dumps(cache, ensure_ascii=False))
            for r in res:
                state = (r.get("address") or {}).get("state", "").lower()
                if VOIV[p["region"]] not in state:
                    continue
                d = km((p["lat"], p["lon"]), (float(r["lat"]), float(r["lon"])))
                if d <= MAX_KM and (best is None or d < best[0]):
                    best = (d, r, q)
            if best:
                break
        if best:
            d, r, q = best
            ok.append((p["id"], round(d, 2), r.get("name") or r["display_name"].split(",")[0]))
            if a.apply:
                p["lat"], p["lon"] = round(float(r["lat"]), 5), round(float(r["lon"]), 5)
                p["coordinateStatus"] = "osm"
                p["osm"] = {"type": r["osm_type"], "id": r["osm_id"], "name": r.get("name") or ""}
        else:
            review.append(p["id"])
        print(f"[{i + 1}/{len(db['places'])}] {p['id']}: " + (f"OSM {best[2]!r} Δ{best[0]:.2f} km" if best else "DO SPRAWDZENIA"), flush=True)
    if a.apply:
        db["coordinateSource"] = "OpenStreetMap Nominatim (© OpenStreetMap contributors, ODbL 1.0) — sprawdzone " + time.strftime("%Y-%m-%d")
        (ROOT / "data/regiony.json").write_text(json.dumps(db, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"\nZweryfikowane: {len(ok)}; do ręcznego sprawdzenia: {len(review)}")
    print("DO SPRAWDZENIA:", ", ".join(review))
    big = sorted(ok, key=lambda x: -x[1])[:15]
    print("Największe poprawki:", "; ".join(f"{i} {d} km ({n})" for i, d, n in big))


if __name__ == "__main__":
    main()
