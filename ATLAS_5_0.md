# I Was Here — Places & Memories · Atlas 5.0
Data: 7 listopada 2026 r.

## Wybrany kierunek wizualny
Koncepcja **nr 1: jasny, ilustracyjny atlas turystyczny** — kremowe tło, stonowana zieleń pól i lasów, niebieskie rzeki, ilustracyjne pasmo gór na południu oraz miniatury zabytków przy miastach. Jest to **interaktywna mapa SVG**, nie statyczna ilustracja wygenerowana przez AI.

## Aktualizacja marki
- Główna nazwa produktu i logo: **I Was Here**.
- Podtytuł i nazwa pełna: **Places & Memories**.
- Zmieniono identyfikację w atlasie, przewodniku Warszawy, `manifest.webmanifest` i `icon.svg`.
- Nowe zasoby: `assets/logo-en.svg` i `assets/brand-pin.svg`, jasna identyfikacja w `assets/brand-v5.css`.
- Przy pierwszym wejściu do v5 język angielski i mapa jasna są ustawiane domyślnie (`assets/brand-v5.js`). Zmiana PL/EN i motywu pozostaje zapamiętywana.

## Geografia i interakcje
- Kontur Polski z **571 punktami granicznymi**, przygotowany na podstawie obrysów 16 województw Natural Earth (WGS84).
- Prawdziwe granice wszystkich **16 województw**, rzeki Wisła i Odra oparte na danych geograficznych Natural Earth.
- **13 miast** pozostaje w dotychczasowym zestawie, na stałych współrzędnych WGS84:
  Warszawa, Kraków, Gdańsk, Wrocław, Poznań, Łódź, Szczecin, Toruń, Lublin, Białystok, Katowice, Rzeszów i Olsztyn.
- Dla miast przygotowano lekkie **ilustracje wektorowe** zabudowy charakterystycznej dla danego regionu; są rysunkami symbolicznymi, nie dokumentacją konkretnych budynków.
- Dekoracyjne zagajniki, pola i górskie szczyty są **ilustracyjne**, nie dokładną mapą pokrycia terenu czy wysokości.
- Kliknięcie miast, pasek wyboru, powiększanie, przesuwanie, wyszukiwanie i PL/EN zachowano.
- **Warszawa** nadal otwiera przewodnik 184 atrakcji i 36 lokali. Pozostałe 12 miast jest oznaczonych „Coming soon” — bez udawania gotowych przewodników.
- W Warszawie stale dostępny jest pływający przycisk powrotu do Atlasu Polski.

