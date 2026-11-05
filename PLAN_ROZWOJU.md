# ODKRYJ WARSZAWĘ — koncepcja produktu

## Wizja
Mobilny przewodnik PWA/iOS: użytkownik podaje czas, początek wycieczki i wyznacza obszar dotknięciami na mapie; aplikacja wyszukuje atrakcje odpowiadające zainteresowaniom, układa realistyczny harmonogram i prowadzi od miejsca do miejsca.

## Co działa w załączonym prototypie
- Pierwszy ekran pyta o czas dostępny na zwiedzanie i punkt startowy.
- Mapa OSM obsługuje koło o regulowanym promieniu i obszar rysowany jako wielokąt. Punkt startowy można ustawić na mapie.
- Planer bierze pod uwagę przewidywany czas pobytu, szacunkowe przejazdy, porę dnia i znane godziny niektórych obiektów.
- Filtry: historia, muzea, parki, punkty widokowe, nauka, atrakcje rodzinne, architektura, miejsca mniej znane.
- Transport: pieszo, rower, samochód, komunikacja miejska, z otwieraniem nawigacji dla odcinków.
- Karty 26 atrakcji: opis, krótka historia, orientacyjny czas wizyty, dostępne informacje o cenie/godzinach, źródło i dojazd.
- Zapis ulubionych, pieczątki, udostępnianie trasy, trzy motywy wizualne.

## Projekt wizualny
**1. Editorial / główny (obecna wersja domyślna)**: kremowe tło, głęboka morska zieleń, ceglasty pomarańcz, duża typografia, spokojny miejski przewodnik premium.
**2. Midnight**: granatowe tło, jasne detale i koralowy akcent, wysoki kontrast na wieczorne zwiedzanie.
**3. Explorer**: jasne tło i butelkowa zieleń, priorytet dla natury, rodzin i tras rowerowych.

## Kluczowe ograniczenia prototypu
- Brak weryfikowanego na żywo rozkładu i siatki połączeń WTP w aplikacji. Dla konkretnego odcinka otwierana jest nawigacja Google Maps w trybie odpowiedniego środka transportu. Koszty biletów pokazują oficjalne stawki, ale nie są pełnym, automatycznym cennikiem przejazdów.
- Trasa na mapie łączy POI linią schematyczną. Dystans i czas są modelowymi szacunkami; dokładne drogi wymagają routingu.
- Podawane czasy pobytu są redakcyjnym szacunkiem lub opierają się na materiałach organizatorów. Nie są to automatycznie agregowane statystyki podróżnych.
- Dane o cenie i godzinach mają różną dostępność; część oznaczona jest jako wymagająca sprawdzenia w oficjalnym źródle. Zmian i wyjątków nie pobiera się automatycznie.
- Wersja testowa zawiera ręcznie dobrane 26 miejsc, a nie kompleksowy rejestr wszystkich obiektów.

## Proponowana architektura wersji 2.0
**Frontend**: responsywna PWA w React/TypeScript lub Svelte, MapLibre GL JS dla mapy i interaktywnego rysowania strefy, IndexedDB na zapis tras, testy Playwright, dostępność WCAG 2.2 AA.
**Backend**: API w Node.js/TypeScript lub Python/FastAPI, PostgreSQL z PostGIS na geometrię i obiekty, zadania synchronizacji cen i harmonogramów.
**Dane geograficzne**: OpenStreetMap i źródła miejskie zgodnie z ich licencjami, zewnętrzny routing pieszy/rowerowy/samochodowy (np. Valhalla / GraphHopper); częste sprawdzanie aktualności danych.
**Transport publiczny**: licencjonowana usługa planowania WTP / GTFS plus aktualizacje zmian, integracja z open-source OpenTripPlanner lub dostawcą zewnętrznym. Dla każdego odcinka: linia, przystanek wejścia/wyjścia, kierunek, przesiadki, godziny, opóźnienia i bilet wymagany w danym przejeździe.
**Atrakcje**: każda cena i godzina powinna mieć datę ostatniej kontroli, URL źródłowy, status wyjątku, wskazanie czy potrzebna jest rezerwacja.
**Statystyki czasu zwiedzania**: oddzielny moduł pomiaru rzeczywistych czasów pobytu z wyraźną zgodą użytkownika albo zakupem/licencją na wiarygodny zbiór zagregowanych danych; przy braku danych konsekwentnie oznaczaj szacunki.
**Prywatność**: wybór punktu startu bez konta; geolokalizacja tylko za zgodą; możliwość usunięcia historii i eksportowania zapisanych wycieczek; polityka retencji danych.

## Następne iteracje
1. **Routing**: rzeczywiste trasy piesze i rowerowe, czas przejścia zgodny z siecią ulic, dostępność dla wózków i podjazdów.
2. **WTP**: nazwa linii, kierunek, przesiadki, realny czas i właściwa taryfa dla każdego etapu.
3. **Treści**: profesjonalne fotografie z legalnych źródeł, audioprzewodnik, wielojęzyczność i szczegółowa historia.
4. **Personalizacja**: dzieci/wiek, tempo spaceru, przerwy na posiłki, trasy tematyczne, koszt całości, wydarzenia czasowe.
5. **Społeczność**: oceny, rzeczywiste statystyki czasu pobytu (za zgodą), mapy odkrywców i współdzielone plany.
6. **Użytkowanie terenowe**: offline cache map zgodny z warunkami dostawcy, śledzenie postępu i geoweryfikacja pieczątek za zgodą.

## Kryteria akceptacji wersji produkcyjnej
- Zmiana daty i godziny poprawnie eliminuje obiekty zamknięte i uwzględnia wyjątki kalendarzowe.
- Rysowanie obszaru jednym palcem, poprawny wybór POI po stronie serwera nawet dla wklęsłych wielokątów.
- Transit: wszystkie proponowane linie da się potwierdzić w systemie WTP, również w przypadku objazdów i komunikacji zastępczej.
- Ceny i dostępność nie są wyświetlane jako aktualne, jeżeli nie ma aktualnego potwierdzenia.
- iPhone Safari: testy na 375 px, 390 px, 430 px oraz obsługa VoiceOver i obszarów bezpiecznych.

## Wybrane oficjalne źródła
- Taryfy i rozkłady: https://www.wtp.waw.pl/ oraz https://warszawa19115.pl/web/guest/-/bilety-kr%C3%B3tkookresowe-w-komunikacji-miejskiej
- Zamek Królewski: https://www.zamek-krolewski.pl/godziny-otwarcia-i-ceny-biletow
- Muzeum Powstania Warszawskiego: https://www.1944.pl/odwiedz-nas.html
- POLIN: https://polin.pl/pl/zwiedzanie-wystaw
- Centrum Nauki Kopernik: https://www.kopernik.org.pl/wizyta/godziny-otwarcia
- Łazienki: https://www.lazienki-krolewskie.pl/pl/zwiedzanie/godziny-otwarcia
- Wilanów: https://w.wilanow-palac.pl/godziny-otwarcia
