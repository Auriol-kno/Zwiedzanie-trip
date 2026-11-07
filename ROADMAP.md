# ROADMAP — I Was Here / Places & Memories

Plan dalszego rozwoju na 2026-11-07, po wersji 8.2. Priorytety może zmieniać wyłącznie właściciel.
Każdy punkt realizujemy jako osobny, mały PR z opisem po polsku. Scalenie do `main` następuje dopiero na polecenie właściciela („Scal”).

Zasady nadrzędne, ważne na każdym etapie:
- prawdziwa geografia wygrywa z dekoracją;
- PL i EN zmieniamy zawsze razem;
- nie wymyślamy ocen, historii ani współrzędnych;
- przybliżone dane oznaczamy uczciwie;
- nawigacja do Atlasu musi być zawsze dostępna;
- nie używamy kluczy API w publicznym kodzie.

---

## Etap A — stabilność i offline (najbliższe, wersja 8.3)
1. **Offline mapy regionu.** Wkleić Leaflet lokalnie do `assets/vendor/leaflet/` i dodać go do cache SW. Gdy kafelki OSM są niedostępne, pokazać komunikat PL/EN.
2. **Przycisk „Polska” na małych ekranach.** Nie może zasłaniać pinów ani etykiet na południowym wschodzie. Do zrobienia: kolizja z układem etykiet albo przesunięcie przycisku w trybie fokusu.
3. **Paski przy otwartej karcie.** Rozważyć kompaktowy pasek miast nad kartą na wyższych ekranach.
4. **Porządki nazw.** `assets/poland-explorer.js` zmienić na `trips-ics.js`. Zaktualizować odwołania, testy i cache.
5. **Odświeżenie dokumentów historycznych.** Zaktualizować `data/SCHEMA.md` (stan: 184/36/207) albo oznaczyć `PLAN_ROZWOJU.md` jako archiwalny.
6. **Ręczny test na iPhonie (właściciel).** Sekcja IPHONE w `README.txt` jako punkt wyjścia:
   - instalacja PWA;
   - offline;
   - safe area;
   - przełącznik języka;
   - powrót do Atlasu.

## Etap B — jakość treści (8.4–8.6)
1. **Opisy EN dla Warszawy.** Ok. 158 atrakcji ma placeholder. Tłumaczymy partiami po dzielnicach, ręcznie lub z weryfikacją. Przy faktach historycznych nie stosujemy tłumaczenia maszynowego bez kontroli.
2. **Weryfikacja współrzędnych Warszawy.** Rozszerzyć `verify_coordinates.py` na `data/atrakcje.json`. Dodać `coordinateStatus` i atrybucję ODbL.
3. **Pozostałe 41 miejsc regionalnych.** Dopasować je ręcznie do obiektów OSM (OVERRIDES z identyfikatorem OSM) albo zostawić z oznaczeniem „orientacyjne”.
4. **Mazowieckie.** Rozbudować bazę poza Warszawą, np. Płock, Pułtusk, Czersk, Kampinos, Żelazowa Wola, Liw. Przy każdym wpisie podać źródło.

## Etap C — kolejne pełne przewodniki miejskie (9.x)
1. Wybrać drugie miasto z pełnym przewodnikiem: Kraków albo Gdańsk (decyzja właściciela).
2. Wydzielić wspólny silnik przewodnika miasta z `index.html`, żeby nie kopiować 58 KB HTML. Do tego wprowadzić dane `data/miasta/<id>.json` i jeden szablon `city.html?city=…`.
3. Zastąpić DOM-walker `i18n4.js` słownikiem kluczy, tak jak w `atlas.js` i `region.js`.
4. W Atlasie oznaczyć różnicę statusów: „Pełny przewodnik” / „Atrakcje w przewodniku regionu”.

## Etap D — wspomnienia i konto (10.x, wymaga decyzji)
1. Rozbudować wspomnienia: notatki, data wizyty, opcjonalne zdjęcia lokalnie (IndexedDB).
2. Eksport i import danych użytkownika (JSON) jako kopia zapasowa bez backendu.
3. Synchronizacja między urządzeniami: jest możliwa tylko z backendem i polityką prywatności, więc wymaga osobnej decyzji właściciela. Nie dodajemy jej bez zgody.

## Poza zakresem bez wyraźnej zgody właściciela
- Migracja do React, Vite, MapLibre lub backendu (dawny plan `PLAN_ROZWOJU.md`).
- Live oceny Google, klucz Places API i routing WTP w czasie rzeczywistym.
- Automatycznie generowane opisy historyczne bez weryfikacji.
