# ROADMAP — I Was Here / Places & Memories

Plan dalszego rozwoju po wersji **8.7.0** (stan 2026-11-08). Priorytety może zmieniać wyłącznie właściciel.
Każdy punkt realizujemy jako osobny, mały PR z opisem po polsku. Scalenie do `main` następuje dopiero na polecenie właściciela („Scal”).
Wiążące ustalenia wyglądu i nawigacji są w `DECYZJE_PROJEKTOWE.md`.

Zasady nadrzędne, ważne na każdym etapie:
- prawdziwa geografia wygrywa z dekoracją;
- PL i EN zmieniamy zawsze razem;
- nie wymyślamy ocen, historii ani współrzędnych;
- przybliżone dane oznaczamy uczciwie;
- pływająca mapka Polski musi zostać zawsze dostępna;
- na jednym ekranie nie dublujemy przycisków;
- nie używamy kluczy API w publicznym kodzie;
- dane użytkownika nigdy nie wychodzą z urządzenia bez jego zgody.

---

## Zrobione (skrót)
- 7.0: premium Atlas z reliefem.
- 8.0–8.2: 16 przewodników regionów i Kielce; OSM 166/207.
- 8.3: Wikipedia, dziennik ze zdjęciami, wycieczka piesza, filtry przed mapą.
- 8.4: jedno dolne menu, kafelek-logo i ikona PWA.
- 8.5:
  - znaczki pocztowe miast;
  - Pieczątki z „Byłem tu”;
  - plany z mapy i podróż → plan dnia;
  - logo z pinezką i pływająca mapka Polski;
  - porządki.
- 8.6: Odkrywaj ze szlakami tematycznymi, historie ≥10 zdań, propozycja bazy danych `BAZA_DANYCH.md`.
- 8.6.1–8.6.3: historie wszystkich 213 miejsc i 184 atrakcji Warszawy, plany zwiedzania 16 województw (15 motywów, 46 szlaków), indeks `data/index/places.json` (baza etap 1, krok 1), podpis „Made by Tomasz Kmiecik”.
- 8.6.4: płynna mapa Atlasu (podgląd gestów na GPU).
- 8.6.5: pinezki miast trzymają się mapy przy przybliżaniu.
- 8.7.0 (etap A): Moje dane — Excel z planami, pieczątkami, odznakami, dziennikiem i mapą, e-mail, pełna kopia `.json`, import scalający; Leaflet lokalnie i komunikat offline; lekki plik regionów dla Atlasu i pliki województw; widok Polski pod przyciskami mapy; szybsze przerysowanie; porządki (`trips-ics.js`, dokumenty archiwalne).

Szczegóły są w `CHANGELOG.md`.

## Etap A — dane użytkownika i offline (zrobione w 8.7.0)
1. ~~Kopia zapasowa~~ — zrobione: Excel (plany, pieczątki, odznaki, dziennik, mapa) i pełna kopia `.json` ze zdjęciami; import scala i niczego nie kasuje; wysyłka e-mailem przez arkusz Udostępnij.
2. ~~Offline mapy regionu~~ — zrobione: Leaflet w `assets/vendor/leaflet/`, komunikat PL/EN bez kafelków.
3. ~~Wydajność dalej~~ — zrobione w części: jeden przelicz układu na przerysowanie (75 → 39 ms przy CPU ×4). Do rozważenia: zastąpienie filtra `blurShadow` gotowym obrazem — po teście na fizycznym iPhonie.
4. ~~Mapka a etykiety na małych ekranach~~ — zrobione: widok całej Polski zaczyna się pod przyciskami mapy.
5. ~~Porządki~~ — zrobione: `trips-ics.js`, `data/SCHEMA.md` i `PLAN_ROZWOJU.md` archiwalne.
6. **Ręczny test na iPhonie** (właściciel): Excel w Excelu/Numbers, e-mail z załącznikiem, import, PWA i ikona, Pieczątki, dziennik ze zdjęciami, offline, safe-area.
7. **Następne w tym obszarze:** przypomnienie o kopii (np. raz w miesiącu) i import z Excela z wyborem, które arkusze wczytać.

