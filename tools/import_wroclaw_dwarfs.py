#!/usr/bin/env python3
from pathlib import Path
import json
import argparse
from datetime import date
parser=argparse.ArgumentParser(description='Import ODbL GeoJSON from https://mobile.wroclaw.pl/krasnale.geojson; download it separately with TLS verification.')
parser.add_argument('geojson', type=Path)
args=parser.parse_args()
R=Path(__file__).resolve().parents[1]
src=json.loads(args.geojson.read_text(encoding='utf-8'))
assert src['type']=='FeatureCollection' and 'ODbL' in src.get('copyright',''), 'Expected OSM data under ODbL'

items=[]
for f in src['features']:
 t=f['properties'];lon,lat=f['geometry']['coordinates'];kind,oid=t['@id'].split('/')
 if t.get('artwork_type')!='dwarf' or not (50.99<lat<51.23 and 16.80<lon<17.22):continue
 nm=t.get('name') or 'Krasnal OSM '+oid
 pl='Figurka z wrocławskiego szlaku krasnali: '+nm+'.'
 en='A figure on the Wrocław dwarf trail: '+(t.get('name:en') or t.get('name') or 'OSM dwarf '+oid)+'.'
 if t.get('artist_name'):pl+=' Autor: '+t['artist_name']+'.';en+=' Artist: '+t['artist_name']+'.'
 if t.get('start_date'):pl+=' Data ustawienia podana w OSM: '+t['start_date']+'.';en+=' Installation date recorded in OSM: '+t['start_date']+'.'
 indoor=t.get('indoor')=='yes' or t.get('location','').startswith(('indoor','inside'))
 restricted=t.get('access') in ['private','permit','customers','no']
 if indoor:pl+=' Figurka znajduje się we wnętrzu; sprawdź godziny dostępu.';en+=' This figure is indoors; check access hours.'
 if restricted:pl+=' Dostęp jest ograniczony — nie wchodź bez zgody gospodarza.';en+=' Access is restricted; obtain permission from the host.'
 pl+=' Lokalizacja według OSM; obecność figurki wymaga potwierdzenia na miejscu.'
 en+=' Location recorded in OSM; confirm the figure is still there when visiting.'
 items.append(dict(id='wr-dwarf-'+kind+'-'+oid,region='dolnoslaskie',town='Wrocław',name={'pl':nm,'en':t.get('name:en') or t.get('name') or 'OSM dwarf '+oid},cats=['dwarfs'],time=5,visitValue=3,lat=lat,lon=lon,icon='🧙',url='https://www.openstreetmap.org/'+t['@id'],desc={'pl':pl,'en':en},coordinateStatus='osm',osm={'type':kind,'id':int(oid)},dwarf=True,restricted=restricted,indoor=indoor,sourceKind='osm',updated=src['timestamp'][:10]))
items.sort(key=lambda p:p['id'])
out={'source':'https://mobile.wroclaw.pl/krasnale.geojson','copyright':src['copyright'],'license':'ODbL-1.0','timestamp':src['timestamp'],'retrieved':date.today().isoformat(),'note':{'pl':'Katalog punktów OSM, nie pełny rejestr wszystkich krasnali. Opisy powstały z tagów OSM; nie są historiami figurek.','en':'OSM point catalogue, not a complete dwarf register. Descriptions use OSM tags; they are not histories of the figures.'},'places':items}
assert items and len({p['id'] for p in items}) == len(items), 'Empty or duplicate import'
(R/'data/wroclaw-krasnale.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
