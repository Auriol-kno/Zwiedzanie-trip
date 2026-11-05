#!/usr/bin/env python3
"""Synchronizuje JavaScript z redakcyjną bazą JSON."""
from pathlib import Path
import json
ROOT = Path(__file__).resolve().parents[1]
source = ROOT / 'data' / 'atrakcje.json'
dest = ROOT / 'data' / 'atrakcje.js'
db = json.loads(source.read_text(encoding='utf-8'))
assert len(db['districts']) == 18, 'Oczekiwano 18 dzielnic'
assert len(set(db['districts'])) == 18, 'Powtórzone dzielnice'
assert len(db['attractions']) == len({p['id'] for p in db['attractions']}), 'Powtórzone ID'
assert set(p['district'] for p in db['attractions']) == set(db['districts']), 'Brak dzielnic lub błędna nazwa'
for p in db['attractions']:
    assert all(k in p for k in ('id','district','name','lat','lon','cats','time','desc','story','url','score')), p.get('id')
    assert 52.09 < p['lat'] < 52.40 and 20.80 < p['lon'] < 21.30, p['id']
    assert p['time'] > 0 and 0 <= p['score'] <= 100, p['id']
obj = {k: db[k] for k in ('version','updated','districts','attractions')}
content = '// Wygenerowano z data/atrakcje.json przez tools/sync_database.py.\nwindow.WARSAW_DB=' + json.dumps(obj, ensure_ascii=False, separators=(',', ':')) + ';\n'
dest.write_text(content, encoding='utf-8')
print(f'OK: {len(db["attractions"])} atrakcji, {len(db["districts"])} dzielnic, JS zsynchronizowany.')