## Etap B — Pieczątki i plany 2.0 (8.7)
1. Pieczątki regionów i Warszawy jako **znaczki** w siatce, a nie tylko lista. Znaczek województwa za komplet miejsc w regionie, jak odznaki.
2. Data zdobycia pieczątki („Byłem tu: 12.08.2027”) oraz podpis i data przy zdjęciach w dzienniku.
3. Atrakcje Warszawy w planach dnia Atlasu: typ `{t:'waw',id,name,lat,lon}` działa od 8.7 (przez Excel); brakuje przycisku „Do planu” w przewodniku Warszawy.
4. Wspólne dane regionów i Warszawy w Pieczątkach na każdej stronie (lekki indeks nazw zamiast pełnego `regiony.js`).

## Etap C — jakość treści (8.8–8.9)
0. **Historie ≥10 zdań:** województwa zrobione w 8.6.2 (213/213); Warszawa zrobiona w 8.6.3 (184/184); kolejny krok: weryfikacja źródeł i uzupełnienie lokalnych szczegółów dla mniej znanych parków; potem baza danych etap 1 (indeks + pliki województw, zdjęcia z Wikimedia Commons, gastronomia) według `BAZA_DANYCH.md` §4.
1. **Wikipedia:** ręczne QID Wikidata dla miejsc bez tagu w OSM (dziś 97 regionów i 115 atrakcji Warszawy ma tylko wyszukiwanie).
2. **Opisy EN Warszawy:** ok. 158 do przetłumaczenia redakcyjnie, partiami po dzielnicach, bez zmyślania historii.
3. **Współrzędne Warszawy** w OSM (rozszerzyć `verify_coordinates.py`); pozostałe 41 miejsc regionalnych.
4. **Mazowieckie poza Warszawą:** Płock, Pułtusk, Czersk, Kampinos, Żelazowa Wola, Liw; przy każdym wpisie źródło.
5. Motywy-znaczki dla **Lubuskiego i Opolskiego** (np. Zielona Góra lub Świebodzin, Opole), jeśli właściciel doda te miasta do Atlasu.

## Etap D — kolejne pełne przewodniki miejskie (9.x)
1. Drugie miasto z pełnym przewodnikiem: Kraków albo Gdańsk. Wybór należy do właściciela.
2. Wspólny silnik przewodnika miasta: `city.html?city=…` z danymi w `data/miasta/<id>.json` zamiast kopiowania `index.html`.
3. Słownik kluczy i18n zamiast słownika zdań w `i18n4.js`.
4. W Atlasie wyraźny status: „Pełny przewodnik” / „Atrakcje w przewodniku regionu”.

## Etap E — konto i synchronizacja (10.x, wymaga decyzji właściciela)
- Synchronizacja między urządzeniami wymaga backendu i polityki prywatności. Nie dodajemy jej bez zgody właściciela.

## Poza zakresem bez wyraźnej zgody właściciela
- Migracja do React, Vite, MapLibre lub backendu (dawny `PLAN_ROZWOJU.md`).
- Live oceny Google, klucz Places API i routing WTP w czasie rzeczywistym.
- Automatycznie generowane opisy historyczne bez weryfikacji.

## Wrocław — priorytet właściciela 2026-11-09
- 8.8.0 (PR do przeglądu): 769 krasnali OSM, opisy PL/EN, warstwa mapy, pieczątki i odznaki za kolekcję, eksport/import.
- Następny osobny etap: więcej pozostałych atrakcji i wspólny silnik pełnego przewodnika miejskiego z funkcjami Warszawy. Nie oznaczamy obecnego modułu jako pełnego przewodnika.

## Poprawka nagłówka 2026-11-09
- 8.7.1 (PR #24, scalone): mapka skrajnie po lewej oraz oba elementy (mapka i logo) jako powrót do głównego Atlasu.
