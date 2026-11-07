# I Was Here 6.0 — województwa w Atlasie i przewodnik regionu
Data: 7 listopada 2026 r.

## Co nowego
- **Atlas Polski pozostaje stroną startową** (`start_url` PWA). Pod paskiem 13 miast jest nowy pasek **16 województw**.
- Po wybraniu województwa (z paska albo dotknięciem na mapie):
  - mapa **przybliża się do regionu**,
  - **wyróżnia jego obrys** (granice Natural Earth) i przyciemnia resztę kraju,
  - pokazuje **pinezki miejscowości** z liczbą atrakcji.
- Karta w dolnym panelu pokazuje liczbę atrakcji i miejscowości oraz chipy miejscowości. Miasta z Atlasu leżące w regionie (np. **Warszawa ✦**) są widoczne jako osobne chipy.
- Wybór miejscowości (pinezka lub chip), np. **Sierpc** albo **Sandomierz**, i przycisk **„Zwiedzaj …”** otwiera przewodnik regionu przefiltrowany do tej miejscowości.
- Nowa strona **`region.html`** — przewodnik regionu na wzór przewodnika miejskiego:
  - mapa Leaflet z obrysem województwa,
  - filtry miejscowości i kategorii, wyszukiwarka,
  - karty miejsc ze szczegółami (dojazd, strona obiektu, odsłuch),
  - **zapisane miejsca ♡** i **pieczątki „Byłem tu”**,
  - **plan dnia**: start z miejscowości, godzina, czas, samochód lub komunikacja, eksport trasy do Google Maps,
  - PL/EN,
  - logo z mapą Polski, które wraca do Atlasu w tym samym województwie i języku.
- Bez sieci lista miejsc i plan dnia działają z pamięci offline. Mapa Leaflet wymaga internetu.

## Baza
`data/regiony.json` → generowane `data/regiony.js` (`python tools/sync_database.py`).
- **Świętokrzyskie — 31 miejsc w 19 miejscowościach** (status „Przewodnik regionu”). M.in.:
  - Kielce: Pałac Biskupów Krakowskich, Kadzielnia, Geopark Wietrznia, Karczówka;
  - Chęciny: zamek, Jaskinia Raj;
  - Tokarnia (skansen), Święty Krzyż, Łysica, Krzemionki (UNESCO), Krzyżtopór, Wąchock, JuraPark Bałtów;
  - Sandomierz (7 miejsc), Szydłów, Wiślica, Jędrzejów, Pińczów, Busko-Zdrój.
- **Mazowieckie — Warszawa (pełny przewodnik) + 8 miejsc** (status „Częściowo dostępny”): Sierpc (Muzeum Wsi Mazowieckiej), Żelazowa Wola, Płock, Czersk, Kampinos, Ciechanów, Pułtusk, Opinogóra.
- Pozostałe 14 województw ma status „W przygotowaniu”. Atlas tego nie ukrywa i nie udaje gotowych przewodników.

## Uczciwość danych
- To **redakcyjna selekcja**. Opisy PL i EN są krótkie i opierają się na powszechnie znanych faktach.
- **Wszystkie współrzędne mają status „orientacyjne”**. Test sprawdza, że każdy punkt leży w swoim województwie (z tolerancją 3 km na uproszczenie granic Natural Earth).
- Ocena 1–5 jest **redakcyjna, nie z Google**. Linki do stron obiektów są podane tylko tam, gdzie adres był pewny; w pozostałych przypadkach jest wyszukiwanie w Google Maps.
- Czasy w planie dnia są **szacunkiem z odległości** (≈1,3 × linia prosta, ok. 55 km/h samochodem, ok. 35 km/h komunikacją, krótkie odcinki pieszo). To nie są rozkłady ani nawigacja na żywo.

## Pliki
- `atlas.html`, `assets/atlas.js`, `assets/atlas-light-v5.css` — pasek województw, obrys, pinezki miejscowości, karta regionu, deep link `atlas.html?region=…`.
- `region.html`, `assets/region.js`, `assets/region.css` — przewodnik regionu.
- `data/regiony.json`, `data/regiony.js`, `tools/sync_database.py` — dane i walidacja.
- `tools/test_atlas.py`, `tools/test_browser.js`, `.github/workflows/validate.yml` — testy.
- `service-worker.js` — cache `i-was-here-v6-0-20261107` z nowymi plikami.

## Rozwój
- Kolejne województwa: dopisywać miejsca w `data/regiony.json` i zmieniać `status` na `guide` lub `partial` (test pilnuje zgodności).
- Weryfikacja współrzędnych i godzin otwarcia na miejscu. Status `zweryfikowane` nadawać tylko po sprawdzeniu.
- Nie testowano na fizycznym iPhonie.
