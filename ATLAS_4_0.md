# Tu Byłem — Atlas Polski 4.0
Data wdrożenia kodu: 6 listopada 2026 r.

## Cel poprawki
Przywrócenie działającego przycisku „Atlas”, uruchomienie rzeczywistej mapy Polski i umożliwienie powrotu do niej z dowolnego miejsca przewodnika Warszawy. Usunięcie znacznych braków w wersji angielskiej.

## Co wprowadzono
- **atlas.html**: pełnoekranowa mapa wektorowa Polski z rzeczywistym konturem kraju (Natural Earth, domena publiczna) oraz 13 miastami. Działa bez MapLibre i bez dodatkowych kluczy API.
- Trzy działające motywy na tej samej mapie: **Atlas, Noc, Teren**.
- Przesuwanie i powiększanie mapy (mysz, dotyk, przyciski), wybór miasta z pinu lub poziomej listy, wyszukiwanie.
- Warszawa jest aktywnym przewodnikiem. Pozostałe 12 miast jest oznaczonych jako planowane (brak pustych lub błędnych przekierowań).
- **assets/poland-mark.svg**: artystyczna miniatura konturu kraju z zaznaczoną stolicą.
- **index.html + assets/nav4.css**: lekki pływający przycisk Atlas Polski, widoczny na wszystkich ekranach przewodnika Warszawy, ponad dolnym paskiem iPhone’a.
- Stały przycisk Atlas w nagłówku Warszawy.
- **assets/i18n4.js**: wspólny PL/EN; tłumaczenie menu, formularzy, przycisków, kart, planowania tras, gastronomii i krótszych angielskich opisów atrakcji.
- Wspólny klucz lokalny języka \`tubylem_lang\` używany również w atlas.js. Zmiana języka na jednym ekranie jest zachowana po przejściu na drugi.
- Zmieniono język syntezatora mowy opisów z \`pl-PL\` na \`en-US\` w trybie EN.
- **manifest.webmanifest**: nowy start PWA \`./atlas.html\`, przy zachowaniu głównego \`index.html\` Warszawy dla starszych linków.
- **service-worker.js**: nowsza wersja lokalnego cache obejmuje Atlas, ikonkę i pliki lokalizacyjne. Dostępność zewnętrznych kafelków OpenStreetMap nie jest gwarantowana offline.

## Uruchomienie iPhone
1. Otwórz w Safari: \`https://auriol-kno.github.io/Zwiedzanie-trip/atlas.html\`
2. Kliknij miasto **Warszawa** albo „Odkryj Warszawę”, aby otworzyć przewodnik.
3. Kliknij pływający przycisk **Atlas Polski** z miniaturową mapką, aby wrócić do całej Polski.
4. Włącz **EN** w Atlasie lub Warszawie; po powrocie język pozostaje taki sam.
5. W Atlasie wybieraj **Atlas / Noc / Teren**.
6. Jeśli ikona na ekranie początkowym iPhone’a nadal uruchamia stare wejście do Warszawy, usuń **wyłącznie ikonę skrótu** (nie dane Safari) i ponownie dodaj Atlas z Safari przez Udostępnij → Dodaj do ekranu początkowego. Zmiana \`start_url\` w manifeście nie zawsze aktualizuje istniejące skróty iOS.

## Ograniczenia i dalsza praca
- Mapa Atlas jest ilustracyjną mapą wektorową kraju, a nie uliczną mapą routingu. Styl „Teren” uwydatnia elementy ilustracji, nie pokazuje dokładnego numerycznego modelu wysokości.
- Angielskie opisy 26 głównych atrakcji otrzymały własne szczegółowe teksty. Pozostałe rekordy mają krótsze streszczenia po angielsku, zanim powstaną pełne redakcyjne przekłady historyczne. Nazwy własne i nazwy ulic mogą pozostać w oryginale.
- Nawigacja WTP i rzeczywiste trasy przejazdu pozostają linkami do zewnętrznych map.
- 12 kolejnych miast nie ma jeszcze przewodników, ale wszystkie widnieją na Atlasie.
- Trasy, współrzędne części atrakcji i aktualność gastronomii wymagają audytu danych.
- Kod sprawdzono testami składni i automatycznymi testami struktur. **Nie przeprowadzono jeszcze pełnej ręcznej kontroli w Safari na rzeczywistym iPhonie ani nie potwierdzono publicznego wdrożenia GitHub Pages.**

## Pliki
- \`atlas.html\`
- \`assets/atlas.css\`
- \`assets/atlas.js\`
- \`assets/poland-mark.svg\`
- \`assets/nav4.css\`
- \`assets/i18n4.js\`
- \`index.html\`
- \`manifest.webmanifest\`
- \`service-worker.js\`
- \`tools/test_atlas.py\`

## Strategia dalszej lokalizacji
Zachowuj źródłowe polskie pola w bazie. Dla każdego miejsca dodawaj odrębne, redakcyjnie weryfikowane pola \`name_en\`, \`desc_en\`, \`story_en\` w kolejnym etapie, zamiast modyfikować nazwy własne. Interfejs powinien korzystać z centralnych kluczy i18n, a nie z wielokrotnego zastępowania fragmentów tekstu. Migrację można przeprowadzić bez utraty ulubionych, ponieważ identyfikatory atrakcji pozostają niezmienne.
