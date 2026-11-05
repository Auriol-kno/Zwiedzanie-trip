# Baza atrakcji Warszawy — wersja 2.0
Źródło danych: `data/atrakcje.json` (118 rekordów, 18 dzielnic).
Każda atrakcja ma pola `id`, `name`, `district`, `lat`, `lon`, `cats`, `time`, `range`, `price`, `priceText`, `hours`, `desc`, `story`, `url`, `score` oraz wybrane pola dodatkowe.

`lat/lon` części nowych rekordów to punkty orientacyjne, a `time` to oszacowanie czasu pobytu. Godziny i ceny weryfikuj u organizatora.

Zmiany danych: edytuj plik JSON, następnie uruchom `python tools/sync_database.py`, żeby odtworzyć `data/atrakcje.js`. Nie edytuj ręcznie obu kopii naraz.
