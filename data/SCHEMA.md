> **ARCHIWALNE (stan z wersji 2.0, oznaczone w 8.7).** Opis jest nieaktualny: dziś baza ma 184 atrakcje, a regiony, historie,
> indeks i pliki województw opisują `BAZA_DANYCH.md`, `CLAUDE.md` (tabela *Data*) i walidacja w `tools/sync_database.py`.
> Nie traktuj tego pliku jako źródła prawdy.

# Baza atrakcji Warszawy — wersja 2.0
Źródło danych: `data/atrakcje.json` (118 rekordów, 18 dzielnic).
Każda atrakcja ma pola `id`, `name`, `district`, `lat`, `lon`, `cats`, `time`, `range`, `price`, `priceText`, `hours`, `desc`, `story`, `url`, `score` oraz wybrane pola dodatkowe.

`lat/lon` części nowych rekordów to punkty orientacyjne, a `time` to oszacowanie czasu pobytu. Godziny i ceny weryfikuj u organizatora.

Zmiany danych: edytuj plik JSON, następnie uruchom `python tools/sync_database.py`, żeby odtworzyć `data/atrakcje.js`. Nie edytuj ręcznie obu kopii naraz.
