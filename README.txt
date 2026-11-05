ODKRYJ WARSZAWĘ — PROTOTYP APLIKACJI NA IPHONE (listopad 2026)

CO POTRAFI
- Mapa OpenStreetMap (Leaflet) z obszarem kołowym lub wielokątem rysowanym dotknięciami.
- Wybór punktu startu, czasu, dnia, godziny, rodzaju atrakcji i środka transportu.
- Automatyczny dobór punktów programu do dostępnego czasu, z szacunkowymi przejazdami.
- Karty 26 atrakcji z informacjami historycznymi, czasem wizyty, ceną/godzinami, linkami źródłowymi.
- Szczegóły dojazdu i linie tramwajowe/autobusowe/metra sprawdzane w Google Maps na konkretnym odcinku.
- Zakładki: ulubione, wirtualne pieczątki, udostępnianie planu, trzy style interfejsu.
- Zapamiętywanie wyborów na urządzeniu przez localStorage.

TEST NA IPHONIE (REKOMENDOWANE)
1. Prześlij całą zawartość tego folderu do repozytorium GitHub (np. odkryj-warszawe).
2. W repozytorium otwórz Settings -> Pages -> Deploy from a branch -> main -> / (root).
3. Wejdź na otrzymany adres https://<użytkownik>.github.io/odkryj-warszawe/ w Safari iPhone'a.
4. Naciśnij Udostępnij -> Do ekranu początkowego. Ikona otworzy aplikację jak PWA.
Alternatywa: uruchom folder na dowolnym serwerze WWW obsługującym HTTPS.
Lokalnie na komputerze: python3 -m http.server 8000 (w folderze); otwórz http://localhost:8000.

ZASTRZEŻENIA WERSJI TESTOWEJ
- Mapa wymaga Internetu. Service worker przechowuje pliki aplikacji, NIE kafelki mapy.
- Linia przerywana na mapie pokazuje kolejność wizyt, a NIE dokładny przebieg tras ulicami.
- Czas przejazdu szacowany z geometrii i średnich prędkości, NIE na podstawie drogowego API.
- Integracja z bieżącymi liniami WTP jest przez otwarcie Google Maps; w aplikacji NIE ma GTFS-RT,
  prawdziwego rozkładu, nazwy linii dla każdego odcinka ani obliczania cen dokładnie co do grosza.
- Czas wizyty jest redakcyjnym przedziałem orientacyjnym, a NIE średnią z danych podróżnych.
- Niektóre obiekty wymagają sprawdzenia ceny i godzin na swojej stronie; aktualizacje nie są automatyczne.
- PWA instalowane na iPhone wymaga HTTPS i przeglądarki Safari.

DANE REFERENCYJNE: strona WTP Warszawa i Warszawa 19115; oficjalne witryny poszczególnych muzeów, linki w aplikacji.
© OSM contributors — dane mapowe OpenStreetMap.
