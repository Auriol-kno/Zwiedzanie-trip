#!/usr/bin/env python3
"""Dodaj do atrakcji zweryfikowane odnośniki Wikipedii (PL/EN) — pole "wiki": {"qid", "pl", "en"}.

Źródło: tag `wikidata` obiektu w OpenStreetMap (© OpenStreetMap contributors, ODbL) + linki stron
(sitelinks plwiki/enwiki) z Wikidata (CC0). Niczego nie zgadujemy:
- miejsca regionalne z `coordinateStatus: "osm"` — tag z obiektu OSM o zapisanym identyfikatorze (lookup);
- atrakcje Warszawy — wyszukiwanie Nominatim „nazwa, Warszawa”; wynik przyjmujemy tylko przy zgodnej nazwie
  i ≤ MAX_KM od punktu z bazy. Współrzędnych Warszawy NIE zmieniamy (osobne zadanie z ROADMAP).
Miejsca bez potwierdzonego artykułu dostają w aplikacji link „Szukaj w Wikipedii” (wyszukiwarka, nie artykuł).
Wymaga sieci: nominatim.openstreetmap.org, www.wikidata.org. Tempo Nominatim 2,5 s, ponawianie przy 429.
Użycie: python tools/wiki_links.py --cache .geo-cache/wiki.json [--apply]  →  potem python tools/sync_database.py
"""
import argparse, json, sys, time, urllib.error, urllib.parse, urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import verify_coordinates as vc  # noqa: E402  (wspólne: UA, km, stems, GENERIC, PLACE_TYPES)

ROOT = vc.ROOT
MAX_KM = 2.0
# Sprawdzone ręcznie: tag wikidata należy do części/budynku, a nie do całego miejsca (np. „Stare Miasto” → ratusz,
# Muzeum Chopina → Zamek Ostrogskich, Plac Wilsona → stacja metra). Te miejsca dostają uczciwe wyszukiwanie.
REJECT = {"to-stare-miasto", "ch-stare-miasto", "pt-stare-miasto", "ol-stare-miasto", "so-zapora", "fr-wzgorze",
          "chopin", "wilson", "gorka_kazurka"}


def get(url, last):
    req = urllib.request.Request(url, headers={"User-Agent": vc.UA})
    for attempt in range(6):
        wait = vc.DELAY - (time.time() - last)
        if wait > 0:
            time.sleep(wait)
        try:
            with urllib.request.urlopen(req, timeout=40) as r:
                return json.loads(r.read().decode()), time.time()
        except urllib.error.HTTPError as e:
            last = time.time()
            if e.code not in (429, 500, 502, 503, 504) or attempt == 5:
                raise
            time.sleep(30 * (attempt + 1))


def cached(cache, key, url, last):
    if key not in cache:
        cache[key], last = get(url, last)
    return cache[key], last


