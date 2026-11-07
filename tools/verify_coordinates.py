#!/usr/bin/env python3
"""Zweryfikuj współrzędne miejsc regionalnych (data/regiony.json) w OpenStreetMap przez Nominatim.

Zasady: najwyżej 1 zapytanie/s, własny User-Agent aplikacji, wyniki w pamięci podręcznej (--cache),
https://operations.osmfoundation.org/policies/nominatim/. Dane © OpenStreetMap contributors (ODbL 1.0).

Wynik przyjmujemy tylko, gdy obiekt OSM leży w tym samym województwie i ≤ MAX_KM od dotychczasowego punktu.
Wtedy: lat/lon z OSM, coordinateStatus = "osm", osm = {type, id, name}. W pozostałych przypadkach punkt
zostaje „orientacyjne”, a skrypt wypisuje go do ręcznego sprawdzenia. Uruchom ponownie sync_database.py.
Użycie: python tools/verify_coordinates.py --cache /ścieżka/cache.json [--apply]
"""
import argparse, json, math, re, time, urllib.error, urllib.parse, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
UA = "IWasHere-PlacesAndMemories-data-check/1.0 (+https://github.com/Auriol-kno/Zwiedzanie-trip)"
MAX_KM = 12.0
DELAY = 2.5   # sekund między zapytaniami
VOIV = {"dolnoslaskie": "dolnośląskie", "kujawsko-pomorskie": "kujawsko-pomorskie", "lubelskie": "lubelskie", "lubuskie": "lubuskie",
        "lodzkie": "łódzkie", "malopolskie": "małopolskie", "mazowieckie": "mazowieckie", "opolskie": "opolskie", "podkarpackie": "podkarpackie",
        "podlaskie": "podlaskie", "pomorskie": "pomorskie", "slaskie": "śląskie", "swietokrzyskie": "świętokrzyskie",
        "warminsko-mazurskie": "warmińsko-mazurskie", "wielkopolskie": "wielkopolskie", "zachodniopomorskie": "zachodniopomorskie"}


def km(a, b):
    r = math.pi / 180
    dl, dn = (b[0] - a[0]) * r, (b[1] - a[1]) * r
    q = math.sin(dl / 2) ** 2 + math.cos(a[0] * r) * math.cos(b[0] * r) * math.sin(dn / 2) ** 2
    return 2 * 6371 * math.asin(math.sqrt(q))


# Nazwy w formie używanej w OpenStreetMap dla miejsc, których opisowa nazwa nie daje trafienia.
OVERRIDES = {
 "ns-hutnictwo": ["Muzeum Starożytnego Hutnictwa Świętokrzyskiego"], "bo-zamek": ["Zamek w Bodzentynie", "Ruiny zamku, Bodzentyn"],
 "kr-krzemionki": ["Krzemionki Opatowskie", "Rezerwat archeologiczny Krzemionki"], "sz-mury": ["Brama Krakowska, Szydłów"],
 "wi-kolegiata": ["Bazylika kolegiacka, Wiślica", "Kolegiata, Wiślica"], "pl-wzgorze-tumskie": ["Wzgórze Tumskie, Płock", "Bazylika katedralna, Płock"],
 "by-exploseum": ["Exploseum"], "ch-stare-miasto": ["Ratusz, Chełmno"], "gr-spichrze": ["Spichrze, Grudziądz", "Spichlerze, Grudziądz"],
 "ko-muzeum-zamoyskich": ["Muzeum Zamoyskich w Kozłówce", "Pałac Zamoyskich, Kozłówka"], "go-paradyz": ["Paradyż", "Opactwo, Gościkowo"],
 "sw-chrystus-krol": ["Pomnik Chrystusa Króla, Świebodzin"], "kr-wawel": ["Zamek Królewski na Wawelu"],
 "os-auschwitz": ["Państwowe Muzeum Auschwitz-Birkenau", "Muzeum Auschwitz-Birkenau, Oświęcim"], "bi-poloniny": ["Połonina Caryńska"],
 "wi-klasztor": ["Pokamedulski klasztor w Wigrach", "Klasztor, Wigry"], "gd-oliwa": ["Archikatedra Oliwska", "Katedra Oliwska, Gdańsk"],
 "ci-rotunda": ["Rotunda św. Mikołaja, Cieszyn", "Rotunda, Cieszyn"], "fr-wzgorze": ["Bazylika archikatedralna, Frombork", "Wzgórze Katedralne, Frombork"],
 "bu-pochylnie": ["Pochylnia Buczyniec", "Buczyniec"], "gn-katedra": ["Bazylika Prymasowska, Gniezno", "Katedra Gnieźnieńska"],
 "ka-katedra": ["Katedra, Kamień Pomorski", "Konkatedra, Kamień Pomorski"], "tr-ruina": ["Ruina kościoła, Trzęsacz", "Ruiny kościoła w Trzęsaczu"],
 "ko-molo": ["Molo, Kołobrzeg"], "st-kolegiata": ["Kolegiata, Stargard", "Kolegiata Najświętszej Maryi Panny, Stargard"],
 "kd-rynek": ["Rynek, Kazimierz Dolny"], "gd-dlugi-targ": ["Długi Targ, Gdańsk"], "dr-park": ["Drawieński Park Narodowy"], "tu-bory": ["Bory Tucholskie"],
}
GENERIC = {"zamek", "zamku", "muzeum", "park", "parku", "kosciol", "kosciola", "rynek", "rynku", "stare", "miasto", "miasta", "ulica", "bazylika",
           "katedra", "katedralna", "klasztor", "palac", "pomnik", "narodowy", "narodowe", "ruiny", "ruina", "opactwo", "wzgorze", "trasa",
           "turystyczna", "centrum", "sanktuarium", "rezerwat", "kopalnia", "zabytkowa", "brama", "galeria", "kaplica", "synagoga", "ratusz"}
