TU BYŁEM — MIEJSCA I WSPOMNIENIA
Wersja 4.0 / Atlas Polski • 6 listopada 2026

ATLAS POLSKI
https://auriol-kno.github.io/Zwiedzanie-trip/atlas.html
GŁÓWNY PRZEWODNIK WARSZAWY
https://auriol-kno.github.io/Zwiedzanie-trip/
GITHUB
https://github.com/Auriol-kno/Zwiedzanie-trip

NOWOŚCI WERSJI 4.0
1. Prawdziwy ekran Atlasu Polski (13 miast) — dotykowa mapa ilustracyjna.
2. Trzy działające style mapy: Atlas, Noc, Teren.
3. Powiększanie, przesuwanie, wybór miast z mapy i listy, wyszukiwanie.
4. Warszawa jako aktywny przewodnik. Pozostałe miasta oznaczone jako w przygotowaniu.
5. Przycisk w nagłówku Warszawy i pływająca mini-mapa Polski do powrotu na Atlas.
6. Przełącznik PL/EN z pamięcią wyboru pomiędzy ekranami.
7. Angielskie opisy głównych miejsc, menu, karty i gastronomia; części mniej popularnych miejsc mają krótsze teksty EN.
8. Przewodnik głosowy odczytuje opis w języku wybranym przez użytkownika.
9. Ikona PWA na nowej instalacji otwiera od razu Atlas Polski.
10. Test regresji Atlasu i tłumaczeń w GitHub Actions.

POZOSTAŁE FUNKCJE WARSZAWY
- 184 miejsca w 18 dzielnicach, z redakcyjną oceną 1–5.
- 36 lokali gastronomicznych w osobnej sekcji.
- Mapa Warszawy z wyznaczaniem obszaru, planer czasu, GPS, tryb rodzinny, foto i ulubione.
- Pieczątki oraz kopiowanie/eksport planu.
- Linki do zewnętrznej nawigacji i aktualnych opinii Google Maps.

IPHONE — PIERWSZE URUCHOMIENIE
1. W Safari otwórz /Zwiedzanie-trip/atlas.html.
2. Użyj Udostępnij → Dodaj do ekranu początkowego.
3. W Atlasie dotknij Warszawy, aby przejść do przewodnika.
4. W przewodniku użyj pływającej mini-mapy do natychmiastowego powrotu.
5. Używaj górnego przycisku PL/EN, aby zmieniać język.
6. Jeśli starsza ikona nadal uruchamia stary adres, usuń tylko skrót z ekranu i dodaj go ponownie z Atlasu.

PLIKI
- atlas.html — ilustracyjny Atlas Polski (strona wejściowa PWA)
- index.html — Warszawa
- assets/atlas.js, assets/atlas.css — mapa, style, wyszukiwarka i miasta
- assets/nav4.css, assets/poland-mark.svg — przycisk powrotu do Atlasu
- assets/i18n4.js — tłumaczenia
- data/atrakcje.json, data/restauracje.json — dane
- service-worker.js — lokalny cache
- ATLAS_4_0.md — dokładna dokumentacja wdrożenia
- tools/test_atlas.py — test regresji

CO JESZCZE WYMAGA ROZWOJU
- W pełni redakcyjne i wierne tłumaczenia opisów wszystkich 184 miejsc.
- Szczegółowe trasy i godziny rzeczywistej komunikacji WTP.
- Interaktywna mapa MapLibre z warstwami ulic/terenu; obecnie Atlas jest piękną mapą wektorową kraju.
- Kolejne miejskie przewodniki (12 miast jest oznaczonych jako planowane).
- Test działania strony produkcyjnej na iPhonie.
