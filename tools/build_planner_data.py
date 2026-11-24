#!/usr/bin/env python3
"""I Was Here 8.16 — dane planera „dzień po dniu” (planer.html).

Czyta data/atrakcje.json (Warszawa) i data/regiony.json (miejsca regionalne) i zapisuje
zwięzły data/planer.json: lista miast z liczbą miejsc oraz miejsca ze współrzędnymi,
kategoriami, czasem zwiedzania i redakcyjną wartością wizyty 1–5. Bez opisów i historii —
te planer pokazuje przez linki do przewodników. Uruchom po każdej zmianie danych:

    python tools/build_planner_data.py          # zapis
    python tools/build_planner_data.py --check  # błąd, jeśli plik jest nieaktualny
"""
import json, math, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'data' / 'planer.json'
MIN_PLACES = 5  # miasta z mniejszą liczbą miejsc nie trafiają na listę (za mało na plan dnia)


def km(a, b):
    r = math.radians
    dlat, dlon = r(b[0] - a[0]), r(b[1] - a[1])
    h = math.sin(dlat / 2) ** 2 + math.cos(r(a[0])) * math.cos(r(b[0])) * math.sin(dlon / 2) ** 2
    return 12742 * math.asin(math.sqrt(h))


def build():
    waw = json.loads((ROOT / 'data/atrakcje.json').read_text(encoding='utf-8'))
    reg = json.loads((ROOT / 'data/regiony.json').read_text(encoding='utf-8'))
    regions = {g['id']: {'pl': g['pl'], 'en': g['en']} for g in reg['regions']}
    places = []
    for a in waw['attractions']:
        if not (a.get('lat') and a.get('lon')):
            continue
        places.append({
            'id': a['id'], 'k': 'waw', 'town': 'Warszawa', 'region': 'mazowieckie',
            'n': {'pl': a['name'], 'en': a['name']},
            'lat': round(a['lat'], 5), 'lon': round(a['lon'], 5),
            'cats': a.get('cats') or [], 'min': a.get('time') or 60, 'v': a.get('visitValue') or 3,
            'icon': a.get('icon') or '📍', 'hours': a.get('hours') or '',
            'sch': a.get('schedule') or None, 'approx': a.get('coordinateStatus') != 'osm',
        })
    for p in reg['places']:
        if not (p.get('lat') and p.get('lon')):
            continue
        places.append({
            'id': p['id'], 'k': 'place', 'town': p['town'], 'region': p['region'],
            'n': {'pl': p['name']['pl'], 'en': p['name'].get('en') or p['name']['pl']},
            'lat': round(p['lat'], 5), 'lon': round(p['lon'], 5),
            'cats': p.get('cats') or [], 'min': p.get('time') or 60, 'v': p.get('visitValue') or 3,
            'icon': p.get('icon') or '📍', 'hours': '', 'sch': None,
            'approx': p.get('coordinateStatus') != 'osm',
        })
    towns = {}
    for p in places:
        t = towns.setdefault(p['town'], {'name': p['town'], 'region': p['region'], 'pts': []})
        t['pts'].append((p['lat'], p['lon']))
    cities = []
    for t in towns.values():
        if len(t['pts']) < MIN_PLACES:
            continue
        lat = sum(x for x, _ in t['pts']) / len(t['pts'])
        lon = sum(y for _, y in t['pts']) / len(t['pts'])
        cities.append({'name': t['name'], 'region': t['region'], 'regionName': regions.get(t['region']),
                       'count': len(t['pts']), 'lat': round(lat, 5), 'lon': round(lon, 5),
                       'full': t['name'] == 'Warszawa'})
    cities.sort(key=lambda c: (not c['full'], -c['count'], c['name']))
    cats = reg['categories']
    return {
        'note': 'Wygenerowano przez tools/build_planner_data.py z data/atrakcje.json i data/regiony.json — nie edytuj ręcznie.',
        'categories': {k: {'icon': v[0], 'pl': v[1], 'en': v[2]} for k, v in cats.items()},
        'cities': cities,
        'places': places,
    }


def dump(data):
    head = {k: v for k, v in data.items() if k != 'places'}
    s = json.dumps(head, ensure_ascii=False, separators=(',', ':'))[:-1]
    rows = ',\n'.join(json.dumps(p, ensure_ascii=False, separators=(',', ':')) for p in data['places'])
    return s + ',"places":[\n' + rows + '\n]}\n'


if __name__ == '__main__':
    text = dump(build())
    if '--check' in sys.argv:
        if not OUT.exists() or OUT.read_text(encoding='utf-8') != text:
            sys.exit('data/planer.json jest nieaktualny — uruchom python tools/build_planner_data.py')
        print('data/planer.json aktualny')
    else:
        OUT.write_text(text, encoding='utf-8')
        d = json.loads(text)
        print(f"data/planer.json: {len(d['places'])} miejsc, {len(d['cities'])} miast")