norm = lambda t: re.sub(r"[^a-z0-9 ]", " ", t.lower().translate(str.maketrans("ąćęłńóśźż", "acelnoszz")))
def stems(text):
    return {w[:5] for w in norm(text).split() if len(w) >= 4}
def name_ok(p, r):
    """Wspólne znaczące słowo (pierwsze 5 liter — odporne na odmianę) albo nazwa ogólna przy bardzo małej odległości."""
    ours = stems(p["name"]["pl"] + " " + p["name"]["en"]) - {g[:5] for g in GENERIC}
    theirs = stems((r.get("name") or "") + " " + r["display_name"].split(",")[0])
    return bool(ours & theirs)
def area_km(r):
    b = [float(x) for x in r["boundingbox"]]
    return max((b[1] - b[0]) * 111.2, (b[3] - b[2]) * 111.2 * math.cos(math.radians(b[0])))
def inside_bbox(p, r):
    b = [float(x) for x in r["boundingbox"]]
    return b[0] <= p["lat"] <= b[1] and b[2] <= p["lon"] <= b[3]

def queries(p):
    name = re.sub(r"\s*\(.*?\)", "", p["name"]["pl"]).strip()
    town = p["town"]
    out = OVERRIDES.get(p["id"], []) + [f"{name}, {town}", name]
    for sep in (" — ", " – ", " i ", " w ", " we ", " na "):
        if sep in name:
            out.append(f"{name.split(sep)[0]}, {town}")
    return list(dict.fromkeys(q for q in out if q))


def search(q, cache, last):
    if q in cache:
        return cache[q], last
    url = "https://nominatim.openstreetmap.org/search?" + urllib.parse.urlencode(
        {"q": q, "format": "jsonv2", "limit": 3, "countrycodes": "pl", "addressdetails": 1, "accept-language": "pl"})
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    # Spokojne tempo (2,5 s) i ponawianie z narastającą przerwą przy 429/5xx — zgodnie z zasadami Nominatim.
    for attempt in range(6):
        wait = DELAY - (time.time() - last)
        if wait > 0:
            time.sleep(wait)
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                res = json.loads(r.read().decode())
            break
        except urllib.error.HTTPError as e:
            last = time.time()
            if e.code not in (429, 500, 502, 503, 504) or attempt == 5:
                raise
            time.sleep(30 * (attempt + 1))
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
                if VOIV[p["region"]] not in state or not name_ok(p, r):
                    continue
                d = km((p["lat"], p["lon"]), (float(r["lat"]), float(r["lon"])))
                # Duży obszar (park narodowy, półwysep, kanał): środek obszaru nie jest miejscem zwiedzania —
                # jeśli nasz punkt leży w obrysie obiektu, potwierdzamy go bez przesuwania.
                if area_km(r) > 2.5 and inside_bbox(p, r):
                    d, r = 0.0, dict(r, lat=str(p["lat"]), lon=str(p["lon"]), _area=True)
                if d <= MAX_KM and (best is None or d < best[0]):
                    best = (d, r, q)
            if best:
                break
        if best:
            d, r, q = best
            ok.append((p["id"], round(d, 2), (r.get("name") or r["display_name"].split(",")[0]) + (" [obszar]" if r.get("_area") else "")))
            if a.apply:
                p["lat"], p["lon"] = round(float(r["lat"]), 5), round(float(r["lon"]), 5)
                p["coordinateStatus"] = "osm"
                p["osm"] = {"type": r["osm_type"], "id": r["osm_id"], "name": r.get("name") or ""}
        else:
            review.append(p["id"])
        print(f"[{i + 1}/{len(db['places'])}] {p['id']}: " + (f"OSM {ok[-1][2]!r} Δ{best[0]:.2f} km" if best else "DO SPRAWDZENIA"), flush=True)
    if a.apply:
        db["coordinateSource"] = "OpenStreetMap Nominatim (© OpenStreetMap contributors, ODbL 1.0) — sprawdzone " + time.strftime("%Y-%m-%d")
        (ROOT / "data/regiony.json").write_text(json.dumps(db, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"\nZweryfikowane: {len(ok)}; do ręcznego sprawdzenia: {len(review)}")
    print("DO SPRAWDZENIA:", ", ".join(review))
    big = sorted(ok, key=lambda x: -x[1])[:15]
    print("Największe poprawki:", "; ".join(f"{i} {d} km ({n})" for i, d, n in big))


if __name__ == "__main__":
    main()