def warsaw_ok(p, r):
    ours = vc.stems(p["name"]) - {g[:5] for g in vc.GENERIC} - vc.stems("Warszawa Warszawie")
    theirs = vc.stems((r.get("name") or "") + " " + r["display_name"].split(",")[0])
    if r.get("type") in vc.PLACE_TYPES:
        return False
    d = vc.km((p["lat"], p["lon"]), (float(r["lat"]), float(r["lon"])))
    return bool(ours & theirs) and d <= MAX_KM


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cache", required=True)
    ap.add_argument("--apply", action="store_true")
    a = ap.parse_args()
    cpath = Path(a.cache)
    cpath.parent.mkdir(parents=True, exist_ok=True)
    cache = json.loads(cpath.read_text()) if cpath.exists() else {}
    save = lambda: cpath.write_text(json.dumps(cache, ensure_ascii=False))
    reg = json.loads((ROOT / "data/regiony.json").read_text(encoding="utf-8"))
    waw = json.loads((ROOT / "data/atrakcje.json").read_text(encoding="utf-8"))
    last, qid_of = 0.0, {}

    # 1) Miejsca regionalne: tag wikidata z obiektu OSM o znanym identyfikatorze.
    osm = [p for p in reg["places"] if p.get("osm")]
    for i in range(0, len(osm), 50):
        chunk = osm[i:i + 50]
        ids = ",".join(p["osm"]["type"][0].upper() + str(p["osm"]["id"]) for p in chunk)
        url = "https://nominatim.openstreetmap.org/lookup?" + urllib.parse.urlencode({"osm_ids": ids, "format": "json", "extratags": 1})
        res, last = cached(cache, "lookup:" + ids, url, last); save()
        by = {(r["osm_type"], int(r["osm_id"])): r for r in res}
        for p in chunk:
            r = by.get((p["osm"]["type"], int(p["osm"]["id"])))
            q = ((r or {}).get("extratags") or {}).get("wikidata")
            if q:
                qid_of[("r", p["id"])] = q.split(";")[0].strip()
    print(f"Regiony: {sum(1 for k in qid_of if k[0] == 'r')}/{len(osm)} obiektów OSM ma tag wikidata", flush=True)

    # 2) Warszawa: wyszukiwanie po nazwie, ścisłe dopasowanie.
    for n, p in enumerate(waw["attractions"]):
        q = f"{p['name']}, Warszawa"
        url = "https://nominatim.openstreetmap.org/search?" + urllib.parse.urlencode(
            {"q": q, "format": "jsonv2", "limit": 3, "countrycodes": "pl", "extratags": 1, "accept-language": "pl"})
        res, last = cached(cache, "search:" + q, url, last); save()
        for r in res:
            tag = (r.get("extratags") or {}).get("wikidata")
            if tag and warsaw_ok(p, r):
                qid_of[("w", p["id"])] = tag.split(";")[0].strip()
                break
        print(f"[{n + 1}/{len(waw['attractions'])}] {p['id']}: {qid_of.get(('w', p['id']), '—')}", flush=True)

    # 3) Wikidata → tytuły artykułów plwiki/enwiki.
    qids = sorted(set(qid_of.values()))
    titles = {}
    for i in range(0, len(qids), 50):
        ids = "|".join(qids[i:i + 50])
        url = "https://www.wikidata.org/w/api.php?" + urllib.parse.urlencode(
            {"action": "wbgetentities", "ids": ids, "props": "sitelinks", "sitefilter": "plwiki|enwiki", "format": "json"})
        res, last = cached(cache, "wd:" + ids, url, last); save()
        for q, e in (res.get("entities") or {}).items():
            sl = e.get("sitelinks") or {}
            titles[q] = {"pl": (sl.get("plwiki") or {}).get("title"), "en": (sl.get("enwiki") or {}).get("title")}

    def wiki(kind, pid):
        if pid in REJECT:
            return None
        q = qid_of.get((kind, pid))
        t = titles.get(q) or {}
        return {"qid": q, "pl": t.get("pl"), "en": t.get("en")} if q and (t.get("pl") or t.get("en")) else None

    stats = {"r": 0, "w": 0}
    for kind, items in (("r", reg["places"]), ("w", waw["attractions"])):
        for p in items:
            w = wiki(kind, p["id"])
            if w:
                stats[kind] += 1
                if a.apply:
                    p["wiki"] = w
            elif a.apply:
                p.pop("wiki", None)
    print(f"Artykuły: regiony {stats['r']}/{len(reg['places'])}, Warszawa {stats['w']}/{len(waw['attractions'])}")
    if a.apply:
        reg["wikiSource"] = waw["wikiSource"] = ("OpenStreetMap wikidata tag (© OpenStreetMap contributors, ODbL) + Wikidata sitelinks (CC0) — "
                                                  + time.strftime("%Y-%m-%d"))
        (ROOT / "data/regiony.json").write_text(json.dumps(reg, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        (ROOT / "data/atrakcje.json").write_text(json.dumps(waw, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