## Źródła geografii
Geometria 16 województw pochodzi z projektu Natural Earth udostępnionego w repozytorium [DataMaps — pl.json](https://github.com/markmarkoh/datamaps/blob/master/src/js/data/pol.json), a rzeki z [Natural Earth Vector](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_rivers_lake_centerlines.geojson). Kontur kraju utworzono z sumy granic województw (wspólne krawędzie usunięto); szczegóły uproszczono do potrzeb mobilnego SVG. Dane są publiczne i nie wymagają dostępu do zewnętrznych map kafelkowych.

## Technologia
`assets/poland-geography.js` — dane WGS84
`assets/atlas-illustrated.js` — rysowanie krajobrazu i budynków
`assets/atlas-light-v5.css` — nowy jasny styl mapy
`assets/atlas.js` — interaktywność, projekcja geograficzna, tłumaczenia
`assets/brand-v5.js`, `assets/brand-v5.css` — marka, pierwsze uruchomienie
`assets/brand-pin.svg`, `assets/logo-en.svg`, `icon.svg` — identyfikacja
`service-worker.js` — pamięć podręczna dla nowego atlasu

## Granice obecnego wdrożenia
- Geografia i rozmieszczenie miast są oparte na danych mapowych. Miniatury zabytków oraz ukształtowanie krajobrazu to stylizacje.
- Mapa jest **interaktywnym atlasem poglądowym**, nie nawigacją drogową i nie dokładnym modelem wysokości.
- Polska i angielska wersja językowa nadal są dostępne. Pełne redakcyjne przekłady historii wszystkich 184 atrakcji to osobny etap.
- Nowe ikony `icon-180.png` i `icon-512.png` zostały już wygenerowane z `icon.svg` przez GitHub Actions (commit `7766a2c2`). Starsze instalacje iPhone’a mogą przechowywać poprzednią ikonę w pamięci podręcznej; w takim przypadku należy dodać aplikację do ekranu początkowego ponownie.
- Kod i geometrię sprawdzono testami automatycznymi. Pełne testy Safari na fizycznym iPhonie oraz potwierdzenie publikacji GitHub Pages wymagają jeszcze wykonania.

## Otwórz aplikację
https://auriol-kno.github.io/Zwiedzanie-trip/atlas.html

## Poprawka 5.1 — jeden przełącznik języka w Warszawie
- Usunięto drugi przycisk języka (`#tbLanguage`, klucz `tb_lang`) dodawany przez `assets/poland-explorer.js`. Język w Warszawie zmienia wyłącznie `#langWarsaw`, wspólny z Atlasem (`tubylem_lang`).
- Usunięto zdublowany blok „Tu Byłem” z drugą mapą Polski (Leaflet) na górze przewodnika. Tę rolę pełni `atlas.html` i pływający przycisk powrotu. Zachowano „Moje wycieczki”, eksport do kalendarza i inteligentną kolejność zwiedzania; teraz używają wspólnego języka.
- Naprawiono start tłumaczenia: `#atlasFloat` znajduje się przed `i18n4.js`, a `refresh()` nie przerywa się przy braku elementu. Wejście z Atlasu EN otwiera Warszawę po angielsku.
- `poland-explorer.js` dodano do cache offline (nowa wersja cache) i do sprawdzania składni w CI.

## Poprawka 5.1b — łatwiejsza obsługa (szybkie poprawki 1–5)
1. **Przełącznik „PL | EN”** w Atlasie i w Warszawie pokazuje oba języki i wyróżnia aktywny. Dotknięcie wybranego języka go ustawia, dotknięcie aktywnego niczego nie zmienia. Etykiety dla czytników ekranu mówią, jaki jest bieżący język i co zrobi przycisk.
2. **Podpisane ikony** w nagłówku Warszawy: „Wygląd / Theme” i „Paszport / Passport”.
3. **Jeden sposób powrotu do Atlasu w nagłówku:** logo I Was Here prowadzi do `atlas.html` (zniknęła osobna ikona 🗺). Pływający przycisk Atlasu jest nadal zawsze widoczny; na telefonie ma postać kompaktowej ikony mapy z etykietą dostępności.
4. **Usunięto zdublowane pole** „Inteligentna kolejność zwiedzania”. Kolejność ustawia jedno pole „Priorytet” w planerze.
5. **Spójna marka i wersja:** nazwa „I Was Here” pod ikoną na iPhonie (`apple-mobile-web-app-title`), w etykietach i w plikach kalendarza (.ics); w przewodniku nie ma już „4.0” i „Wersja demonstracyjna 3.0”.

## Poprawka 5.2 — mapa Polski przy logo, zawsze u góry
- Pływający przycisk Atlasu z prawego dolnego rogu przeniesiono do **lewego górnego rogu**: logo I Was Here i miniatura mapy Polski tworzą jeden link `#atlasFloat` do `atlas.html?lang=…`.
- Nagłówek Warszawy jest **przyklejony do góry** (`position:sticky`, z `env(safe-area-inset-top)`), więc powrót do Atlasu, przełącznik PL | EN, „Wygląd” i „Paszport” są widoczne cały czas: przy przewijaniu, nad otwartymi arkuszami i na ekranie powitalnym.
- Sekcje przewijane z dolnej nawigacji zatrzymują się pod nagłówkiem (`scroll-padding-top`).
- Na bardzo wąskich ekranach (≤370 px) napis „I WAS HERE” jest ukryty wizualnie (zostaje dla czytników ekranu); widoczne są znak marki i mapa.
