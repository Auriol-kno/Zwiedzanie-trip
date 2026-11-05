ODKRYJ WARSZAWĘ 3.0 — APLIKACJA NA IPHONE / GITHUB PAGES
Aktualizacja: 6 listopada 2026
Repozytorium: https://github.com/Auriol-kno/Zwiedzanie-trip
Aplikacja (po aktywacji GitHub Pages): https://auriol-kno.github.io/Zwiedzanie-trip/

NOWOŚCI 3.0
- 184 atrakcje z 18 dzielnic, w tym więcej parków, pomników i terenów zielonych.
- Redakcyjna wartość odwiedzenia 1–5 (oddzielna od ocen Google).
- Zakładka Jedzenie: 36 rzeczywistych lokali, 11 rodzajów kuchni, 6 typów lokali, filtry dzielnic / budżetu / kuchni i zapisane lokale.
- Opinie Google: link do aktualnej wizytówki w Google Maps; gwiazdki nie są pobierane ani kopiowane do aplikacji.
- Planer z preferencjami wieku, trybem rodzinnym, trybem fotografa i tempem zwiedzania.
- Automatyczna rezerwa czasu na odpoczynek / posiłek i wybrany lokal przy planie (bez automatycznej modyfikacji nawigacji).
- Przybliżone godziny złotego światła fotograficznego i wskazówki kadrowania.
- GPS: ustawienie startu ze swojej lokalizacji po wyrażeniu zgody.
- Przewodnik głosowy: czytanie redakcyjnych opisów po polsku przez syntezę mowy przeglądarki.
- Zapis planu TXT na iPhone.
- Rozszerzony cache PWA: dane atrakcji i gastronomii, interfejs; zewnętrzne mapy wymagają internetu.

FUNKCJE WYMAGAJĄCE DALSZEJ INTEGRACJI
- WTP: precyzyjne numery linii, opóźnienia, odjazdy i połączenia na żywo (obecnie link do nawigacji i rozkładów).
- Trasy rzeczywiście przebiegające ulicami; na mapie obecnie poglądowe połączenie punktów.
- Prawdziwy przewodnik AI generujący opowieści (obecnie głosowe czytanie tekstów, bez modelu AI).
- Kafelki mapy i routing offline: obecnie offline działają aplikacja, katalog i zapisane dane.
- Oceny Google na żywo wymagają API Places, odpowiedniej licencji w EOG, rozliczeń i bezpiecznego backendu.

JAK AKTUALIZOWAĆ BAZĘ
1. Edytuj pliki data/atrakcje.json i/lub data/restauracje.json.
2. Uruchom python tools/sync_database.py.
3. Uruchom python tools/test_bundle.py.
4. Zatwierdź oba pliki JSON i odpowiednie pliki JS.
5. GitHub Actions uruchamia testy automatycznie.

DANE
Aplikacja używa autorskiego katalogu kuratorskiego.
Współrzędne części parków/pomników są przybliżone; czas pobytu, ceny i budżety gastronomiczne to szacunki.
Godziny, miejsca i rezerwacje sprawdź bezpośrednio w źródłach.

INSTALACJA PWA
Otwórz stronę GitHub Pages w Safari → Udostępnij → Do ekranu początkowego.
Jeżeli PWA pokazuje poprzednią wersję, zamknij aplikację, otwórz adres w Safari i odśwież.
